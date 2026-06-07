# Learn Claude Code

## 1 Core Loop

### 1.1 最小 Agent Loop

!!! info "把 “LLM + Tools” 连接成一个能持续推进任务的 Main Loop"
    把工具输出回头喂给 LLM 用于下一步推理，而不是仅仅输出一段文本

#### 名词解释

- `turn`：Agent 的一轮行动，在我们的最小版本中

    ```text
    user message
        |
        v
       LLM
        |
        |   +--> 普通回答  ----> 结束
        |---|
            +--> tool_use ----> 执行工具 --> tool_result --> 写回 messages ----> 下一轮
    ```

- `tool_result_block`：工具执行结果被打包回工作流的形态

    ```py
    {
        "type": "tool_result",
        "tool_use_id": "...",   # 用于追踪具体是哪一次工具调用
        "content": "...",
    }
    ```

- `state`：主循环需要一直携带的 Context，在最小版本中包含：

    ```py
    state = {
        'messages': [
            {"role": "user", "content": "..."},
            {"role": "assistant", "content": [...]},
            ...
        ],
        'turn_count': 1,           # 当前轮次
        'transition_reason': None  # 这一轮结束后，为什么要继续下一轮
    }
    ```

    - `msgs` <u>不是聊天记录展示</u>，而是 LLM 下一轮需要读取的 Ctx
    - MVP 中的 `transition_reason` 只有 "tool_result" 一种取值，即：刚执行完工具，需要继续

#### 实现

```py
# 基于用户请求初始化 msgs
messages = [{"role": "user", "content": query}]

# MVP 实现
def agent_loop(state):
    while True:
        # 调用 LLM
        response = client.messages.create(
            model=MODEL,
            system=SYSTEM,
            messages=state["messages"],
            tools=TOOLS,
            max_tokens=8000,
        )
        # 将 response 写回 Context
        state["messages"].append({
            "role": "assistant",
            "content": response.content,
        })
        # 不调用工具 => 退出
        if response.stop_reason != "tool_use":
            state["transition_reason"] = None
            return
        # 调用工具
        results = []
        for block in response.content:
            if block.type == "tool_use":
                output = run_tool(block)
                results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": output,
                })
        # 将工具调用结果写回 Context
        state["messages"].append({"role": "user", "content": results})
        # 更新轮次信息
        state["turn_count"] += 1
        state["transition_reason"] = "tool_result"
```

### 1.2 Tool-using

!!! info "追加工具不需要修改 Main Loop，只需要在 handler map + schema 中进行注册"
    handler map 是一个由 `tool_name: handler_func` 构成的 `dict`

对 1.1 中的工具调用 block 进行优化，使其能从 handler map 中调用多种工具

```py
# handler map
TOOL_HANDLERS = {
    "bash":       lambda **kw: run_bash(kw["command"]),
    "read_file":  lambda **kw: run_read(kw["path"], kw.get("limit")),
    ...
}
# tool schema（这部分其实会通过 tools=TOOLS 的形式塞在 prompt 里）
TOOLS = [
    {
        "name": "bash", 
        "description": "Run a shell command.",
        "input_schema": {
            "type": "object", 
            "properties": {"command": {"type": "string"}}, 
            "required": ["command"]
        }
    },
    {   
        "name": "read_file", 
        "description": "Read file contents.",
        "input_schema": {
            "type": "object", 
            "properties": {
                "path": {"type": "string"}, 
                "limit": {"type": "integer"}
            }, 
        "required": ["path"]
        }
    },
    ...
]

# mod: tool-using block
for block in response.content:
    if block.type == "tool_use":
        handler = TOOL_HANDLERS.get(block.name)
        output = handler(**block.input) if handler else f"Unknown tool: {block.name}"
        results.append({
            "type": "tool_result",
            "tool_use_id": block.id,
            "content": output,
        })
```

!!! question "handler map 好像不能完全兜住工具使用"
    - 是的，在更完备的实现中，Tool-using 应该是一个 Layer，而不仅仅是 Handler Map + Schema Map
    - 你还需要往里塞进：鉴权、curMsg + AppState、MCP Client、文件读取缓存、通知 + query 追踪 ...


??? question "如何防止 `read_file` / `write_file` 等工具从指定工作区中逃逸"
    添加一个 `safe_path` 作为沙箱（其实只是 check 一下指定文件的 path 是否在工作区中）

    ```py
    def safe_path(p: str) -> Path:           # p 在理想状态下为 相对路径
        path = (WORKDIR / p).resolve()       # 拼接 WORKDER + p，并转换为绝对路径
        if not path.is_relative_to(WORKDIR): # 防止 p 通过 ../ 或者 绝对路径 跳出工作区
            raise ValueError(f"Path escapes workspace: {p}")
        return path

    def run_read(path: str, limit: int = None) -> str:
        text = safe_path(path).read_text()  # 在此处连接路径
        lines = text.splitlines()
        if limit and limit < len(lines):
            lines = lines[:limit]
        return "\n".join(lines)[:50000]
    ```

??? question "如何处理内部 `messages` 消息列表格式与 LLM API 协议不兼容"
    - LLM 的 API 协议给出的消息存在 3 点约束
        1. 每个 `tool_use` block 必须存在对应的 `tool_result` （通过 `tool_use_id` 关联）
        2. `user - assitant` 必须交替出现（两条同角色消息不得连续）
        3. 只接受协议定义的字段（ msg 中的一些内部字段会导致 400 错误）

    - Solution：加一个函数，在 **发送请求前** 做一次规范化

        ```py
        response = client.messages.create(
            messages=normalize_messages(messages),  # <= 在这里
            ...
        )
        ```

        messages 列表是系统的内部表示, API 看到的是规范化后的副本，<u>两者不是一个东西</u>

    ```py
    def normalize_messages(messages: list) -> list:
        normalized = []

        for msg in messages:
            # Step 1: 去除内部字段
            clean = {"role": msg["role"]}
            if isinstance(msg.get("content"), str):
                clean["content"] = msg["content"]
            elif isinstance(msg.get("content"), list):
                clean["content"] = [
                    {
                        k: v for k, v in block.items() \
                            if k not in ("_internal", "_source", "_timestamp")
                    } for block in msg["content"]
                ]
            normalized.append(clean)

        # Step 2: tool_result 配对补齐
        # 收集所有已有的 tool_result ID
        existing_results = set()
        for msg in normalized:
            if isinstance(msg.get("content"), list):
                for block in msg["content"]:
                    if block.get("type") == "tool_result":
                        existing_results.add(block.get("tool_use_id"))

        # 找出缺失配对的 tool_use (被取消), 插入占位 result
        for msg in normalized:
            if msg["role"] == "assistant" and isinstance(msg.get("content"), list):
                for block in msg["content"]:
                    if (block.get("type") == "tool_use"
                            and block.get("id") not in existing_results):
                        # 在下一条 user 消息中补齐
                        normalized.append({"role": "user", "content": [{
                            "type": "tool_result",
                            "tool_use_id": block["id"],
                            "content": "(cancelled)",
                        }]})

        # Step 3: 合并连续同角色消息
        merged = [normalized[0]] if normalized else []
        for msg in normalized[1:]:
            if msg["role"] == merged[-1]["role"]:
                # 合并内容
                prev = merged[-1]
                prev_content = prev["content"] if isinstance(prev["content"], list) \
                    else [{"type": "text", "text": prev["content"]}]
                curr_content = msg["content"] if isinstance(msg["content"], list) \
                    else [{"type": "text", "text": msg["content"]}]
                prev["content"] = prev_content + curr_content
            else:
                merged.append(msg)

        return merged
    ```

### 1.3 Session 待办更新

!!! question "LLM 一口气列出很多步骤后，跑一半自己搞忘了怎么办"
    外显<u>当前会话</u>计划并随任务推进不断更新（⚠️ 不是跨对话的持久化任务系统）

- Pipeline

    ```text
    用户提出大任务 --> 模型写一份计划 --> 做完一步，进行更新计划
    ```

    其中，`complted` * N + `in_progress` * 1 + `pending` * M

- 数据结构

    - `PlanItem`：每一步在干嘛

        ```py
        {
            "content": "Read the failing test",                # 这一步应该干什么（祈使句）
            "status": "pending" | "in_progress" | "completed",
            "activeForm": "Reading the failing test",          # 状态描述（用于回显、更有活人感）
        }
        ```
    
    - `PlanningState`：计划整体执行状态

        ```py
        {
            "items": [PlanItems],
            "rounds_since_update": 0, # 多少轮没更新计划了
        }
        ```

!!! question "TodoManager 如何与 Main Loop 交互"
    - 把 TodoManager 也作为一个 Tool 加入 Tools Map
    - 此后，Main Loop 将在 `messages` 列表的基础上额外对 `PlanningState` 进行维护

```py
class TodoManager:
    def __init__(self):
        self.state = PlanningState()

    def render(self) -> str:
        """把 Todo 以更可读的形式输出"""
        lines = []
        for item in self.state.items:
            marker = {
                "pending": "[ ]",
                "in_progress": "[>]",
                "completed": "[x]",
            }[item.status]
            line = f"{marker} {item.content}"
            if item.status == "in_progress" and item.active_form:
                line += f" ({item.active_form})"
            lines.append(line)
        completed = sum(1 for item in self.state.items if item.status == "completed")
        lines.append(f"\n({completed}/{len(self.state.items)} completed)")
        return "\n".join(lines)

    def update(self, items: list) -> str:
        """允许更新 Todo"""
        validated = []
        in_progress_count = 0

        for item in items:
            status = item.get("status", "pending")
            if status == "in_progress":
                in_progress_count += 1
            validated.append({
                "content": item["content"],
                "status": status,
                "activeForm": item.get("activeForm", ""),
            })
        
        if in_progress_count > 1: # 约束 check
            raise ValueError("Only one plan item can be in_progress")

        self.state.items = validated
        self.state.rounds_since_update = 0
        return self.render()

    # 连续 PLAN_REMINDER_INTERVAL 轮没有更新计划，进行提醒
    def note_round_without_update(self) -> None:
        self.state.rounds_since_update += 1
    def reminder(self) -> str | None:
        if not self.state.items:
            return None
        if self.state.rounds_since_update < PLAN_REMINDER_INTERVAL:
            return None
        return "<reminder>Refresh your current plan before continuing.</reminder>"
```

### 1.4 SubAgent

!!! note "看起来还是 <u>顺序执行</u>，只是把 dirty work 外包了"

!!! info "把探索性任务丢给 SubAgent，让父 Agent 在干净的 Context 中盯紧主目标"
    在组会上汇报你的实验结果就可以了，不要和我讲你的失败小故事




- 隔离
    - 上下文隔离：SubAgent 有自己的独立 `messages`（基础实现为 “白手起家”）

        > 拓展：fork => 继承 Parent 的已有 msgs（Ctx）、并追加子任务 Prompt

    - 工具隔离：只获取必要工具、<u>不允许继续派生 SubSubAgent</u>

- 保护措施：防止无限循环
    - 最大允许运行轮次
    - 工具调用出错时如何退出

- SubAgent 只把 最终摘要/结果 写回父智能体，中间不会改动 Parent Msgs

    ```py
    return {
        "type": "tool_result",
        "tool_use_id": block.id,
        "content": summary_text,
    }
    ```

- `task tool`：让 Parent 能够主动外包任务

    ```py
    TOOLS += {
        "name": "task",
        "description": "Run a subtask in a clean context and return a summary.",
        "input_schema": {
            "type": "object",
            "properties": {
                "prompt": {"type": "string"}
            },
            "required": ["prompt"]
        }
    }
    ```

    对应的 handler 如下，此处为 “白手起家” 模式

    ```py
    def run_subagent(prompt: str) -> str:
        # 白手起家
        sub_messages = [{"role": "user", "content": prompt}]
        # 最大轮次限制：只操作 SubAgent msgs
        for _ in range(30):
            response = client.messages.create(
                model=MODEL, system=SUBAGENT_SYSTEM, messages=sub_messages,
                tools=CHILD_TOOLS, max_tokens=8000, # 工具隔离
            )
            sub_messages.append({"role": "assistant", "content": response.content})
            if response.stop_reason != "tool_use":
                break
            results = []
            for block in response.content:
                if block.type == "tool_use":
                    handler = TOOL_HANDLERS.get(block.name)
                    output = handler(**block.input) if handler else f"Unknown tool: {block.name}"
                    results.append({"type": "tool_result", "tool_use_id": block.id, "content": str(output)[:50000]})
            sub_messages.append({"role": "user", "content": results})
        # 只返回摘要
        return "".join(b.text for b in response.content if hasattr(b, "text")) or "(no summary)"
    ```

### 1.5 Skills

!!! info "Skill 是一种支持按需加载的领域知识（system prompt），解决 '怎么做' 的问题"

!!! info "Skill - Memory - CLAUDE.md"
    - Skill: 可选的知识包，仅在完成特定任务时 <u>按需加载</u>
    - Memory：系统记住的 <u>跨对话</u> 信息（通常是一些 fact / preference），不是任务 SOP
    - CLAUDE.md：全局、稳定、长期的规则说明

#### 名词解释

- `skill`：用于解决特定任务的说明书（可复用），通常包含以下内容
    - 什么时候用
    - 解决任务的具体步骤
    - 有哪些注意事项

- actions

    - `discovery`：列出可用的 skills、以及这些 skill 能干什么（ name + description ）

    - `loading`：按需注入 —— 真正将完整的 skill 内容放进当前上下文

#### 实现

1. 如何存放 `skills`：一般来说会按照以下目录来塞 md 文档

    ```text
    skills/
        code-review/SKILL.md
        git-workflow/SKILL.md
    ```

2. 代码实现：

    ```py
    # 被塞进 sysPrompt 只有格式化为 “- name: desc” 的 manifest 列表
    SKILL_REGISTRY = SkillRegistry(SKILLS_DIR)
    SYSTEM = f"""You are a coding agent at {WORKDIR}.
    Use load_skill when a task needs specialized instructions before you act.
    Skills available:
    {SKILL_REGISTRY.describe_available()}
    """

    # 提供用于加载特定技能的 tool：对应的 result 为 skill 的完整正文
    TOOL_HANDLERS = {
        "load_skill": lambda **kw: SKILL_REGISTRY.load_full_text(kw["name"]),
    }

    # 从 `skills` 路径下整理所有可用技能
    class SkillRegistry:
        def __init__(self, skills_dir):
            self.skills = {}
            self._load_all()

        def _load_all(self):
            for path in skills_dir.rglob("SKILL.md"):
                meta, body = parse_frontmatter(path.read_text())
                name = meta.get("name", path.parent.name)
                self.skills[name] = {
                    "manifest": {
                        "name": name,
                        "description": meta.get("description", ""),
                    },
                    "body": body,
                }
        
        def load_full_text(self, name: str) -> str:
            skill = self.skills.get(name)
            if not skill:
                known = ", ".join(sorted(self.skills)) or "(none)"
                return f"Error: Unknown skill '{name}'. Available skills: {known}"
            return (
                f"<skill name=\"{skill['manifest']name}\">\n"
                f"{skill['body']}\n"
                "</skill>"
            )
    ```

### 1.6 Ctx 压缩

!!! info "Ctx 不是越多越好，只在活跃区域保留有价值的部分"

```
tool output
   |
   +-- 太大 -----------------------> 保存到磁盘 + 留预览
   |
   v
messages
   |
   +-- 太旧 -----------------------> 替换成简短的占位提示
   |
   +-- 整体还是太长 / 手动 compact --> 把历史信息压缩成摘要
   |
   v
neo_history
```

- 需要维护的压缩状态 Meta：

    ```py
    {
        "has_compacted": True / False,
        "last_summary": "",            # 最新一次的压缩 Summary
        "recent_files": [],            # 最近改过的文件
    }
    ```

- 长 `tool_result` Dump 工具：返回存储路径 + 开头的 preview

    ```py
    def persist_large_output(tool_use_id: str, output: str) -> str:
        if len(output) <= PERSIST_THRESHOLD:
            return output

        stored_path = save_to_disk(tool_use_id, output)
        preview = output[:2000]
        return (
            "<persisted-output>\n"
            f"Full output saved to: {stored_path}\n"
            f"Preview:\n{preview}\n"
            "</persisted-output>"
        )
    ```

- 把太旧的 `tool_result` 替换成占位符：此处仅保留最近 3 次工具调用结果

    ```py
    def micro_compact(messages: list) -> list:
        tool_results = collect_tool_results(messages)
        for result in tool_results[:-3]:
            result["content"] = "[Earlier tool result omitted for brevity]"
        return messages
    ```

- 整体历史压缩工具：需要保留 当前目标、已完成/未完成的事项、被改动的文件、需要保留的决定

    ```py
    # 具体的压缩函数
    def summarize_history(messages: list) -> str:
        conversation = json.dumps(messages, default=str)[:80000]
        prompt = (
            "Summarize this coding-agent conversation so work can continue.\n"
            "Preserve:\n"
            "1. The current goal\n"
            "2. Important findings and decisions\n"
            "3. Files read or changed\n"
            "4. Remaining work\n"
            "5. User constraints and preferences\n"
            "Be compact but concrete.\n\n"
            f"{conversation}"
        )
        response = client.messages.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=2000,
        )
        return response.content[0].text.strip()

    # 保留 focus 目标 + 最近改动的 files
    def compact_history(messages, state, focus):
        # 先保存以下压缩前的内容（万一之后还要找回）
        transcript_path = write_transcript(messages)
        print(f"[transcript saved: {transcript_path}]")

        summary = summarize_history(messages)
        if focus:
            summary += f"\n\nFocus to preserve next: {focus}"
        if state.recent_files:
            recent_lines = "\n".join(f"- {path}" for path in state.recent_files)
            summary += f"\n\nRecent files to reopen if needed:\n{recent_lines}"

        state.has_compacted = True
        state.last_summary = summary
        return [{
            "role": "user",
            "content": (
                "This conversation was compacted so the agent can continue working.\n\n"
                f"{summary}"
            ),
        }]
    ```

- 接入 Main Loop：插在 LLM Call 之前

    ```py
    def agent_loop(state):
        while True:
            state["messages"] = micro_compact(state["messages"])

            if estimate_context_size(state["messages"]) > CONTEXT_LIMIT:
                state["messages"] = compact_history(state["messages"])
                state["has_compacted"] = True

            response = call_model(...)
            ...
    ```