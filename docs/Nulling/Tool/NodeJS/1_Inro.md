# NodeJS

> 在 NodeJS 里，你搞不了 DOM/BOM，但可以使劲嚯嚯本地文件。

## 模块化：你不是单文件战神

### CommonJS 规范

- CommonJS 将每个 JS 文件视为单独的模块
- 默认情况下，外界**无法访问**模块内的属性和方法、必须进行暴露
- 不导出的 方法/属性 都是 **私有的** => 无论命名格式是不是 `_funcName()`。

```js
// @ file_1.js
const name = 'file1';
const printName = () => {
  console.log(name);
}

console.log('@file1'); // 导入时执行

// 暴露方法 1
module.exports = {
  name, // 不进行重命名
  say: printName
}
// 暴露方法 2
exports.say = printName
```

好的，现在我们在另一个文件里进行引入

```js
// @ file_2.js
const m1 = require('/path/to/file_1');
m1.say();
```

> 以及 JS 并不会出现循环引用的问题：假如存在 `C->B->A` 的依赖关系，同时在 `C & B` 中引入 `module A` 并不会报错。
>
> 反正哪里要用就在哪里引用一下（多次引用不会多次触发）。

### ES 规范

> NodeJS 默认支持的是 CommonJS，如果要用 ES 的话得配置一下：
>
> ```json
> // @ package.json
> {
>   "type": "module" // 默认值是 "commonjs"
> }
> ```

在模块暴露和引入部分就很传统浏览器了：

```js
// @ module A
const name = 'mod A';
const moduleA = {
  sayMyName(){ console.log(name); }
}
export default moduleA; // 这边导出的是一个整体

// @ module B
const moduleB = {
  sayMyName() { console.log('mod B'); }
}
export {
	moduleB               // 导出指定接口
}

// @ index
import  moduleA  from './moduleA.js';
import {moduleB} from './moduleB.js'; // 需要解构
moduleA.sayMyName();
moduleB.sayMyName();

```

## 包管理：我补药造轮子口牙

### NPM

总之列一些常用的命令吧：

```bash
npm init # 初始化当前目录，生成 package.json

# 以下命令中的 install 均可替换为 uninstall, update
npm install [packageName]@[version]  # 安装指定版本
npm install [packageName] -g         # 全局安装
npm install [packageName] --save     # 固定依赖版本，生成 package-lock.json
npm install [packageName] --save-dev # 开发环境依赖，不参与打包

npm list    # 列举当前目录下的包
npm list -g # 列举全局环境下的包

npm info [packageName]         # 获取指定包的详细信息
npm info [packageName] version # 获取指定包的最新版本

npm outdated                   # 列举过时依赖
```

下面是 `package.json` 中版本号的一些说明：

```json
// @ package.json
{
  "dependencies": {
    "md5": "2.1.0",  // 安装 2.1.0 版本
    "md5": "^2.1.0", // 安装 2.*.* 中的最新版本
    "md5": "~2.1.0", // 安装 2.1.* 中的最新版本
    "md5": "*",      // 安装全局最新版本
  }
}
```

换源：

- 我们必定能够手动换源，belike：

  ```bash
  npm config set registry [URL]
  ```

- 我们也可以通过 NPM 镜像管理工具（NRM）进行管理，并在多个 NPM 源之间进行灵活切换

  ```bash
  npm install -g nrm # 全局安装 NRM
  
  nrm ls             # 查看可选源头，带 * 的是当前使用源
  nrm use [repoName] # 切换到指定源
  nrm test           # 测试响应时间
  ```

- 其实也可以使用 CNPM

  ```bash
  npm install -g cnpm --registry=https://registry.npmmirror.com
  # 之后装包命令都改成 cnpm xxx
  ```

### Yarn

没想到吧，这东西还是得通过 NPM 安装

```bash
npm install -g yarn
```

相比于 NPM，我们 Yarn さん：

- 速度超快：Yarn 缓存了所有下载过的包（无需重复下载），且支持并行下载（NPM 只能串行）
- 更安全：Yarn 会校验包的完整性

好的，下面又是一些常见命令：

```bash
# 初始化项目（好熟悉）
yarn init 
# 安装全部依赖
yarn install

# 添加依赖
yarn add [packageName]
yarn add [packageName]@[version] # 会生成 yarn.lock 锁定版本
yarn add [packageName] --dev

# 升级依赖
yarn upgrade [packageName]@[version]

# 移除依赖
yarn remove [packageName]
```

## 内置模块：朕的后端框架何在

### HTTP 模块

```js
// 引入内置依赖
const http = require('http'); 

// 请求的 URL 是否合法
function renderStatus(url) {
  // 处理的相当 naiive => 没办法处理带参数的
  const  valid_url = ['/home', '/list'];
  return valid_url.includes(url)?200:404;
}

// 创建本地服务器
const server = http.createServer((req, res) => {
  // req: 浏览器传入的参数，res: 服务端返回的数据
  
  // req.url 给的是不带 域名&端口号 的后缀
  if(req.url == '/favicon.ico') {return;} // 不给图标
  
  res.writeHead(
    renderStatus(req.url),
    {'Content-Type': 'application/json;charset=utf-8',} 
    // 不加 UTF-8 可能导致中文乱码
    // 当传输由 `` 包裹的 HTML 内容时，需要标注 contentType = text/html
  );
  // 最后必须有一个 res.end()，否则会报超时
  res.end(JSON.stringify({
    data: 'Hello World!'
  }))
  // 你也可以直接用 res.end(params) 来写普通数据（字符串，数组...）
});

server.listen( 
  8080,                           // 监听 8080 端口
  ()=>{ console.log("server on")} // 跑起来之后马上调用
);
```

啊其实有个等效写法（说来 `createServer()` 里的函数是每次请求就会回调的）

```js
const server = createServer(); // 这里啥也不用配
server.on('request', (req, res) => {
  // 每次收到 request 时执行的回调
})
server.listen(8080);           // 开始监听
```

#### 跨域

##### JSONP

JSON with Padding（JSONP）是一种用于解决浏览器同源限制的跨域数据请求技术，通过动态创建 `<script>` 标签以加载外部资源、并通过回调函数处理返回的数据。

其一般流程长下面这样：

1. 客户端发送请求：客户端需要首先定义一个**回调函数**，并通过 `<script>` 标签的 src 属性向后端请求数据（并附上指定的回调函数名称）

   ```html
   <script>
   	// 定义回调函数
     function handleResponse(data) { console.log(data); }
   </script>
   <!-- 允许执行通过 src 加载的跨域 JS 文件 -->
   <script src="https://server.com:442/api?cb=handleResponse"></script>
   ```

2. 服务器响应：返回一个以指定数据为回调函数实参的 JS 文件

   ```js
   return handleResponse({ name: 'aaa', age: 12})
   // 具体行为由前端定义，反正把 data 作为实参传回去就行
   ```

3. 客户端处理：加载并执行返回的 JS 文件

这个 Step 2 用 NodeJS 写就是下面这个感觉：

```js
var JSON_data = {name: 'John Doe'};

server.on('request', (req, res) => {
    const url = URL.parse(req.url, true);
    // 前端的请求是 /api?cb=handleResponse
    switch(url.pathname) {
        case '/api':
            res.end(
              // 第一个 ${} 支持前端自行执行 callback 函数名
              `${url.query.cb}(${JSON.stringify(JSON_data)})`
            );
            break;
    }
});
// 返回的是 handleResponse({"name": "John Doe"});
```

##### CORS

```js
// 总之要写一下包头
server.on('request', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'applications/json;charset=utf-8',
    'access-control-allow-origin': '*', // CORS 部分：允许所有域通过
  })
  res.end(...); // 写点数据
});
```

#### 中间件：反正后端之间不跨域

如果 API 分别布在不同服务器上，前端就得一个个配置跨域（累的要死）。我们可以通过 Node 服务器向其他服务器发送 GET/POST 请求（这样就只用在当前的 Node 中间件上配置一次跨域了）。

```js
const https = require('https');

httpGET('https://api_url', (data) => {
  res.end(data); // 把数据塞回前端给的请求里
})

function httpGET(API, callback) {
  var data = "";
  // 如果对面的 API 是 http 协议的话，可以直接使用 http.get() 进行请求
  // 如果对面用的 https 的话，就要引入 https 模块了
  https.get(API, (res) => {
    res.on('data', (chunk) => { 
      // 这边返回的是数据流，需要自己用 buffer 装一下
      data += chunk;
    })
    res.on('end', () => {
      // 所有数据传输完毕
      callback(data);
    })
  })
}

// 模拟前端填完表单找后端要数据 => 所以是 POST 哇
function httpPOST(API, callback) {
  var data = "";
  var options = {  // 这个是 post 接口要求的
    hostname: 'server.com',
    port:     443, // 用的 HTTPS
    path:     '/api/getcustomer',
    method:   'POST',
    headers:  {    // 模拟表单 
      'Content-Type': 'application/json'
      /* 也可能是这个格式: 'x-www-form-urlencoded'
         对应下面的 write 内容: 'id=1&age=100' */
    }
  }
  // 离谱的是不叫 POST，叫 request
  var req = https.request(options, (res) => {
    res.on('data', (chunk) => { data += chunk; })
    res.on('end',  ()      => { callback(data);})
  });
  // 这边是为了 req 能真正发出去（必须有 end ）
  req.write( // 把要求的表单数据搓进包里
  	JSON.stringify([{},{'baseParam': {'ypClient':1}}])
  );
  req.end();
}
```

#### 爬虫

> 解析 HTML，提取需要的数据

```js
var cheerio = require('cheerio'); // 这是第三方模块

var html_content = httpGET(URL, (data) => spider(data));

function spider(data) { // 拿正则搞一些需要的标签
  let $ = cheerio.load(data);         // 这下像是 jQuery 了
  let movies = [];
  
  let $movieList = $('.col.content'); // 反正是选择器
 	$movieList.forEach((idx, item) => {
    // 把 item 变成 jQ 对象 => 找到里面的 .title 元素 => 获取文本
    movies.push({
      title: $(item).find('.title').text(),
      actpr: $(item).find('.actor').text()
    });
  })
  return JSON.stringify(movies);
}
```

### URL 模块

#### 旧版（已弃用）

来来来，解析前端请求路由：

```js
const url = require('url');

// req.url = /api/list?a=1&b=2
var url_obj = url.parse(req.url);
url_obj.pathname = '/api/list';      // base URL
url_obj.query    = 'a=1&b=2';        // GET 参数
// 如果需要进一步解析 query 参数的话，需要设置第二个实参为 true
var url_obj = url.parse(req.url, true);
url_obj.query = { a: '1', b: '2' };  // 好用的 JSON ！
```

那么后端要怎么把 URL 拼回去呢（但我觉得挺鸡肋的）：

```js
const urlObjcet = {
  protocol: 'https',
  slashes:  true,
  auth:     null,
  host:     'www.host.com:443',
  port:     443,
  hostname: 'www.host.com',
  hash:     '#tag=110',
  search:   '?a=1',
  query:    { a: '1' },
  pathname: '/ad/index.html',
  path:     '/ad/index.html?a=1'
}
const parsedURL = url.format(urlObject); 
// res = https://www.host.com:443/ad/index.html?a=1
```

地址拼接（更抽象了）：

```js
url.resolve('/one/two/', 'three'); // /one/two/three（末尾追加）
url.resolve('one/two/', 'three');  // one/three      (替换首个斜杠后所有)

// 替换首个斜杠后所有
url.resolve('http://www.sample/com/', '/two');
url.resolve('http://www.sample/com/one', '/two');
// 上面俩都输出 http://www.sample/com/two
```

#### 新版

```js
// 创建 URL 对象，req.url = /api?a=1
const URL_obj = new URL(req.url, 'https://server.com:port');

// Parse
URL_obj.pathname = '/api';
// 是迭代器（类似于 Py 里的 map）
URL_obj.searchParams = URLSearchParams { 'a' => '1' }; 
for (let [key, val] of URL_obj.searchParams) {} // ... 做一些遍历操作
URL_obj.searchParams.get('a');                  // 获取指定属性值

// Format
url.format(URL_obj, {
  unicode: true,  // 中文是否用 unicode 编码
  auth:    false, // 去掉 server:port 部分
  fragment:false, // 是否保留 # 后的内容
  search:  true,  // 是否保留 ? 后的内容
})

// Resolve
URL_obj.href = "https://server.com:port/api?a=1"; // 拼接结果
```

#### QueryString

query 字符串 x 结构体之间的互相转换（不过是在切字符串罢了）

> MD，这和 JSON 模块有什么区别吗？

```js
const querystring = require('querystring');

var query_obj = { x: 3, y: 4 };
querystring.stringify = 'x=3&y=4';

var query_str = 'name=aaa&age=15';
querystring.parse(query_str) = { name: 'aaa', age: '15' s};

// 转义字符（防注入）：总之斜杠、中文什么的都被创飞了
escaped  = querystring.escape(query_str);
original = quertstring.unescape(escaped); // 还原一下
```

### Events 模块

> 我们可以把项目解耦成“订阅-发布”模式

```js
const EventsEmitter = require('events');
const event = new EventsEmitter();

var eventName = 'play';
event.on(eventName, (data) => {
  // do sth
})
// 上面的回调会在每次 event.emit(eventName, data) 时被触发
```

看起来没啥大用不是吗？但是这东西支持异步处理诶

```js
/* 每当收到前端请求，我们新建一个 event
   不然每次触发分支都会 新建 一个对 ok 的监听（类似于 timer 叠加）*/
var event = new EventsEmitter();
// 开始监听 'ok' 事件
event.on('ok', data=>res.end(data)); // 给前端发回数据
httpGET(API); // 这边的 end() 需要调用 event.emit('ok', data)
```

### FS 文件操作

> 因为底层是用 C++ 写的，所以可以嗯造本地文件

目录处理，喜闻乐见了：

```js
const fs = require('fs');

// 经典新建目录（不阻塞）
// mkdirSync() 方法会阻塞，需要加 try-catch 处理
fs.mkdir('./avatar', (err) => {
  // 如果成功的话会是 null
  if (err) { console.log(err); }
})
// 同理，我们有熟悉的删除目录（不能删非空目录）
fs.rmdir('./avatar', (err) => {...})

// 删除文件（不阻塞），可以用 unlinkSync()
fs.unlink('path/to/file', (err) => {...})

// 罗列指定目录下的文件（返回 文件名 arr）
fs.readdir('targetDir', (err, data) => {...})
```

然后我们可以搓出一个递归删除目录的函（我自己搓的，不保证对）：

```js
// forEach 方法不会阻塞，我们得想一个异步调用的办法
function rrmdir(baseDir) {
  fs.promise.readdir(baseDir).then(async (data) => {
    await Promise.all(data.map(item => {
      let cur = path.join(baseDir, item);
      fs.stat(cur, (err, res) => {
        if (res.isFile()) {
          fs.unlink(cur, err=>{...});
        } else {
          rrmdir(cur);         
        }
      })
    }));
    await fs.rmdir(baseDir);
  })
}
```

文件处理：

```js
// 经典重命名（不知道能不能当 mv 用）
fs.rename('./oldName', './neoNAme', (err) => {...})

// 写文件（会覆盖哦）
fs.writeFile('path/to/file', content, (err) => {...})
// 追加（不覆盖）
fs.appendFile('path/to/file', content, (err) => {...})

// 读文件（异步）
fs.readFile('path/to/file', (err, data) => {
  // 因为这边默认读出来的是二进制
  if (!err) { console.log(data.toString('utf-8')) }
})
// 也可以提前指定用 utf-8 格式读取
fs.readFile('path/to/file', 'utf-8', (err, data) => {...})

// 我们也可以实现 Promise 风格的异步读取
fs.promise.readFile('path/to/file', 'utf-8').then(res=>{...})
```

#### Stream 输入输出流

因为文件大的时候不方便直接异步嘛，所以我们再来看看流式输入输出模块 Stream

```js
var rs = fs.createReadStream('targetFile', 'utf-8');
rs.on('data', (chunk) => {})
rs.on('end', () => console.log('finished'))
rs.on('error', (err) => {...})

var ws = fs.createWriteStream('targetFile', 'utf-8');
ws.write(part1);
ws.write(part2);
ws.end();
```

但是在复制较大文件时，读写两边的流速可能对不齐（让我们用 pipe 连接一下）

```js
// copy f1 -> f2
var rs = fs.createReadStream('f1', 'utf-8');
var ws = fs.createWriteStream('f2', 'utf-8');

// 用管道连一下
rs.pipe(ws); // 搞完他会自己把流关掉的
```

#### Zlib 压缩与解压缩

```js
const zlib = require('zlib');
const gzip = zlib.createGzip();

// 其实 readStream 也可以串到服务器返回上
server.on('request', (req, res) => {
  const rs = fs.createReadStream('targetFile', 'utf-8');
  res.writeHead(200, {
    'Content-Type': 'pliantext',
    'Content-Encoding': 'gzip' // 不然前端没法正常解压缩
  });
  rs.pipe(gzip).pipe(res); // 先压缩，再传送
});
```

#### Crypto 加密好啊

用 C++ 实现了通用的哈希和加密算法，总之效率大提升。

首先来看一些用于签名的方法：

```js
const crypto = require('crypto');
// 把参数改成 sha1 就可以换另一种了
const MD5    = crypto.createHash('md5');

MD5.update(plain_text);         // 默认 utf-8，也可以用 buffer
console.log(MD5.digest('hex')); // 以十六进制显示

// 还支持 Hmac，但需要提供密钥（有种加盐的美感）
const HMAC = crypto.createHmac('sha256', secret_key);
// 下面也是 update + digest
```

Crypto 也支持对称加密算法（AES），总之加解密用一样的密钥

```js
const MOD = 'aes-128-cbc';

function encrypt(key, iv, data) {
  // iv 是初始向量（问题不大）
  // 用的 AES 128，所以 len(key) = 8
  let dep = crypto.createCipheriv(MOD, key, iv);
  return dep.update(data, 'binary', 'hex') + dep.final('hex');
}

function decrypt(key, iv, encrypted) {
  crypted = Buffer.from(crypted, 'hex').toString('binary');
  let dep = crypto.createDecipheriv(MOD, key, iv);
  return dep.update(crypted, 'binary', 'utf8') + dep.infal('utf8');
}
```

