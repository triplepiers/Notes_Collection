
??? info "Features of Go"

	[Go](https://go.dev/) 既能达到静态编译语言安全和性能，又能达到动态语言开发维护的高效率：
	
	1. 从 C 语言中继承了包括表达式语法、指针等理念，也保留了和 C 一样的编译执行方式与弱化的指针
	
	2. 引入了 “包” 的概念（用于组织程序结构）—— Go 的每一个文件必须归属于一个包，不允许单独存在
	
	3. 具备垃圾回收机制：内存自动回收，无需开发人员管理
	
	4. 从语言层面支持并发
	
		- `goroutine` 提供了轻量级线程，支持实现高并发
	
		- 基于 Communicating Sequential Process (CPS) 并发模型实现
	
	5. 支持 ”管道通信机制“，形成了特有的 `channel` 以实现不同 `goroute` 之间的通信
	
	6. 支持单个函数 **同时返回多个值**
	
	7. Neo：支持 切片 `slice` 、延时执行 `defer` ... 

!!! comment "像 C，像 Python，还像 JS => 总之非常神奇？"

## 1 Set Up ( for Mac )

> 跑 Wiki Freeze 的时候配的，有点整忘了
> 
> 此处使用 `homebrew` 进行安装

1. 安装 `golang`

	```bash
	brew install golang
	# 随后通过 go version 检验是否安装成功
	```

2. 配置环境变量

	```bash
	# 修改 GOROOT & GOPATH 为对应路径
	# 使用 go env 验证修改结果
	```

3. Hello World

	```go
	// @ hello.go
	package main

	import "fmt"

	func main() {
		fmt.Println("Hello World!")
	}
	```

	```bash
	go build hello.go # 编译（可以通过 -o 指定输出文件名称）
	./hello           # 运行（可执行文件）

	go run hello.go   # 直接运行（必须具备 Go 环境）
	```

## 2 基本语法

> [标准库 API 文档](https://studygolang.com/pkgdoc)

- `main()` 是 Go 程序执行的入口
- 语句后无分号（不能在同一行里塞多条语句）
- 定义的变量 / 导入的包 **未使用** 时，编译失败
- 转义字符 `\r` 会使得新输出逐个覆盖旧输出
- 支持 `//` 的单行注释 & `/**/` 包裹的多行注释

### 输入输出

- 标准输入

	> 阻塞并等待用户输入
  
	```go
	// 非常 C ！
	func main() {
		var a int
		fmt.Scanf("%d", &a)           // 别忘了取地址
		// 事实上不指定格式也可以 fmt.Scan(&a)
		fmt.Println("Input a = ", a)  // feedback
	}
	```

- 格式化输出
	
	| 输入 | 输出                                           |
	|:----:|:---------------------------------------------- |
	| `%%` | 输出 `%` 本身                                  |
	| `%b` | 二进制整数 / 科学计数法表示的指数为 2 的浮点数 |
	| `%d` | 十进制整数                                     |
	| `%c` | ASCII 字符                                     |
	| `%e` | 科学计数法 e 表示的 浮点数 / 复数              |
	| `%E` | 科学计数法 E 表示的 浮点数 / 复数              |
	| `%f` | 标准计数法表示的 浮点数 / 复数                 |
	| `%g` | 紧凑格式输出 `%e / %f` 格式的 浮点数 / 复数    |
	| `%G` | 紧凑格式输出 `%E / %f` 格式的 浮点数 / 复数    |
	| `%o` | 八进制整数                                     |
	| `%p` | 十六进制地址                                   |
	| `%s` | 字符串                                         |
	| `%t` | 布尔值 ( true / false )                        |
	| `%T` | 输出类型 Type                                  |
	| `%v` | 万能格式（输出内置 / 自定义类型值）            |
	| `%x` | 十六进制整数                                   |

### 获取命令行参数

```go
import "os"
func main() {
	list := os.Args // 实际上是一个 string 数组
	n := len(list)  // 获取个数（arg[0] 是命令本身）
}
```


### 2.1 变量 & 常量

??? info "标识符命名规范"
	- 以 Unicode 字母 / 下划线开头
	- 包含数字、字母、下划线
	- 严格区分大小写

#### 2.1.1 变量声明

基本语法为 `var id type`，默认初始化为 0 / `false`

1. 声明单个变量 `var a int`

2. 声明多个变量

	- 同类型  `var a, b, c int`

	- 不同类型

		```go
		var (
			a int
			b float64 = 2.0 // 初始化
			c := 3.14       // 自动推导
		)
		```

4. 声明并初始化 `var b int = 10`

5. 自动推导类型（必须初始化）`c := 30`
   
    > - 可以通过 `fmt.Printf(%T, c)` 进行验证
    > - 自动类型推导会先声明后赋值（不能对同一标识符用两次）
    
#### 2.1.2 变量赋值

```go
// 1. 同时对多个变量进行类型推导
a, b := 10, 20

// 2. 交换两个变量的值（主打一个抽象）
i, j = j, i

// 3. 匿名变量 `_`（丢弃数据，不进行处理）
tmp, _ = i, j // => 在解析函数返回值时比较实用（占位）
```

#### 2.1.3 变量作用域

- 局部变量定义在一对 `{}` 之间，只在这一对大括号之间生效

	在定义语句处分配空间，离开作用域自动释放

- 全局变量定义在函数外

- 不同作用域允许包含同名变量，使用时在静态嵌套中由内向外查找（就近原则）

#### 2.1.4 常量

!!! info "常量使用 **赋值符号** `=` 进行自动推导"

- 常量声明

	```go
	const a int = 10
	
	const b = 20     // 自动推导
	
	const (
		i int = 10
		j float64 = 3.14
		k = 2.0     // 自动推导
	)
	```

	- 只能立即初始化，不允许赋值（修改）

- `iota` 枚举

	`iota` 是一个自动常量自动生成器（ Auto Increase），用于给常量赋值

	```go
	// iota 每一行都会 ++
	const (
		a = iota // 0
		b = iota // 1
		c = iota // 2
	)
	// 以下写法等价
	const (
		a1 = iota // 0
		a2        // 1
		a3        // 2
	)

	// 在同一行中，iota 的值相等
	const (
		a = iota // 0
		b1, b2, b3 = iota, iota, iota // 1, 1, 1
		c = iota // 2
	)

	// 遇到 const 会重置为 0（在单个 const() 中累加）
	const b = iota // 此时 b = 0
	
	```

### 2.2 数据类型

#### 2.2.1 常用基础类型

- 布尔

	```go
	// 定义并赋值
	var b bool // 此时自动初始化为 false
	b = true
	
	// 两种自动推导
	var b = false
	b := false
	```

- 浮点

	有 `float32` 和 `float64`，自动初始化为 `0.0`
	
	自动推导默认为 `float64`

- 字符

	用一对单引号包裹，用 `%c` 输出

	- `byte`：是 `uint8` 的别名，存的其实是 ASCII 编码
		
		可以用字符 `'a'` 或 ASCII `97` 赋值

	- `rune`：是 `uint32` 的别名，用于存储 Unicode 编码

- 字符串

	用一对双引号包裹，用 `%s` 输出
	
	- 可以用 `len(str)` 输出字符串长度，并通过下标访问单个字符 `str[0]`

	- 默认包含结束符号 `\0`

- 复数

	> 感觉用不上？
	
	```go
	var t complex128
	t = 3.14 + 2i       // 默认输出 (3.14+2i) 

	// 通过内建函数分别提取实部和虚部
	r = real(t)         // 3.14
	i = imag(t)         // 2
	```

#### 2.2.2 类型转换

Go 不允许隐式类型转换，所有类型转换必须显式声明，且只能在两种兼容类型之间进行：

```go
var i int
var c char = 'c'

i = c       // 这是不允许的（隐式类型转换）
i = int(c)  // 显示类型转换（拿 ASCII 值）
```

#### 2.2.3 类型别名

> 类似于 C 的 `typedef`

```go
type bigint int64 // 赋予 bigint 的别名

type (            // 批量改名
	myint int
	mystr string
)

var x bigint      // 用于变量定义，使用 %T 会输出别名
```

### 2.3 运算符

- 算数运算符：`+-*/%` , `x++ x--`

- 关系运算符：`== != > < >= <=`

- 逻辑运算符：`! && ||`

- 位运算符：`& | ^(XOR) << >>`

- 赋值运算符：`= += -= *= /= %= <<= >>= &= |= ^=`

- 取地址 / 取值运算符：`&` , `*`（用于指针）

### 2.4 基本结构

#### 2.4.1 分支

```go
// 基础 IF（条件没有括号）
if a == 3 {}

// 支持“一个初始化条件”，用分号分隔
if b := 3; b == 3 {}

// 多分支
if a < 10 {
	// branch1
} else if a > 10 {
	// branch2
} else {
	// branch3
}
```

```go
// SWITCH 捏
// - 可以不写 break（写了也行）
// - 可以使用 fallthrough 关键字无条件执行下一个 case
switch x { // 变量没有括号（难受）
	case 1:
		// branch1
	case 2, 3, 4, 5: // 支持多个值
		// branch2
	default:
		// branch3
}

// 支持“一个初始化条件”，用分号分隔
switch x:=1; x {}

// 可以没有条件
score := 85
switch {
	case score > 90: // 优秀
	case score > 80: // 良好
	case score > 60: // 及格
	default:         // 不及格
}
```

#### 2.4.2 循环

```go
// FOR（没有 WHILE，淦！）
sum := 0
for i := 1; i <= 100; i++ {
	sum += i
	// 支持 break & continue
}

// 可以搭配 range 食用：返回 (index, value)
str := "abc"
for idx, ch := range str { // 可以用匿名变量选择接 idx / val
	fmt.Println("s[%d] = %c", idx, ch)
}

// 支持啥也不写（死循环）
for {
	if condition {
		break
	}
}
```

#### 2.4.3 goto

> 跳转到指定标签，可以用在任何位置（不能跨函数）

```go
func main() {
	if condition {
		goto L1
	}
	// false branch
L1:                  // 定义标签
	// true branch
}
```

### 2.5 函数

- 由 `func` 关键字定义，首字母小写为 private，大写为 public
- 支持 >= 0 个 `var type` 参数，不支持默认值
- 支持返回 >= 0 个值

#### 2.5.1 无返回值

```go
// 定义在 main() 前后都可以直接用

// 无参
func NoRet() {
	fmt.Println("sth")
	// 可以省略 return
}

// 固定参数列表
func NoRet(a int, b int) {} 
func NoRet(a, b int) {}
func NoRet(a, b string, c float64) {} // a 和 b 都是 string

// 不定参数列表 => 传递 >= 0 个参数 (ES6既视感)
func VarList(args ...int) {
	// 获取总数
	tot := len(args)
	// 遍历
	for _, arg := range args {}
	for i:=0 ; i<len(args); i++ {}
	// 获取单个
	cur = args[idx]
}
// 只能作为形参的最后一个(固定参数必须传，不定参数选传)
func VarList(a string, args ...int) {}
// 可以把不定参数列表丢给别人
func Next(tmp ...int) {}
func VarList(args ...int) {
	Next(args...)     // 全丢过去
	Next(args[2:]...) // args[2]~x
	Next(args[:2]...) // args[0]~args[1]
}
```

#### 2.5.2 有返回值

```go
// 返回单个值的多种写法

// 返回固定值
func retConst() {
	return 6 
}

// 给返回值起名（推荐）
func retOne() (res int) {
	return 6 // 可以
	
	res = 6
	return   // 不能省略（离谱）
	// return res => 也行
}
```

```go
// 多个返回值

// 不给起名字
func retThree() (int, int, int) {
	return 1, 2, 3
}

// 起名字
func retThree() (a, b, c int) {
	a, b, c = 1, 2, 3
	return // 不能省
}

// 接返回值（可以用匿名变量丢掉不用的）
a, _, c := retThree()
```

#### 2.5.3 函数类型 & 回调

Go 语言支持通过 `type` 定义具有 **相同参数 & 返回值类型** 的 “函数类型”

> 下面使用 “函数类型” 作为参数来实现回调：

```go
type calcFunc func(int, int) int
// 两个符合 calcFunc 类型的函数
func Add(a int, b int) int {
	return a+b
}
func Sub(a int, b int) int {
	return a-b
}
// 将具体参数作为参数传递
func Calc(a, b int, calc calcFunc) int {
	return calc(a, b)
}

// 调用案例
res := Calc(1, 5, Sub) // 没有小括号（传本体，不是结果）
// 也可以声明一个函数指针
var f calcFunc = Add
res := f(1, 5)
```

#### 2.5.4 匿名函数 & 闭包
> 扑面而来的 JS 即视感

- 匿名函数案例

	```go
	func main() {
		a := 10
		str := "hello"
		
		// 定义一个匿名函数（可以使用外部作用域变量）
		f := func() {                   // 自动推导类型
			fmt.Println("str = ", str)
		}
		f()                             // 调用
	
		// 定义同时调用
		func() {
			fmt.Println("a = ", a)
		}()                             // 精髓小括号
		
		// 有参有返回匿名函数
		x, y := func(a, b int)(max, min int) {
			if a > b {
				max = a
				min = b
			} else {
				max = b
				min = a
			}
			 return                     // 不能漏 return
		}(10, 20)
	
		// 定义无参无返回的函数类型
		type NNfunc func()
		var f2 NNfunc                   // 声明变量
		f2 = f                          // 赋值
		f2()                            // 调用（同一个函数）
	}
	```

- 闭包捕获外部变量 / 常量

	- 以 **引用方式** 捕获（同步修改外部变量）
	  
		```go
		func main() {
			a := 10
			func() { a = 20 }()
			fmt.Print(a) // 输出 20
		}
		```

	- 可以通过 **返回匿名函数** 形成闭包（类似于 `static` 的效果）
	  
		闭包 **并不关心捕获的 变量 / 常量 是否超出作用域**，只要该闭包还在使用，捕获的变量便会持续存在
	  
		```go
		func Closure() func() int { // 返回值是 func() int 函数
			var x int               // 自动初始化为 0
			return func() int {     // 返回匿名函数
				x++
				return x * x
			}
		}
		func main() {
			f := Closure()          // 用 f 来接收返回的函数（闭包持续存在）
			for i:=0 ; i < 5 ; i++ {
				// 前者全是 1，后者是 1,4,9,...
				// 通过 Closure()() 调用会每次生成新的闭包 -> 一直输出 1
				fmt.Println(Closure()(), f())
			}
		}
		```

#### 2.5.5 延迟调用

- 关键词 `defer` 用于延迟函数的执行（当前函数结束前调用），**只能出现在函数内部**

- 常用于处理成对操作（上锁 - 释放，连接 - 断开），用于释放资源的 `defer` 应该紧跟在请求资源的语句之后

- 多个 `defer` 语句将以 LIFO（后进先出）的顺序执行，即便发生错误（包括某个 `defer` 函数出现错误），其余函数依然会被执行

```go
// 结合匿名函数使用
func main() {
	a := 10
	b := 20
	// 2 - 再执行这一块：输出 111, 222
	defer func() {
		fmt.Println(a, b)
	}()
	// 1 - 先执行这一块：修改 a,b 输出 111, 222
	a = 111
	b = 222
	fmt.Println(a, b)
}

func main() {
	a := 10
	b := 20
	// 2 - 再执行这一块：输出之前传递的 10, 20
	defer func(a, b int) {
		fmt.Println(a, b)
	}(a, b) // 已经传参，还未调用
	// 1 - 先执行这一块：修改 a,b 输出 111, 222
	a = 111
	b = 222
	fmt.Println(a, b)
}
```

### 2.6 指针

- 默认值是 `nil`（ `ptr = nil` 是合法的）
- 不支持指针运算 `ptr->member`，只能用 `*ptr.member`

- 输出取地址的结果

	```go
	var a = 10
	Printf("Addr(a) = %p", &a) // 参数是取地址的结果
	```

- 基本操作

	```go
	var a int = 10
	
	var p *int  // 指针类型是 *type
	p = &a      // 用 p 保存 var a 的地址

	*p = 123    // 通过指针操作 var a
	Print(*p, a)    // 输出 "123 123"
	```

#### 2.6.1 New 函数

申请一块指定大小的 **匿名内存空间**（用指针接）

```go
var p *int   // 此处确定了指向 int
p = new(int) // 申请一块 int 大小的空间

// 事实上这样也行
ptr := new(int)
```

#### 2.6.2 传值 & 传址

```go
func main() {
	a, b := 10, 20
	// 经典 swap
	swap(&a, &b)
}

func swap(p1 *int, p2 *int) {
	*p1, *p2 = *p2, *p1
}

// 默认是 “传值” -> 行不通捏！
func Fswap(a int, b int) {
	a, b = b, a // 本体并没有动
}
```

### 2.7 可见性

- 所有 Public 的 函数 / 结构体（成员），首字母大写

	- 可以通过 `package.structName` / `package.varName` 访问

		- 包外新建的结构体只允许访问修改 Public 分量

	- 可以通过 `package.func()` 调用

- 所有 Private 函数只供包内访问（可跨文件），首字母小写


## 3 数组 Array

> 只能放相同类型的数据 -> 比较接近 C 的 Array，而不是 Python 啥都能塞的 List

??? info "随机数生成"
	```go
	import "math/rand"
	import "time"
	
	func main() {
		// 设置种子（once）
		rand.Seed(time.Now().UnixNano()) // 填 const 也行
	
		// 产生随机数
		rand.Int()       // 比较大的数字
		rand.Intn(100)   // < 100
	}
	```



### 3.1 定义

```go
// 抽象的定义方式 -> len 不能是变量！
var arr [50]int
// 但这样可以捏  -> 常量 len 可以在编译时确定
const len = 20
var arr [len]int
// 从初始化数据推断长度
arr := [...]int{1, 2, 5: 34} // 最大下标为5 => 初始化一个 [6]int

// 一些个遍历初始化
for i := 0 ; i < len(arr) ; i++ {
	arr[i] = i+1
}
```

### 3.2 初始化

```go
// 部分初始化（后两个赋0）
var arr [5]int{1,2,3} 

// 指定下标初始化 -> [0,0,10,0,20]
d := [5]int{2:10, 4:20}	
```

### 3.3 二维数组

```go
var arr2D [3][4]int // 3 * 4

k := 0
// 两层循环遍历
for i:=0 ; i<3 ; i++ {
	for j:=0 ; i<4 ; j++ {
		k++
		arr2D[i][j] = k
	}
}

// 一些个初始化 -> 本质上就是 3 * 一维数组
arr := [3][4] int {
	{1,2,3},    // 未初始化的部分为 0
	2:{5,6,7,8} // 指定为某一行初始化
}
```

### 3.4 比较 & 赋值

```go
// 仅支持 == / != 比较
a := [5]int {1,2,3,4,5}
b := [5]int {1,2,3,4,5}
c := [5]int {1,2,3}

a == b // true
a != c // true

// 同类型数组支持赋值
var d [5]int
d = c  // 合法
```

### 3.5 数组做参数

- 数组本身做参数是 **传值**

	```go
	func modify(a [5]int) {
		a[2] = 123
		Print(a)   // 这里输出 [1,2,123,4,5]
	}
	func main() {
		arr := [5]int{1,2,3,4,5}
		modify(arr)
		Print(arr) // 还是 [1,2,3,4,5]
	}
	```

- 数组指针做参数是 **传址**

	```go
	// 正确做法
	func modify(p *[5]int) {
		(*p)[2] = 123
		Print(p)
	}
	// 传参需要取地址
	modify(&arr)
	```

## 4 切片 Slice

- Slice 结构体如下：

    | 1 | 2 | 3 |
    | :------------------: | :------------: | :------------: |
    | 指向起始位置的 `ptr` | 应用长度 `len` | 切片容量 `cap` |

- 切片不是数组指针，也不是真正意义上的动态数组，而是一个 **引用类型**，总是指向一个底层 Array（不能独立使用）

	- 修改 Slice 同时**会影响**源数据

	- 通过内部指针和相关属性引用数组片段以实现变长方案

	- 切片本身可以继续切片（套娃好耶）

	- 作为参数时 **传值**，但因为指向地址与原来一致，**修改会影响原数组**

??? info "数组 vs 切片"
	- 数组的长度在定义后就 **无法修改**
	- 数组是值类型，每次传参都会产生一份**新的副本**

### 4.1 定义

> - 可以通过 `len() / cap()` 分别输出切片的 长度 / 容量
>   
> - `make` 会在底层维护一个不可见（匿名） Array，`ptr` 指向该数组起始位置

```go
// 1. 使用切片引用已创建的数组
var array 5[int] = [...]int{10,20,30,0,0}
var slice = arr[1:3]                 
// 包含 [low, high)，可用第三个参数指定 cap
// 可以用 [:end] [start:] [:] 对取到两端的切片进行简写

// 2. 通过内置函数 make 创建切片：make([]type, len, [cap])
var slice []int = make([]int, 4, 10) // len*0 -> 可以通过下标访问修改

// 3. 直接初始化
var slice []stirng = []string{"tom","jack", "mary"} // len = cap = 3
```

!!! warning "虽然切片长度可以动态增长，但**初始化**时仍不允许越界 `[0, len(s))`"

```go
// 遍历和数组没有区别
var array 5[int] = [...]int{10,20,30,40,50}
slice := arr[1:4]

// For 遍历
for i:=0 ; i<len(slice) ; i++ {}

// For-Range 遍历
for idx, val := range slice {}
```

### 4.2 动态追加

!!! warning "必须存储追加结果"

`append()` 将元素追加至切片末尾，并返回更新后的切片

- 若容量足够，则 **重新切片** 以容纳新的元素

- 若容量不足，则 **重新分配** 新的基本数组（容量倍增）

```go
var slice3 []int = []int{10,20,30}

// 1. 追加指定元素
slice5 := append(slice3, 400, 500)
// slice3 = {10,20,30}，slice4 = {10,20,30,400,500}

// 2. 追加切片（需要析构）
sliceD := append(slice3, slice3...)
// sliceD = {10,20,30,10,20,30}
```

### 4.3 拷贝
> 在 `target` 处原地更新（覆盖重合前缀）

!!! info "`cap(dst) < len(src)` 时 **不报错** —> 只拷贝容量范围内的元素"

```go
var dst = make([]int, 6)
var src []int = []int{1,2,3}

copy(dst, src) // dst = {1,2,3,0,0,0}
```

### 4.4 操作字符串

`string` 的底层是 `[]byte`，但本身 **不可变** （ `str[1] = 'a'` 非法）=> 使用切片处理

```go
// 修改字符串
str := "hello@world"
// 1. 转 byte 数组
arr := []byte(str)
// 2. 修改
arr[0] = '$'
// 3. 转回 string
str = string(arr)
```

!!! info "若需要处理中文，则应转为 `[]rune` 进行兼容"

## 5 字典 Map

!!! info "做函数参数时为 **引用传递**"

- Key
  
	Map 中的 Key 必须是唯一的，因而必须支持 `== !=` 比较

	函数 / 切片、包含切片的结构不能作为 Key

- Value

	Value 可以是任何类型

- 在 Map 中，所有 Key 的类型一致，所有 Value 的类型一致


```go
// 类型格式为 map[keyType]valType
var m map[int]string
m[1] = "hello"                // 为指定键赋值，键已存在时进行覆盖

// map 具有 len
Print(len(map))

// 通过 make 创建
m ;= make(map[int]string, 10) // 指定的是 cap 不是 len（但是会自动扩充）

// 创建并初始化
m := map[int]string{
	1:"mike",
	2:"marry",               // 末尾还得有个逗号
}
```

### 基本操作

```go
var m map[int]string

// 遍历（无序）
for key, val := range m {}

// 判断 key 是否存在
val, flag := m[key]
if flag == true {}
else {}

// 删除
delete(m, key)
```

## 6 结构体 Struct

!!! info "作为函数参数是 **传值**"

### 6.1 定义

- 格式为 `type tName struct`

- 可以在 函数内 / 函数外 定义结构体（若在函数内定义则为 private）

```go
type Student struct {
	id   int
	name string
	sex  byte
	age  int
}
```

### 6.2 初始化

```go
// 顺序初始化 -> 必须初始化 所有 分量
var s Student = Student {
	1,
	"mike",
	'm',
	28
}

// 部分初始化 -> 其余赋值为 default
s := Student {
	name: "jerry",
	age: 32
}

// 结构体指针
var ptr *Student
ptr = &Student {  // 取地址
	name: "jerry",
	age: 32
}
Print(*ptr)      // 打印
```

### 6.3 成员操作

```go
var s Student
s.name = "Jake"
Print(s.name)

// 通过结构指针操作成员（两种操作等价）
var ptr *Student = &s
(*ptr).id = 1
ptr.id = 2

// 通过 new 申请的也是指针（指向空对象）
ptr := new(Student)
```

### 6.4 比较 & 赋值

```go
s1 := Student{ id: 1, name: "tot"}
s2 := Student{ id: 2, name: "tod"}

// 支持 == / !=，比较每一个分量是否相等
s1 == s2  // false

// 同类结构体支持赋值
var tmp Student
tmp = s1
tmp == s1 // true
```

### 6.5 参数传值

```go
// 声明指针类型作为参数
func change(p *Student) {
	p.id = 1
}

// 取地址调用
change(&s)
```

## 7 工程管理

### 7.1 工作区

Go 工程一般包含以下三个子目录：

- `/src`：以代码包形式组织并保存 Go 源代码（`.go / .c / .h / .s`）

> `/pkg` & `/bin` 由 Go 命令行工具在构建过程中自动创建

- `/pkg`：存储由 `go install` 构建产生的归档文件 `.a`

- `/bin`：保存由 `go install` 构建产生的可执行文件

> - 只有当 `GOPATH` 中仅包含一个工作目录路径时，`go install` 命令才会将源码构建至当前工作目录的 `/bin` 路径下
> 
> - 一般需要将 `GOPATH` 设置为工程根路径（ `/src` 的父路径）

### 7.2 包

- 同一个子目录下的 `.go` 必须处于同一个 `package` 内（子目录名）

	同一子目录下（同 `package`）下的文件可以直接调用方法（无需包名，不管 Private / Public ）

- 导入的包必须使用，否则编译报错

	> 仅 Public 函数允许跨包调用（首字母大写）

	```go
	// 一个一个导
	import "os"
	// 导一组
	import (
		"fmt"
		"os"
	)

	// using namespace '.'
	import . "fmt"            // 调用时无需包名（但可能撞名字）
	Println("hello world")    // 直接用捏

	// 起别名
	import io "fmt"
	io.Println("hello world") // 别名调用

	// 忽略此包（不用不报错，但是很迷惑）
	import _ "os"
	// 实际上是以 _ 重命名该包 -> 引入，但只用了该包的 init()
	```

- 保留函数：无参无返回值，由程序自行调用

	- `main()`：仅用于 `package main`

		- 若 `package main` 中导入了其他包，则按书写顺序依次导入（先递归导入各包的依赖）

		- 同一个包被多个包导入时，实质上仅导入一次

	- `init()`：可选，适用于所有包
	  
		>  类似于包的构造函数
	
		- 可以写若干个（建议只写一个），都会在程序开始执行时（`main()` 之前）调用

		- 用于进行初始化变量等引导操作

	- 执行顺序

		1. 递归执行所有依赖的 `init()`
		2. 执行 `package main.init()`
		3. 执行 `package main.main()`

### 7.3 Go Mod 依赖管理

`Go.mod` 是一个依赖管理工具：不同于传统的 `GOPATH` 需要包含 `/src` / `/bin`，任何包含 `go.mod` 的目录都可以作为 Module

- 开启功能
  
	```bash
	go env -w GO111MODULE=on
    ```

- 新建 Module
  
	在根路径下执行 `go mod init [module-name]` 即可自动初始化，并生成 `go.mod` 文件

- 安装依赖

	直接执行 `go run [file].go`，Go 将自动查找所有依赖并将其版本写入 `go.mod`

	> 第三方依赖将被下载至 `$GOPATH/pkg/mod` 下

- 基本结构

	```text
	.
	├── go.mod         // 依赖信息
	├── main.go        // 项目入口
	└── calc           // 自定义包
	    └── calc.go
	```

- 引入本地依赖
  
	使用 `go run main.go` 即可正常运行

	```go
	// @ main.go
	package main
	
	import (
		"[module-name]/[package-name]" // 此处是 mymodule/calc
	)

	func main() {
		calc.Calc() // 使用 package calc 中的 public Calc()
	}
	```
