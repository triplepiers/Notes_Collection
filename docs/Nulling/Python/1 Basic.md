> Python Crash Course (2nd Edition) *A Hands-On, Project-Based Introduction to Programming*

```python
print('Hello Python!')
```

## 1 变量与数据类型

### 1.1 变量
!!! info "**全大写** 表示「常量」，其值始终不变"

- 命名规则
	- 只能以 字母 / 下划线 *开头*
	- 只能 *包含* 数字、字母、下划线
	- *不能* 包含空格
- 同时为多个变量赋值 `a, b, c = 0, 0, 0`

### 1.2 字符串

1. Basic
	- 可以使用 单引号/双引号 包裹，支持互相嵌套
	- 特殊字符
		- `\t` 制表符（缩进）
		- `\n` 换行符
1. 方法
	- 删除空白
		- 删除结尾空白 `str.rstrip()` 返回修改结果（不改变原字符串）
		- 删除开头空白 `str.lstrip()`
		- 删除两侧空白 `str.strip()`
	- 修改大小写
		- `str.title()` 字符串中*每个单词*首字母大写，其余字符小写
		- `str.upper() / str.lower()` 全大写 / 全小写
	- 在字符串中使用变量
	  
	    => 在引号前标注 `f` 并使用 `{}` 包括变量/表达式
	  
        > 类似于 JS 模版字符串
	
	    ```python
	    firstName = 'ada'
	    lastName = 'wang'
	    fullName = f'{firstName} {lastName.title()}' # 'ada wang'
		```
		
	     > `f` 语法是在 Python 3.6 引入的，之前的版本需要使用 `format()`（类 C 写法）
		
		```python
		firstName = 'ada'
	    lastName = 'wang'
	    fullName = "{} {}".format(firstName, lastName.title())
		```

### 1.3 数

1. Type
	- 整数：支持加减乘除，乘方（`a**b`），取模（`a%b`）
	- 浮点数：结果可能是不精确的
2. Basic
	- 任意两数相除，结果均为浮点数（即便是可以整除的整数）
	- 只要操作数中 *存在* 浮点数，则返回结果为浮点数
	- 我们可以使用 `_` 作为数字分隔符（不一定是千位分隔）
	  > 仅 3.6 及以上版本支持
	  
1. 类型转换
     可以使用 `int(str)` 将字符串转成数字（默认十进制，出现非数字字符会报错）
	  
### 1.4 列表
> 你可以认为这是一个能同时包含 *任意类型元素* 的 Array

1. Basic

	- 访问列表元素
	  
	    > 使用从 0 开始的下标
	    
	    - 可以使用 `list[-1]` 访问最后一个元素 => 在列表为空时报错

	- 查看列表长度
	    
	    `len(list)` 返回列表实际长度
	    
	- 数值列表
	  > 我们可以使用 `range(a,b)` 生成从 a 到 b-1 的数列（类型不是 List）

		```python
		l1 = list(range(1,11)) # 1-10 的有序数字列表
		
		# 我们还可以使用第三个参数指定 step
		l2 = list(range(2,101,2)) # 2-100 的偶数
		
		# 结合 for 循环
		square = [] # 初始化一个 list
		for i in range(1,11):
			square.append(i**2) # 由 1^2 - 10^2 构成的列表
		```
		
		- 我们也可以使用 `min/max/sum(numList)` 对数值列表进行简单的统计计算
		- 列表解析（浓缩）
		    ```python
		    square = [i**2 for i in range(1,11)]
			# 有点像流式计算? 右侧提供 item，左侧产生 return Val
			```

	- 元组
	  
	     > 不可变的列表，尝试修改将报错（但是可以给变量赋其他值）
	     
		```python
		# 定义元组（使用圆括号）
		dimensions = (200, 50)
		# 即便只有一个元素，也要在末尾加逗号 => 元组实际石油逗号标识的
		dim = (200,)
		
		# 同样可以通过 for 循环遍历
		for d in dimensions:
			print(d)
		```

2. Methods
	- 操作元素
		- 修改列表元素：`list[idx] = newVal`
		- 添加元素
			- 在末尾添加元素 `list.append(newVal)`
			- 在中间插入元素 `list.insert(idx, val)`，其余元素依次后移
		- 删除元素
			- 使用 `del list[idx]` 删除指定位置上的元素，其余元素依次前移
			- 使用 `list.pop()` 删除末尾的元素
	- 列表排序
		- 永久排序
		  
		    `list.sort(reverse=true/false), reverseDefault = false` 将修改元素的实际顺序
		  
		- 临时排序
		  
		    `sorted(list)` 返回指定列表的排序结果（不修改列表中的世纪元素顺序）
		    
	- 反转列表
	  
	    直接调用 `list.reverse()` 即可反转列表中元素的实际位置

	- 遍历列表
	    ```python
	    for item in list:
		    # do sth for each item
		```

	- 切片
	  
	    切片可以直接作为 For 循环的遍历对象
	  
	    ```python
	    list[a:b] # 返回一个前闭合后开的子序列，支持缺省，支持 step
	    list[:4]  # 返回 0-3
	    list[2:]  # 返回 3-last
	    list[-3:] # 返回最后三个元素
		```

	- 复制列表
	  
		```python
		# 正确的方式
		l1 = [1,2,3]
		l2 = l1[:]

		# 错误的方式
		l2 = l1 # 只是复制了地址
		```

### 1.5 字典
> 可以认为是类 JSON 的结构？

1. Basic
	- 字典由一系列的键值对构成，值的类型可以是数字、字符串，也可以是列表乃至另一个字典
	    ```python
	    # 一个套娃展示
	    dict = {
		    'name': 'Tom',
		    'age': 40,
		    'major': ['Software', 'CS'],
		    'studentInfo': {
				'sName': 'stu',
				'sAge': 17
		    }
	    }
		```
	- 定义字典
	    ```python
	    dict = { # 字段名必须用引号包裹，坏耶！
		    'name': 'shen',
		    'age': 18
	    }
		```
	- 访问字典中的值 
		1. `dict['keyName']`，访问不存在的字段会报错
		2. `dict.get('keyName', returnValIfNotExist)` 第二个值可选（不存在不会报错）

1. Methods
	- 添加键值对（同名时就变成覆写哩）
	  
	    `dict['neoKeyName'] = neoVal`
	    
	- 删除键值对（删不存在的字段会报错）
	  
	    `del dict['keyName']`
	    
	- 遍历
		- 遍历键值对（这次需要两个参数啦）
		    ```python
		    for key,value in dict:
			    print(key, value)
			```
		- 遍历 Key（使用 `keys()` 方法）
		    ```python
		    fot key in dict.keys():
		    # keys() 返回了一个包含所有 keyName 的 List
		    # 我们可以使用 sorted(dict.keys()) 按字典升序访问所有 key
			    print(key)
			# 事实上 for key in dict 也行
			```
		- 遍历 Value
		    ```python
		    for val in dict.values():
			    print(val)
			# dict.values() 的返回值中允许存在重复项
			# 可以通过 set(dict.value()) 实现去重
			```

??? warning "注意区分「字典」与「集合」"
	「字典」与「集合」都是通过一对花括号定义的，具体类型看里面的内容：
	```python
	# 这是字典（有键值对捏）
	dict = {
		'name': 'N',
		'age': 20
	}
	# 这是集合（只有内容）
	set = {'name', 'age'}
	```

## 2 函数

### 2.1 定义函数
> 使用 `def` 关键字

```python
def funcName(paramList):
	#function body
	return sth # 也可以啥都不 return
```

### 2.2 参数传递

#### 2.2.1 位置传参
> 实参顺序与形参一致

- 实参 **顺序** 有意义
- 参数个数对不上（多了/少了）都会报错

```python
# 定义
def printPet(petType, name):
	print(f"{name.title()} it's a {petType.lower()}.")

# 调用 - 按顺序塞进去就行
printPet('Godzilla', 'harry')
```

#### 2.2.2 关键字传参
> 每个实参 = 键值对

- **顺序** 不重要
- **个数** 很重要

```python
# 还是上面的例子
printPet(name='harry', petType='Godzilla')
```

#### 2.2.3 默认值
> 在 **定义函数** 时为制定参数指定默认值（不传该参数不会报错）

- 无默认值的参数一定在有默认值的 **之前**
- 可以让一部分参数变得 **可选**（比如把默认值设为空串）

```python
def printPet(name, petType='dog'):
	print(f"{name.title()} it's a {petType.lower()}.")

# 不传 petType 是合法的
printPet(name='Willie')
# 不显示指定 name 也是合法的
printPet('Willie')
```

#### 2.2.4 列表传参
> 一般内部用 for 循环处理同质化信息

- 在函数中对实参进行的一切修改都是 **持久性的** ！
- 可以在传递实参时，使用切片传入 **副本**

```python
names = ['n1', 'n2', 'n3']

# 传址（修改会应用到本体）
def printNames(names):
	for n in names:
		print(n)
	names[-1] = 'last' # 实参的最后一个也会被修改为 last

printNames(names)    # 传本体
printNames(names[:]) # 传副本 => 规模大的时候效率比较低
```

#### 2.2.5 传递任意数量的实参

- `*toppings` 创建了一个名为 `topping` 的元组
	- Python 会见传入的所有实参都封装到这个元组中
	- 可以通过 下标 / 循环 对元组成员进行访问和遍历

	```python
	# 需要通过以下方式定义参数列表
	def makePizza(*toppings):
		print(toppings)
		for t in toppings:
			print(t)
	
	makePizza('tomato')           # ('tomato',)
	makePizza('tomato', 'potato') # ('tomato', 'potato')
	
	# 结合 位置传参 + 任意数量传参（ size 必填，topping 选填）
	def orderPizza(size, *toppings):
		print(size)
		print(toppings)
	```

- 若需传递任意数量的 **关键字实参**，则需要用俩 `*`
	- `**userInfo` 新建了一个 **字典**，存储了所有收到的键值对
  
    ```python
    def buildProfile(first, last, **userInfo):
	    userInfo['first'] = first
	    userInfo['last'] = last
	    return userInfo

	# 下边是一个调用实例
	info = buildProfile('see', 'bee', age=28, field='physics')
	```

### 2.3 返回值

- Python 支持返回 **任意类型** 的数据（包括字典和列表）

```python
# 一个支持可选形参的例子（用 None 作为占位符）
def buildPerson(first_name, last_name, age=None):
	person = {'fullName': f'{first_name} {last_name}'}
	# 动态追加 age 字段
	if age:
		person['age'] = age
	return person

# 下面两种输入都是合法的（p2 没有 age 字段）
p1 = buildPerson('Sea', 'Bee')
p2 = buildPerson('Sea', 'Bee', 28)
```

### 2.4 模块
> 通过划分模块，我们可以将代码分布到多个文件中，通过导入按需使用

#### 2.4.1 创建模块

- 所谓模块就是一个单独的 `.py` 文件

```python
# @ pizza.py
def makePizza():
	print('making')
def cookPizza():
	print('cooked!')
# 现在 pizza 就是一个独立的模块了！
```

#### 2.4.2 导入模块

- 模块间函数重名会导致 **相互覆盖**

```python
# 导入整个模块
import pizza
pizza.makePizza() # 需要带着模块名使用
pizza.cookPizza()

# 导入指定函数 from moduleName import funcName1, funcName2, ...
from pizza import makePizza
makePizza() # 直接使用
# cookPizza 没有导入，不能使用

# 导入所有函数
from pizza import * # 不建议使用

# 使用 as 指定别名
# 1. 给函数指定别名
from pizza import makePizza as mkPiz
mkPiz() # 使用别名调用
# 2. 给模块指定别名
import pizza as p
p.makePizza()
```

## 3 类

### 3.1 创建并使用类

#### 3.1.1 创建类

- 构造方法 `__init__()` 的首个形参必须是 `self`，功能类似于其他语言中的 `this`
	- 创建实例时，Python 将自动将新实例的引用传递给 `self`
	- 以 `self` 开头的成员变量可以供 **本类中所有方法** 访问

```python
class Dog:
	# 构造方法，会在创建实例自动调用（可以指定默认值捏（
	def __init__(self, name, age=0):
		self.name = name
		self.age = age

	# 一些简单方法示例
	def sit():
		print(f'{self.name.title()} is now sitting.')
		
	def roll_over():
		print(f'{self.name.title()} rolled over!')
```

#### 3.1.2 创建实例

```python
# 直接用 className(params) 就行了
myDog = Dog('Willie', 6)

# 访问属性 实例.变量名 即可
print(f"My dog is called {myDog.name.title()}")
# 调用方法 实例.方法名 即可
myDog.sit()
myDog.roll_over()

# 修改属性 实例.变量名 = 新值
myDog.age = 3
# => 也可以单独写一个 setter 方法并调用
```

### 3.2 继承

- 父类应该处于 **同一个文件中**、子类之前的位置
- 子类继承父类的 **所有** 方法和属性
	- 具有 **同名方法** 时，认为是 **重写** （子类覆盖父类）
- 构造函数中需要调用 `super.__init__(params)`

```python
class Car:
	def __init__(self, model, year):
		self.model = model
		self.year = year
		
	def get_model()
		return self.model

# 括号内写（一个）父类类名
class EletricCar(Car):
	def __init__(self, model, year):
		# 初始化父类
		super.__init__(model, year)
		# 初始化本类
		self.battery_size = 75

	def desc_battery():
		print(f'Battery size of this car is {self.battery_size} kW.')

eCar = ElectricCar('Honda', 2002)
print(eCar.get_model()) # 调用父类方法
eCar.desc_battery()     # 调用子类方法
```

#### 将实例作为属性

```python
# 我们可以将 battery 作为独立的类
class Battery:
	def __init__(self, brand, size):
		self.brand = brand
		self.size = size

	def get_range():
		print(f'This car can run {self.size*1.5} km.')

# 修改 ElectricCar，让 b 作为其属性
class EletricCar(Car):
	def __init__(self, model, year, battery):
		# 初始化父类
		super.__init__(model, year)
		# 初始化本类
		self.battery = battery

# 实例化电池
b = Battery('Nanfu', 25)
eCar = ElectricCar('Honda', 2002, b)
# 使用 battery 的方法
eCar.battery.get_range()
```

### 3.3 导入类

```python
# @ car.py
class Car:
	def __init__(self):
		self.type = 'car'
	def prtin_type():
		print(self.type)
		
class Battery:
	def __init__(slef):
		self.size = 75
		
# 导入单个类 @ main.py
from car import Car
c = Car()
c.print_type()
# 导入多个类用逗号分隔
# 导入所有累用 from module import *
# 以上三种均可以不带模块名直接使用

# 导入整个模块
import car
my_car = car.Car() # 需要带着模块名使用
```

## 4 基本结构

### 4.1 条件检查

- 使用 `==` `!=` 进行 相等/不等 检查
	- 相等检查 **区分大小写** => 可以全转小写比较
	- 此外支持 `<=` `>=` 等操作
- 使用 `and` `or` 关键字连接多个并列条件
- 使用 `in` `not in` 检查特定值是否包含在指定列表中

### 4.2 IF

```python
# 基本的多分枝示例
if condition1:
	do sth
elif condition2:
	do sth
else:
	do sth
```

### 43 While

- 支持 `break` / `continue`

```python
flag = initVal
while condition or flag:
	if  (subCondition1) break
	else(subCondition2) continue
	do sth or change flag```

## 5 标准库

### 5.1 获取用户输入

1. 文本输入
	- `input()` 将使程序暂停运行，当用户完成输入并按下回车后，返回除 `\n` 外的内容
	- 同时支持传入字符串作为输入提示，如 `input('please input:')`
	
	```python
	msg = input('Tell me something, and I will repeat it back to you: ')
	print(msg)
	```

### 5.2 随机数生成

```python
from random import randint, choice

randint(a,b) # 生成一个 [a,b] 的随机整数

choiceList = ['choiceA', 'choiceB', 'choiceC']
choice(choiceList) # 随机返回 List 中的一个元素
```

## 6 文件与异常

### 6.1 读取文件

- `open('path/to/target')` 接受一个字符串进行目标文件的指定，并返回文件对象
    > Windows 中应当使用 `\\` 划分路径（转义捏！）
    
- 关键词 `with` 自动在不需要文件后将其关闭（显然此处我们没有手动调用 `close()`）
	> 事实上手动调用 `close()` 更不保险 => 一些异常可能导致文件不被关闭
	
- `read()` 用于读取文件内容，并返回字符串（末尾会多返回一个 `\n`，可以通过 `rstrip()` 删除）

```python
# 也可以不指定编码形式
try:
	with oepn('target.txt', encoding='utf-8') as file_object:
		contents = file_object.read()
except:
	# 只读模式的 open() 不能打开「不存在」的文件
	print(f'File {filename} does NOT exist')

print(content)
```

#### 逐行读取

```python
filename = 'target.txt'

with open(filename) as file_object:
	for line in file_object:
		print(line)

# 直接输出会导致每行都多一个 `\n` => 可以使用 line.rstrip()

# 我们也可以通过 readlines() 创建包含文件各行的列表
with open(filename) as file_object:
	lines = file_object.readlines()

for line in lines:
	print(line.rstrip())
```

> Python 对于处理的数据量没有任何限制，只要系统内存足够多，你就可以直接处理一个超级大的文件

### 6.2 写入文件

- 需要为 `open()` 指定第二个实参 `'w'` 告诉 Python 你要对这个文件进行写操作
	> 实际上 `open()` 的第二个参数共有四种可能：
	> 1. `r` 只读（默认）
	> 2. `w` 写入
	> 3. `a` 附加
	> 4. `r+` 读写

	- 若指定的写入文件 **不存在**，`open()` 函数将 **自动创建**
	- 若指定的文件 **已存在**，`w` 模式将清除原本文件，并用新的内容进行 **覆盖**

- `write(str)` 只能接受 **字符串** 类型的参数，写数值则必须用 `str()` 转成字符串

```python
filename = 'program.txt'

witho open(filename) as file_object:
	file_object.write('I luv Python!')
	# 写入多行可以通过多次调用 write() 实现，记得自己在行末加 \n 换行
```

#### 附加模式

- 上面提到 `w` 模式将对旧文件进行 **覆盖**
    => 若希望仅 **追加**，可以用 `a` 模式打开（写到末尾）
	-  不存在的文件同样会被 `open` 自动创建

### 6.3 异常处理

```python
try:
	print(5/0) # 可能出现错误的代码块（ZeroDivisionError）
except ZeroDivisionError:
	print('divide by zero!') # 仅指定对 ZeroDivision 的处理手段
else:
	print('success') # 未抛出异常则同意执行 else 中的代码

# 使用 pass 可以真正的「假装无事发生」
except someError:
	pass # 哈哈，不管啦！
```

执行完 `except` 代码块的内容后，Python 将 **继续执行** 后续内容（假装无事发生）

### 6.4 数据存储
> JSON 我的好大儿！

- 别忘了 `import json` 
	- `json.dump()` 接受两个参数：待存储数据、目标文件对象，用于数据存储
	- `json.load()`  接受参数作为打开对象，用于读取数据

```python
# write
import json

data = [2, 3, 5, 7, 13]
file_name = `daat.json` # 扩展名用于说明数据格式为 JSON
# 写入（注意模式）
with open(file_name, `w`) as f:
	json.dump(data, f)

# read 模式为只读（不然读的是空白）
with open(file_name) as f:
	data = json.load(f)

print(data)
```

#### SAMPLE 获取历史用户名

```python
import json

def get stored_username():
	file_name = 'username.json' # 如果以前注册过就会存在
	try:
		with open(filename) as f:
			username = json.load(f)
		except FileNotFoundError:
			# 文件不存在 => 初次登陆
			return None # 让 greet_user 进行后续处理
		else:
			return username

def greet_user(): # 问候用户，指出其用户名
	username = get_stored_username()
	if username:
		print(f'Welcome back, {username} !')
	else:
		username = input('Please imput your name: ')
		file_name = 'username.json'
		with open(filename, 'w') as f:
			json.dump(username, f)
			print(f"We'll remember you when you come back, {username}!")

# 调用 greet_user （没有 main 好不习惯啊！）
greet_user()
```

## 7 测试
> 不会吧不会吧，不会还有人 **手动测试吧** ！

### 7.1 测试函数

- `unittest` 模块为我们提供了代码测试工具
	- 「单元测试」用于核实函数的 *某个方面* 没有问题
	- 「测试用例」是 *一组单元测试*
- 我们需要创建继承自 `unittest.TestCase`的类，进而编写一系列方法对函数的不同方面进行测试
	- 所有以 `test_` 开头的函数豆浆杯自动执行

```python
import unittest
from func import get_formatted_name # 待测试函数

# 测试用例
class NameTestCase(unittest.TestCase):
	def test_first_last_name(self):
		# 未输入中间名的样例
		formatted_name = get_formatted_name('janis', 'joplin')
		# 使用断言判断对错
		self.assertEqual(formatted_name, 'Janis Joplin')
	def test_first_last_middle_name(self):
		formatted_name = get_formatted_name('wolfgang', 'mozart', 'amadeus')
		self.assertEqual(formatted_name, 'Wolfgang Amadeus Mozart')

# 是否作为主程序执行
if __name__ == '__main__':
	unitest.main()
```

### 7.2 测试类

#### 7.2.1 常用断言方法

|           方法            | 用途        |
|:-------------------------:| ----------- |
|    `assertEqual(a,b)`     | 验证 a == b |
|   `assertNotEqual(a,b)`   | 验证 a != b             |
|      `assertTrue(x)`      | 验证 x == True           |
|     `assertFalse(x)`      |  验证 x == False          |
|  `assertIn(item, list)`   |     验证 item 在 list 中    |
| `assertNotIn(item, list)` |        验证 item 不在 list 中     |

#### 7.2.2 编写测试

```python
import unittest
from survey import AnonymousSurvey

class TestAnonymousSurvey(unittest.TestCase):
	def test_store_single_response(self):
		# 测试存储单个答案
		question = 'What language is the best?'
		my_survey = AnonymousSurvey(question)
		my_survey.store_response('Python')
		self.assertIn('Python', my_survey.responses)

	def test_store_triple_responses(self):
		question = 'What language is the best?'
		my_survey = AnonymousSurvey(question)
		responses = ['Python', 'Java', 'PHP']
		for r in responses:
			my_survey.store_response(r)
			
		for r in responses:
			self.assertIn(r, my_survey.responses)

if __name__ == '__init__':
	unittest.main()
```

---

为每一个测试函数单独手打测试用例非常的难受 => 使用 `setUp()` 吧！

- 在 `setUp()` 中定义的变量可以被 **所有测试函数** 使用

```python
import unittest
from survey import AnonymousSurvey

class TestAnonymousSurvey(unittest.TestCase):
	def setUp(self):
		question = 'What language is the best?'
		my_survey = AnonymousSurvey(question)
		responses = ['Python', 'Java', 'PHP']
	def test_store_single_response(self):
		# 通过 self 访问 setUp 中定义的变量
		self.my_survey .store_response(self.responses[0])
		self.assertIn(self.responses[0], self.my_survey.responses)
	def test_store_triple_responses(self):
		for r in self.responses:
			self.my_survey.store_response(r)
		for r in self.responses:
			self.assertIn(r, self.my_survey.responses)

if __name__ == "__init__":
	unittest.main()
```