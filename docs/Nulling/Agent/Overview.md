# 让我们说中文
> AI 是世界上最会造新词的学科 ...

!!!question "LLM 是一个只会纸上谈兵的呆瓜，我们如何给他装配干 dirty work 的牛马（程序）"

## 1 Memory

- （压缩 / 未压缩过）的 Context，防止长度爆炸
- **小老板记**，大老板（LLM）贵人多忘事

## 2 Agent（小老板）

> 执行大老板（LLM）的口谕，驱策牛马（Function）干活、然后汇报成果

### 2.1 Search

- RAG（检索增强生成）：从 **(本地)**文档/向量数据库 中查找最相关的片段返回（作为 Reference）
- Web Search：从 **网上** 扒拉相关信息返回

### 2.2 Tool Using

- Function Calling（LLM $\leftrightarrow$ Agent）：约定 LLM 需要调用函数时的返回格式 

- MCP（Agent $\leftrightarrow$ Function，Local / **Remote**）：约定 Agent 实际调用函数的方式
    - `tool_list`：返回全部功能列表 
    - `tool_call`：实际调用特定功能

### 2.3 Skill（Local）
  
!!!comment "就是 Prompt / 说明文档（`SKILL.md`）加载器"
    你也可以把 MCP 提供的功能全丢到 `/skill` 下、然后在 SKILL.md 中进行说明

- Sample
    - 你希望：实现从 srcFile $\rightarrow$ dstFile 的格式转换，但这有 $A_N^N$ 种排列组合方式
    - 于是：你为每一种格式分别实现了 `from_X` & ` to_X` 脚本，让 LLM 自己看着用
    
- Solution
    - 在一个**约定俗成**的位置下（`~/.config/skills`）存放所有的脚本 + 功能描述（`SKILL.md`）
    - 每次实际发送  Prompt 前，Agent 都会 **自动读取** `SKILL.md` 并将其拼接到 Prompt 中

### 2.4 SubAgent
  
- 负责特定功能的小外包
- 小老板（Agent）不会储存具体外包项目的 Memory

## 3 LangChain / Workflow
> 一堆用于驱动 Agent 的 IF-ELSE 或者 LOOP 规则，硬性规定每一步怎么办

- LangChain：一般指编程实现
- Workflow：一般指 GUI 页面上的拖拽连线实现