# LangChain

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

## 1 Modules

### Model

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

messages = [
    SystemMessage(content="你是一位 LangCahin 课程助理。"),
    HumanMessage(content="你好，我是 xxx"),
    AIMessage(content="欢迎"),
    HumanMessage(content="你是谁？我又是谁？"),
]
print(llm.invoke(messages).content)
```

### Prompt Template

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
    ```

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

- 从 JSON 文件中加载模版

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

    ```py
    from langchain.prompts import load_prompt
    prompt = load_prompt(path="xxx.json", encoding="utf-8") # load
    
    # 示例化
    prompt.format(name="甲", love="小笼包")
    ```

### Output Parser

- 下面是一个使用 CSV Parser 的示例，支持以逗号分隔输出的 item List

    类似的，我们可以使用 `DatetimeOutputParser` 对 Completion 中的时间进行格式化

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

- LangChain 也支持自定义输出格式

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
