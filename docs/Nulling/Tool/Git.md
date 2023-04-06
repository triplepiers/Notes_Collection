## 1. 创建新仓库
1. 创建新的文件夹
2. 执行 `git init`

## 2. 克隆仓库
- 克隆 **本地** 仓库 `git clone path_to_local/repository`
- 克隆 **远程** 仓库 `git clone usrname@host:path_to_remote/repository`

## 3. 工作流
本地仓库由 `git` 维护着 **三棵树**：

- `working dir` 工作目录：持有 **实际** 文件
- `index` 暂存区：**临时** 保存改动
- `HEAD` ：保存 **最近一次** `commit` 结果

## 4. 暂存 & 提交 `commit`
### 4.1 添加改动到暂存区 `index`
- 提交单文件改动 `git add <file_name>`
- 提交所有文件改动 `git add *`
### 4.2 提交改动到 `HEAD`
- `git commit -m "备注"`
- 这一指令将<u>暂存的改动</u>提交至 `HEAD`，但 **并未同步至远端**

## 5. 推送 `push`
- `git push origin 分支名称`
- 若<u>还没有克隆现有仓库</u>，可以使用以下指令将该仓库链接至远端
    `git remote add origin <server_info>`

## 6. 分支 `branch`
- 创建仓库时的默认分支为 `master`
- 创建分支并切换  `git checkout -b neo_branch_name`
- 切换回主分支 `git checkout master`
- 删除分支 `git branch -d delete_branch_name`
- 推送分支至远端 `git push origin to_b_pulled_branch`
	- 本地分支被推送至远端前，对他人<u> 不可见</u>