> Python Crash Course (2nd Edition) *A Hands-On, Project-Based Introduction to Programming*

```python
print('Hello Python!')
```

## 1 变量与简单数据类型

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
	- 整数：支持加减乘除，`a**b = a^b`
	- 浮点数：结果可能是不精确的
2. Basic
	- 任意两数相除，结果均为浮点数（即便是可以整除的整数）
	- 只要操作数中 *存在* 浮点数，则返回结果为浮点数
	- 我们可以使用 `_` 作为数字分隔符（不一定是千位分隔）
	  > 仅 3.6 及以上版本支持