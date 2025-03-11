# 一些基础语法

## Sample：猜测随机数

### 标准 I/O 操作

其实在 Hello World 中，我们已经掌握了使用 `println!` 宏进行输出的方法

在这个小 sample 中，我们将学习如何调用标准I/O库对输入进行读取

```rust
use std::io;   // 调用标准I/O库

// 定义一个 变量（mut），通过 String 类提供的方法进行初始化
// ::fn() 表示这是一个属于类（而非实例）的静态方法
let mut guess = String::new();
// 读取整行输入（需要传址），expect 用于处理异常
io::stdin().read_line(&mut guess)
.expect("无法读取行");

// {} 是输出占位符
println!("You guess: {}", guess);
```

### 生成随机数
> rand 居然不在标准库里你信？

首先，你需要用 Cargo 配置依赖。具体表现为，在 `Cargo.toml` 下增加以下信息：

```
[dependencies]
rand = "^0.3.14"   // 包名 = "版本", ^ 表示任何与指定版本兼容的版本
```

> 其实也可以直接在项目目录下 `cargo add rand`

然后你就可以调库生成随机数了：

```rust
use rand::Rng; // 类似于 Java 的接口，内含很多方法

// 生成一个属于 [1, 101) 范围内的常量
// 旧版本的参数书写方式是 gen_range(1, 101)
let secret = rand::thread_rng().gen_range(1..101); 
```

### 大小比较
> 感觉这块的语法也相当的啰嗦

```rust
use std::cmp::Ordering; // 引入枚举类

// 生成的随机整数为 u32 类型，而读取的输入为 String 类型，此处需要转换
let guess:u32 = guess.trim().parse()
.expect("不能转换为整数");

// cmp() 方法要求传址，返回结果是 Ordering => 你可以进行多分支讨论
match guess.cmp(&secret) {
    Ordering::Less => println!("Too Small"),
    Ordering::Equal => println!("Equal"),
    Ordering::Greater => println!("Too Large"),
}
```

### 死循环与异常处理

`loop {}` 结构体可以实现死循环，你可以使用 `contine/break` 控制语句前进；

这种循环只通过 `Ctrl+C` 强制退出 / 触发异常使得程序强制停止。

---

在上面的语句中，我们通过 `.expect()` 处理异常 => 但这仍会引发程序终止；

而采用下述方法则能很好的处理异常，并使得程序继续运行：

```rust
// 由于 parser() 会返回 Ok/Err，你可以通过以下方式进行处理：
let guess:u32 = match guess.trim().parse() {
    Ok(num) => num,      // 返回 parse 结果
    Err(_)  => continue, // _ 为通配符
}
```

## 1 变量与常量

- Rust 中的可变性由 `mut` 关键字决定：

    ```rust
    let x = 5;     // 常量
    let mut x = 5; // 变量
    ```