# LangChain Applications

## 1 RAG

大致分成下面几个步骤：

1. 知识库构建

    1. 撰写 Loader：将 文档/视频/图片 统一到 Text 模态
    2. 撰写 Splitter：切分 Text，形成 Chunk
    3. Embedding：把 Chunk 转化为 tensor 作为知识库

2. Query Embedding：把 query 丢去 embed 就行了

3. Retrieve

    - 比较 vector similarity，召回相关 chunk
    - 对召回精度要求较高的场景，需要使用 Reranker 进一步筛选

4. Augmentation：将召回 chunk 拼接到 Prompt 模版中

5. Generation

## 2 Agent

???info "Agent vs Chain"
    - Chain 的行动序列是固定的（由硬编码决定）
    - Agent 可以根据具体任务动态拆解流程、调用工具，并依照中间结果推进任务

$$
\text{Agent} = \text{LLM} + \text{Memory} + \text{Tools} + \text{Planning} + \text{Action}
$$

- Memory：使模型在处理重复工作时能复用经验，避免用户进行大量重复交互

    - 短期记忆：存储 *单个会话周期* 的 Context，属于临时存储机制、受限于 LLM 限制的上下文窗口长度
    - 长期记忆：
        - 支持横跨 多个任务 / 多个周期，非即时的存储、调用核心知识
        - 可以通过 模型参数微调（固化知识）、知识图谱（结构化语义网络）、向量数据库（相似性检索）实现

- Tool Use：调用外部工具扩展能力边界

- Planning：通过任务分解、反思-自省框架实现对复杂任务的处理

- Action：执行决策（如，自动订票、驱动机器人、编程等）

### 2.1 基本使用
> LangChain v0.x 的设计理念是 “针对 **特定使用场景** 设计 Agent”
> 
> 在实现思维链推理（`reate_react_agent`）、结构化输出（`create_structured_chat_agent`）、工具调用（`create_tool_calling_agent`）时，需要采用不同的构造函数。

- LangChain v1.0 统一使用 `create_agent()` 作为 Agent 创建 API（底层通过 LangGraph 实现）

    该范式天然支持工具的并发调用、多步调用、报错处理（需要用中间件）

<center><img src="../../../../images/core_agent_loop.avif" style="max-height: 250px; border-radius: 5px;"></center>

- `create_agent` 支持 静态/动态 两种 LLM 使用模式：本节中的静态模式仅在创建 Agent 时配置一次，并在整个执行流程中固定；动态模式将在下一节中介绍

```py
from langchain.agents import create_agent
from langchain_deepseek import ChatDeepSeek
from langchain_community.tools.tavily_search import TavilySearchResults

# 1 创建模型和工具
model = ChatDeepSeek(model="deepseek-chat")
web_search_tool = TavilySearchResults(max_results=2)
# 这个工具也可以直接通过 invoke 调用

# 2 创建 Agent（把 LLM 和 Tools 绑一块儿就完事了）
agent = create_agent(
    model=model,
    tools=[web_search_tool], # 自定义工具用 @tool 转化后丢进来进行
    system_prompt="你是..."
)

# 3 运行
response = agent.invoke({
    "messages": [
        { "role": "user", "content": "xxx" }
    ]
})
""" response["messages"] 中实际包含 4 条消息
1. HumanMessage：用户输入
2. AIMessage：LLM 返回的 FunctionCall 指令
3. ToolMessage：工具返回的结果
4. AIMessage：LLM 最终返回给用户的信息
"""
```

#### 记忆管理

两种方案：保存在内存中（短期）、保存在磁盘中（长期）

```py title="在内存中保存"
from langgraph.checkpoint.memory import InMemorySaver

checkpointer = InMemorySaver()
tools = [ get_weather ]
agent = create_agent(
    model=model, tools=tools,
    checkpointer=checkpointer
)

# 在调用时必须加入 config 参数标明 "线程 id" 进行区分
config = { "configurable": { "thread_id": "1" }}
response = agent.invoke(
    {"messages": [{"role": "user", "content": "1xxx"}]},
    config
)

# 读取当前线程的记忆（包含 usr1 + AI1）
latest = agent.get_state(config)

# 下一次调用：messages 只用携带当次信息
response = agent.invoke(
    {"messages": [{"role": "user", "content": "2xxx"}]},
    config # 指明线程，自动读取历史消息
)
```

#### 部署上线

- [LangSmith](https://docs.smith.langchain.com) [收费]：可视化调试、性能评估与运维监控平台

- [LangGraph Studio](https://www.langgraph.dev/studio)：LangGraph 图结构可视化与调试框架

- [LangGraph Cli](https://www.langgraph.dev)：本地启动、调试、测试、托管 LangGraph 智能体的命令行工具，支持将服务打包为后端 API

- [Agent Chat UI](https://langchain-ai.github.io/langgraph/agents/ui)：多智能体前端对话面板，支持上传文件、多工具协同、结构化输出、多轮对话、调试标注功能

晕了吗？没关系，看下面的步骤就行：

1. 创建 Agent 项目主文件夹
2. 创建 `requirements.txt` 文件（依赖项）
3. 创建 `.env` 文件（存放不适合硬编码的敏感信息，如 API-KEy）
4. 创建 `agent.py` 主文件，需要编写 Graph 运行逻辑（记忆会自动持久化存储，不需要手动配置）

    ```py
    ...
    # 创建图
    graph = create_react_agent(model=model, prompt="sys_prompt")
    ```

5. 创建 `langgraph.json` 文件（项目信息配置）

    ```json title="langgraph.json"
    {
        # 必填
        "dependencies": ["./"], # 在当前目录查找 requirements.txt
        # 必填："图名": "文件路径:变量名"
        "graphs": {
            "chatbot": "./graph.py:graph" # 定义图 chatbot 来自 graph.py 中的 graph 变量
        },
        # 选填：指定环境变量文件
        "env": ".env"
    }
    ```

6. 安装 langgraph-cli 及对应依赖

    ```bash
    pip install -U "langgraph-cli[inmem]"
    pip install -r requirements.txt
    ```

7. 进入项目主目录，启动项目

    ```bash
    cd path/to/project
    langgraph dev
    ```

8. 接入前端项目 Agent Chat UI（依赖于 NodeJS）

    ```bash
    # 克隆项目
    git clone git@github.com:langchain-ai/agent-chat-ui.git
    cd agent-chat-ui

    # 安装依赖
    npm install -g pnpm
    pnpm install

    # 启动前端 UI
    pnpm dev # 在弹出的 Web 窗口中配置后端接口地址
    ```

### 2.2 中间件

- Middleware 支持在 LLM 调用 **前后** 拦截请求、修改参数，或动态调整模型选择机制

<center><img src="../../../../images/middleware_final.avif" style="max-height: 250px; border-radius: 5px;"></center>

- 中间件支持嵌入的位置很丰富：before/after model, before/after agent

#### 模型动态选择

根据任务上下文自动切换模型，实现智能模型路由。如：在对话初期使用轻量模型节约成本，在上下文复杂化后自动切换至更强模型

```py
# 准备两种模型
base_model = ChatDeepSeek(model="deepseek-chat")
reasoner_model = ChatDeepSeek(model="deepseek-reasoner")

def _get_last_usr_txt(messages) -> str:
    """返回最新的用户消息文本"""
    for m in reversed(messages):
        if isinstance(m, HumanMessage):
            return m.content if isinstance(m.content, str) else ""
    return ""

@wrap_model_call
def dynamic_deepseek_routing(request: ModelRequest, handler) -> ModelResponse:
    """根据对话复杂程度动态选择模型"""
    messages = request.state_get("messages", [])
    msg_cnt  = len(messages)
    last_usr = _get_last_usr_txt(messages)
    last_len = len(last_usr)

    # 复杂任务关键字
    hard_keywords = ("证明", "推导", "step-by-step")
    
    # 启发式任务复杂度分类
    is_hard = (
        msg_cnt  > 10 or
        last_len > 120 or
        any(kw.lower() in last_usr.lower() for kw in hard_keywords)
    )

    # 选择模型
    request.model = reasoner_model if is_hard else base_model

    # 包裹，并由下游调用
    return handler(request)

# 创建 Agent，默认使用 base_model、可由中间件按需替换
agent = create_agent(
    model=base_model,
    tools=tools,
    middleware=[dynamic_deepseek_routing]
)
```

#### 消息压缩

- 最简单的消息压缩方式显然是直接对历史消息进行裁剪
  
    此类方法通常配合 `@before_model` 这一 hook 使用，在每次调用 LLM 前进行计算

    该方法实现简单、执行快速，适用于 ChatBot 和 RAG 问答，但容易丢失长期 Ctx

    ```py
    @before_model
    def trim_messages(state: AgentState, runtime: Runtime) -> dict[str, Any] | None:
        """只保留 Sys_Prompt + 最近三条"""
        messages = state["messages"]
        if len(messages) <= 4: return
        
        sys_prompt = messages[0]
        new_msgs   = sys_prompt + messages[-3:]

        return {
            "messages": [
                RemoveMessage(id=REMOVE_ALL_MESSAGES),
                *new_msgs
            ]
        }
    
    agent = create_agent(
        model=model, tools=tools,
        middleware=[trim_messages],
        checkpointer=InMemorySaver()
    )
    ```

- 删除指定消息也是一种可行方案，通常配合 `@after_model` 食用

    ```py
    @after_model
    def delete_old_msgs(state: AgentState, runtime: Runtime) -> dict[str, Any] | None:
        """每次调用后，删除最早的两条消息"""
        messages = state["messages"]

        if len(messages) > 4: 
            return {
                "messages": [
                    RemoveMessage(id=m.id) for m in messages[:2]
                ]
            }
    ```

- 消息摘要是最智能的压缩策略，LangChain v1.0 提供了 `SummarizationMiddleware` 实现

    ```py
    agent = create_agent(
        model=main_model, tools=[],
        middleware=[
            SummarizationMiddleware(
                model=summary_model,
                max_tokens_before_summary=3000, # 触发阈值
                messages_to_keep=10 # 需要保留的（最新）原始数据数量
            )
        ],
        checkpointer=checkpointer
    )
    ```

#### Human in the Loop

- 完全将高风险任务交由 LLM 执行存在显著安全漏洞

- LangChain v1.0 提供了支持在关键节点暂停 Agent 执行、等待人类审核的中间件，使 Agent 行为真正符合伦理与合规要求

```py
agent = create_agent(
    model=model, tools=tools, checkpointer=checkpointer,
    middleware=[
        HumanInTheLoopMiddleWare(
            # 拦截规则: 在执行搜索前人工审核
            interrupt_on={
                "tavily_search_results_json": {
                    "allowed_decisions": ["approve", "edit", "reject"],
                    "description": 
                        lambda tool_name, tool_input, state: (f"模型准备执行 Tavily 搜索: '{tool_input.get('query', '')}'")
                }
            },
            description_prefix="⚠️ 需要人工审批搜索操作"
        )
    ]
)
```