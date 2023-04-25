## 0 Intro

全称是 Document Object Model，JS 使用 DOM 对 HTML 进行操作：

- Document - 整个 HTML 网页文档
- Object - 网页中的每一个部分都被转换为一个对象
- Model - 使用模型（DOM Tree）表示对象之间的关系，便于获取对象

### 节点 Node 

- 节点是构成 HTML 文档的最基本单元，不同节点具有不尽相同的属性和方法
- 一般分为以下四类
  
    ```html
    <p id="pId">This is a paragraph</p>
    
    - 整个是一个“元素节点”
    - id="pId" 是一个”属性节点‘
    - This is a paragraph 是一个”文本节点“
	```
  
	1. 文档节点：整个 HTML 文档
	   
	     浏览器提供了作为 window 属性的“文档节点” `document`，可以直接使用
	   
	2. 元素节点：各种 HTML 标签
	3. 属性节点：元素具有的属性
	4. 文本节点：HTML 标签中的文本内容
	   
- 节点属性
  
    | 节点类型 |   nodeName   | nodeType | nodeValue |
    |:--------:|:------------:|:--------:| --------- |
    | 文档节点 | `#documente` |    9     | null      |
    | 元素节点 |    标签名    |    1     | null      |
    | 属性节点 |    属性名    |    2     | 属性值    |
    | 文本节点 |   `#text`    |    3     | 文本内容  |

## 1 事件

- 事件是 文档/浏览器窗口 中发生特定交互的瞬间，JS 与 HTML 之间的交互是通过事件实现的
- 我们可以为事件绑定回调，这些代码将在事件触发时被执行

### 1.1 事件绑定

以单击事件处理为例：

1. 在标签中编写处理代码（高耦合）
	```html
	<button onClick="alert('click');">btn</button>
	```

2. 在标签中绑定函数 + 在 script 中实现
    ```html
    <button onClick="handleClick()">btn</button>
	```
	```js
	function handleClick() { alert("click") }
	```

3. 在 script 中绑定并编写代码（1to1）
	```js
	btn.onclick = function() {
		alert("click1");
	}
	btn.onclick = function() {
		alert("click2");
	}
	// 实际点击时只会弹出 click2 => 后面覆盖前面
	```
	
4. 使用 addEventListener（1toN）
   > IE8 及以下需要使用 `attachEvent('onEvent', function)`，会「逆序」调用回调
   
    ```js
    // 第三个参数：是否在「捕获阶段」触发事件，一般 false（默认也是 false）
    btn.addEventListener('click', function(){
	    alert('click1');
    }, false)
    btn.addEventListener('click', function(){
	    alert('click2');
    }, false)
    // 按绑定顺序执行多个回调：click1 -> click2
    
    // 兼容式写法
    function bind(obj, event, callback) {
	    if(obj.addEventListener) {
		    obj.addEventListener(event, callback, false);
	    } else { // 兼容 IE8
		    obj.attachEvent.call('on'+event, function(){
			    // 浏览器调匿名函数，匿名函数调 callback（自主控制）
			    callback.call(obj); // 统一 this 为绑定对象
		    };
	    }
    }
	```

### 1.2 文档加载

问题：把 script 写到 body 之前会导致获取不到元素（还没加载出来）

解决：把所有东西丢到 `window.onload` 绑定的函数中 => 页面加载完成后再执行代码 

### 1.3 事件对象

- Chrome 当事件被触发式，浏览器每次都会将一个事件对象作为「实参」传入响应函数
  
    => 必须用一个形参去接

- IE8 `event` 作为 `window` 的属性被保存

#### SAMPLE 1

> 当鼠标移入 `areaDiv` 后，在 `showMsg` 中显示坐标信息

```js
// 鼠标在「元素内」移动时触发
areaDiv.onmousemove = function(event) {
	if(!event) {
		event = window.event // 兼容 IE8
	}
	// 或者用 event = event || window.event

	// 兼容 firefox & Chrome
	showMsg.innerHTML = 'x = ' + event.clientX + ', y = ' + event.clientY;
}
```

#### SAMPLE 2
> `div` 跟随鼠标移动

```js
// 给 document 而非 div 绑定 onmousemove 事件
document.onmousemove = function(e) {
	e = e || window.event
	// div 记得开绝对定位
	// clientX / clientY 获取的是鼠标相对于「视口」的偏移量
	
	/* pageX / pageY 获取的是鼠标相对于「完整文档」的偏移量（不兼容 IE8）
	   可采用 clientX + scrollLeft / clientY + scollTop 替代
	*/
	
	/* 滚动条高度 scrollTop
	   Chrome 认为浏览器滚动条属于 body => document.body.scrollTop
	   Firefox 认为浏览器滚动条属于 html => document.documentElement.scrollTop
	*/

	var st = document.body.scrollTop  || document.documentElement.scrollTop
	var sl = document.body.scrollLeft || document.documentElement.scrollLeft
	div.style.left = e.clientX + sl + 'px' // e.pageX
	div.style.top  = e.clientY + st + 'px'  // e.pageY
}
```

### 1.4 事件冒泡 Bubble

- 后代元素触发事件时，祖先元素上的对应事件将被依次触发
- 通过事件对象手动取消冒泡
  
    ```js
	btn.onclick = function(event) {
		event = event || window.event;
		// 取消冒泡
		event.cancelBubble = true;
	}
	```
	
>	取消 `onmousemove` 的冒泡可能导致鼠标跟随功能不可用

### 1.5 事件委派

在之前的例子中，我们通过遍历为一组 tag 绑定事件处理函数 

=> 但对于新增元素，我们需要单独进行手动绑定

!!! question "一次绑定可以自动应用到所有元素（包括后增）吗"

我们尝试将事件绑定至「共同的祖先元素」，通过冒泡进行统一处理

- 问题：我们希望处理 `<li>` 的点击事件，但现在点击 `<ul>` 的区域也会触发，坏耶！
- 解决：判断「触发事件」的对象是否等于祖先元素本身
    ```js
    ul.onclick = function(e) {
	    e = e || window.event;
	    // 此处将所有 li 元素设为 link 类
	    if(e.target.className == 'link') { // 后代元素触发
	    // 我试了下 e.target !== this 也可以
		    alert("click li!")
	    }
    }
	```

### 1.6 事件传播
- 微软：在冒泡阶段执行 -> 从当前元素向祖先元素传递（由内向外）
- 网景：在捕获阶段执行 -> 从祖先元素向当前元素传递（由外向内）
- 无敌的 W3C 结合了两个公司的方案，将事件传播分为三个阶段：
	1. 捕获阶段（由外向内捕获，默认不触发）
	2. 目标阶段（事件捕获至目标元素，目标元素触发事件）
	3. 冒泡阶段（由内向外冒泡，默认在该阶段触发祖先元素事件）
	   
> 如果希望在「捕获阶段」触发，则需要将 `addEventListener` 第三个参数置为 `true`

## 2 DOM 查询

### 2.1 获取元素节点

- 通过 `document` 调用
  
	1. `getElementById` 「一个」元素
	2. `getElementsByTagName` 「一组」元素，返回类数组对象
	3. `getElementsByName` 「一组」元素，返回类数组对象
	4. `getElementsByClassName` 「一组」元素，返回类数组对象（IE9以上）
	5. `document.querySelector('css选择器')` 「一个」元素（存在多个时返回首个）
	   
	     `document.querySelectAll('css选择器')`「一组」元素，返回类数组对象

- 获取子节点 - 通过具体节点调用 
	1. `getElementsByTagName()` 返回当前节点的「指定标签名」后代节点
	   
		```js
		// 获取 #city 下的所有 li 节点
		var city = document.getElementById('city');
		var lis = city.getElementsByTagName('li');
		// 另一种方法
		var lis = document.querySelectorAll('#city > li');
		```
	   
	2. `childNodes` 当前节点的「所有」子节点
	   
	     包括文本节点，标签间的空白也会当成文本节点（IE8以下不计入空白文本）
	     
	     => `children` 可以返回不包含文本节点的所有子元素
	     
	3. `firstChlid` 当前节点的第一个子节点（包括空白文本节点）
	   
	     `firstElementChild` 可以获取第一个子元素（IE8以上）
	   
	4. `lastChlid` 当前节点的最后一个子节点
	   
- 获取 父节点/兄弟节点 - 通过具体节点调用
	1. `parentNode` 当前节点的父节点
	2. `previousSibling` 前一个兄弟节点（可能有空白文本节点）
	   
	     `previousElementSibling` 不包含空白文本（IE8以上）
	   
	3. `nextSibling` 后一个兄弟节点

- 获取 `<body>` - `document.body`
- 获取 `<html` - `document.documentElement`
- 获取所有所有元素 - `document.all` / `getElementsByTagName('*')`

### 2.2 获取元素属性

- 元素文字内容
	- `tag.innerHTML` （对自结束标签不起作用）
	- `tag.innerText` （自动去除 HTML 标签）
- 元素 class 属性 `tag.className`
  
	有多个 class 会返回一个 String（ `classList` 会返回数组）
  
- 其他元素属性 `tag.keyName`，如 `tag.id / tag.value`

### 练习 - 轮播图
> 通过修改当前图片 src 实现

```js
var imgArr = ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg'];
var idx = 0;

// 用于自动切换的 timer
var timer = setInterval(function(){
	idx++;
	if(idx == imgArr.length) idx=0;
	img.src = imgArr[idx];
}, 1000);

prev.onclick = function() {
	// 假设一共有 5 张图片
	--idx;
	if(idx<0) idx=imgArr.length-1;// 循环
	img.src = imgArr[idx];
}
next.onclick = function() {
	++idx;
	if(idx == imgArr.length) idx=0;
	img.src = imgArr[++idx]
}
```

??? info "伪 · 无限轮播图"
	- 需要在 maxx 后面再跟一张 first（记得配套改 btn）
	- 趁现在把 imgList 的 left & idx 重置为 0（这边需要自己写移动补间，不能用自带的 transition）
	- 记得点击 btn 的时候先关闭 timer，过一段时间再重置

##  3 DOM 增删改

|        方法         | 描述 |
|:-------------------:| ---- |
|   `appendChild()`   | 为指定节点添加新的子节点     |
|   `removeChild()`   | 删除子节点     |
|  `replaceChild(new, old)`   | 替换子节点  |
|  `insertBefore(new, sth)`   | 在指定子节点前插入新的子节点   |
| `createAttribute()` | 创建属性节点     |
|  `createElement('tagName')`  | 创建元素节点 |
| `createTextNode('text')`  | 创建文本节点    |

> 有时候不太清楚父节点到底是谁，就可以 `sth.parentNode.removeChild(element)`
> 
> 同理，实现点击 `button` 删除一整行数据时，我们可以通过 `this.parentNode.parentNode...` 找到作为整行父节点的 `<tr>` 进行删除

下面是一些例子：

```js
// 为 #city 添加 “广州” 子节点（只刷新新增的 li 节点）
btn.onclick = function() {
		// 创建 li 元素节点
		var li = document.createElement("li")
		// 创建文本节点
		var txt = document.createTextNode("广州")
		// 打包 <li> 标签
		li.appendChild(txt);
		// 把 <li> 塞给 #city
		document.getElementById("city").appendChild(li);
}
// 也可以通过修改父元素的 innerHTML 实现（刷新整个ul，会导致其他li绑定的事件失效）
btn.onclick = function() {
	document.getElementById('city').innerHTML += '<li>广州</li>'
}
// 一个结合的方法
btn.onclick = function() {
	var li = document.createElement('li')
	li.innerHTML = '广州' // 只刷新内存中的这个节点
	document.getElementById('city').appendChild(li) // 局部刷新
}
```

!!! info "可以在 `onclick` 函数末尾 `return false` / 设置 `href='javascript:;` 阻止超链接的默认跳转行为"

!!! info "`confirm('提示词')`  可用于弹出兼具 确认/取消 按钮的弹窗，返回 Boolean"

## 4 操作内联样式

> JS 操作的是内联样式，优先级仅次于 `!important`

- 修改样式 
  
	固定语法：`element.style.样式名 = value`

	若样式名中包含 `-` ，需要修改为小驼峰，如：`backgroud-color -> backgroundColor`

- 读取样式
  
	>只能读取内联样式，**不能读取样式表中的样式**
  
	固定语法： `element.style.样式名`
	
	宽度之类的属性带有 `px`，不能直接进行加减计算

- 读取元素「当前」样式
  
    >综合样式表与内联样式结果，「只读」
    
	- IE：`element.currentStyle.样式名` 
	
	- Chrome：`window.getComputedStyle(element, null)['样式名']`
	  
	    第二个参数是伪元素，一般传 `null`（要查 `before/after` 的时候传对应字符串）
    
    > IE 中 `auto` 返回 `auto`，Chrome 中返回「实际值」
    
    ```js
    // 虽然 IE 寄了但还是写一个兼容不同浏览器的方法吧
    /* getStyle(obj, name)
     * obj - 待处理元素，name - 待获取属性名 */
    function getStyle(obj, name) {
	    // 必须加 window：变量找不到会报错，属性找不到只会返回 undefined
	    if(window.getComputedStyle) {
		    return getComputedStyle(obj ,null)[name]
	    } else { // IE8 特供
		    return obj.currentStyle[name]
	    }
	    // => 也可以缩成一行三目运算符
    }
	```
	
- 其他一些相关属性
  
    > 返回不带单位的数字，「只读」
  
	| 属性                 | 描述                                          |
	| -------------------- | --------------------------------------------- |
	| `clientHeight/Width` | 元素可见高度/宽度（content + padding）        |
	| `offsetHeight/Wifth` | 元素的高度/宽度（content + padding + border） |
	| `offsetParent`       | 获取定位父元素                                |
	| `offsetLeft/Top`     | 相对定位父元素的偏移量                        |
	| `scrollHeight/Width` | 元素滚动区高度/宽度                             |
	| `scrollTop/Left`     | 元素滚动距离                                  |

!!! info "滚动事件通过 onscroll 事件进行监听"
!!! info "满足 `scrollHeight - scrollTop == clientHeight` 时，滚动条「触底」"

!!! question "每次修改都会重新渲染「整个页面」，如何提高效率"

- 我们可以准备两个 class 的样式，通过修改标签的 className 一次性重置多个样式，减少重新渲染的次数
- 为了避免重复添加相同类名，我们可以封装以下函数
    ```js
	function hasClass(obj, className) {
		var reg = new RegExp("\\b" + className + "\\b"); // 要求 className 为独立单词
		return reg.test(obj.className);
	}
	```

## 5 拖拽

直接进行一个 Sample 的写：div 跟随鼠标拖拽行为

```js
// 鼠标按下，开始拖拽（把move放外面会脱离控制）
div.onmousedown = function(e) {
	if(div.setCapture) { // 防止 Chrome 寄了
		div.setCapture(); // 强制捕获下「一次」鼠标点击事件(IE8)
	}
	// 或者用 div.setCapture && div.setCapture() 首个条件 true 才看下一个

	/* 尝试让鼠标指针保持点击时的偏移，相对偏移量
	   x向 = clientX - offsetLeft
	   y向 = clientY - offsetTop
	*/
	e = e || window.event
	var ol = e.clientX - div.offsetLeft;
	var ot = e.clientY - div.offsetTop;
	// 鼠标移动，修改 div 位置
	document.onmouse = function(e) {
		e = e || window.event;
		// 修改位置
		div.style.left = e.clientX-ol + 'px';
		div.style.top  = e.clientY-ot + 'px';
	}
	// 鼠标松开，停止移动（放外面也会导致惨案）
	// PlanA: 在 div 上监听 mouseup => 被兄弟元素盖住就停不下来了
	div.onmouseup = function() {
		document.onmousemove = null;
	}
	// PlanB: 在 document 上监听 mouseup => 在哪里都能停
	document.onmouseup = function() {
		document.onmousemove = null;
		// 顺便取消本身（一次性事件）
		document.onmouseup = null;
		if(div.releaseCapture) {
			div.releaseCapture(); // 取消对事件的强制捕获(IE8)
		}
	}

	// 浏览器会默认搜索拖拽内容 => 这可能会影响拖拽功能（阻止一下）
	return false;
}


```

## 6 滚轮

滚轮向下滚动，div 变长；向上滚动时变短

```js
// 古早版本：onmousewheel 不兼容火狐（addEventLietener + DomMouseScroll）
// 如今 onwheel 一统天下
div.onwheel = function(event) {
	event = event || window.event
	// event.wheelData 判断滚动方向（正值向上，负值向下）- 不支持 firefox
	// firefox: event.detail = +-3 正值向下，负值向上
	// 现在貌似用 deltaY 一统天下（上正下负）
	if(event.deltaY > 0) {
		div.style.height = div.clientHeight - 10 + 'px;'
	}
	else {
		div.style.height = div.clientHeight + 10 + 'px;'
	}
	// 防止 body > 100vh 时整体页面滚动
	return false;
}
```

!!! info "使用 `addEventListener` 绑定的事件需要使用 `event.preventDefault()` 阻止默认行为"

## 7 键盘
> 键盘事件一般绑定给可以获取焦点的对象或 `document`（比如 `<input>`）

| 事件        | 描述           |
| :-----------: | -------------- |
| `onkeydown` | 任意按键被按下（按着不放会一直触发） |
| `onkeyup`   | 任意按键被松开 |


```js
document.onkeydown = function(event) {
	// 通过 event.keyCode 判断具体哪个键（单个）被按下
	// 组合键需要通过 altKey, ctrlKey, shiftKey(Boolean) 组合判断
	if(event.ctrlKey && event.keyCode === 83) {
		alert('保存！') // 判断组合键 ctrl + S
	}
}
// 阻止 keydown 的默认事件会导致「无法输入」
input.onkeydown = function(event) { // 不允许输入数字
	if(event.keyCode >= 48 && event.keyCode <= 57) return false
}
```

Sample：div 跟随方向键移动
```js
// 支持连续移动 -> 选用 keydown（但是第一次会卡顿）
document.onkeydown = function(e) {
	// 甚至可以设置 speed 变量，然后通过 ctrl +- 控制速度
	switch(e.keyCode) {
		case 37: // left
			div.style.left = div.offsetLeft - 10 + 'px';
			break;
		case 39: // right
			div.style.left = div.offsetLeft + 10 + 'px';
			break;
		case 38: // up
			div.style.top  = div.offsetTop  - 10 + 'px';
			break;
		case 40: // down
			div.style.top  = div.offsetTop  + 10 + 'px';
			break
	}
	return false; // 防止滚动
}
```

改进：使用 timer 改版首次卡顿的问题

```js
var speed = 10;
var direct = 0;

// 我们通过修改 direct 来修改方向
setInterval(function(){
	switch(direct) {
		case 37: // left
			div.style.left = div.offsetLeft - speed + 'px';
			break;
		case 39: // right
			div.style.left = div.offsetLeft + speed + 'px';
			break;
		case 38: // up
			div.style.top  = div.offsetTop  - speed + 'px';
			break;
		case 40: // down
			div.style.top  = div.offsetTop  + speed + 'px';
			break
	}
}, 30)

document.onkeydown = function(e) {
	// 点击 ctrl 会使速度加快
	if(e.ctrlKey) speed += 10;
	// 修改移动方向
	direct = e.keyCode;
}
// 松开时取消移动
document.onkeyup = function(){
	direct = 0;
}
```