# 高级特性与项目实操

## 1 自动化测试

- Test Case 本质上就是一个包含以下步骤的 function

    1. 准备 data / status
    2. 运行被测试的代码片段
    3. 根据断言验证结果

- Rust 中的测试函数需要进行 `#[test]` 注释

    - 支持通过 `cargo test` 并行运行所有测试函数
        - 需要确保 test case 之间不存在相互依赖、且不依赖于共享状态
        - 支持通过 `--test-threads` 控制并发数
        - 支持直接通过 函数名（的字串）/模块名 作为第一个参数，从而制定测试内容
        - 支持为测试函数添加 `#[ignore]` 进行跳过（仅在 `cargo test -- --ignored` 时运行）
    - 每个测试函数会运行在一个单独的 thread 上（线程挂掉就标记为 fail）

- 断言

    - 支持自定义报错信息（会和标准信息一起打印）、支持通过 `{}` 进行占位
    - 普通的 `assert!` 
    - 用于比较值的 `assert_eq!, assert_ne!`：失败时会调用 `debug` 格式打印入参，需要实现 PartialEq & Debug

- 恐慌检查：代码是否在特定情况下如预期一般报 panic

    ```rust
    #[test]
    #[should_panic] // 类型标注 => 仅在报 panic 时标记为通过
    fn gt_100() {}

    // 也可以通过 expect 验证 panic 信息中是否 *包含* 指定字符串
    #[should_panic](expect = "less than")
    ```

- 测试函数也可以使用 `Result<T,E>` 作为返回值编写（这样就不用 panic 了）

    ```rs
    #[test]
    fn two_plus_two() -> Result<(), String> {
        if 2+2 == 4 {
            Ok(())
        } else {
            Err(String::from('2+2 != 4'))
        }
    }
    ```

- 测试分类

    - 单元测试：每次对单一模块进行隔离测试、支持调用 private 接口（一般和 src 放在一个文件里）

        ```rs
        pub fn f1{} // public
        fn f2{}     // private

        #[cfg(test)] // 仅在 cargo test 时编译运行（cargo build 时省略）
        mod tests {
            use super::*; // 引入一下待测内容
            #[test]
            fn check {}
            fn log {}    // 这是普通函数（在 cargo test 时，也会被编译）
        }
        ```

    - 集成测试：可以同时调用多个模块、仅能调用 public 接口

        - 一般放在单独的 `/tests` 目录中、每个文件都被编译为单独的 crate

            > 子目录 `/tests/dirName` 下的文件不会被视为测试用例、你可以往里丢 utils

        ```rs
        // @ tests/test.rs
        use projName; // 被测试代码为 src/lib.rs => crate 名称即为 prjName

        #[test]
        fn check_sth {}
        ```

        - 支持通过以下方式制定被运行的集成测试

            - `cargo test funcName` 运行单个集成测试
            - `cargo test --test fileName` 运行单个文件中的所有集成测试
  
        - binary crate（只有 `src/main.rs`）*不支持* 在 `/tests` 下创建集成测试

            > 只有 library crate 才能暴露函数（你无法将 `main.rs` 导入作用域）

## 2 构建与发布

### 自定义构建

- Cargo 支持通过两套不同的 Profile 自定义对开发和发布版本的构建

    - `dev profile` 适用于开发环境，对应命令 `cargo build`
    - `release profile` 适用于发布环境，对应命令 `cargo build --release`

- 每个 profile 都提供了一些默认配置，只需要在 `Cargo.toml` 中覆盖需要的部分就可以了
    ```toml title="Cargo.toml"
    [profile.dev]
    opt-level = 0
    [profile.release]
    opt-levl = 3
    ```

### 发布 crate

- 文档注释

    - 用于生成 API 的 HTML 文档，支持使用 Markdown 语法
    - 常用 section
        - Examples：代码用例（在 `cargo test` 中将作为单元测试被执行）
        - Panics：可能报 Panic 的场景
        - Errors：在返回 Result 时，可能返回的错误种类及其触发条件
    - 相关命令：
        - `cargo doc`：自动调用 `rustdoc` 生成文档，结果位于 `target/doc` 路径下
        - `cargo doc --open`：自动构建文档，并在默认浏览器中打开
  

    ```rs
    /// Add 1 to the given number
    /// 
    /// ## Examples
    /// ```
    /// let arg = 5;
    /// let ans = my_crate::add_one(arg);
    /// assert_eq!(ans, 6);
    /// ```
    pub fn add_one(x: i32) -> i32 { x+1 }
    ```

- 描述 （外层）crate 或 模块：通常位于 crate 的 root 文件中

    ```rs title="lib.rs"
    //! # MyCrate
    //!
    //! `my_crate` is a collection of utilities ...
    ```

- 发布前得去 [crates.io](https://crates.io) 注册，并拿到 token  

    - 运行 `cargo login [API token]` 将 token 存储到本地（`~/.cargo/credentials`）

    - 在 `Cargo.toml` 中添加必要的 meta data
        - `name`：必须是非重复的
        - `license`：[开源许可标识符](https://spdx.org/licenses)，可以用 OR 分隔
        - `description`, `version`, `author`

    - 运行 `cargo publish` 命令进行发布（该版本无法被覆盖或删除）
    - 运行 `cargo yank --vers [Verson]` 撤回版本
        - 已存在项目可以 *继续下载* 该版本依赖，并正常工作
        - 新项目将 *不会使用* 被 yank 的版本
        - 可以通过 `cargo yank --vers [Verson] --undo` 取消撤回

### 导出公共 API 

- 开发者可能把程序拆成很多层，但这对使用者不太友好，belike：

    ```rs
    use my_crate::some_module::some_sub_module::useful_method;
    ```

- `pub use` 可以将项目重新导出为更加合理的结构

    ```rs title="@/some_module/some_sub/module.rs"
    pub use self::kinds::useful_method;
    pub mod kinds {
        pub enum useful_method {}
    }
    ```

    ```rs title="@main.rs"
    use my_crate::useful_method; // 是不是很合理
    ```

## 3 WorkSpaces

!!!info "你必须手动逐个发布工作空间中的 Crate"

- Workspace 指 一套共享相同 `Cargo.lock` + 输出文件夹（`/target`） 的包

    - 整个工作空间只有一个在 *根路径* 下的 `Cargo.lock` 文件，保证所有 crate 实际使用的依赖版本 *一致*
    - 即便在子路径中声明了不同版本的第三方依赖，也能保证互相兼容

- 创建 workspace

    假设我们有 1 $\times$ "二进制" crate + 2 $\times$ "库" crate

    1. 在 `Cargo.toml` 中配置工作空间的相关信息

        ```toml
        [workspace]
        # 添加成员
        members = [
            "adder",   # 需要通过 cargo new adder 创建相关路径
            "plus-one",
        ]
        ```
    2. 显式声明依赖关系

        ```toml title="adder/Cargo.toml"
        ...
        [dependencies]
        plus-one = { path = "../plus-one" }
        rand = "0.3.23" # 第三方依赖
        ```
    3. 调用依赖模块
        ```rs title="adder/main.rs"
        use plus-one;

        fn main() {
            let num = 10;
            println!("{} + 1 = {}", num, plus-one::calc(num));
        }
        ```
    4. 运行指定模块
        ```bash
        cargo build        # 生成 Cargo.lock & /target
        cargo run -p adder # 指定运行 adder 模块
        ```

- 工作空间测试

    `cargo test` 将一次性运行所有模块中的测试，也可以通过 `-p [module]` 指定特定模块


## 4 并发

- Rust 标准库仅提供对 1:1 线程模型的支持

- 创建线程

    - 参数：Closure，当前线程执行的函数
    - 返回值：`JoinHandle` ，持有所有权

    ```rs
    let handle = thread::spawn(|| {
        for i in 1..10 {
            println!("{}", i);
            thread::sleep(Duration::from_millis(1));
        }
    });

    // do sth. @main thread

    handle.join().unwrap(); // 会阻塞 *当前线程*、直至被 join 的线程结束
    ```

- 使用其他线程的数据

    ```rs title="通过 move 转移值的所有权"
    let v = vec![1,2,3]; // 所有权 @main

    // 通过 move 来获得 v 的所有权
    let handle = thread::spawn(move || {
        println!("vec = {}", v);
    });

    // drop(v); // ⚠️ 所有权已经转移给 handle 线程了

    handle.join().unwrap();
    ```

### 消息传递

- 当 Channel 收发的任意端被丢弃时，Channel 关闭

- 创建 Channel

    - MPSC 支持 Mutile Producer + Single Consumer
    - `mpsc::channel` 返回 `(Sender, Recver)`

    ```rs
    use std::sync::mpsc;
    
    let (tx1, rx) = mpsc::channel();
    let tx2 = mpsc::Sender::clone(&tx1); // 克隆一个 Sender，实现 Multiple Producer
    thread::spawn(move || {
        let msg = String::from("Hi~");
        tx1.send(msg).unwrap(); // msg 的所有权已经转移
    }) 
    
    // recv() 会 *阻塞* 线程、直至有消息传入
    // try_recv() 会 *立即返回* Result<T,E>、仅当返回 Ok 时正常读取数据
    let recvMsg = rx.recv().unwrap();
    println!("Gor: {}", recvMsg);

    // 收到多条消息时，也可以通过下列代码进行遍历
    for recvMsg in rx { }
    ```

- 基于互斥锁共享内存

    - `Arc<T>` 类似于 `Rc<T>`，但实现了 *原子引用计数*，可以用于并发场景

    ```rs
    use std::sync::{Mutex, Arc};

    let counter = Arc::new(Mutex::new(0)); // 创建被保护的数据
    let mut handles = vec![];

    for _ in 0..10 {
        let counter = Arc::clone(&counter);
        let handle = thread::spawn(move || {
            let mut num = counter.lock().unwrap(); // 获取互斥锁
            *num += 1;
        })
        handles.push(handle);
    }

    for handle in handles {
        handle.join().unwrap();
    }

    println!("Res: {}", *counter.lock().unwrap());
    ```

## 5 高级特性

### Unsafe

- Unsafe Rust 不强制保证内存安全，通过 `unsafe` 关键字进行切换
- Unsafe Mode 支持执行以下 4 类操作

    1. 解引用原始指针

        - 可以在 unsafe block 外创建，但<u>只能在 unsafe block 内解引用</u>
        - 包含可变的 `*mut T` & 不可变的 `*const T`，此处的 `*` 是类型名的一部分
        - 支持一份数据同时拥有 **可变+不可变** 指针，或同时拥有 **多个可变指针**
        - 无法保证指向的内存合理（允许为 Null）、不实现自动清理

        ```rs
        // 同时创建 可变&不可变 指针
        let mut num = 5;
        let ptr1 = &num as *const i32;
        let ptr2 = &mut num as *mut i32;
        // 创建一个内存地址合理性位置的原始指针
        let addr =0x012345usize;
        let ptr = addr as *const i32;

        unsafe {
            println!("ptr1 = {}", *ptr1);
            println!("ptr = {}",  *ptr); // 编译不报错，运行时可能 panic
        }
        ```

    2. 调用具有 unsafe 关键字的函数和方法
    3. 访问、修改 **可变静态变量**

        - 全局/静态变量（static）
            - 声明时需标注类型，命名遵循 Screaming_Snake_Case
            - 仅支持 `'static` 声明周期的引用（无需显式标注）
            - 具有 **固定内存地址**，访问时 **总能得到相同数据**
            - 支持 *可变*，但对可变全局变量进行 访问/修改 的操作是 unsafe 的
  
        ```rs
        static &mut COUNTER: u32 = 0;
        fn inc_counter(inc: u32) {
            unsafe { COUTE += inc; }
        }
        unsafe { println!("counter = {}", COUNTER); }
        ```

    4. 实现 Unsafe Trait

        ```rs
        unsafe trait Foo {}
        unsafe impl Foo for i32 {}
        ```

- 为 unsafe 代码创建安全抽象

    ```rs title="不需要将包含 unsafe block 的函数标记为 unsafe"
    """在指定位置切割数组"""
    fn split_at_mut(slice: &mut [i32], mid: usize) => (&mut [i32], &mut [i32]) {
        let len = slice.len(); assert!(mid <= len);
        let ptr = slice.as_mut_ptr();
        unsafe {
            (
                slice::from_raw_parts_mut(ptr, mid), // 起始位置 ptr + length
                slice::from_raw_parts_mut(ptr.add(mid), len-mid),
            )
        }
    }
    ```

- `extern`
  
    - 调用外部代码（比如说 C 语言编写的）

        所有的 `extern` 函数都是 unsafe 的 => Rust 编译器无法检查其安全性

        ```rs
        // 指定 ABI（汇编层面的接口）为 C
        extern "C" { fn abs(ipt: i32) -> i32; }
        unsafe {
            println!("Absolute val of -3 is {}", abs(-3));
        }
        ```
    - 创建 extern 接口，支持其他语言进行调用

        ```rs
        #[no_mangle]                     // 避免在编译时改变名称
        pub extern "C" fn call_by_c() {} // 指定 ABI 为 C
        ```

### 高级 Trait

#### 占位类型

!!!info "泛型 x 关联类型"
    - "泛型" 必须在 **实现Trait** 时标注具体类型，可以为同一 struct 多次实现不同类型的具体 trait
    - "关联类型" 无需标注具体类型，无法为单个 struct 多次实现同一具体 trait

```rs title="定义 trait 时，使用 '关联类型' 指定占位类型"
pub trait Iterator {
    type Item;  // 这个就是关联类型（类型占位符）
    fn next(&mut self) -> Option<Self::Item>;
}
```

#### 运算符重载

Rust **不支持** 自定义运算符 / 重载任意运算符，但可以通过实现 `std::ops` 中的 trait 实现部分功能

```rs
use std::ops::Add;

struct Meters(u32);
struct Miilimeters(u32);

impl Add<Meters> for Millimeters {
    type Output = Millimeters;
    fn add(self, other: Meters) -> Millimeters {
        return Milimeters(self.0 + (other.0 * 1000));
    }
}
```

#### 完全限定语法

```rs
trait Animal { fn call_name() -> String; }

struct Dog;
impl Dog {
    fn call_name() -> String { String::from("Dog") }
}
impl Animal for Dog {
    fn call_name() -> String { String::from("Puppy") }
}

Dog::call_name();              // "Dog"
Animal::call_name();           // ⚠️ 报错，不知道具体调用哪一个
<Dog as Animal>::call_name();  // "Puppy" 通过”完全限定语法“调用同名函数
```

#### Super Trait

需要在 Trait A 中使用 Trait B 提供的功能 => Trait B 即为 Trait A 的 Super Trait

```rs title="trait [CurTrait]: [SuperTrait]"
use std::fmt
trait PrintOutline: fmt::Display {
    fn print_outline(&self) {
        let output = self.to_string(); // 需要实现 fmt::Display
    }
}
```

### New Type

#### 为外部类型实现外部 Trait

Rust "仅当 Trait / 类型 在 **本地定义** 时，才能实现对应 trait" 的规则可以通过 NewType 模式绕过

```rs title="通过 Tuple Struct 构建一个新的（本地）类型"
use std::fmt;
 
struct Wrapper(Vec<String>); // 使用 Tuple Struct 包裹
impl fmt::Display for Wrapper {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "[{}]", self.0.join(", ")) // 使用 self
    }
}
```

#### 类型别名

只是同义词，<u>并非独立类型</u>

```rs
type Thunk = Box<dyn Fn() + Send + 'static>; // 只是为了少点字
fn takes_long_type(f: Thunk) {}

"""也可以拿来缩 Result<T,E> => 因为 E 是定死的"
type Result<T> = Result<T, std::io::Error>;
fn write(&mut self, buf: &[u8]) -> Result<usize>;
```

### 函数指针

> 将函数（指针）作为参数传递

```rs
""" 要求参数 f 符合 fn fName(_: i32) -> i32 {} """
fn do_twice(f: fn(i32)->i32, arg: i32) -> i32 {
    f(arg) + f(arg)
}
```

### 返回闭包

闭包必须使用 trait 进行表达、无法在函数中直接返回

> 但你可以返回一个实现了对应 trait 的具体类型

```rs
fn return_closure() -> Box<dyn Fn(i32) -> i32> {
    return Box::new(|x| x+1);
}
```

### 宏

> 使用 `macro_rules!` 定义的 “声明宏” 已被弃用 
 
- 宏必须在单独的包中被定义、并使用特殊的包类型
- 在工作空间中添加对应依赖

    ```toml title="Cargo.toml"
    ...

    [lib]
    proc-macro = true

    [dependencies]
    syn = "0.14.4"
    quote = "0.6.3"
    ```

1. 自定义宏：用于 `struct / enum`，可为指定的 derive 属性添加代码

    ```rs title="通过标注 #[derive(helloMacro)] 自动实现 helloMacro Trait"
    """ implement """
    extern crate proc_macro;
    use crate::proc_macro::TokenStream;
    use quote::quote;
    use syn;

    fn impl_hello_macro(ast: &syn::DeriveInput) -> TokenStream {
        let name = &ast.ident;
        // #name 会被自动替换为 var name 的值
        let gen = quote! {
            impl HelloMacro for #name {
                fn hello_macro() {
                    println!("Hello, Macro! #name = {}", stringify!(#name));
                }
            }
        }
        gen.into() // 转回 TokenStream
    }

    // 在用户标注 #[derive(HelloMacro)] 时自动调用
    #[proc_macro_derive(HelloMacro)]
    pub fn hello_macro_derive(ipt: TokenStream) -> TokenStream {
        let ast = syn::parse(ipt).unwrap();
        impl_hello_macro(&ast);
    }

    """ usage """
    use hello_macro::HelloMacro;
    use hello_macro_derive::HelloMacro;

    #[derive(HelloMacro)]
    struct Pancake;

    Pancake::hello_macro();
    ```

2. 类属性宏：在任意条目上添加自定义属性

3. 类函数宏：操作被指定为参数的 token 

## 6 Sample 
### Simple Grep

- 功能：在指定文件中搜索包含指定字符串的行

- 输入：`cargo run targetStr fileName`

- Rust 一般会把具体的业务逻辑丢在 `lib.rs` 里，`main.rs` 一般仅包含：

    - 命令行参数解析逻辑
    - 一些配置内容
    - 调用 `lib.rs` 的 `run()` 函数及其错误处理

```rs title="lib.rs"
use std::{
    env, fs, error:Error
};

pub fn run(conf: Config) -> Result<(), Box<dyn Error>> {
    // 读取文件
    let contents = fs::read_to_string(conf.filename)?; // 寄了不会直接 panic，而是丢给 caller 处理

    // 搜索潜在行
    for line in search(&conf.query, &contents) {
        println!("{}", line);
    }
    Ok(());
}

pub struct Config {
    pub query: Srting, pub filename: String,
    pub case_sensitive: bool
}
impl Config {
    pub fn new(mut args: std::env::Args) -> Result<Config, &' static str> {
        args.next();   // 第一个参数没有用
        let query =    match args.next() {
            Some(arg) => arg,
            None => return Err("Without Query String")
        };
        let filename = match args.next() {
            Some(arg) => arg,
            None => return Err("Without File Name")
        };
        // 读环境变量 => 只检查是否定义、不管具体的值
        let case_sensitive = env::var("CASE_INSENEITIVE").is_err();

        Ok(Config {query, filename, case_sensitive})
    }
}

// 返回结果只和 contents 挂钩
pub fn query<'a>(sensitive: bool, query: &str, contents: &'a str) -> Vec<&a' str> {
    if !sensitive {
        let query = query.to_lowercase();
    }

    contents.lines()
        .filter(|line| {
            if !sensitive {
                line.to_lowercase.contains(query)
            } else {
                line.contains(query)
            }
        })
        .collect()
}



// 测试用例
#[cfg(test)]
mod test {
    use supper::*;
    
    #[test]
    fn one_res() {
        let query = "duct";
        let content = "\
just line one
productice.
just line three
        "
        assert_eq!(
            vec!["productice."],
            search(query, content)
        )
    }
}
```

```rs title="main.rs"
use proj::Config;
use std::{
    env, process
};

fn main () {
    // 读取命令行参数: [/path/to/binExe, arg1, arg2, ...]
    let conf = Config::new(env::args())
        .unwrap_or_else(|err| {                       // 不如 js 的箭头函数 ...
            eprintln!("Fail to parse args: {}", err); // 将标准错误（console）和标准输出（文件）分离
            process::exit(1);
        });
    println!("Searching for {}, in f ile: {}", conf.query, conf.filename); 

    if let Err(e) = proj::run(conf) { // 错误处理
        eprintln!("Fail to handle file: {}", e);
        process::exit(1);
    }
}
```

### Web Server

!!!warning "有点迷，可以不用看"

该 Sample 实现了一个支持以下功能的 Web 服务器：
- 可以在 Socket 上监听 TCP 连接
- 支持解析部分 HTTP 请求、并返回 HTTP 响应
- 提供多线程支持
- 支持停机和清理

```rs title="lib.rs"
use std::sync::{mpsc, Arc, Mutex};
use std::thread;

trait FnBox { fn call_box(self: Box<self>); }
impl<F: FnOnce()> FnBox for F {
    fn call_box(self: Box<F>) { (*self)() }
}

enum Msg {
    NewJob(Job),
    Shutdown,
}

struct Job;
type Job = Box<FnBox + Send + 'static>;

pub struct ThreadPool {
    workers: Vec<Worker>,
    sender:  mpsc::Sender<Msg>,
}
impl ThreadPool {
    pub fn new(size: usize) -> ThreadPool {
        assert!(size > 0);
        // 需要多个线程共享一个 recver
        let (sender, recver) = mpsc::channel();
        let recver = Arc::new(Mutex::new(recver));

        let mut workers = Vec::with_capacity(size);
        for id in 0..size {
            workers.push(Worker::new(id, Arc::clone(&recver)));
        }

        ThreadPool { threads, sender }
    }
    pub fn execute<F>(&self, f: F)
    where
        F: FnOnce() + Send + 'static, // 跟着 thread::spawn 走
    {
        let job = Box::new(F);
        self.sender.send(Msg::NewJob(job)).unwrap();
    }
}
""" 清理 """
impl Drop for ThreadPool {
    fn drop(&mut self) {
        // 逐个关停线程
        for _ in &mut self.workers {
           self.sender.send(Msg::Shutdown).unwrap();
        }
        println!("Shut down ALL workers");
        
        // 确保所有 worker 关停后，主线程关闭
        for worker in &mut self.workers {
            println!("Work[{}] has shutdown", worker.id);
            // 需要拿到所有权
            if let Some(t) = worker.thread.take() {
                t.join().unwrap();
            }
        }
    }
}

struct Worker {
    id: usize, thread: Option<thread::JoinHandle<()>>,
}
impl Worker {
    fn new(id: usize, recver: Arc<Mutex<mpsc::Receiver<Msg>>>) -> Worker {
        let thread = thread::spawn(move || loop {
            """ Bug: thread 干完了才会释放 mutex，所以永远只有一个 thread 在工作 """
            let msg = recver.lock().unwrap().recv().unwrap();
            match msg {
                Msg::NewJob(job) => {
                    println!("Worker[{}] got a job", id);
                    job.call_box();
                },
                Msg::Shutdown => {
                    println!("Shut down worker[{}]", id);
                    break;
                }
            }
        });
        Worker { id, thread: Some(thread) }
    }
}
```

```rs title="main.rs"
use std::fs;
use std::io::prelude::*;
use std::net::{TcpListener, TcpStream};
use std::thread;
use std::time::Duration;

use my_crate::ThreadPool;

fn main() {
    let listener = TcpListener::bind("127.0.0.1:8000").unwrap();
    let pool     = ThreadPool::new(4);
    // 依次处理每个连接请求（ take(2) 表示只处理前两个）
    for stream in listner.incoming().take(2) {
        let _stream = stream.unwrap(); 
        pool.execute(|| {
            handle_connect(stream);
        })   
    }
    println!("Server Shut down");
}

fn handle_connect(mut stream: TcpStream) {
    let mut buffer = [0; 512];
    stream.read(&mut buffer).unwrap();
    
    // 判断请求路径
    let index = b"GET / HTTP/1.1\r\n";
    let sleep = b"GET /sleep HTTP/1.1\r\n";
    let (status, file) = \
    if buffer.starts_with(index) {
        ("HTTP/1.1 200 OK\r\n\r\n", "index.html")
    } else if buffer.starts_with(sleep) {
        thread::sleep(Duration::from_secs(5));
        ("HTTP/1.1 200 OK\r\n\r\n", "index.html")
    } else {
        ("HTTP/1.1 404 NOT FOUND\r\n\r\n", "404.html")
    }

    // 响应：返回本地的 HTML 文件
    let contents = fs::read_to_string(file).unwrap();
    let response = format!("{}{}", status, contents);
    stream.write(response.as_bytes()).unwrap();
    stream.flush().unwrap(); // 阻塞，直至所有 bytes 被成功写入
}
```