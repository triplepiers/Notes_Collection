- 基本应用场景 - “三高”
	- High Performance
	- High Storage
	- High Scalability & Availability
- 具体场景：社交 / 游戏 / 物流 / 物联网 / 视频
- 应用特征：数据量大，读写操作频繁，数据价值低，事务要求低

## 简介
- Mongo DB 是一个**无模式**的**文档型** · 非关系型数据库
- 使用 `BSON` 格式（ 类 `JSON` ）进行存储，支持比较复杂的数据类型
- Mongo DB 中的记录（对标 row）是一个由键值对构成的「文档」，一个文档被认为是一个 Object。
	- `key` ：字符型
	- `value` ：基本数据类型 / 数组 / 文档 / 文档数组
- 不支持 Join 操作 => 通过嵌入式文档代替多表连接

## 1 启动

### Windows
1. 下载 [Mongo DB](https:/www.mongodb.com/try/download/community) - MSI 版本需要安装，ZIP 版本解压即可使用
2. （ZIP）解压文件到指定目录，在 bin 同级目录下创建 `data/db` 用于存放数据

#### 启动服务
- 命令行方式 `mongod --dbpath=..\data\db`
  
	指定的 path 可以是绝对路径 / 相对于当前工作路径的相对路径（相对路径好像会寄）
	
	默认端口为 27017，可以通过 `--port` 参数重新指定端口
	
- 配置文件方式 ([官方文档](https://docs.mongodb.com/manual/reference/configuration-options))
  
	在 bin 同级目录下新建 `/config/mongog.conf` 参考内容如下：
	```yaml
	storage:
		# the directory where mongodb instance store data.Default Value 
		dbPath: path\to\mongodb\data\db
	```
	随后通过 `mongod -f ../config/mongod.conf` / `mongod --config` 启动

#### 连接服务
> 需要另开一个窗口操作（启动服务的窗口需要一直挂着）
> 
> 在 Mongo DB6 后不再安装 mongo 命令，需要自行安装 mongoshell

- Shell 连接
	`mongo` / `mongo --host=127.0.0.1 --port=27017`
	- 查看已有数据库 `show databases`
	- 退出 `exit`
	- 更多参数可通过 `mongo --help` 查看
- Compass 图形化界面
	- 首先要 [安装 Compass](https://www.mongodb.com/try/download/compass)
	- 在 GUI 中输入 Hostname，Port 即可建立连接（使用默认的也行）
	    新版 Compass 貌似使用 URL 连接的，用默认的就行
	    连接成功会看到 admin，config，local 三个 database

### Linux
1. 下载 Monogo DB 的 Linux 版本（tgz版本）
2. 使用命令进行解压 `tar -xvf xxxxxx.tgz`
3. 使用命令移到指定目录中 `mv xxxxx /usr/local/mongodb`
     阿巴这里我直接丢到`/app` 下面去了
4. 新建目录用于存储数据和日志（根路径下）
     ```bash
     # 数据存储目录
     mkdir -p /data/db
     # 日志存储目录
     mkdir -p /data/logs
     # 创建日志文件
	 touch /data/logs/mongodb.log
	```
	
	> 因为最新版本又没有命令行了，所以要单独安装（见[参考文献](https://blog.csdn.net/wDeveloper/article/details/127358440))
	> 
	> 1. 下载压缩包 `wget https://downloads.mongodb.com/compass/mongosh-1.6.0-linux-x64.tgz`
	> 2. 解压到当前路径 `tar -zxvf mongosh-1.6.0-linux-x64.tgz`
	> 3. 进入解压目录 `cd mongosh-1.6.0-linux-x64/bin`
	> 4. 移动 bin 下的两个文件（我丢到 `mongodb/bin` 下面了）
	>    
	>     `sudo cp mongosh /app/bin/` `sudo cp mongosh_crypt_v1.so /app/bin`

5. 在 `/app/bin` 下使用 `/mongosh`，启用连接
       可以使用 `show dbs` 打印所有 db 进行测试，默认存在以下三个数据库
       - `admin`
           相当于 `root` 数据库，存放用户及权限。
           将用户添加至该数据库后，将继承对所有数据库的权限。
           一些特定的服务端命令只能通过该数据库运行（如：show dbs / 关闭服务器）。
       - `local`
           永远不会被集群中的其他服务器复制，用于存储仅限于本地单台服务器使用的集合
       - `config`
           设置分片时，用于保存分片的相关信息

## 2 基本常用指令

### 数据库
- 创建并选择数据库 `use db_name`
    若数据库不存在则自动创建（然后选择）
    -  新创建的数据库仅存在于内存中（无法通过 `show dbs` 查看）
        插入数据后将被持久化到磁盘中
    - 数据库命名规则
	    - 不能是空字符串
	    - 不能包含：空格 `. $ / \ \0` （`\0` 是空字符）
	    - 全小写
	    - 最长 64 Byte
- 查看（有权限查看的）所有数据库
    `show dbs / show databases`
- 查看正在使用的数据库 `db`
    默认使用 `test` 数据库 -> 创建的 table（集合）将默认存放在 `test` 数据库中
- 删除数据库 `db.dropDatabase()`
    用于删除 已经被持久化 的数据库

### 集合（表）
- 查看当前 db 下的所有集合 `show collections / show tables`
    
- 创建集合
	- 显式创建（不管有没有数据，先把表搞出来） `db.createCollection("colection_name")`
	    
	- 隐式创建（直接插入数据，不存在就建一个表）
	- 集合命名规则
		- 不能是空串
		- 不能包含 `\0` -> 用于表示集合名的结束
		- 不能以 `system.` 开头（系统保留前缀）
		
- 删除集合 `db.collection.drop() / db.collection_name.drop()`
  
     返回值为 bool 类型：成功返回 `true`，反之返回 `false`

### 文档的 CRUD 操作
> 文档采用 BSON 格式进行存储

#### 插入
1. 插入单个文档
   
      使用 `insert() / save()`

	```js
	db.collection_name.insert( // collection_name 即为待插入的表名（包含隐式创建）
		 <document / array of documents>, // 需要插入的文档/文档数组（JSON格式）
		 {
			 writeConcern: <document>, // 性能及可靠性级别
			 ordered: <boolean> // 默认为 true
			 // true：顺序插入文档，出错后不处理剩余部分
			 // false：无序插入，出错后继续处理剩余文档
		 }
	 )
	```
	下面是一个例子：
	```js
	db.comment.insert( // 向 comment 表中插入数据
		{
			"articleid": "10001",
			"content": "Ok, fine.",
			"userid": "27017",
			"nickname": "Jack",
			"createtime": new Date(),
			"likenum": NumberInt(10),
			"state": null
		}
	)
	// 返回 writeResult({"nInserted": 1}) 即插入成功
	```

	- Mongo DB 中的数字默认为 double 类型，若想存放整型，必须使用函数 `NumberInt(数字)`
	- 使用 `nwe Date()` 插入当前日期
	- 若没有为插入的数据指定 `_id`，则会自动生成主键
	- 若字段值为空，可以赋值为 null，或直接不写 

2. 批量插入
   
    ```js
     db.collection_name.insertMany(
	     [<document1>, <document2>, ...], // 待插入的记录
	     {
		     writeConcern: <document>,
		     ordered: <boolean>
	     }
     )
	```
	
	  下面是一个例子：
	```js
	db.comment.insertMany(
		[{
			"_id": "1",
			"articleid": "1001",
			"content": "the 1st sentence",
			"userid": "231",
			"nickname": "Tom",
			"createtiem": new Date("2019-08-05T22:15.522Z"),
			"likenum": NumberInt(1000),
			"state": "1"
		},{
			"_id": "2",
			"articleid": "1002",
			"content": "the 2nd sentence",
			"userid": "235",
			"nickname": "Jack",
			"createtiem": new Date("2019-08-18T22:15.522Z"),
			"likenum": NumberInt(637),
			"state": "1"
		}]
	)
	```

	- 若插入时显式制定了 `_id` 字段的值（ObjectID 或 其他任意支持类型），则以该值作为主键
	  
	    若没有显示指定，则 Mongo DB 会自动创建 ObjectID 类型的 `_id` 字段作为主键
	    
	- 若中间某条数据插入失败，则整个插入操作终止（已经成功的部分不会回滚）
	- 由于**批量插入**时比较容易产生错误，故可以用 `try-catch` 进行捕获处理
	    ```js
	    try {
		    db.collection_name.insertMany(
			    {record1}, {record2}, ...
		    )
	    } catch (err) {
		    print(err) // and do sth
	    }
		```

#### 查询

基本语法格式：`db.collection_name.find(<query>,[projection])`

|  Parameter   |   Type   | Description                                |
|:------------:|:--------:|:------------------------------------------ |
|   `query`    | document | 可选，select all 时忽略/传入空参数`{}`     |
| `projection` | documrnt | 可选，指定返回的字段（返回所有字段时省略） |

下面是一些例子：

- 查询指定表中的所有数据
    `db.collection_name.find()` / `db.collection_name.find({})`
- 查询 ID 为指定值的记录（参数为 JSON 格式）
    `db.collection_name.find({ key: 'value' })`
- 只返回查询的第一条结果（需要用到 `findOne`）命令
    `db.collection_name.findOne( { key: 'value' })`
- 仅返回查询结果的部分字段内容（需要用到 「Projection Query 投影」）
	- 我们查找 userid = 1003 的结果，且仅返回 userid & nickname 字段
	    ```js
	    db.collection_name.find(
		    { userid: "1003"},
		    {
			    userid: 1,
			    nickname: 1
		    }
	    )
		```
	     上述查询默认会返回 `_id` 字段，若不想要改数据，可以在第二个参数中进行显式声明
	    ```js
	    db.collection_name.find(
		    { userid: "1003"},
		    {
			    userid: 1,
			    nickname: 1,
			    _id: 0
		    }
	    )
		```

#### 更新

```js
db.collection_name.update(query, update, options);
db.collection_name.update(
	<query>,
	<update>,
	{
		upsert: <boolean>,
		multi: <boolean>,
		weiteConcern: <document>,
		collaction: <document>,
		arrayFilters: [<filter1>,...],
		hint: <document / string>
	}
)
```


> 主要关注前四个参数

|   Parameter    |      Type       | Description                                                                |
|:--------------:|:---------------:| -------------------------------------------------------------------------- |
|    `query`     |    document     | 选择条件（可使用与 find 相同的查询选择器）                                 |
|    `update`    |    document     | 应用的修改，可以是更新运算符表达式 / 仅包含 key-val 的替换文档             |
|    `upsert`    |     boolean     | 可选，为 true 时在无匹配结果时插入对应的新记录                             |
|    `multi`     |     boolean     | 可选，为 true 时更新所有符合要求的记录；默认为 false，仅更新一条匹配的记录 |
| `writeConcern` |    document     | 可选，标识抛出异常的级别                                                   |
|  `collation`   |    document     | 可选，指定用于操作的校对规则                                               |
|     `hint`     | document/string | 可选，指定用于支持查询索引的文档或字符串                                   |

- 覆盖式的修改（使用一个新的记录对象取代旧的记录对象）
  
    `db.collection_name.update({ _id:"1"}, {likenum:NumberInt(1001)})`
    
    更改完成后，除了 `likenum` 外的所有字段都会消失
    
- 局部修改（析构后覆盖部分数据）-> 此处需要使用 `$set` 方法
  
    `db.collection_name.update({_id:"1"},{$set:({likenum:NumberInt(1001)}))`
    
    此时仅对 `likenum` 的内容进行修改，其他键值对保持不变
    
- 批量修改
  
    此处尝试把「所有」`userid="1003"` 的用户的 `nickname` 更新为 `Fynn`
    
    默认情况下只修改第一条匹配的记录，为此我们需要设置第三个参数 `multi:true`
    ```js
    // 通过设置 multi:true 来修改「所有」符合条件的数据
    db.collection_name.update(
	    { userid: "1003" },       // 条件
	    {$set(nickname: "Fynn")}, // 局部更新内容
		{ multi: true }           // 更新「所有」符合条件的数据
    )
	```
	
- 键值增长（ based on old_value ）
    需要使用 `$inc` 运算符
    ```js
    // 每次使得 _id = 3 的记录 likenum++
    db.collection_name.update(
	    { _id: "3" },                // 条件
	    {$inc(likenum:NumberInt(1))} // 递增 1
    )
	```

#### 删除

基本语法格式：`db.collection_name.remove(条件)`

- 删除表中的「所有记录」- 不删除表本身
    `db.collection_name.remove({})`
- 删除表中 `_id="1"` 的记录
    `db.collection_name.remove({_id:"1"})`

### 分页查询

#### 统计查询
基本语法：`db.collection_name.count(query, option)`

- 统计 comment 表中的记录总数
    `db.comment.count()`
- 统计 comment 表中 `userid = "1003"` 的记录条数
    `db.comment.count({ userid: "1003" })`

#### 分页列表查询

基本语法：`db.collection_name.find().limit(n_limit).skip(n_skip)`

- 我们可以使用 `init(N_LIMIT)` 方法取出 TOP(N_LIMIT) 条记录，默认为 TOP20
  
     `db.collection.name.find().limit(3)`
   
- 我们可以使用 `skip(N_SKIP)` 方法跳过指定数量的记录，默认为 0
  
    `db.collection_name.skip(3)`

下面使用这两个函数来实现「分页查询」
> - 假设每页包含 2 条数据
> - 从 P2 开始，每一页需要跳过 `(n-1)*2` 条记录

```js
// 其实可以先用 count 计算最大页数
max_page = floor(db.comment.count() / 2)
// P1
db.comment.find().skip(0).limit(2)
// P2
db.comment.find().skip(2).limit(2)
// P3
db.comment.find().skip(4).limit(2)
```

#### 排序查询

我们使用 `sort()` 来指定需要排序的字段，传入 `1/-1` 分别表示升降序排列：

```js
db.colletion_name.find().sort({ key_name: 1 })
// 设置可以设置基于多列进行排序（第一个key为首要关键字）
db.collection_name.find().sort({
	userid: -1,
	likenum: 1
}
)
```

> 在 `limit, skip, sort` 同时存在时：
> 
> 首先执行 `sort` ，随后执行 `skip`，最后执行 `limit` -> 与命令书写顺序无关

### 复杂查询

#### 正则条件查询

- Mongo DB 的模糊查询是通过正则表达式实现的

- 基本格式：`db.collection_name.find({ key: /正则表达式/ })`

- 下面是一些例子：

	- 查询所有内容 包含“开水” 的文档
	    `db.comment.find({ content:/开水/ })`
	- 查询内容 以“专家”开头 的文档
	    `db.comment.find({ content: /^专家/ })`

#### 比较查询
```js
db.collection.find({"key": { $gt : value}}) // 大于
db.collection.find({"key": { $lt : value}}) // 小于
db.collection.find({"key": { $gte : value}}) // 大于等于
db.collection.find({"key": { $lte : value}}) // 小于等于
db.collection.find({"key": { $ne : value}})  // 不等于
```

我们可以通过以下语句查询评论数大于700的记录：
`db.comment.find({ likenumL { $gt: NumberInt(700) }})`

#### 包含查询

- 查询 userid 字段中**包含** 1003/1004 的文档 `$in`
  
    `db.comment.find({ userid : { $in: ["1003", "1004"]}})`
    
- 查询 userid 字段中**不包含** 1003/1004 的文档 `$nin`
  
     `db.comment.find({ userid : { $nin: ["1003", "1004"]}})`

#### 条件连接查询

- 与
  
	需要记录同时甚至满足多个（>=2）个条件时，使用 `$and: [{},{},{}]`
	
	我们通过以下语句查询 700 <= likenum < 2000 的评论
	```js
	db.comment.find($and:[
		{
			likenum: {$gte: NumberInt(700)}
		},{
			likenum: {$lt: NumberInt(2000)}
		}
	])
	```
	
- 或
  
	需要记录同时甚至满足多个（>=2）条件时，使用 `$or: [{},{},{}]`
	
	我们通过以下语句查询 userid = "1003" 或 likenum<1000 的评论
	```js
	db.comment.find($or:[
		{
			userid: "1003"
		},{
			likenum: {$lt: 1000}
		}
	])
	```

## 3 索引

> [官网相关文档](https://docs.mongodb.com/manual/indexes)
> 
> - 在缺少索引的情况下，Mongo DB 的每一次查询都会进行「全表扫描」
> - Mongo DB 使用 B- Tree 作为做索引（MYSQL 使用 B+ Tree）

### 索引类型

- 单字段索引 Single Field Index
	- Mongo DB 支持用户在文档的单个字段上定义 升序/降序 索引
	- 其实升降序本身并不重要 -> Mongo DB 本身可以从任何方向遍历索引
- 符合索引 Compound Index
	- 支持在多个字段上定义索引
	- 在符合索引中 **字段顺序有意义**
	  
	    对于 `{userid: 1, score: -1}` ，首先按照 `userid` 升序排序；该字段相同时再按照 `score` 降序排序
	    
- 地理空间索引 Geospatial Index
  
    支持对地理空间坐标的有效索引，可以返回 平面/球面几何 的二位索引
    
- 文本索引 Text Index
  
    支持搜索字符串中包含的 词根（剔除了高频的停止词，并将词干抽象为词根）
    
- 哈希索引
  
    支持基于散列的分片，对字段的 hash value 进行索引
    
    只支持等值查询，不支持范围查询

### 索引管理

- 查看某个表上的所有索引 `db.collection_name.getIndexes()`

#### 创建索引 

基础语法：`db.collection_name.createIndex(keys, options)`

下面是可选 option 参数的信息：

|     Parameter      |     Type      | Description                                                              |
|:------------------:|:-------------:| ------------------------------------------------------------------------ |
|     background     |    boolean    | 可选，建立索引默认会 block 其余的操作，设置为 true 可以更改为后台操作    |
|       unique       |    boolean    | 可选，建立的索引是否唯一                                                 |
|        name        |    string     | 索引名称，未指定时 Mongo DB 会基于字段名与排序方式生成一个名称           |
|       sparse       |    boolean    | 对记录中不存在的字段不启用索引 -> 使用索引将无法查询不包含相应字段的记录 |
| expireAfterSeconds |    integer    | 单位为s，设置表的 TTL                                                    |
|         v          | index version | 索引的版本号，默认情况下使用 mongod 创建索引时的运行的版本               |
|      weights       |   document    | \[1,99999\]，表示相对于其他索引字段的权重                                |
|  default_language  |    string     | 指定文本索引使用的 stop word & 词干规则列表，默认为 EN                   |
| language_override  |    string     | 指定文本索引包含在表中的字段名，覆盖默认的 language ？                   |

> 在 3.0.0 以前的版本使用 `ensureIndex()` 创建索引
> 现在仍可以使用（只是作为 `createIndex()` 的别名）

- 尝试对 `userid` 字段建立单字段索引
    ```js
    db.comment.createIndex({userid: 1}) // 也可以传入-1建立降序索引
	```
- 尝试对 `userid` & `nickname` 字段建立复合索引
    ```js
    db.comment.createIndex({userid:1, nickname:-1})
	```

#### 移除索引

- 移除指定索引
	- 基本语法：`db.comment.dropIndex(index)`
	- 参数 `index` 可以为 string/document 类型，指定索引名称或索引规范文档
	- 删除文本索引必须指定索引名称
	- 下面是一个通过索引规范文档删除指定索引的案例：
	    `db.comment.dropIndex({userid:1})`
- 删除所有索引
	- 基本语法：`db.comment.dropIndexes()`
	- 其中 `_id` 字段上的索引无法被删除

### 索引使用

#### 执行计划
> 我们可以通过「支付计划」来查看建立的索引是否有效 / 效果如何

- 基本语法：`db.comment.find(query, options).explain(options)`

- 在返回结果中：COLLSCAN 表示“全表扫描”，FETCH 表示“使用索引”

#### 涵盖的查询 Covered Queries

- 当查询 **条件&索引 仅包含索引字段**时，Mongo DB 将直接从索引中返回结果（而不会尝试扫描/将任何文档读入内存）
- 相关文档见[此处](https://docs.mongodb.com/manual/core/query-optimization/#read-operations-covered-query)
