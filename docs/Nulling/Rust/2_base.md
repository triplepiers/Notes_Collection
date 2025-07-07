# 一些基础语法

## Sample：猜测随机数

### 标准 I/O 操作

其实在 Hello World 中，我们已经掌握了使用 `println!` 宏进行输出的方法

在这个小 sample 中，我们将学习如何调用标准I/O库对输入进行读取

```rust
use std::io;   // 调用标准I/O库

let mut guess = String::new();    // ::fn() 表示这是一个属于类（而非实例）的静态方法
io::stdin()
    .read_line(&mut guess)
    .expect("无法读取行");          // 异常处理

println!("You guess: {}", guess); // {} 是输出占位符
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

### 完整程序示例

```rs
use std::io;
use std::io::Write;
use std::cmp::Ordering;
use rand::Rng;

fn main() {
    // 生成随机数 [1,100]
    let secret_num = rand::thread_rng()
        .gen_range(1,101); // 默认为 i32，但可以自动推断为 u32

    // 死循环啊家人们
    loop {
        // 不换行打印
        print!("Guess a number between [1,100]: ");
        let _ = io::stdout().flush();     // 标准输出遇到 \n 才会自动输出

        // Get Input
        let mut ipt = String::new();
        io::stdin()                       // io::Result 为 {OK, Err} 枚举类型
            .read_line(&mut ipt)          // 引用默认也是不可变的 ...
            .expect("[Error] Fail to read input");

        // Shadiwing: String => Number
        let ipt:u32 = match ipt.trim().parse() {
            Ok(num) => num,
            Err(_) => continue            // 直接用 expect 会崩溃性退出
        };
        
        // Compare
        match ipt.cmp(&secret_num) {
            Ordering::Less => println!("Too Small !!!"),
            Ordering::Greater => println!("Too Big !!!"),
            Ordering::Equal => {
                println!("You Win ~");
                break;
            }
        }
    }
}
```

## 1 变量与常量

### 变量
- 命名遵循 snake case 规范（全小写、通过 `_` 分隔）
- 通过 `let` 关键字进行声明，且默认为 **不可变**
- 如需声明可变变量，请在声明时附加 `mut` 关键字

```rs title="奇妙sample"
let x = 5;
let y = {      // 创建块表达式 = 最后一个表达式的值
    let x = 1; // 这是语句
    x+3        // 这是表达式（结尾没有 ;）
};             // y = 1+3 = 4
```

### 常量
- 通常使用 *全大写* 字母命名，不同单词间通过 `_` 分隔
- *不允许* 使用 `mut` => 它永远不可变
- 必须使用 `const` 关键字声明、且进行 *显示类型标注*
- 可以在 *任何* 作用域中声明（包括全局作用域），且在程序运行期间于作用域中一直有效
- 只能绑定到 *常量表达式*（无法被 函数调用结果 / 运行时计算结果 赋值）  

!!!note "常量 != *不可变* 变量"
    
### Shadowing

Rust 支持通过 **相同变量名** 声明新变量（可以与旧变量 *类型不同*），同时隐藏旧的同名变量

!!!note "Shadowing != `mut`"
    - 如果不使用 `let` 关键字（Shadowing），对非 `mut` 变量赋值会导致编译错误
    - 使用 Shadowing 声明的新变量也是 **不可变** 的

### 数据类型

#### 标量类型

!!!info "数值运算：加减乘除-取余 = `+-*/%`"

1. 整数
    - 无符号以 `u` 开头，有符号以 `i` 开头
    - 支持 `[8, 16m 32, 64, 128]` bit +  `(isize, usize)`，后者由计算机架构决定
    - 字面值: 除 `Byte` 外都可以使用类型后缀（如 `57u8`）、默认为 `i32`

        | 进制 | Sample |
        | :--:| :------ |
        | Decimal | `98_222` 增强可读性 |
        | Hex | `0xff` |
        | Octal | `0o77` |
        | Binary | `0b1010_1100`|
        | Byte(`u8`) | `b'A'` |

    - 溢出
        - 在调试模式下，Rust 会自动检查整数溢出 + 报 panic
        - 在发布模式下，Rust *不会检查*，并在发生溢出时进行 `round`（不会报 panic）

1. 浮点: 支持 IEEE-754 标准下的 `(f32, f64)`，默认为 `f64`
2. 布尔: 经典 `T/F`，占 1 Byte
3. 字符 `char`: 使用 `'` 包裹、占 4 Byte，为 Unicode 标量

#### 复合类型

1. Tuple: 长度固定（声明后无法改变）

    ```rs
    let tup: (i32, f64, u8) = (500, 6.4, 1);

    // 下标访问（从 0 开始）
    println!("{}", tup.0); 
    // 解构
    let (x, y, z) = tup;
    ```

2. Array: 元素类型一致、**长度固定**，存放在 Stack

    > 没有长度可变的 `Vector` 灵活

    - 可以通过下标访问，越界时 *编译通过*、但在运行时报 panic

    ```rs
    let arr = [1,2,3];
    // 也可以显示声明 [类型;长度]
    let arr: [i32; 4] = [1,2,3,4];
    // 如果元素全部相等，可以通过 [val;len] 进行批量赋值
    let arr: [0;5]; // => arr = [0,0,0,0,0];
    ```

#### 字符串

1. 字符串字面量：程序里已经写死的字符串值（内容会被硬编码至可执行文件），不可变
2. String 类型：能在编译时存储长度未知的文本，可变

    在 Stack 上由三部分组成、实际文本内容放在 Heap 上
     
    1) `ptr` 指向内存地址 

    2) `len` 实际长度 (字节数) 

    3) `capacity` 最大容量 (从 OS 毛来的空间大小)

    ```rs
    let mut s = String::from('hello'); // 基于字面值初始化
    s.push_str(" World!");             // 再往后面塞点东西
    ```

## 2 函数

- 通过 `fn` 关键字进行声明、命名遵循 snake case 规范

- 声明位置可以位于 *调用位置之后*

    ```rs
    // 下面不会报错（那很友善了）
    fn main() { f(); }
    fn f() { println!("Another Func"); }
    ```

- 函数签名中必须显式声明 *每个形参的类型* 
- 默认使用函数体中最后一个 *表达式* 作为返回值，类型在 `->` 后声明

    ```rs
    fn plus_five(x: i32) -> i32 {
        x+5 // 不能加分号
    }
    ```

    - 你也可以提前通过 `return` 关键字返回

    - 还可以返回一个 Tuple

        ```rs
        fn calc_len(s: String) -> (String, usize) {
            let l = s.len();
            (s, l)
        }
        ```

## 3 控制流

#### 分支
  
- IF/IF_ELSE: 

    - 条件必须为 `bool` 类型（不会自动转换），但不用套 `()`
    - 因为 IF 是一个表达式，你也可以把它丢到 `let` 的右侧

    ```rs
    if      num<5 {}
    else if num>5 {}
    else          {}

    let num = if cond {5} else {6}; // 但这俩值的类型必须兼容
    ```

#### 循环

> 熟悉的老三套（LOOP, WHILE, FOR）

```rs
loop {
    if cond { break; }
    else    { continue; }
}

while num != 0 { num = num-1; }

// FOR 一般拿来遍历数组
let arr = [1,2,3,4,5];
for ele in arr.iter() { println!("{}", ele); }
// 你也可以用来遍历 Range（左闭右开）
for ele in (1..4).rev() {} // 生成的 range = [3,2,1]
```

## 4 所有权 🌟 

!!!info "把数据 **存** 在 Stack 上要比存在 Heap 上快得多"
    - 在 Stack 上，操作系统不需要搜索空间 => 直接放在栈顶就行
    - 在 Heap 上，OS 需要先找到一块足够大的空间，并更新相关记录以便进行下次分配

!!!info "在 Stack 上 **访问数据** 要比 Heap 快得多"
    Heap 中的数据必须通过指针访问


- Rust 基于所有权系统管理内存，这一 feature 使得 Rust 无需进行 GC 即可保证内存安全
    
- 该系统包含一组在 *编译* 时检查的规则、在 *运行* 时不会产生任何额外开销

    1. 每个值都有且仅有一个所有者（对应的变量）
    2. 当所有者超出作用域名时，删除值

- 所有权系统解决了以下问题：
  
    1. 代码的哪些部分正在使用 Heap 上的哪些数据
    2. 最小化 Heap 中存储的重复数据
    3. 清理 Heap 上未使用的数据，以避免空间不足

### 关于变量

!!!info "Rust *不会自动创建 Deep Copy*，任何自动赋值都是廉价的"

- Copy Trait: 两个变量的值均在编译时确定，所以会有 *两个* 5 被压进 Stack

    - 所有的 整数、布尔、字符 都具有该特性
    - 若 Tuple 内仅包含上述类型的数据，则也具备该特性

    ```rs
    let x = 5;
    let y = x;
    ```

- Drop Trait: `s2` 占用了 `(ptr,len,capacity)`（发生 Move）

    所有需要 分配内存/资源 的类型都具有该特性

    ```rs
    let s1 = String::from('test');
    let s2 = s1; // 此时 s1 失效（只能有一个所有者）
    ```

### 关于函数

类似的，在 将实参传递给函数/创建返回值 时，这些值将发生 Copy/Move

```rs
fn test(a: i32, b: String) {
    // a 是 Copy, 修改不会影响原来的
    // b 是 Move
}

let x = 5;
let y = String::from('test');
test(x, y);             // 可以换成 test(x, y.clone()) 进行显式 copy
println!(f"y = {}", y); // ⚠️ y 已经不再拥有所有权
```

???info "String 所有权反复横跳"
    ```rs
    fn main() {
        let mut out = String::from("Hello");
        out = take_over(out);
        println!("Then, out: {}", out); // => Hello_Side
    }

    fn take_over(mut inn: String) -> String {
        println!("inn: {}", inn);
        inn.push_str("_Side");
        return inn;                    // 归还所有权
    }
    ```
    
???info "奇怪特性"
    ```rs
    fn main() {
        let out = String::from("Hello"); // 这里实参没有 mut
        out = take_over(out);
    }

    fn take_over(mut inn: String) {     // 形参必须有 mut（要执行 push_str）
        println!("inn: {}", inn);
        inn.push_str("_Side");          // 还真给改了
    }
    ```

### 引用与借用

> 手动把 Move 类的所有权传来传去有点呆，有没有什么好的解决方案呢

- 引用：允许使用某些值而不取得所有权（创建了一个指向原变量的指针）

    ```rs
    let s1 = String::from('tt');
    let len = get_len(&s1);           // 这里传引用

    fn get_len(s: &String) -> usize { // 注意形参
        s.len()
    }
    ```

- 引用 *默认* 是不可变的，但也可以通过 `mut` 手动指定

    ```rs
    let mut s1 = String::from('tt');      // 本体能变
    let len = get_len(&mut s1);           // 创建可变的引用
    fn get_len(s: &mut String) -> usize { // 塞在 & 后面
        s.push_str("_222");
        s.len()
    }
    ```

    - *同一作用域* 内，每份数只能有 *一个可变* 引用（避免数据竞争）
    - 可以通过创建新的作用域进行规避

        ```rs
        let mut s = String::from('t');
        {
            let s1 = &mut s;
        }   // 这时候 s1 已经噶了
        let s2 = &mut s;
        ```

    - 无法同时拥有 可变-不可变引用（意义冲突）、但可以同时存在多个不可变引用

        ```rs
        let mut s = String::from('t');
        let s1 = &s;
        let s2 = &s;
        let s3 = &mut s;  // ⚠️ 那 s 是变还是不变啊
        ```

- Dangling Ref 悬空引用：Rust 编译器会直接报错

    ```rs
    let r = dangle();
    fn dangle() -> &String {
        let s = String::from('sth');
        &s
    } // ⚠️ 此时 s 被清理、&s 指向悬空位置
    ```

### 切片

- Slice 也是一种 *不取得所有权* 的数据类型
- 本质是指向 String 中 *部分内容* 的引用，但只有 `(ptr, len)` 值

    ```rs
    let s = String::from("Hello World");
    let hello = &s[0..5]; // 也可以写成 [..ed] / [bg..] / [..]

    fn first_word(s: &String) -> &str { // 返回的是切片
        let bytes = s.as_bytes(); // arr<u8>
        for (i, &item) in bytes.inter().enumerate() {
            if item == b' ' { return &s[..i]; }
        }
        &s[..];
    }

    // 但一般会直接使用 字符串切片 作为形参类型（可以兼容 String & &str 类型的实参）
    fn find(s: &str) {}
    let s1 = String::from("xxxx"); // => find(&s1[..]) 创建整个 String 的切片
    let s2 = "yyyy";               // => find(s2)      直接往里一丢
    ```

- 字符串字面值实际上也是切片（数据直接被存储在二进制程序中）

    ```rs
    let s = "Hello"; // s is &str
    ```