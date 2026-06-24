# 后端速成

## [Redis](https://redis.net.cn)

> 基于 <u>内存</u> 的键值对（key-value）结构数据库

### Set Up

- 安装

    ```bash
    brew install redis # install
    redis-server       # 验证安装
    ```

- 配置
    
    使用 homebrew 安装的路径为 `/opt/homebrew/Cellar/redis/VERSION/.bottle/etc/redis.conf`

    ```txt title="redis.conf"
    daemonize yes     # 启用后台运行
    requirepass xxxxx # 设置访问密码
    port xxxx         # 修改端口号
    ```

- 服务启动与连接

    ```bash
    redis-server /path/to/redis.conf             # 启动服务
    ps aux | grep redis                          # 检查运行状态

    redis-cli [-h HOST -p PORT -a PASSWORD] ping # 测试连接
    ```

- 数据类型
    
    key 为 string 类型，value 支持以下 5 种常用数据类型

    | Type | Desc. |
    | :-   | :-    |
    | String | - |
    | Set    | 值为 String 类型 |
    | Hash   | Value 本身又是一个 HashMap，一般用来存 Object |
    | List | 支持从 左/右 侧插入 |
    | Sorted Set / zset | 每个元素关联一个 score，根据 score 升序排序 |


### 常用命令

- 通用命令

    ```bash
    KEYS   pattern  # 列出复合正则 pattern 的所有 key
    EXISTS key
    TYPE   key
    DEL    key
    ```

- 操作 String 类型

    ```bash
    SET key val
    GET key

    SETEX key seconds value # 赋值，且指定 key 过期时间

    SETNX key value         # 仅当 key 不存在时赋值
    ```

- 操作 Hash 类型

    ```bash
    HSET key feild value # 设置特定 key[feild] 的值
    HGET key feild
    HDEL key feild       # 删除指定字段

    HKEYS key
    HVALS key
    ```

- 操作 List 类型

    ```bash
    LPUSH key val1 [val2 ...] # 左侧插入若干值
    LRANGE key start stop     # 闭区间，支持负数
    RPOP key                  # 删除最后一个
    LLEN key                  # 获取长度
    ```

- 操作 Set 类型

    ```bash
    SADD key val1 [val2 ...]
    SREM key val1 [val2 ...]

    SMEMBERS key              # 返回所有成员
    SCARD key                 # 返回 size

    SINTER key1 [key2 ...]    # 返回交集
    SUNION key1 [key2 ...]    # 返回并集
    ```

- 操作 Zset： (double、可重复) score + (string、不可重复) val

    ```bash
    ZADD key score1 val1 [score2 val2 ...]
    ZREM key val1 [val2 ...]           # 是根据 val 删除的

    ZRANGE key start stop [WITHSCORES] # 根据 idx 选择，可选择返回 scores

    ZINCRTBY key increment val         # val += increment
    ```

### JAVA 操作（Spring Data Redis）

- 配置

    1. 导入 maven

        ```xml title="pom.xml"
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-redis</artifactId>
        </dependency>
        ```
    
    2. 配置 Redis 数据源

        ```yaml title="application.yml"
        spring:
            ...
            redis:
                host: HOST
                port: PORT
                password: PWD
                database: IDX # default = 0
        ```

    3. 编写配置类、创建 RedisTemplate 对象

        ```java title="config/RedisConfiguration.java"
        @Configuration
        @Slf4j
        public class RedisConfiguration {
            @Bean
            public RedisTemplate redisTemplate(RedisConnectionFactory connFac) {
                RedisTemplate rTemplate = new RedisTemplate();
                rTempalte.setKeySerializer(new StringRedisSerializer()); # 不设置也行
                rTemplate.setConnectionFactory(connFac);
                return rTemplate;
            }
        }
        ```

- 操作 Redis

    ```java
    @Autowired private Redistemplate redisTemplate; # 注入一下

    # 操作 String 类型的普通数据
    ValueOperations valOperations = redisTemplate.opsForValue();
    valOperations.set("key", "val");
    valOperations.get("key");

    # 类似的，操作 Hash 类型的数据
    HashOperations hashOperations = redisTemplate.opsForHash();
    hashOperations.put("key", "hashKey", "val");
    ```

### 基本缓存思路

- 查询 redis 是否存在对应 key

    - 存在：直接返回
    - 不存在：查 DB、结果放进 Redis

- 清理缓存：Update / Delete 数据库内容均需要清理缓存

    - 直接 delete Redis 中的对应内容就好