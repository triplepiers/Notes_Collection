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

    如需声明可变变量，请在声明时附加 `mut` 关键字

    ```rs title="奇妙sample"
    let x = 5;
    let y = {      // 创建块表达式 = 最后一个表达式的值
        let x = 1; // 这是语句
        x+3        // 这是表达式（结尾没有 ;）
    };             // y = 1+3 = 4
    ```

    声明后*未使用*会让编译器报 warning（可以通过 `_varName` 解决）

- @ 绑定：仅在特定模式下保存变量值

    ```rs
    enum Msg { Hello { id: i32}, }
    
    let msg = Msg::Hello { id: 5 };
    match msg {
        Msg::Hello {
            id: id_var @ 3..=7, // 仅当 3 <= id <= 7 时，为 id_var 赋值
        } => { println!("Found id={} in [3,7]", id_var); },
        Msg::Hello { id: 10..=12 } => { println!("Found id in [10,12]"); },
        Mgs::Hello { id } => { println!("Unexpected id={}", id); },

    }
    ```

- 解构赋值

    ```rs
    """ 普通 Struct """
    struct  Point { x:i32, y:i32 }
    let p = Point { x:0, y:1 };
    
    let Point { x:a, y:b } = p; // a == 0, b == 1
    let Point { x,y } = p;      // x == 0, y == 1

    """ Tuple 和 Struct 混合的怪东西 """
    let ((_, inch), Point { x, .. }) = ((3,10), Point {x:3, y:-10});
    ```

    ```rs title="解构嵌套 struct"
    enum Clr {
        RGB(i32, i32, i32),
        HSV(i32, i32, i32),
    }
    enum Message { ChangeClr(Clr) }

    let msg = Message::ChangeClr(Clr::HSV(0,160,255));

    """有点长就是说"""
    match msg {
        Message::ChangeClr(Clr::RGB(r,g,b)) => {},
        Message::ChangeClr(Clr::HSV(h,s,v)) => {},
        _ => {},
    }
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
    fn plus_five(x: i32, _: i32) -> i32 {
        x+5 // 不加分号
    }
    // 可以接收俩参数，但忽略后一个
    plus_five(1, 2);
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
        Penny, Nickel, Dime, Sth
        Quarter(State), 
    }

    let flag = true;
    fn coin_2_value(coin: Coin) -> u8 {
        match coin {
            Coin::Penny | Coin::Sth   => 1, // 可以用 | 表示 OR
            Coin::Nickle if flag      => 5, // 添加一个 flag 筛选
            Coin::Dime                => 10,
            1..=5      => println!("1~5"),
            'a'..='z'  => println!("a~z"),
            Coin::Quarter(state) => {
                println!("from: {}", state);
                25
            },
        }
    }

    // 微妙小匹配
    struct Point { x:i32, y:i32 }
    let p = Point { x:3, y:4 };
    match p {
        Point {x, y:0} => println!("@ X-Axis"),
        Point {x:0, y} => println!("@ Y-Axis"),
        Point {x,y}    => println!("Normal")
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

    if let Some(3) = v { println!("Got Three"); }
    // 只要不是 Null 都行
    else if Some(_)    { println!("Not Null & Not Three"); } 
    else { println!("Other"); }
    ```

#### 循环

> 熟悉的老三套（LOOP, WHILE, FOR）

```rs
loop {
    if cond { break; }
    else    { continue; }
}

while num != 0 { num = num-1; }
while let Some(x) = stack.pop() {}

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

> 感觉 Rust 的模块系统有点魔幻

### Package（包）
- 是 Cargo 的特性，可以用于构建、测试、共享 crate
- 包含 `Cargo.toml`，用于描述如何构建 Crates（如：导入外部依赖）
- 可以拥有 0/1 个 LibCrate，但可以拥有任意个 binCrate（放在 `src/bin` 下）
### Crate（单元包）
> 或许可以认为是单个 Rust 文件？

- 一棵模块树，可以生成 Lib / 可执行文件
- 具有 binary / library 两种类型
- Crate Root 是编译的入口文件，组成 Crate 的 根 Module
    - binCrate 的 root 默认为 `src/main.rs`
    - LibCreate 的 root 默认为 `src/lib.rs`
### Module-Use（模块）
- 在单个 Crate 内对代码进行分组，用于控制代码组织、作用域、私有 Path
- 通过 `mod` 关键字定义、支持嵌套

    使用 `mod [ModName];` 时，会把 `src/ModName.rs` 中的代码全贴进来

- 可以通过 `as` 为引入路径指定别名

    ```rs
    use std::io::Result as IoResult;
    ```

- 可以通过 `pub use` 重新导出名称（默认是私有的）

    ```rs
    pub use crate::front_of_house::hosting;
    ```

- 可以通过嵌套路径引入同前缀下的多个条目

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

> Rust 没有 try-catch 的机制

### `panic!`

- **不可恢复**，但可以手动触发：`panic!("crash 4 fun")`
- 报 panic 后的默认行为：打印错误信息 -> 展开、清理调用栈 -> 退出程序
    - 可以通过配置 `panic = 'abort'` 直接中断（此情况下内存由 OS、而非 Rust 清理）
    - 可以设置环境变量 `RUST_BACKTRACE=1` 定位具体报错的代码

### `Result<T, E>`
  
- **可恢复**，实际上是一个 Enum 类型

    ```rs
    enum Result<T, E> { 
        Ok(T),   // T 为操作成功时返回的类型
        Err(E),  // E 为失败时的返回类型
    }
    ```

- `main()` 也能返回 `Result<(), Box<dyn Err>>`，后者兜底了任何可能的错误类型
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

### 错误传播

```rs title="返回 Result，Err 丢给 caller 处理"
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

## 7 泛型，Trait，生命周期

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

## 8 迭代器与闭包

### 闭包

- “闭包” 是一种匿名函数，可以捕获其 **被定义作用域** 中的值

    !!!comment "就是 JS 的箭头函数，感觉 Rust 的写法好丑陋"

    ```rs
    fn gen_workout_plan(intensity: u32, rand_num: u32) {
        // 说是用 () 会和 tuple 分不开
        let closure_sample = |num: u32| -> u32 {
            println!("calc sth ... {}", intensity); // 捕获环境
            thread::sleep(Duration::from_secs(2)); 
            return num;
        }
        // 调用
        clouser_sample(intensity);
    }
    ```

- 不同于普通函数，闭包 **不强制要求** 标注形参和返回值的类型

    > 因为闭包不会暴露给用户

- 闭包只会为形参和返回值推断出 **唯一的具体类型**

    ```rs title="所以这里会报错"
    let f = |x| x;
    let s = f(String::from("hello")); // 这里推断为 str
    let n = f(5); // 这里给的 num，和推断不一致
    ```

- 基于泛型参数和 Fn Trait 存储闭包

    我们可以用一个 struct 来存储闭包 **及其执行结果**，从而实现缓存（仅执行一次计算）

    !!!Bug "无论实参如何，仅返回首次计算结果（换 HashMap 存 res 就行）"

    ```rs
    struct Cacher<T>
    where T: Fn(u32) => u32,
    {
        calc_fn: T，
        res：    Option<u32>,
    }

    impl<T> Cacher<T>
    where T: Fn(u32) => u32,
    {
        fn new(calc_fn: T) -> Cacher<T> {
            Cacher {
                calculation,
                res: None // Option 兼容了 None 情形
            }
        }
        // 仅当 self.res == None 时调用计算函数
        fn res(&muy self, arg: u32) => u32 {
            match self.res {
                Some(val) => val,
                None => {
                    let val = (self.calc_fn)(arg);
                    self.res = Some(val);
                    val
                }
            }
        }
    }

    // 好的，下面实例化一个
    let mut plan = Cacher::new(|num| {
        thread::sleep(Duraction::from_secs(2));
        num
    })
    println!("res = {}", plan.res(123));
    ```

- 闭包从环境捕获值的方式（和函数传参一致）

    | Trait | 说明 |
    | :---: | :-- |
    | `FnOnce` | 获取所有权 | 
    | `FnMut` | 可变借用 |
    | `Fn`    |  (不可变)借用 |

- 在形参列表前添加 `move` 关键字，可以强制闭包 **取得所有权**

    ```rs
    fn main() {
        let x = vec![1,2,3];
        let is_eq_to_x = move |z| {z==x};
        // 在这里就不能使用变量 x 了
    }
    ```

### 迭代器

```rs
let v = vec![1,2,3];
let v_iter = v.iter();

// 遍历
for val in v_iter {}
// 手动拿下一个值，可能为 None
let val = v_iter.next(); // 需要 <mut> v_iter、会改变其中的下标信息
```

- `iter()` 方法创建了元素的 **不可变引用**

    - `into_iter()` 创建的迭代器将获得元素的所有权
    - `iter_mut()`  将创建元素的 **可变引用**

- 迭代器适配器：用于迭代器的类型转换、可以通过链式调用进行一些骚操作

    ```rs
    let v = vec![1,2,3];
    // Rust 的迭代器是 lazy 的，不调用消耗性方法就啥也不干
    // 所以这边要手动套一个 collect 让它干活
    let v1: Vec<_> = v.iter().map(|x| x+1).collect();

    // 这边需要用 into_iter 拿到所有权
    fn shoes_in_my_size(shoes: Vec<u32>, my_size: u32) -> Vec<u32> {
        shoes.into_iter().filter(|size| size==my_size).collect();
    }

    // 你也可以手动跳过开头的 N 个元素
    let iter = v.iter().skip(N);
    ```

- 所有迭代器都实现了 Iterator trait

    ```rs
    pub trait Iterator {
        type Item; // 实际使用的数据类型
        fn next(&mut self) => Option<Self::Item>;
    }
    ```

    ```rs title="创建自定义迭代器"
    //  [1～5] 的计数器
    struct Counter {
        count: u32,
    }
    impl Counter {
        fn new() => Counter {
            Counter { count: 0 }
        }
    }
    impl Iterator for Counter {
        type Item = u32;
        fn next(&mut self) -> Option<Slef::Item> {
            if self.count < 5 {
                self.count += 1;
                Some(Self.count)
            } else {
                None
            }
        }
    }
    ```

## 9 智能指针

- "智能指针" 添加了额外的 MetaData 和功能，通常通过 Struct 实现

    > "引用" 通常只能借用数据，而 "智能指针" 在多数情况下都 **持有** 其指向的数据

    - 均实现 Deref & Drop Trait
    
      - Defref Trait: 自定义 解引用运算符`*` 的行为

        在实参（引用类型）与实参不匹配时，连续调用 Deref 实现自动类型转换

        ```rs
        let x = 5;
        let y = Box::new(x); //  y = &x
        assert_eq!(5, *y);   // *y = *(y.deref()) = x  
        ```
    
      - Drop Trait：trait 中实现的 `drop()` 无法手动触发，但可以通过 `std::mem::drop` 提前进行清理


### `Box<T>`

- 在 Heap 上存储数据、Stack 上仅存放指向 Heap 的指针
- 应用场景
    - 解决递归类型（链表）在编译时无法确认实际大小的问题
    - 在编译时无法确认大小，但在使用时需要知道其确切值
    - 需要移交大量数据的所有权，切确保操作时不会 *复制数据*
    - 使用值时，仅关注其实现的 trait、不关注具体类型

    ```rs title="创建一个 1->2->3->Nil 的链表"
    enum List {
        Cons(i32, Box<List>),
        Nil,
    }

    let l = Cons(1,
        Box::new(Cons(2, 
        Box::new(Cons(3, 
        Box::new(Nil))))));
    ```

- 手动实现一下 `Box<T>`

    ```rs
    use std::ops::Deref;

    struct MyBox<T>(T); // 定义了一个 tuple struct
    impl<T> MyBox<T> {
        fn new(x: T) -> MyBox<T> {
            MyBox(x)
        }
    }
    impl<T> Deref for MyBox<T> {
        type Target = T;
        fn deref(&self) -> &T { &self.0 }
    }
    ```

### `Rc<T>`

- 仅用于 **单线程** 场景，提供 **不可变引用**

- 通过记录所有者数量，允许一份数据**被多个所有者同时持有**、并自动进行清理

- 场景

    需要在 heap 上分配被程序的多个部分 **只读访问** 的数据，且在编译时 **无法确定** 哪一部分最后进行使用

    > 可以确定最后使用者时，将所有者分配给最后持有的部分就好了

```rs
Rc::clone(&a);        // 增加引用计数，返回 Rc<T>、strong_count ++
Rc::strong_count(&a); // 读取引用计数，仅当 strong_count == 0 时清理

// 解决循环引用：strong_cnt == 0 时，Weak<T> 自动断开（无论 weak_cnt ?= 0）
Rc::downgrade(&a);    // 返回 Weak<T>、weak_count ++
// 因此，Weak<T> 可能指向已经被清理的值、需要手动检查
Weak<T>.upgrade => Option<Rc<T>>
```

- Sample

    ```text title="两个 linked list 存在共享片段"
    3 ↘
        5 -> 10 -> Nil
    4 ↗
    ```
    ```rs
    use std::rc::Rc;
    // 节点类型
    enum List { Cons(i32, Rc<List>), Nil }
    // 创建共享部分
    let shared = Rc::new(Cons(5,
        Rc::new(Cons(10,
            Rc::new(Nil)))));
    // l1, l2 不会持有 shared 的所有权
    let l1 = Cons(3, Rc::clone(&shared));
    let l2 = Cons(4, Rc::clone(&shared));
    ```


### `RefCell<T>`

- 包含 `Ref<T> & RefMut<T>`，仅在 **运行时** 检查借用规则
- 用于 **单线程** 场景，同时支持 **可变**、不可变 借用
  
    ```rs
    borrow()     // 返回不可变引用 Ref<T>
    borrow_mut() // 返回可变引用 RefMut<T>
    ```
    > 可以用 `Rc<RefCell<T>>` 套娃，实现多个所有者的可变借用

- 内部可变性：方法内可变、方法外不可变

    ```rs
    pub trait Messenger {
        fn send(&self, msg: &str); // 接口定义的 self 不可变
    }

    use std::cell:RefCell;
    struct MockMessenger {
        sent_messages: RefCell<Vec<String>>>,
    }
    impl MockMessenger {
        fn new() => MockMessenger {
            MockMessenger { 
                sent_messages: RefCell::new(vec![]), 
            }
        }
    }
    impl Messenger for MockMessenger {
        fn send(&mut self, msg &str) {
            self.sent_messages.borrow_mut() // 获得可变引用
                .push(String::from(msg));
        }
    }
    ```

## 10 OOP

其实 Rust 不是很 OOP，它没有 “继承”、只能通过 trait 实现代码复用 

- Sample

    ```rs title="为一组不同的 component 调用 draw()"
    // 所有的 Component 都必须实现 Draw Trait
    pub trait Draw { fn draw(&self); }

    // Screen 用于存储所有的 Components，并依次调用 Draw 方法
    pub struct Screen {
        pub components: Vec<Box<dyn Draw>>,
    }
    impl Screen {
        pub fn run(&self) { for comp in self.components.iter() { comp.draw(); } }
    }
    
    // 一些实现了 Draw Trait 的 struct
    sturct Button {}    // impl Draw for Button {}
    struct SelectBox {} // impl Draw for SelectBox {}

    let screen = Screen { components: vec![
        Box::new(SelectBox {}),
        Box::new(Button {}),
    ]};
    screen.run();
    ```

### State Pattern

每个实例由数个内部状态对象（State Object）构成，其表现行为随内部状态改变发生变化

- 示例

    - `Post` 共有三种状态（草稿、等待审批、审批通过）
    - `post.content()` 仅展示 *审批通过* 的文本内容

    ```rs
    // State Trait 要求实现：请求审批、审批通过 两个功能
    trait State {
        fn request_review(self: Box<Self>) -> Box<dyn State>;
        fn approve(self: Box<Self>) -> Box<dyn State>;
    }
    struct Draft, PendingReview, Published {} // impl State

    pub struct Post {
        state: Options<Box<dyn State>>,
        content: String,
    }
    impl Post {
        pub fn new() -> Post {
            state: Some(Box::new(Draft {})), // init State = Draft
            content: String::new(),
        }
        pub fn add_text(&mut self, text: &str) {
            self.content.push_str(text);
        }

        """
        个人感实现起来有点抽象的
        - Post 可以不 care 具体的 state 种类，一股脑调 req / approv 就好
        - 但所有的 State 要对 req / approv 做不同的实现了
        - 状态相互耦合的时候就 ... 一言难尽
        """
        pub fn request_review(&mut self) {
            // state 是 Option 类型的，take() 方法将取得其所有权
            if let Some(s) = self.state.take() {
                self.state = Some(s.request_review());
            }
        }
        pub fn approve(&mut self) { // 逻辑和 request_review 一致
            if let Some(s) = self.state.take() {
                self.state = Some(s.approve());
            }
        }
        // Getter
        pub fn content(&self) -> &str {
            return self.state.as_ref().unwrap().content(&self);
        }
    }
    ```

- 改进：将状态编码为不同的类型

    - 在上一个片段中，每种 State 都实现了 `req_review & approve`
    - 在改进后的片段中，只有特定的 State 实现了对应的功能

    ```rs
    // 存储 **审批** 后的内容
    pub struct Post { content: String }
    impl Post {
        // 初始状态 -> 自动创建 Empty Draft
        pub fn new() -> DraftPost {
            DraftPost { content: String::new(), }
        }
        pub fn content(&self) -> &str { &self.content }
    }

    pub struct DraftPost { content: Srting }
    impl DraftPost {
        pub fn add_text(&mut self, text: &str) {
            self.content.push_str(text);
        }
        pub fn req_review(self) -> PendingPost {
            PendingPost { content: self.content }
        }
    }

    pub struct PendingPost { content: Srting }
    impl PendingPost {
        pub fn aprrove(self) -> Post {
            Post { content: self.content }
        }
    }

    fn main() {
        let mut post = Post::new();   // 返回 DraftPost
        post.add_text("write sth here ...");
        
        let post = post.req_review(); // 变成 PendingPost
        let post = post.approve();    // 变成 Post（且有内容）
    }
    ```

