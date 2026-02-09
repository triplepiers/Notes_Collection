# Igem Uploads

> For `Version 0.1.1`，[点此前往GitHub 项目](https://github.com/iGEM-HBUT-China/igem-uploads)。
> 
> `igem-uploads` 包由 HBUT-China 开发，旨在便捷地管理托管在 [ Igem 服务器](https://uploads.igem.org)上的文件。

??? comment "主观评价"
	1. 上传
	   
		   - `Igem` 自身是支持拖动 文件夹/单个文件 进入网页进行 上传的
		     
		     不会创建新的文件夹，而是把所有文件（包括子目录下的）平铺在当前路径下
		     
		   - `igem-uploads` 包会自动创建文件夹（包括子目录下的） => 好耶
		     
		     - 输绝对路径多少有点痛苦面具 orz
		     - 同名覆盖有一些问题：显示上传成功，但文件还是旧的
		     
	1. 删除

		- 清空文件夹好腋！
		- 删单个文件去服务器上手点可能会好一些（可以先预览再删除）

	3. 其他
	   
	    - 放在 `Jupyter` 里用感觉妙妙的（比控制台显示效果更好）
	    - 感觉返回值不太必要（基本都 `print` 出来了，再返回 `list` 感觉有点多余）

## 1 安装与运行

### 1.1 安装

请确保您已安装 `Python` 和 `pip`，随后使用下列命令安装 `igem-uploads`：

```shell
# 安装包
pip install igem-uploads # 或 pip3 install igem-uploads

# 验证安装结果 -> 查看已安装包列表中是否存在 igem-uploads
pip list # 或 pip3 list
```
### 1.2 简单运行

现在您已经成功的安装了 `igem-uploads` ，但可能仍缺少部分依赖 -> 简单验证一下吧！

1. 随便新建一个 `Python` 文件（就叫 `test.py` 好了）
2. 在 `test.py` 中输入以下内容并保存修改：

	```python
	import uploads # 没错只有一行 -> 就尝试导一下包
	```
3. 在命令行中使用指令 `python test.py` 尝试运行文件

	- 若没有输出任何信息，那么恭喜你，可以进入下一步了

	- 若提示 `No module named 'XXX'`，则需要执行 `pip install XXX` 安装必要依赖

		- 若缺少多项依赖，您可能需要重复执行本步

		- 您也可以下载[该文件](https://github.com/iGEM-HBUT-China/igem-uploads/blob/main/requirements.txt)，随后在对应路径下执行 `pip install -r requirements.txt` 进行一步到胃的补全操作（但通常没有必要）

## 2 开始使用

### 2.1 登录 `igem` 账号（必要）

在操作文件前，您必须登录您的 `Igem` 账号（而非 `GitLab` 账号）

```python
import uploads
client = uploads.Session()                     # 创建 Session
client.login('igem_username', 'igem_password') # 登录账号
```

- 输出示例

	1. 成功登录

		```
		Your team: [team-id] [team-name]
		Your role: [team-role]
		```
	
	1. 用户名错误

		```
		UserWarning: That username is not valid.
		```
		
	1. 密码错误

		```
		UserWarning: That username is valid, but the password is not or the emailed password has expired.
		```

### 2.2 开始操作

> 若提示 `'Not logged in, please login first'`，请在开头补一下用户登录

#### 2.2.1 上传

##### 上传单个文件

```python
client.upload('本机待上传文件（绝对）路径')                    # 上传至 根路径
client.upload('本机待上传文件（绝对）路径', '目标路径')         # 显示上传后父路径下的文件列表
client.upload('本机待上传文件（绝对）路径', '目标路径', false)  # 不显示上传后父路径下的文件列表
```
!!! warning "第一个参数是 **绝对** 路径"

- 返回成功上传的文件 URL
- 输出示例

	1. 上传成功

		```
		[待上传文件名] uploaded [上传后的文件 URL]

		# 若第三个参数为 false 则不输出以下内容
		[父路径] found: [文件+子目录总数]
		+----------+-------------------+------------------------------------------------------------+
		|   Type   |        Name       |                    DirectoryKey/FileURL                    |
		+----------+-------------------+------------------------------------------------------------+
		```

	1. 上传失败

		```
		Upload failed [报错信息] # 不太清楚接口返回的啥 orz
		```
		
	1. 第一个参数不是文件

		```
		Invalid file path: [本机待上传文件（绝对）路径]
		```

##### 上传整个文件夹

```python
client.upload_dir('本机待上传（绝对）路径')            # 上传至 根路径
client.upload_dir('本机待上传（绝对）路径', '目标路径') # 上传至 指定路径
```

!!! warning "第一个参数是 **绝对** 路径"

- 返回上传成功后目标路径下所有 文件+目目录构成的 `list`
- **会** 递归创建子目录并上传子目录下的文件
- **不会** 为空路径创建文件夹（其实是 `Igem` 不允许存在空路径 orz）
- 输出实例

	1. 上传“成功”
	   
		```
		# 对每一个待上传文件，显示下列三条提示之一：
		1. [待上传文件名] uploaded [上传后的文件 URL]
		2. Upload failed [报错信息] # 不太清楚接口返回的啥 orz
		3. Invalid file path: [本机待上传文件（绝对）路径]
		```

	 2. 第一个参数不是路径

		```
		Invalid directory path: [本机待上传（绝对）路径]
		```

#### 2.2.2 删除

##### 删除单个文件

```python
client.delete('文件名')                    # 删除 根路径 下的文件
client.delete('文件名', '文件父路径')        # 显示删除后父路径下剩余的文件列表
client.delete('文件名', '文件父路径', false) # 不显示删除后父路径下剩余的文件列表
```

- 输出示例

	1. 删除成功
	
		```
		[文件完整路径] deleted
		# 若第三个参数为 false 则不输出以下内容
		[父路径] found: [文件+子目录总数]
		+----------+-------------------+------------------------------------------------------------+
		|   Type   |        Name       |                    DirectoryKey/FileURL                    |
		+----------+-------------------+------------------------------------------------------------+
		```
	   
	2. 删除失败
	   
		   ```
		   [文件完整路径] deleted failed
		   ```

##### 清空文件夹

```python
client.truncate_dir('目标路径')
```

!!! warning "输入空串 `''` 作为参数将产生类似 `rm -rf*` 的效果"

- 返回清空后目标路径下所有 文件+目目录构成的 `list`
- **会** 递归删除所有子目录（及子目录下的所有文件）
- **不会** 删除作为参数的目录
- 将显示 **完成青空操作后** 目标路径下的 文件+目录 列表（理论上是空的）
 
#### 2.2.3 查询指定路径下的所有文件和目录

```python
client.query('目标路径')
```

- 返回目标路径下所有 文件+目目录构成的 `list`，形如 `[{}, {}, ...]`
- 若需要查询根路径，请输入空串 `''` 作为参数
- **不会** 递归查询子目录中的文件
- 输出示例
	
	```
	[路径] found: [文件+子目录总数]
	+----------+-------------------+------------------------------------------------------------+
	|   Type   |        Name       |                    DirectoryKey/FileURL                    |
	+----------+-------------------+------------------------------------------------------------+
	| File-jpg |    413-1-3.jpg    |    https://static.igem.wiki/teams/4628/wiki/413-1-3.jpg    |
	+----------+-------------------+------------------------------------------------------------+
	```
> 	若显示 `[路径] found: 0` ，您可能需要检查输入路径是否有误