浏览器对象模型，典型的浏览器对象有：

- `Window` - 代表整个浏览器窗口
- `Navigator` - 浏览器信息，用于识别不同浏览器
- `Location` - 地址栏信息，用于获取或修改 URL
- `History` - 浏览器历史记录（由于隐私原因不能获取「具体」地址，只能前后跳）
- `Screen` - 用户屏幕，可以获取显示器的相关信息

> 以上 BOM 对象都是 `window` 对象的属性，都可以直接使用（window 本身套娃用 `window.self`）

## 1 Navigator

- 由于历史原因，Navigator 中的大部分属性已经不能帮助我们识别浏览器了
- 我们一般使用 `navigator.userAgent` 字符串来判断浏览器信息

## 2 History

- 属性
	- `length` 浏览器历史列表中的 URL 总量
- 方法
	- `back()` - 返回上一个 URL
	- `forward()` - 前往下一个 URL
	- `go(n)` - 前往历史记录中的某一个具体页面，n > 0 时前进 n 个页面；反之回退 n 个页面


## 3 Location

- 直接打印 `location` 将获取当前页面的完整 URL
- 我们可以对 `location` 进行绝对 / 相对路径修改，实现自动跳转并增加历史记录
- 属性（设置或读取）
  
    |   属性名   | 描述              |
    |:----------:| ----------------- |
    |   `hash`   | 从 # 开始的 URL   |
    |   `host`   | 主机名 + 端口号   |
    | `hostname` | 仅主机名          |
    |   `href`   | 完整 URL          |
    | `pathname` | 仅路径部分        |
    |   `port`   | 仅端口号          |
    | `protocol` | 协议 HTTP / HTTPS |
    |  `search`  | 从 ? 开始的 URL   |

- 方法
  
    |      方法名       | 描述                       |
    |:-----------------:| -------------------------- |
    |  `assign('URL')`  | 加载新的文档，生成历史记录 |
    | `reload(Boolean)` | 重新加载当前文档 ，传入 `true` 将强制清空缓存   | 
    |     `replace('URL')`     | 使用新的文档替换当前文档，不会生成历史记录   |

## 4 Timer

### 4.1 定时调用

- `setInterval(func, interval)` interval 的单位为 ms，返回 Number 作为 ID
- `clearInterval(id)` 可以关闭指定的 timer（传入 `undefined` 也不会报错）
  
```js
// 简单的 countdown
var num = 100;
var timer = setInterval(function(){
	count.innerHTML = num--;
	if(num == 0) clearInterval(timer);
}, 1000);
```

### 4.2 延时调用
> 只执行一次

- `setTimeout(func, delay)` delay 的单位为 ms，返回 Number 作为 ID
- `clearTimour(id)` 关闭延时调用
