## 1 脚手架

> [官方文档](https://cli.vuejs.org/zh)

### 1.1 安装
1. 全局安装 @vue/cli `npm install -g @vue/cli`
2. 创建项目目录 `vue create xxx`
3. 启动项目 `npm run serve`

### 1.2 项目结构
```text
main.js    // 项目入口文件
assets     // 存放静态资源
components // 存放组件
public     // 存放 icon & index（最好是单页面应用）
```

### 1.3 render 配置项
> 因为 cli 引入的是一个 runtime-only 版本夫人 Vue，所以必须要使用 `render`
> 
> 同时，不能使用 `template` 解析器

```js
render(createElement) {
	return createElement('h1', 'hello world'); // 生成 h1 标签
}
// 由于没有用到 this 指针，所以可以简化为以下形式
render: createElement => createElement('h1', 'hello world');
// 再简化一下字母
render: h => h('h1', 'hello world');
// 使用 App 组件时（使用该组件的 template）
render: h => h(App);
```

### 1.4 默认配置
- 若需要查看具体的 webpack 配置，需要使用命令 `vue inspect > output.js`

默认配置下，下述文件不允许更名：
```text
-- public 包括文件夹本身
 |    |_ favicon.ico
 |    |_ index.html
 |
 |_  src 包括文件夹本身
      |_ main.js
```

需要修改默认配置，请更改 `Vue.config.js`

- 关闭语法检查 `lintOnSave: false`

### 1.5 标签属性 ref
> 如何获取组件 `template` 中的标签（类似于 id 选择器）

```html
<template>
	<h2 ref="title"> hello </h2>
	<school ref="sch"/>
</template>

<script>
	export default {
		methods: {
			showInfo() {
				console.log(this.$refs.title); // h2 标签
				console.log(this.$refs.sch);   // school 组件 vc
			}
		}
	}
</script>
```

### 1.6 props 配置项 - 传参
> 重名时优先级 `props` > `data`

- `props`  是 read-only 的，若需要修改，可以在 `data` 中使用 `val: this.prop` 进行复制

```html
// 父组件
<school name="SeaBee" :age="21"/> // :age - v-bind 绑了一个 num
// 子组件使用 - 正常插值
<h2> {{name}} </h2>
<h2> {{age + 1}}  </h2>
```
```js
// 子组件接收数据
export default {
	// 确认收款（默认是 str）
	props: ['name', 'age'],
	// 限制接收类型（不符合会 warn，还是可以跑）
	props: {
		name: String,
		age: Number
	},
	// 标注是否必要
	props: {
		name: {
			type: String,
			required: true // 必传
		},
		age: {
			type: Number,
			default: 99    // 默认值
		}
	}
}
```

### 1.7 mixin 混入
>  多个组件共享一个配置
>  
>  - 会将 mixin 片段的配置与 options 合并（data & method 以 options 配置为主）
>  - 生命周期钩子两个都要（ mixin 先执行，option 后执行）

```js
// @ mixin.js
export const mixin { // 分别暴露
	// 需要复用的配置片段（一个或多个）
}
// 局部引入 - @ component
import {mixin} from 'path/to/mixin.js'
export default {
	...,
	mixins: [mixin] // 配置所有要用到的混入片段
}
// 全局引入 - @ main.js
import {mix_name} from 'path/to/mix.js'
Vue.mixin(mix_name); // 一次配一条
```

### 1.8 插件
> 本质上就是一个包含 `install(Vue, args)` 的对象
> 
> - 第一个参数是 Vue 原型
> - 第二个参数是 插件使用者 传递的数据

```js
// @ plugin.js - 创建插件
export default {
	install(Vue) {
		// 定义全局过滤器
		Vue.filter('f_name', function(val){ return val })
		// 定义全局指令
		Vue.directive('d_name', {options})
		// 定义混入 - vm & vc 均应用该配置项
		Vue.mixin({option})
		// 给 Vue 原型添加方法 - vm & vc 均可以使用
		Vue.prototype.hello = () => { alert("hello world!") }
	}
}
// @ main.js - 应用插件
// 在 new Vue() 之前调用，可以用 Vue.use() 使用多个插件
import plugin from 'path/to/plugin.js'
Vue.use(plugin) // 会调用 install()
```

### 1.9 scoped 样式
> 事实上，所有组件的 `<style>` 最后会被汇总到一起
> 
> -> 这可能导致“类名冲突”，后引入者的样式将覆盖前者

```html
// @ component.Vue
<style scoped></style>
```

- 在最终呈现的标签里，会给加一个 `data-v-random` 的属性，形成样式隔离
  
    最好不要在 `App.Vue` 中使用 —— 这样就不能全局影响子组件的样式了

- 使用 less 书写样式时，应当用 `<style lang="less">` 包裹
    
    同时，需要安装 less-loade `npm i less-loader@7`

---
## 2 对于 TodoList 的总结
> 因为 `uuid` 太长了，这里使用 `nanoid` 生成 —— `npm install nanoid`
> 
> 直接调用 `nanoid()` 即可生成 record 的 id

### 对已有项目进行组件化改造
1. 拆分静态组件：按照功能点进行拆分，名字不能与 html 标签冲突
2. 实现动态组件：考虑好数据存放的位置 - 给共同的父组件
3. 实现交互：绑定事件

### props 的应用
> 不允许修改（其实修改对象内容不会报错，但不建议这样做）

- father -> son 传递数据
- son -> father 传递数据（需要父组件先提供一个函数）

### v-model
不能绑定 `props` 传递的数值 —— 不应该修改 `props`

### 点击 btn 编辑 文本框
> 如何在编辑状态下把 `<span>` 改成 `<input>`

```html
// 就是同时放俩 tag，然后用 v-show 控制显隐
<span v-show="!todo.isEdit">{{todo.title}}</span>
<input v-show="todo.isEdit" 
       type="text" :value="todo.title" 
       @blur="save(todo, $event)" ref="inputTitle">
// blur - 失去焦点
```
```js
methods: {
	handleEdit(todo) {
		if(todo.hasOwnProperty('isEdit')) { // 已经拥有该属性
			todo.isEdit = true
		} else { // 额外追加 isEdit
			this.$set(todo, 'isEdit', true) // 使之拥有 get / set
		}
		// 执行完整个函数后重新解析模版 - display:none 的元素无法获取焦点
		this.$nextTick(() => { // $nextTick 将在重新解析后执行
			this.$refs.inputTitle.focus() // 获取焦点
		})
	},
	save(todo, e) {
		todo.isEdit = false
		// 确保输入非空
		if(!e.target.value) return alert('输入不能为空')
		// 修改 todo.title 反馈 todo-id & 新的文本框输入
		this.$bus.$emit('updateTodo', todo.id, e.target.value)
	}
}
```

---
## 3 WebStorage
> 存储内容一般在 5M 左右
> API = `window.__Storage.__`

### 3.1 Local Storage
> 可以存点历史搜索记录啥的

```js
watch: {
	todos: { // 监视整个数组的变化
		deep: true, // 开启深度监视 -> 监视分量变化
		handler(value) {
			localStorage.setItem('todos', JSON.stringify(value))
		}
	}
},
data: {
	return { // 在 data 中，我们可以通过恢复得到初始数据
		todos: JSON.parse(localStorage.getItem('todos')) || []
		// 读取结果是 null 的时候就赋值为空数组 —— 不然计算 length 会爆炸
	}
}
```

- 关闭浏览器后 **仍然存在**（手动清空缓存时会寄）
```js
// 存储数据
function saveData() {
	// 键&值都必须是字符串，否则强制调用 toString()
	localStorage.setItem('key_name', 'val')
	// 存对象的时候会调用 stringify
	localStorage.setItem('person', JSON.stringify(p))
}
// 读取数据
function readItem() {
	// 读取结果是字符串
	localStorage.getItem('key_name')
	// 对象字符串需要进行姐写
	JSON.parse(localStorage.getItem('person'))
	// 读取不存在的键值时 - 返回 null
	// JSON.parse(null) = null
}
// 删除数据
function deleteData() {
	localStorage.removeItem('key_name')
}
// 清空数据
function clearData() {
	localStorage.clear()
}
```

### 3.2 SessionStorage
- API 就是把所有的 `localStorage` 改成 `sessionStorage`
- 浏览器关闭 = 会话结束 = **清空所有数据**

## 4 自定义事件
> 适用于 *子 -> 父*  —— 内置事件适用于 *html标签*

### 4.1 绑定

区分原生事件与自定义事件 —— 在原生事件后加 `.native`：

- 例如 `@click.native` 
- 此时，事件将由子组件**最外层标签**触发，且不需要 `$emit` 进行手动触发

```html
@ 父组件
<template>
	// 为 student.vc 绑定自定义事件 getInfo
	<student v-on:getInfo="demo"/>
	// 也可以稍微缩略成这个样子
	<student @getInfo="demo"/>
	// 仅触发一次
	<student @getInfo.once="demo"/>
</template>
<script>
	new Vue({
		methods: {
			// 父组件必须要有回调函数
			getStu(name) { console.log(name) }
		}
	}}
</script>

@ 子组件
<template>
	<button @click="sendStuName"></button>
</template>
<script>
	new Vue({
		methods: {
			sendStuName() {
				// 手动触发实例上绑定的 getInfo 事件（括号内是参数）
				this.$emit('getInfo', this.name) 
				// 此处的回调函数可以为 methods / 箭头函数
			}
		}
	}}
</script>
```

另一种方法 —— 通过 `ref` 实现

- 可以设置 timer 进行延迟绑定
```html
<school ref="stu"/>
```
```js
mounted() {
	// 父组件手动拿到子组件，通过 $on 绑定事件及回调
	setTimeout({
		this.$refs.stu.$on('getInfo', this.getStu);
		// 限定仅触发一次
		this.$refs.stu.$once('getInfo', this.getStu);
	}, 3000) // 3s 后绑定事件 getInfo
}
```

需要接受多个参数：

1. 在函数原型处用一堆的形参进行接收
2. 把实参打包成一个对象后进行传输
3. 首个 ｜ 后续 分开接收 `(name, ...params)` 
	1. 首个实参作为 `name` 被接收
	2. 后续所有参数都集中到 `params` 对象中

### 4.2 解绑

```js
// @ 子组件
// 1. 解绑单个事件
this.$off('event_1')
// 2. 解绑多个事件
this.$off(['event1', 'event2'])
// 3. 解绑所有自定义事件
thi.$off()
```

- 调用 `this.$destroy()` 销毁组件后，与该组件绑定的所有自定义事件也将失效
- 父组件销毁后，子组件的**自定义事件**失效，原生事件（如 `click` ）依然有效


## 7 动画 / 过渡
> 实质：在插入、更新、移除 DOM 元素时，在相应时刻为元素 添加 / 移除 类名

### 7.1 动画效果
> Vue 通过控制元素的 class 来操作 CSS 的 animation / transition

1. 编写 animation，同时设计类 `.v-enter-active / .v-leave-active 
	```css
	.v-enter-active  { /* 进入过程 */
		animation: ani 3s;
	}
	.v-leave-active  {
		animation: ani 3s reverse;
	}
	```
2. 使用 `<transition>` 标签包裹需要添加动画的一沓标签
3. 绑定用于控制 `v-show` 的变量
	```html
	<transition>
		<h1 v-show="isShow">Hello World!</h1>
	</transition>
	```

如果我们设置 `<transition name="hello">`，则对应的类名需要改成：
- `.hello-enter-active`
- `.hello-leave-active`

如果需要打开页面默认执行动画（一开始 `display: block`），可以添加 `appear` 属性，形如 `<transition appear>`

### 7.2 过渡效果
如果不写 `animation` ，就可以通过过渡来实现 - 涉及四个个类

```css
.v-hello-active, .v-leave-active { 
	/* 记得要配置 transition 时间（不影响本身样式） */
	transition: .5s;
}

.v-enter, .v-leave-to { /* 进入的起点 + 离开的终点 */
	transform: translateX(-100%);
}
.v-enter-to, .v-leave { /* 进入的终点 + 离开的起点 */
	transform: translateX(0);
}
```

#### 多元素过渡
> `<transition>`  只管一个元素，此处使用 `<transition-group>` 进行包裹

- `<transition-group>` 中的每个元素都需要独立的 `key` 值
- 整个 group 适用同一套 transition 方案

## 8 项目发布 

- 打包：命令 `npm run build`，将 `src + public` 生成 `dist` 文件目录
- 部署：使用 `node express` 搭建服务器
	1. 搞出一个合法的包 `npm init`
	2. 安装 `npm i express`
	3. 新建 `server.js`
		```js
		const express = require('express') // 引入
		const app = express()
		app.get('/person', (req, res) => { // 配置请求路由
			res.send({                     // 返回的数据
				name: 'Tom',
				age: 18
			})
		})
		app.listen(5005, (err) => { // 配置监听的端口号为 5005
			if(!err) console.log('请求成功')
		})
		```
	4. 启动服务器 `node server`
	5. 在 `static` 下放置前端资源，然后丢给服务器
	   ```js
	   app.use(express.static(__dirname + '/static'))
	   // 请求的时候直接 server_url + file_name 就行（不用 /static）
		```
- 解决 history 模式下的 404
    需要后端手动匹配前后端路由 —— `connect-history` 库
	1. 安装 `npm i connect-history-api-fallback`
	2. 引入并使用
		```js
		// @sever.js
		// 引入
		const history = require('connect-history-api-fallback') 
		// 使用（在 use static 之前）
		app.use(history())
		```