---
date: 2026-10-27
categories:
  - C\#
  - Unity
---

# Unity 中的 Attribute-based 反射机制

- "反射" 的<u>本质</u>在于：在 <u>运行时</u> 读取程序的元信息（metadata），从而动态地访问/读取/调用对象的属性和方法

- 此外，Unity 支持通过 tag（实际上是 Attribute）实现一些妙妙小功能：`

    - [Range(0,1)]` 可将变量的取值范围限制到 $[0,1]$`
    - `[Header("sth")]` 会在 Inspector 菜单中显示小标题 "sth"

我们将在本文中讨论其实现原理与自定义实现

<!-- more -->

## 1 反射能做到什么？

### Basics
> 需要 `using System.Reflection`

1. 动态调用方法：`action` 可以由外部传入

    ```c#
    Player p = new Player();    // 具有 attack / heal 两种方法
    Type type = typeof(Player);
    
    string action = "attack"; // or "heal"
    MethodInfo? method = type.GetMethod(action); // 获取
    method!.Invoke(p, null);                     // 调用     
    ```
    
2. 动态实例化

    ```c#
    var type = typeof(SomeClass); // 动态指定 Class
    var instance = Activator.CreateInstance(type);
    ```

3. 判断类型的父子关系

    ```c#
    Type t1 = typeof(Class_A);
    Type t2 = typeof(Class_B);
    bool isSubcls = t1.IsSubclassOf(t2);
    ```

4. 获取某 Class 所在程序集信息

    ```c#
    var type = typeof(SomeClass);
    var assembly = Assembly.GetAssembly(type);
    var types = assembly.GetTypes(); // 获取程序集中的所有类型
    ```

### in Unity

Unity 提供了基于特性（Attribute）的反射机制。

例如，以下代码将在 Inspector 菜单中显示 "Reset Player" 按钮、并在点击后执行方法 `ResetPlayer()`：

```c#
public class Player: MonoBehaviour
{
    [ContextMenu("Reset Player")]
    private void ResetPlayer()
    {
        Debug.Log("Player Reset");
    }
}
```

## 2 C# 反射原理

1. MetaData 提供了结构信息

    C# 在编译后会变成 中间语言（IL）+ 元数据（MetaData）、被打包进 Assembly（`.dll / .exe`），而不是直接变成机器码。
    
    其中，MetaData 中记录了大量程序结构信息：

      - 有哪些类型（类、结构、枚举）：叫什么、在哪个命名空间
      - 每个类型有哪些字段、属性、方法，以其类型、可见性、参数
      - 类型和成员上有哪些特性（Attribute）

2. C# 提供调用能力

    .NET 的 CLR（Common Language Runtime）则提供了一系列 API，使我们能够在运行时 读取/修改 这些 MetaData
    
### 反射调用原理

基于反射的方法调用可被拆解为以下三个步骤：

1. 方法查找：通过 `Type.GetMethod("Attack")` 查询 Class 元数据，找到符合查找条件的方法并获得对应的 MethodInfo。

2. 准备调用参数：通过 `Invoke()` 提供目标对象/示例和参数数组。

3. 运行时将检查目标、参数和访问条件，并通过反射调用机制执行方法
   
!!!warning "反射调用带来的额外开销"
    - 直接调用可以简单的 <u>直接将方法名转换为机器指令</u>
    - 而 `MethodInfo.Invoke()` 需要处理参数匹配、装箱拆箱、返回值封装以及异常等问题。

### Unity 特性反射原理

Unity 已经知道并约定好了这些 Tag 的含义，不同子系统将按照自己的步调进行读取、进而生成菜单、关联方法和执行逻辑。

- `[SerializeField]`、`[HideInInspector]` 等字段特性会在 Inspector 显示对应组件时被读取，以判断哪些字段会被序列化、显示在 Inspector 上

- `[ContextMenu]`、`[CustomEditor]` 等编辑器特性则会在编辑器流程中被识别，以便用户点击菜单时能执行对应方法

## 3 自己动手实现

### 自定义特性 `GameAction`

!!!info "需求：只要给某个方法添加 `[GameAction]`，框架就能自动发现它、并将其注册为游戏指令"

1. 继承 Attribute，自定义特性 `[GameAction]`

    `AttributeUsage`：规定了适用范围，可选值为 `[Method, Field, Property]`、可通过 `|` 并联
    
    ```c#
    [AttributeUsage(AttributeTargets.Method)] // 仅对方法生效
    public class GameActionAttribute : Attribute
    {
        public string Name { get; }
        
        public GameActionAttribute(string name) // 实现构造函数
        {
            Name = name;
        }
    }
    ```

2. 应用自定义属性

    - `xxxAtribute` 可直接被简写为 `xxx`，此案例中即为 `GameAction`

    - `[GameAction(args)]` 等价于调用 `GameActionAttribute` 的构造函数、入参应与定义一致

    ```c#
    public class Player
    {
        [GameAction("attack")]
        public void Attack()
        {
            Console.WriteLine("攻击！");
        }
    } 
    ```

3. 通过反射找到所有具有 `GameAction` 特性的方法

    ```c#
    Player player = new Player();
    Type type = player.GetType();

    // ⚠️ GetMethods() 只能扫到 public 方法
    foreach (MethodInfo method in type.GetMethods())
    {   
        var attr = method.GetCustomAttribute<GameActionAttribute>();
        if (attr != null)
        {
            Console.WriteLine($"{attr.Name} -> {method.Name}");
        }
    }
    ```

### 应用：简单指令执行器

```c#
public static void ExecuteAction(object target, string action)
{
    // ⚠️ 添加 BindingFlags，以扫描私有方法
    var methods = target.GetType().GetMethods(
        BindingFlags.Instance |
        BindingFlags.Public |
        BindingFlags.NonPublic
    );

    // 查找并调用（首个） attr == target 的方法
    foreach (var method in methods)
    {
        var attr = method.GetCustomAttribute<GameActionAttribute>();
        if (attr?.Name == action)
        {
            if (method.GetParameters().Length != 0)
                throw new InvalidOperationException("该指令不支持参数");

            method.Invoke(target, null);
            return;
        }
    }

    throw new InvalidOperationException($"未知指令：{action}");
}
```

- 用例如下（也就是之前所说的 `action` 由外部传入的例子）：

    ```c#
    var player = new Player();

    ExecuteAction(player, "attack");
    ExecuteAction(player, "heal");
    ```

- 存在的问题
    
    - 上面的实现没有处理重复指令名、继承成员冲突等情况。
    
    - 实际项目通常会在<u>初始化</u>时扫描一次，把指令名称与方法信息<u>缓存到字典中</u>，避免每次执行都重新遍历。

### 小结

我们可以将整个过程概括如下：

```
① 定义特性           GameActionAttribute : Attribute
     ⬇
② 添加标记                [GameAction("attack")]
     ⬇
-----------------------------------------------------------------
     ⬇
③ 框架扫描 MetaData  GetMethods() + GetCustomAttribute()
     ⬇
④ 建立映射               "attack"(attr) → MethodInfo
     ⬇
⑤ 运行时执行                 根据指令查找方法，并调用
```

其中：

- Step 1~2 由 Attribute 提供声明式标记：告知框架哪些成员具有什么特征。
- Step 3~5 则由 Reflection 负责发现和操作：在运行时读取标记，并采取行动。

## 4 Tips

- 框架需要 **主动编写扫描和注册逻辑**，Attribute 本身不会自动触发

- 反射一般仅用于编写“开发工具” 或 模块的初始化生成（如网络模块注册所有的协议处理函数）、很少用于业务逻辑
