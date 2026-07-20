# Flutter

> 跨平台框架，需要先看 [Dart 基础](./Dart.md)

## Set Up

```bash
brew install dart-sdk
dart --version        # 验证安装

brew install --cask flutter
```

## 项目创建

```bash
# 仅 Web 平台
flutter create --platform web <PROJECT>

# 运行
cd <PROJECT>
flutter run -d chrome # 在 Chrome 中打开
```

- 项目目录

    ```text
    .
    ├── analysis_options.yaml # 静态代码分析工具配置
    ├── build                 # 构建产物
    ├── lib                   # 源码目录
    |    └── main.dart        # 项目入口
    ├── pubspec.lock          # 依赖版本锁定
    ├── pubspec.yaml          # 依赖配置
    ├── README.md
    ├── test                  # 测试目录
    ├── <PROJECT>.iml         # Module 特定配置
    └── web                   # Web 平台配置与资源
    ```

- 启动文件说明

    ```dart
    void main() {
        runApp(const MyApp()); // runApp 是 Flutter 应用的默认启动函数，入参是一个 Widget
    }
    ```

## 事件

- GestureDetector：包裹组件，用于检测触摸屏幕 / 滑动 / 点击 等用户交互事件

    ```dart
    GestureDetector(
        onTap: () {         // 单击
            print("你刚才动了，对不对？")
        },
        onDoubleTap: () {}, // 双击
        child: Text("只是一段文本")
    )
    ```

- 组件内置事件

    - Button 类组件：内置点击动画和样式，通过 `onPressed` 捕获处理

    - InkWell 类视觉反馈组件：提供 `onTap` ，提供 Material 风格的水波纹扩散交互

    - Switch / CheckBox 等交互组件：处理 `onPressed` 等固定事件

## 组件

### 基础组件
> Flutter 内置了一套 Material 设计风格的组件

- MaterialApp：包裹整个应用，用于设置应用的全局属性

    ```dart
    import 'package:flutter/material.dart';

    void main() {
        runApp(
            MaterialApp(
            title: "aha",     // 页面标题
            home: Scaffold(), // 窗口主体内容
            theme: ThemeData( // ColorTheme
                scaffoldBackgroundColor: Colors.blueAccent
            ),
            ),
        );
    }
    ```

- 元素组件

    - Text

        - `data`：显示的文本串
        - `style`：样式表
            - `maxLines`：显示的最大行数
            - `overflow: TextOverflow.ellipsis`：超出部分变成 ...
        - `textAlign`：在容器内的 **水平** 对齐方式

        ```dart
        // 在一段文本中显示不同样式: Text.rich` + TextSpan
        Container(
            child: Text.rich(
                TextSpan(
                    text: "Hello", 
                    // 父级颜色
                    style: TextStyle(color: Colors.red)
                    children: [
                        TextSpan(text: "Flutter", style: TextStyle(color: Colors.green)),
                        TextSpan(text: "!", style: TextStyle(color: Colors.yellow)),
                    ]
                )
            )
        )
        ```
    
    - Image

        > - `asset()` 需要在 `pubspec.yaml` 中声明资源路径
        > - 移动端使用 `network()` 需要配置网络权限

        | Type | Desc | 
        | ---  | ---   |
        | `asset()` | 加载资源目录 `/asset` 中的图片 |
        | `network()` | 从网络地址加载 |
        | `file()` | 从设备本地文件加载 |
        | `memory()` | 从内存加载 |
        
        - `width / height`: double，设置图片显示区域尺寸
        - `alignment`: 图片在显示区域内的对齐方式
        - `fit`: 拉伸 / 剪裁 / 保持原比例
        - `repeat`: 图片小于区域时，是否重复平铺

    - TextField：请输入文本 ...

        - `style` / `decoration` / `maxLines`：样式相关
        - `controller`：用于获取 / 设置文本内容，监听变化
        - `onChanged` / `onSubmitted`：回调

        ```dart
        // 每个输入框需要单独的 Controller
        TextEditingController _pwdController = TextEditingController();
        Column(children: [
            TextField(
                obscureText: true, // 密码掩码显示
                decoration: InputDecoration(fillColor: Colors.yellow, filled: true),
                controller: _pwdController,
                onChanged: (val) {
                    print(val);    // 更新后的完整文本
                }

            ),
            SizedBox(height: 10), // 提供 margin-bottom
            TextButton(onPressed: () {
                print(_pwdController.text); // 获取文本
            }, child: Text("登录"))
        ])
        ```

- 布局组件

    | 类型 | 组件 | 使用场景 |
    | - | - | - |
    | 基础容器 | Container, Center, Align, Padding | 提供尺寸、对齐、边距等基础样式 | 
    | 线性布局 | Row, Column | 水平/垂直方向依次排列 | 
    | 弹性布局 | Flex, Expanded, Flexible  | 按比例分配空间、自适应布局（会和 Row/Col 叠用） | 
    | 层叠布局 | Stack, Positioned | 图片叠文字 / 悬浮按钮（zindex 神力） | 
    | 流式布局 | Wrap, Flow | 自动换行 | 
    | 滚动布局 | ListView, GridView | 可滚动的列表/网格视图 | 

    - Container

        - 尺寸优先级：明确定义 > constraints > 父组件约束 > 自适应大小

        - 样式：通过 `decoration` 属性定义（和 `color` 属性互斥）

        - 布局：内外边距和对齐

        - 变换：旋转 / 平移 等

        ```dart
        Container(
            width: 200,
            height: 200,
            margin: EdgeInsets.all(20),
            transform: Matrix4.rotationZ(0.05), // 弧度
            alignment: Alignment.center,
            // 样式单独套一层就很不 CSS 啊
            decoration: BoxDecoration(
                color: Colors.greenAccent,
                borderRadius: BorderRadius.circular(5),
                border: Border.all(width: 2, color: Colors.teal),
                boxShadow: [
                    BoxShadow(
                    color: Colors.grey.withValues(alpha: 0.5),
                    blurRadius: 5,
                    offset: Offset(2, 2),
                    ),],),
            child: Text(
                "hello",
                style: TextStyle(
                    color: Colors.white, 
                    fontSize: 20
            ),),
        ),
        ```
    
    - Center：在父组件内 水平 + 垂直 居中、无法设置宽高（占满父组件）

    - Align

        - `alignment`：枚举值，在父组件内的对齐方式
        - `width/heightFactor`：Align 组件撑开的宽高为 子组件宽高*Factor
    
    - Row / Column：顺序排列子组件

        - `mainAxisAlignment` / `crossAxisAlignment`：主轴 / 交叉轴 对齐方式
        - `mainAxisSize`：Column 本身在主轴方向的尺寸，max（占满） / min（仅包裹子组件）

    - Flex：水平/垂直排列子组件，且能控制其尺寸比例

        - `direction`: horizonal / vertical
        - `mainAxisAlignment` / `crossAxisAlignment` / `mainAxisSize`
        - 子组件为 Expaneded（强制占满空间、不受 `width` 限制） / Flexible（会被 `width` 限制最大宽度），通过 `flex` 属性控制体积比例

        ```dart
        Flex(
            direction: Axis.horizontal,
            children: [
              Expanded(
                flex: 2,
                child: Container(height: 100, color: Colors.amber),
              ),
              Expanded(
                flex: 1,
                child: Container(
                  height: 100,
                  color: const Colors.yellow,
                ),
              ),
            ],
          ),
        ```
    
    - Wrap：流式布局，主轴自动换行

        - `direction`：主轴方向
        - `alignment / runAlignment`：主轴 / 交叉轴对齐方式
        - `spacing / runSpacing`：主轴 / 交叉轴 子组件间隔

        ```dart
        // 批量生成 Squre
        List<Widget> genItemList(int len) {
            return List.generate(
                len,
                (idx) => Container(width: 100, height: 100, color: Colors.cyan),
            );
        }

        Wrap(
            direction: Axis.horizontal,
            spacing: 10,
            runSpacing: 10,
            children: genItemList(10),
        )
        ```

    - Scaffold：核心布局组件，提供页面骨架

        ```dart
        Scaffold(
            // 顶栏
            appBar: AppBar(title: Text("aaa组件批发")),
            // 主体
            body: Center(child: Text("这是 Body")),
            // 底栏：没有默认高度时，会把 body 高度挤没
            bottomNavigationBar: SizedBox(
                height: 80,
                child: Center(child: Text("假装有导航菜单")),
            )
            // 悬浮操作按钮：用于触发页面动作
            floatingActionButton: Widget(...)
        )
        ```
    
    - Stack：zindex 万岁！

        - 宽高由**父组件**确定

        - `position`：非 Positioned 子组件在 Stack 内的排列位置，默认左上（堆叠）、后来者居上
        - `fit`：非 Positioned 子组件如何适应 Stack 容器尺寸
        - `clipBehavior`：子组件超出时的裁剪方式

        - Positioned 必须作为 **直接** 子组件，通过 top/bottom/left/right 控制位置

        ```dart
        SizedBox(
          width: double.infinity,
          height: double.infinity,
          child: Stack(
            children: [
              SizedBox(
                width: double.infinity,
                height: double.infinity,
                child: Center(child: Text("Main Content")),
              ),
              // 右下塞一个 btn
              Positioned(
                right: 10,
                bottom: 10,
                child: IconButton(onPressed: () {}, icon: Icon(Icons.move_up)),
        ),],),),
        ```

- 滚动组件

    | 组件 | Feature | 场景 |
    | --- | -------- | --- |
    | SingleChildScrollView | 滚动单个子组件、一次性渲染所有内容 | 内容不固定，但总量较少 |
    | ListView | 支持懒加载 | 聊天记录等单列滚动布局 |
    | GridView | 支持懒加载、可以固定列数 | 图片墙 / 商品网格 |
    | CustomScrollView | 组合多个 Sliver 实现复杂布局 | App 首页等复杂滚动场景 |
    | PageView | 整夜滚动（横/纵） | 轮播图 / 翻页 |

    - SingleChildScrollView：
        
        > 具有大量 Item时，应该使用 `ListView`

        ```dart
        // 用于控制滚动距离
        ScrollController _controller = ScrollController();
        SingleChildScrollView(
            controller: _controller,
            scrollDirection: Axis.vertical(), // 默认，也可以修改为水平
            child: Column(                    // <= 让 Column 能滚动
                children: [ Text(), Text(), ...]
            )
        )

        // 跳变
        _scroller.jumpTo(0);                                    // scroll -> Top
        _scroller.jumpTo(_controller.position.maxScrollExtent); // scroll -> Bottom

        // 平滑滚动
        _scroller.animateTo(0, duration: Duration(seconds: 1), curve: Curves.easeIn);
        ```
    
    - ListView：支持懒加载、仅构建可见区域列表项

        ```dart
        ListView.builder( // ListView() 默认一次性构建所有 item
            itemCount: 100, // 完整列表长度
            itemBuilder: (BuilderContext ctx, int idx) { // 自动按需构建
                return Container(child: Text('第${idx+1}项'));
            },
            controller: 
            children: [ Text(), Text(), ...]
        )

        ListView.seperated( // 提供 Item 之间的分隔样式
            itemCount: ..., itemBuilder: () {},
            seperatorBuilder: (BuilderContext ctx, int idx) {
                return Container(height: 10, width: double.infinity);
            }
        )
        ```

    - GridView

        ```dart
        GridView.count( // 固定 Column 数量
            scrollDirection: Axis.vertical, // 默认纵向
            crossAxisCount: 3, // 列数
            mainAxisSpacing: 10, crossAxisSpacing: 10, // Gap
            children: [ Text(), Text(), ...]
        )

        GridView.extent( // Item 宽/高 固定
            maxCrossAxisExtent: 100, // Item 最大宽度（横向滚动时为高度）
            mainAxisSpacing: 10, crossAxisSpacing: 10, // Gap
            children: [ Text(), Text(), ...]
        )

        GridView.builder( // 懒加载
            itemCount: 100,
            itemBuilder: (ctx, idx) {return Item},
            // 需要一个单独的布局对象（也有固定高度的选项）
            gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 4,   // 固定列
                mainAxisSpacing: 10, crossAxisSpacing: 10,
                childAspectRatio: 0.5 // 宽高比，默认为 1
            )
        )
        ```

    - CustomScrollView：组合多个可滚动组件（Sliver）
        
        ```dart
        class _StickyCategory extends SliverPersistentHeaderDelegate {
            @override
            Widget build(ctx, shrinkOffset, overlapsContent) {
                return Container(ListView()); // 一个横向滚动内容
            }
            @override // 无须重新构建
            bool shouldRebuild(convariant oldDelegate) => false;

            @override // 最大展开高度
            double get maxExtent => 200;
            @override // 最小折叠高度
            double get minExtent => 60;
        }

        CustomScrollVeiw(
            slivers: [
                SliverToBoxAdapter(     // 轮播图
                    child: Container(...)
                ), 
                SliverPersistentHeader( // 黏性吸顶
                    delegate: _StickyCategory(),
                    pinned:  true,
                ), 
                SliverList.builder()   // 商品列表
        
            ]
        )
        ```

    - PageView：轮播图

        ```dart
        PageController _controller = PageController();
        PageView.builder(
            controller: _controller,
            itemCount: 5,
            itemBuilder: (ctx, idx) {
                return Container()
            }
        )

        _controller.jumpToPage(index); // 跳转到指定 Section（从 0 开始）
        ```
    

### 自定义组件

| Feature | Stateless | Stateful |
| :- | :- | :- |
| 核心特征 | 创建后，内部状态不可变 | 状态在声明周期可变 |
| 使用场景 | *静态* 内容展示（外观由配置参数决定）| 交互式组件|
| 生命周期 | 主要是 build | 包含创建、更新、销毁 |
| 代码结构 | Single Class | Wiget + 关联的 State |

```dart
// 无状态页面骨架: 需要重载 build 方法
runApp(MainPage());
class MainPage extends StatelessWidget {
    @overrige
    Widget build(BuildContext ctx) {
        return MaterialApp(...);
    }
}

// 有状态：实现点击计数
// 对外暴露的有状态类
class MainPage extends StatefulWidget {
    @override
    State<StatefulWidget> createState() {
        return _MainPageState();
    }
}
// 内部类：管理数据、处理业务逻辑、渲染视图
class _MainPageState extends State<StatefulWidget> {
  int count = 0;
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        body: Center(
          child: Row(
            children: [
              TextButton(
                // 甚至不需要塞在 setState 里面 => 只要执行 setState(() {}) 就会触发重新渲染
                onPressed: () => setState(() => count -= 1),
                child: Text("-"),
              ),
              Text(count.toString()),
              TextButton(
                onPressed: () => setState(() => count += 1),
                child: Text("+"),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
```

### 生命周期

- 创建阶段

    > - 只有 createState 方法属于 StetefulWidget 
    > - InheritedWidget 由于自顶层向子孙节点高效共享数据

    | 函数名 | 调用时机与核心任务 |
    | :- | :- |
    | `createState` | Widget 初始化，创建 State 对象 |
    | `initState` | State 对象插入 Widget 树，仅执行一次 |
    | `didChangeDependencies` | initState 后 / 依赖的 InheritedWidget 更新时，可能多次调用 |

- 构建与更新阶段

    > 无状态组件仅具备 `build`

    | 函数名 | 调用时机与核心任务 |
    | :- | :- |
    | `build` | 初始化/更新后，构建 UI | 
    | `didUpdateWidget` | 父组件传入新配置，比较新旧配置 | 

- 销毁阶段

    | 函数名 | 调用时机与核心任务 |
    | :- | :- |
    | `deactiveate` | State 从树中暂时移除 | 
    | `dispose` | State 永久移除，释放资源（仅一次） | 

### 组件通信

| 方式 | 传递方向 | 使用场景 |
| --  | ------- | ------- |
| 构造函数传递 | 父 -> 子 | 简单数据传递 |
| 回调函数 | 子 -> 父 | 子组件通知父组件 |
| InheritedWidget | 祖先 -> 后代 | 隔代数据共享 |
| Provider | 任意组件间 | 状态管理 |
| EventBus | 任意组件间 | 全局事件通信 |
| Bloc/Riverpod | 任意组件间 | 复杂状态管理 |

- 构造函数传递（父 -> 子）

    子组件：定义接受属性（final）-> 子组件在构造函数中接受

    ```dart
    class Parent extends StatelessWidget {
        const Parent({Key? key}): super(key: key);
        @override
        Widget build(ctx) {
            return Container(children: [
                Text("Parent"),
                Child(msg: "Hey you!")
            ]);
        }
    }

    // 无状态子组件：直接在构造函数里解析
    class Child extends StatelessWidget {
        final String msg; // 用于接收的属性
        const Child({Key? key， this.msg}): super(key: key);

        @override
        Widget build(ctx) {
            return Container(child: "Child recv: ${msg}");
        }
    }

    // 有状态子组件
    class Child extends StatefulWidget {
        final String? msg;
        const Child({super.key, required this.msg});    // 在对外类中接收

        @override
        State<StatefulWidget> createState() => _ChildState();
    }

    class _ChildState extends State<Child> {
        @override                                      // 在对内类通过 widget. 访问
        Widget build(BuildContext context) => Text("Child recv: ${widget.msg}"); 
    }
    ```

- 回调函数（子 -> 父）

    父组件传递一个函数给子组件，子组件调用重设父组件属性


    ```dart title="Parent"
    class Parent extends StatefulWidget {
        const Parent({super.key});
        @override
        State<StatefulWidget> createState() => _ParentState();
    }

    class _ParentState extends State<Parent> {
        List<String> _list = ["鱼香肉丝", "宫保鸡丁", "麻婆豆腐"];
        void delItem(int idx) => setState(() => _list.removeAt(idx));     // callBack

        @override
        Widget build(BuildContext context) {
            return GridView.count(
            children: List.generate(
                _list.length,
                (int idx) => Child(itemName: _list[idx], index: idx, delItem: delItem),
            ),
            );
        }
    }
    ```

    ```dart title="Child"
    class Child extends StatefulWidget {
        final String itemName;
        final int index;
        final Function(int index) delItem;    // 接收 call back
        const Child({
            super.key,
            required this.itemName,
            required this.index,
            required this.delItem,
        });

        @override
        State<StatefulWidget> createState() => _ChildState();
    }

    class _ChildState extends State<Child> {
        @override
        Widget build(BuildContext context) {
            return Row(
            children: [
                Text(widget.itemName),
                IconButton(
                    onPressed: () => widget.delItem(widget.index), // 调用
                    icon: Icon(Icons.delete),
                ),
            ],
            );
        }
    }
    ```

## 网络请求

```bash
flutter pub add dio #依赖于 Dio 插件
```

- 基本使用

    ```dart
    Dio().get("URL")
        .then(res => print(res))
        .catchError(err => print(err));
    ```

- 封装

    ```dart
    // 1. 创建工具类
    class DioUtils {
        final Dio _dio = Dio();
        DioUtils() {
            // 2. 设置基础地址和超时时间
            _dio.options
            ..baseUrl = "https://geek.itheima.net/v1_0"
            ..connectTimeout = Duration(seconds: 10)
            ..sendTimeout = Duration(seconds: 10)
            ..receiveTimeout = Duration(seconds: 10);

            // 3. 添加拦截器
            _addInterceptor();
        }

        void _addInterceptor() {
            _dio.interceptors.add(
            InterceptorsWrapper(
                onRequest: (ctx, handler) {
                handler.next(ctx); // 放行
                handler.reject(throw Exception("Oh no")); // 拦截
                },
                onResponse: (ctx, handler) {
                if (ctx.statusCode! >= 200 && ctx.statusCodgge! < 300) {
                    handler.next(ctx); // 放行
                    return;
                }
                // 异常
                handler.reject(DioException(requestOptions: ctx.requestOptions));
                },
                onError: (ctx, handler) {
                handler.reject(ctx); // 直接抛异常
                },
            ),
            );
        }

        // 4. 向外暴露统一请求方法
        Future<Response<dynamic>> get(String url, {Map<String, dynamic>? params}) {
            return _dio.get(url, queryParameters: params);
        }
    }
    ```

- Web 端跨域解决

    - 在 `flutter/packages/flutter_tools/lib/src/web/chrome.dart` 中添加配置

        ```dart
        class ChromeLaucher(
            ...,
            '--disable-web-security'
        )
        ```
    
    - 删除 `flutter/bin/cache` 下的 `flutter_tools.snapshot` & `flutter_tools.stamp`

    - 执行 `flutter doctor -v` 后重新运行项目

## 路由管理

### 基本路由

- 无需提前注册，在跳转时注册 `MaterialPageRoute` 实例即可

    ```dart
    // 跳转至新页面
    Navigator.push(
        ctx, MaterialPageoute(
            builder: (ctx) => TargetPage(
                id: idx+1     // 直接通过构造函数传参
            )
        )
    );
    
    // 返回上一页
    Navigarot.pop(ctx);
    
    // 接收
    class Page extends StatefulWidget {
        final int? id;
        Page({Key? key, this,id}): super(key: key);
    }
    class _pageState extends State<Page> {
        @override
        void initState() {
            super.initState();
            print(widget.id);  // 不需要异步获取
        }
    }
    ```
### 命名路由

- 需要在 `MaterialApp` 中注册路由表（`routes`）、并设置 `initialRoute`

    ```dart
    runApp(MaterialApp(
        initialRoute: '/list',
        routes: {
            '/list': (ctx)   => ListPage(),
            '/detail': (ctx) => detailPage()
        }
    ));

    // 跳转（传参）
    Navigator.pushNamed(ctx, '/list', arguments: {
        "id": idx+1
    });

    // 接收参数：需要异步接收
    class _pageState extends State<Page> {
        @override
        void initState() {
            super.initState();
            Future.microtask(() {
                Map<String, dynamic> args = ModalRoute.of(ctx)?.settings.arguments;
                print(args['id']);
            })
        }
    }
    ```

### 动态路由

根据状态动态决定页面跳转/拦截，或通过 404 兜底

```dart
MaterialApp(
    inisialRoute: '/goodslist',
    routes: {
        '/goodslist': (ctx) => GoodsListPage(),
    },

    // 尝试跳转至未在 routes 中配置的路由时触发
    onGenerateRoute: (setting) {
        // （登录拦截）尝试跳转至购物车
        if (setting.name == '/cart') {
            bool isLogin = false;
            if (isLogin) {  // 使用基本路由构建页面（放行）
                return MaterialPageRoute(builder: (ctx) => CartPage());
            } else {        // 转到登录页（拦截）
                return MaterialPageRoute(builder: (ctx) => LoginPage());
            }
        }
    },

    // 未在 routes 中配置、且未被 onGenerateRoute 处理（兜底 404）
    onUnknownRoute: (setting) {
        return MaterialPageRoute(builder: (ctx) => NotFoundPage());
    }
)
```

## 基础交互实例

### 上滑加载

- 监听 “滚动到底部”

- 同一时刻只能发起一个请求、加载完毕后不发起新请求

```dart
class _GoodsListPageState extends State<GoodsListPage> {
    // 父组件是一个 ScrollView，有自己的 scrollController 以监听事件
    final ScrollController _controller = ScrollController();
    @override
    Widget build(ctx) {
        return CustomScrollView(
            controller: _controller
            silvers:    _getScrollChildren()
        )
    }

    void initState() {
        // 每次 scroll 都会触发
        _controller.addListener(() {
            // 实际滚动距离 ~= 最大滚动距离
            if (_controller.positionp.pixels >= (_controller.position.maxScrollExtent - 50)) {
                _getPage(); // 加载下一页
            }
        });
    }

    int _page = 0;
    bool _isLoading = false;
    bool _hasNext   = true;
    Future<void> _getPage() async {
        if (isLoading || !_hasNext) {
            return;
        }

        _isLoading = true; // 先占茅坑（互斥包裹）
        final list = await getGoodsListAPI({...});
        _isloading = false; // （互斥包裹）

        // 刷新状态（影响 UI）=> setState 里面不允许有 await
        setState(() {       
            _goodslist = _list;
        });  

        if (...) {
            _hasNext = false;
            return;
        }
        _page++;
    }
}
```

### 下拉刷新

- 使用 `RefreshiIndicator` 进行包裹，下拉时触发 `onFresh`

- 下拉时：重新获取并重置数据，刷新完毕时进行提示

- 初始化：默认调用下拉刷新

    - 通过 GlobalKey 控制指定 Wiget（有点像隔壁的 `refs`）

    - 实际执行顺序 `initState` => `build`，所以要用 microtask 等到组件渲染完毕

```dart
class _GoodsListPageState extends State<GoodsListPage> {
  
    void initState() {
        super.initState();
        // 注册事件 ...
        Future.microtask(() {
            setState(() {
                _paddingTop = 100;    // 首次进入时，也搞下拉动画
            })
            _key.currentState.show(); // 触发组件的 onFresh
        })
    }

    Future<void> _onRefresh() async {
        // 重置为初始化状态
        _page = 1;
        _isLoading = false;
        _hasNext   = false;

        // 重新执行一坨初始化函数（加载数据）
        await _getPage();

        // 执行到这里 => 刷新成功了（弹窗）
        ScaffoldMessenger.of(ctx).showSnackBar(SnackBar:
            content: Text("刷新成功")
        );
        setState(() {
            _paddingTop = 0; // 下拉 UI 缩回去
        })
    }

    final GlobalKey<RefreshIndicatorState> _key = GlobalKey<RefreshIndicatorState>();
    double _paddingTop = 0;
    @override
    Widget build(ctx) {
        return RefreshIndicator(
            key: _key,
            onRefresh: _onRefresh,
            // 这一层是因为 init 不会自己向下滚动（也没啥必要）
            child: AnimatedContainer(
                padding: EdgeInsets.only(top: _paddingTop),
                duration: Duration(milliseconds: 300),
                CustomScrollView()
            )
        )
    }
}
```

## 状态管理

### 全局状态共享 (Getx)

- 插件安装

    ```bash
    flutter pub add get
    ```

- 定义全局 GetxController 对象 + 需要共享的属性

    ```dart title="stores/UserControler.dart"
    class UserController extends GetxController {
        var user = UserInfo({}).obs; // .obs 说明需要响应式监听
        // 更新方法
        updateUserInfo (UserInfo neoInfo) {
            user.value = neoUser;    // 真正的值在 user.value
        }
    }
    ```

- UI 取用

    ```dart
    class _PageState extends State<Page> {
        // 如果统一入口已经有 Get.put() 了 => 这里用 Get.find() 就可以了
        final UserController _userController = Get.put(UserController());
        // 具体组件需要通过 Obx() 包裹
        return Obx(() {
            return Text("${_userController.user.value.id ?  _userController.user.value.account : "立即登录"}");
        });
    }
    ```

### 状态持久化 (shared_perferences)

- 安装依赖

    ```bash
    flutter pub add shared_perferences
    ```

- 封装 TokenManager（单例）

    ```dart title="stores/TokenManager.dart"
    state const String TOKEN_KEY = "shop_token";

    class TokenManager {
        Future<SharedPreferences> _getInstance() => SharedPreferences.getInstance();

        String _token = ""; // 内存值
        Future<void> init() async {
            final prefs = await _getInstance();
            return prefs.getString(TOKEN_KEY) ?? "";
        }

        Future<void> setToken(String val) async {
            // 操作磁盘值
            final prefs = await _getInstance();
            prefs.setString(TOKEN_KEY, val);
            // 操作内存值：避免 getter 变成异步
            _token = val;
        }

        String getToken() => _token;

        Future<void> removeToken() async {
            final prefs = await _getInstance();
            prefs.remove(TOKEN_KEY);
            _token = "";
        }
    }

    final tokenManager = TokenManager();
    ```

- 使用

    ```dart
    // 将 token 写入内存
    tokenManager.setToken("xxxxx");

    // 在 Dio 请求拦截器中统一注入 token
    _dio.interceptors.add(
        onRequest: (req, handler) {
            if (tokenManager.isNotEmpty()) {
                req.headers = {
                    "Athorization": "Bearer ${tokenManager.getToken()}"
                };
            }
        }
    )
    ```

## 多平台运行

- 补全其余平台设置

    ```bash
    flutter create . # 会自动补全所有支持的平台
    ```

- IOS 端需要 Xcode

- Android

    1. 设置 Android Gradle & maven 仓库镜像

        - 设置 `android/gradle/wrapper/gradle-wrapper.properties`

            ```
            distributionUrl=https\://mirros.cluad.tencent.com/gradle/gradle-8.14-all.zip
            ```

        - 设置 `android/settings.gradle.kts`

            ```
            maven(url=url("https://maven.aliyun.com/repository/google"))
            maven(url=url("https://maven.aliyun.com/repository/relesases"))
            maven(url=url("https://maven.aliyun.com/repository/centreal"))
            maven(url=url("https://maven.aliyun.com/repository/public"))
            maven(url=url("https://maven.aliyun.com/repository/gradle-plugin"))
            maven(url=url("https://maven.aliyun.com/repository/apache-snapshots"))
            maven(url=url("https://maven.aliyun.com/nexus/content/groups/public/"))
            maven(url=url("https://jitpack.io"))
            ```

    2. 设置网络权限 (`android/app/src/main/AndroidManifest.xml`)
        
        ```xml
        <uses-permission android:name="android.permission.INTERNET" />
        ```

    3. 运行到模拟器、解决 UI 适配问题

    4. 打包

        ```bash
        flutter build apk --debug   # 未签名的调试 SDK
        flutter build apk --release # 发布版 SDK，续压配置签名
        ```
