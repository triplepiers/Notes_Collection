## 1 创建工程

### Vue-cli
```bash
## 安装或升级 vue-cli
npm install -g @vue/cli
## 创建项目 
vue create prj_name
## 启动服务
cd prj_name
npm run serve
```

#### 工程结构
```js
// @ main.js - 不兼容 Vue2 语法
import {createApp} from 'vue' // 引入用于创建实例的工厂函数（不用 new）
createApp(App).mount('#app')  // 创建应用实例对象
```

- `<template>` 中可以没有根标签

### Vite
> [Vite 官网](https://vitejs.cn)
> 无需打包即可冷启动，实现了按需编译（不需要等待整个应用编译完成）

```bash
## 创建工程
npm init vite-app prj_name
## 进入目录
cd prj_name
## 安装依赖
npm install
## 运行
npm run dev
```

## 2 常用 Composition API

### 优势
- 配置式 API 需要分别在各自的配置中修改 `data / methods`
    来自不同功能块的数据和方法被揉在了一起
- 组合式 API 可以将同一功能的数据和方法定义在一起（比如说 `hook`）

### setup
- 执行时机
    在 `beforeCreate` 之前，此时 `this = undefined`
- 参数
	- `props` 对象类型，包含组件外传递并声明接收的属性
	- `context` 上下文对象
		- `attrs` 组件外传递，但没有声明接收的数据，等价于 Vue2 `this.$attrs`
		- `slots` 接收的插槽内容，等价于 Vue2  `this.$slots`
		- `emit` 用于分发自定义时间的函数，相当于 Vue2  `this.$emit`
		    所以在 `setup` 函数中，可以通过 `context.emit('name', val)` 触发事件
```js
import {h} from 'vue'
// @ component.js
export default { 
	// 也可以继续使用 data 和 methods 进行配置 - v3 不能读 v2 的配置内容
	// v2 v3 配置冲突时，以 v3 配置内容(setup) 为主
	setup() { // 不能是 async 函数
		// data - static
		let name = "Tom"
		let age = 18

		// method 
		function sayHello() {
			alert(`my name is ${name}, i'm ${age} years old now.`)
		
		return { // 返回格式为对象时，数据和函数都可以直接使用
			name: name,
			age, // 简写
			sayHello
		}

		// 返回渲染函数时，使用自定义内容顶替 template
		return () => h('h1', 'title捏')
	}
}
```

### ref
> 实现响应式数据

```js
import {ref} from 'vue'
export default {
	setup() { // 通过 ref 生成引用对象 - 基本数据类型生成了 get/set
		let name = ref('Tom')
		let age = ref(18)
		let job = ref({ // 使用就是 job.type / jop.salary
		// 分量本身不是响应式数据 -> 所有分量被打包成了一个 proxy
		// 只有 proxy 在内存中的地址改变 - 整个替换，才能检测到变化
			type: 'front',
			salary: '15k'
		})

		// 在函数中修改变量值 -> 修改 obj.value
		// 但是插值语法里直接用变量名就行了（不用.value）
		function changeInfo() {
			name.val = 'Jake'
			age.val = 19
			job.value.type = 'back'
		}
	}
}
```

### reactive
> 定义一个 **对象类型** 的响应式数据（基本数据类型需要使用 `ref`）
> 
> - 对数据的监视是 **深层次** 的 => 支持多层 obj 进行包裹
>   
> - 支持把 **数组** 改成响应式 => 直接通过下标进行访问和修改
>   
> - 一般流程是 `const 代理 = reactive(源对象)` 然后把代理暴露出去

```js
import {reactive} from 'vue'
export default {
	let job = reactive({ // 生成一个 Proxy - 每个分量都是响应式数据
		type: 'front',
		salary: '15k'
	})
	function changeInfo() { // 不用使用 .value 进行套娃了
		job.type= 'back'
		job.salary = '20k'
	}

	// 鉴于 ref 的修改比较魔怔，下面用 reactive 完全打包
	let person = reactive({
		name: '',
		job: {
			type: '',
			salary: ''
		},
		hobby: []
	}) // => 虽然修改的时候需要疯狂的 person.xxx 就是了
}
```

### Ref vs Reactive
- 定义数据
	- `ref`：基本数据类型
	   （若定义对象/数组，则自动调用 `reactive` 生成代理对象）
	- `reactive`：对象/数组 类型
- 原理
	- `ref`：通过 `Object.defineProperty()` 实现响应
	- `reactive`：通过 `Proxy` 实现响应，使用 `Reflect` 操作 src_obj 内部数据
- 使用
	- `ref`：需要通过 `.value` 操作数据（模版中读取时不需要）
	- `reactive`：操作与读取均不需要 `.value` 后缀

### 备注
- `$attrs` - 兜底
    当父组件中传入的变量没有在 `props` 中明确声明接收时，将出现在 `$attrs` 中
	- 当仅主动声明接收部分外部数据时，`attrs` 中将包含未声明部分
	- `attrs` 中接收的数据将无法限制类型 / 设定默认值
- 插槽
    父组件向组件传递插槽内容，但子组件中未声明 `slot` 标签时，传入数据将被保存在 `son.$slots` 中
	- 存储形式为：由虚拟结点构成的数组
	- 未声明所属插槽的节点将存储在 `default` 数组中
	- 通过 `v-slot:xxx` 声明的节点将存储在对应的 `xxx` 数组中
- `emits` 配置项
    在 Vue3 中，子组件必须声明自己身上绑定的所有事件
	```js
	emits: ['hello'] // 绑定事件名称所构成的数组
	```

## 3 响应式原理

### Vue2
- 通过 `defineProperty()` 对属性进行读取、修改和拦截
- 对于数组类型 - 改写了一系列方法（对变更方法进行了包裹）
- 问题
	- 新增 / 删除 属性时，界面不会更新（解决方案如下）
	   `this.$set(this.obj, 'key', 'val')` / `this.$delete(this.obj, 'key')`
	- 通过 idx 修改数组时，界面不会更新

### Vue3
- 实现
	- 通过 `Proxy` 拦截对象中任意属性的变化（包括修改 + 增删）
	    ```js
	    const obj = new Proxy(src_obj, {
		    get(target, propName) { // 不同于 defineProperty.get()
			    return Reflect.get(target, propName)
		    },
		    set(target, propName, val) { // 增/改 时均调用
			    Reflect.set(target, propName, val)
		    },
		    deleteProperty(target, propName) { // 返回是否删除成功
			    return Reflect.deleteProperty(target, propName) 
			}
	    })
		```
	- 通过 `Reflect` 对属性进行操作
	    通过返回值报错 - 有错误可以继续跑 - 不用写一堆的 try-catch

## 4 计算属性与监视

### computed
- 其实也可以直接用 Vue2 中的 `computed` 属性单独配置
    可以看到 `setup` 中暴露的数据（但是需要以 `this.var` 进行访问）
```js
// 需要手动 import 一下
import {computed} from 'vue'

setup() {
	// 定义基础的数据
	let person = reactive({
		firstName: '',
		lastName: ''
	})

	// 简写形式（不考虑 Write 的情况）
	let fullName = computed(()=>{
		return person.firstName + '-' + person.lastName
	})
	// 完整形式（兼顾 RW - 规定了覆写的规则）
	let fullName = computed({
		get() {
			return person.firstName + '-' + person.lastName
		},
		set(val) {
			const nameArry = val.split('-')
			person.firstName = nameArry[0]
			person.lastName = nameArry[1]
		}
	})
	// 把 fullName 塞给 person（其实定义的时候塞也可）
	person.fullName = fullName
	// 记得暴露一下
	return {
		person // 我们把 fullName 动态追加到 person 里，所以不用单独进行暴露
	}
}
```

### watch
- 两个坑
	- 监视 `reactive` 定义的响应式数据时：无法正确获取 `old_Value`，强制开启深度监视
	- 监视 `reactive` 定义的响应式数据**中的某个分量**时：`deep` 配置有效（不强制深度监视）
```js
setup(){ // watch 不需要向外暴露
	// 1. 监视 ref 定义的响应式数据
	watch(sum, (new_val, old_val) => {
		do sth
	},{immediate: true})
	// 2. 监视 ref 定义的多个数据（OR）
	watch([sum, msg], (new_val, old_val) => {
		do sth // 此时 old/new_val 为数组 - 和定义序列一致
	})
	// 3. 监视 reactive 定义的完整数据
	watch(person, (new_val, old_val) => {
		// old_val 无法正确获取, deep === true
	},{immediate: true})
	// 4. 监视 reactive 定义数据的分量
	watch(()=>person.job, (old_val, new_val) => {
		// 可以配置 deep 哩！
	},{immediate: true, deep: false})
	// 5. 监视 reactive 定义数据的某些分量
	watch([()=>person.name,()=>person.age], (old_val, new_val) =>{
		do sth
	})
	// immediate 表示 初始化 的时候也进行监听
}
```

在监视 `ref` 定义的多层级对象时，可以通过对 `obj.value` 进行监视以实现深层次监视 

=> 本质上是对一个 `proxy` 对象进行了监视，自带 `deep:true` 性质

### watchEffect
```js
import {watchEffect} from 'vue'
// 不指明监视的对象，上来就写回调函数
watchEffect(() => {
	const x1 = sum.value // 自动监视所有提到的数据
	const x2 = person.job.salary // 可以分辨多层对象 - 仅关注细分量
	do sth
})
```

> 有些类似于 `computed` -> 所依赖的任一数据发生变化时，就执行回调函数

## 5 生命周期

- 最后的生命周期由 `destroy` 调整为 `unmounted` => 和开始时的 `mounted` 呼应
- 只有在指定挂载对象后，才会开始一系列的生命周期
- 配置方式
	- Vue2-Like：直接使用钩子名称作为配置项进行配置
	- 在 `setup` 中进行配置，其中 `beforeCreate/created` 对应了 `setup` 本身
		-  其他的生命周期钩子都需要改名成 `on???` ，例如 `beforeMounted -> onBeforeMounted`
		- 每个改名的组合式 API 都需要单独在上名进行引入
		- 每个函数都需要指定回调函数 `onMounted(()=>{})`
	- 同时使用两种方式进行配置时，组合式 API > 配置项（两个都调，但是 API 早一点）

### 自定义 hook
> 本质上是对 `setup` 中的组合式API进行封装的函数
> 
> 类似于 `mixin`，可以通过复用代码，使得 `setup` 的逻辑更加清晰

在 `hooks/usePoint.js` 下编写待封装的内容：
```js
import {reactive, onMounted, onBeforeUnmounted} from 'vue'
export default function() { // 整个打包成一个函数
	// data
	let point = reactive({
		x:0, y:0
	})
	// methods
	fuction getPos(e) {
		point.x = e.pageX
		point.y = e.pageY
	}
	// life circle
	// 1. 需要在挂载之后就绑定事件
	onMounted(()=>{
		window.addEventListener('click', getPos )
	}),
	// 2. 不使用组件后，移除对事件的坚听
	onBeforeUnmount(()=>{
		window.removeEventListener('click',getPos)
	})
	return { // 把数据给出去
		point
	}
}
```

在组件中使用 hook:
```js
import userPoint from '../hook/usePoint' // 暴露的是个函数喔
export default {
	setup() {
		let point = usePoint() // 接收 hook 返回的 point 数据
		// 我们不关心 usePoint 执行的过程，把数据拿来用就行
		return {
			point // 把数据给本组件中的模版使用
		}
	}
}
```

### toRef
> 把一个东西变成 `ref` => 把数据拆散后暴露给模版

```js
import {torRef} from 'vue'
export default {
	let person = reactive({
		name: '',
		age: 0
	})
	// name_1 只是单纯的文本内容拷贝
	const name_1 = person.name
	// name_2 是一个 RefImpl 对象（具备引用源地址的响应式特征）
	const name_2 = toRef(person, 'name')
	// 拿一个多层级下的内容（第一个参数是最近的父级对象）
	const salary = toRef(person.job.j_1, 'salary')
}

// toRefs 可以处理多个属性
const x = toRefs(person.job) // 会把指定对象变成响应式数据
// 希望把该对象的所有分量展开导出，可使用如下语法：
return {
	...toRefs(person.job) // 只会在 setup 执行时调用一次 - 没法动态追加
	// 但是把 person 本身交出去就可以动态添加/删除数据了
}
```

## 6 其他 Composition API

### shallowReactive / shallowRef
- `shallowReactive` 只有第一层分量为响应式数据
- `shallowRef` 不处理**对象类型**的响应式数据（不会调用 `reactive`）
    `value` 分量为 `Object` 类型 => Vue 无法监听到数据变化
- 使用场景
	- 有一个结构较深的对象，但只有最外层属性发生变化 - `shallowReactive`
	- 有一个对象，后续不会修改分量，只会生成新的对象进行替换 - `shallowRef`

### readonly / shallowReadonly
> 只读 —— 保护数据（对于别人传入的数据也适用）

```js
let person = reactive({
	naem: 'Tom',
	age: 18,
	job: {
		type: 'front',
		salary: '18k'
	}
})

person = readonly(preson) // 使用只读对象覆盖 person

// shallowReadonly 仅保护第一层分量
```

### toRaw / markRaw
- `toRaw` - 将通过 `reactive` 生成的响应式对象转为普通对象
  
    例如：读取响应式对象的 `src_obj`，对其进行操作不会引起页面更新
    
- `markRaw` - 标记一个对象，使其永远不会成为响应式对象
  
    渲染具有不可变数据源的大列表时，跳过响应式转换可以提高性能

### customRef
> 创作一自定义的 `ref` ，并对 依赖跟踪 & 更新触发 进行显式控制

下面以实现「防抖」为例：

```js
import {ref, customRef} from 'vue'
export default { // 实现延迟显示
	setup() {
		// 实现 customRef
		function myRef(val) {
			let timer
			return customRef((track, trigger)=>{
				get() {
					track() // 通知 Vue 追踪 val 的变化
					return val
				},
				set(new_val) {
					clearTimeout(timer) // 防抖
					timer = setTimeout(()=>{
						val = new_val // 修改通过初始化得到的数据
						trigger()     // 通知 Vue 重新解析模版
					}, 500)
				}
			})
		}
		
		let keyWord = myRef('')
		return {keyWord}
	}
}
```

### provide & inject
> 实现**祖孙**组件间通信
> 
> 父元素通过 `provide` 提供数据，后代元素通过 `inject` 来使用

```js
// @ source
import {provide} from 'vue'
setup() {
	let car = reactive({naem:'', price:0})
	provide('car', car) // 向所有后代组件提供数据
}
// @ target
import {inject} from 'vue'
setup() {
	let car = inject('car')
}
```

### 响应式数据判断
- `isRef`
- `isReactive`
- `isReadonly`：由 `reactive` 创建的只读代理
- `isProxy`：由 `reactive / readonly` 创建

## 7 新的组件

### Fragment
> Vue3 组件可以没有根标签（框架自己会把它包在虚拟标签内）
> 
> => 使用 `fragement` 进行包裹可以得到一个不被渲染的统一根标签

### Teleport
> 将组件的 HTML 结构移动到指定位置

```html
<teleport to="pos">
	pos 可以是 html 标签名（直接塞成子元素）或 CSS选择器
	<div>some structures, 比如弹窗</div>
</teleport>
```

### Suspense
> 等待异步组件时渲染额外内容（loading...）
> 
> 异步原因：网速慢 / 组件做了网络请求

```js
import {defineAsyncComponent} from 'vue' // 静态引入
const Child = defineAsyncComponent(()=>import('url')) // 异步引入
// 异步引入的组件将进行异步加载
```

使用 `suspense`
```html
<template>
	<h1>Father</h1>
	<suspense>
		<template v-slot:default>
			<Child/> 使用 suspense 包裹异步加载的子组件
		</template>
		<template v-slot:fallback>
			loading 内容
		</template>
	</suspense>
</template>
```

## 8 Vue3 的其他变化

1. 全局 API 转移
     在 Vue2 中存在于 `vm` 身上的 API 被调整到了 `app 应用实例` 上
2. `data` 始终需要被声明为函数
3. 过渡动画类名变化 `.v-enter/leave-from/to`
4. 不再支持 `keyCode` 修饰 `key-on` ，同时移除了 `config.keyCode` 自定义按键别名
5. 移除了 `@event.native` 修饰原生事件（通过子组件声明 `emits` 进行识别）
6. 移除了 `filter` -> 建议用 `methods / computed` 替代
 