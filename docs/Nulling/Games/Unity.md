# Unity

> Credit to: [Unity 3D 开放世界手游开发教程：从零到精通](https://dongdongbear.github.io/Lighthouse/unity-tutorial/)

## Hello World

### 渲染管线

Unity 提供了三种渲染管线：

1. Built-in: 旧版默认渲染管线
2. ✅ Universal (URP) : 通用渲染管线

	专为跨平台设计（特别是 <u>移动端</u>），且针对移动端 GPU 进行优化

3. High Definition (UDRP): 高清渲染管线（用于高精度要求的 PC 端游戏）

### 创建 C# 脚本

1. 在底栏的 “项目 (Project)” 选项卡中，找到 Assets
2. 新建 `Assets/Scripts` 子路径
3. 进入路径，右键新建 C# Script、命名为 `HelloUnity` (<u>不需要</u> 手动输入后缀)

	Unity 会自动根据文件名生成 ClassName，若重命名文件、则需手动修改脚本内的类名（与 FileName 保持一致）

```c# title="HelloUnity"
using UnityEngine; // 类似 import

// MonoBehaviour 类似于 React 中提供的 Component 基类
public class HelloUnity : MonoBehaviour
{
	// [SerializeField] 标注的私有变量在 Unity 检查器 (Inspector) 中可被编辑
	[SerializeField] private string playerName = "Jane Doe";
  [SerializeField] private float rotationSpeed = 50f;
	[SerializeField] private Color CubeClr = Color.red;

	// 类似于 React 的 componentDidMount，仅在脚本生效后的第一帧执行一次
	void Start()
	{
		// console.log
		Debug.Log($"🎮 Hello Unity! 欢迎, {playerName}!");
		Debug.Log($"当前 Unity 版本: {Application.unityVersion}");
		Debug.Log($"当前平台: {Application.platform}");
		Debug.Log($"屏幕分辨率: {Screen.width} x {Screen.height}");

		// 修改（被挂载）的 GameObject Name
    gameObject.name = $"Player_{playerName}";
		// 修改颜色
		Renderer renderer = GetComponent<Renderer>();
    if (renderer != null)
    {
        renderer.material.color = cubeColor;
    }
	}

	// 固定间隔调用，用于更新世界模型（物体本身）的状态
	void Update()
	{
		// 绕 Y 轴旋转 (⚠️ Time.deltaTime 保证转速与帧率无关)
		transform.Rotate(Vector3.up, rotationSpeed * Time.deltaTime);
		// 类似 EventListener，检测键盘输入
		if (Input.GetKeyDown(KeyCode.Space))
		{
				Debug.Log("空格键被按下");
		}
	}

	// 对象销毁时调用
	void OnDestroy()
	{
			Debug.Log($"👋 {playerName} 离开了游戏世界");
	}
}
```

### 挂载脚本到 GameObject

1. 创建一个 Cube

	在左侧的 “层级 (Hierachy)” 窗口中，右键 3D Object → Cube

2. 点选新建的 Cube，在右侧检查器窗口滑动到底部、点击 Add Component

3. 搜索 `HelloUnity` 以选中刚创建的脚本

### 运行（测试）

点击顶部的 ▶ Play 按钮（或 Cmd + P）：

- Cube 开始旋转
- Console 中打印 init 输出
- 按下空格键，Console 会打印指定的按键消息

!!!warning "Play 模式下对场景做的任何修改都会在退出时丢失（~= 你只修改了静态页面）"

### Git LFS

Unity 项目包含大量二进制文件（纹理、模型、音频、场景文件），需要使用 Git LFS 扩展进行管理

- 安装

	```bash
	brew install git-lfs
	git lfs install       # 全局初始化，只需执行一次
	```

- 项目初始化

	```bash
	cd Path/to/Project
	git init
	git branch -M main # 设置主分支为 main
	# 使用 Github 官方模板
	curl -o .gitignore https://raw.githubusercontent.com/github/gitignore/main/Unity.gitignore 
	```

- 配置 Git LFS 追踪规则：哪些文件类型由 Git LFS 追踪管理

	```txt title=".gitattributes"
	# 3D 模型文件
	*.fbx filter=lfs diff=lfs merge=lfs -text
	*.obj filter=lfs diff=lfs merge=lfs -text
	*.blend filter=lfs diff=lfs merge=lfs -text
	*.dae filter=lfs diff=lfs merge=lfs -text
	*.3ds filter=lfs diff=lfs merge=lfs -text

	# 纹理和图片
	*.png filter=lfs diff=lfs merge=lfs -text
	*.jpg filter=lfs diff=lfs merge=lfs -text
	*.jpeg filter=lfs diff=lfs merge=lfs -text
	*.psd filter=lfs diff=lfs merge=lfs -text
	*.tga filter=lfs diff=lfs merge=lfs -text
	*.tif filter=lfs diff=lfs merge=lfs -text
	*.tiff filter=lfs diff=lfs merge=lfs -text
	*.exr filter=lfs diff=lfs merge=lfs -text
	*.hdr filter=lfs diff=lfs merge=lfs -text

	# 音频
	*.mp3 filter=lfs diff=lfs merge=lfs -text
	*.wav filter=lfs diff=lfs merge=lfs -text
	*.ogg filter=lfs diff=lfs merge=lfs -text
	*.aif filter=lfs diff=lfs merge=lfs -text

	# 视频
	*.mp4 filter=lfs diff=lfs merge=lfs -text
	*.mov filter=lfs diff=lfs merge=lfs -text

	# Unity 特有的大文件
	*.unitypackage filter=lfs diff=lfs merge=lfs -text
	*.asset filter=lfs diff=lfs merge=lfs -text

	# 字体
	*.ttf filter=lfs diff=lfs merge=lfs -text
	*.otf filter=lfs diff=lfs merge=lfs -text

	# 压缩文件
	*.zip filter=lfs diff=lfs merge=lfs -text
	*.7z filter=lfs diff=lfs merge=lfs -text
	*.gz filter=lfs diff=lfs merge=lfs -text

	# 确保 Unity YAML 文件以文本方式合并
	*.unity text merge=unityyamlmerge
	*.prefab text merge=unityyamlmerge
	*.mat text merge=unityyamlmerge
	*.controller text merge=unityyamlmerge
	*.anim text merge=unityyamlmerge
	```

### 项目结构

```
.     
├── Assets/                         # ★ 核心：所有游戏资源（≈ src/）
│   ├── Scenes/                     # 场景文件（≈ pages/）
│   │   └── SampleScene.unity       # 默认场景
│   ├── Scripts/                    # C# 脚本（≈ src/components/）
│   │   └── HelloUnity.cs           # 我们刚创建的脚本
│   ├── Materials/                  # 材质文件（≈ styles/）
│   ├── Textures/                   # 纹理贴图（≈ public/images/）
│   ├── Models/                     # 3D 模型
│   ├── Prefabs/                    # 预制体（≈ 可复用组件模板）
│   ├── Animations/                 # 动画文件
│   ├── Audio/                      # 音频文件
│   ├── Plugins/                    # 第三方插件
│   ├── Resources/                  # 运行时动态加载的资源
│   ├── StreamingAssets/            # 原样复制到构建的资源
│   └── Settings/                   # URP 渲染管线设置
│
├── Packages/                       # 包管理（≈ node_modules/ 的配置）
│   ├── manifest.json               # 包依赖声明（≈ package.json）
│   └── packages-lock.json          # 锁定版本（≈ package-lock.json）
│
├── ProjectSettings/                # 项目设置（≈ 各种 config 文件）
│   ├── ProjectSettings.asset       # 项目总设置
│   ├── QualitySettings.asset       # 画质设置
│   ├── InputManager.asset          # 输入设置
│   ├── TagManager.asset            # 标签和层设置
│   ├── Physics2DSettings.asset     # 2D 物理设置
│   └── ...                         # 其他设置文件
│
├── Library/                        # ★ 缓存（≈ node_modules/ + .next/）
│   └── ...                         # Unity 自动生成，不提交到 Git
│
├── Temp/                           # 临时文件（≈ .cache/）
│   └── ...                         # 不提交到 Git
│
├── Logs/                           # 日志文件
│   └── ...                         # 不提交到 Git
│
├── UserSettings/                   # 用户个人设置
│   └── ...                         # 不提交到 Git（个人偏好）
│
├── .gitignore                      # Git 忽略配置
├── .gitattributes                  # Git LFS 配置
└── [Project].sln            # VS Code / IDE 解决方案文件
```

- 其中 `Assets/` 是我们需要天天肘击的文件夹（相当于 `src/`），推荐的子目录组织如下：

	```txt
	Assets/
	├── _Project/                  # 用下划线前缀让它排在最前面
	│   ├── Scripts/
	│   │   ├── Player/            # 按功能模块划分
	│   │   ├── NPC/
	│   │   ├── UI/
	│   │   ├── Systems/
	│   │   └── Utils/
	│   ├── Scenes/
	│   │   ├── MainMenu.unity
	│   │   ├── GameWorld.unity
	│   │   └── Testing.unity
	│   ├── Prefabs/
	│   │   ├── Characters/
	│   │   ├── Environment/
	│   │   └── UI/
	│   ├── Materials/
	│   ├── Textures/
	│   ├── Models/
	│   ├── Animations/
	│   ├── Audio/
	│   │   ├── Music/
	│   │   └── SFX/
	│   ├── ScriptableObjects/
	│   └── Settings/
	│       ├── URP-HighQuality.asset
	│       ├── URP-MediumQuality.asset
	│       └── URP-LowQuality.asset
	└── Third-Party/               # 第三方资源和插件
			├── TextMeshPro/
			└── ...
	```

- meta 文件：`Assets/` 下的每个子目录+每个文件都有一个同名的 `xxx.meta` 文件，包含

	- GUID：全局唯一标识符（主键），Unity 用它来追踪资源间的引用关系

		不通过 Unity Editor 移动 / 重命名文件会导致引用断裂（Missing Reference）

	- 导入设置：纹理的压缩格式、模型的缩放比例等

- 父子关系

	- 父对象世界坐标 `(10, 0, 0)`，子对象 localPosition `(2, 0, 0)`
	- 则 **子对象世界坐标 = 父对象坐标 + 自身局部坐标** `(12, 0, 0)`

	!!!warning "子对象的 Transform 是相对于父对象的 (~= `position: relative / absolute`)"
		移动父对象时，所有子对象会跟着一起移动

- 使用空 GameObject 作为分组容器 （~= 用空 `<div>` 进行隔断）

	- 需要通过 右键 → Create Empty 创建
	- 一般通过 `--- Environment ---`（前后加破折号）格式命令

!!! info "多场景编辑 (~= iframe，同时存在多个独立页面)"
	Unity 支持同时加载多个场景（Additive Scene Loading），在 Hierarchy 中会以缩进显示：

	```txt
	Hierarchy:
	├── 📁 MainMenu (Scene)
	│   ├── Canvas
	│   └── EventSystem
	└── 📁 GameWorld (Scene)
			├── Terrain
			├── Player
			└── NPCs
	```

### 消息类型

- 普通 Message（白色）

	```c#
	Debug.Log("这是一条普通信息");
	Debug.Log($"玩家位置: {transform.position}");

	// 传入上下文对象（会高亮 Obj）
	Debug.Log("来自这个对象的消息", this.gameObject);

	// 富文本支持
	Debug.Log("<color=red>红色文字</color>"); // 或 #00FF00 格式颜色
	Debug.Log("<b>粗体</b> 和 <i>斜体</i>");
	Debug.Log("<size=20>大字体</size>");

	// JSON 化
	string json = JsonUtility.ToJson(myDataObject, prettyPrint: true);
	Debug.Log(json);
	```

- 警告 Warn（黄色）：`Debug.LogWarning("xxx")`

- 错误 Error（红色）：`Debug.LogError("xxx")`

### 条件输出

在 Release 中自动移除（~= Dev Only 代码片段）

```c#
// 通过 Conditional 属性定义输出条件
[System.Diagnostics.Conditional("UNITY_EDITOR")]
void DebugLog(string message)
{
    Debug.Log(message);
}

// 或者使用预处理指令（类似 process.env.NODE_ENV === 'development'）
#if UNITY_EDITOR
    Debug.Log("只在编辑器中显示");
#endif
```

## 1 GameObject

!!! info "万物皆 GameObject"
	无论是玩家、敌人、地面、灯光、摄像机，还是一个不可见的触发区域 => 本质上都是 GameObject

- 纯正裸奔（那叫自由）

	不同于自带默认行为的 DOM Element（如 `<button>` 的默认样式和点击事件处理），GameObject 基本啥也没有（只有 Transform 组件、而且看不见）

### 1.1 核心属性

```c#
// == 名称 == (~= id）
string name = gameObject.name;

// == 显示状态 == (~= display: none / block)
gameObject.SetActive(true / false); // 显示（激活）/ 隐藏（禁用）
bool isActive = gemeObject.activeSelf;

// == 标签 == (~= data-* 或 className)
gameObject.tag = "NavItem";
bool isNabItem = gameObject.CompareTag("NavItem");

// == 层级 == (~= z-index / 图层)
gameObject.layer = LayerMask.NameToLayer("Default");

// == 静态标记: 对象在游戏运行时不会移动（用于优化）==
gameObject.isStatic = true;
```

### 1.2 创建与销毁

1. 在 Hierarchy 窗口中右键选择类型
2. By Code（~= createElement）

		```c#
		public class SpawnDemo : MonoBehaviour {
			void Start() {
				// A: 空对象
				GameObject empty = new GameObject("EmptyObj");

				// B: 顺便初始化一些属性
				GameObject withComponents = new GameObject("Obj",
						typeof(Rigidbody),        // 物理组件
						typeof(BoxCollider)       // 碰撞体
				);

				// C: 基于 Unity 内置基本形状创建
				GameObject cube = GameObject.CreatePrimitive(PrimitiveType.Cube);
				cube.name = "MyCube";
				cube.transform.position = new Vector3(0, 2, 0);
			}
		}
		```

3. ✅ 从 Prefab 实例化 (~= 渲染一个组件)

		```C#
		public class SpawnDemo : MonoBehaviour {
			// 需要在检查器窗口导入
			[SerializeField] private GameObject enemyPrefab;

			void Start() {
				// 实例化 (~= <MyComponent />)
				GameObject enemy = Instantiate(enemyPrefab);
				enemy.name = "Zombie_01";
				enemy.transform.position = new Vector3(5, 0, 3);
			}
		}
		```

---

```C#
// 销毁整个 GameObject
Destroy(gameObject);      // 立即销毁
Destroy(gameObject, 5f);  // 延迟5秒销毁
Destroy(this.gameObject); // 销毁自身

// 只销毁一个组件 (~= EventListener)
Destroy(GetComponent<Rigidbody>());
```

### 1.3 Transform 组件

!!! info "Transform 是 Unity 中唯一不能被移除的组件, **每个 GameObject 必有 Transform**"

Transform 组件定义了 GameObject 在三维空间中的：Postion、Rotation、Scale（位姿 + 大小）

!!! info "Vector3: 浮点三元组，但可以是位置、方向、速度、缩放比 ..."
	```c#
	// == 世界坐标系 ===
	Vector3.up/down          = (0, ±1, 0) # Y 轴
	Vector3.forward/backword = (0, 0, ±1) # Z 轴
	Vector3.right/left       = (±1, 0, 0) # X 轴

	// 自身坐标系
	transform.forward / right / up ...
	```


#### Position (位置+平移)

- 包含世界坐标（World Position, ~= position: fixed）+ 局部坐标（Local Position, ~= position: relative）两部分

	```c#
	// == World Position == 相对于世界原点 （0,0,0）
	Vector3 worldPos = transform.position;       // Get
	transform.position = new Vector3(10, 2, 5);  // Set

	// == Local Postion == 相对于父对象
	Vector3 localPos = transform.localPosition;
	transform.localPosition = new Vector3(1, 0, 0);
	```

- 移动也分为：沿自身坐标轴移动 + 沿世界坐标轴移动 两类

	```c#
	// == Local Space == 对象旋转时，移动方向随之旋转
	transform.Translate(Vector3.forward * 2f); 

	// == World Space == Foward 始终沿世界坐标系 Z 轴
	transform.Translate(Vector3.forward * 2f, Space.World); 

	// 持续(沿自身坐标轴)移动
	void Update() {
		float speed = 5f;
		transform.position += transform.forward * speed * Time.deltaTime;
	}
	```

#### Rotation（旋转）

!!! warning "欧拉角 x 万向锁（Gimbal Lock）问题 "
	- 问题表征：物体的三个旋转轴中的两个轴重合（平行）时，<u>系统会丢失一个旋转自由度</u>

	- 根本原因：Unity 中欧拉角的顺序 **并非同时发生**，而是遵循以下顺序

		1. 绕初始 Z 轴旋转
		2. 绕<u>旋转后的</u>新 X 轴旋转
		3. 绕<u>再次旋转后的新</u> Y 轴旋转

		=> Step 2 中绕 X 轴旋转 ±90° 会使得 Step 3Y == Step 1Z

	- 解决方案

		- ❌ 不要手动 CRUD 欧拉角，✅ 通过四元数（Quaternion）描述姿态
		- 必须使用欧拉角（第一人称）时，限制中间轴的范围为 (-90°, +90°)

- ❌ 欧拉角（Euler Angles）：用 Vec3 表示 X/Y/Z 向的旋转 **度数** (~= rotateX())

	```c#
	// == 直接赋值（旋转状态）==
	/// 世界坐标系：绕 Y 轴旋转 90°
	transform.eulerAngles = new Vector3(0, 90, 0); 
	/// 自身坐标系：绕 X 轴旋转 30°
	transform.localEulerAngles = new Vector3(30, 0, 0);  

	// == ∆ 相对增量转动 ==
	/// ⚠️ [默认] 相对自身坐标系
	transform.Rotate(Vector3.up, 45f);  // 绕 Y 轴旋转 45 度
	transform.Rotate(0, 45, 0);         // 同上
	/// ⚠️ 指定针对世界坐标系
	transform.Rotate(Vector3.up, 45f, Space.World); 

	// 持续转动
	void Update() {
		float rotSpeed = 90f;
		transform.Rotate(Vector3.up, rotSpeed * Time.deltaTime);
	}
	```

- 四元数（Quaternion）：Unity 底层旋转存储方式

	- $q=(x,y,z,w)$：其中 $(x,y,z)$ 为旋转轴方向、$w = \cos(\theta/2)$ 为旋转角度的 **半角余弦值**

	- 一般也不会 **直接修改**，而是通过内置函数让它自己平滑过渡

	```c#
	// == 设置 == 难得的直接操作
	transform.rotation = Quaternion.identity;         // 无旋转
	transform.rotation = Quaternion.Euler(0, 90, 0);  // 从欧拉角创建四元数

	// == 面向目标位置 ==
	Vector3 targetPosition = new Vector3(10, 0, 5);
	transform.LookAt(targetPosition);

	// == 平滑旋转至指定方向 == 平滑插值
	Quaternion targetRotation = Quaternion.LookRotation(targetDirection);
	transform.rotation = Quaternion.Slerp(
			transform.rotation,     // 当前旋转
			targetRotation,         // 目标旋转
			Time.deltaTime * 5f     // 插值速度
	);
	```

#### Scale（缩放）

!!! info "**父对象**缩放会影响子对象"

```c#
transform.localScale = new Vector3(2, 2, 2);  // 等比放大 2 倍
transform.localScale = new Vector3(1, 3, 1);  // 只在 Y 轴拉伸

// Read-Only：受父对象影响后的 **最终缩放**
Vector3 worldScale = transform.lossyScale;
```

#### Sample: WASD 移动组件

- 一些属性：`[Header]` 是为了在检查器中进行分组

	```c#
	[Header("移动设置")]
	[SerializeField] private float moveSpeed = 5f;

	[Header("旋转设置")]
	[SerializeField] private float rotateSpeed = 90f;

	[Header("缩放设置")]
	[SerializeField] private float scaleSpeed = 1f;
	[SerializeField] private float minScale = 0.5f;
	[SerializeField] private float maxScale = 3f;
	private float currentScale = 1f;
	```

- 主循环：处理输入就完事了

	```c#
	void Update(){
		HandleMovement();
		HandleRotation();
		HandleScale();
		HandleSpecialActions();
	}
	```

- WASD 移动：针对世界坐标系

	- 方向支持：键盘（8 向移动），手柄（全向 - $h,v \in [-1, 1]$）

	- 可能的问题：不限制最大值时，斜向速度更快（实际模长为 $\sqrt(2)$）

	- `GetAxis` 自带平滑过渡, `GetAxisRaw` 仅返回 $(-1, 0, 1)$、手感更加干脆

	```c#
	void HandleMovement(){
		float h = Input.GetAxis("Horizontal");   // A/D 或 左/右箭头
		float v = Input.GetAxis("Vertical");     // W/S 或 上/下箭头

		// 移动向量
		Vector3 movement = new Vector3(h, 0, v); 
		movement = Vector3.ClampMagnitude(movement, 1f);

		transform.Translate(
			movement * moveSpeed * Time.deltaTime, 
			Space.World
		); // 应用移动
	}
	```

- QE 旋转

	```c#
	void HandleRotation() {
		if (Input.GetKey(KeyCode.Q))
			transform.Rotate(Vector3.up, -rotateSpeed * Time.deltaTime);
		if (Input.GetKey(KeyCode.E))
			transform.Rotate(Vector3.up, rotateSpeed * Time.deltaTime);
	}
	```

- ZX 缩放

	```c#
	void HandleScale {
		if (Input.GetKey(KeyCode.Z)) 
			currentScale -= scaleSpeed * Time.deltaTime;
		if (Input.GetKey(KeyCode.X))
			 currentScale += scaleSpeed * Time.deltaTime;

		// 限制范围
		currentScale = Mathf.Clamp(currentScale, minScale, maxScale);
    transform.localScale = Vector3.one * currentScale;
	}
	```

- 其他操作：空格重置 Transform + L 键打印 log

	```c#
	void HandleSpecialActions() {
		if (Input.GetKeyDown(KeyCode.Space)) {
				transform.position = Vector3.zero;
				transform.rotation = Quaternion.identity;
				currentScale = 1f;
				transform.localScale = Vector3.one;
				Debug.Log("Transform 已重置");
		}
		if (Input.GetKeyDown(KeyCode.L)) {
				Debug.Log($"Position: {transform.position}");
				Debug.Log($"Rotation: {transform.eulerAngles}");
				Debug.Log($"Scale: {transform.localScale}");
		}
	}
	```

### 1.4 Component 系统

>  “组合优于继承”