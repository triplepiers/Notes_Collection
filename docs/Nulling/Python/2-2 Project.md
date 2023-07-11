## 3 Web 应用程序
> 使用 Django 创建 简单的 Web 应用程序

### 3.1 Init

1. 创建并激活虚拟环境
    ```shell
    # 创建名为 ll_venv 的虚拟环境
    python3 -m venv [name]
    # 激活虚拟环境
    source ll_venv/bin/activate
    
    # 退出虚拟环境
    deactivate
	```

2. 安装并创建 Djangle 项目（虚拟环境中）
   
    ```shell
    # 安装 Djangle
    pip3 install django
    # 创建名为 learning_logd 的项目（不要忘记最后的英文句号）
    django-admin startproject learning_log .
	```
	
	项目结构如下：
	
	```text
	- manage.py
	- learning_log
		|_ __init__.py 
		|_ settings.py # 指定如何与系统交互及管理项目
		|_ urls.py     # 指定创建哪些页面以响应请求
		|_ wsgi.py
	```

3. 创建数据库
   
    Djangle 将大部分与项目相关的信息存储在数据库中
    
    ```shell
    # 必须使用 python（而不是 python3）
    # 首次执行 migrate 命令能够确保数据库与项目当前一致
    cd learning_log
    python manage.py migrate
	```

4. 启动项目
    ```shell
    python manage.py runserver
    # 默认运行在 8000 端口，可以用 Ctrl C 强行关闭
    # 也可以使用 python manage.py runserver [port] 指定端口运行
	```

5. 创建应用程序
   
    > 每次对单个应用进行修改都应该遵循以下顺序：
    > 
    > 修改 `models.py` -> 调用 `makemigrations` -> 使用 `migrate` 进行迁移
   
    Django 项目由一系列应用程序构成
    
    ```shell
    python manage.py startapp [app_name]
    # 这一命令会产生一个名为 app_name 的文件夹，包含 models.py, admin.py, views.py
	```
	
	- 定义模型
	  
	    模型用于告诉 Django 如何处理应用程序中的数据（类似于 Schema）
	    
	    在代码层面，模型就是一个 Class，包含属性和方法
	  
	    ```python
	    # @ models.py
	    from django.db import models
	    
	    # 用于存储学习主题的模型 (继承自 Model)
	    class Topic(models.Model):
		    # 其他字段类型见 Django Model File Reference
		    text = models.CharField(max_length=20)
		    # 自动设置当前日期时间作为 date_added
		    date_added = model.DateTimeField(auto_now_add=True)
		    
		    # 模型的简单表示（类似于 print 的默认结果？）
		    def __str__(self):
			    # 此处直接返回 text 表示该模型实例
			    return self.text
		```
	  
	- 激活模型
	  
		1. 只有在 `settings.py` 中被包含的模型才可以正常使用
		
			自定义应用排在默认应用前起到 **覆盖默认行为** 的作用
		
			```python
			# @ settings.py
			INSTALLED_APPS = [
				# 自定义应用
				'app_name',
				# 默认应用
				'django.admin',
				'django.auth',
				...
			]
			```

		1. 让 Django 修改数据库，使之能够存储与 Topic 相关的信息
		    ```shell
		    # 输出一个 0001_initial.py 文件，用于创建 Topic 相关的表
		    python manage.py makemigrations app_name
		    # 应用迁移
		    python manage.py migrate
			```

### 3.2 Django Admin Site
> 本步骤用于建立后台管理页面，并使用 Topic 模型来添加一些主题

- Django 提供的 Admin Site 让你能够轻松的处理 models（只允许管理员而非普通用户使用）
- 默认通过 `http://127.0.0.1:8000/admin` 进行访问（需要登陆捏）

1. 创建超级用户
   
    ```shell
	$ python manage.py createsuperuser
	Username (leave blank to use 'eric'): [admin_name]    
	Email address: [可以直接回车]
	Password: [可以直接回车]
	Passwrod (again): [可以直接回车]
	```

2. 向管理网站注册模型
   
    Django 自动在后台网页中添加了一些模型（如 User / Group），但我们必须手动注册自定义模型
    
    ```python
    # @ admin.py
    from django.contrib import admin
    
    # 注册自定义模型
    from .models import Topic # . 表示在同级目录下寻找 models.py
    admin.site.register(Topic)
	```

3. 添加 Topic
   
    单击 Topics 进入主题页面，进一步单击 Add，输入文本后点击 Save 即可

---

1. 定义 Entry 模型
   
    多个 Entry 可以对应同一 Topic
    
    ```python
    # @ models.py
    
    # 用于记录 Topic 下的具体条目
    class Entry(models.Model):
	    # 当 topic 删除时进行级联删除
	    topic = models.ForeinKey(Topic, on_delete=models.CASCADE)
	    # 长度不受限制
	    text = models.TextField()
	    date_added = models.DateTimeField(auto_now_add=True)
	    
	    # 有必要时，使用 Entries（而非 Entrys）表示多个条目信息
	    class Meta:
		    verbose_name_plural = 'entries'
		    
		def __str__(self):
			# 返回前 50 个字符
			return f"{self.text[:50]}..."
	```

2. 迁移并注册
   
    ```shell
    python manage.py makemigrations app_name
    python manage.py migrate
	```
	```python
	# @ admin.py
	from .models import Entry
	admin.site.register(Entry)
	```

---

使用 Django Shell 查看数据：

```shell
python manage.py shell
```
```python
from app_name.models import Topic
# 获取所有的 Topic 实例，返回一个 List
topics = Topic.objects.all() 
# 遍历列表
for topic in topics:
	print(topic.id, topic)
# 通过 id 获取指定对象并查看属性
t = Topic.objects.get(id=1)
# 访问具体属性
t.text
t.date_added
# 获取以其作为外间的所有 entry
t.entry_set.all()
```

??? info "通过外键关系获取数据"
    基本格式： `被引用实例.引用类_set.all()`

### 3.3 创建主页

#### 3.3.1 映射 URL
> 描述了如何匹配浏览器请求与返回的页面

此处，我们将默认路径 `http://localhost:8000/` 映射到“学习笔记”主页

1. 打开 `/learn_log/urls.py`，做如下修改：
    ```python
    from django.contrib import admin # 支持在后台中请求所有 url
	from django.urls import path, inclue # 导入 include

	urlpatterns = [
		path('admin/', admin.site.urls),
		# 添加，"" 表示根路径
		path(""., include('learnings.urls')),
	]
	```

2. 在 `/learnings` 下新建该模块的 `urls.py` 文件
   - `path("匹配路径", 需要调用的 views.py 中的函数, "本模式名称")`
     
       「模式名称」使得我们可以在代码的其他位置使用 name 而非 URL 引用这个映射关系
   
	```python
	# @ /learnings/urls.py 定义 learnings 模块下的 url 模式
	from django.urls import path # 用于将 url 映射 view
	from . import views # 从当前文件夹引入 veiws.py
	
	app_name = "learnings"
	urlpatterns = [
		# 主页
		path("", views.index, name='index')
	]
	```

#### 3.3.2 编写视图
> 「视图函数」接受请求中的信息，准备生成页面所需的数据，并将其返回给浏览器

```python
# @ /learnings/views.py
from django.shortcuts inport render

# 创建视图
def index(request):
	return render(request, 'learnings/index.html')
```

#### 3.3.3 编写模版
> 模版可以访问视图中的任何数据

1. 新建路径 `learnings/templates/learnings`
   > 什么迷幻套娃
   
2. 在新建路径中创建 `index.html`
    ```html
    # @ /learnings/templates/learnings/index.html
    
    <h1>Hello，欢迎查看学习笔</h1>
	```

### 3.4 创建更多页面

#### 3.4.1 模版继承
> 一些通用元素

1. 定义「父模版」
	- 「模版标签」`{%%}`
	- `url namespace:name` 用于生成一个 URL（匹配对应命名空间下的 name 映射模式）
	  
	    此处的命名空间由上文中的 `app_name` 决定
	    
	- 子模版**不需要**定义父模版中预留的 **所有插槽**
	    一对 `{%block name%}{%endblock name%}` 定义的是一个「具名插槽」，在子模版中按照对应 name 声明内容即可嵌入至指定位置
	    
    ```html
    # @ learnings/templates/learnings/base.html
    <a href="{% url 'learnings:index' %}">
	    <h1>学习笔记</h1>
    </a>
    # 前往 Topics 页面（在后面定义）
    <a href="{% url 'learnings:topics' %}">
	    <h1>所有 Topic</h1>
    </a>

    {%block content%}
    # 子模块内容
    {%endblock content%}
	```

2. 定义「子模版」

	- 继承对象必须在 **首行** 用 `extends` 指出
   
    ```html
    # @ learnings/templates/learnings/index.html
    
    # 继承父模块
    {% extends 'learnings/base.html' %}
    
    # 定义插槽 content 的内容
    {% block content %}
    <p>
	    Hello，这里是 INDEX 界面捏！
    </p>
    {% endblock content%}
	```

#### 3.4.2 用于显示所有 Topic 的页面

1. 在 `learnings/urls.py` 中添加新的 URL
    ```python
    # 用于显示所有 Topic 的页面
    #（其实已经是二级路径了，只不过前面是空的）
    path('topics/', views.topics, name='topics')
	```

2. 创建对应的视图函数
    ```python
    # @ learnings/views.spy

	# 需要用到 Topic 模型
	from .models import Topic

    def topics(request):
	    # 获取数据库中的所有 topic 实例
	    topics = Topic.objects.order_by('date_added')
	    context = {'topics': topics}
	    # 额外传递 context 数据
	    return render(request, 'learnings/topics.html', context)
	```

3. 编写模版
    ```html
    # @ learnings/templates/learnings/topics/html
    
    # 继承
    {% extends 'learnings/base.html' %}
    
    # 插槽 content 内容
    {% block content %}
    <h2>TOPICS are as follows:</h2>
    <ul>
	    # 访问的是 context 字典中的 topics 分量
	    {% for t in topics %}
		    <li>
			    # topic 的详情界面
			    <a href="{% url 'learnings:topic' t.id %}">
				    {{ t }}
			    </a>
		    </li> # 显示 __str__ 的返回值
		{% empty %} # topics 数组为空的情景
			<li>Sorry, 尚未添加任何 Topic</li>
	    {% endfor %}
    </ul>
    {% endblock content %}
	```

#### 3.4.3 用于显示单个 Topic  下所有 Entry 的页面

1. 新增 URL
    ```python
    # 后面的参数是 topic 实例对应的 id
    path("topics/<int:topic_id>/", views.topic, name='topic')
	```

2. 新增视图
    ```python
    def topic(request, topic_id):
	    # 根据 topic_id 获取所有下辖 entry
	    topic = Topic.object.get(id=topic_id)
	    entries = topic.entry_set.order_by('-date_added')
	    context = {
		    'topic': topic,
		    'entries': entries
	    }
	    return render(request, 'learnings/topic.html', context)
	```

3. 新增模版
   - `|` 表示「模版过滤器」=> 实际输出的是竖线后的内容
	   - `date:'M d, Y H:i'` 用于显示形如 `Januart 1,2018 23:00` 的时间戳
	   - `linebreaks` 用于显示完整内容（而不是 `__str__` 返回的前 50 字）
    ```html
    # learnings/templates/learnings/topic.html
    # 省略继承和插槽定义
    
    <h2>话题 {{ topic }} 中的所有 Entry 如下：</h2>
    <ul>
	    {% for e in entries %}
	    <li>
		    <p>{{ e.date_added|date:'M d, Y H:i' }}</p>
		    <p>{{ e.text|linebreaks }}</p>
	    </li>
	    {% empty %}
	    <li>暂时还没有 entry 捏</li>
	    {% endfor %}
    </ul>
	```

### 3.4 用户管理

#### 3.4.1 支持添加 Topic
> 需要导入包含表单的模块 `forms.py`

1. 用于新建 Topic 的表单
    ```python
	# @ learnings/form.py
	from django import forms
	from .models import Topic
	
	# TopicForm 是用于新建 Topic 的表单
	class TopicFrom(froms.ModelForm):
		class Meta:
			model = Topic
			fields = ['text']
			labels = { 'text': ''} # 不为字段 text 生成标签
	```

2. 新增 URL
    ```python
    path('new_topic', views.new_topic, name='new_topic')
	```

3. 创建视图函数
   
    需要处理两种情况：刚进入页面（空表单）/ 提交表单（重定向至 topics 页面）
    
    前者发送 GET 请求，而后者发送 POST 请求，可以通过 `request.method` 进行区分
    
    - `is_valid()` 用于验证用户填写了所有 **必填字段**，且输入与要求的字段类型一致
    - `save()` 用于将指定的表单内容保存至数据库
   
    ```python
    from django,shortcuts import redirect
    from .forms import TopicForm
    
    def new_topic(request):
	    if request.method != 'POST':
		    # 未提交，新建空表单
		    form = TopicForm()
		else:
			# 处理提交的数据
			form = TopicForm(data=request.POST)
			if form.is_valid():
				form.save()
				return redirect('learnings:topics')
		
		# 显示空表单 / 指出数据无效
		context = {'form': form}
		return render(request, 'learnings/new_topic.html', context)
	```

4. 创建新的模版

	- action 指出该表单将发送给 view 中的 `new_topic()`
	- `{% csrf token %}` 用于防范跨站点请求伪造攻击
	- `{{ form.as_p }}` 用于自动创建表单所需的全部字段
	  
	    `as_p` 表示以段落格式渲染所有的表单元素
	    
	    但 Django 不会自动创建提交按钮
   
    ```html
    <h2>Add a new Topic:</h2>
    <form action="{% url 'learnings:new_topic' %}" method='post'>
	    {% csrf_token %}
	    {{ form.as_p }}
	    <button name='submit'>Add Topic</button>
    </form>
	```

5. 将 topics 界面连接到 new_topic 界面
    ```html
    <a href="{% url 'learnings:new_topic' %}">
	    Add Topic
    </a>
	```

#### 3.4.2 支持添加新的 Entry

1. 创建表单 EntryForm
    ```python
	class EntryForm(forms.ModelForm):
		class Meat:
			model = Entry
			fields = ['text']
			labels = { 'text': 'Entry:'} # 指定 Label
			# widget 是一个 HTML 元素，这里定值了宽 80 列的文本区域（默认 40 列）
			widget = {
				'text': forms.Textarea(attrs={'cols':80})
			}
	```

2. 添加 URL `new_entry`
 ```python
 # 通过 topic_id 绑定对应的 topic
 path('new_entry/<int:topic_id>', view.new_entry, name='new_entry')
 ```

3. 添加视图函数
    ```python
    def new_entry(request, topic_id):
	    topic = Topic.objects.get(id=topic_id)
	    
	    if request.method != 'POST':
		    form = EntryForm()
		else:
			form = EntryForm(data=request.POST)
			if form.is_valid():
				# 阻止提交（还没指定 Topic）
				new_entry = form.save(commit=False)
				# 手动指定 Topic
				new_entry.topic = topic
				new_entry.save()
				return redirect('learnings:topic', topic_id=topic_id)
				
		context = {
			'topic': topic,
			'form': form
		}
		return render(request, 'learnings/new_entry.html', context)
	```

4. 编写模版
    ```html
    <p>
	    Add new entry for Topic
	    <a href="{% url 'learnings:topic' topic.id%}">
	     {{ topic }}
	    </a>
    </p>

	<form action="{% url 'learnings:new_entry' topic.id %}" method='post'>
		{% csrf_token %}
		{{ form.as_p }}
		<button name='submit'>Add Entry</button>
	</form>
	```

5. 连接到 topic 详情页面
    ```html
    <a href="{% url 'learnings:new_entry' topic.id %}">
	    Add new Entry
    </a>
	```

#### 3.4.3 支持编辑 Entry

1. 新增 URL
    ```python
	path('edit_entry/<int:entry_id>', views.edit_entry, name='edit_entry')
	```

2. 视图函数
    ```python
	def edit_entry(request, entry_id):
		entry = Entry.objects.get(id=entry_id)
		topic = entry.topic
		
		if request.method != 'POST':
			# 读取旧实例信息
			form = EntryForm(instance=entry)
		else:
			# 用同一个实例存储新的信息
			form = EntryForm(instance=entry, data=request.POST)
			if form.is_valid():
				form.save()
				return redirect('learnings:topic', topic_id=topic.id)
		
		context = {
			'entry': entry,
			'topic': topic,
			'form': form
		}
		return render(request, 'learnings/edit_entry.html', context)
	```

3. 模版
    ```html
    <p>
	    Edit entry for Topic
	    <a href="{% url 'learnings:topic' topic.id%}">
	     {{ topic }}
	    </a>
    </p>

	<form action="{% url 'learnings:edit_entry' entry.id %}" method='post'>
		{% csrf_token %}
		{{ form.as_p }}
		<button name='submit'>Save Changes</button>
	</form>
	```

4. 链接到 topic 页面
	```html
	<p>
		<a href="{% url 'learnings:edit_entry' e.id%}">
			Edit
		</a>
	</p>
	```

#### 3.4.4 创建普通账号
> 使用 Django 自带的用户身份验证系统完成，修改 Topic 使其归属于创建者账户

1. 创建新的 app `users`
    ```bash
    python manage.py startapp users
	```
2. 将新 app 包含至项目
    ```python
    # @ settings.py
    INSTALLED_APPS = [
	    ...,
	    'users',
	    ...
    ]
	```
3. 添加新的 URL
    ```python
    # @ urls.py
    urlpatterns = [
	    ...,
	    # 定义的是一级路由
	    path('users/', include('users.urls')),
	    ...
    ]
	```

##### 3.4.4.1 登录页面
1. 定义 URL
   
	- 默认的身份认证 URL 包含了 `login` , `logout`，对应的请求将直接发送给默认视图函数（不用写哩）
   
    ```python
    # @  users/urls.py
    from django.urls import path, include

	app_name = 'users'
	urlpatterns = [
		# 包含默认身份认证
		path('', include('django.contrib.auth.urls'))
	]
	```

2. 编写模版
   
	- 注意三级路径是 `registraion` （不是同名的 `users`）
   
    ```html
    # @ users/templates/registration/login.html
    
    # 继承 learnings 中定义的 base 模版
    {% extends 'learnings/base.html' %}
    
    # 插槽内容
    {% block content %}

		{% if form.errors %}
			<p>用户名或密码错误，请重试</p>
		{% endif %}
		
		<form method='post' action="{% url 'users:login' %}">
			{% csrf_token %}
			{{ form.as_p }}
			<button name='submit'>登录</button>
			# 隐藏元素用于告知 Django 登录成功后的重定向地址（返回 index）
			<input type='hidden' name='next'
			 value='{% url "learnings:index" %}'/>
		</form>

    {% endblock content %}
	```

3. 链接到 base 模版

	- 已登陆情况下不再显示登录入口 —— 用 IF 包裹

	```html
	# @ learnings/templates/learnings/base.html
	{% if user.is_authenticated %}
		<p>Hello, {{ user.username }}</p>
	{% else %}
		<p>
			请
			<a href="{% url 'users:login' %}">
				登录
			</a>
		</p>
	{% endif %}
	```

> 在 Django 的用户认证系统中，**所有页面** 都可以 访问 `user` 变量。其中 `is_authenticated` 是一个 Boolean 类型的属性，用于判断用户是否已经登录

##### 3.4.4.2 注销页面

1. 在 base 模版中添加注销入口
    
    只是在“已登陆”的情况下添加一个超链接
   
    ```html
    # @ learnings/templates/learnings/base.html
	{% if user.is_authenticated %}
		<p>Hello, {{ user.username }}</p>,
		<a href="{% url 'users:logout' %}">
			登出
		</a>
	{% else %}
	```

2. 编写模版（注意名字）
    ```html
	# @ users/templates/registration/logged_out.html
	# 还是继承 base
	
	{% block content %}
	<p>您已成功登出！</p>
	{% endblock content %}
	```

##### 3.4.4.3 注册页面

1. 新建 URL
    ```python
    # 完整地址是 root/users/register
    path('register/', views.register, name='register')
	```
2. 新建视图函数
	```python
	from django.contrib.auth import login
	# 表单用的是自带的
	from django.contrib.auth.forms import UserCreationForm
	
	def register(request):
		if request.method != 'POST':
			form = UserCreationForm()
		else:
			form = UserCreationForm(data=request.POST)
			if form.is_valid():
				new_user = form.save()
				# 自动登录
				login(request, new_user)
				# 重定向至首页
				redirect('learnings:index')
		
		# 显示空表单 / 表单无效
		context = { 'form': form }
		return render(request, 'registration/register.html', context)
	```
3. 创建模版
    ```html
    # @ users/templates/registration/register.html
    # 继承 base

	{% block content %}
	<h2>这是注册页面</h2>
	<form method='post' action="{% url 'users:register' %}">
		{% csrf_token %}
		{{ form.as_p }}
		<button name='submit'>注册</button>
		<input type='hidden' name='next'
		 value='{% url "learnings:index" %}'/>
	</form>
	{% endblock content %}
	```
4. 联系到 base 模版
    
    完善未登录分支的逻辑
    > 好像没办法正确重定向到 index，淦！
    
    ```html
    {% else %}
		<p>
			请
			<a href="{% url 'users:login' %}">
				登录
			</a>
			或
			<a href="{% url 'users:register' %}">
				注册
			</a>
		</p>
	{% endif %}
	```

#### 3.4.4 访问限制

1. 只允许登录用户访问 Topics 页面
   
    使用装饰器 `@login_required` => 不登录直接访问会报 404
    
    ```python
    # @ learnings/views.py
	from django.contrib.auth.decorators import login_required
    # 只是加一个装饰器
    
    @login_required
    def topics(request):
	    return ...
	```

2. 将未登录访问操作重定向至登录页面
    ```python
    # @ settings.py
    LOGIN_URL = 'users:login'
	```

> 理论上除了 登录/注册/主页 以外的所有页面都应该加访问限制的装饰器

#### 3.4.5 关联用户与数据

1. 修改 Topic 模型
    ```python
    # @ learnings/models.py
    from django.contrib.auth.models import User
    
    # 使用外键关联到 owner
    class Topic(models.Model):
	    ...
	    owner = models.ForeignKey(User, on_delete=models.CASCADE)
	    ...
	```

2. 迁移数据库
   
    把现有主题全都关联到 admin（不知道亲妈，开始摆烂）
    
    ```bash
    python3 manage.py makemigrations learnings
    # 下面指定默认绑定的 owner
    >> Select an option: 1 # 直接提供默认值
    >> Please enter the default value now
    >>> 1 # 默认关联到 id=1 的用户
    
    # 执行迁移
    python3 manage.py migrate
	```

3. 仅允许用户访问自己拥有的 Topic

	```python
	# @ learnings/views.py
	def topics(request);
		# 只获取当前用户作为 owner 的主题
		topics = Topic.objects.filter(owner=request.user).order_by('date_added')
		...
	```

4. 保护单个主题页面
   
    目前只做了登录限制，但是记住 topic_id 仍可以越权访问其他用户创建的 topic
    
    ```python
    # @ learnings/views.py
    from django.http import Http404 # 强行 404
    
    @login_required
    def topic(request, topic_id):
	    topic = Topic.objects.get(id=topic_id)
	    # 确认请求来自于 owner
	    if topic.owner != request.user:
		    raise Http404 # 越权会报 PageNotFound
	```

5. 保护 edit_entry
   
    同理，在 `edit_entry` 里判断一下就行

6. 将新建 Topic 关联至当前用户
	```python
	# @ learnings/views.py

	@login_required
	def new_topic(request):
		...
		if form.is_valid():
			# 暂时不提交（还没指定 user）
			new_topic = form.save(commit=False)
			# 手动指定 user
			new_topic.owner = request.user
			new_topic.save()
			...
	```

### 3.5 样式设计
> 使用 `django-bootstrap4` 创建响应式页面

1. 安装 `django-bootstrap4`
    ```bash
    pip install django-bootstrap4
	```
2. 引入
    ```python
    # @ settings
    INSTALLED_APPS = [
	    # mine
	    # third_party
	    'bootstrap4',
	    # default
    ]
	```

#### 3.5.1 修改 base
> 直接推倒重来哩

1. 定一个标题，完善 bootstrap 所需信息
    ```html
    # 加载 bootstrap 提供的模版标签
    {% load bootstrap4 %}
    
    <!doctype html>
    <html lang='en'>
	    <head>
		    <meta charset='utf=8'/>
		    <meta name='viewport' content='width=device-width, initial-scale=1, shrink-to-fit=no'/>
		    <title>我的学习笔记</title>
		    
		    {% bootstrap_css %}
		    {% bootstrap_javascript jquery='full' %}
	    </head>
    </html>
	```

2. 定义 navBar
   
    为了移动端适配，这里分三块定义 navBar
   
	```html
	<body>
		<nav class='navbar navbar-expend-md navbar-light bg-light mb-4 border'>
			# 1. 当平时的 Logo 主页链接用的
			<a class='navbar-brand' href="{% url 'learnings:index'%}">
				学习笔记
			</a>
			# 2. 一个折叠菜单
			<button class="navbar-toggler" type="button"
			 data-toggle="collapse" data-target="#navbarCollapse"
			 aria-controls="navbarCollapse" aria-expend="false"
			 aria-label="Toggle navigation"
			 >
				<span class="navbar-toggler-icon"></span>
			</button>
			# 3. 菜单选项(们)
			<div class="collapse navbar-collapse" id="navbarCollapse">
				<ul class="navbar-nav mr-auto">
					<li class="nav-item">
						<a class="nav-link" href="{% url 'learnings:topics' %}">
							全部主题
						</a>
					</li>
				</ul>
			</div>
			# 4. 登录相关的组件
			<ul class="navbar-nav ml-auto">
				{% if user.is_authenticated %}
					<li class="nav-item">
						<span class="navbar-text">Hello, {{ user.username }}.</span>
					</li>
					<li class="nav-item">
						<a class="navbar-link" href="{% url 'users:logout' %}">登出</a>
					</li>
				{% else %}
					<li class="nav-item">
						<a class="navbar-link" href="{% url 'users:register' %}">注册</a>
					</li>
					<li class="nav-item">
						<a class="navbar-link" href="{% url 'users:login' %}">登录</a>
					</li>
				{% endif%}
			</ul>
		</nav>
	</body>
	```

3. 定义 content 部分的样式
    ```html
    <main role="main" class="container">
		# 这个地方放 header
		<div class="pb-2 mb-2 border-bottom">
			{% block page_header %}
			{% endblock page_header %}
		</div>
	    <div class="pb-2 mb-2 border-bottom">
		    {% block content %}
		    {% endblock content %}
	    </div>
    </main>
	```

#### 3.5.2 修改 index
> 使用 `jumbotron` 元素修改主页样式（给一些操作提示）

```html
# 继承

{% block page_header %}
	<div class="jumbotron">
		<h1 class="display-3">
			记录你的学习过程
		</h1>
		<p class="lead">
			Make your owen Learning Log, and keetp a list of the topics you're learning about. Whenever you learn something new about a topic, make an entry summarizing what you've learned.
		</p>
		<a class="btn btn-lg btn-primary" href="{% url 'users:register' %}">
			霍霍，快来注册啊！&raquo;
		</a>
	</div>
{% endblock page_header %}
```

#### 3.5.3 修改 login
```html
# 继承

{% load bootstrap4 %}

{% block page_header %}
<h2>登录到你的账户</h2>
{% endblock page_header %}

{% block content %}
<form method='post' action="{% url 'users:login' %}" class="form">
{% csrf_token %}
{% bootstrap_form form %}
{% buttons %}
<button name='submit'>登录</button>
{% endbuttons%}

<input type='hidden' name='next'
value='{% url "learnings:index" %}'/>
</form>
{% endblock content %}
```

#### 3.5.4 修改 topics
```html
# 继承

{% block page_header %}
<h1>主题列表</h1>
{% endblock page_header %}

{% block content %}
<ul>
	{% for t in topics %}
		<li>
			<h3>
				<a href="{% url 'learnings:topic' t.id%}">{{ t }}</a>
			</h3>
		</li>
	{% empty %}
		<li>
			<h3>
				暂未添加任何主题捏
			</h3>
		</li>
	{% endfor %}
</ul>

<h3>
	<a href="{% url 'learnings:new_topic' %}">新增主题</a>
</h3>
{% endblock content %}
```

#### 3.5.5 修改 topic
```html
# 继承

{% block page_header %}
<h1>主题：{{ topic }}</h1>
{% endblock page_header %}

{% block content %}
<p>
	<a href="{% url 'learnings:new_entry' topic.id%}">新建条目</a>
</p>

{% for e in entries %}
	<div class="card mb-3">
		<h4 class="card-header">
			{{ e.date_added|date:'M d, Y H:i' }}
			<small>
				<a href="{% url 'learnings:edit_entry' e.id %}">
					编辑
				</a>
			</small>
		</h4>
		<div class="card-body">
			{{ e.text|linebreaks }}
		</div>
	</div>
{% empty %}
	<p>抱歉，该主题下还没有条目捏</p>
{% endfor %}

</ul>
{% endblock content %}
```

### 3.6 项目部署
> 部署到 `Heroku`，这是一个基于 Web 的平台

1. 注册 Heroku 账号
2. 安装 Heroku CLI
3. 安装依赖
    ```bash
    pip3 install psycopg2===2.7.*
    pip3 install django-heroku
    pip3 install gunicorn
	```
4. 创建文件 `requirements.txt`
    ```bash
    # 使用 pip 生成（告诉 heroku 本项目的依赖）
    pip3 freeze > requirements.txt
    # 部署时，Heroku 将自动安装该文件中列出的依赖，从而建立正常的环境
	```
5. 指定 Python 版本
    ```bash
    # 查看虚拟环境中的 Python 版本
    python --version
	```
	```text
	# @ manage.py 同级目录/runtime.txt
	python-[版本]
	```
6. 修改 `settings.py`
    ```python
    # @ append Heroku 的相关设置
    import django_heroku
    django_heroku.settings(locals())
	```
7. 创建 Procfile
    
    告诉 Heroku 应该启动哪些进程
    
    ```text
    # @ manage.py 同级目录/Procfile
    web: gunicorn learn_log.wsgi --log-file -
    # 使用 learn_log/wsgi.py 中的设置启动应用程序
	```

8. 初始化 Git 仓库
    ```bash
    git init
    git add . # 加入所有文件（除了 ignore 的）
    git commit -am "Ready for deployment to Heroku"
    # 查看状态
    git status
    >> On branch master
    >> nothing to commit, working tree clean
	```

9. 将项目推送至 Heroku
    ```bash
    heroku login
    heroku create # 在 heroku 中创建空项目
    git push heroku master # 推送 master 分支
    # 部署完毕，还没配置
    heroku ps # 查看进程信息
    heroku open # 在浏览器中打开程序（因为没有数据库，所以还不能用）
	```

10. 在 heroku 上建立数据库
	```bash
	# 对于部署内容执行 migrate（复制一下数据库状态）
	heroku run python3 manage.py migrate
	```

11. 在 heroku 中创建 admin
    ```bash
    # heroku run 用于执行单条命令
    heroku run bash # 打开终端会话
    python manage.py createsuperuser # 创建超级用户（需要一些 uname / pwd）
    exit # 推出 bash
    >> 然后就可以登录 admin 哩！
	```

12. 创建友好的 URL
    ```bash
    # 重命名应用程序
    heroku apps_rename learning-log
    >> 现在可以用 https://learning-log.herokuapp.com 访问了
	```

13. 关闭调试信息
	```bash
	# @ settings.py
	# heroku 相关设置
	...
	if os.environ.get('DEBUG') == 'TRUE':
		DEBUG = True
	elif os.environ.get('DEBUG') == 'FALSE':
		DEBUG = False
	```

14. 提交并推送修改
    ```bash
    # 提交对于 settings.py 的修改
    git commit -am "Set DEBUG based on environment variables."
    git push heroku master
	```

15. 在 heroku 上设置环境变量（不然上面的限制就没有意义了）
	```bash
	heroku config:set DEBUD=FALSE
	```

16. 从 heroku 删除项目
    
    可以直接登录 heroku 进行删除，也可以使用 bash 命令
    
    ```bash
    heroku apps:destroy --app [appname]
	```

#### 自定义错误页面

1. 创建模版
    ```html
    # @ learn_log/templates/404.html
    # 继承 base
	{% block content %}
	<h2>这个界面无法访问捏</h2>
	{% endblock content%}
	```
	```html
	# @ learn_log/templates/500.html
    # 继承 base
	{% block content %}
	<h2>有一些内部错误</h2>
	{% endblock content%}
	```
2. 修改 `settings.py`
    ```python
	TEMPLATES = [
		{
			'BACKEND': ...,
			# 在根路径的 templates 下查找错误页面模版
			'DIRS': [os.path.join(BASE_DIR, 'templates')],
		},
		...
	]
	```

---

!!! info "用户试图用 id 访问不存在的 topic / entry 将导致 500 错误（因为没有足够的信息）"

事实上，将其视为 404 错误会更加合理

=> 我们使用 `get_object_or_404` 来解决

```python
from django.shortcuts import get_object_or_404
def topic(request, topic_id):
	# 找不到就马上报 404 错误
	topic = get_object_or_404(Topic, id=topic_id)
```