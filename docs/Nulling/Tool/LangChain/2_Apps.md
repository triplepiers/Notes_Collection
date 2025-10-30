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

