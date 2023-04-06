> 此处以 [AntD](https://ant.design/index-cn) 为例进行实现，国外用的比较多的是 [Material UI](https://www.material-ui.com/#/)

## 基本使用
1. 安装 `npm i antd --save`
2. 简单使用
  ```js
	import 'antd/dist/reset.css' // 引入样式
	import { Button } from 'antd' // 引入需要使用的组件
	<Button type="primary">正常用就行</Button>
  ```
3. 使用图标需要安装子库 `npm i @ant-design/icons --save`
	```js
	import { StarTwoTone } from '@ant-design/icons';  // 引入需要的图标
	<StarTwoTone twoToneColor="#eb2f96" />
	```

## 样式按需引入
1. 安装依赖：
     `yarn add react-app-rewired customize-cra babel-plugin-import less less-loader`
2. 修改 `package.json`
	```json
	....
		"scripts": {
			"start": "react-app-rewired start",
			"build": "react-app-rewired build",
			"test": "react-app-rewired test",
			"eject": "react-scripts eject"
		},
	....
	```
3. 在根目录下创建 `config-overrides.js`
	```js
	//配置具体的修改规则
	const { override, fixBabelImports,addLessLoader} = require('customize-cra');
	module.exports = override(
		fixBabelImports('import', {
			libraryName: 'antd',
			libraryDirectory: 'es',
			style: true,
		}),
		addLessLoader({
			lessOptions:{
				javascriptEnabled: true,
				modifyVars: { '@primary-color': 'green' },
			}
		}),
	);
	```
4. 不用 `import 'antd/dist/reset.css'` 哩

## 自定义主题
> 具体 [文档](https://ant.design/docs/react/customize-theme-cn) 见链接
> 
> 因为 antd5 弃用了 less，采用了 CSS-in-JS 所以原来的东西不能用哩

### 在单个组件中生效
```js
import { ConfigProvider} from 'antd' // 追加引入 config 配置器
export default class App extends Component {
	render() {
		return (
		// 在 config 的 theme 中对主题进行自定义
		// 只对夹在 config 之间的 tag 生效
			<ConfigProvider
			theme={{
				components: {
					Button: {
						colorPrimary: '#00b96b',
					},
				},
				
			}}>				
				<Button type="primary" children="一个绿色按钮"/>
			</ConfigProvider>
		)
	}
}
```