## 1 WXML

### 1.1 数据绑定（Single Page）

- 在 `page.js -> data` 中定义数据
```javascript
Page({
	data: {
		info: "init data", // 字符串类型
		msgList:[{msg:'hello'}, {msg:'world'}] // 数组类型
	}
})
```
- 在 `WXML` 中使用数据
> 使用 `Mustache` 语法（就是 `{{}}` ）将数据绑定到页面中进行渲染

```html
<view>{{info}}</view>
// 会变成下面这样
<view>init data</view>
```

**Mustache语法的应用场景**

* 动态绑定内容（见上）
* 动态绑定属性，以 `image.src` 为例
```javascript
Page({
	data: {
		imgSrc: 'http://sth'
	}
})
```
```html
<image src="{{imgSrc}}"></image>
```

* 运算（三元 / 算数...）
```javascript
Page({
	data: {
		randNum: Math.random() * 10, // 10 以内的随机数
		rand2: Math.random().toFixed(2) // 生成两位小数
	}
})
```
```html
<view>随机数字{{ randNum >= 5 ? '大于等于5' : '小于5' }}</view>
<view>随机小数{{ rand2 * 100 }}</view>
```

### 1.2 事件绑定

> 渲染层 -> 逻辑层 的通讯方式，将用户在渲染层产生的行为反馈到逻辑层进行处理

| 常用事件 | tap | input | change |
| -------- | --- | ----- | ------ |
| 绑定方式 | bingtap / bind:tap | bindinput / bind:input | bindchange / bind:change |
| 事件描述 | 类似于click | 文本框输入 | 状态改变 |

当事件回调函数被触发时，将默认接收一个事件对象 `event` ，属性如下表所示：

| 属性          | 类型    | 说明 |
| ------------- | ------- | ---- |
| type          | String  |  事件类型    |
| timeStamp     | Integer |  页面打开->事件触发经过的 ms    |
| target        | Object  |  被触发组件的属性集合    |
| currentTarget | Object  |  当前组件的属性集合    |
| detail        | Object  |   额外信息   |
| touches       | Array   |  当前停留在屏幕中的触摸点信息数组    |
| changedTouches              |     Array    |   当前变化的触摸点信息数组   |

> `target` vs `currentTarget`
> 
> - 因为微信支持事件以冒泡的形式由内向外扩散，因此：内部 button 触发的 tap 事件会引起外部容器的 tap 处理函数调用。
>     
> - 在此情况下：内部 button 是 `target`，即触发事件的组件；而外部容器是 `currentTarget` ，即当前正在响应事件的组件

#### 1.2.1 bindtap 触摸事件绑定

> 类似于 `onclick` 事件

* 为组件绑定 tap 事件
```html
<button type="primary" bindtap="btnTapHandler">按钮捏</button>
```
- 定义事件处理函数，时间参数通过形参 `event(e)` 接收
```javascript
Page({
	btnTapHandler(e) { // 在 page.js 中定义该按钮触摸事件处理函数
		console.log(e)
	}
})
```

#### 1.2.2 在事件处理函数中为 data 数据赋值

1. 在 `data` 中声明待赋值数据（可以胡乱赋一个初值）
2. 在 <u>事件处理函数中</u> 调用 `this.setData(dataObject)` 方法重新为该数据赋值
```javascript
Page({
	data: {
		count: 0
	},
	changeCount(e) {
		this.setData({
			// 可以通过 this.data.name 访问指定的数据对象
			count: this.data.count + 1 // 这里是迭代的orz
		})
	}
})
```

#### 1.2.3 事件传参

  在小程序中，**不能** 在绑定事件的同时为事件处理函数传参。
  so，下面这一段是行不通的：
```html
<button type="warn" bindtap="tapHandler(123)"></button>
// 这里会把 tapHandler(123) 整体当成函数名
```

  此处，我们使用 `data-*` 这一自定义属性进行传参，其中 `*` 将被解析为参数名称。
```html
<button bindtap="tapHandler" data-info="{{2}}"></button>
// 定义了参数 info = 2 ( 2 插值了，但没完全插 )
// 不用插值语法会被解析成 String
```
  在事件处理函数中，我们可以通过 `event.target.dataset.name` 来访问对应的参数
```javascript
tapHandler(e) {
	// e.target.dataset 包含了所有以 data-* 形式传递的参数
	console.log(e.target.dataset.info)
}
```

#### 1.2.4 bindinput 文本框输入事件

```html
<input bindinput="inputHandler"></input>
```
```javascript
inputHandler(e) {
	// 可以通过 e.detail.value 拿到文本框最新的值
	console.log(e.detail.value)
}
```

#### 1.2.5 input 与 data 的数据同步

> 有一种不明所以的套娃感

  步骤如下：
1. 定义 `data`
```javascript
Page({
	data: {
		message: "hello"
	}
})
```
2. 动态绑定文本框内容
```html
<input value="{{ message }}" bindinput="inputHandler"></input>
```
3. 美化样式（整点CSS）
4. `bindinput`
```js
inputHandler(e) {
	this.setDate({
		message: e.detail.value
	})
}
```

#### 1.2.6 条件渲染 wx:if

  在小程序中，通过 `wx:if="{{ condition }}"` 来判断是否渲染该代码块
```html
<view vw:if="{{ condition }}"> True </view>
```

  也可以实现多分支判断（迷惑）
```html
<view vw:if="{{ type == 1}}"> male </view>
<view vw:elif="{{ type == 2 }}"> female </view>
<view vw:else> secret </view>
```

  需要一次控制**多个组件**显隐时，我们可以使用 `<block>` 包裹多个组件：
  `<block>`仅起到包裹作用，不会在页面中渲染为任何标签
```html
<block wx:if="{{ condition }}">
	<view> v1 </view>
	<view> v2 </view>
</block>
```

#### 1.2.7 hidden

条件为 `true` 时隐藏：
```html
<view hidden="{{ condition }}"> hidden while true </view>
```

**wx:if  vs  hidden**

* 运行方式不同
	* `wx:if` 可以动态 创建/删除 元素
	* `hidden` 通过 `display:none/block` 控制显隐（元素始终存在）
* 使用建议
	* 频繁切换时 - `hidden`
	* 控制条件复杂时 - `wx:if & elif` （ `hidden` 只支持判断 T/F ）

#### 1.2.8 列表渲染 vw:for

我们可以通过 `vx:for` 根据指定数组，**循环渲染** 重复的组件结构
```html
<view wx:for="{{ array }}">
	index = {{ index }}, current item = {{ item }}
	// 插值变量名称是固定的：index - 索引，item - 当前项目
</view>
```

我们也可以**手动指定** 索引 & 当前循环项变量名（只是替换了 `index` & `item` 对应的替换字符串，实际开发中用的很少）
```html
<view wx:for="{{ array }}" wx:for-index="idx" wx:for-item="itemName">
	index = {{ idx }}, item_name = {{ itemName }}
	// 
</view>
```

#### 1.2.9 wx:key (可选)

为渲染的列表项目指定唯一的 `key` 值，从而提高渲染的效率（没有的时候就直接用 `index` ）
```html
<view wx:for="{{ userList }}" wx:key="id">
	{{ item.name }}
</view>
```
```js
Pafe({
	data: {
		userList: [
			{ id:1, name: "amy"},
			{ id:2, name: "coco"},
			{ id:3, name: "kacy"}
		]
	}
})
```

---
## 2 WXSS

### 2.1 CSS + N

1. 增加了 `rpx` 尺寸单位（但是没有 `rem` 捏）
	   全称是 `responsive pixel` ，用于解决屏幕适配问题；
	   $$1 \ rpx = \frac{device-width}{750}$$
2. 增加了 `@import` 样导入外联样式表
```html
@import "common.wxss";
// @import "相对路径"; - 分号表示语句结束（会嵌入整张 WXSS 表）
... current wxss ...
```
3. 取消了一些奇妙选择器语法

### 2.2 全局样式 & 局部样式

##### 全局样式
 定义于根目录下的 `app.wxss`， 应用于所有页面
##### 局部样式
  定义于 `page.wxss` ，仅作用于当前页面
  
* 当局部样式与全局样式**冲突** 时，会采用就近原则，使用**局部样式覆盖**全局样式
* 当局部样式 **权重 >=** 全局样式时，会产生覆盖（整块）

---
## 3 全局配置

 位于项目根目录下的 `app.json` 文件，常用配置项如下：
 
 * `pages` -  **所有** 页面的存放路径
 * `window` - 全局设置小程序的 **窗口** 外观
   
	小程序窗口被划分为三个部分
	
	- `navigationBar 顶部导航栏` 
	- `background 下拉刷新时显示的背景` 
	- `main 主体区域，用于 WXML 布局显示`
		
	我们可以通过 `window` 结点配置 `navigationBar` & `background` 区域的样式；

| 属性名                       | 类型     | 默认值   | 说明                                   |
| ---------------------------- | -------- | -------- | -------------------------------------- |
| navigationBarTitleText       | String   | 字符串   | 导航栏标题文字内容                     |
| navigationBarBackgroundColor | HexColor | #000000  | 导航栏背景颜色                         |
| navigationBarTextStyle       | String   | white    | 导航栏标题颜色，仅 black / white       |
| backgroundColor              | HexColor | \#ffffff | 窗口背景色                             |
| backgroundTextStyle          | string   | dark     | 下拉 loading 样式，仅支持 dark / light |
| enablePullDownRefresh        | Boolean  | false    | 开启全局下拉刷新（重新加载数据）                       |
| onReachBottomDistance        | Number   | 50       | 上拉触底（加载更多数据）事件触发时距离底部的距离(px)，建议使用默认值   |

 * `tabBar` - 设置小程序顶部/底部 **tabBar** 的效果
   
	* 只能配置 [2, 5] 个 tab 标签
	* 设置在 **顶部** 时， **不显示 icon** 只显示文本
	* 由以下六个部分组成：
		1. `backgroundColor` 整个 tabBar 的背景颜色
		2. `borderStyle` 边框颜色
		3. `selectedIconPath` & `iconPath` 选中/未选中 时的图片路径
		4. `color` & `selectedColor` 选中/未选中 时的文本颜色
```json
@app.json:
"tabBar": {
	%%必填%%
	"list": [
		{
			%%必填%%
			"pagePath": "在Pages中定义过的页面路径",
			"text": "tab中显示的文字",
			%%选填%%
			"iconPath": "图标路径1"
			"selectedIconPath": "图标路径2"
			%%一般把图片资源丢在根目录下的images文件夹中%%
		}, ...
	],
	%%选填%%
	"position": "bottom/top", %%默认top%%
	"borderStyle": "black / whirte", %%默认black%%
	"color": "#000000",
	"selectedColor": "#ffffff",
	"backgroundColor": "#333333"
}
```

`Tip` : 
    在 tabBar - list 中出现的界面必须在 `app.json - pages` 配置项中 **处于第 1 - n 位**

 * `style` - 使用的组件样式版本

## 4 页面配置

- 当 **页面配置** 与 **全局配置** 冲突时，根据就近原则，以 **页面配置** 样式为准（覆盖全局样式）
- 常用配置项与全局配置中一致
- 因为<u>不是所有页面都需要下拉刷新效果</u>，所以 `enablePullDownRefresh` 一般在需要的界面中单独进行配置

## 5 数据请求 - Get & Post

处于安全性考虑，小程序中的数据接口请求存在以下两个限制：

1. 只能请求 `HTTPS` 类型的接口
2. 接口域名必须添加到 **信任列表** 中

**跳过合法域名校验**

- “详情” - “本地设置” - 勾选“不校验合法域名、web-site  ... “
- 可以暂时使用不在列表中的域名，并使用 HTTP 接口
- 此操作在 **正式上线时将失效**，在开发与调试阶段可用

### 5.1 配置合法域名

1. 登录管理后台
2. 选择“开发” - “开发设置” - “服务器域名” - “修改 request 合法域名”

- 域名不能使用 IP地址 / localhost
- 服务器域名一个月内最多可以申请 5 次修改

### 5.2 GET 请求
```html
<button bindtap="getInfo">发送请求</button>
```
```js
@page.js:
getInfo() {
	wx.request({
		url: "api接口url",
		method: "GET",
		data: { %%向服务端发送的数据%%
			name: 'u_name',
			age: 22
		},
		success: (res) => {
			console.log(res.data) %%打印发挥的 data 字段%%
			%%成功后的回调函数%%
		}
	})
}

```

### 5.3 POST 请求
```js
@page.js
postInfo() {
	wx.request({
		url: "api接口url",
		method: "POST", %%主要就是这一行改成了 POST%%
		data: {some data},
		success: (res) => {
			... something ...
		}
	})
}
```

### 5.4 页面加载时请求初始数据 - onLoad
```js
@page.js
onLoad: function(options) {
	do sth;
	%%调用其他函数%%
	this.getSwiperList();
	this.getGridList();
},
getSwiperList() {
	%%开局自动获取轮播图列表%%
	wx.request({
		url: "...",
		method: "GET/POST",
		success: (res) => {
			this.setData({
				swiperList: res.data
			})
		}
	})
},
getGridList() {}
```
然后我们可以通过获取的列表动态渲染轮播图：
```html
<swiper>
	<swiper-item wx:for="{{swiperList}}" wx:key="id">
		<image src="{{item.image}}"></image>
	</swiper-item>
</swiper>
```

### 5.5 跨域 & Ajax （都不存在）
- 事实上 **小程序不存在跨域问题** - 宿主是微信客户端，而非浏览器
- 而 Ajax 的核心依赖于 **浏览器** 中的 `XMLHttpRequest` 对象，在小程序中并不存在

### Tip: 使用 flex 布局实现九宫格
- 首先，渲染数据都是从后端请求得到的。此处仅展示动态渲染
```html
<view class="gird-list">
	<view class="grid-item" wx:for="{{gridList}}" wx:key="{id}">
		<image src="{{item.icon}}"/>
		<text>{{item.name}}</text>
	</view>
</view>
```
- 然后通过魔性的样式设置来形成九宫格
```css
.grid-list {
	display: flex;
	flex-wrap: wrap; %%允许换行%%
}
.grid-item {
	width: 33.33%; %%刚好一行三个%%
	box-sizing: border-box; %%不然加边框会崩，另外*似乎不能用**
}
```
- 此处补充一个设置表格边框的方法：
	- inner：设置 `right` & `bottom`
	- outer：设置 `left` & `top`

## 6 页面导航

### 6.1 声明式导航 navigator
> 类似于通过 `<a>` 进行跳转

#### 6.1.1 跳转到 tabBar 中包含的页面
- 必须标注 `open-type="switchTab"` ，否则无法正常跳转
- `url` 地址**必须以** `/` 开头
```html
<navigator url="/url" open-type="switchTab">content</navigator>
```

#### 6.1.2 跳转到一般页面
- 标注 `open-type="navigate"` (可省略)
```html
<navigator url="/url" open-type="navigate"></navigator>
```

#### 6.1.3 后退（多级后退）
- 必须标注 `open-type="navigateBack"`，表示进行 <u>后退导航</u>
- 设施 `delta="num"`，其中 `num` 表示后退层数（默认为1 - 返回上一页）
```html
<navigator open-type="navigateBack" delta='1'>返回上一页</navigator>
```

### 6.2 编程式导航

#### 6.2.1 跳转到 tabBar 中包含的页面
调用 `wx.switchTab(Object)`，参数对象如下：

- 必填：
	- `url`：String 类型 -路径后**不能带参数**
- 选填：
	- `success`：成功时的回调函数
	- `fail`：失败时的回调函数
	- `complete`：类似于 finally - 无论成败都会执行
```html
<button bindtap="goToMessage">前往消息界面</button>
```
```js
goToMessage() {
	wx.switchTab({
		url: "/pages/message/message"
	})
}
```

#### 6.2.2 跳转到一般页面
使用 `wx.navigateTo(Object)`，参数同上。

#### 6.2.3 后退
- 使用 `wx.navigateBack`，参数中仅用 `delta` 替换了 `url`：
    `delta` ：number 类型 - 返回页面数，默认为1，大于最大层级时返回首页。
- 仅回退一层时，使用`wx.navigateBack()` 即可

### 6.3 导航传参

- 声明式导航
	- **可以在路径后** 携带参数，可以在“页面参数”中进行查看
	- 参数与路径之间使用 `?` 分隔，不同参数之间使用 `&` 分隔
	- 键值对之间使用 `=` 连接
```html
<navigator url="/pages/info/info?name=zs&age=20">前往Info页面</navigator>
```
- 编程式导航
	- 也是直接塞在 `url` 参数后面
```js
goToInfo() {
	wx.navigateTo() {
		url: '/pages/info/info?name=zs&age=20'
	}
}
```

- 在 onLoad 中 **接受导航参数**
	- 声明式/编程式参数 都可以在 onLoad 事件中进行获取
```js
onLoad: function(options) {
	%%options 中即为通过导航传递的参数%%
	console.log(options)
	%%因为只能在 onLoad 中直接获取，我们一般会把结果挂到 query 对象中%%
	this.setDat({
		query: options
	})
}
```

## 7 页面事件

### 7.1 下拉刷新 - 重新加载页面数据
- 启用下拉刷新
	- 在 `json - window` 中设置 `enablePullRefresh: true`
	- 一般为页面 **单独配置**，而非全局配置
- 配置下拉窗口样式
	- `backgroundColor`：窗口背景颜色
	- `backgroundTextStyle`：loading 样式  - dark / light
- **监听** 下拉刷新事件
```js
@page.js
onPullDownReresh: function() {
	重置数据;
	wx.stopPullDownRefresh();
}
```
- 停止下拉刷新特效
	- 不手动进行关闭的话，下拉刷新效果会**一直显示**
	- 可以通过 `wx.stopPullDownRefresh()` 手动关闭

### 7.2 上拉触底 - 加载更多数据/分页
- 显示 loading 提示框
	- 配套调用 `wx.showLoading(options)` & `wx.hideLoading(options)`
	- `title`：Stirng类型，必填 - 提示的文字内容
- **监听** 上拉触底事件 & **节流**
```js
@page.js
data: {
	isloadind: flase %%节流阀 - 当前无请求%%
}
onReachBottom: function() {
	if(this.data.isloading) return; %%判断是否处于节流状态%%
	this.getColors();
}
```
- setData 时**新旧数据的拼接** 
```js
getColors() {
	wx.showLoading({title: '加载中...'}); %%开始前显示加载提示%%
	this.setData({
		isloading: true %%关闭节流阀%%
	})
	wx.request({
		...
		success: (res) => {
			this.setData({
				%%...是展开运算符%%
				colorList: [...this.data.colorList, ...res.data]
			})
		},
		complete: () => {
			wx.hideLoading();
			this.setData({
				isloading: false %%开启节流阀%%
			})
		}
	})
}
```

### 自定义编译模式
- 选择“普通编译”下拉菜单中的“添加编译模式”
- 配置“启动页面” & “启动参数”，方便看局部效果
- 弃用时，选择“删除编译模式”

## 8 生命周期
- `Life Cycle` 指小程序从 创建 - 运行 - 关闭 所经历的（时间段）。
- 小程序中的生命周期分为以下两类：
	- 应用生命周期：小程序 启动 - 运行 - 销毁 的过程
	- 页面生命周期：每个页面 加载 - 渲染 - 销毁 的过程
- 生命周期函数（时间点）
	- 是由框架提供的内置函数，会随着生命周期**自动按次序执行**
	- 允许程序猿在**特定的时间点执行特定操作**，比如允许在 onLoad 时初始化页面数据
	- 小程序中的生命周期函数分为以下两类：
		- 应用的生命周期函数：在 `app.js` 中声明
		```js
		@app.js
		App({
			%%初始化完成时执行，仅执行一次%%
			onLaunch: function(options) {},
			%%小程序启动/从后台进入前台时触发%%
			onShow: function(options) {},
			%%小程序从前台进入后台时触发%%
			onHide: function() {}
		})
		```
		 -  页面生命周期函数：在 `page.js` 中声明
		```js
		 // @page.js
		 Page({
			 onLoad: function(options) {}, %%页面加载，仅调用一次%%
			 onShow: function() {},  %%页面显示%%
			 onReady: function() {}, %%初次渲染完成，仅调用一次%%
			 onHide: function() {},  %%页面隐藏%%
			 onUnLoad: function() {} %%页面卸载，仅调用一次%%
		 })
		```

## 9 WXS - JS

- 在 WXML 中 **无法调用 page.js 中定义的函数**，但 **可以调用 WXS 中定义的函数**，典型应用是“过滤器”
- WXS 不能调用 js 中定义的函数，也不能调用小程序提供的 API
- **不能作为组件的回调函数！**
- 只能使用 `var` 定义变量，只能用 `function` 而不能用匿名箭头函数
- 可以内嵌在 WXML 的 `<wxs>` 标签中（类似于 js 内嵌在 `<script>` 标签中）
	- 每个内嵌的 `<wxs>` 标签都必须指定 `module` 属性（当前模块名称）
	```html
	<view>{{m1.toUpper(user_name)}}</view>
	<wxs module="m1">
		module.exports.toUpper = function(str) {
			return str.toUpperCase();
		}
	</wxs>
	```
- 可以外联 WXS 脚本文件（文件一般丢在根目录的 `util` 文件夹下）
	```html
	<wxs src="相对路径" module="指定模块名称"></wxs>
	```
	```js
	@xxx.wxs
	function toLower(str) {
		return str.toLowerCase();
	}
	module.exports = {
		toLower: toLower
	}
	```

### 九宫格导航跳转
- 实际上所有界面点击调转后指向**同一个页面**
- 通过 `url` 传递 id & name，以此为依据从数据库筛选数据，并改变页面标题
- 批量渲染菜单项（使用 navigator 包裹）
	```html
	<navigator wx:for="girdList" wx:key="id" url="/pages/shoplist/shoplist?id={{item.id}}&name={{item.name}}">
		<image src="{{item.icon}}"></image>
		<text>{{item.name}}</text>
	</navigator>
	```
- 根据参数重置页面标题（直接在 page.json 中设置会导致写死）
	```js
	data: {
		query: {}
	},
	onLoad: function(options) {
		this.setData({
			query: options
		})
	}
	onReady: function(){
		wx.setNavigaionBarTitle({
			title: this.data.query.name
		})
	}
	```
- 加载商铺数据
	- 接口信息
		- URL：`https://www.escook.cn/categories/页面id/shops`
		- 参数
			- `_page`  - 当前请求的页号
			- `_limit` - 每页包含的记录数量
		- 返回值：[in header] `X-Total-Count` - 总记录数量
	- 自定义数据
		- `shopList: []` - 本页中的所有商铺信息
		- `page: 1` - 默认请求第一页
		- `pageSize: 10` - 默认一页包含10条信息
		- `total: 0` - 总记录数量
	- 发送请求
	```js
	wx.request({
		url: `https://www.escook.cn/categories/${this.data.query.id}/shops`,
		%%插值语法需要 反引号 + ${} %%
		method: 'GET',
		data: {
			_page: this.data.page,
			_limit: this.data.pagSize
		},
		success: (res) => {
			this.setData({
				shopList: [...this.data.shopList, ...res.data],
				total: res.header['X-Total-Count'] - 0
				%%因为含有特殊字符，所以用数组形式访问，-0是为了str转num%%
			})
		}
	})
	```
- loading 显示
	```js
	getShopList(cb) {
		if(this.data.isLoading) return;
		wx.showLoading({
			tite: '数据加载中'
		});
		this.setData({
			isLoading: true;
		})
		wx.request({
			...,
			complete: () => {
				wx.hideLoading();
				this.setData({
					isLoading: false
				})
				cb && cb(); %%如果调用时传入了 cb 参数，则调用 cb 指向的回调函数%%
			}
		});
	}
	```
- 上拉加载
	- 打开上拉加载事件：`onReachBottomDistance: 200`
	- 编写上拉触底处理函数：
	```js
	  onReachBottom: fucntion(){
		  if(this.data.page * this.data.pageSize >= this.data.total) {
			  return wx.showToast({
				  title: '没有数据哩',
				  icon: 'none'
			  })
		  }
		  this.setData({
			  page: this.data.page + 1
		  });
		  this.getShopList();
	  }
	```
	- 判断是否存在后续数据
		- `page * pageSize >= total` 此时不存在后续数据
- 下拉刷新
	- 打开下拉刷新事件：`enablePullDownRefresh: true`
	- 重置数据并重新发起请求：
	```js
	onPullDownRefresh: function() {
		this.setData({
			page: 1,
			shopList: [],
			total: 0
		});
		this.getShopList(() => {
			wx.stopPullDownRefresh(); %%关闭下拉刷新%%
		});
	}
	```

### 使用WXS处理手机号
- 目的：把11位手机号处理成 xxx-xxxx-xxxx 形式后渲染至页面
```js
function splitPhone(str) {
	if(str.length != 11) return str;
	
	var arr = str.split(''); %%拆分成单个字符%%
	arr.splice(3, 0, '-');   %%从arg1开始删除arg2个元素，然后插入arg3%%
	arr.splice(8, 0, '-');
	return arr.join('');
}
module.exports = {
	splitPhone: splitPhone
}
```