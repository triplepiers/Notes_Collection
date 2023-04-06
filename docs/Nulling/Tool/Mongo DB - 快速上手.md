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
- 查看当前 db 下的所有集合
    `show collections / show tables`
- 创建集合
	- 显式创建（不管有没有数据，先把表搞出来）
	    `db.createCollection("colection_name")`
	- 隐式创建（直接插入数据，不存在就建一个表）
	- 集合命名规则
		- 不能是空串
		- 不能包含 `\0` -> 用于表示集合名的结束
		- 不能以 `system.` 开头（系统保留前缀）
- 删除集合
    `db.collection.drop() / db.collection_name.drop()`
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
	```