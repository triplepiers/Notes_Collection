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

### 新增普通用户

1. 创建新用户（自动复制 `/etc/skel` 中的基本配置文件）

    ```bash
    useradd -m -s /bin/bash [User]
    # -m 表示为改用户创建 home 目录，并复制 /etc/skel 下的模版文件
    # -s 指定默认 shell
    ```

2. 设置密码（可选）

    ```bash
    passwd [User] # 然后输入两次 PWD 就行
    ```

3. 配置 SSH 公钥

    ```bash
    # 切换到用户目录
    mkdir -p /home/[User]/.ssh

    # 粘贴公钥
    echo "Public Key" > /home/[User]/.ssh/authorized_keys

    # 设置正确权限（非常重要！）
    chown -R [User]:[User] /home/[User]/.ssh
    chmod 700 /home/[User]/.ssh
    chmod 600 /home/[User]/.ssh/authorized_keys
    ```

## 2 开发环境

### bypy（百度网盘下载）

1. 安装

    ```bash
    pip install bypy
    ```

2. 授权：随便输入一个命令，比如 `bypy info`，随后会出现一个百度网盘登录网址 => 复制粘贴登录后获得的 token，敲击回车即可

3. 基本操作

    `bypy` 能够同步的数据位于 `我的应用数据/bypy` 下

    ```bash
    bypy help # 显示帮助（基本都能在这里看）
    bypy list # 列出网盘上对应位置下的所有文件

    ## 上传
    bypy upload [localpath] [remotepath] [ondup]      # 上传文件/递归上传路径
    bypy syncup [localdir] [remotedir] [deleteremote] # 上传本地的整个文件夹

    ## 下载
    bypy downdir [remotedir] [localdir]                 # 递归下载指定路径
    bypy downfile <remotefile> [localpath]              # 下载指定文件
    bypy download [remotepath] [localpath]              # 下载指定文件/递归下载路径
    bypy syncdown [remotedir] [localdir] [deletelocal]  # 把远程所有东西拉下来
    ```

    其中，下载可以通过指定 `--downloader aria2` 进行加速（可以通过 `conda install aria2` 安装）

4. 报错处理

   -  `Slice MD5 mismatch`（小文件没问题，见 [Issue#741](https://github.com/houtianze/bypy/issues/741)）

      - 原因： `bypy` 默认会在文件上传后执行 MD5 校验（比较本地计算和百度服务器回传结果），但百度方面的实现变了

      - 解决：建议该用 BaiduPCS-Go
     

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
    # 报 gzip: stdin: not in gzip format 可以改成 -xvf，得到：
    # - 主程序：mysql-5.7.29-linux-glibc2.12-x86_64.tar.gz (<- 继续处理这个)
    # - 测试套件：mysql-test-5.7.29-linux-glibc2.12-x86_64.tar.gz
    mv mysql-5.7.29-linux-glibc2.12-x86_64 mysql
    ```

2. 编写配置文件：将 $INSTALL_PREFIX 替换为实际安装路径

    > 因为 MySQL 不会扫描自定义路径下的配置文件，最好创建在 HOME 目录下：`~/.my.cnf`

    ```toml title="mysql/my.cnf"
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

1. 安装：不打印任何消息即为安装成功，此处的 USER_NAME 为系统用户名

    ```bash
    bin/mysqld \
    # 前面配置文件为 ~/.my.cnf 的话，修改为对应路径
    --defaults-file=$INSTALL_PREFIX/mysql/my.cnf \
    --initialize \
    --user=USER_NAME \
    --basedir=$INSTALL_PREFIX/mysql \
    --datadir=$INSTALL_PREFIX/mysql/data
    ```

2. 启动服务

    ```bash
    cd $INSTALL_PREFIX/mysql
    ./bin/mysqld_safe \
    # 前面配置文件为 ~/.my.cnf 的话，修改为对应路径
    --defaults-file=$INSTALL_PREFIX/mysql/my.cnf \
    --user=USER_NAME &
    ```

3. 获取初始密码：

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

4. 报错处理

    1. 若通过 `mysql -u [User] -p` 登录报错：`Command 'mysql' not found`，则将 `$INSTALL_PREFIX/mysql/bin` 加入环境变量 `$PATH`

        ```text
        # @ ~/.bashrc
        export PATH="$PATH:$INSTALL_PREFIX/mysql/bin"
        ```
    
    2. 登录报错：` Can't connect to local MySQL server through socket '/tmp/mysql.sock'`

        最好通过 `mysql --print-defaults` 检验一下客户端配置是否生效（打印为空说明未生效）

        - 临时：指定连接使用的 socket 文件

            ```bash
            mysql --socket=$INSTALL_PREFIX/mysql/mysql.sock -u root -p
            ```

        - 长期：先 kill 掉所有 mysql 相关进程，然后把 `my.cnf` 挪到 HOME 目录后重启服务


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

## 4 换源

### 4.1 Pip

1. 创建配置文件

    ```bash
    mkdir -p ~/.pip
    touch  ~/.pip/pip.conf
    ```

2. 写入清华源

    ```text
    [global]
    index-url = https://pypi.tuna.tsinghua.edu.cn/simple
    trusted-host = pypi.tuna.tsinghua.edu.cn
    ```

3. 验证

    ```bash
    pip config list # 观察是否输出清华源，或者直接安装、看有没有加速
    ```

### 4.2 Conda

1. Conda 的配置文件是 `~/.condarc`，可以先通过以下命令备份为 `.condarc.bak`：

    ```bash
    mv ~/.condarc ~/.condarc.bak 2>/dev/null
    ```

2. 写入清华源

    ```text
    channels:
        - https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/main/
        - https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/free/
        - https://mirrors.tuna.tsinghua.edu.cn/anaconda/cloud/conda-forge/
        - https://mirrors.tuna.tsinghua.edu.cn/anaconda/cloud/pytorch/     # 如需 PyTorch
        - defaults                                                         # 保留 defaults, 避免某些包在镜像中缺失
    show_channel_urls: true
    ssl_verify: true
    ```

3. 验证

    ```bash
    conda config --show channels # 查看当前配置
    conda search numpy           # 尝试搜索包（观察 URL 是否含 tuna）
    ```