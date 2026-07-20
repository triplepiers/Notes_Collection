# Dart 基础

## Hello World

```dart title="test.dart"
void main(List<String> args) { // 入口函数为 main()
print("Hello World!");       // 分号结尾
}
```

上述文件可以通过 `dart test.dart` 命令编译运行，并输出 Hello World

## 常量与变量

```dart
/* 变量 */
var age = 20;
// ❌ age = "hello" 赋值后变量类型确定、不可更改
var age1 = age + 21;

/* 编译时常量 */
const pi = 3.1415906；
// ❌ pi = age * 0.2 常量表达式中不允许有变量

/* 运行时常量 */
final DateTime now = DateTime.now(); // 运行时获取时间戳、不可更改
```

## 基础类型

- 字符串：支持单双引号 / 模板字符串

    ```dart
    String text = "我说欢愉";
    text = '我要在${DateTime.now()}吃饭！';
    ```

- 数字类型：`int / double / num（可整可浮点）`

    ```dart
    int intNum = 1;
    double doubleNum = 1.1;
    num    ahaNum = 15.96;

    // 奇妙转化
    intNum    = doubleNum.toInt();
    doubleNum = intNum.toDouble();

    doubleNum = ahaNum.toDouble(); // 防止 int 跳脸
    ahaNumu   = doubleNum;
    ```

- 布尔类型：`bool = true / false`

## 容器类型

### 列表 List

```dart
List students = [1, "3", true]; // 支持混合存储不同类型

// 尾部拼接
students.add("新同学");
sutdents.addAll([1, 3, 5, 7]);

// 删除
students.remove(1);     // 移除首个符合元素
students.removeLast(1); // 移除最后符合元素
students.removeRange(start, end); // 移除左闭右开区间元素

// 遍历
students.forEach((item) { // 梦回 JS 箭头函数
    print(item); 
});
students.every((item) {  // 逐个判断是否满足条件
    return item.toString.startsWith("*"); // 必须返回 bool 值
}); // => [true, false, ...]
students.every((item) {  // 筛选符合条件元素
    return item.toString.startsWith("*"); // 必须返回 bool 值
}).toList(); // => Iterable

// 属性
students.length;
students.isEmpty;

// 访问
students[0];   // 经典下标
sutdents.first;
students.last;
```

### 字典 Map

```dart
Map trans = {
    "lunch": "午饭哇午饭"
};

// 遍历
trans.forEach((key, val) {
    print('${val}@${key}');
});

// 操作
tran.addAll({'dinner': '并非早饭'}); // key 相同会导致覆盖
trans["lunch"] = "并非晚饭";
trans.containsKey('breakfast');
trans.remove('lunch');             // key 不存在则无事发生
trans.clear();
```

### 动态类型 dynamic
    
- 支持在运行时自由改变类型（堪比 TS 的 `any`）
- 跳过类型检查，编译时无法对不存在的方法报错

## 空值安全机制

|类型|操作符|作用| Sample |
| :--: | :-: | :-- | :-- |
| 可空类型 | `?`  | 声明可空变量 | `String? x` |
| 安全访问 | `?.` | 对象为 null 时，直接返回 null | `user?.name` |
| 非空断言 | `!.` | 开发者保证变量非空 | `user!.name` |
| 空合并  | `??`  | 左侧为 null 时，返回指定默认值 | `name ?? "default" ` |

## 运算符

| 运算符 | 描述 |
| :-:| :-- |
| `+-*/%` | 四则运算 + 取余|
| `+=, *=`| 经典缩写 |
| `~/` | 整除 |
| `==, !=` | 相等 / 不等 |
| `&&, \|\|, !`|  AND / OR / NOT|

## 流程控制

```dart
if () {}
else if () {}
else {}

switch (var) {
    case Val1: ...; break;
    case Val2: ...; break;
    default:   ...;
}

while () { break / continue; }
for (int i = 0 ; i < MAX ; i++) {}
```

## 函数
- 返回值
    - 无返回值：显式声明 `void`
    - 有返回值：省略时，自动推断为 `dynamic`
- 参数

    ```dart
    // 可选参数用 [] 包裹，且必须做空值处理；可以设置默认值
    String combine(String a, [String? b = "b", String? c]) {
        return a + (b ?? "") + (c ?? "");
    }

    // 可选命名参数用 {} 包裹、必须用 arg: val 的形式传递
    void showPerson(String usrname, {int? age, String? sex}) {
        print('姓名: ${usrname}, 年龄: ${age}');
    }
    ```
- 匿名函数：赋值给 `Function` 类型变量（一般用于回调）

    ```dart
    Function add = (int a, int b) {
        return a + b;
    };

    void onTest(Function cb) {
        cb(1,2);
    }
    ```
- 箭头函数：函数体只有一行

    ```dart
    int add(int a, int b) => a+b; // 只是省略了 return
    ```

## 类

!!!info "多态实现"
    1. 继承同一个父类后，分别进行方法重写
    2. 定义抽象类，并实现接口

```dart
Person p1 = Person(); // 可以省略 new
Person p2 = Person.createPerson(age: 20); 
p1.age = 18;
p1.study();

class Person {
    // 公有属性
    String? name = "";
    int?    age = 0;
    bool?   isMale = true;
    // 私有属性/方法：以 _ 开头、仅类内使用
    bool?   isRest = false;


    // 默认构造函数：一般用可选命名参数（比较灵活）
    Person({String? name, int? age, bool? isMale}) {
        this.name = name;
        this.age = age;
        this.isMale = isMale;
    }

    // 命名构造函数 => 可以支持不同的参数列表（可以与默认构造同时存在）
    Person.createPerson({String? name, int? age, bool? isMale}) {
        this.name = name;
        this.age = age;
        this.isMale = isMale;
    }

    /* 构造函数形参语法糖
       Person({this.name, this.age, this.isMale})
       Preson.createPerson({this.name, this.age, this.isMale})
    */
    
    void study() {
        print('${name}正在学习！'); // 居然不用 self / this
    }
}

// （单）继承：拥有父类的属性 + 方法
class Student extends Person {
    int score = 0;

    // 不会继承构造函数，必须通过 super 显示调用
    Student({String? name, int? age, bool? isMale, int? score}): super({name: name, age: age, isMale: isMale});

    @override // 重载父类方法
    void study() {
        super.study(); // 先调用父类方法
        print('拿到了${score}学分');
    }
}
```

### 抽象类定义与实现

```dart
abstract class BasePay {
    void pay(); // 不包含具体实现
}
class WxPay implements BasePay {
    @override
    void pay() {
        print("WX Paid");
    }
}
```

### 混入
> 不通过继承，向类中添加新的功能

```dart
// 通过 mixin 定义对象
mixin Base {
    void song(String name) {
        print('~🎵~${name}在唱歌~🎶~');
    }
}
/* 通过 with 进行混入
    - 支持混入多个对象
    - 后混入方法会覆盖先混入的同名方法
*/
class Student with Base {
    String? name;
    int? age;
    Student({this.name, this.age});
}
```

## 泛型

### 泛型集合
> 限定元素类型，无法混合存储

```dart
List<String> list = [];
Map<int, String> map = {};
```

### 泛型方法
> 约束参数和返回值类型

```dart
String val = getValue<String>("Hello");
printList<String>(["1", "12", "21"]);

T getValue<T> (T value) {
    return value;
}
void printList<T>(List<T> list) {
    for (var i = 0; i < list.length ; i++) {
        print(list[i]);
    }
}
```

### 泛型类
> 约束属性、参数、返回值

```dart
Person<String> s = Student("A");

class Person<T> {
    T? name;
    Person({this.name})
}
```

## 异步

- Dart 是单线程语言，不适用异步就会痴呆阻塞

- Dart 通过 单线程 + 事件循环 处理耗时任务：

    执行所有同步代码 $\rightarrow$ 执行微任务队列（`Future.microtask()`） $\rightarrow$ 执行事件队列（`Future` / `Future.delayed()` / IO 操作）

- Future 包含三种状态：等待 / 成功 / 失败（中途抛出异常）

    !!!comment "这不是 Promise 吗"

    ```dart
    Future f = Future(() {
        return "Task finished";
        // throw Exception();
    });
    // 处理成功状态
    f.then((val) {
        print(val);
    });
    // 处理失败状态
    f.catchError((err) {
        print(err);
    });
    ```

- 链式调用：顺序执行多个异步任务、仅在最后抛出异常

    ```dart
    Future f = Future(() {
        return "task1";
    });
    f.then((val) {
        return Future(() => "${val}-task2");
    }).then((val) {
        return Future(() => "${val}-task3");
    }).then((val) {
        print(val);
    }).catchError((err) {
        print('Err: ${err}');
    });
    ```

`await` 会阻塞至 Future 逻辑执行完毕后，再执行下方同步代码

```dart
void f() async {
    try {
        String result = await Future(() {

        });
        // 仅成功时执行后续逻辑
        print("After Success;");
    } catch(err) {
        // 执行失败的逻辑
        print("Failed with ${err}");
    }

    print("Res: ${result}");
}
``` 
