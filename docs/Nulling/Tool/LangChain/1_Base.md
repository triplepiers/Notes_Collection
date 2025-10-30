# LangChain Basic

## Intro

```bash
pip install langchain # install
```

[LangChain](https://python.langchain.com/docs/introduction) 是一个用于辅助开发 LLM-based App 的 Python 框架。它提供了一系列工具，用于辅助开发者将 LLM 集成至具体应用程序中。

其核心组件如下：

| 组件 | 描述 |
| :-- | :-- |
| Model | 使用的 LLM |
| Prompt | 提示词管理 |
| Chain | 用于串联组件，形成工作流 |
| Memory | 保存对话历史 |
| Agent | 智能体，根据用户输入自动选择需要执行的（不同）操作 |
| Tool |  一些内置功能模块（文本处理、数据查询 etc. ）|

### 架构设计

LangChain (v0.3) 自底向上包含三个 Level：

- Achitecture
    - Base LangChain：提供包含操作 Model、搭建 Agent 和 RAG 的基础 API
    - LangGraph：对 Base LangChain 的进一步封装，支持协调 **多个** LLM / Agent 完成更复杂的任务
- Components：Agent / Retrieval
- Deployment：部署
    - LangSmith：运维用
    - LangServe：提供 Restful API 的标准服务接口（可以不用）
  
## 1 Model I/O

该模块将对不同 LLM 的操作封装为统一接口，使得在更换 LLM 时无需重构代码

其运作流程主要包含三个步骤：

1. Format：将原始数据格式化为 LLM 可以处理的格式，并插入 Prompt 模版中
2. Predict：LLM 基于格式化后的 Prompt 进行预测
3. Parse：将 Completion 进一步标准化为 JSON 结构

```python
# using GPT Model
from langchain_openai import ChatOpenAI
llm = ChatOpenAI()

# 简单的单轮对话 sample 
prompt = '你是谁?'
print(llm.invoke(prompt).content)

# 手动模拟多轮对话，方便进行调试
from langchain.schema import (
    AIMessage,     # Completion
    HumanMessage,  # User Input
    SystemMessage  # System Prompt
)
"""
还有下面两种，但用的没那么多：
- ChatMessage（通用消息类，可自定义角色）
- FunctionMessage/ToolMessage（工具调用消息，用于记录调用结果）
"""

messages = [
    SystemMessage(content="你是一位 LangCahin 课程助理。"),
    HumanMessage(content="你好，我是 xxx"),
    AIMessage(content="欢迎"),
    HumanMessage(content="你是谁？我又是谁？"),
]
print(llm.invoke(messages).content)
```

### 1.1 Model

#### OpenAI (Online)

```py
from langchain_openai import ChatOpenAI
llm = ChatOpenAI(
    # required: 可以配置到不同服务平台
    base_url='',
    api_key='',
    model='',
    # optional
    temperature=0
)
```

#### Ollama (本地)

```py
from langchain_ollama import ChatOllama
llm = ChatOllama(
    model='xxxxx'
)
```

### 1.2 Prompt Template

- `PromptTemplate`：基础模版，支持自定义输入变量与模版文本

    ```py
    from langchain.prompts import PromptTemplate
    template = PromptTemplate.from_template("给我讲一个关于{name}的笑话")

    # 实例化
    prompt = template.format(name="阿川") 
    ```

- `ChatPromptTemplate`：针对聊天场景，支持分别定义 Sys、Usr、AI 的消息模版

    ```py
    from langchain.prompt.chat import AIMessagePromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate
    from langchain.prompts import ChatPromptTemplate

    template = ChatPromptTemplate.from_messages([
        SystemMessagePromptTemplate.from_template("你是{product}的客服助手，你叫{name}"),
        HumanMessagePromptTemplate.from_template("hello, 你好吗"),
        AIMessagePromptTemplate.from_template("我很好，谢谢"),
        HumanMessagePromptTemplate.from_template("{query}"),
    ])
    # 实例化
    prompt = template.from_messages(
        product="求是潮",
        name="x86",
        query="你是谁"
    )

    """也有方法不那么长的"""
    template = ChatPromptTemplate(
        messages=[
            ("system", "你是一个AI助手，你叫{name}"),
            ("human",  "我的问题是{question}")
        ],
        input_variables=["name", "human"]
    )
    prompt = template.invoke(input={
        "name":     "x86",
        "question": "你是谁"
    })
    ```

#### Few-Shot

!!!note "无论输入什么问题，FewShotTemplate 均会输出 **全部** 示例"

- `FewShotPomprtTemplate`：没啥好说的，就是 Few-Shot

    ```py
    from langchain.prompts import PromptTemplate
    from langchain.prompts.few_shot import FewShotPromptTemplate

    # 定义 shots
    examples = {
        {"input": "北京天气如何",    "output": "北京市"},
        {"input": "今天南京会下雨吗", "output": "南京市"},
        {"input": "武汉热吗",        "output": "武汉市"},
    }

    # example shots -> prompt 的格式化方式
    base_prompt = PromptTemplate(
        input_variables=["input", "output"],
        template="Input: {input}\nOutput: {output}"
    )
    # few-shot 模版
    prompt = FewShotTemplate(
        # few-shots 相关配置
        examples=examples,
        example_prompt=base_prompt,
        # 其他配置
        suffix="Input: {input}\nOutput: ", # 接在 Shots 后
        input_variables=["input"],         # 实际 query
    )

    # 实例化
    prompt = template.format(input="长沙多少度")
    ```

- `FewShotChatMessagePromptTemplate` 针对 Chat 格式进行了优化：

    - 支持将 Shots 自动转化为 Message 类型
    - 支持输出格式化的聊天消息
    - 支持保留对话轮次结构

    ```py
    from langchain.prompts import (
        FewShotChatMessagePromptTemplate,
        ChatPromptTemplate
    )

    examples = [{
        "input": "1+1=?", "output": "2"
    }]

    # 定义 Chat 格式的 prompt 模版
    msg_example_prompt = ChatPromptTemplate.from_messages([
        ("human", "{input}"),
        ("ai",    "{output}")
    ])

    # 实例化 few_shot_prompt
    few_shot_prompt = FewShotChatMessagePromptTemplate(
        example_prompt=msg_example_prompt,
        examples=examples
    )
    # 显示格式化后的消息
    print(few_shot_prompt.format())
    """
    Human: 1+1=?
    AI: 2
    """
    ```

#### Example Selector

!!!note "支持根据当前输入，从大量候选示例中选取相关度最高的子集"

- 常见的 Example 筛选策略如下

    - 长度相似（不明所以）：选择与 input 长度高度相关的 example，超轻量

    - 语义相似：基于 **余弦相似度**（或其他） 指标评估文本对的语义相似度，选择相似度最高的 `Top K` 个 example
    
    - 最大边际相关：优先选择语义相关的 example，并通过惩罚机制避免返回同质化内容

- 需要借助 Embedding 模型将 question 向量化
  
    ```py
    # 初始化 Embedding 模型
    from langchain_openai import OpenAIEmbeddings
    embedding_model = OpenAIEmbeddings(
        model="text-embedding-ada-002" # 或者其他的
    )

    # 定义 Example 组
    examples = [{
        "question": "xxxxxx", "answer":   "yyyyyy",
    }]

    # 定义 example selector
    example_selector = SemanticSimilarityExampleSelector.from_examples(
        examples,
        embedding_model,
        Chroma,          # 用于存储潜入结果 + 计算相似度的 VectorStore 类
        k=1              # 需要返回的 Example 数量
    )

    # 选取 Example
    question = "x1x1x1x1"
    selected_examples = example_selector.select_examples({
        "question": question
    })
    """
    selected_examples = [
        {'question': '???', 'answer': '???'}, ...
    ]
    """

    # 也可以把挑选的 Example 丢进 Prompt 模版
    similar_prompt = FewShotPromptTemplate(
        example_selector=example_selector,
        example_prompt=PromptTemplate.from_template(template="Input: {input}\nOutput: {output}"),
        prefix="输出每个词组的反义词",
        suffix="Input: {word}\nOutput: ",
        input_variables=["word"]
    )
    response = similar_prompt.invoke({ "word": "忧郁" })
    """ response.text =
    Input:   高兴   --- 这部分是
    Output:  悲伤   --- 召回示例

    Input:   忧郁   <-- 这里是 suffix + word
    Output
    """
    ```

#### Load File

!!!note "从 JSON 文件中加载模版"

- 在 JSON 文件中按以下格式定义 template 模版

    ```json
    {
        "_type": "prompt",
        "intput_variables": [
            "name",
            "love"
        ],
        "template": "我的名字叫{name}，我喜欢{love}"
    }
    ```

- 支持通过以下代码从 JSON 文件中读取模版
  
    ```py
    from langchain.prompts import load_prompt
    prompt = load_prompt(path="xxx.json", encoding="utf-8") # load

    # 示例化
    prompt.format(name="甲", love="小笼包")
    ```

### 1.3 Output Parser

LLM 通常只能返回字符串类型的预测结果（非结构化）；但在实际应用过程中，我们通常需要模型返回格式化结果以进一步处理。

为此，LangChain 提供了多种类型的输出内容解析器：

- `[Str, Json, XML, CommaSeperatedList, Datetime]Outputparser`：将结果解析为常见数据类型
- `EnumOutputParser`：将 LLM 输出解析为预定义枚举值
- `StructOutputParser`：将输出转换为指定格式（字典, etc）
- `OutputFixingParser`：尝试自动修复非预期的格式错误
- `RetryOutputParser`：当主解析器因格式错误无法正常解析时，尝试调用另一个 LLM 修正错误并重新解析

#### CSV

- 下面是一个使用 CSV Parser 的示例，支持以逗号分隔输出的 item List

    ```py
    from lanchain.output_parsers import CommaSeparatedListOutputParser
    output_parser = CommaSeparatedListOutputParser()

    # 创建 Prompt 模版：Request + 输出格式要求
    chat_prompt = ChatPromptTemplate.from_message([
        HumanMessagePromptTemplate.from_template("{request}\n{format_instructions}")
    ])

    # 基于模版初始化 Prompt
    model_request = chat_prompt.from_prompt(
        request="给我5种心情",
        # 预期 Completion 返回格式："foo, bar, baz" / "foo,bar,baz"
        format_instructions=output_parser.get_format_instructions()
    )

    # 预测及格式化
    completion = llm.invoke(model_request).content
    print(output_parser.parse(completion))
    ```

- 类似的，我们可以使用 `DatetimeOutputParser` 对 Completion 中的时间进行格式化

#### JSON

!!!note "本质上是通过 `get_format_instructions` 在 prompt 插入了一段对输出格式进行描述的文本"

```py
# init
from langchain_core.outoput_parser import JsonOutputParser
parser = JsonOutputParser()

prompt_template = PromptTemplate.from_template(
    template="按照格式{format_instruction}回答用户查询\n用户问题为{question}",
    partial_variables={"format_instruction": parser.get_format_instructions()}
)
"""
实际上就一句话：'Return a JSON object.'
"""
prompt = prompt_template.invoke(input={"question": "xxx"})
responses = chat_model.invoke(prompt)

# parse
json_response = parser.invoke(response)
```

#### XML

- 本质：在 PromptTemplate 中要求模型返回 `<tag>content</tag>` 格式的 XML 数据
- 注意：`XMLParser` 会将 LLM 输出的 XML 内容转换为字典，以供后续处理

```py
from langchain_core import XMLOutputParser
parser = XMLOutputParser()

# response 其实是符合 XML 格式的
# 但 parsed 其实是 dict（根据 XML 层级进行嵌套）
xml_respose = parser.invoke(response)
```

#### 自定义格式

```py
from pydantic import BaseModel, Field
from langchain.output_parser import PydanticOutputParser

# 用于数据格式验证
class Writer(BaseModel): 
    """作家类"""
    name: str = Field(description="name of a writer")
    nationality: str = Field(description="nationality of a writer")
    magnum_opus: list = Field(description="python list of discoveries") # 代表作列表

# 使用自定义格式初始化 Parser
output_parser = PydanticOutputParser(pydantic_object=Writer)

# 初始化 prompt
model_request = chat_prompt.from_prompt(
    request="莫言是谁",
    # 会基于上面的 schema & desc 生成一坨
    format_instructions=output_parser.get_format_instructions()
)

# 预测及格式化
completion = llm.invoke(model_request).content
print(output_parser.parse(completion)) # 会生成 JSON
```

### 1.4 Tips

???info "实例化"

    除 `format` 外（返回 str），还支持通过 `invoke` 方法进行实例化（入参为 dict、返回 StringPromptValue）

    ```py
    prompt.format(name="甲", love="小笼包")

    # (约）等价于
    prompt.invoke(input={
        "name": "甲", 
        "love": "小笼包"
    })
    ```

???info "Partial Variables"

    对 Prompt Template 中的部分 variable 赋默认值

    ```py
    template = PromptTemplat.from_template(
        template="{product}的优点包括{aspect_1}和{aspect_2}",
        partial_variables={
            "aspect_1": "续航"
        }
    )

    # 在实例化时，无需显式为 aspect_1 赋值（当然，带了的话会 *覆盖默认值*
    prompt = template.formate(product="手机", aspect_2="摄影")

    # 让一部分人先富起来？
    template_1 = template.partial(aspect_2="摄影") # 返回存储了 partial 结果的新模版
    prompt = template1.format(product="手机")
    ```

???info "Runnable Protocal"
    - LangChain 支持的 Completion 函数不止 `invoke` ，这一种：

        | Function | Desc |
        | :------  | :--- |
        | `invoke` | 阻塞，LLM 完成对单条 ipt 的推理后返回 |
        | `stream` | 流式响应，逐字输出预测结果 |
        | `batch` | 批量处理输入 |

        ```py
        """Stream"""
        # 1 需要在初始化 Model 时设置 streaming=True
        model = ChatOpenAI(model="", streaming=True)
        # 2 需要用 loop 进行输出
        for chunk in model.stream(msgs):
            print(chunk.contetn, end="", flush=True) # 强行刷新无换行符的缓冲区

        """Batch"""
        # 1 需要将 query_i 对应的 msgs_i 进行拼接
        msgs = [msgs_1, msgs_2, msgs_3]
        # 2 批量推理（其实很简单），返回 List(AIMessage)
        responses = model.batch(msgs)
        ```

    - 这些方法也有对应的异步模式 `a[Func]`，需要配合 asyncio 的 `await` 语法食用

## 2 Chains

!!!note "用于连接不同组件（PromptTemplate，Model，Memoty，Tools）以形成 workflow"

### 2.1 LCEL

- LangChain 表达式语言（LangChain Expression Language）支持通过管道符 `|` 定义顺序 workflow
  
- 基本构成
  
    ```py
    chain = prompt_template | model | output_parser
    chain.invoke({ "input": "xxxx" }) # 只用一条语句便可完成从模版填充到输出格式化的全流程
    ```

#### SQL Query

!!!note "实现 NL-to-Query"

```py title="Sample for MySQL"
from langchain.chains import create_sql_query_chain
from langchain_community.utilities import SQLDatabase

# connect
db = SQLDatabase.from_uri(f"mysql+pymysql://{username}:{password}@{host}:{port}/{database}")

# init Chat Model
chat_model = ...

# create Chain
chain = create_sql_query_chain(chat_model, db)
response = chain.invoke({
    "question": "How many peoples in table Emploees?",
    "table_names_to_use": ["employees"]
}) # => 此处只是生成了 SQLQuery: 'SELECT ...'，没有真正执行
```

#### Stuff Document

!!!note "将多个文档内容合并为一条长文本，便于一次性传递给 LLM 处理"

- 有助于保持上下文完整，适合需要对文档进行全局理解的任务（总结、问答）
- 适用于 少量 · 中等长度 文档场景

```py
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.documents import Document

prompt = PromptTemplate.from_template("文档{docs}中的香蕉是什么颜色的？")

chain = create_stuff_documents_chain(
    llm, prompt,
    document_variable_name="docs" # 和 prompt template 中需要用文档内容替换的变量名一致
)

# 定义多个文档
documents = [
    Document(page_content="A..."),
    Document(page_content="B...")
]

# 聚合多个文档
chain.invoke({ "docs": documents })
```

### 2.2 顺序链

- 套娃结构：支持顺序连接多条 Chain 以形成 Pipeline
- 两种类型：SimpleSequentialChain（单输入输出）、SequentialChain（多输入输出、需要手动 map）

#### SimpleSequentialChain

多条 Unit Chain 的 Template 中只有 **单个输入变量**，**不需要** 手动指定映射关系

```py
from langchain.chains import LLMChain
from langchain.chains.sequential import SimpleSequentialChain

chain_a = LLMChain(llm=llm_a, prompt=prompt_template_a, verbose=True) # 需要变量 question
chain_b = LLMChain(llm=llm_b, prompt=prompt_template_b, verbose=True) # 只能有一个变量

chain = SimpleSequentialChain(
    chains=[chain_a, chain_b],
    verbose=True
)
# 无论 template_a 中的变量叫什么，这边都得用 input（好智障的设计）
chain.invoke(input={"input": "question"})
```

#### SequentialChain

- 多条 Unit Chain 的 Template 中存在若干个变量
- 需要 **显式定义** 不同变量之间的传递关系、支持分支和条件逻辑

```py
"""
A:
- input 涉及两个变量：knowledge, action
- output_key: opt_key_a
B:
- input: opt_key_a
- output_key: opt_key_b
"""
chain = SequentialChain(
    chains=[chain_a, chain_b],
    input_variables=['knowledge', 'action'],
    output_variables=['opt_key_a', 'opt_key_b'], # 会同时输出两个阶段的 output
    verbose=True
)
response = chain.invoke({
    "knowledge": "xxxx",
    "action":    "举一个例子"
})
```

## 3 Memory

!!!note "模型本身 **不会记忆** 任何上下文信息，需要手动维护"
    Memory 模块会将用户当当前轮次 query 与历史上下文进行拼合，并将 response 拼接至 Context 尾部

