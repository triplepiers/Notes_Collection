# 装饰器

!!!info "本质：在 函数/类 <u>定义</u>时，使用装饰器返回的新对象替换函数名/类名的 <u>指向内容</u>"

Python 中的任何 Callable 对象都可以作为装饰器、通过 `__call__` 方法被调用

## Hello World

```py
def deco(fn):
    print('hello deco')
    return fn

@deco
def foo():
    print('#This is foo')
```

- 运行上述代码会输出 `hello deco`（即使我们 <u>没有调用 `foo()`</u>）

    => 在 <u>定义 `foo`</u> 时立刻执行了替换、并输出 `hello deco`

- 执行以下片段：

    ```py
    foo()         # => #This is foo（不会输出 hello deco）

    foo.__name__  # => foo
                  #    deco 返回了 foo（原函数）
    ```

## 函数装饰器

标准实现是返回一个 `wrapper` 函数（也可以叫其他名字）

```py
def outer_deco(fn):
    print('「OUTER」Definition Phase ...')

    def outer_wrapper(*args, **kwargs):
        print('prev_outer')
        fn(*args, **kwargs)
        print(f'{fn.__name__ = }')
        print('post_outer')
    
    return outer_wrapper

def inner_deco_1(fn):
    print('「INNER-1」Definition Phase ...')

    def inner_wrapper_1(*args, **kwargs):
        print('prev_inner_1')
        fn(*args, **kwargs)
        print('post_inner_1')
    
    return inner_wrapper_1

def inner_deco_2(fn):
    print('「INNER-2」Definition Phase ...')

    def inner_wrapper_2(*args, **kwargs):
        print('prev_inner_2')
        fn(*args, **kwargs)
        print('post_inner_2')
    
    return inner_wrapper_2

@outer_deco
@inner_deco_1
def foo_1():
    print('*foo1*')

@outer_deco
@inner_deco_2
def foo_2():
    print('*foo2*')
```

- 执行上述代码（显然我们没有实际调用 `foo1 & foo2`），会显示：

    ```title="定义阶段立刻执行"
    「INNER-1」Definition Phase ...
    「OUTER」Definition Phase ...
    「INNER-2」Definition Phase ...
    「OUTER」Definition Phase ...
    ```

- OK，现在来看看被替换的内容：

    ```py 
    print(foo_1.__name__) # outer_wrapper
                          # 实际是 outer_wrapper(inner_wrapper_1(foo_1))

    print(foo_2.__name__) # outer_wrapper
                          # 实际是 outer_wrapper(inner_wrapper_2(foo_2))
    ```

- 让我们看看调用会发生什么，<u>装饰器调用顺序 `由内向外`</u>

    ```title="foo_1()"
    prev_outer
    prev_inner_1
    *foo1*
    post_inner_1
    fn.__name__ = 'inner_wrapper_1'  # inner_wrapper_1(foo_1)
    post_outer
    ```

    ```title="foo_2()"
    prev_outer
    prev_inner_2
    *foo2*
    post_inner_2
    fn.__name__ = 'inner_wrapper_2'  # inner_wrapper_2(foo_2)
    post_outer
    ```

### 生产级 log 装饰

```py title="setting"
import logging
import time
from functools import wraps

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s"
)
```

```py
def log(                # 该层用于接收装饰器配置参数
    func=None, * , level="info", 
    log_args=True, log_result=True, log_cost=True
):
    """
    日志装饰器，支持：@log / @log() / @log(level="debug", log_args=False)
    """
    def decorator(fn): # 该层用于实际装饰函数
        @wraps(fn)     # 保留原函数信息（name & docstring)
        def wrapper(*args, **kwargs):
            """获取 logger 配置"""
            logger = logging.getLogger(fn.__module__)
            log_method = getattr(logger, level.lower(), logger.info)

            """打印被调函数信息"""
            func_name = fn.__qualname__
            if log_args:
                log_method(f"开始调用 {func_name}, args={args}, kwargs={kwargs}")
            else:
                log_method(f"开始调用 {func_name}")

            start = time.time()

            """运行（+异常处理）"""
            try:
                result = fn(*args, **kwargs)
            except Exception as e:
                cost = time.time() - start
                logger.exception(f"{func_name} 执行异常, 耗时 {cost:.4f}s, error={e}")
                raise
            else:
                cost = time.time() - start
                msg = f"{func_name} 执行成功"
                if log_cost: msg += f", 耗时 {cost:.4f}s"
                if log_result: msg += f", result={result}"
                log_method(msg)
                return result

        return wrapper


    if func is not None: return decorator(func) # 兼容 @log
    return decorator                            # 兼容 @log()
```

```py title="usage"
@log(level="debug")
def foo_1():
    print('in foo1') # 不打印 log => DEBUG < INFO (global)

@log
def foo_2():
    print('in foo2') # 打印 log => default = INFO
```

## 类装饰器

!!!info "在类定义完成后，动态 添加方法 / 修改属性 / 注入逻辑"

- 我们可以通过以下装饰器统一实现数据类的 `__repr__` 方法，避免每次打印都是 `<__main__.User object at 0x...>`

    ```py
    def add_repr(cls):
        # 动态生成 __repr__ 方法
        def __repr__(self): 
            attrs = ", ".join(f"{k}={v!r}" for k, v in self.__dict__.items())
            return f"{cls.__name__}({attrs})"
        
        # 把生成的方法塞给这个类
        cls.__repr__ = __repr__
        return cls

    @add_repr
    class User:
        def __init__(self, name, age):
            self.name = name
            self.age = age

    """Usage"""
    u = User("Alice", 25)
    print(u)     
    ```

### 属性装饰器

!!!info "将方法伪装成属性，实现优雅的数据校验、类型转换和延迟计算"
  - 「Getter」`@property`：将指定方法伪装为属性，在赋值时 <u>自动调用 `@[fn].setter`</u> 执行数据校验、格式化等操作

  - 「Setter」`@[fn].setter`：与伪属性对应（可不实现）

```py title=""
class Temperature:
    def __init__(self, celsius=0):
        self._celsius = celsius # 使用内部变量存储真实数据

    # ================= 只读属性 (Getter) =================
    @property
    def fahrenheit(self): # 实现延迟计算
        print(" [触发计算] 正在将摄氏度转换为华氏度...")
        return self._celsius * 9/5 + 32

    # ================= 读写属性 (Getter & Setter) =================
    @property       # Getter
    def celsius(self):
        return self._celsius

    @celsius.setter # Setter
    def celsius(self, value): # 拦截赋值、校验数据
        if value < -273.15:
            raise ValueError("温度不能低于绝对零度 (-273.15°C)")
        print(f" [触发校验] 温度已合法更新为 {value}°C")
        self._celsius = value
```

```py title="Usage"
t = Temperature(25)

# 1. 访问伪属性方法（不需要加括号）
print(t.fahrenheit)  
# 输出: 
#  [触发计算] 正在将摄氏度转换为华氏度...
#  77.0

# 2. 自动触发 setter 校验
t.celsius = 30       # 输出: [触发校验] 温度已合法更新为 30°C
print(t.celsius)     # 输出: 30

# 3. 触发校验失败
t.celsius = -300     # 抛出 ValueError: 温度不能低于绝对零度
```