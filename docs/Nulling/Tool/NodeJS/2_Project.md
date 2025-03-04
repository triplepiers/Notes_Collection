# 来写项目吧

## 不得不装的依赖

```bash
# 你想拥有一个热更新的后端吗
npm i -g nodemon          # node-dev 也行
nodemon /path/to/index.js
```

## RESTful 接口规范

接口地址只包含表示资源的名词，具体操作由 HTTP 动作表示：

```text
原：GET  /blog/addArticle
现：POST /blog/article
```

本来你可能全用 GET，然后在 API 里写 get/add/edit/delete

现在你分别用使用 `GET-获取`, `POST-添加`, `PUT-修改`, `DELETE-删除`

## MVC 业务分层

> 没事，翁恺课上就没学会（总之很 JAVA）

- 路由：`router.js`，负责将请求分发给 C 层

  ```js
  router.post('/book', BookController.addBook)
  ```

- `Controller` C 层：负责处理业务逻辑 —— 调用 V & C，并返回结果

  ```js
  module.exports = const BookController {
    addBook: async (req, res, next) => {
      const {name, num} = req.body;
      await BookService.addBook(name, num);
      res.send({ok:1});
    }
  }
  ```

- `Service`：我不知道有什么用 ...

  ```js
  module.exports = const BookService {
    addBook: (name, num) => {
      return BookModel.create({name, num})
    }
  }
  ```

- `Views` V 层：只是前端模版页面

- `Model` M 层：处理数据（CURD 操作），定义了数据结构之类的东西

## APIDOC：自动生成接口文档

APIDOC 支持自动生成 RESTful 风格 API 的文档。当然，这需要你的代码注释符合特定格式。

> 注释格式挺麻烦的，可以在 VSCode 里装一个 `ApiDoc Snippets` 插件

```text
/**
  * @api {post} /api/user user
  * @apiName addUser
  * @apiGroup userGroup
  * @apiVersion 1.0.0
  *
  * @apiParamExample {multipart/form-data} Request-Sample:
  * {
  *		username: 'admin',
  *   password: '123'
  * }
  * 
  * @apiParam {String} username 用户名
  * @apiParam {String} password 密码
  *
  * @apiSuccessExample {bool} Success-Response:
  * {
  *		ok: true
  * }
  *
  * @apiSuccess (200) {bool} ok 标识是否成功
  **/
```

然后你就可以用如下的命令一键生成文档到 `./doc` 目录：

```bash
api -i [srcDir] -o ./doc
```

## 路由搭建

```js
// 根据前端请求路由，返回对应的 HTML 文件 / 后端数据
const MIME = require('mime'); // 第三方模块，用于判断包头用啥 type
// 合并路由
function use(obj) { Object.assign(route, obj) }
const route = {}; // 也可以通过 route = {...r1, ...r2} 来合并
route.use(PageRouter);
route.use(APIRouter);s

// 后端服务，启动！
server.on('request', (req, res) => {
  const myURL = new URL(req.url, host);
 	try {
    route[myURL.pathname](res, req);
  } catch (err) {
    route['/404'](res, req);
  }
  res.end();
})

function renderHTML(state, res, path, type="") {
  res.writeHaed(state, {
    'Content-Type': `${type?type:'text/html'};charset=utf8`
  });
  res.write(fa.readFileSync(path), 'utf-8');
}

// ? 存在静态资源吗
function isExistStaticResource(pathname) {
  if (fs.existsSync(pathname)) {return true}
  else {return false}
}

// 略显抽象：返回指定的 HTML 文件
const PageRouter = {
  '/': (res) => { // 重定向到 home
    renderHTML(200, res, './static/home.html')
  },
  '/home': (res) => {
    renderHTML(200, res, './static/home.html')
  },
  '/favion.ico': (res) => {
    renderHTML(200, res, './static/favicon.ico', 'image/x-icon');
  }
  '/404': (res，req) => {
    // 判断 /static 下是否存在对应资源（实际上 icon 也能处理）
    let pathname = new URL(req.url, host).pathname;
  	pathname = path.join(__dirname, 'static', pathname); // 拼接绝对路径
    if (isExistStaticResource(pathname)) {
      // 使用 MIME，基于扩展名判断需要的包头类型
      renderHTML(200, res, pathname, MIME.getType(pathname.split('.')[1]))
      return;
    }
    
    renderHTML(404, res, './static/404.html');
  }
}

// 拼接返回的数据
function renderJSON(state, res, data, type="") {
  res.writeHaed(state, {
    'Content-Type': `${type?type:'application/json'};charset=utf8`
  });
  res.write(data);
}
// 仅用于登陆验证
function validateUsr(usrname, pws) {
  if (usrName === 'CB' && pwd == '123') {
    renderJSON(200, res, `{"ok": true}`)
  } else {
    renderJSON(200, res, `{'ok': false}`)
  }
}
const APIRouter = {
  // GET 请求处理
  '/api/login': (res, req) => {
    // 获取 query 参数
    let params  = new URL(req.url, host).searchParams;
    let usrName = params.get('username');
    let pwd     = params.get('password');
    validateUsr(usrName, pwd);
  },
  // POST 请求处理
  '/api/post': (res, req) => {
    var data = ""
    req.on('data', chunk => data += chunk);
    res.on('end', () => {
      data = JSON.parse(data);
     	let usrName = data.username;
      let pws     = data.password;
      validateUsr(usrName, pwd);
    })
  }
}
```

## Express 框架

是不是觉得用原生 Node 提参数很墨迹？用 Epress 就对了

```js
const express = require('express'); // 是第三方，记得装

const app = express(); // 创建服务器 

// 每个 get() 对应了单一路由处理逻辑，路由支持：string，字符串模式，正则
app.get('/home', (req, res, next) => {
  res.send('hello'); // 等价于 write + end，而且能自动写包头
  // 你甚至可以给他串多个顺序的处理函数
  next(); // 只有调 next() 才会顺下去
}, (req, res) => {})
// 也可以用数组来塞
app.get('/home', [cb1, cb2, ...]) // 甚至 ('/path', [func1], (req, res)=>{})
app.get('/ab?cd', () => {})   // [模式] //abcd 或 /acd
app.get('/log/:id', () => {}) // [模式] /id/****（算是占位符）也可以 /:id1/:id2 套娃
app.get(/.*\.txt$/,   () => {}) // [正则] 以 .txt 结尾

app.listen(8080, () => {...})
```

应用级中间件：如果每个路由前面都要鉴权，那必不可能全手调一遍哇：

```js
const isValid = (req, res, next) => {}
app.use(isValid); // 于是所有路由前面都会先调用 isValid()
```

以及书写顺序 MATTERS（如果你放在 login 前面的话，那永远检测不过了），所以应该是：

```js
app.get('/login', ()=>{})
app.use(isValid)         // app.use('/home/*', [isValid]) 仅作用于 /home/****
app.get('/afterLog', ()=>{})
```

事实上一坨 `get()` 叠一起也很难看，所以 Express 还提供了路由中间件（你可以拿来套娃）：

```js
app.use('/page', PageRouter); // 这里还是应用级，浅浅挂载一下

const PageRouter = express.Router();  // 路由级别，匹配 /page/**
PageRouter.get('/', (req, res) => {});// 实际上匹配的就是 /page
```

然后整个 APP 可能需要一个兜底的错误处理函数（也可以用中间件）：

```js
app.use(...)
// Router 都注册好了
app.use((req, res) => {
  res.status(404).send('error'); // 不规定的话，默认返回 200
})
```

### 获取请求参数

啊实时上直接用 `req.body` 拿到的 POST 参数不太好用，这里得配置一下内置的中间件

```js
// @ index.js

// 用于处理 form 编码格式的拼接参数 usr=aaa&age=12
app.use(express.urlencoded({extended:false}));
// 用于处理 JSON 格式的 POST 参数 {usrname:'aaa', age:12}
app.use(express.json())

// 后面再注册路由
app.use(LoginRouter)
```

下面是一些拿 GET / POST 请求参数的示例

```js
// @ LoginRouter.js
const router = express.Router();

// 实际上处理的是 /login 的 GET 请求
router.get('/', (req, res) => {
  var data = req.query; // 拿到的是结构体
  var usrname = data.username;
  var pws     = data.password;
})
// 然后你同时可以响应 /login 的 POST 请求
router.post('/', (req, res) => {
  var data = req.body; // 会被统一成结构体
  var {username, password} = data; // 其实是等价的
})

modules.exports = router;
```

### 静态资源托管

只要配置一下中间件就好了：

```js
// @ index.js
// 配置多个静态资源文件夹
app.use(express.static('static'))
app.use(express.static('public'))
```

那么对于下面的文件结构：

```text
├── static
│   └── home.html
├── public
│   └── login.html
└── test.ts
```

我们可以通过 `host/home.html` & `host/login.html` 直接访问（不用打目录）；

当然，如果一定想要打目录的话，可以用下面的格式注册

```js
app.use('/static', express.static('public'))
// 然后就可以用 host/static/login.html 访问了
```

### 服务端渲染

可以被爬虫完整爬出来（但前后端分离的话，只能爬到空壳），但是首先得装点插件

```bash
npm install ejs
```

然后你得配点环境：模版存在哪个文件夹下面啊？用什么引擎解析模板啊？

```js
// @ index.js
app.set('views', './views');    // 放在 ./views 路径下
app.set('view engine', 'ejs');  // 使用 ejs 作为解析引擎
```

啊那么对于下面的请求，服务端会找到 `./views/login.ejs` 渲染好页面

```js
router.get('/login', (req, res) => {
  res.render('login', {title: 'Hello'});  // ./views/login.ejs
})
```

好的，来看看 EJS 模版（其实是把 `<%=[varname]%>` 替换成传入的参数）：

```html
<h1>
  推荐商品：<%=title%> 
</h1>
  
<text>
  <%= isShow?'也支持三目来着':''%>
</text>
也可以变成下面这样（不会有 text 标签了）
<% if(isShow) { %>
 <text>也支持三目来着</text>  
<% } %>
  
<ul>
  也支持 for 循环来着（不加等号！）
  <%for(let i=0;i<list.length;i++){%>
  	<li><%= list[i] %></li> 这里是变量
  <% } %>
</ul>
      
但也有要用 - 的时候（要解析 HTML 片段）
<%- htmlFragment %>
  
HTML 的注释 <!--- ---> 会被发给前端
但 EJS 自己的注释不会 <%# balabala %>
  
以及经典模版拼接 —— 你也不想每个页面重写 header 罢
<%-include('./footer.ejs'), {showTitle: false} %>
```

然后 EJS 也提供了重定向功能：

```js
router.post('/login', (req, res) => {
  if (isValid) {
    res.redirect('/home'); // 会执行 /home 的回调
  }
})
```

> 给出 HTML 文件，你能直接给我把 EJS 模版端上来吗？

可以的，首先我们要重新配置一下

```js
app.set('views', './views');
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);
```

### 项目生成器

当然，我们也得安装一下（但怎么是通过 `npx` ?)

```bash
npx install express-generator
# 老版本得用 npm 进行全局安装
npm install -g express-generator
```

然后你可以用 `express [prjName] --view=ejs`  一键生成（默认用的是 jade 模版）

这个项目需要通过 `node ./bin/www` （或者 `npm run start`）启动

### 登录鉴权

#### Cookie x Session

```js
// @ index.js
const session = require('express-session'); // 引入
app.use(session({                           // 注册
  name: '',
  secret: '',
  cookie: {
    maxAge: 1000*60*60, // 过期时间，单位是 ms
    secure: false       // 为 true 时，只有使用 HTTPS 才能获取
  },
  resave: true,           // 每次重设 session 都重置时间
  saveUninitialized: true // 无论是否登录成功，首次访问都给
})); 
// 放在 Router 注册之前
```

Cookie 存在前端作为 Session-ID（特别容易被伪造），所以在后端（内存或数据库）再存一个 Session

浏览器发请求会自动带上 Cookie & Express 会自动设置 Cookie，所以底层全都看不到（那太好了）

Cookie 过期的时候，浏览器也会自动删掉（那也太好了）

- 这边我们配了 `saveUninitialized: true`，所以就算是路人也会被发一个 Cookie 
  我们什么时候再为路人配置 Session 呢？用户登录成功的时候：

  ```js
  const UserController = {
    login: async (req, res) => {
      const {usrname, pwd} = req.body;
      const data = await UserService.login({usrname, pwd});
      if (data.length === 0) {
        res.send({ok: false})
      } else { // 登录成功
        // 设置 session => 往里面挂字段（默认存在内存里）
        req.session.usr = data[0];
        res.send({ok: true})
      }
    }
  }
  ```

- 然后我们可以在 render 的时候判断 session 里面是否有对应值

  ```js
  // req.session 会自动匹配 cookie（每个人不一样）
  router.get('/', (req, res) => {
    if (req.session.usr) {    // 已经登录
      res.render('index');
    } else {
      res.redirect('/login'); // 叉出去登录
    }
  })
  ```

但上面这个方法只在访问 `/` 的时候校验了，但是其他 API 都没管 => 我们需要应用级的鉴权中间件！

```js
// @ index.js
app.use(session({}));

// 设置鉴权中间件
app.use((req, res, next) => {
  if (req.url.includes('login') || req.session.usr) {
    // 重设 session & 更新 Cookie 过期时间
    req.session.date = Date.now(); 
    next(); // 准备登录 or 已经登录 的都放过去
  } else {  // 叉出去登录
    /* 但是前端用 AJAX/fetch 发请求的话，就不会管后端有没有让他重定向
       如果是 接口：返回错误码，前端自己搞，不是接口（路由）：重定向 */
    // 但 Axios 就可以，很神奇吧
    if (req.url.includes('api')) {
      // 这样前端在每个 ajax 请求里都得校验
      res.status(401).send({ok: false});
    } else {
      res.redirect('/login'); 
    }
  }
})

app.use(routers);
```

销毁 Session：用户主动退出登录时，我们要怎么移除后端的 Session 呢？

```js
const UserController = {
  ...,
  logout: (req, res, next) => {
    // 捏妈妈的真方便啊（但其实没有清除前端的 Cookie
    req.session.destroy(() => {
      res.send({ok: true});
    })
  }
}
```

此时我们的 Session 还是放在内存里，只要重启就会直接寄掉。如果放在 DB 里，我们还要手动去删除过期的记录。

=> 没事，我们有第三方的中间件可以自动删掉 MongoDB 里过期的 Session 数据

```js
const MongoStore = require('connect-mongo');
app.use(session({
  ...,
  rolling: true, // 超时前刷新会重置 Cookie 过期时间
  store:  MongoStore.create({
  	mongourl: 'mongodb://...', // 会建一个新的 DB（不是 table）
  	ttl:      1000*60*60       // 过期时间
	})
}))
```

#### JWT: JSON Web Token

1. Session 存在的问题：

   - 如果后端存在多台服务器
     - 每台服务器都 copy 一遍 session（你为什么要重复存啊）
     - 单独一台服务器存 session，校验完再调其他服务（单点压力巨大）

   - 可能导致 CSRF 攻击：因为浏览器会自动带 Cookie，你点伪装链接之后可能会被冒用身份

2. ❓我们为什么不让用户自己存呢（于是有了 Token）

   - 放在 localStorage 里也不会被自动发出去

   - 显然存明文也不合适 => 存一些加密签名

3. Token 存在的缺点

   - Token 会比 session_id 大，需要挤占更多带宽
   - 无法再服务器上主动注销
   - 加密签名的计算开销大

```js
const jsonwebtoken = require('jsonwebtoken');
const secret = 'xxxx';

const JWT = {
  generate: (value, expire) => {
    // 过期时间 expire 需要设置为 '[N]s' 格式
  	return jsonwebtoken.sign(
      value, secret, {expiresIn: expire}
    )
	},
  verify: (token) => {[
    try { // 因为 JWT 过期时会报错
    	return jsonwebtoken.verify(token, secret)
    } catch (e) {
      return false;
    }
  ]}
}
```

好的，下面着手把 Cookie-Session 校验代码改装成 JWT 版本

```js
// 登录部分的逻辑
const UserController = {
  login: async (req, res) => {
    const {usrname, pwd} = req.body;
    const data = await UserService.login({usrname, pwd});
    if (data.length === 0) {
      res.send({ok: false})
    } else { // 登录成功
     	const token = JWT.generate({
        _id: data[0]._id,
        username: data[0].username
      }, '1h'); // 生成 token
      res.header('Authorization', token);        // 放在 header 里发回去
      res.send({ok: true})
    }
  }
}

// 鉴权中间件部分的逻辑
app.use((req, res, next) => {
  if (req.url.includes('login') || ) {
    next();
    return;
  }
  if (req.headers['authorization']) {
  	// 前有 Bearer
  	const token = req.headers['authorization'].split(' ')[1]; 
  	const payload = JWT.verify(token);
  	if (payload) {
      // 重设 token 过期时间
      const neoToken = JWT.generate({
      	_id: payload._id,
        username: payload.username
      }, '1h');
      res.header('Authorization', neoToken); 
      next();
    } else {
      res.status(401),send({errInfo: 'Token' 过期});
    }
	} else {
    // 没带 token 是前端的锅
  }
})
```

前端怎么存 token：每次发之前带上、收之后更新

```js
// 这是前端哦 => axios 拦截器版本

// 每次发请求前调用
axios.interceptors.request.use(function(config) {
  // 把 localStorage 里存的 token 往 header 里一塞
  const token = localStorage.getItem('token');
  config.headers.Authorization = `Bearer ${token}`;
	return config;
}, function(err) {
  return Promise.reject(err);
})

// 每次请求（成功）后调用
axios.interceptors.response.use(function(res) {
  // 存储 header 中携带的 token
  const { authorization } = res.headers;
  if (authorization) {
    localStorage.setItem('token', authorization);
  }
	return res;
}, function(err) {
  if (err.response.status == 401) {
    localStorage.removeItem('token');
    location.href = '/login';
  }
  return Promise.reject(err);
})

// 退出时，删除 token、跳回登录页面
exit.onclick = () =>{
  localStorage.removeItem('token');
  location.href = '/login';
}
```

### 文件上传：表单提交

```js
// 用于处理 multipart/form-data 类型数据的中间件
const multer = require('multer');
// 上传文件的存储路径（这边是因为 /public 被托管为静态资源了），也可以直接存 ./uploads + 托管
const upload = multer({dest: './public/uplaods'}); 

// sample：在创建用户时存储头像
router.post('/user', upload.sinlge('avatar'), UserService.addUser)
/* 这边的 'avatar' 是文件对象在表单中的 name 字段取值
   - 此时在 UserService.addUser 中，可以通过 req.file 拿到对应的文件名
     完整的相对路径是 path.join('./public/uplaods', req.file) 
   - 如果用户不上传 avatar，req.file=undefined、需要处理为默认值
*/
/* sample：向客户端返回头像图片（其实是二进制文件）
   本质上返回的是 URL，让前端自己请求一下图片资源 */
<img src="${item.avatar}"/>

// 其实前端那个 uploadFile 是支持传 多张 图片的（这时候需要换一个 API）
const MAX_NUM = 10;
upload.array('photos', MAX_NUM);
// 其中 MAX_NUM 是最多接受的文件数量，其存储路径于 req.files 中返回
// 前端的表单项中也需要添加 multiple 属性
<input type='file' id='photos' multiple/>
```

## koa(v2) 框架

```bash
npm install koa
```

啊笑鼠，这个框架是搓 express 的团队重新搓出来的。

- koa **不在内核中绑定任何中间件**，只丢下一个轻量优雅的函数库，不留一丝云彩（但比较难上手）。

- 不同于 express 使用 callback + promise 实现异步，koa2 通过 async/await 进行处理（我怎么感觉前者更🐂？）

- express 的回调序列是线性的（反复 `next` 执行下一步），而且 `next()` **同步执行**（不会等返回，除非返回的是 Promise 对象 + 手动指定 `await next()`）

  > 所以 express 最好补药写成两面包夹 `next()` => 直接把后面的代码捋到 `next()` 函数里面

  koa 采用了洋葱模型（类似递归，下一级执行完之后还会走一遍回头路）=> 其实是用 `await` 套娃了

### Hello World

```js
const Koa = require('koa');
const app = new Koa();     // 不同于 express()，这里必须实例华
// 先执行
app.use(async (ctx, next) => {   // ctx: context（合并了 req & res）
  console.log('111');
  const token = await next();                 // 还会回来的
  consloe.log('333');
  ctx.response.body = '<h1>Hello World</h1>'; // 我觉得它变长了 ...
  // 也存在 ctx.req / ctx.res => 是 Node 的原生对象，操作比较麻烦
});
// 后执行：这边是按 Use 顺序进行回调
app.use(async (ctx, next) => {
  await Delay(1000);
  console.log('222');
  return 'token';
})

app.listen(8080);
```

### 路由

因为 koa 把路由模块叉出去了，所以得单独安装一下

```bash
npm install koa-router
```

```js
var Router = require('koa-router');
var userRouter = new Router();

userRouter.get('/', (ctx, next) => {
  return ['111', '222', '333'];
}) // RESTful 风格（但单独 router.del('/user', (ctx, nxt)=>{}) 也可以）
.del('/:id', (ctx, next) => {
  return ctx.params.id;
});



// 合并路由模块：注册路由级中间件
var router = new Router();
router.redirect('/', '/home');// 重定向到 home 页面
router.prefix('/api');        // 加统一前缀，所以现在是 /api/user/xxx
router.use('/user', userRouter.routes(), userRouter.allowedMethods());

// 注册应用级中间件
app.use(router.routes());
// 合法路径 /user + 非法方法 POST 报 405（而不是 404）
app.use(router.allowedMethods());
```

### 静态资源

我们又要装模块了

```bash
npm install koa-static
```

```js
const path = require('path');
const statoc = require('koa-static');

// 注册应用级中间件
app.use(static(path.join(__dirname, 'public'))); // 静态资源丢在 ./public 下
```

### 获取请求参数

- GET 参数

  ```js
  ctx.query == ctx.request.query = {a:1, b:2};
  ctx.querystring == ctx.request.querystring = 'a=1&b=2';
  ```

- POST 参数：又要加组件了

  ```js
  const bodyParser = reuiqre('koa-bodyparser');
  app.use(bodyParser);
  // 兼容 formEncoded 和 JSON 格式
  // formData 会被解析至 ctx.request.body 
  ```

### 服务端渲染

这下得同时安装两个模块

```bash
npm install ejs koa-views
```

```js
const views = require('koa-views');

// 加载模版引擎
app.use(views(
  path.join(__dirname, 'views'), {extension: 'ejs'}
))

// 渲染并返回 EJS 模版（记得异步）
app.use(async (ctx) => {
  let title = 'Hello';
  await ctx.render('index', { title });
})
```

### 登录鉴权

- Cookie + Session

  ```js
  // Cookie 可以直接在上下文中读写，options 均可省略
  ctx.cookies.get(ckName, [options]);
  ctx.cookies.set(ckName, ckVal, [options]);
  
  // Session 需要再添加中间件
  const session = require('koa-session-minimal');
  app.use(session({
    key: 'session_ID',
    cookue: { maxAge: 100*60*60 }
  }))
  
  // 只要往 session 上挂载属性就会自动往前端发 Cookie
  ctx.session.user = {
    username: 'xxx'  // Cookie Name = 之前配置的 session_id
  }
  
  // sessin 拦截判断
  app.use(async (ctx, nxt) => {
    // 排除 login 接口
    if (ctx.url.includes('login')) {
      await next();
      return; // 因为还会回来
    }
    if (ctx.session.user) {
      // 重设 session
      ctx.session.myDate = Date.now();
      await next();
    } else {
      ctx.redirect('/login');
    }
  })
  ```

- JWT

  ```js
  // JWT 的封装和 express 框架中一致，只要重写一下拦截器
  app.use(async (ctx, nxt) => {
    if (ctx.url.includes('login')) {
      await next();
      return;
    }
    const token = ctx.headers['authorization']?.splits(' ')[1];
    if (token) {
      const payload = JWT.verify(token, secret);
      if (payload) {
        const neoToken = JWT.generate({
          _id: payload._id
        }, '1h');
        ctx.set('Authorization', neoToken);
        await next();
      } else {
        ctx.status = 401;
        ctx.body   = { errInfo: 'Invalid Token' };
      }
    } else {
      await next();
    }
  })
  ```

### 文件上传

 因为 multer 本体是跟着 express 跑的，所以这里又要下两个模块了（坏也）

```bash
npm install multer @koa/multer
```

```js
const multer = reuqire('@koa/multer');
const upload = multer();
// 剩下的和前面是一样的用口牙，拿参数用 ctx.file / ctx.files
```