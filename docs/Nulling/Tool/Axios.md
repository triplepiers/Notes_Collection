## 简单搭建服务
> 使用 [Json-Server](https://github.com/typicode/json-server) 快速搭建 HTTP 服务


1. 安装
  ```bash
	npm install -g json-server
  ```
  
1. 创建 `db.json`
	```json
	{
	  "posts": [
	    { "id": 1, "title": "json-server", "author": "typicode" }
	  ],
	  "comments": [
	    { "id": 1, "body": "some comment", "postId": 1 }
	  ],
	  "profile": { "name": "typicode" }
	}
	```

3. 启动服务（工作路径与 `db.json` 所在位置一致）
   ```bash
	json-server --watch db.json
   ```
4. 设置响应延时
	```bash
	# 使用下列命令进行启动
	json-server --delay 2000
	```

## Axios
> [Github 项目地址](https://github.com/axios/axios)

### 1 Set Up
- 项目：`npm install axios`
- 单页面摆烂：
  `<script src="https://cdn.jsdelivr.net/npm/axios@1.1.2/dist/axios.min.js"/>`

### 2 基本使用(axios本体)
#### GET(ReadOnly)
```js
axios({
	method: 'GET',
	// 是 Json-Server 的 url 地址
	url: 'http://localhost:3000/posts/1'
}).then( res => {} )
```
#### POST(Insert)
```js
axios({
	method: 'POST',
	url: 'http://localhost:3000/posts',
	data: {
		title: 'This is title',
		author: 'Tom'
	}
}).then( res => {} )
```
#### PUT(Update)
```js
axios({
	method: 'PUT',
	// 2 - 需要修改记录的 id
	url: 'http://localhost:3000/posts/2',
	data: {
		title: 'New World',
		author: 'Jack'
	}
}).then( res => console.log(res))
```
#### DELETE
```js
axios({
	method: 'DELETE',
	// 1 - 需要删除记录的 id
	url: 'http://localhost:3000/posts/1'
}).then(res=>{})
```

### 3 其他方法
#### axios.request
```js
axios.request({
	method: 'GET',
	url: 'http://localhost:3000/cpmments',
}).then(res => {})
```
#### axios.post
```js
axios.post(
	'url',
	// data
	{
		'body': 'sth',
		'postId': 2
	}
).then(res=>{})
```

### 4 响应结构
- `config`  配置对象
- `data` 服务器返回的结果
- `headers` 响应头的信息
- `request` 原生 ajax 实例对象
- `status` 响应状态吗
- `statusText` 响应状态字符串

### 5 配置对象
```json
{
	url: '/comments',
	method: 'get/post',
	basURL: 'http://localhost:3000', // axios 自己会进行拼接
	transformRequest: [function (data, headers) {
		// 对请求数据进行一些处理，最后会发送处理过的数据
		return data
	}],
	transformResponse: [function (data) {
		// 对服务器返回的数据尽性一些处理
		return data
	}],
	headers: { // 配置一些 header，传文件/跨域可能会用到
		'X-Requested-With': 'XMLHttpRequest'
	},
	params: { // 设置跟在 url 后面的 params 参数
		ID:12345
	},
	paramsSerializer: function(params) {
		// 服务器要求的格式可能是 post/a.100/b.200
	},
	data: {},
	// 对象 / 字符串均可，对象会转成 json 传递，字符串会直接传递
}
```

### 6 默认配置
> 进行一些通用配置项的书写

```js
// 进行了一个全局的配置
axios.defaults.baseURL == 'http://localhost:3000'
// 这样写之后的默认方式就是GET（可以不写了），其他方法就独立配置盖过去
axios.defaults.method = 'GET'
// 3s后无响应就取消请求
axios.defaults.timeout = 3000
// 其他配置项也都可以设置成 defaults 的！
```

### 7 创建实例对象
```js
// 此处传入的 config 只对实例对象 a 起作用
const a = axios.create({
	baseURL: 'http://localhost:3000',
	timeout: 2000
})
// 然后就可以直接用实例对象去发请求（用起来和直接抓 axios 本体差不多）
a({url:'/comments'}).then(res=>{})
a.get('/getSth').then(res=>{})

// 在对不同服务器发请求时，可以使用不同的实例（少写一些 baseURL）
```

### 8 拦截器
> 准备发送 -> 请求拦截器（通过）-> 发送请求 -> 响应拦截器 -> .then 处理返回结果

使用 `forEach` 遍历 `handlers` 数组（所以是往前插入） 
#### 8.1 请求拦截器
因为用 `unshift` 往 `handlers` 里放（前插入），**后定义先执行**
> 在「发送前」对请求的 内容/参数 进行 处理/检测，没有问题再发出去（否则直接取消）

```js
axios.interceptors.request.use
// 分别为 成功/失败 指定回调
	config => { // 可以调整一下 config
		config.timeout = 2000
		return config
	},
	err => {
		return Promise.reject(err)
	}
)
```
#### 8.2 响应拦截器
因为用 `push` 往 `handlers` 里放（后追加），**先定义先执行**
> 在 then 处理前，先用响应拦截器进行处理

```js
axios.interceptors.response.use(
	res => {
		return res
		// 我也可以 return res.data -> .then 就只能看见 data 的内容了
	},
	err => {
		return Promise.reject(err)
	}
)
```

### 9 取消请求
```js
var cancel = null; // 必须是全局变量
// 首先要为请求对象配置 cancelToken
axios({
	method: 'GET',
	url: 'http://localhost:3000/posts',
	cancelToken: new axios.CancelToken(function(c) {
		cancel = c;
	})
}).then(res=>{})

// 在绑定了取消事件的按钮里执行下面这个函数就行
cancel()
```

然后实现：在上一个请求还没有返回前，取消前一个请求（？）
```js
var cancel = null;
// cancel 不为 null 时，说明上一次请求
if(cancel !== null) cancel();
axios({
	methods: 'GET',
	url: 'http://localhost:3000/comments',
	cancelToken: new axios.CancelToken(c => cancel=c)
}).then(
	 res => {
		 cancel = null;
	 }
)
```

## Axios 源码鉴赏

### 1 文件结构
```text
 - /dist # 打包后的文件，包括 axios.js
 - /lib  # 所有的源代码
	 - /adapters # 适配器相关（会选一个用）
		 - http.js # 用于在 node.js 向远端发送 http 请求
		 - xhr.js  # 用于发送 ajax 请求
	 - /cancel # 取消相关
		 - Cancel.js
		 - CancelToken.js # 用于创建取消对象实例
		 - isCancel.js # 通过 __CANCEL__ 判断是否为 cancel 实例
	 - /core # 核心功能
		 - Axios.js # axios 构造函数
	 - /helper # 一些功能函数
	 - axios.js # 入口文件
	 - defaults.js # 默认配置文件
	 - utils.js # 工具函数
```