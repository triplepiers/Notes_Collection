## 1 外星人入侵（游戏）
> 使用 Pygame 开发的 2D 游戏

!!! warning "游戏部分鸽掉了，大家自己去看吧orz"

安装 Pygame
```bash
python3 -m pip install --user pygame
```

### 1.1 Init

#### 创建设置类

```python
# @ setting.py
class Settings:
	def __init__(self):
		# 初始化游戏设置
		self.screen_width = 1200
		self.screen_height = 800
		# 窗体背景色
		self.bg_color = (230,230,230)
```

#### 创建窗口并响应用户输入

```python
# @ alien_invasion.py
import sys
import pygame
from setting import Settings

# 管理游戏资源与行为的类
class AlienInvasion:
	def __init__(self):
		# 初始化游戏并创建游戏资源
		pygame.init()
		# 使用 settings 实例保存配置信息
		self.settings = Settings()
		
		# 设置 1200px * 800px 的窗口（返回值是一个 Surface）每次循环后将自动重绘
		self.screen = pygame.display.set_mode(
			(self.settings.screen_width, self.settings.screen_height))
		# 设置标题
		pygame.display.set_capytion('Alien Invasion')

	def run_game(self):
		# 开始主循环
		while True:
			# 监听鼠标及键盘事件
			for event in pygame.event.get():
				if event.type == pygame.QUIT:
					sys.exit()
			# 绘制指定背景色（默认为黑色）
			self.screen.fill(self.settings.bg_color)
			# 重新绘制
			pygame.display.flip()

if __name__ == '__main__':
	# 创建实例并运行游戏
	g = AlienInvation()
	g.run_game()
```

### 1.2 Ship 类
> 图像请放在根目录的 `images` 文件夹下

!!! info "`pygame` 将所有元素都视为「矩形」以进行定位 / 碰撞计算"

```python
import pygame

class Ship:
	def __init__(self, game):
		# 设置初始位置
		self.screen = game.screen
		self.screen.rect = game.screen.get_rect()
		# 加载图片并获取外接矩形
		self.image = pygame.image.load('images/ship.bmp')
		self.rect = self.image.get_rect()
		# 置于底边中央
		self.rect.midbottom = self.screen_rect.midbottom
		
	def blitme(self):
		# 在指定位置绘制 ship
		self.screen.blit(self.image, self,rect)
```

## 2 数据可视化

### 2.1 Matplotlib 使用

#### 2.1.1 基本使用

> - 我们使用 Matplotlib 数学绘图库进行简单的图表绘制
> - 同时使用 Plotly 包生成自动适应设备大小的图表

1. 安装 Matplotlib 
    ```bash
    python -m pip install --user matplotlib
	```
2. 绘制简单的折线图
    ```python
	import matplotlib.pyplot as plt

	squares = [1, 4, 9, 16, 25]
	fig, ax = plt.subplots() # fig 表示整张图，ax 表示各子表
	ax.plot(squares) # 尝试以有意义的形式绘制给定数据
	# 我们可以通过以下形式指定线条粗细
	ax.plot(squares, linewidth=3)
	# 单独指定 y 坐标将默认以「自然数」作为 x 坐标，下面指定 x 坐标
	input_values = [1, 2, 3, 4, 5]
	ax.plot(input_values, squares, linewidth=3)

	# 设置标题并添加坐标轴标签
	ax.set_title('平方数', fontsize=24)
	ax.set_xlabel('值', fontsize=14)
	ax.set_ylabel('值的平方', fontsize=14)

	# 设置刻度标记大小
	ax.tick_params(axis='both', labelsize=14)

	plt.show() # 显示绘制结果
	```
3. 绘制简单散点图
    ```python
    import matplotlib.pyplot as plt

	plt.style.use('seaborn') # 使用内置样式
	fig, ax = plt.subplots()

	# 手动指定数据
	x_values = [1,2,3,4,5]
	y_values = [1,4,9,16,25]

	# 自动计算数据
	x_values = range(1,1001)
	y_values = [x**2 for x in x_values]

	ax.scatter(x_values, y_values, s=200) # s 指定了点的大小

	# 设置标题和坐标轴
	ax.set_title('平方数', fontsize=24)
	ax.set_xlabel('值', fontsize=14)
	ax.set_ylabel('值的平方', fontsize=14)
	# 设置坐标轴刻度大小
	ax.tick_params(axis='both', which='major', labelsize=14)
	# 设置坐标轴取值范围
	ax.axis([0, 1100, 0, 1100000]) # x_min, x_max, y_min, y_max

	plt.show()
	```
4. 自动保存图表
   
     将 `plt.show()` 替换为  `plt.savefig()`
     
    ```python
    filename = 'quare_box.png'
    figtype = 'tight' # 裁剪空白区域（不剪的话可以省略参数）
    
	plt.savefig(filename, bbox_inches=figtype)
	```

#### 2.1.2 自定义样式

1. 使用内置样式
	- 使用如下命令查看可用的内置样式
	     ```python
	     import matplotliB.pyplot as plt
	     plt.stytle.available
	     # 会显示由可用样式构成的 List
		```
	- 通过语句 `plt.style.use('styleName')` 使用内置样式（在 `fig, ax = plt.subplots()` **前** 使用）
2. 修改散点颜色
	- 通过字符串指定数据 `ax.scatter(xVals, yVals, c='red')`
	- 通过 RGB 指定颜色 `ax.scattrt(xVals, yVals, c=(0,0.8,0))`
3. 使用「颜色映射」
	- 「颜色映射」是 *一系列颜色*，从起始渐变至结束
	- `pyplot` 内置了一组颜色映射，可以通过如下方式指定
		```python
		ax.scatter(xVals, yVals, c=yVals, cmap=plt.cm.Blues, s=10)
		# 我们使用 y 值列表指定每个点的颜色
		# 使用 cmap 指定了使用的颜色映射
		# => 较小的点将用浅蓝，较大的点将用深蓝
		```

#### 2.1.3 随机漫步模拟

1. 创建 RandomWalk 类，用于随机选择前进方向
    ```python
    # @ranmdom_walk.py
    from random import choice

	class RandomWalk:
		def __init__(self, num_points=5000):
			self.num_points = num_points # 初始化总步数
			# 记录从 (0,0) 开始经过的每一步的坐标
			self.x_values = [0]
			self.y_values = [0]

		# 决定每次前进的方向，并生成位置坐标
		def fill_walk(self):
			# 共计生成 num_points 个点
			while len(self.x_values) < self.num_points:
				# x 方向（仅左右）
				x_direction = choice([1, -1])
				x_distance = choice([0,1,2,3,4])
				x_step = x_direction * x_distance
				# y 方向
				y_direction = choice([1, -1])
				y_distance = choice([0,1,2,3,4])
				y_step = y_direction * y_distance
				# 拒绝原地踏步
				if x_step == 0 and y_step == 0:
					continue
				# 保存当前值
				x = self.x_values[-1] + x_step
				y = self.y_values[-1] + y_step
				self.x_values.append(x)
				self.y_values.append(y)
	```
2. 绘制随机漫步图
    ```python
    import matplotlib.pyplot as plt
	from random_walk import RandomWalk

	# 只要程序处于活动状态就不断模拟随机漫步
	while True:
		# 创建一个 RandomWalk 实例
		rw = RandomWalk()
		rw.fill_walk()
		# 绘制所有的点
		plt.style.use('classic')
		# 调整尺寸以适应屏幕 -> 默认 dpi=100
		fig, ax = plt.subplots(figsize=(15,9), dpi=128)
		# 给点着色(显示先后顺序)
		point_numbers = range(rw.num_points)
		ax.scatter(rw.x_values, rw.y_values, 
			c=point_numbers, cmap=plt.cm.Blues,
			edgecolors='none', s=15)
		# 突出起止位置
		ax.scatter(0, 0, c='green', edgecolor='none', s=100)
		ax.scatter(rw.x_values[-1], rw.y_values[-1], c='red', edgecolor='none', s=100)
		# 隐藏坐标轴
		ax.get_xaxis().set_visible(False)
		ax.get_yaxis().set_visible(False)
		plt.show()
		# 至少来一遍
		keep_running = input("Make another walk? (y/n)")
		if keep_running == 'n':
			break
	```

### 2.2 使用 Plotly 模拟掷骰子
> Plotly 可用于生成交互式图表：
> 
> - 生成结果将自动缩放以使用使用者的屏幕
> - 当鼠标指向特定元素时，将突出显示该元素的信息

可以使用以下命令进行安装：

```shell
python3 -m pip install --user plotly
```

---

1. 创建 Die 类
    ```python
    # 用于模拟掷骰子 @ die.py
    from random import randint
    
    class Die:
	    def __init__(self, num_sides=6):
		    # 默认骰子有六面
		    self.num_sides = num_sides
		    
		def roll(self):
			return randint(1, self.num_sides)
	```
2. 掷骰子
    ```python
    from die import Die
    
    die = Die()
    # 投掷结果存储在 List 中
    results = []
    for roll_num in range(100):
	    result = die.roll()
	    results.append(result)
	    
	# 分析投掷结果
	frequencies = []
	for value in range(1, die.num_sides):
		frequency = results.count(value)
		frequencies.append(frequency)
	```
3. 绘制直方图
    ```python
    from plotly.graph_objs import Bar, Layout
    from plotly import offline
    
    x_values = list(range(1, die.num_sides))
    data = [Bar(x=x_values, y=frequencies)] # 数据集可能包含多个元素
    
    x_axis_config = {'title': 'result'}
    y_axis_config = {'title': 'frequncy'}
    
    my_layout = Layout(title='Roll 1000 times',
		xaxis=x_axis_config, yaxis=y_axis_config)
		
	offline.plot({
		'data': data,
		'layout': my_layout
	}, filename='res.html') # 结果保存在同目录下的 res.html 中
	```

### 2.3 可视化 CSV / JSON 文件
> 本节的依赖文件可在 [该网址](http://ituring.cn/book/2784) 找到

#### 2.3.1 CSV 文件

1. 分析 CSV 文件头
    ```python
    import csv
    
    filename = 'path/to/csv/file'
    with open(filename) as f:
	    reader = csv.reader(f)
	    header_row = next(reader)
	    print(header_row)
	```
	- 输出为 `['STATION', 'NAME', 'DATE', 'PRCP', 'TAVG', 'TMAX', 'TMIN']` 
	  
	    => 每一个可能出现的字段名及其顺序

	- reader 会将第一行的元素存储在 List 中

2. 打印文件头及其位置
    ```python
    # 输出格式形如：0 STATION => 字段名对应的列号
	for index, column_header in enumerate(header_row):
		print(index, column_header)
	```

3. 提取并读取数据
    ```python
	# 提取最高温度
	highs = []
	# 遍历除 header 外的每一行
	for row in reader:
		high = int(row[5]) # TMAX 存在 row_5
		highs.append(high)
	```

4. 绘制最高温度折线图
	```python
	import matplotlib.pyplot as plt
	
	plt.style.use('seaborn')
	fig, ax = plt.subplots()
	ax.plot(highs, c='red')
	# 设置样式
	ax.set_title('2018.07 每日最高温度', fontsize=24)
	ax.set_xlabel('', fontsize=16)
	ax.set_ylabel('温度(F)', fontsize=16)
	ax.tick_params(axis='both', which='major', labelsize=16)
	
	plt.show()
	```

5. 使用 datetime 模块添加日期
	- 我们可以使用 `datetime.strptime('2018-07-01', '%Y-%m-%d')` 将字符串以指定格式解析为对应的日期对象
	- 格式字符串支持的参数如下：
	  
	    | 实参 | 含义                    |
	    |:----:|:----------------------- |
	    | `%A` | 星期几，如 Monday       |
	    | `%B` | 几月份，如 January      |
	    | `%m` | 数字表示的月份，01 - 12 |
	    | `%d` | 数字表示的日期，01 - 31 |
	    | `%Y` | **四位数**年份，如 2001 |
	    | `%y` | **两位数**年份，如 19   |
	    | `%H` | 24H 小时数，00 - 23     |
	    | `%I` | 12H 小时数，01 - 12     |
	    | `%p` | am / pm                 |
	    | `%M` | 分钟，00 - 59           |
	    | `%S` | 秒数，00 - 61           |

6. 在图表中添加日期
    ```python
    from datetime import datetime
    
    # 从文件中获取日期（合并到同一个 Loop 中）
    dates = []
    for row in reader:
	    current_date = datetime.sprttime(row[2], '%Y-%m-%d')
	    dates.append(current_date)
	    
	# 为图表添加横轴数据源
	ax.plot(dates, highs, c='red')
	
	# 绘制倾斜的日期标签以避免重叠
	fig.sutofmt_xdate()
	```

7. 绘制两个数据序列，并给区间着色
    ```python
    # 同时显示 最高/最低 温度 -> 只写绘制部分的代码
	fig, ax = plt.subplots()
	ax.plot(dates, highs, c='red', alpha=0.5)
	ax.plot(dates. lows, c='blue', alpha=0.5)
	# 使用 fill_between() 填补中间的空间
	ax.fill_between(dates, highs, lows, facecolor='blue', alpha=0.1)
	```

8. 错误检查
   
	使用不存在的字段名可能导致程序崩溃，需要妥善处理
	
	```python
	filename = 'path/to/csv/file'
	with open(filename) as f:
		for row in reader:
			date = datetime.strptime(row[2], '%Y-%m-%d')
			try:
				# 为空('')时会报错
				high = int(row[4])
				low = int(row[5])
			except ValueError:
				# 忽略数据缺失的日期（没有 append 进去）
				print(f'Missing data for {date}')
			else:
				dates.append(date)
				highs.append(high)
				lows.append(low)
	```

#### 2.3.2 JSON 文件

1. 查看 JSON 数据
   
    据说直接看源文件不太友好，我们重新把它写进一个新文件
    
    ```python
    import json
    
    filename = 'path/to/json/file'
    with open(filename) as f:
	    all_data = json.load(f) # 结果是一个巨大的 Dict
	
	readable_file = 'readable_data.json'
	with open(readable_file, 'w') as f:
		json.dump(all_data, f, indent=4) # 指定缩进四格
	```

2. 提取详细信息
    ```python
    import json
    
    # 详细数据存储在第一级的 features 字段下（是一个 List）
    filename = "path/to/json/file"
    with open(filename) as f:
	    all_data = json.load(f)

	eq_dicts = all_data['features']

	# 提取震级 & 位置信息
	mags, titles, lons, lats = [], [], [], []
	for eq in eq_dicts:
		mag = eq_dict['properties']['mag']
		title = eq_dict['properties']['title']
		lon = eq_dict['geometry']['coordinates'][0]
		lat = eq_dict['geometry']['coordinates'][1]
		
		mags.append(mag)
		titles.append(title)
		lons.append(lon)
		lats.append(lat)
	```

3. 绘制震级散点图
    ```python
	import plotly.express as px
	
	fig = px.scatter(
		x = lons,
		y = lats,
		labels = {'x': '维度', 'y': '经度'},
		range_x = [-200, 200],
		range_y = [-90, 90],
		width=800,
		height=800,
		title='全球地震散点图'
	)
	# 另一种指定数据的方式（使用 pandas）
	import pandas as pd
	# 需要建立 DataFrame
	data = pd.DataFrame(
		data=zip(lons, lats, titles, mags), columns=['经度','维度','位置','震级']
	)
	fig = px.scatter(
		# 导入数据包后，直接使用字段名指定数据源
		data,
		x='经度',
		y='维度',
		...,
		# 定制标记尺寸
		size='震级',
		size_max=10,
		# 定制标记严责（默认 蓝-红-黄）
		color='震级',
		# 添加 hover 文本
		hover_name='位置'
	)
	
	fig.write_html('global_eq.html')
	fig.show()
	```

4. 查看可用渐变映射方案
   
    ```python
    import plotly.express as px
    
    for key in px.color.named_colorscales:
	    print(key)
	```
	
	- 我们可以使用 `px.colors.diverging.RdYlGn[::-1]` 反转映射列表
	- 除 `px.colors.diverging` 提供的 **连续** 配色方案外，Plotly 还在 `px.colors.sequential . px.colors.qualitative` 中提供了 **离散** 的配色方案

### 2.4 GitHub API 返回结果可视化

1. 使用 API 请求数据

	- 借口地址 `https://api.github.com/search/repositories?q=language:python&sort=stars`
	- 响应格式
	    ```json
	    {
		    "total_count": 3494012,
		    "incomplete_results": false,
		    "items": [
			    {
				    "id": 21289110,
				    "node_id": "fghjklsdfiuyudfsfd==",
				    "name": "awsome-python",
				    "full_name": "vinta/awsome-python",
				    ...
			    }
		    ]
	    }
		```

2. 安装 Requests 以发送请求并检查响应
    ```bash
    python3 -m pip install --user requests
	```

3. 发送请求并处理响应
    ```python
    import requests
    
    #  调用 API 并存储响应
    url = 'https://api.github.com/search/repositories?q=language:python&sort=stars'
    # 设置请求头
    headers = {'Accept': 'application/vnd.github.v3+json'}
    # 获取响应
    r = requests.get(url, headers=headers)
    print(f'Status Code = {r.status_code}')
    # 将结果转为 Dict
    response_dict = r.json()
    # 显示返回值的所有字段
    print(response_dict.keys())
	```

4. 监听 API 的速率限制
	
	 直接访问 `https://api.github.com/rate_limit` 获取相关响应

5. 使用 Plotly 可视化仓库

	- 需求：创建交互式条形图。高度表示该项目的 star 数，单击条形可以进入项目的 GitHub 主页
	- 实现
	    ```python
	    from plotly.graph_obj import Bar
	    from plottly import offline
	    
	    stars, labels, links = [], [], [], []
	    for repo in repo_dict:
		    # 添加可单击的链接
		    links.append(f"<a href='{repo["html_url"]}'>{reop["name"]}</a>")
		    stars.append(repo['stargazers_count'])
			# 设置 label
			owner = repo['owner']['login']
			desc = repo['description']
			laebl = f"{owener} </br> {description}"
			labels.append(label)
		    
		# 可视化
		data = [{
			'type': 'bar',
			'x': links,
			'y': stars,
			# 设置提示文本
			'hovertext': labels,
			# 定制 Bar 的颜色与边框
			'marker': {
				'color': 'rgb(60, 100, 150)',
				'line': {'width': 1.5, 'color': 'rgb(25,25,25)'}
			},
			# Bar 的不透明度
			'opacity': 0.6
		}]
		my_layout = {
			'title': 'GitHub 上最受欢迎的 Python 项目',
			'titlefont': {'size':28}
			'xaxis': { 
				'title': 'Repository',
				'titlefont': {'size':24},
				'tickfont': {'size': 14}
			},
			'yaxis': { 
				'title': 'Stars'
				'titlefont': {'size':24},
				'tickfont': {'size': 14}
			}
		}
		fig = {'data': data, 'layout': my_layout}
		offlien.plot(fig, filename='python_repo.html')
		```

