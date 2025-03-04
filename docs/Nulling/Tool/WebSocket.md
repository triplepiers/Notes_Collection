# WebSocket

## 0 Intro

`WebSocket` 是一种基于 TCP 的 **应用层** 网络协议、提供了 **全双工** 通道（HTTP 是 **半双工**），其 Feature 如下：

- 良好兼容 HTTP 协议（默认端口也是 80 / 443），握手时采用 HTTP、不容易被屏蔽
- 数据格式轻量（ `header` 比较短）、性能开销小，支持发送 文本 / **二进制** 数据
- 没有 Same-Origin 限制，支持 Client 与任意服务器进行通信

### 0.1 我们为什么需要 WebSocket？

在 HTTP 中，通信 **只能由 Client 主动发起**、服务端不具备主动推送能力。

在 WebSocket 出现以前，Client 与服务端间的双通道通信只能通过不断轮询实现。这会导致：

- 服务端被迫维持来自多个不同客户端的大量连接
- 大量的轮询请求会导致极大的开销（多余的 `header` 会造成无用的数据传输）

### 0.2 WebSocket 的优缺点（相较于 HTTP）

优点：

- 更高的 **实时** 性能：WebSocket 允许进行 **实时** 双向通信
- 更少的网络开销：WebSocket 在同一个连接中实现双向通信（HTTP “请求-响应” 需要传输额外数据）
- 更灵活的通信方式：WebSocket 允许通过 Push / 事件推送 等多种方式进行通信（HTTP 中的请求与响应通常一一对应）

缺点：

- 不支持无连接：WebSocket 本身是一种持久化协议，可能会导致一些资源泄漏
- 支持较差：是 HTML 5 中的标准协议、一些古老浏览器并不支持（点名 IE）
- 数据流不兼容：WebSocket 的数据流格式与 HTTP 存在一定差异，在不同的网络环境下可能存在不同表现

## 1 工作流程：连接建立与关闭

> 就是很 TCP 啦，但是刚开始还是要借助一下 HTTP 的

### 1.1 握手阶段

1. `C->S` ：客户端向服务端发送建立 WebSocket 连接的请求（包含 `Sec-WebSocket-Key`），生成（本地）随机密钥。

   ```text
   # 一个常见的 ws 握手报文长下面这样
   GET /chat HTTP/1.1
   Host: server.com
   
   # 告诉 Server 我要升级成 ws 协议了
   Upgrade: websocket
   Connection: Upgrade
   
   Sec-WebSocket-Key: xxxxxx                 # 随机 base64 值
   Sec-WebSocket-Protocol: chat, superchat   # 用户定义，指定服务类型
   Sec-WebSocket-Version: 13                 # 现在基本固定用 13 了
   
   Origin: http://xxx
   ```

2. `S->C`：服务端基于 `Sec-WebSocket-Key` 生成（本地）随机密钥，并在此基础上生成 `Sec-WebSocket-Accept` 发给客户端

   ```text
   # 这是常见的服务器响应报文
   HTTP/1.1 101 Switching Protocols
   
   # 声明已经成功切换协议
   Upgrade: websocket
   Connection: Upgrade
   
   Sec-WebSocket-Accpet: xxxxxx
   Sec-WebSocket-Protocol: chat  # 最终使用的协议
   ```

3. `C->S`：客户端基于（本地）随机密钥和接收的 `Sec-WebSocket-Accept` ，生成一个新的 `Sec-WebSocket-Accept(neo)` 并发送给服务端用于数据传输 

### 1.2 数据传输阶段

在 WebSocket 中，每条消息可能会被拆分成多个 frame（最小单位）：发送端会把消息切成多个帧丢过去、接受端会自行进行拼装。

其中 `C->S` 的操作叫 ping，`S->C` 的操作叫 pong。

### 1.3 关闭阶段

1. `C->S`：客户端发送关闭请求（包含一个 ws 随机密钥）
2. `S->C`：服务端返回关闭响应（包含服务端生成的随机密钥）
3. `C->S`：客户端收到关闭响应、关闭 ws 连接

## 2 数据帧与控制帧

### 2.1 数据帧

```text
      0                   1                   2                   3
      0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
     +-+-+-+-+-------+-+-------------+-------------------------------+
     |F|R|R|R| opcode|M| Payload len |    Extended payload length    |
     |I|S|S|S|  (4)  |A|     (7)     |             (16/64)           |
     |N|V|V|V|       |S|             |   (if payload len==126/127)   |
     | |1|2|3|       |K|             |                               |
     +-+-+-+-+-------+-+-------------+ - - - - - - - - - - - - - - - +
     |     Extended payload length continued, if payload len == 127  |
     + - - - - - - - - - - - - - - - +-------------------------------+
     |                               |Masking-key, if MASK set to 1  |
     +-------------------------------+-------------------------------+
     | Masking-key (continued)       |          Payload Data         |
     +-------------------------------- - - - - - - - - - - - - - - - +
     :                     Payload Data continued ...                :
     + - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +
     |                     Payload Data continued ...                |
     +---------------------------------------------------------------+
```

其中  `header` 部分：

- `FIN` 表明当前的 frame 是否为最后一个片段

- `RSV1~3` 为保留字段：必须设置为 0（除非自行扩展），当收到未扩展的非0值时、接收端将断开链接

- `Opcode`：定义有效负载的类型，下面是一些约定值

  `%x0` - 持续帧，`%x1` - 文本帧，`%x2` - 二进制帧，`%x8` - 连接关闭包，`%x9` - ping包，`%xA` - pong包

- `Mask`：有效负载是否添加掩码，设为 `1` 时需要使用 Masking-key

### 2.2 控制帧

- Ping 帧 / Pong 帧：用于测试 客户端-服务端之间的连接状态，在收到客户发送的 Ping 帧后、服务端需要立即用 Pong 帧进行响应
- Close 帧：用于关闭连接

## 3 对 JS 使用 WebSocket 罢

在 JS 中，一个 WebSocket 对象通常代表了一个新的 ws 连接。

在被突发事件痛击时，ws 对象会产生四种回调：`onopen`，`onmessage`，`onerror`，`onclose`。

当然，你也可以调用简单的方法发送数据（`.send()`）或关闭连接（`.close()`）。

### 3.1 建立连接，组一辈子 ws 吧

```js
// 创建一个新的 ws 对象
var socket = new WebSocket('url'); // url: 需要连接的服务器

// 检查是否连接成功
socket.onopen = function() { console.log('ws connected'); }
```

### 3.2 来互相收发消息吧

```js
// 接收来自 ws 的信息
socket.onmessage = function(event) {
  console.log('recv msg: ', event.data);
}

// 向 ws 输送垃圾
socket.send('hello, world!');
```

### 3.3 我是来结束这一切的

```js
// 为 ws 献上剪切线
socket.close();   // 会触发 socket.onclose，但不重要
```

### 3.4 错误处理

> 当然可以不处理

- `WebSocket is not supported` ：浏览器不支持 ws（建议用户换一个）
- 在 `onclose` 中处理：`WebSocket connection closed` / `WebSocket closed by ...`
- 在 `ontimeout` 中处理：`WebSocket timeout`，总之是连接超时
- 在 `onerror` 中处理：`WebSocket error`，总之报错（当没看见吧）

## 4 基于 NodeJS 的网络聊天室

> 没有写断线重连

因为有人写好轮子了，所以用 npm 装一下就好力

```bash
npm install ws
```

### 4.1 服务器实现

这边还是基于 express 写了

```js
const WebSocket = require('ws');
const WebSocketServer = WebSocket. WebSocketServer;
const wss = new WebSocketServer({ port: 8080 }); // 和客户端对应

const WebSocketType = {
  Error: 0,
  GroupList: 1, // 获取列表
  GroupChat: 2,
  SingleChat: 3
}

// 返回 JSON 字符串
function createMsg(type, usr, data) {
  return JSON.stringify({
    type, usr, data
  })
}

// 向其他客户端广播
function broadcast(me, data, isBinary) {
  wss.clients.forEach(function each(client) {
    if (
      client !== me &&
      client.readyState === WebSocket.OPEN // 还保持着连接
    ) { 
      client.send(createMsg(
      	WebSocketType.GroupChat,
        ws.user.username,
        data
      )), {binary: isBinary});
    }
  })
}

// 每当有客户端连接，ws 是来自不同客户端的连接
wss.on('connection', function connection(ws, req) {
  // 验证客户端 token
  const myURL = new URL(req.url, 'host:3000'); // 还是 HTTP 的端口
  const token = myURL.searchParams.get('token');
  const payload = JWT.verify(payload, secret);
  if (payload) {
    // 储存用户特定信息
    ws.user = payload;
    // 向客户端发送信息
    ws.send(createMsg(
      WebSocketType.GroupChat,
      null,
      'Welcome'
    ));
    // 告诉所有客户端有几个活人
    broadcast(
      null,
      Array.from(wss.clients).map(item => item.user.username),
      false
    );
  } else {createMsg(
      WebSocketType.Error,
      null,
      'Invalid Token'
    ));
  }
 	// 监听特定客户端发送的消息
  ws.on('message', function message(data, isBinary) {
    const msgObj = JSON.parse(data);
    swtich(msgObj.type) {
      case WebSocketType.Error:
        localStorage.removeItem('token');
        location.url = '/login';
        break;
      case WebSocketType.GroupList:
      	ws.send(createMsg(
          WebSocketTypeGroupList,
          null,
          Array.from(wss.clients).map(item => item.user.username)
        ));
        break;
      case WebSocketType.GroupChat:
      	broadcast(ws, data, isBinary);
      	break;
      case WebSocketType.SingleChat:
        wss.clinets.forEach(function each(client) {
          if (
            client.user.username == msgObj.to &&
            client.readyState === WebSocket.OPEN
          ) {
            client.send(createMsg(
              WebSocketType.SingleChat,
              ws.user.username,
              msgObj.data
            ))
          }
        })
        break;
    }
  });
  // 监听用户断连
  ws.on('close', () => {
    console.log('[offline] %s', ws.user.username);
    wss.clients.delete(ws.user);
    // 告诉所有客户端有用户下线
    broadcast(
      null,
      Array.from(wss.clients).map(item => item.user.username),
      false
    );
  })
});
```

### 4.2 客户端实现

这一段写在 HTML 的 `<script>` 标签里，因为后面走的都是 WS 协议、所以不会被后端的 HTTPServer 中的 token 拦截器抓住。

```js
const WebSocketType = {
  Error: 0,
  GroupList: 1,
  GroupChat: 2,
  SingleChat: 3
}

// 复制一下：句柄里已经有 user 信息了
function createMsg(type, data, to) {}

// 其实 ws 连接也能带参数的
var ws = new WebSocket(
  `ws://localhost:8080?token=${localStorage.getItem('token')}`
);

ws.onopen = () => {
  console.log('connected');
}

ws.onmesage = (msgObj) => {
  msgObj = JSON.parse(magObj);
  swtich(msgObj.type) {
    case WebSocketType.Error:
    	localStorage.removeItem('token');
    	location.url = '/login';
    	break;
    case WebSocketType.GroupList:
   	 	console.msg(msgObj.data);
    	// 可能需要重新 JSON.parse(msgObj.data)
    	break;
    case WebSocketType.GroupChat:
    case WebSocketType.SingleChat:
    	console.msg('[%s] %s', msgObj.user?msgObj.user:'广播', msgObj.data);
    	break;
  }
}

ws.onerror = () => {
  console.log('寄！');
}

btn.onclick = () => {
  if (select.value === 'all') { // 群发
    ws.send(createMsg({
      WebSocketType.GroupChat,
      text.value,
      null
    }))
  } else {
    ws.send(createMsg({
      WebSocketType.SingleChat,
      text.value,
      select.value
    }))
  }
}
```

## 5 SocketIO 模块：自定义事件

SocketIO 会判断当前浏览器是否支持 WS 协议（不支持的话会自动走轮询），而且服务器跪掉之后 client 会自动尝试重连

### 5.1 服务器

```js
// 省略枚举类型 WebSocketType
const app = require('express')();
const server = require('http').createServer(app); // 共用 HTTP 服务
start(server);
      
function start(server) {
  const io = require('socket.io')(server);
  io.on('connection', (socket) => {
    const token = socket.handshake.query.token; 
    // 省略一些 JWT 校验
    if (payload) {
      socket.user = payload;
      // welcome！
      socket.emit(WebSocketType.GroupChat, {
      	user: null,
        data: 'Welcome'
      });
      // 获取列表
      socket.on(WebSocketType.GroupList, () => {
         socket.emit(WebSocketType.GroupChat, {
            user: null,
            data: Array.from(io.sockets.sockets)
           				.map(item=>item[1].user.username)
           				.filter(item=>item) // 过滤 undefined
         });
      })
      // 群发
      socket.on(WebSocketType.GroupChat, (msg) => {
        // 这种是包括自己的
        io.sockets.emit(WebSocketType.GroupChat, {
          user: socket.user.username,
          data: msg.data
        })
        // 这种是不包括自己的
        socket.broadcast.emit(WebSocketType.GroupChat, {
          user: socket.user.username,
          data: msg.data
        })
      })
      // 结束
      socket.on('disconnect', () => {
        // 会自动 delete，只要重发用户列表就行
        // 以及单发的时候不用校验对面用户状态 == OPEN
      })
    } else {
     
    }
  })
}
```

### 5.2 客户端

```js
// 省略枚举类型 WebSocketType

// 需要引入 socketio 的 JS 代码（自己去 GitHub 拿）
<script src='/js/socket.io.js.min'></script>
// 连接服务器
const socket = io(`ws://localhost:8080?token=${localStorage.getItem('token')}`);

// 监听群发
socket.on(WebSocketType.GroupChat, (msgObj) => {
  console.log('[%s] %s', msgObj.user?msgObj.user:'群发', msgObj.data);
})
// 发消息也用 socket.emit([eventName], msgObj) 就行
```

## 6 断线重连

### 6.1 离线判断

- 首次连接：客户端会在第一次发送请求的时候带上 UUID + timestamp，服务端应该去 DB/缓存 里查找 UUID（不存在就存一下）
- 后续连接：客户端还是会带上 UUID + 本次 timestamp'，服务端计算两次时间戳之差是否大于给定值

### 6.2 HeartBeat

WS 在超时没有消息时会自动断开链接，一般有两种解决方案：客户端主动发送上行心跳包 / 服务端主要发送下行心跳包

心跳包一般在按照固定时间间隔发送，用来告诉服务端客户还活着。因为只用于保活，所以一般是很小的包（比如只有包头的空包）。

- 客户端解决方案：

  1. 客户端每隔固定 interval 就给服务端发一个探测包、同时启动 timeout 计时器

  2. 服务端收到探测包后，立即回应一个包

  3. 客户端在 timeout 内收到应答包：服务器正常、删除 timeout 计时器

     客户端在 timeout 内未能收到：服务器挂掉了

- 服务端宕机方案：

  1. 客户端通过 `onclose` 关闭连接

  2. 服务端重新上线时 **清除缓存数据**

     > ⚠️ 服务端处理方式存疑