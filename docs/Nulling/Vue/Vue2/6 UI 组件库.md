> 这边用 `element-ui` 进行举例

## 常用组件库

### 移动端
- [Vent](https://youzan.github.io/vant)
- [Cube Ui](https://didi.github.cube-ui)
- [Mint UI](http://mint-ui.github.io)
- [Nut UI](https://nutui.jd.com)

### PC端
- [Element UI](https://element.eleme.cn)
- [IView UI](https://www.iviewui.com)

## 基础使用
> Vue3 版本需要安装 `element-plus`

1. 安装 `npm i element-ui`
2. 引入
	```js
	// @main.js - 完整引入
	import ElementUI from 'element-ui'
	import 'element-ui/lib/theme-chalk/index.css'
	Vue.use(ELementUI)
	
	// 按需引入 - babel-plugin-component
	// 1. 作为开发依赖安装 npm i babel-plugin-component -D
	// 2. 修改 babel.config.js 
	import {Button, Select} from 'element-ui'
	Vue.component(Button.name, Button) // 单独注册（前面可以自己取tag名）
	Vue.component(Select.name, Select) 
	```
3. 使用 - 往 template 里面丢标签就行

##  集成第三方动画
> 此处使用 `animate.css`

1. 安装 `npm install animate.css --save`
2. 引入 `import 'animate.css'`
3. 配置（ `name` + 进入 / 离开 样式）
	```html
	<transition name="animate_animated animate_bouncd"
	enter-active-class="animate_swing"
	leave-active-class="animate_backOutUp">
	</transition>
```