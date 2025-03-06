# Mocha 单元测试

- Macha 是 JS 的单元测试框架，可以自动运行所有已编写的测试并返回测试结果。

  - 支持对简单 JS 函数与异步函数的测试

  - 支持运行所有测试，或仅运行特定测试

  - 支持通过 `before/after`, `beforeEach/afterEach` 等钩子函数指定运行策略

- WHY Mocha？

  NodeJS 内置的断言方法 `assert.strictEqual(func(params), expectedRes)` 仅在预期与实际实行结果不符时才会报错，并且会直接抛出异常、影响后续测试执行。

- How to start?

  ```bash
  npm install mocha
  ```

  最好在 `package.json` 中添加一个指令

  ```json
  {
    'scripts': {
      ...,
      'test': 'mocha', # 你可以通过 npm run test 运行 /test 下的测试了
    }
  }
  ```

## 1 Sample

```js
// @ test/test1.js
var assert = require('assert');

// 定义一组测试，第一个参数会被 print 在控制台上
describe('GroupName1', () => {
  // 还可以嵌套哦
  describe('GroupName1-1', () => {
    // 定义单个测试
  	it('sum() 应该返回 0', () => {
      assert.strictEqual(sum(), 0)
    })
    it('sum(1) 应该返回 1', () => {
      assert.strictEqual(sum(1), 1)
    })
    it('sum(1,2,3) 应该返回 6', () => {
      assert.strictEqual(sum(1,2,3), 6)
    })
	})
})
```

## 2 Chai 断言库

>  实际上，Mocha 允许你使用任何偏好的断言库（只要这个东西能抛出错误）

Chai 断言库包含了 `expect`，`assert` 和 `should` 风格的断言，你需要通过 NPM 进行安装：

```bash
npm install chai
```

```js
var chai = require('chai');
var assert = chai.assert;  // 用的不是 Node 自带的了
chai.should();
var expect = chai.expect;

describe('Demo', () => {
  it('use assert', () => {
    var val = 'hello';
    assert.typeOf(val, 'string');
    assert.equal(val, 'hello');
    assert.lengthOf(val, 5);
  })
  // 有点磨叽了就是说
  it('use should', () => {
    var val = 'hello';
    val.should.exist
      .and.equal('hello')
    	.and.have.length(5)
    	.and.be.a('string');
    /* 其实也可以拆开写
    	val.should.be.a('string')
    	val.should.equal('hello')
    	val.should.not.euqal('hello1') */
  })
  it('use expect', () => {
    var val = 'hello';
    var num = 3;
    expect(num).to.be.at.most(5);
    expect(num).to.be.at.least(3);
    expect(num).to.be.within(1, 4);
    
    expect(val).to.exist;
    expect(val).to.be.a('string');
    expect(val).to.equal('hello');
    expect(val).to.not.equal('你好');
    expect(val).to.have.length(5);
  })
})
```

## 3 异步测试

- 直接按上面的逻辑写异步函数测试会有一点 bug

  先报 ✅（不等返回直接跑完了），过一会儿又报 ❌（数据拿回来了）

```js
// 用 done 回调（有点抽象）
describe('test Async', () => {
  it('read File', (done) => {
    fs.readFile('./1.txt', 'utf8', (err, data) => {
      if (err) {
        done(err)
      } else {
        assert.strictEqual(data, 'hello')
        done()
      }
    })
  })
})

// 其实也可以用 async-await 风格处理
describe('test Async', async () => {
  it('read File', (done) => {
    var data = await fs.readFile('./1.txt', 'utf8');
    assert.strictEqual(data, 'hello');
  })
})
```

所以，现在我们可以解决异步操作频发的网络请求测试了：

```js
var axios = require('axios');

describe('HTTP test', () => {
  it('返回 HTML 片段', async () => {
    var res = await axios.get('API');
    assert.strictEqual(res.data, '<h1>Hello</h1>')
  })
})
```

但上面这个方法得 **一直手动刮着后端服务**，有没有什么自启动的解决呢？（有的）

```js
const request = require('supertest'); // 记得装
const app     = require('../app');    // express 定义的服务器

describe('test Express app', () => {
  // 先启动一下后端服务
  let server = app.listen(8080);

  it('#GET', async () => {
  await request(server)
     		.get('/')
      	.expect('Content-Type', /text\/html/)
      	.expect(200, '<h1>Hello</h1>')
  });
  // AfterALL: 前面的串行执行完之后，执行 after()
  after(() => {
    server.close();
  });
})
```
