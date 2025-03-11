# TypeScript

- TS 是 JS 的超集，但最终仍会被编译为 JS 交由浏览器等 JS 运行环境执行。相较于 JS，TS 提供了静态类型检查（麻烦）、接口、泛型等现代开发特性。

- 事实上，实现相同功能的 TS 代码量会大于 JS（因为要 dtype 嘛）

??? question "Hey，WHY TS？"
	1. JS 过于自由，以致：

		数据类型不清楚、访问不存在属性都不会报错
	
	2. 静态类型检查
	
		就比较像 C 了，TS 会在 **运行前** 进行检查

??? info "类型声明文件 `.d.ts`""

    > 梦回 C 语言头文件了

    此类文件会给 JS 库和模块加上类型信息，方便 TS 做类型检查。一般是成对出现的，例如：

    ```js title='demo.js'
    export function add(a,b) { return a+b }
    export function sub(a,b) { return a-b }
    ```

    ```ts title='demo.d.ts'
    // 只有声明
    declare function add(a: number, b:number): number;
    declare function sub(a: number, b:number): number;
    // 需要导出
    export { add, sub };
    ```

## 0 Install

简单的，拿 NPM 全局安装一下就可以了

```bash
npm install typescript -g
```

- 编译

  1. 手动把 TS 文件编译为 JS 文件（中文会被转为 UFT8 以保证兼容性）

     ```bash
     tsc fileName.ts # 会生成 fileName.js
     ```

  2. 自动化编译（这回逃不过建项目了）

     ```bash
     tsc --init # 会冒出 tsconfig.json
     
     tsc --watch fileName.ts # 手动添加需要监听的文件
     tsc --watch             # 监听路径下的所有 TS 文件
     ```

     ```json title='tsconfig.json'
     {
       'compilerOptions': {
         // 需要的 JS 版本
         'target': 'es2016'(ES7) / 'es2015'(ES6),
         // 出错时不进行编译，等价于 tsc --noEmitOnError
         'noEmitOnError': true,
       }
     }
     ```

## 1 常用类型

TS 中包含了：

- JS 的 **所有数据类型**：`string`, `number`, `boolean`, `null`, `undefined`, `bigint`, `symbol`, `object`
- 以及六个新类型：`any`, `unknown`, `never`, `void`, `tuple`. `enum`
- 以及两种可以自定义类型的方法：`type`, `interface`

### 1.1 类型声明

- 变量类型声明

    ??? info "自动装箱: 当你访问 `str.length` 时都发生了什么"
        ```js
        let str = 'hello'; // 显然 str 本身并没有 length 属性
        
        let size = (function() {
          // 自动创建一个临时 String 对象对原始字符串进行包装
          let tmpStrObj = new String(str);
          // 访问包装对象的 length
          let lenVal = tmpStrObj.length;
          // (自动)销毁临时对象，返回长度值
          return lenVal;
        })();
        ```

    ```ts
    let a1:string; // 语法就是 let [varName]:[varType]
    a1 = 9;        // 会报类型不匹配的错误
    a1 = new String('a'); // ❌

    /* ⚠️ JS 中的内置构造函数 String(), Number() 等用于创建包装对象(object)
          在日常开发时很少使用，请使用小写版本*/
    let a2:String; // 包装器对象 String > 基元 string
    a2 = new String('a'); a2 = 'a'; // ✅

    // 还能指定 dtype 为字面量
    let b: 'hello'; // c 只能 = 'hello'，那为啥不用 const？

    // 类型推断
    let c = -99;    // 推断 d:number
    c = 'hello';    // 类型不匹配

    // 感觉函数返回值也定义在后面怪怪的？
    function add(x:number, y:number):number {
      return x+y;
    }
    ```
- 对象类型声明

    ```ts
    let person: {
      name: string,
      age?: number,     // 可选属性，赋值时可以不传入
      [key:string]: any // 支持追加任何 key 为字符串的增加属性
    };

    person = {name:'tom', age:16}；
    ```

- 函数类型声明

    ```ts
    // 其实算是定义了 一组 函数的形式吧
    let count: (a:number, b:number) => number;

    function add(a:number, b:number):number { return a+b; }
    function sub(a:number, b:number):number { return a-b; }

    // 下面就都合法了
    count = add; count = sub;

    // 自动推断也行（不太严谨）
    count = (a,b) => { return a*b };          // ✅
    count = function(a,b) { return 'res=' + a/b }; // ❌
    ```

- 数组类型声明

    ```ts
    let arr: string[]; // 数组中的每个元素都是 string
    let arr: Array<number>;
    ```

### 1.2 常用类型

- Any：放弃对该变量的类型检查，彻底返祖为 JS（TS 就是 AnyScript）

    读任何属性都 **不会** 报错

    ```ts
    // 显式指定
    let a:any;
    a = 100; a = 'hello'; a = false; // ✅

    // 隐式指定：让他自己揣度圣意
    let b;
    b = 100; b = 'hello'; b = true;  // ✅

    // 但是有巨大 bug，any 可以被赋值给任意类型变量
    let c:string;
    c = a;          // ✅ 这就很抽象了
    ```

- Unknown：比 any 好一点，你不太确定的时候可以先拿它填上

    读任何属性 **都会** 警告（除非断言）

    ```ts
    let a:unknown;
    a = 100; a = 'hello'; a = false;     // ✅

    let x:string = a;                    // ❌
    if (typeof a === 'string') { x = a } // ✅
    x = a as string; x = <string>a;      // ✅ 用了断言
    ```

- Never：什么都不行（包括 `undefined`. `null`, `''`, `0`），一般是 TS 自己推断的

    ```ts
    function demo():never {
      ; // 你就算啥也不写也会寄 => TS 会自动返回 undefined
      ; // 只有 deadLoop(永恒嵌套)，或者永远不能正常退出（直接抛 Err）才行
    }

    let a:string;
    if (typeof a === 'string') {}
    else { console.log(a); }      // 这里的 a 是 never 类型（什么东西）
    ```

- Void：一般用于声明返回值，你不能拿返回值干任何事

    但是 `function():void != function():undefined`

    ```ts title='下面的写法都合法'
    function logMsg(msg:string):void {
      console.log(msg);
      // ✅ 没有 return, 返回 undefined 
    }

    function logMsg(msg:string):void {
      console.log(msg);
      return；          // ✅ 返回，自动补 undefined 
    }

    function logMsg(msg:string):void {
      console.log(msg);
      return undefined; // ✅ 手动返回 undefined 
    }
    ```

- object：其实有大小写两种，但因为范围太广（匹敌 `any`）、所以基本用不上

    - object：所有的 **非原始类型**，对象、数组、函数（都行）

    - Object：所有能调 Object 方法（比如 `toString`）的，不能存 `null` & `undefined`

- tuple：存储一组长度固定、值不可修改的元素

    ```ts
    let arr: [string, number];   // 只能存倆，第一个 str 第二个 num
    let arr: [string, boolean?]; // 可以没有 bool
    let arr: [number, ...string[]]; // 第一个一定是 num, 后面随便有几个 str
    ```

- enum：枚举（本质上还是 Object-int），switch-case 的时候看着语义化一点

    ```ts
    enum Direction { // 数字枚举：自动递增 + 反向映射
      UP,            // Direction[0]，Direction['UP'] == 0
      DOWN,
      LEFT,
      RIGHT
    }

    enum Direction { // 字符串枚举：很多字符串封装的是这个
      UP = 'up',
      DOWN = 'down'
    }

    // 常量枚举：编译时会内联（会把 Direction.UP 直接换成 0）
    const enum Direction {} 

    function walk(dir:Direction) {
      switch(dir) {
        case Direction.UP: break;
        case Direction.DOWN: break;
        case Direction.LEFT: break;
        case Direction.RIGHT: break;
      }
    }
    ```

- type：给类型起别名（相当于 `typedef`）

    ```ts
    // 联合类型（or）
    type Status = number | string;
    type Gender = '男' | '女';

    // 交叉类型
    type Area = {
      height: number, width:  number
    };
    type Address = {
      cell: number, room: number
    };
    type House = Area & Address;
    let house:House = {
      height: 100, width: 100,
      cell:   1,   room:  20
    }

    // 函数类型
    type LogFunc = () => void    // ⚠️ 并不严格返回空
    const f:LogFunc = function() {
      return 60;  // 这东西能行
    }
    // 但你不应该处理 void 的返回值
    let x = f(); console.log(x);        // ❌

    // 这是为了 forEach(遍历) map(迭代) 都能成立
    arr.forEach((item) => item += 1;)   // 返回 undefined
    arr.forEach((item) => b.push(item)) // 返回 push 结果（是个 int）
    arr.map((item) => {return item+1;}) // 返回 int
    ```

## 2 类

- 属性修饰符

    | Name | Rule |
    | :--: | :--  |
    | public | ALL（default） |
    | protected | 类内、子类 |
    | private   | 类内（子类不行）|
    | readonly  | 不能修改罢了 |

- 类的定义

    ```ts
    class Person {
      name: string
      age:  number
      // 构造函数
      constructor(name:string, age:number) {
        this.name = name;
        this.age  = age;
      }

      // 构造 + 成员定义也可以简写为下列形式
      constructor( // 你甚至不用一个个赋值
        public name: string,
        private age:  number
      ) {}


      // 其他的方法
      speak() {
        console.log(`My name is ${this.name}`)
      }
    }
    ```
    
- 类的继承
  
    ```ts
    // 完全不扩展的话连构造函数都不用写
    class Student extends Person {
      private readonly rank: number
      constructor(name:string, age:number, rank:number) { // 需要全接过来
        super(name, age); // 丢给父类
        this.rank = rank;
      }
      study() {
        console.log(`${this.name} is 勉强ing ...`)
      }
      override speak() { // 会被覆盖（不加关键词也行，但拼错了不会报错）
        console.log(`My rank is ${this.rank}`)
      }
    }
    // 创建实例
    cosnt s = new Student('小李', 18, 2);
    ```

- 抽象类：不能被实例化，只用来定义类的结构和行为

    你可以只写抽象方法（派生类必须实现），也可以稍微塞一些具体实现

    ```ts
    // 需要有 abstract 关键词
    abstract class Package {
      constructor(
        public weight: number
      ) {}

      abstract calculate(s:string):number // 不能有 {} 函数体

      printPkg() {
        console.log(`共计 ${this.calculate('aaa')} 元`)
      }
    }

    class StandardPkg extends Package {
      constructor(
        weight: number,
        private uniPrice: number
      ) { super(weight); } // 这句不能丢

      calculate() {
        return this.weight * this.uniPrice;
      }
    }
    ```

## 3 接口

`interface` 只能定义格式，不能包含 **任何实现**

!!! info "一个类可以 **实现多个** 接口，但只能 **继承一个** 抽象类"

- 定义类结构

    ```ts
    interface PersonInterface {
      name: string
      age:  number
      speak():void
    }

    class Person implements PersonInterface {
      constructor(
        name:string,
        age: number
      ) {}
      speak() {console.log(this.name)}
    }
    ```

- 定义对象结构

    ```ts
    interface UsrInterface {
      usrname: string
      pwd:     string
      age?:    number
      run:     (n:number) => void
    }
    // 已经变成 type 的形状力
    const usr: UserInterface = {
      name: 'admin',
      pwd:  '123',
      run(n) { console.log(`${n} meters`) }
    }
    ```

- 定义函数结构

    ```ts
    interface CountInterface {
      (a:number, b:number): number;
    }

    const add: CountInterface = (x, y) => {
      return x + y;
    }
    ```

- 接口继承

    ```ts
    interface PersonInterface {
      name: string
      age:  number
    }

    interface StudentInterface extends PersonInterface {
      grade: number
    }

    const stu: StudentInterface {
      name: 'aaa',
      age:  12,
      grade: 7
    }
    ```

- 自动合并

    ```ts
    interface PersonInterface {
      name: string
      age:  number
    }
    // 名字一样哦（有一种 CSS 感）
    interface PersonInterface {
      gender: string
    }
    ```

## 4 泛型

在定义 函数、类、接口 时，使用占位符规定类型（在具体使用时才被确定）

- 泛型函数

    ```ts
    function logData<T>(data:T) {
      console.log(data)
    }
    logData<number>(100);
    logData<string>('hello');

    // 可以有多个泛型
    function log<A,B>(p1:A, p2:B): A|B {
      console.log(p1)
      return Date.now() % 2 ? p1 : p2;
    }
    log<number, string>(123, 'aaa');
    ```

- 泛型接口

    ```ts
    interface SampleInter<T> {
      extraInfo: T
    }
    let s: SampleInter<number> {
      extraInfo: 200
    }

    // 还可以传一些奇怪的
    type JobInfo = {
      title: string
      company: string
    }
    let s: SampleInter<JobInfo> {
      exrtaInfo; {
        title: 'mentor',
        company: 'aaa'
      }
    }
    ```
  
## 5 装饰器

- 装饰器的本质是函数，可以对 类/属性/方法/参数 进行扩展。

- 但这东西至今仍是一个实验特性，需要手动调整配置开启

- 执行顺序：属性 => 参数 => 方法 => 类

- 执行时机

### 5.1 类装饰器

如果类装饰器的返回值是一个新的类，那么他会 **替换** 掉被装饰的类

```ts
/* 实际上这里用 Function 类不太恰当
   在 TS 中，Function 可以指代：普通函数、箭头函数、方法 etc.
   但不是所有 Function 类函数都能被实例化（比如箭头函数）
*/
function CustomToString(target:Function) {
  // 重写 toString 方法
  target.prototype.toString = function() {
    return JSON.stringify(this);
  }
  // 封锁：无法 修改/删除 对象的 属性/方法
  Object.seal(target.prototype);

  // 返回一个新的类
  return class {
    test() { console.log('oi') }
  }
}

@CustomToString // 此处相当于进行了 CustomToString(Person) 调用
class Person {
  name: string, age: int
}
```

如果我们想限制传入参数必须是 **构造函数**，那么 Function 就太宽了
```ts title="仅声明构造类型"
/* 我们需要自定义类进行解决
   new            表示该函数能被 new 关键字调用
   ...args:any[]  接受任意数量、任意类型参数
   => {}          返回一个对象（不是 null/undefined）
*/
type Constructor = new (..args:any[]) => {}

function test(fn: Constructor) {}

class Person {}
test(Person)   // 输入的参数是否为 Class
```
```ts title="声明构造类型+指定静态属性"
// 定义包含静态属性 wife 的构造类型
type Constructor = {
  new(...args: any[]): {}; // 构造其他属性签名
  wife: string;
}

function test(fn:Constructor) {}

class Person {
  static wife = 'asdf'
}
test(Person)   // 输入参数是否为具备特定静态属性的对象
```

---

现在，我们可以尝试为返回的类添加一个新的方法 LogTime 用于打印时间

```ts
type Constructor = new (...args:any[]) => {}

// 通过 LogTime 修饰的类将：保留原来的方法/属性 + 并添加 createdTime/getTime
function LogTime<T extends Constructor>(target: T) {
  return class extends target {
    createdTime: Date
    constructor(...args:any[]) {
      super(...args)
      this.createdTime = new Date()
    }
    getTime() {
      return `创建时间${this.createdTime}`
    }
  }
}

// 但原来的类会不承认 getTime() 方法，必须写一个借口让他认识一下
interface Person { // 起同一个名字 => 自动合并
  getTime(): void
}

@LogTime
class Person {}
```

### 5.2 装饰器工厂

“装饰器工厂”是一个返回 **函数装饰器** 的函数，这使得你可以为装饰器添加参数，从而更加灵活的控制装饰器的行为

???info "先来看一个反面例子"
    ```ts
    function LogInfo(target: Function) {
      target.prototype.introduce = function() {
        console.log(`My name is ${this.name}`);
      }
    }

    interface Person {
      introduce: () => void
    }

    @LogInfo                   // 装饰器传不了参数
    class Person {             // @LogInfo(3) 等价于 LogInfo(3)(Person)
      constructor(
        public name:string
      ) {}
    }

    const p = new Person('Tom');
    p.introduce();              // 那我们怎么手动调多次呢？
    ```

当一层传参解决不了的时候，我们就 **再包一层** ！

```ts
function LogInfo(n: number) {         // 这一层用来接参数
  return function(target: Function) { // 这层才是正经装饰器
    target.prototype.introduce = function() {
        for (let i=0; i<n; i++) {
          console.log(`My name is ${this.name}`);
        }
    }
  }
}

@LogInfo(5)        // 这下能连着 speak 5 次了
class Person {...}
```

### 5.3 装饰器组合

我们有 test1 & test4 两个 装饰器，和 test2 & test3 两个 装饰器工厂。

```ts
@test1
@test2()  // 工厂要加括号
@test3()
@test4
class Person {}
/*  调用顺序如下：
    1. 自顶向下执行工厂、返回装饰器
    2. 自顶向上执行装饰器（工厂部分执行返回的）
*/
```

### 5.4 属性装饰器

```ts
// 监视属性值的变化
function State(target: object, propertyKey: string) {
  /* target: 装饰实例属性时，为类的原型对象；装饰 static 属性时，为类本身
    propertyKey: 属性名 */
  let key = `__${propertyKey}`;
  /* 这边直接在原型上塞值，如果直接用 key 会塞在 prototype 上（相当于类共用了）
     但是 this[__key] 可以只操作对应的实例 */
  Object.defineProperty(target, propertyKey, {
    get() {
      return this[key]
    }
    set(neoVal) {
      console.log(`${propertyKey} has been set to ${neoVal}`)
      // 你也可以在这里批量更新页面上所有用到 age 的地方
      this[key] = neoVal
    },
    enumerable: true,  // 可枚举
    configurable: true // 可配置
  })
}
class Person {
  @State age: number // 这个是加在实例上的
}

// 这个是加载原型对象上的
let value = -1;
Object.defineProperty(Person.prototype, 'age', {
  get()    { return value},
  set(val) { value = val }
})

/* 如果先往原型上塞 age，再实例化。那么：
   1. 调用构造器时，this.age = age 会在原型链上查找 age 属性
   2. 原型上有、触发 setter，此时产生属性遮蔽
   ⚠️ 但是，先实例化、再往 prototype 上塞就不会属性遮蔽
*/
```

### 5.5 方法装饰器

```ts
// 在原方法前后添加一些逻辑
function Logger(target:object,prototype:string,descriptor:PropertyDescriptor) {
  // 三个参数分别为：原型对象/类本身（static），方法名，方法描述器
  const originnal = descriptor.value; // 存储原始方法
  descriptor.value = function(...args:any[]) { // 替换原方法
    console.log(`func ${propertyKey} BEGIN ...`);
    const res = originnal.call(this, ...args);  // 执行原函数，origginal() 会把 this 搞丢
    console.log(`func ${propertyKey} END`);
    return res; // 因为可能有返回值
  }
}

// 验证有效值，及时阻止原方法调用
function Validate(maxVal: number) { // 接受额外参数，所以用了工厂
  return function(target, prototype, descriptor) {
    const origin = descriptor.value;
    descriptor.value = function(...args: any[] {
      if (args[0] > maxVal) {
        throw new Error('年龄太大')
      }
      // 参数符合要求时，调用原始方法
      return origin.call(this, args); // call 的第二个参数传数组，不用析构
    })
  }
}

class Person {
  @Logger speak() [
    console.log(`${this.name}`);
  ]
  @Validate(100)
  static isAdult(age: number) {
    return age >= 18;
  }
}
```

### 5.6 访问器装饰器

```ts
function ValidateRange(minTemp, maxTemp) { // 要接参数
  return function(target, propertyKey, descriptor) {
    const originSet = descriptor.set;      // 这里不一样了哦
    descriptor.set = function(val) {
      if (val < minTemp || val > maxTemp) {
        throw new Error('invalid Temp!')
      }
      if (originSet) { // 因为这个属性可能没有写 setter
        originSet.call(this, val);
      }
    }
  }
}

class Weather {
  private _temp: number
  constructor(_temp:number) { this._temp = _temp; }

  @ValidateRange(-50, 50)
  set temp(val) { this._temp = val }
  get temp()    { return this._temp }
}

const w = new Weather(20);
w._temp;   // ❌ _temp 是私有的
w.temp;    // ✅ 会调用 get temp()
```

### 5.7 参数装饰器

参数装饰器的 **返回值会被忽略**

```ts
import 'reflect-metadata'
const requiredMetadataKey = Symbol("required");

// 把被注释的 参数idx 丢进 list
function required(target, propertyKey: string | symbol, parameterIndex: number) {
  // parameterIndex 是从 0 开始的参数索引
  let RequiredParams: number[] = Reflect.getOwnMetadata(requiredMetadataKey, target propertyKey) || [];
  RequiredParams.push(parameterIndex);
  Reflect.defineMetadata( requiredMetadataKey, existingRequiredParameters, target, propertyKey);
}

// 调用前验证：所有 required 参数均传入时，调用原方法
function validate(target, propertyKey, descriptor) {
  let orogin = descriptor.value;
  descriptor.value = function (...args) {
    let requiredParameters: number[] = Reflect.getOwnMetadata(requiredMetadataKey, target, propertyName);
    if (requiredParameters) {
      for (let paramIdx of requiredParameters) {
        if (paramIdx >= args.length || args[paramIdx] === undefined) {
          throw new Error("Missing required argument.");
        }
      }
    }
    return method.apply(this, args);
  }
}

class Person {
  @validate
  speak(@required msg: string, num: number) {
    console.log(`[${this.name}]: ${msg}`);
  }
}
```