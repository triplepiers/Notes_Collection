# VSCode 插件编写

> Reference: [编写一个 Vscode 插件 | 从创建到发布 | 一键删除函数](https://www.bilibili.com/video/BV1bG4y1n78A) ([较完善的 Repo](https://github.com/cuixiaorui/delete-function))

从零编写一个 VSCode 插件并发布至插件市场，支持以下功能：

- **一键删除** 选中函数 (函数声明 / 函数表达式 / 箭头函数)
- 支持 命令 / 快捷键 调用

## 1 初始化项目（CLI）

- 安装脚手架：`generattor-code` 提供了一系列项目模版
  
    ```bash
    npm install -g yo generator-code
    ```

- 初始化项目：选择 TS、**不使用** webpack

    ```bash
    yo code # 即使用 generator-code 提供的模版
    ```

- 初始化后的项目结构如下：

    ```text
    .
    ├── CHANGELOG.md
    ├── eslint.config.mjs
    ├── package-lock.json
    ├── package.json
    ├── README.md
    ├── src
    │   ├── extension.ts            <= 这里是入口文件
    │   └── test                    <= 下面存放单元测试
    ├── tsconfig.json
    └── vsc-extension-quickstart.md
    ```

- 运行、调试

    ```bash
    # 1 运行: 使用 package.json 中提供的对应命令即可
    npm run compile # => 该命令会生成 /out 文件夹
    npm run watch   # => 如果需要应用热更新
    # 2 调试: 使用 F5 即可在新窗口中进行调试
    ```

    由于模版在 `src/extension.ts` 中定义了命令：

    ```ts
    const disposable = vscode.commands.registerCommand('[plugin].helloWorld', () => {
      vscode.window.showInformationMessage('Hello World from [plugin]!');
    });
    ```

    因此，在命令面板中选择 `Hello World` 后即会在右下角出现对应内容的弹窗

- 命令注册

    1. 整体注册（已经自动生成了）

        `src/extension.ts` 中的 `activate()` 仅当存在以下配置时生效

        ```json
        // @ package.json
        "activateEvents": [
          "onCommand": "[plugin].helloWorld"
        ]
        ```

    2. 详细命令注册
   
        ```json
        "contributes": [
          "commands": [
            {
              "command": "[plugin].helloWorld",
              "title": "Hello World" // 这个是在命令面板里显示的标题
            }
          ]
        ]
        ```
        
        改配置将触发 `extension.ts` 的 `disposable` 中注册的回调函数：

        ```ts
        vscode.commands.registerCommand('del.helloWorld', () => {
          vscode.window.showInformationMessage('Hello World from del!');
        });
        ```

- 快捷键注册

    ```json title="pakcage.json"
    {
      ...,
      "contributes": [
        ...,
        "keybindings": [
          "command": "[plugin].helloWorld", // 需要和 commands 里的内容对应
          "key": "ctrl+R R", // 默认配给 Win
          "mac": "cmd+R R"
        ]
      ]
    }
    ```

## 2 功能实现

该插件涉及的关键步骤如下：
  
- 如何在 VSCode 中删除指定字符
- 如何获取 *光标所在的* Function 范围

### 2.1 在 VSCode 中删除字符
 
> `row` 从 0 开始，`col` 从 1 开始

```ts title="删除指定范围内的所有字符"
const editor = vscode.window.activeTextEditor;
if (!editor) return;

editor.edit((editBuilder) => {
  // 删除两个 Range(row, col) 之间的所有字符
  editBuilder.delete(
    new vscode.Range(
      new vscode.Position(), new vscode.Position()
    ))
})
```

### 2.2 基于 AST 获取函数范围

1. 基于 Babel 解析 AST

    ```bash title="安装依赖"
    npm install @babel/parser @babel/traverse
    ```

    单独拎一个文件出来，方便做单元测试

    ```ts title="src/main.ts"
    import {parse} from "@babel/parser";
    import traverse from "@babel/traverse";

    // 提供类型提示
    interface FunctionNode {
      name: string,
      start: {
        line:   number,
        column: number,
        index:  number
      },
      end: {
        line:   number,
        column: number,
        index:  number
      }
    }
    
    export function getFunctionNode(
      code:  string, // 待解析代码字符串
      index: number  // 光标位置
    ): FunctionNode | undefined {
     // 解析
     const ast = parse(code);
     console.log(ast);

     // 遍历 AST
     let functionNode;
     traverse(ast, {
       // 遇到 FunctionDeclaration 结点时，触发回调
       FunctionDeclaration(path) {
         console.log(path.node);
         // 判断光标位置：start & end 相当于将代码连成一行时的位偏
         let node = path.node;
         if (index >= node?.start! && index <= node?.end!) {
          // 提取部分需要的信息
          functionNode = {
            name:  node?.id?.name,
            start: node?.loc?.start,
            end:   node?.loc?.end
          }
         }
       },
       // 支持箭头函数: 连着变量一起删掉
       ArrowFunctionExperssion(path) {

        function getName() { // 变量名
          return Object.keys(path.parentPath.getBindingIndentifiers())[0];
        }

        const varDeclarePath = path.parentPath.parentPath; // 指向变量 const xxx = () => {}
        if (varDeclarePath?.isVariableDeclaration()) {
          let node = varDeclarePath.node;
          if (index >= node?.start! && index <= node?.end!) {
            functionNode = {
              name:  getName(),
              start: node?.loc?.start,
              end:   node?.loc?.end
            }
          }
        }
      },
      // 支持函数表达式 ... 
    })

     return functionNode; // 绑定了 babel 结构
    }
    ```

### 2.3 自动化单元测试

!!! warning "每次热更新都需要重新 F5 还是太痛苦面具了"



- 安装测试框架 `vitest`

    ```bash
    npm install vitest -D
    ```

- 修改 `package.json` 中的测试命令

    ```json
    "scripts": [
      ...,
      "test": "vitest --run"  
      // 默认是 watch 模式、但不太稳定，这里改为手动触发
    ]
    ```

- 同时，修改 `tsconfig.json` 将其编译范围限制在 `/src` 路径下

    ```json
    {
      ...,
      "include": [ "src/**/*" ]
    }
    ```
   
- 在 `src/test` 下新建用于检查 AST 的单元测试

    > 只涉及业务逻辑，不涉及 UI 逻辑

    ```ts title="main.spec.ts"
    import {test, expect} from "vitest";
    import {getFunctionNode} from "@/src/main"; // 待测函数

    test("init". () => {
      // expect(true).toBe(true); // 通过断言测试 vitest 是否正确引入 
      
      // 待解析文本
      code = `
      function getName() {
        return 'name';
      };
      // 箭头函数
      const getNameA = () => {
        return 'name_a';
      };
      // 函数表达式
      const getNameB = function () {
        return 'name_b';
      };
      `; 
      // 实际测试函数
      const node = getFunctionNode(code);
      // 检查 code 返回是否符合 babel 格式
      expect(node).toEqual({
        name: "getName",
        start: {
          line: 2,
          column: 6,
          index: 7,
        },
        end: {
          line: 4,
          column: 7,
          index: 51,
        },
      })
    })
    ```

### 2.4 集成到 UI 逻辑

> 这边涉及到 UI 逻辑，必须用 VSCode 本体跑了

```ts title="src/extension.ts"
import * as vscode from "vscode";
import {getFunctionNode} from "./main";

export function activate(context: vscode.ExtensionContext) {
  vscode.command.registerCommand(
    "[plugin].helloWorld", () => {
      // 如果没有打开的窗口，就可以直接润了
      const editor = vscode.window.activeTextEditor;
      if (!editor) { return; }

      // 1 获取删除范围
      const code  = editor.document.getText();
      const index = editor.document.offsetAt(
        editor.selection.active // 这边返回的是 (row, col)，需要转化成整体位偏
      );
      const functionNode = getFunctionNode(code, index);
      // 光标不在任何函数内，也可以跑路了
      if (!functionNode) { return; }

      // 2 删除（指定位置处的）函数
      editor.edit((editBuilder) => {
        editBuilder.delete(new vscode.Range(
          new vscode.Position(functionNode?.start.line, functionNode?.start.column),
          new vscode.Position(functionNode?.end.line,   functionNode?.end.column)
        ))
      })
    }
  )
}
```

## 3 插件发布

```bash
# 1 安装依赖
npm install -g vsce

# 2 登录
vsce login [projectName]                    # => 需要在 Azure DevOps 中注册账号
Do you want to overwrite its PAT? [y/N] y   # 重写
Personal Access Token for publisher 'USER': # 输入在 Azure DevOps 中生成的 Token
                                            # 至少需要 Marketplace - Manage 权限

# 3 打包（Optional）：生成 .vsix 文件、可以手动发布在 VSCode MarketPlace
vsce package # 用 npm 管理可能会报错
## 可以通过 --yarn 指定其他包管理器，但需要生成 .lock
rm -rf node_modules/
yarn # 生成 lock 文件

# 4 直接发布
vsce publish # 自动打包完 + 上传
```
