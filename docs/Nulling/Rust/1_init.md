# Start Up

[Rust](www.rust-lang.org) 相较于 C/C++ 更适用于以下场景：

- 需要高效执行
- 需要内存安全
- 需要更好的利用多个处理器

## 1 Install

请遵照 [此处](https://www.rust-lang.org/tools/install) 的指示进行安装

对于 MacOS 系统，你可以通过以下命令使用 RustUp 安装 Rust:
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

- 所有的工具将被安装至 `~/.cargo/bin` 下，你可以通过 `rustc --version` 进行验证
- 你可以通过 `rustup update` 进行版本更新，或用 `rustup doc` 查看文档

> 你也可以使用 `rustup self uninstall` 进行一个快速的删库跑路

## 2 Hello World

> Rust 文件的后缀为 `.rs`

```rust title='hello_world.rs'
// main() 是每个 Rust 可执行程序中 最先 执行的函数；
//        没有参数，也没有返回值
fn main(){
    println!("Hello World");
    // println! 实际上是一个宏（函数末尾不会带 '!'）
}
```

你可以通过 `rustc [fileName]` 进行编译，随后运行其编译结果（二进制文件）
> 由于 Rust 是一种 ahead-of-time 编译的语言，你可以直接将可执行文件丢给别人运行（无需安装环境）

但是 **rusct 只适合简单的 Rust 程序**，大型项目需要使用 Cargo

## 3 Hello Cargo

Cargo 是 Rust 的 构建系统 & 包管理工具，安装 Rust 时会自动安装

你可以通过以下命令使用 Cargo 创建一个新的项目：

```bash
cargo new [projectName]
```

此命令将在当前工作目录下创建 `projectName` 路径，包含 `/src（源码路径）` 与 `Cargo.toml（配置文件）`

### 3.1 配置文件

默认生成的 `.toml` 文件内容如下：

```toml
[package]          // 用于配制包 
name = "hello"     // 项目名称
version = "0.1.0"
edition = "2021"   // Rust 版本

[dependencies]     // 依赖
```

### 3.2 项目构建与运行

你可以通过 `cargo build` 命令对项目进行构建

- 该指令将在 `./target/debug` 路径下生成可执行文件
- 首次运行该指令将在项目根目录下生成 `cargo.lock` 以自动追踪依赖版本

你也可以通过 `cargo run` 命令直接构建 *并运行* 文件

---

当你需要 **发布** 项目时，可以通过 `cargo build --release` 进行构建

- 这一过程花费的时间更多，但生成文件的执行速率更快
- 可执行文件将生成于 `./target/release` 路径下

### 3.3 检查代码

`cargo check` 命令可以检查代码中存在的问题，但 **不进行编译**

因为 `check` 比 `build` 的运行速率要快得多，你可以反复执行 `cargo check` 以确保代码能成功通过编译

### 3.4 更换国内源

对于 MacOS 系统，只需在 `～/。cargo/config` 文件中填写以下内容即可更换为清华源：

```
[source.crates-io]
replace-with = 'mirror'

[source.mirror]
registry = "https://mirrors.tuna.tsinghua.edu.cn/git/crates.io-index.git"
```