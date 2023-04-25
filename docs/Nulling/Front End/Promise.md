## Intro

1. Promise 是什么？
   
	`Promise` 是 ES6 中引入的 · 进行异步编程 的解决方案

	- 从语法上来说，`Promise` 是一个构造函数
	- 从功能上来说，`Promise`对象用户封装一个异步操作，并获取其执行的结果值

2. `Promise` 的优势

	- 旧方式必须在**异步任务启动前**指定回调函数，而 Promise 支持在任务结束后绑定 >=1 个回调
	- 支持**链式调用**，解决回调地狱

### 状态属性

实例中的 `PromiseState` 属性，共有三种取值：`pending`, `resolved/fullfilled`, `rejected`

共有两种可能的状态转变（每个 Promise 对象只能改变一次）：

- `pending -> resolved` 结果一般称为 `value`
- `pending - >rejected` 结果一般称为 `reason`

### 结果属性

实例中的 `PromiseResult` 属性，保存了异步任务 成功/失败 的结果。

可以通过 `resolve() / reject()` 函数进行修改

### 工作流程

1. 通过 `new Promise()` 创建对象包裹异步操作，此时的状态为 `pending`
2. 视异步任务执行结果调用对应函数
	- 执行成功，调用 `resolve()` ，状态变为 `resolved`
	- 执行失败，调用 `reject()`，状态变为 `rejected`
3. 根据状态调用 成功/失败回调（也可能是 `catch`）
4. 返回新的 Promise 对象

## 1 基本使用

### 1.1 前端模拟抽奖

- 需求
	- 点击 button后，间隔 2s 显示是否中奖（30%概率）
	- 根据是否中奖弹出不同的提示信息
- 不使用 Promise 的实现
    ```js
    function rand(m, n) { // 生成随机数
	    return Math.ceil(Math.random()*(n-m+1) + m-1);
    }
    const btn = document.querySelector('#btn');
    btn.addEventListener('click', function(){
	    setTimeout(()=>{
		    let n = rand(1, 100);
		    if (n <= 30) alert('恭喜');
		    else         alert('再接再厉');
	    }, 2000);
    })
	```
- Promise 实现
    ```js
    function rand(m, n) { // 生成随机数
	    return Math.ceil(Math.random()*(n-m+1) + m-1);
    }
    const btn = document.querySelector('#btn');
    btn.addEventListener('click', function(){
	    // 新建 Promise 实例，两个参为 成功/失败 的回调函数
	    const p = new Promise((resolve, reject) => {
		    // 包裹异步操作
		    setTimeout(()=>{
			    let n = rand(1, 100);
			    if (n <= 30) resolve(); // 将 Promise 对象状态设置为成功
			    else         rejcet();  // 将 Promise 对象状态设置为失败
		    }, 2000);
	    })
    })
    // 调用 then 方法指定回调
    p.then(
	    () => { // 成功回调
	        alert('恭喜');
	    },
	    () => { // 失败回调
	        alert('再接再厉');
	    }
    )
	```

??? question "What if 我们希望在回调的 `alert` 中获取产生的随机数？"
	- 问题分析
		- 回调函数与生成的随机数 `n` 不在同一个函数中
		- Promise 可以获取一步任务中 成功/失败 的结果值
	- 问题解决
	  
	    把 `n` 丢给 `resolve & reject` 就行了
	    ```js
	    btn.addEventListener('click', function(){
		    const p = new Promise((resolve, reject) => {
			    setTimeout(()=>{
				    let n = rand(1, 100);
				    // 将 n 作为结果值传递给两个回调
				    if(n<=30) resolve(n);
				    else      reject(n);
			    }, 2000)
		    })
		    p.then (
			    (val) => alert('恭喜中奖！中奖数字为：' + val);
			    (val) => alert('再接再厉！您的数字为：' + val);
		    )
	    })
		```

### 1.2 fs 读取文件
> 需要 `node.js 环境`

- 不使用 Promise 的方式
    ```js
    // 引入 fs 模块
	const fs = require('fs');
	fs.readFile('./liric.txt', (err, data) => {
		// 若存在错误，则抛出
		if(err) throw err;
		// 无错则输出结果(默认是buffer，toString可以转为字符串)
		console.log(data.toString());
	});
	```
- 使用 Promise 进行封装
    ```js
    /* 函数 mineReadFile
     * 参数：path - 文件相对路径
     * 返回值：promise 对象
     */
    function mineReadFile(path) {
	    return new Promise((resolve, reject) => {
		    require('fs').readFile(path, (err, data)=>{
			    if(err) reject(err);
			    else    resolve(data);
		    })
	    })
    }
    // 使用时再指定回调
    mineReadFile('./liric.txt').then(
	    res => {console.log(res.toString())},
	    err => {console.log(err)}
    )
	```
- 使用 `util.promisify` 封装
> 	`util.promisify` 是 node.js 中的一个方法，用于传入一个「遵循常见错误回调风格的函数」，并返回一个 Promise 版本。

	```js
	// 以 fs.readFile() 为例
	const util = require('util');
	const fs = requires('fs');
	
	let mineReadFile = util.promisify(fs.readFile);
	
	mineReadFile('path').then(
		res => {console.log(res.toString())},
		err => {console.log(err)}
	)
	```


### 1.3 AJAX 请求

需求：点击 button 后发送 Ajax 请求

- 不使用 Promise
	```js
	btn.addEventListner('click', ()=>{
		const xhr = new XMLHttpRequest();
		xhr.oepn('GET', 'api_url');
		xhr.send();
		xhr.onreadystatechange = function() {
			if(xhr.readyState === 4) {
				// 响应状码 2xx 视为请求成功
				if(xhr.status >= 200 && xhr.status <= 300) {
					console.log(xhr.response);
				} else {
					console.log(xhr.status);
				}
			}
		}
	})
	```
- 使用 Promise 进行封装
    ```js
    /* 函数 sendAJAX
     * 参数：URL
     * 返回值：promise 对象
     */
    function sendAJAX(url) {
	    return new Promise((resolve, reject) => {
		    const xhr = new XMLHttpRequest();
		    xhr.responseAType = 'json';
		    xhr.oepn('GET', url);
			xhr.send();
			xhr.onreadystatechange = function() {
				if(xhr.readyState === 4) {
					if(xhr.status >= 200 && xhr.status <= 300) {
						resolve(xhr.response);
					} else {
						reject(xhr.status);
					}
				}
			}
	    })
    }
    
    sendAJAX('api_url').then(
	    res => {console.log(res)},
	    err => {console.log(err)}
    )
	```

## 2 API

### 构造函数
```js
// resolve/reject 是 成功/失败 的回调函数
new Promise((resolve, reject)=>{
	// 这一部分代码会立即执行（同步调用）
})
```

### then 方法
> 用于指定回调，返回一个新的 Promise 对象

```js
Promise.prototype.then(
	onResolved, // 函数 value => {}
	onRejected  // 函数 reason => {}
)
```

### catch 方法
> 用于指定「失败」回调

```js
Promise.prototypr.catch(
	onRejected  // 函数 reason => {}
)
```

### resolve 方法
> 返回一个 成功/失败 的 Promise 对象（快速封装传入的数据）

```js
Promise.resolve(data / Promise对象);

// 传入「非Promise对象」，返回 成功的Promise对象 + PromiseResult = data
let p = Promise.resolve(111);
/* p[PromiseStatus] = fullfilled
   p[PromiseResult] = 111 */

// 传入「Promise对象」，则参数结果决定返回结果
let p = Promise.resolve(new Promise((resolve, reject) => {
	resolve("OK");   // => 返回一个成功的 Promise，result = 传入参数
	rejsct("Error"); // => 返回一个失败的 Promise，result = 传入参数
}))
```

### reject 方法
> 返回一个「失败」的 Promise 对象（马上另一个实例失败）

```js
Promise.reject(失败原因);
// 返回 rejected 的 Promise对象，result = 传入参数（不管传入啥）

// 即使「传入一个成功的 Promise 对象」，也会返回一个 rejected 的 新实例，如：
let p = new Promise((resolve, reject)=>{
	resolve("OK"); // 显然，传入的是一个「成功」的 Promise 对象
}) // 但是 p 是一个「失败的Promise」，值为 “OK”
```

### all 方法
> 返回一个新的 Promise 对象（传入的**所有 Promise 都成功**才返回成功对象）
> 
> - 成功 Promise 的结果：所有成功 Promise 对象返回结果组成的数组
> - 失败 Promise 的结果：**失败的第一个** Promise 对象的结果

```js
let p1 = new Promise((res, rej)=>{
	res("OK1")
})
let p2 = new Promise((res, rej)=>{
	res("OK2")
	rej("ERROR2")
})

const res = Promise.all([p1, p2])
// 如果 p2 使用的是 res("OK2")，则 res = ["OK1", "OK2"]
// 如果 p2 使用的是 rej("ERROR2")，则 res = "ERROR2"
```

### race 方法
> 返回一个新的 Promise 对象（**首个完成**的 Promise 决定返回值的状态及结果）

```js
let p1 = new Promise((res, rej)=>{
	res("OK1")
})
let p2 = new Promise((res, rej)=>{
	res("OK2")
	rej("ERROR2")
})

const res = Promise.race([p1, p2])
```

## 3 关键问题

1. 如何改变 Promise 的状态？
	- `resolve(val)`：从 pending 变为 resolved
	- `reject(reason)`：从 pending 变成 rejected
	- 抛出异常：从 pending 变成 rejected
2. 为一个 Promise 对象指定多个 成功/失败 函数，都会被成功调用吗？
   
     当 Promise 对象转变为相应对象时，对应的回调都会被调用
     
    ```js
     let p = new Promise((res, rej) => res());
     // 指定两个成功回调
     p.then( res => console.log("recall 1"));
     p.then( res => console.log("recall 2"));
     // 依次输出 reacall 1, recall 2(如果一直是 pending 的话就不会执行)
	```

3. Promise 状态改变 与 `then()` 指定回调 的顺序
   
     执行异步任务时：先指定回调，再改变状态（反过来也有可能）
     
     - 先改变状态，再指定回调的例子：直接调用 `resolve / reject`（同步任务），延迟调用 `then`
     - 什么时候可以得到数据（执行回调函数）？
	     - 先指定回调，再改变状态：马上调用回调函数，并得到数据
	     - 先改变状态，再指定回调：指定回调后立即调用，并得到数据

4. `then()` 返回的 Promise 对象状态由什么决定？
   
     由回调函数执行结果决定
     
     - 若执行回调的过程中抛出异常 => 返回 rejected，reason = 抛出的异常
     - 回调函数返回「非 Promise 值」=> 返回 resolved，value = 返回值
     - 回调函数返回 Promise 对象 => 直接作为 `then()`  返回的结果

5. 如何串联执行多个任务？
   
     通过对 `then()` 的链式调用串联多个 同步/异步 任务
    ```js
	// p 是一个「异步任务」，返回一个成功的 Promise
	let p = new Promise((res, rej)=>{
		setTimeout(()=>{res("ok")}, 1000);
	})
	
	p.then(
		res=>{// 执行成功回调，再返回一个成功的 Promise
			return new Promise((res, rej)=>{
				res("success");
			})
	}).then( // 执行成功回调，输出 “success”
		res=>{console.log(res)}
	).then( // 上一个成功函数没有返回值（undefined）=> 返回一个成功的 Promise，result = undefined
		res=>{console.log(res)}
	)
	```

6. Promise 的「异常穿透」
   >类似于“事件冒泡”的感觉
     
     在进行 `then()` 的链式调用时，可以在末尾用 `catch()` 指定一个统一的失败回调
     
     => 前面任何一步出错都将由该函数进行兜底处理
	```js
	let p = new Promise((res,rej)=>{})
	.then()
	.then()
	.catch(
		reason => console.log("统一的失败回调")
	)
	// 但中间指定了单独的失败回调，且没有返回值的话
	// => 会被认为返回了 undefined，从而进入下一轮的成功回调（并不会进入 catch）
	```

7. 如何中断 Promise 链？
   
     在回调中返回一个 pending 状态的 Promise 对象，即可跳出 `then()` 的链式调用
     
     `return new Promise(()=>{})`
     
     > `return new Promise()` 会触发下一层的失败回调

## 4 自定义封装

```js
class Promise {
	// 构造方法
	constructor(executor) {
		// 添加属性
		this.PromiseState = 'pending';
		this.PromiseResult = null;
		this.callback = [];
		// 保存实例对象的 this 指针
		const _this = this;
	
		function resolve(data){
			if(_this.PromiseState !== 'pending') return; // 仅允许修改一次
			_this.PromiseState = 'fullfilled';
			_this.PromiseResult = data;
			// 异步执行所有回调
			setTimout(()=>_this.callback.forEach(item => item.onResolved(data)))
		}
		
		function reject(data){
			if(_this.PromiseState !== 'pending') return;
			_this.PromiseState = 'rejected';
			_this.PromiseResult = data;
			setTimeout(()=>_this.callback.forEach(item => item.onRejected(data)))
		}
	
		try {
			// 同步调用「执行器函数」
			executor(resolve, reject);
		} catch(e) { // throw 抛出异常，改变状态
			reject(e);
		}
	}
	
	// 封装 then 方法
	then(onResolved, onRejected) {
		const _this = this;
		
		// 兼容用户未传入成功回调的情形
		if(typeof onResolved !== 'function') {
			onResolved = (value) => {
				return value; // 实现值传递
			}
		}
		
		// 兼容用户未传入失败回调的情形
		if(typeof onRejected !== 'function') {
			onRejected = (reason) => {
				throw reason; // 实现异常穿透
			}
		}
	
		// 返回 Promise 对象
		return new Promise((resolve, reject) => {
			// 封装函数：用于根据 Promise 对象状态调用对应回调函数
			// 参数 type -> 需要调用的回调函数
			function callback(type) {
				try {
					// 获取回调的执行结果
					let res = type(_this.PromiseResult);
					// 判断结果的类型
					if(res instanceof Promise) {
						res.then(
							value => resolve(value),
							reason => reject(reason)
						)
					} else {
						resolve(res);
					}
				} catch(err) { // 兼容抛出异常的情况
					reject(err);
				}
			}
			// 根据 Promise 状态调用对应回调函数
			if(this.PromiseState === 'fullfilled') {
				// 异步执行回调函数
				setTimeout(()=>callback(onResolved))
			}
			if(this.PromiseState === 'rejecteded') {
				setTimeout(()=>callback(onRejected))
			}
			
			if(this.PromiseResult === 'pending') {
				// 保存回调函数，以在状态改变时执行回调
				this.callback.push({ // 一对对添加（支持指定多个回调）
					// 支持异步修改 then 的返回值
					onResolved: function() {
						callback(onResolved);
					},
					onRejected: function() {
						callback(onRejected);
					}
				})
			}
		})
	}

	// 封装 catch 方法
	catch(onRejected) {
		return this.then(undefined, onRejected);
	}

	// 封装 resolve 方法（属于类）
	static resolve(value) {
		return new Promise((resolve, reject) => {
			if(value instanceof Promise) {
				value.then(
					value => resolve(value),
					reason => reject(reason)
				)
			} else {
				resolve(value);
			}
		})
	}

	// 封装 reject 方法（属于类）
	static reject(value) {
		// 返回失败的 Promise 对象
		return new Promise((resolve, reject) => reject(value))
	}

	// 封装 all 方法（属于类）
	static all(promises) {
		return new Promise((resolve, reject) => {
			// 记录成功的数量
			let count = 0;
			// 成功结果数组
			let arr = [];
			// 遍历数组，确定每一个 Promise 的状态
			for(let i = 0 ; i < promises.length; i++) {
				promises[i].then(
					v => { // 说明该对象成功
						count++;
						// 将当前成功结果存入数组（使用下标，不受任务结束顺序影响）
						arr[i] = v;
						if(count === promises.length) {
							resolve(arr);
						}
					},
					r => { // 对象失败（返回首个失败结果）
						reject(r);
					}
				)
			}
		})
	}

	// 封装 race 方法（属于类）
	static race(promises) {
		return Promise((resolve, reject) => {
			for(let i = 0 ; i < promises.length; i++) {
				promises[i].then(
					r => { // 修改返回的 Promise 状态
						resolve(v);
					},
					v => {
						reject(r);
					}
				)
			}
		})
	}
}
```

## 5 async & await

- `async` 函数
    
    返回一个 Promise 对象，结果由函数返回值决定
    ```js
    async function test() {
	    // 1. 返回 非Pomise对象 => 成功，res = 返回值
	    // 2. 返回 Promise对象 => 结果一致
	    // 3. 抛出异常 => 失败，reason = 抛出结果
    }
	let res = test(); // res 是一个 Promise 对象
	```
    
- `await` 表达式
	- 右侧表达式一般为 Promise 对象（也可以是其他值）
		- 为 Promise 对象时
			- 成功 -> 返回 Promise 成功的结果
			- 失败 -> 抛出异常，需要通过 `try-catch` 捕获
		- 非 Promise 对象时，直接返回
		> `await` 必须写在 `async` 中（但是 `async` 中不一定有 `await` 表达式）

     ```js
	 async function test() {
		// 1. 右侧为成功的 Promise
		let p_1 = new Promise((res, rej) => res("OK"));
		let res_1 = await p_1; // res_1 = "OK"
		// 2. 右侧为失败的 Promise
		let p_1 = new Promise((res, rej) => rej("OK"));
		try {
			let res_2 = await p_2;
		} catch(err) {
			console.log(err); // 打印失败结果
		}
		// 3. 右侧非 Promise
		let res_3 = await 28; // res_3 = 28
	 }
	 ```

### Sample 读取文件

需求：读取三个文件的内容，拼接后输出

```js
const fs = require('fs');
const util = require('util');
const mineReadFile = util.promisify(fs.readFile);

async function main() {
	try {
		// await 会抽出 PromiseResult
		let data1 = await mineReadFile('file1');
		let data2 = await mineReadFile('file2');
		let data3 = await mineReadFile('file3');
	} catch(err) {
		console.log(err);
	}
	console.log(data1 + data2 + data3);
}
```

### Sample 发送 Ajax 请求

需求：点击 button 后，发送Ajax请求获取信息

```js
const btn = document.querySelector("#btn");
btn.onCLick = async function() {
	let info = await sendAJAX(url); // 是前面封装的函数，返回值是 Promise 对象
	// 或者直接用 axios（本身是基于 Promise 封装的）
	console.log(info);
}
```

## 6 并发限制

> Credit to [爱哭的赵一一@BiliBili](https://www.bilibili.com/video/BV1i24y1L72L/?spm_id_from=333.1007.top_right_bar_window_view_later.content.click&vd_source=013de089347095b68d0b8a5183bcb8f2)，苯人把原本的 TS 扭曲成了 JS

```js
/* sleep 用于模仿异步任务
 * Number timeout 单位为 ms
 * String taskName
 */
function sleep(timeout, taskName) {
	return new Promise((resolve, reject) => {
		console.log(`Task [${taskName}] begin`);
		setTimeout(() => {
			console.log(`Task [${taskName}] finishied`);
		}, timeout);
	})
}

/* doSomething 用于限制异步任务的最大并发数
 * Function tasks = () => sleep(timeout, 'tName')
 * Number limit 最大并发数
 */
 
async function doSomething (tasks, limit) {
	const taskPool = new Set(); // 正在执行的任务集合
	for(var task of tasks) {
		const p = task();
		// 包装以兼容同步任务
		const promise = Promise.resolve(p)
		taskPool.add(promise);
		// 移除执行完毕的任务（异步）
		promise.then(
			res => {
				taskPool.delete(promise);
			}
		)
		// 若总数 > limit 等待最快任务执行完毕
		if(taskPool.size >= limit) {
			await Promise.race(taskPool);
		}
	}
	return Promise.all(taskPool)
}

// 测试
dosomething(tasks, 2).then(
	res => console.log('All tasks finished');
)

/* genTasks 用于生成图片加载任务数组
 * String Array urls 用于记录每张图片的 URL 地址
 * 返回值 Array tasks = () => Promise
 */
function genTasks(urls) {
	const tasks = [];
	urls.foreach(url => {
		tasks.push(() => new Promise((resolve, reject) => {
					 const img = new Image();
					 img.src = url;
					 // 监听加载完毕
					 img.onLoad = () => {
						 resolve();
					 }
		}))
	})
	return tasks;
}
```