## 1 副本集 Replica Sets

- “副本集”是一组维护「相同数据集」的 Mongo DB 服务，能够提 冗余 & 高可用性
- Mongo DB 中的副本集包含了 多个数据承载节点 + 一个仲裁节点（可选）
	- 数据承载节点中，只有一个作为“主节点”，其余均为“从节点”
	- 主节点「接收」所有 Write 操作（`oplog` 将作为日志记录所有对数据集的更改）
	- 从节点通过复制 `oplog` 以同步操作
- 与一般的「主从复制」不同的是，「副本集」中不存在固定的主节点（出意外时就重新选举）

### 1.1 副本集中的三种角色

- 两种类型
	- `Primary`：数据操作的主要节点，支持 Write & Read
	- `Secondaries`：数据冗余备份节点，支持 Read & 选举
- 三种角色
  
    副本成员 与 仲裁者 之间通过 `Heartbeat` 确定存活情况
  
	- `Primary` 主要成员
	  
	    就是主节点，接收所有 Read & Write 操作
	  
	- `Replicate` 副本成员（default）
	  
	    从主节点复制「操作」以备份数据，支持 Read（需要配置），不支持 Write
	    
	- `Arbiter` 仲裁者
	  
	    **不保存任何数据副本**，只有选举功能（但可以让副本成员兼任）

#### 数据备份工作原理

副本集中应存在 >= 2 个节点，其中一个为主节点，其余均为备份节点

- 主节点执行所有写操作，记录在 `oplog`
- 从节点定期轮询 `oplog` 并在自己的数据副本上执行

??? note "oplog"
	- `oplog` 只记录引起数据变化的操作（ Read 就不管了）
	- 存储前会做幂等变换，对于 context 进行解耦，重复按序执行结果一致
	  
	    比如 `$inc` 会被换成 `$set`（不收到 old_value 的影响）
	    
	- `oplog` 存储在 `local` 数据库的 `oplog.$main` 表格中，每个记录都代表一项操作。记录包含的字段如下：
	
		- `ts` 时间戳，用于跟踪操作执行时间
		- `op` 操作类型，只有 1 Byte
		- `ns` 操作执行的 table 名称
		- `o` 被执行的内容（如插入的具体内容）

??? note "数据同步"
	- 备份节点首次启动时会进行「完整数据同步」，之后通过同步 `oplog` 保证数据一致性。
	- 为了避免从节点一直赶不上，要保证给 `oplog` 的空间足够大（追上前不会被覆写）
 
### 1.2 创建副本集
> 此处实现：1 \* 主节点 + 1 \* 副本 + 1 \* 仲裁 的结构

#### 1.2.1 创建节点
> 因为在同一台机器上模拟集群，此处通过端口号区分不同节点

- 创建主节点
	
	1. 建立存放数据和日志的目录
	    ```bash
	    # 主节点 port: 27017
		mkdir -p /mongodb/replica_sets/myrs_27017/log
		mkdir -p /mongodb/replica_sets/myrs_27017/data/db
		```

	2. 新建配置文件
	    ```yaml
	    # @/mongodb/replica_sets/myrs_27017/mongod.conf
	    systemLog:
		    destination: file
		    path: "/mongodb/replica_sets/myrs_27017/log/mongod.log"
		    logAppend: true
		storage:
			dbPath: "/mongodb/replica_sets/myrs_27017/data/db"
			journal:
				enabled: true # 启用持久性日志，保证有效性&可恢复性
		processManagement:
			# 启用在后台运行 mongod
			fork: true
			pidFilePath: "/mongodb/replica_sets/myrs_27017/log/mongod.pid"
		net:
			bindIP: localhost
			port: 27017
		replication:
			replSetName: myrs # 副本集名称
		```
	
	3. 启用服务 `mogod -f path/to/conf`

- 创建副本节点
  
    基本流程一致
    
	- 存放路径为 `myrs_27018`
	- 修改端口号为 27018

- 创建仲裁节点
  
	基本流程一致
	
	- 存放路径为 `myrs_27019`
	- 修改端口号为 27019

#### 1.2.2 初始化副本集与主节点

- 使用客户端命令连接节点 `mongo --host=localhost --port=27017`
- 初始化副本集 `rs.initiate(configuration)` 
	- 此处使用默认配置：`rs.initiate()`
	- 返回值中 `"ok": 1` 说明创建成功
	- 输入两次回车后，行首出现 `myrs: PRIMARY`（中间会有一个副本节点的国度状态）

- 查看副本集配置内容
  
	基本语法：`rs.conf(configuration)`，别名为 `rs.config()`
	
	- `configuration` 参数可选，空缺时使用主节点配置
	- 返回值
		- `"_id": "myrs"` 副本集配置数据存储的主键名称，默认使用副本集名
		- `"members"` 副本集成员数组（此时仅包含端口号为27017的主节点）
			- `"arbiterOnly": false` 表明当前节点不是一个仲裁节点
			- `"priority": 1` 表明当前节点的优先级
		- `"settings"` 副本集的参数配置

- 查看副本集状态

	基本语法：`rs.status()`
	
	- 返回包含状态信息的文档（从心跳包中获取副本集中其他成员的当前状态信息）

#### 1.2.3 添加副本节点与仲裁节点
> 在主节点命令行下操作（行首为 `myrs: PRIMARY`）

##### 添加副本节点

- 基本语法：`rs.add(host, arbiterOnly)`
- 参数信息如下表所示：

|   Parameter   |       Type        | Description                                                                 |
|:-------------:|:-----------------:| --------------------------------------------------------------------------- |
|    `host`     | string / document | 字符串类型需要指定主机名&端口号</br>文档需要指定在 members 数组中的配置文档 |
| `arbiterOnly` |      boolean      | 可选，尽在 `host` 为 string 类型时使用</br>为 true 时将节点设置为仲裁者     |

- 一个通过 string 类型添加的例子：`rs.add("localhost:27018")`
  
    返回 `"ok": 1` 说明添加成功

##### 添加仲裁节点
> 其实使用 `rs.add(<host>, true)` 也行

- 基本语法：`rs.addArb(<host>)`
- 此处的例子：`rs.addArb("localhost:27019")`，返回 `"ok":1` 表示添加成功

### 1.3 数据读写操作

#### 主节点数据操作

- 登录主节点 `mongo --host=localhost --port=27017`
- 操作数据
    ```js
    use articledb
    // => switch to articledb
    db
    // => articledb
    db.coment.insert(
	    {
		    "articleid": "100001",
		    "content": "do not go gently into sth",
		    "userid": "1829",
		    "createdatetime": new Date()
	    }
    )
    // => writeResult({"nInstered": 1})
    db.comment.find()
    // => 上面插入的 document
	```

#### 副本节点数据操作

- 登录副本节点 `mongo --host=ocalhost --port=27018`

> 	我们发现当前无法执行 `show dbs` 
> 	
> 	这是因为当前节点只是一个「备份」而不是「奴隶节点」，**不允许读取数据**
> 	
> 	=> 默认情况下，非主节点「没有读写权限」，读权限需要额外手动配置

- 配置读取权限（设置为奴隶节点）：`rs.slaveOk() / rs.slaveOk(true)`
  
  >    实际上是 `db.getMongo().setSlaveOk()` 的简化命令
  >    
  >    我们也可以使用 `rs.slaveOk(false)` 取消其作为奴隶节点的权限
  
- 之后就可以正常执行命令了（通过以下命令查看在主节点中插入的数据）
	- `use articledb`
	- `db.comment.find()`

#### 仲裁者节点操作
> 仲裁者节点不存放任何业务数据，我们可以通过以下流程进行验证

- 登录仲裁节点`mongo --host=localhost --port=27019`
- 尝试进行操作
	```js
	rs.slaveOk()
	show dbs
	// => local 0.000GB（没有 articledb）
	use local
	// => switch to local
	show collections
	// => 只有一些存放配置信息的表
	```

### 1.4 主节点选举原则

在 Mongo DB 中，触发以下条件将引起注解点选举：

- 原有的主节点故障
- 原有的主节点网络不可达（ heartbeat 默认时长为 10s）
- 人工干预，如 `rs.stepDown(600)`

选举规则如下：

1. 票数最高，且获得 > N/2 + 1 成员投票的节点当选
   
     若得票数 < N/2 + 1，则无法选出 Primary（只提供 Read，不提供 Write）

2. 若两者票数相等，且均 > N/2 + 1，则数据较新的节点获胜（比较 `oplog`）

- 优先级对于投票的影响
	- 节点可以通过较高的优先级获得额外的票数
	- 优先级的取值范围为 \[0，1000\] （为**自己**额外增加 0-1k 票）
	- 具有较高优先级的成员更可能获得最多票数（也导致可能多个节点都获得超过半数选票）
	- 默认情况下，节点的优先级为 1（仲裁节点优先级为 0）

### 1.5 其他连接方式

#### Compass 连接

- 需要手动设置副本集名称为 `myrs`
- 需要根据节点情况配置 `Read Preference`：Primary / Secondary

#### SpringDate 连接

- 此处使用 URI 配置连接 
  
	  `mongodb://host1,host2,host3/?connect=replicaSet&slaveOk=true&replicaSet=myrs`
  
	- host1 ~ host3 的格式为 `ip_addr:port`（必须包含集群中所有的节点）
	- `slaveOk=true` 表示开启副本节点的读取功能
	- `connect=replicaSet` 在主节点中进行写操作，在副本节点中进行读操作，实现读写分离

## 2 分片集群 Shared Cluster

> 「副本集」将完整的数据集在不同主机之间进行同步
> 
> 「分片 Sharing」则将 db / table 进行拆分，在不同机器上仅存储部分数据

### 2.1 分片集群包含的组件

- 分片（存储）
  
    每个分片包含被分片数据的子集，可以单独作为副本集单位
    
    Mongo DB 在 `collection` 级别对数据进行分片
    
- `mongos`（路由）
  
    由 `mongos` 担任查询路由器，在 Client 与 分片集群 间进行协调
    
- `config servers`（配置服务器）
  
    配置服务集群的元数据 & 配置设置
  
    从 3.4 起必须将配置服务器部署为“CSRS”副本集

### 2.2 分片集群搭建

为实现容错容灾，我们可以搭建以下架构的简单分片集群：

- Mongos Routers 为保证容灾，配置 mongos1 & mongos2 两个 Router
- Config Server（本身是一个副本集）
	- 1 \* Primary Config
	- 2 \* Secondary Config
- Shared（分片集群）
	- Shared1（本身是一个副本集）
		- 1 \* Primary 
		- 1 \* Secondary
		- 1 \* Arbiter
	- Shared2（本身是一个副本集，架构和 1 相同）

#### 2.2.1 搭建 Shared 1 & 2

> 所有配置文件放到 `shared_cluster` 对应的字目录下，文件名为 `mongod.conf`

下面以搭建 Shared1 副本集为例（主、从、仲裁端口分别为 27018，27118，27218）

- 准备存放数据和日志的目录（以 Shared1.Primary 为例）
    ```shell
    mkdir -p /mongodb/shared_cluster/mysharedrs01_27018/log
    mkdir -p /mongodb/shared_cluster/mysharedrs01_27018/data/db
	```
- 新建配置文件 `/mongodb/shared_cluster/mysharedrs01_27018/mongod.conf`
    ```yaml
    systemLog:
	    destination: file
	    path: "/mongodb/shared_cluster/mysharedrs01_27018/log/mongod.log"
	    logAppend: true
	storage:
		dbPath: "/mongodb/shared_cluster/mysharedrs01_27018/data/db"
		journal:
			enabled: true
	processManagement:
		fork: true
		pidFilePath: "/mongodb/shared_cluster/mysharedrs01_27018/log/mongod.pid"
	net:
		bindIp: localhost
		port: 27018
	replication:
		replSetName: mysharedrs01
	sharding:
		# 分片角色，支持 configsvr / shardsvr
		clusterRole: shardsvr
	```
- 搞定后依次启动三个节点的服务
    ```shell
    mongod -f path/to/mongod.conf
    # 检查服务是否启动
    ps -ef |grep mongod
	```

#### 2.2.2 搭建 Config Server

- 准备存放数据和日志的目录（以 Shared1.Primary 为例）
    ```shell
    mkdir -p /mongodb/shared_cluster/myconfigrs_27019/log
    mkdir -p /mongodb/shared_cluster/myconfigrs_27019/data/db
	```
- 新建配置文件 `/mongodb/shared_cluster/myconfigrs_27019/mongod.conf`
    
    把 `clusterRole` 改成 `configsvr` 就行

#### 2.2.3 初始化副本集

- 使用客户端命令连接主节点 `mongo --host=localhost --port=27018`
- 执行初始化副本集命令 `rs.initiate()`
- 为本集合添加副本节点 `rs.add("localhost:27118")`
- 为本集合添加仲裁节点 `rs.addArb("localhost:27218")`

> 	Config Server 直接添加两个副本节点就行

#### 2.2.4 路由节点操作

##### 创建路由节点
- 创建用于存放数据和日志的目录
	```shell
	mkdir -p /mongodb/shared_cluster/mongos_27017/log
	mkdir -p /mongodb/shared_cluster/mongos_27017/data/db
	```
- 创建配置文件（只有 `sharding` 配置不同）
	```yaml
	sharding:
		# 指定配置节点所属的副本集（而非分片角色）
		configs: myconfigs/localhost:27019,localhost:27119,localhost:27219
		# 需要包含配置副本集中的所有节点
	```
- 启动 mongos（此时尚且不能执行 Write 操作）

#####  添加分片

- 基本命令：`sh.addShard("IP_addr:port")`
	```js
	// 添加第一套分片副本集
	sh.addShard("myshardrs01/localhost:27018,localhost:27118,localhost:27218")
	```
- 添加失败时，需要手动移除分片后再次添加
	```js
	// 移除分片命令
	use admin
	db.runCOmmand({removeShard: "myshardrs02"})
	```
	- 仅剩下一个 shard 时无法手动进行删除
	- 删除分片时会自动转移分片数据，需要一定时间 => 转移完成后再次执行命令才能真正删除

##### 开启分片功能

- 开启分片功能

	- 我们可以通过以下命令配置 articledb 为分片数据集
  
	    `sh.enableSharing("articledb")`，返回 `"ok": 1` 即为配置成功

	- 我们可以通过 `sh.status()` 查看分片状态

- 配置集合分片

	对集合进行分片时，需要指定一个 Shard Key（且一个 table 只能有一个 片键）且**分片后该键值对不可改动**
	
	每条记录都必须包含该 Key，且建立了关于该键的单独/符合索引
	
	Mongo 将基于该 Key 划分数据块，并使其均衡分布到所有分片中
	
	支持的划分方式有：Hash分片（随机平均分配）与 基于数值范围分片

	- 我们需要通过 `sh.shardCollection(namespace, key, unqiue)` 指定集合与分片键
	- 参数的相关信息如下：

|  Parameter  |   Type   | Description                                                           |
|:-----------:|:--------:| --------------------------------------------------------------------- |
| `namespace` |  string  | 格式为 `db_name.collection_name`                                      |
|    `key`    | document | 作为分片索引的规范文档，决定如何在 Shard 之间分发 Table               |
|  `unique`   | boolean  | 默认为 false，设为 true 后会保证索引唯一；</br>Hash策略不支持唯一索引 |

```js
// 使用 Hash 分片策略的例子 -> 相近的值被分散到不同数据块中
sh.shardCollection(
	"articledb.comment",
	{
		"nickname": "hashed"
	}
)
// 使用 值范围 分片策略的例子 -> 相近的值趋向于被存储在相同数据块中
sh.shardCollection(
	"articledb.comment",
	{
		"age": 1
	}
)
```

### 2.3 第三方工具连接分片分片

- Compass 连接分片
  
	设置 host & port 后（其余默认），连接 Router 即可

- SpringData 连接分片

	通过 URI 连接即可 `uri: mongodb://localhost:27017,localhost:27117/articledb`
	
	需要用逗号分隔多个路由节点（SpringBoot 自带负载均衡策略）

## 3 安全认证

- Mongo DB 默认不启用用户认证；可以在启动命令中通过 `--auth` 选项，或在配置文件中添加 `auth=true`
- Mongo DB 使用 RBAC，通过授予用户 >= 1 个角色实现权限控制（被分配角色前无权访问实例）
	- 每个角色拥有的权限可以进行显式指定，或继承其他已有角色（>=1个）的权限
	  
	    在 `admin` 数据库中创建的角色拥有所有权限
	  
	- 权限 = 数据库资源 + 允许的操作
		- 资源：database，collection，集群
		- 操作：增删改查

### 查看角色权限

```js
// 查看所有自定义角色权限
db.runCommand({ rolesInfo: 1 })
// 查看包括内置角色在内的所有角色权限
db.runCommand({
	rolesInfo: 1,
	showBuildinROles: true
})
// 查看当前数据库中的指定角色权限
db.runCommand({ rolesInfo: "role_name" })
// 查看其他数据库中的指定角色权限
db.runCommand({
	rolesInfo: {
		role: "role_name",
		db: "db_name"
	}
})
```

- 常用内置角色
	- 数据库用户角色：read / readWrite
	- 所有数据库用户角色：readAnyDatabase / readWriteAnyDatabase / userAdminAnyDatabase / dbAdminAnyDatabase
	- 数据库管理角色：dbAdmin / dbOwner / userAdmin
	- 集群管理角色：clusterAdmin / clusterManager / clusterMonitor / hostManager
	- 备份恢复角色： backup / restore
	- 超级用户角色： root
	- 内部角色：system

### 3.1 单实例环境
> 未开启副本集 / 分片功能

1. 关闭已开启的服务（服务搭建后再添加鉴权功能）
	- 快速关闭 
	  
	    使用 `ps -ef |grep mongo` 查看进程号后，使用 `kill -2 54410` ，直接通过进程号 kill
	  
	    > 若强制关闭后出错，则需要执行如下操作：
	    > 
	    >    1. 删除 lock 文件 `rm -f /mongodb/single/data/db/*.lock*`
	    >    2. 修复数据 `mongod --repair --dbpath=/mongodb/single/data/db`
	  
	- 标准关闭
	    ```js
	    // 通过客户端登录服务
	    mongo --port 27017
	    use admin
	    // 关闭服务
	    db.shutdownServer()
		```

2. 添加用户及其权限（就是把用户添加到对应数据库的表中）
   
     Mongo DB 中所有用户的信息将保存在 admin 数据库的表 system.user 中
     
     若不指定生效的数据库，权限将在所有数据库上生效
   
	1. 按照无授权认证配置 `mongod.conf`
	2. 按照该标准方式启动服务 `mongod -f path/to/mongod.conf`
	3. 使用 Mongo「客户端」登录 `mongo --host=localhost --port=27017`
	4. 创建两个管理员账户
	    ```js
	     use admin
	     // 创建系统超级用户 myroot，密码 123456，角色为 root
	     db.createUser({
		     user: "myroot",
		     pwd: "123456",
		     roles: ["root"]
	     })
	     // 创建用于管理 admin 数据库的用户 myadmin
	     db.createUser({
		     user: "myadmin",
		     pwd: "123456",
		     roles: [{
			     role: "userAdminAnyDatabase",
			     db: "admin"
			 }]
	     })
	     // 查看已创建用户信息
	     db.system.users.find()
	     // 删除用户
	     db.dropUser("myadmin")
	     // 修改密码
	     db.changeUserPassword("myroot", "12345")
		```

3. 认证测试
    ```js
     use admin
     // 密码错误的情形
     db.auth("myroot", "54321")
     // => Error: Authentication failed.
     // => 0
     // 密码正确的情形
     db.auth("myroot", "123456")
     // => 1
	```

4. 创建普通用户
   
      若希望在开启身份认证服务后创建普通用户，则需要先使用 admin 角色登录，再使用其权限创建
   
    ```js
	// 切换到需要操作的数据库 articledb
	use articledb
	// 创建用户，具有 articledb 的读写权限
	db.createUser({
		user: "test",
		pwd: "12345",
		roles: [{
			role: "readWrite",
			db: "articledb"
		}]
	})
	// 测试是否可用
	db.auth("test", "12345")
	```

5. 服务端开启身份认证
	1. 参数方式开启
	   
	     在启动时添加参数 `--auth` ，如 `mongod -f path/to/config -auth`
	   
	2. 配置文件方式开启
	   
	     在配置文件中添加如下内容：
	```yaml
	 security:
		 authorization: enabled
	```

#### 登录认证

##### 客户端登录认证

1. 先连接后认证
	```js
	// 建立连接
	mongo --host=localhost --port=27017
	// 认证用户 myroot
	use admin
	db.auth("myroot", "123456")
	// 认证 articledb 上的普通用户 test
	use articledb
	db.auth("test", "12345")
	```
	
1. 登录时认证（被跳过了）

##### SpringData 登录认证

使用 URI 进行配置
```yaml
spring:
	data:
		mongodb:
			# 基本格式为：mongodb://user_name:password@host:port/db_name
			uri: mongodb://test:12345@localhost:27017/articledb
```

##### Compass 登录认证

- 配置
	- Authentication = Username / Password
	- 填入 username & password
	- 选择对应的Authentication Database
- 其余选项默认

### 3.2 副本集环境
> 各节点均维护 key 文件（内容一致），通过 key 文件来验证身份
> 
> - 一般来说在一台机器上生成，随后拷贝到集群内的其他机器上（必须拥有读权限）
> - 密钥内容必须一致，位置随便（方便起见放在固定路径下）

1. 关闭原有服务
2. 启动副本集 `mongod -f /mongo/replica_sets/myres27017~27019/mongod.conf`
3. 开启认证服务前，在主节点上添加管理员账户
   
     主节点上添加的用户会在副本上自动同步
   
	  ```js
	  use admin
	  db.createUser({
		  user: "myroot",
		  roles: ["root"]
	  })
	  ```

4. 创建用于副本集认证的 key 文件
   
	在当前文件夹中生成 key（下面使用 openssl 生成密钥，并通过 chmod 更改权限）
	
	  ```shell
	  openssl rand -base64 90 -out ./mongo.keyfile
	  chmod 400 ./mongo.keyfile # 仅文件所有者可读
	  ll mongo.keyfile
	  ```
> 	由于是在单机上模拟，直接 copy 到各节点的根目录下即可

5. 修改配置文件以指定 keyfile
   
     添加以下内容：
    ```yaml
    security:
	    keyFile: /mongodb/replica_sets/myrs_27017/mongo.keyfile
	    authorization: enabled
	```

6. 重新启动副本集

7. 在主节点上添加普通用户账号
     ```js
     // 连接主节点
     mongo --host=localhost --port=27017
     // 由于开启了用户认证，必须通过管理员账户创建
     use admin
     db.use("myroot", "123456")
     // 创建 articledb 上具有读写权限的普通用户 bobo
     use articledb
     db.createUser({
	     user: "bobo",
	     pwd: "123",
	     roles: ["readWrite"]
     })
	```

#### SpringData 登录副本集

```yaml
uri: mongodb://bobo:123@localhost:27017,localhost:27018,localhost:27019/articledb?connect=replicaSet&slaveOk=true&reokucaSet=myrs
```

### 3.3 分片集群环境

类似于副本集，每个节点丢一个 key 就行