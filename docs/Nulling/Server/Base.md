# 基本环境

## 1 升级 Ubuntu 系统
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

## 2 SSH

### 连接简化

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

### WARNING

在使用 SSH 连接时出现以下 WARNING 信息：

```
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@    WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!     @
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
IT IS POSSIBLE THAT SOMEONE IS DOING SOMETHING NASTY!
Someone could be eavesdropping on you right now (man-in-the-middle attack)!
It is also possible that a host key has just been changed.
The fingerprint for the ED25519 key sent by the remote host is
SHA256:[一串 SHA 256].
Please contact your system administrator.
Add correct host key in path/to/.ssh/known_hosts to get rid of this message.
Offending ECDSA key in path/to/.ssh/known_hosts:[rowIndex]
Host key for [IP]:port has changed and you have requested strict checking.
Host key verification failed.
```

- 解释：待连接主机 `[IP]:port` 的密钥发生变化（可能是由于系统重装），SSH 出于安全考虑会默认拒绝连接

- 修复：根据提示删除 `known_host` 文件中的对应行并重新连接，此时 SSH 会显示该主机的新密钥、确认无误后输入 `yes` 即可

  > 目测有 `ssh-ed25519` 和 `endsa-sha2-nistp256` 两行、都需要删掉

## 3 查看存储占用

- 所有文件
  
    - 磁盘使用情况 `df -h`

    - 剩余磁盘空间 `df -hl`

- 当前路径

    - 占用内存的总量 `du -sh`

    - 各子目录/文件分别占用的内存容量：`du -sh ./*`

        该命令 **不会** 显示隐藏文件夹，可以尝试用 `du -sh ./.*` 救一下

## 4 进程筛选

> 实际上 `ps aux` 查看的是快照，但凑合用吧

```bash
# 基础版
ps aux | grep [xxx] # 把 xxx 替换成你要看的东西，比如 git / xxx.py
                    # 用 nohup 挂的话，grep nohup 是看不出来的 => 用后面的命令

# 进阶版
ps -u [userName]    # 显示特定用户的所有进程（目测接 grep 也没用）
ps aux | grep "^user" | grep xxx # 先匹配特定用户（行开头），再匹配特定任务
```

## 5 用户管理

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