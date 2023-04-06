> 此处使用 `axios` 进行实现

1. 下载 `axios` - `npm i axios`
2. 在 App 中引入 `axois` - `import axios from 'axios'`
3. 发送请求
	```js
	getStuInfo() {
		axios.get('url').then(
			response => { // 执行成功的回调
				console.log(response.data)
			},
			error => { // 执行失败的回调
				console.log(error.message)
			}
		)
	}
	```

## 1 配置代理
> 此处通过 `vue-cli` 实现

配置完成后，请求地址写 `vue-url/api` 即可

```js
// @ vue.config.js - 只能配置单个代理地址
module.export = {
	devServer: { // 开启代理服务器（默认包含 public 内容）
		proxy: 'https://localhost:5000' // 请求的目标网址
	}
}
// 配置多个代理地址
module.export = {
	devServer: {
		proxy: {
			'/api':  // 请求前缀
			// 请求地址：https://prj/api/... -> url_1/api/...
				target: 'url_1',
				// 下面两个都默认为 true
				ws: true, // 支持 WebSocket
				changeOrigin: true // 把包里的请求源换成目标地址
			},
			'/foo': {
				target: 'url_2',
				// 配置 rewrite 后，实际请求 url_2/...（去掉了api部分）
				pathRewrite: {'^/foo':''}
			}
		}
	}
}
```


## 2 对 Github 用户搜索 的总结

### 引入独立的 CSS 样式文件

首先，新建 `public/css` 路径，把文件丢进去。
```html
随后，在 index.html 中完成引入
<head>
	<link rel="stylesheet" href="<%= BASAE_URL %>css/_.css">
</head>
```

### 使用 API 搜索用户
1. 获取用户输入
```html
<input type="text" v-model="keyword"> 试用 v-model 双向绑定
```
2. 为按钮绑定“点击搜索”事件
```html
<button @click="searchUsrs"></button>
```
3. 引入 `axios` 并发送请求
```js
import axios from 'axios'
export default {
	data: { 
		return { 
			keyWord:''
		}
	},
	methods: {
		searchUsers() {
			// 请求前 - Clear & Load
			this.$bus.$emit('updateData', {
				isFirst: false,
				isLoading: true,
				users: [],
				errMsg: ''
			})
			axois.get(`https://api.github.com/search/users?q=${this.keyWord}`)
			.then({
				res => { 
					this.$bus.$emit('updateData', {
						isLoading: false,
						users: res.data.items
					})
				},
				err => { 
					this.$bus.$emit('updateData', {
						isLoading: false,
						errMsg: err.message
					})
				}
			})
		}
	}
}
```
> 因为此处 Search & List 是兄弟组件，所以通过 $bus 进行转接

### 加载提示（List 状态指示）

在 List 组件中，使用下面三个变量控制提示信息的呈现：
```js
data: {
	info: { // 为了方便批量复制，打包起来
		isFirst: true,    // 初次显示提示
		isLoading: false, // 加载提示
		errMsg: '',       // 错误信息提示
		users: []
	}
}，
mounted() {
	this.$bus.$on('updateData', (dataObj) => {
		this.info = {...this.info, ...dataObj} // 合并信息（以后面为主），且不丢失字段
	})
}
```
```html
<div class="list" v-show="user.length"></div>
// Tips
<h1 v-show="isFirst">欢迎使用</h1>
<h1 v-show="isLoading">加载中，请稍候</h1>
<h1 v-show="errMsg">{{errMsg}}</h1>
```

## 3 vue-resource（不太用）
> 这是一个封装 `ajax` 的插件

1. 安装 `npm i vue-resource`
2. 在 App.vue 中引入插件 `import vueResource from 'vue-resource'`
3. 使用插件（创建实例前）`Vue.use(vueResource)`
4. 使用 vue-resource 发起请求
```js
this.$http.get('url/args').then({
	res => {},
	err => {}
})
```

