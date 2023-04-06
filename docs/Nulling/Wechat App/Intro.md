## 1 小程序与普通网页开发的区别

### 1.1 API
* 小程序中无法调用 DOM & BOM 的 API
* 小程序可以调用微信环境提供的 地理定位 / 扫码 / 支付 等 API

### 1.2 开发模式
1. 申请小程序开发账号
2. 安装小程序开发者工具
3. 创建和配置小程序项目 

## 2 Start Up

### 2.1 注册小程序开发者账号
> [点我立即注册](https://mp.weixin.qq.com)

1. 点击“立即注册”
2. 选择“小程序”账号类型
3. 填写账号信息
4. 信息登记
	1. 注册国家/地区 = 中国大陆
	2. 主体类型 = 个人

### 2.2 获取 App_ID
1. 登陆后台，在左侧菜单中选择“开发-开发管理”
2. 在右侧选择“开发设置”
3. 在“开发者ID”中复制“AppID”

### 2.3 安装开发者工具
> [稳定版下载链接](https://developers.weixin.qq.com/miniprogram/dev/devtools/stable.html)

* 设置代理 = 不使用任何代理（避免被梯子干扰）

### 2.4 Hello World！
1. 选择“小程序项目-小程序“，点击➕号
2. 填写 App_ID，开发模式 = 小程序，后端服务 = 不使用云服务，语言 = js
3. 预览项目效果
	- 在<u>模拟器</u>上查看项目效果 -> 点击“编译“，查看最新效果
	- 在<u>真机</u>上查看项目效果 -> 点击“预览”，使用微信扫描二维码打开
4. 模拟器机型 = iphone 6/7/8，缩放比例 = 85%

## 3 Basic

### 3.1 项目基本组成结构

- `pages` - 用于存放所有的小程序页面
- `utils` - 用于存放工具性质的模块
- `app.js` - 项目入口文件
- `app.json` - 全局配置文件
- `app.wxss` - 全局样式文件
- `sitemap.json` - 配置小程序及其页面是否允许被微信索引

### 3.2 页面基本组成部分
> 所有页面都应存放在 `pages` 路径下，单独以文件夹形式存在。
> 
> 以 `index` 界面为例，应当在 `pages/index` 下存放相关的 `wxml / wxss / js / json` 文件

* `.js`  - 脚本文件，存放页面数据、事件处理函数等
* `.json` - 配置文件，配置窗口外观、表现等
* `.wxml` - 模版结构文件
* `.wxss` - 样式表文件

### 3.3 JSON 配置文件
小程序项目中共有以下4种 `json` 文件：

1. 根目录下的 `app.json`  <全局配置文件>
	* `pages` - 所有页面路径
	* `window` - 全局定义所有页面的背景色、文字颜色等
	* `style` - 组件样式版本（ `default = v2` ），删去后默认使用旧样式
	* `sitemapLocation` - 指明 `sitemap.json` 的路径
2. 根目录下的 `project.config.json` <开发工具个性化配置>
	-  `setting` - 编译配置
	- `projectname` - 项目名称（ <> 小程序名称）
	- `appid` - 小程序 ID
3. 根目录下的 `sitemap.json` <是否允许索引>
	- 允许搜索 `action: "allow"`
		 微信将通过爬虫为页面内容建立索引，使其出现在用户的对应检索结果中
	- 不允许搜索 `action: "disallow"`
> 由于默认开启 sitemap 索引提示，我们可在 `project.config.json`  配 置 `checkSiteMAp: "false"`  以将其关闭
4. 每个页面文件夹下的 `.json` 
	   用于对本页面的窗口外观进行配置，会<u>覆盖`app.json - window` 中的相同配置项</u>

### 3.4 新建页面
在 `app.json - pages` 中新增页面路径，如 `pages/index/index` 开发工具便会自动创建对应文件。

### 3.5 修改首页
* 事实上，首页不一定是 `index`
* 我们可以调整 `pages` 中的路径顺序对首页进行调整
    小程序会将 <u>路径排在首位的页面</u> 作为项目首页进行渲染

## 4 Language

### 4.1 WXML vs HTML
1. 标签名称不同
	- HTML = `div / span / img / a`
	- WXML = `view / text / image / navigator`
2. 属性节点不同
	- `<a href="#"></a>`
	- `<navigator url="/pages/idx/idx"></navigator>`
3. WXML 提供了类似于 vue 的模版语法
	- 数据绑定
	- 列表渲染
	- 条件渲染

### 4.2 WXSS vs CSS
1. 新增 `rpx`  尺寸单位
	- CSS 需要手动对像素单位进行换算（`rem`）
	- WXSS 支持 `rpx` ，自动在不同屏幕大小上进行换算
2. 提供 全局样式 & 局部样式
	- `app.wxss` 作用于全局
	- `page.wxss` 作用于当前页面
3. XWSS 仅支持 **部分** CSS 选择器
	- 类选择器 & id 选择器
	- `element` 选择器
	- 并集选择器 & 后代选择器
	- 伪类选择器

### 4.3 JS
小程序项目中的 `.js` 文件分为以下三类：

1. `app.js` - 项目入口文件，通过 `APP()` 启动整个程序
2. `page.js` - 页面入口文件，通过 `Page()` 创建并运行页面
3. 普通 `.js` - 功能模块文件，用于封装 公共函数 / 属性

## 5 宿主环境

即：程序运行所必需的依赖环境，比如 Android / iOS

注意：**Android 版微信是无法在 iOS 环境下运行的！**

小程序的宿主环境是**手机微信**，可以提供宿主环境提供的能力来完成普通网页无法完成的功能。

### 5.1 通信模型
- 小程序中的**通信主体**是：渲染层 & 逻辑层
	* WXML & WXSS 工作在渲染层
	*  JS 工作在逻辑层
* 小程序中的**通信模型**分为以下两类，都**通过微信客户端进行转发**
	* 渲染层 & 逻辑层 之间的通信
	* 逻辑层 & 第三方服务器 之间的通信

### 5.2 运行机制
* 启动过程
	1. 下载代码包到本地
	2. 解析 `app.json`
	3. 执行 `app.js` ，调用 `APP()` 创建实例
	4. 渲染首页
* 页面渲染过程
	1. 加载 `page.json`
	2. 加载 WXML & WXSS
	3. 执行 `page.js` ，调用 `Page()` 创建页面实例

### 5.3 组件
共分为九大类，比较常用的有：视图容器 / 基础内容 / 表单组件 / 导航组件

#### 5.3.1 常用视图组件
- `view`  - 类似于 `<div>`，是一个块级元素
- `scroll-view` - 滚动视图区域，常用于实现滚动列表
```html
<scroll-view scroll-y="true">
// scroll-x = true -> 允许横向滚动
// scroll-y = true -> 允许纵向滚动
	<view>A</view>
	<view>B</view>
	<view>C</view>
</scroll-view>
```
- `swiper` & `swiper-item` - 轮播图
```html
<swiper>
// autoplay = "true" 自动播放
// indicator-dots = "true" 显示索引点
	<swiper-item>A</swiper-item>
	<swiper-item>B</swiper-item>
	<swiper-item>C</swiper-item>
</swiper>
```

#### 5.3.2 常用基础内容组件
* `text`  类似于 `span` ，是行内元素
```html
<view>
	telephone: <text selectable="true">19883101672<text>
	// 支持长按选中文本（仅<text>支持）
</view>
```
* `rich-text` 支持把HTML渲染成WXML结构
> 非常的离谱，非常的烂

```html
<rich-text nodes="<h1 style='color:red;'>Hello World!</h1>"/>
// 渲染出下面这个东西（WXML本身甚至不支持<h1>标签）s
<h1 style="color: red;">Hello World!</h1>
```

#### 5.3.3 其他常用组件
- `button` 按钮，可以通过 `open-type` 调用微信提供的各种功能
	- `type="str"`  指定按钮类型 - default / warn
	- `size="str"`  指定按钮大小
	- `plain="ture"`  指定按钮镂空
- `image` 图片
	- `src` 图片源路径
	- `mode` 图片缩放格式
		- `scaleToFill` 拉伸并填满（默认）
		- `aspecFit` 保持比例，长边填满
		- `aspectFiil` 保持比例，短边填满
		- `widthFix` 保持原宽，高度自适应
		- `heightFix` 保持原高，宽度自适应
- `navigator` 类似于 `<a>`

### 5.4 API
微信提供的API主要分为以下三类：

1. 事件监听
   
     以 `on` 开头，如 `wx.onWindowResize(callback_Func)`
     
2. 同步
     
     以 `Sync` 结尾，同步 API 执行结果，可通过返回值直接获取，执行错误会抛异常
     
     如 `wx.setStorageSync('key', 'val')`
		
3. 异步
   
     类似于 `$.ajax(options)` 需要通过 `success / fail / complete` 接受结果
     
     如 `wx.request()` 发起的网络请求需要通过 `success` 回调函数接受返回值

## 6 Version & Release

### 6.1 发布上传步骤
1. 上传代码
	* 在顶部工具栏右侧选择“上传”
	* 填写 版本号 & 项目备注
2. 查看已上传版本
	- 登陆后台，选择“管理-版本管理-开发版本”
	- 将指定的上传版本提交审核
3. 发布
	- 登陆后台，选择“管理-版本管理-审核版本”
	- 将制定的审核版本发布

### 6.2 推广与数据查看
* 小程序二维码获取
	* 登陆后台，选择“设置 - 基本设置”
	* 选择“基本信息 - 小程序码及线下物料下载”
* 运营数据查看
	* 小程序后台
	* 小程序数据助手（emm这也是一个小程序）