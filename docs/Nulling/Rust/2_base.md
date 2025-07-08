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
        let ipt:i32 = match ipt.trim().parse() {
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
2. String 类型：能在编译时存储长度未知的文本，可变（本质是对 `Vec<u8>` 的包装）

    在 Stack 上由三部分组成、实际文本内容放在 Heap 上
     
    1) `ptr` 指向内存地址 

    2) `len()` 实际长度 (字节数)

    3) `capacity` 最大容量 (从 OS 毛来的空间大小)

    ```rs
    // 创建
    let mut s = String::new();         // 空的
    let s = "sth".to_string();         // 只要实现了 Display trait 的都能用
    let mut s = String::from('hello'); // 基于 字面值 初始化

    // 更新
    s.push_str(" World!" / &str);      // 往后面塞字符串切片
    s.push('a');                       // 往后面塞 char
    let s = s1 + &s2;                  // 拼接，后面那个需要是引用 (s1 不能用，但 s2 还能用)
    let s = format!("{}-{}-{}", s1, s2, s2);   // 返回一个新串（s1~s3 都可以继续用）

    // 遍历访问（不支持索引）：bytes() chars() 但这俩都不太对，字型簇又不提供
    // 切割：切片 &s[..] 是按 byte 切的、可能切到半个字然后报 panic
    ```

#### Struct

- Struct 实例拥有其所有数据的所有权，只要实例有效、字段一定有效

    > 有生命周期时，字段值也可以是引用（保证 struct 有效时、引用一定有效）

    - Struct 定义：可以用 `pub struct` 声明为公共（但字段仍是私有的）

        ```rs
        // 就是简单的把一些属性拼在一起（最后没有分号）
        struct User {
            username: String,
            email:    String,
            account:  u64,
            active:   bool,  // 这里也有逗号
        }
        ```
    
    - 实例化

        ```rs
        /* 实例化时，需要为 *每一个* 字段指定值（顺序随意）
        * 当 struct 实例可变时，所有属性 *均可变* => 无法对单个属性进行指定
        */
        let mut usr1 = User {
            email:    String::from("e@addr"),
            username: String::from("John"),
            active:   true,
            account:  556,   // 这里也有逗号
        };

        // 可以通过 .attribute 访问 & 赋值
        usr.active = false;
        ```

    - 塞给函数
        ```rs
        // 可以作为函数返回值
        fn build_usr(email: String, username: String) -> User {
            User {
                email, username,         // 变量名与属性名一致时，可以简写 
                active: true, account: 0,
            }
        }

        struct Rectangle { width: i32, length: i32, }
        // 使用引用作为形参 => 原变量将保有所有权
        fn area(rect: &Rectangle) -> u32 { rect.width * rect.length }
        ```

    - 更新语法：基于已有实例新建

        ```rs
        let usr2 = User {
            email:    String::from("neo@addr"),
            username: String::from("Doe"),
            ..usr1    // 剩下字段沿用 usr1
        };
        ```

    - 结构体方法：需要在 `impl` 块内定义，第一个参数是 `self`（也可以是引用）

        在调用时，Rust 会自动添加 `&, &mut, *`，所以 `r.area() == (&r).area()`

        ```rs
        // 直接 println!("{}", rect) 会报错，需要加 trait / 手动实现
        #[derive(Debug)]    // {:?} = structName { attr: val } , {:#?} = 在 attr 间换行
        struct Rectangle {}

        impl Rectangle {
            fn can_hold(&self, r2: &Rectangle) -> bool {
                self.width > r2.width && self.length > r2.length
            }

            // getter (因为属性默认是私有的)
            pub fn width(&self) -> i32 {
                slef.width
            }
        }

        // 需要通过实例调用
        r1.can_hold(&r2);
        ```

    - 关联函数：在 `impl` 块内定义，但第一个参数不是 `self`（一般用于构造函数）

        ```rs
        impl Rectangle {
            // 构造函数，同时验证 a>0
            pub fn new_square(a: i32) -> Rectangle {
                if a < 0 { panic!("Less than 0"); }
                Rectangle { width: a, length: a}
            }
        }
        // 有点像静态方法，通过 :: 调用
        let sq = Rectangle::new_square(10);
        ```

- Tuple Struct：整体有名字，但里面的元素没有属性名

    ```rs
    struct Color(i32, i32, i32);  // 没必要为 RGB 单独取名
    struct Point(i32, i32, i32);
    // black 和 origin 是 *不同类型*（不同 tuple struct 的实例）
    let black = Color(0, 0, 0);
    let origin = Point(0, 0, 0);
    ```

- Unit-Like Struct：没有任何字段，长得像 `()`

    用于在特定类型上实现 trait，但有没有需要存的东西

#### 枚举

- Enum：

    - Rust 允许为枚举定义不同的数据类型，也可以在 `impl` 块中为其实现方法
    - 可以通过 `pub enum` 声明为公共的、此时所有变体 *都是公共的*

    ```rs
    enum IpAddr {
        V4(u8, u8, u8. u8),
        V6(String),
    }

    let home =     IpAddr::V4(127,0,0,1);
    let loopback = IpAddr:V6(String::from("::1"));

    // 你甚至可以往里面嵌 struct
    struct IpV4Addr {}
    struct IpV6Addr {}
    enum IpAddr {
        V4(IpV4Addr), V6(IpV6Addr),
    }
    ```

- Option：用于描述某个值可能存在的类型 + 不存在的情况

    - 在预导入模块里，你可以直接使用 `Option<T>, Some(T), None`
    - `Option<T> != T`，确保 `T` 类型一定非空

    ```rs
    enum Option<T> {
        Some(T), None,
    }

    let some_num = Some(5);          // i32
    let abs_num: Option<i32> = None; // 没法自动推断
    ```

#### Vector `Vec<T>`

在内存中连续存储多个 *相同类型* 的值（但你可以套一个 Enum 逃课）

```rs
// 创建
let mut v: Vec<i32> = Vec::new(); // 创建空 Vec，需要手动指定类型
let v = vec![1,2,3];

// 更新
v.push(1);

// 访问（下标 / get）
println!("{}", v[0]);  // OOB 会报 panic => 也可以定义借用 &v[0]
match v.get(0) {
    Some(v0) => println!("{}", v0);
    None => println!("Out Of Bound")
}

// 遍历 + 可变引用更新
let mut v = vec![...];
for i in &mut v {
    *i += 50;
}
```

#### HashMap

- 存储在 Heap 上的键值对，但单条数据同构
- 实现 Copy Trait 的会复制一份，有所有权的会抢走+移动值（可以通过插入引用避免）

```rs
use std::collections::HashMap;

// 手动插值
let mut scores: HashMap<String, i32> = HashMap::new();
scores.insert(String::from("aaa"), 32);

// 通过 collect 基于两个 arr 创建
let keys = vec![String::from("a"), String::from("b")];
let vals = vec![10, 20];

let scores: HashMap<_, _> = // 可以推断，但 collect 可能返回多种类型、所以至少要指定 HashMap
    keys.iter().zip(vals.iter()).collect;

// 访问: 需要手动处理 key 不存在的情况
let score = scores.get("ccc");
match score {
    Some(s) => println!("{}", s),
    None    => println!("None"),
}

// 遍历（使用引用的话，之后还能继续用）
for (k, v) in &scores {}

// 更新
scores.insert(String::from("aaa"), 64);    // 覆盖原来的 32
let s = scores.entry("ccc").or_insert(50); // 仅当不存在时插入+返回新值引用，否则提供原 val 的可变引用
*s += 1;                                   // 存在时，v += 1
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

- MATCH: 必须穷举 **所有** 可能性（或用 `_ => ()` 作为兜底）

    ```rs
    #[derive(Debug)]
    struct State {}

    enum Coin { 
        Penny, Nickel, Dime, 
        Quarter(State), 
    }

    fn coin_2_value(coin: Coin) -> u8 {
        match coin {
            Coin::Penny   => 1,
            Coin::Nickle  => 5,
            Coin::Dime    => 10,
            Coin::Quarter(state) => {
                println!("from: {}", state);
                25
            },
        }
    }
    ```

    - 你也可以用来处理 `Option<T>` 里存在空值的情况
  
        ```rs
        fn plus_one(x: Option<i32>) -> Option<i32> {
            match x {
                None    => None,
                Some(i) => Some(i+1),
            }
        }
        ```

- IF LET: 只关心一种 case，其他放生

    ```rs
    let v = Some(3);

    if let Some(3) = v {
        println!("Got Three");
    } else {
        println!("Other");
    }
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

## 5 包与模块

感觉 Rust 的模块系统有点魔幻：

- Package（包）：
    - 是 Cargo 的特性，可以用于构建、测试、共享 crate
    - 包含 `Cargo.toml`，用于描述如何构建 Crates（如：导入外部依赖）
    - 可以拥有 0/1 个 LibCrate，但可以拥有任意个 binCrate（放在 `src/bin` 下）
- Crate（单元包）：
    > 或许可以认为是单个 Rust 文件？
    - 一棵模块树，可以生成 Lib / 可执行文件
    - 具有 binary / library 两种类型
    - Crate Root 是编译的入口文件，组成 Crate 的 根 Module
        - binCrate 的 root 默认为 `src/main.rs`
        - LibCreate 的 root 默认为 `src/lib.rs`
- Module-Use（模块）：
    - 在单个 Crate 内对代码进行分组，用于控制代码组织、作用域、私有 Path
    - 使用 `mod [ModName];` 时，会把 `src/ModName.rs` 中的代码全贴进来
    - 通过 `mod` 关键字定义、支持嵌套
    - 可以通过 `as` 为引入路径指定别名: `use std::io::Result as IoResult`
    - 可以通过 `pub use` 重新导出名称（默认是私有的）: `pub use crate::front_of_house::hosting`
    - 可以通过嵌套路径引入同前缀下的多个条目：

        ```rs
        use std::{cmp::Ordering, io};
        use std::io::{self, Write};  // 同时引入 std::io + std::io::Write
        use std::collections::*;     // 引一坨
        ```

- Path（路径）：用于为 struct、func、module 命名
    - 绝对路径：从 create root 开始，通过 crateName / 字面值 "crate" 访问
    - 相对路径：从当前 Module 开始，通过 self / super / Module 标识符 访问

!!!info "Rust 中的所有条目默认都是私有的"
    - 兄弟模块之间可以互相调用
    - 父模块 *无法使用* 子模块中的私有条目
    - 自模块可以使用所有 *祖先模块* 中的条目（因为套在上下文里面）

```rs title="main.rs"
fn test() {}

mod front_of_house { // 前台行为（private）
    pub mod hosting {
        pub fn add_to_waitlist() {} // 需要逐级暴露出去}
        fn seat_at_table()   {}
    }
    mod serving {
        fn take_oreder()  {}
        fn serve_order()  {}
        fn take_payment() {}
    }
    fn test() {
        crate::test();    // 绝对路径
        super::test();    // 相对路径（退一级）
    }
}

pub fn eat_at_restaurant() {
    // 绝对路径调用
    crate::front_of_house::hosting::add_to_waitlist();
    // 相对路径调用
    front_of_house::hosting::add_to_waitlist();
    /* 通过 use 引入后，相对路径可以更短一点
     * use crate::front_of_house::hosting => 也可以 use <相对路径>
     * hosting::add_to_waitlist(); 
     * 函数通常引用到父模块，struct/enum 通常引用到本体 */
}
```

## 6 错误处理

Rust 没有 try-catch 的机制

- `panic!`（不可恢复）：可以手动触发 `panic!("crash 4 fun")`
  
    - 默认：打印错误信息 -> 展开、清理调用栈 -> 退出程序
    - 也可以通过配置 `panic = 'abort'` 直接中断（此情况下内存由 OS、而非 Rust 清理）
    - 可以设置环境变量 `RUST_BACKTRACE=1` 定位具体报错的代码

- `enum Result<T, E>{ Ok(T), Err(E), }`(可恢复):
  
    - `main()` 也能返回 `Result<(), Box<dyn Err>>`，后者兜底了任何可能的错误类型
    - `T` 为操作成功时返回的类型，`E` 为失败时的返回类型
    - 需要通过 match 处理

        ```rs
        let f = File::open(file_url); // 返回 Result
        let f = match f {
            Ok(file) => file,
            Err(err) => match err.kind() { // 适配不同错误
                ErrorKind::NotFound => match File::create(file_url) {
                    Ok(fc) => fc,
                    Err(e) => panic!("Can't create {:?}", e),
                },
                other_e    => panic!("Can't open {:?}", other_e),
            },
        };
        ```

        - 通过 `unwrap` 改写：Ok 直接返回，Err 报 panic（信息不能自定义）
        - 通过 `expect` 改写：Ok 直接返回，Err 报自定义 panic

- 错误传播：返回 Result，Err 丢给 caller 处理

    ```rs
    fn read_file(file_url: &String) -> Result<String, io::Error> {
        let mut s = String::new();

        let mut f = match  File::open(file_url) {
            Ok(file) => file,
            Err(e)   => return Err(e),
        };
        
        return match f.read_to_string(&mut s) {
            Ok(_)  => Ok(s),
            Err(e) => Err(e),
        };
    }

    // 上面的一坨等价于
    fn read_file(file_url: &String) -> Result<String, io::Error> {
        let mut s = String::new();
        let mut f = File::open(file_url)?; // 这里有个问号
        f.read_to_string(&mut s)?;         // 这里有个问号
        Ok(s)
    }

    // 还有链式调用版本
    fn read_file(file_url: &String) -> Result<String, io::Error> {
        let mut s = String::new();
        File::open(file_url)?.read_to_string(&mut s)?;
        Ok(s)
    }
    ```

- 错误类型转换：`std::convert::From` 中的 `from()` 可以改变错误类型

    由 `?` 简化的错误会由 `from` 隐式转化为返回值中定义的错误类型（但必须实现对应类型的转化函数）

## 7 泛型，trait，生命周期

### 泛型

- 由编译器将 `T` 替换为具体数据类型（可以用其他复合 CamelCase 的名称）

- 泛型函数：

    ```rs
    // 因为涉及比较操作，所以 T 必须实现特定 trait
    fn max<T: std::cmp::PartialOrd + Clone>(list: [T]) -> &T {
        let mut maxx = &list[0];
        for item in list {
            if item > &maxx { maxx = item; }
        }
        maxx
    }
    ```

- 泛型结构体 (在 enum 中也能用)

    ```rs
    struct Point<T> {
        x: T, y: T,    // 必须类型一样
    }
    impl<T> Point<T> { // 针对所有类型实现
        pub fn x(&self) -> &T {
            &self.x
        }
        // 方法的泛型可以和结构题不一样
        fn mixup<V, W>(self, otehr: Point<V,W>) -> Point<T, W> {
            Point {
                x: self.x,
                y: other.y,
            }
        }
    }
    impl Point<i32> {  // 仅针对具体类型实现
        pub fn x(&self) -> &i32 {
            &self.x
        }
    }

    struct Point<T, U> {
        x: T, y: U,    // 类型可以不同   
    }
    ```

### Trait

- 只有方法的签名，没有具体实现
- 声明特定类型具有某种与其他类型共享的功能（有点像 JAVA 的空接口）
- 可以将 泛型 支持范围限制于 实现了特定行为的类型
- 跨 crate 使用时，需要同时引入 trait + 对应类型
- 当且仅当 类型/trait 中至少有一个在本地定义时支持实现（否则可能存在多个实现）

```rs
// 定义
pub trait Summary {
    fn summarize(&self) -> String;
    fn suma(&self) -> String {      // 默认实现
        self.summarize();           // 可以调兄弟（即使没有默认实现）
        String::from("Read more...")
    }
}

// 实现 trait
impl Summary for Tweet {
    fn summarize(&self) -> String {
        format!("{}: {}", self.usr, self.msg)
    }
    // 也可以手动重写 fn summa(&self) -> Srting {}
}
// 有条件的实现 Trait
impl<T: Display> toString for T {}

// 限制参数类型（同时实现 Summary & Display）
pub fn notify(item: impl Summary + Display) {}
pub fn notify<T: Summary + Dispay, U: Clone + Debug>(item1: T, item2: U) {} // 长
pub fn notify<T, U>(item1: T, item2: U) 
    where T: Summary + Display, 
          U: Clone + Debug, {}

// 限制返回值类型（但只能返回一种具体类型）
pub fn notify() -> impl Summary {}

// 有条件的实现方法
impl<T: Display+PartialOrd> Point<T> {
    fn cmp_display(&self) {}
}
```

### 生命周期

- "生命周期" 即 引用保持有效 的作用域，目标是避免 dangling ref

- 生命周期标注
    - 以 `'` 开头、全小写，放在引用符号 `&` 之后
    -  *不会* 影响引用的实际生命周期长度、只是描述不同生命周期之间的关系

- 函数的泛型生命周期参数

    函数返回 *引用* 时，返回值生命周期至少与一个参数匹配

    ```rs title="同时使用泛型 + 生命周期"
    // 'a 为 x&y 生命周期 *重叠* 的部分
    // 两个参数+返回值的生命周期 >= 'a
    fn longer<'a, T>(x: &'a str, y: &'a str, ann: T) -> &'a str
        where T: Display,
    {
        println!("Announce {}", ann);
        if x.len() > y.len() { return x; }
        else                 { return y; }
    }
    ```

- Struct 定义的生命周期标注：字段中存在引用

    生命周期标注也是 struct 类型的一部分

    ```rs
    struct Sample<'a> {
        part: &'a str,  // Part 活得要比 Sample 实例长
    }
    ```

    - 方法签名的生命周期标注（通常可以默认推导）

        引用和 struct 字段引用的生命周期绑定 / 独立引用

        ```rs
        // impl & structName 之后的 <'a> 不可省略
        impl<'a> Sample<'a> {}
        ```

- 静态生命周期 `static` == 整个程序的持续时间

