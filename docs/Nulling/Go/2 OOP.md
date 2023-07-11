事实上 Go 不支持 继承、虚函数、构造/析构函数，隐藏的 `this` 指针 等 OOP 中的常见概念，但仍可以通过一些方法实现这些特性：

- 封装：通过 **方法** 实现

- 继承：通过 **匿名字段** 实现

- 多态：通过 **接口** 实现

## 1 匿名字段

- 通常情况下字段名与字段类型一一对应，而 **匿名字段** 支持 **只写类型不写字段名**

- 当匿名对象本身是一个结构体时，其所拥有的所有分量都被 **隐式引入** 当前定义的结构体

	```go
	type Preson struct {
		name string
		sex  byte
		age  int
	}
	
	type Student struct {
		Person // 匿名字段
		int    // 基础类型匿名字段 -> 通过 s.int 操作
		id   int
		addr string
	}
	```

- 对包含匿名字段的结构体进行初始化

	```go
	// 顺序初始化
	var s Student = Student{
		Person{"mike", 'm', 18},
		1, "Hangzhou"
	}

	// 部分初始化：匿名字段内未指定分量也初始化为 default
	s2 := Student{ Person{ name:"jake" }, id: 2 }

	// 对匿名字段进行整体赋值
	s2.Person = Person{"jake", 'm', 29}
	// 对匿名字段分量单独赋值
	s2.Person.name = "jake"
	```

- 指针类型匿名字段

	```go
	type Student struct {
		*Person,
		id int
	}

	// 初始化，取地址
	s := Student{ &(Person{ name:"jake" }), 2 }

	// 先定义，然后使用 new 分配空间
	var s Student
	s.Person = new(Person)
	```

## 2 方法

- Go 支持为 **任意类型**（包括内置类型，但不包括 指针类型 / 接口）添加方法

	```go
	// 合法
	func (this *long) test() {}

	// 非法 -> type 本身是指针
	type lptr *long
	func (this lptr) test() {}
	```

- 方法必须具有 Receiver，若在函数中未使用，则可以省略参数名

- **不支持重载**：不能包含同名不同参的方法（不同 Receiver 可以具有同名方法）

```go
// 定义
func (self Person) PrintInfo() {
	fmt.Println("cur Person: ", self)
}

// 操作成员（接受者是指针）
func (this *Person) Construct(n string, s byte, a int) {
	this.name = n
	this.sex = s
	this.age = a
}

// 调用
var p Person
(&p).Construct("jake", 'm', 18)
p.PrintInfo()
```