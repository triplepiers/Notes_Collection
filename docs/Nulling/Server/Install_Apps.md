# 无管理员权限软件安装

> 没有 `sudo` 权限，就这样从源码编译直到厌烦

## 1 基本环境

### 升级 Ubuntu 系统
> 以  20.04 => 22.04 为例

1. 保持 SSH 会话活跃

    - 启用 screen 服务

        ```bash
        sudo apt install screen # 通过 screen 保证 OpenSSH 会话活跃
        screen                  # 启动服务 => 会显示介绍文本
        ```

    - 修改配置 `/etc/ssh/sshd_config`，追加以下内容

        ```text
        ClientAliveInterval 60
        ```

    - 重启 SSH 守护进程

        ```bash
        sudo systemctl restart ssh
        ```

2. 升级软件、安装依赖

    ```bash
    sudo apt update && sudo apt dist-upgrade
    sudo apt install update-manager-core
    ```

4. 编辑 `/etc/update-manager/release-upgrades`，确保以下字段设置

    ```text
    Prompt=normal
    ```

5. 开始升级

    ```bash
    do-release-upgrade
    ```

!!!warning "Azure 升级完之后会丢掉公钥，得用密码登录后重新传一遍"

### SSH 连接简化

!!!question "还在为连接服务器得输入一长串 username / host / port 信息而烦恼吗？"
    请去霍霍 `~/.ssh/config` 这个文件，如果没有的话就 `touch` 一个出来

```text
Host [HostAlias]                   # 用于 ssh HostAlias 简化连接
	HostName [IP / URL]
	User     [UserName]
	Port     [PortNum]             # 非默认端口时需要配置
	IdentityFile [path2privateKey] # 存在多个私钥时，指定私钥
```

现在，你可以用通过 `ssh [HostAlias]` 命令进行一键连接了

### 存储占用查看

- 所有文件
  
    - 磁盘使用情况 `df -h`

    - 剩余磁盘空间 `df -hl`

- 当前路径

    - 占用内存的总量 `du -sh`

    - 各子目录/文件分别占用的内存容量：`du -sh ./*`

        该命令 **不会** 显示隐藏文件夹，可以尝试用 `du -sh ./.*` 救一下

## 2 开发环境

### VSCode

#### 持续显示 “正在下载服务器”

```bash
# 1 获取 commit id
cd ~/.vscode-server/bin
ls # 如果有多个就 rm -rf * 再重新开一下本地的 VSCode

# 2 下载对应版本的 VSCode Server
wget \
https://update.code.visualstudio.com/commit:${commit_id}/server-linux-x64/stable \
-O vscode-server-linux-x64.tar.gz

# 3 解压
tar -zxf vscode-server-linux-x64.tar.gz

# 4 重命名
mv vscode-server-linux-x64 ${commit_id}
```

!!!info "重启 VSCode 远程连接窗口，然后摆脱命令行神教吧"

### Miniconda

具体方式可以参照 [文档](https://www.anaconda.com/docs/getting-started/miniconda/install)，这边选用了比较手动的方式

!!!warning "这玩意儿**不支持**挪动路径（安装路径已经硬编码进去了）"
    若不慎清空 `~/.bashrc`， 可以通过 `./bin/conda init` 重新初始化

1. 在比较方便的位置创建一个名为 `miniconda3` 的文件夹

    ```bash
    mkdir miniconda3
    ```

2. 下载安装脚本

    ```bash
    # 后面的 ~/miniconda3/miniconda.sh 记得修改前缀路径
    wget \
    https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh \
    -O SOMEWHERE/miniconda3/miniconda.sh
    ```

3. 运行安装脚本

    ```bash
    bash ./miniconda3/miniconda.sh -b -u -p ./miniconda3
    ```

4. 删除脚本文件

### 找不到 Pip

1. 下载 `get-pip` 脚本

    ```bash
    curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
    ```

2. 运行脚本，安装 `Pip`

    ```bash
    python get-pip.py
    ```

### Hugging Face

Huggin Face 的主干库分为三部分：

1. Transformer 模型库

    ```bash
    pip install transformers \
    --trusted-host pypi.tuna.tsinghua.edu.cn # 从清华源安装
    ```

    可通过以下命令引入 & 校验版本号，从而验证是否成功安装

    ```py
    import transformers
    transformers.__version__
    ```

2. Dataset 数据集库：提供了下载 & 预处理

3. Tokenizer 分词库：将 Seq 转换为 ID 序列

    加载 Tokenizer 的时候需要传与预测模型一致的 name（每个预测模型均对应了单独的 Tokenizer）

---

> 以 `bert-base-chinese `的使用为例


#### 模型下载

下载支持两种方式：

1. 手动下载：在 [链接](https://huggingface.co/google-bert/bert-base-chinese) 中找到 Files 选项卡（但好像得把里面的文件全都下过来 ...）

1. 通过官方命令行工具下载：需要额外安装依赖，以及得注册登录（需要用到 token）

    ```bash
    pip install -U huggingface_hub
    ```
    
    ```py title="用于下载的脚本"
    import os
    from huggingface_hub import snapshot_download

    # 设置国内镜像
    os.environ["HF_ENDPOINT"] = "https://hf-mirror.com"

    model_name = "google-bert/bert-base-chinese"
    while True: # 防止断联
    try:
        snapshot_download(
            repo_id=model_name,
            local_dir_use_symlinks=True,# 在local-dir指定的目录中都是一些“链接文件”
            ignore_patterns=["*.bin"],  # 忽略下载哪些文件
            # 实际此处不能忽略 .bin（不然只有 tensorflow 权重）
            local_dir='./model',        # 储存路径
            token="*******",            # huggingface的token
            resume_download=True
        )
        break
    except: pass
    ```

#### 分词器

1. 简单编码器（ `tokenizer.encode` ）

    - BERT 只接受一次输入 1 或 2 个句子

    - 由于人为设置 `maxLen=30`，所以每句话都会被 Pad 到 `len=30`（超出被截断）

    ```python
    from transformers import BertModel, BertTokenizer
    
    # load from local
    tokenizer = BertTokenizer('./model/vocab.txt')
    
    # use Tokenizer
    sentences = [ '窗前明月光', '疑是地上霜']
    outputs = tokenizer.encode(
        text=sentences[0],
        text_pair=sentences[1],
        truncation=True,      # > maxLen, cut
        padding='max_length', # pad => maxLen
        add_special_tokens=True,
        max_length=30,
        return_tensors=None
    )
    print(tokenizer.decode(outputs))
    """ 开头标识为 [CLS]、结尾为 [SEP]，填充的统一为 [PAD]
    [CLS] 窗 前 明 月 光 [SEP] 疑 是 地 上 霜 [SEP] [PAD] [PAD] [PAD] [PAD] [PAD] [PAD] [PAD] [PAD] [PAD] [PAD] [PAD] [PAD] [PAD] [PAD] [PAD] [PAD] [PAD]
    """
    ```

2. 增强编码器（ `tokenizer.encode_plus` ）

    支持指定返回的 tensor 类型、token 的标识类型、mask 类型、特殊标识类型、返回长度 etc

    ```py
    # use Tokenizer
    sentences = [ '窗前明月光', '疑是地上霜']
    outputs = tokenizer.encode_plus(
        text=sentences[0],
        text_pair=sentences[1],
        truncation=True,
        padding='max_length',
        add_special_tokens=True,
        max_length=30,
        return_tensors=None,             # 可选 tf: tensorflow, pt: pytorch, np: numpy, None
        return_token_type_ids=True,      # 1st Sentence & special_token = 0, 2nd Sentence = 1
        return_attention_mask=True,      # padding = 0, else = 1 
        return_special_tokens_mask=True, # special_token = 1, else = 0
        return_length=True # 返回长度
    )

    for k,v in outputs.items():
        print(k,';', v)
    # 若选择 return_tensors='pt' ，这一步会 bug
    print(tokenizer.decode(outputs['input_ids']))
    ```

3. 批量编码器（ `tokenizer.batch_encode_plus` ）

    !!!question "一次一句/两句的编码还是太慢了，我们能不能搞点批发（能的）"
        主要是将传入参数 `(text, text_pair)` 修改为 `batch_text_or_text_pairs`

    ```python
    sentences = [ '窗前明月光', '疑是地上霜', '举头望明月', '低头思故乡']
    outputs = tokenizer.batch_encode_plus(
        # 定义了 两个 Single+ 一对 Pair
        batch_text_or_text_pairs=[
            sentences[0], (sentences[1], sentences[2]), sentences[3]
        ],  
        truncation=True,
        padding='max_length',
        add_special_tokens=True,
        max_length=30,
        return_tensors=None,
        return_token_type_ids=True,
        return_attention_mask=True,
        return_special_tokens_mask=True,
        return_length=True
    )

    for k,v in outputs.items():
        print(k,';', v)
    for idx in range(len(outputs['input_ids'])):
        print(tokenizer.decode(outputs['input_ids'][idx]))
    ```

#### 字典编辑

!!!question "BertCN 在训练时是以 **单个汉字** 作为 token 的、这回导致一些词语被拆开"
    我们可以通过在词典中增加 token 来解决这一问题

```py
tokenizer = BertTokenizer('path/to/vocab.txt')
vocabDict = tokenizer.get_vocab()         # 包含 token + special_token

tokenizer.add_tokens(new_tokens=['月光'])  # 普通 token
tokenizer.add_special_tokens({            # 特殊 token
  'eos_token': '[EOS]'
})
```

## 3 DBMS

### MySQL

1. 下载：请至 [官网](https://downloads.mysql.com/archives/community/) 选择合适版本，此处选用 v5.7.29

    ```bash
    wget https://downloads.mysql.com/archives/get/p/23/file/mysql-5.7.29-linux-glibc2.12-x86_64.tar

    # 解压 & 重命名
    tar -zxvf mysql-5.7.29-linux-glibc2.12-x86_64.tar
    mv mysql-5.7.29-linux-glibc2.12-x86_64 mysql
    ```

2. 编写配置文件：将 $INSTALL_PREFIX 替换为实际安装路径

    ```toml title="mysql/my.cnd"
    [client]   
    port=3336  
    socket=$INSTALL_PREFIX/mysql/mysql.sock  

    [mysqld]
    port=3336
    basedir=$INSTALL_PREFIX/mysql
    datadir=$INSTALL_PREFIX/mysql/data
    pid-file=$INSTALL_PREFIX/mysql/mysql.pid
    socket=$INSTALL_PREFIX/mysql/mysql.sock
    log_error=$INSTALL_PREFIX/mysql/error.log
    server-id=100
    lower_case_table_names=1 # 设置大小写不敏感
    ```

3. 安装：不打印任何消息即为安装成功，此处的 USER_NAME 为系统用户名

    ```bash
    bin/mysqld \
    --defaults-file=$INSTALL_PREFIX/mysql/my.cnf \
    --initialize \
    --user=USER_NAME \
    --basedir=$INSTALL_PREFIX/mysql \
    --datadir=$INSTALL_PREFIX/mysql/data
    ```

4. 启动服务

    ```bash
    cd $INSTALL_PREFIX/mysql/bin
    bin/mysqld_safe \
    --defaults-file=$INSTALL_PREFIX/mysql/my.cnf
    --user=USER_NAME &
    ```

5. 获取初始密码：

    - 随机密码在 `error.log` 文件中，可通过以下命令进行查看

        ```bash
        cat error.log | grep root@localhost
        ```
    
    - 你可以在登录后通过以下 SQL 指令进行修改

        ```sql
        # 设置新密码
        SET PASSWORD FOR 'root'@'localhost' = PASSWORD('neo_pwd');
        # 使用户root能被任何host访问
        update mysql.user set host = '%' where user = 'root';
        # 刷新系统权限
        flush privileges;
        ```

### SQLite3

SQLite 依赖于 `gcc` 和 `make`，请确保已经安装

1. 下载源码

    ```bash
    # 创建工作目录
    mkdir -p ~/sqlite-build && cd ~/sqlite-build

    # 下载源码（请检查 https://www.sqlite.org/download.html 获取最新版本）
    wget https://www.sqlite.org/2025/sqlite-amalgamation-3500400.zip

    # 解压
    unzip sqlite-amalgamation-*.zip
    cd sqlite-amalgamation-*/
    ```

2. 编译并安装到指定目录

    ```bash
    # 创建安装目录 => 之会清理
    mkdir -p $INSTALL_PREFIX/sqlite3

    # 在解压路径下编译静态库
    gcc -o sqlite3 -DSQLITE_ENABLE_FTS5 -DSQLITE_ENABLE_JSON1 \
        -I. shell.c sqlite3.c -lpthread -lm -ldl
        
    mkdir -p $INSTALL_PREFIX/sqlite3/include
    mkdir -p $INSTALL_PREFIX/sqlite3/lib
    cp sqlite3 $INSTALL_PREFIX/sqlite3/bin/ # 复制可执行文件

    # [可选] 编译共享库
    gcc -shared -fPIC -o libsqlite3.so sqlite3.c -lpthread -ldl
    cp sqlite3.h $INSTALL_PREFIX/sqlite3/include/
    cp libsqlite3.so $INSTALL_PREFIX/sqlite3/lib/
    ```

3. 编辑环境变量

    ```bash
    # 将 $INSTALL_PREFIX/sqlite3/bin 加入 PATH（永久生效）
    echo 'export PATH="$INSTALL_PREFIX/sqlite3/bin:$PATH"' >> ~/.bashrc

    # 重新加载配置
    source ~/.bashrc
    ```

!!!info "OK，这就装好了。不放心的话可以通过如下命令进行验证"
    ```bash
    sqlite3 --version
    ```

### PostgreSQL

1. 下载安装包并解压

    ```bash
    wget https://ftp.postgresql.org/pub/source/v15.4/postgresql-15.4.tar.gz
    tar -zxvf postgresql-15.4.tar.gz
    ```

1. 配置安装路径

    ```bash
    cd postgresql-15.4
    ./configure \
    --prefix=$INSTALL_PREFIX/postgresql-15.4 \
    --quiet --without-readline
    ```

1. 编译：该命令将在 `$INSTALL_PREFIX/bin` 下生成 `/bin & /share`

    ```bash
    make && make install # 还是在解压路径
    ```

1. 添加环境变量（以支持直接通过 `psql` 命令进行连接）

    ```bash
    echo 'export PATH="$INSTALL_PREFIX/bin:$PATH"' >> ~/.bashrc
    source ~/.bashrc
    ```

1. 初始化数据库（集群）

    ```bash
    cd $INSTALL_PREFIX/bin
    ./initdb -D [path/to/store/db]
    ```

    其中，参数 `-D` 用于指定 DB 存储路径（必填），`-U` 用于指定管理员用户名（默认为当前的系统用户名），`-W` 用于指定管理员账户密码（默认为空）

1. 启动服务

    ```bash
    pg_ctl -D [path/to/store/db] start
    pg_ctl -D [path/to/store/db] stop # 关闭集群
    ```

1. 连接数据库

    - 当用户名并非 `postgres` 时，将报错 `database doesn't exist`

    - 需要先连接至 `psql postgres`，随后创建其他数据库

    ```bash
    psql                 # 连接与系统用户名相同的数据库
    psql [database_name] # 连接指定数据库
    ```

### PGLoader

!!!info "最麻烦的一集"

- 本体安装三部曲（倒是简单）

    ```bash
    # 1 下载源码
    git clone git@github.com:dimitri/pgloader.git
    cd pgloader

    # 2 编译
    make pgloader

    # 3 移动可执行文件
    mv ./build/bin/pgloader $INSTALL_PREFIX/bin/
    ```

- 剩下会有千奇百怪的依赖报错，看下面几个小节吧

#### SBCL

- 最终选择 v2.1.0 版本进行安装
    - 这东西对本地的 GCC 版本有要求，最新版要求 `glibc >= 2.32`
    - `pgloader` 需要的 `DEFINE-ALIEN-CALLABLE` 要求 `sbcl >= 2.1.10`
  
- 可能的报错：`Unable to load libsybdb.so`

    `libsybdb.so` 是 FreeTDS 库的一部分，需要全装上

    ```bash
    # 下载
    wget -c http://ibiblio.org/pub/Linux/ALPHA/freetds/stable/freetds-stable.tgz
    tar -zxvf freetds-stable.tgz

    # 安装
    cd freetds-0.91
    ./configure 、
    --prefix=$INSTALL_PREFIX/freetds \
    --with-tdsver=8.0 --enable-msdblib
    make && make install

    # 添加到环境变量
    LD_LIBRARY_PATH="$INSTALL_PREFIX/freetds/lib:$LD_LIBRARY_PATH"
    ```
  
- 本体安装

    1. 下载 [最新二进制包](http://www.sbcl.org/platform-table.html)，或 [较旧版本](https://sourceforge.net/projects/sbcl/files/sbcl/)

    2. 解压 & 指定安装路径（默认在 `/usr/local`）
   
        ```bash
        INSTALL_ROOT=$INSTALL_PREFIX/sbcl sh install.sh
        ```

#### LibPQXX

1. 下载源码

    > `libpqxx` 对 g++ 版本有一定要求，可以通过 `git checkout [Version]` 进行切换

    ```bash
    git clone git@github.com:jtv/libpqxx.git
    cd libpqxx
    ```

2. 试一下 configue + 安装

    ```bash
    ./configure \
        --prefix=$INSTALL_PREFIX/libpqxx \
        --with-postgres-include=$INSTALL_PREFIX/postgresql-15.4/include \
        --with-postgres-lib=$INSTALL_PREFIX/postgresql-15.4/lib \
        --disable-documentation # 这样就不用装 xmlto 了

    # 不报错（C++版本太低）就可以安装了
    make && make install
    ```

3. 设置环境变量（但 LD 好像一直找不到）
   
    > 注意一下格式，在 `~/.bashrc` 里需要加 `"`

    ```bash
    export LD_LIBRARY_PATH=$INSTALL_PREFIX/libpqxx/lib:$LD_LIBRARY_PATH
    export PKG_CONFIG_PATH=$INSTALL_PREFIX/libpqxx/lib/pkgconfig:$PKG_CONFIG_PATH
    ```

4. 安装验证

    ```bash
    pkg-config --exists libpqxx && echo "OK" || echo "Still missing"
    ```

- 可能会报错：`No package 'libpq' found`

  1. 从 PostgreSQL 源码进行编译（仅 客户端 `libpq` 部分）

    ```bash
    ./configure \
    --prefix=$INSTALL_PREFIX/libpq \
    --without-readline --without-zlib
    make -C src/interfaces/libpq
    make -C src/include
    ```

1. 将  `libpq` 安装到指定目录

    ```bash
    make -C src/interfaces/libpq install
    make -C src/include install
    ```

    此时：

    - `libpq` 头文件安装在 (1) 中指定目录的 `include` 下
    - `libpq` 库安装在 (1) 中指定目录的 `lib/libpq.so`

1. 配置环境变量

    ```text title="~/.bashrc"
    export PATH="$INSTALL_PREFIX/libpq:$PATH"
    export LD_LIBRARY_PATH="$INSTALL_PREFIX/libpq/lib:$LD_LIBRARY_PATH"
    export PKG_CONFIG_PATH="$INSTALL_PREFIX/libpq/lib/pkgconfig:$PKG_CONFIG_PATH"
    ```

2. 验证是否可用

    ```bash
    pkg-config --exists libpq && echo "OK" || echo "Still missing" # 显示 OK 即可
    ```




