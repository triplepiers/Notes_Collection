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

??? info "检查器支持的装饰器"
	与 Unity 编辑器的检查器面板联动的注解
	```c#
	// == 公开字段 ==
	public float speed = 5f; // (默认) 可见
	[HideInInspector] public float internalValue = 0f; // 隐藏

	// == 私有字段 ==
	private float jumpForce = 10f; // （默认）不可见、外部代码不允许访问
	[SerializeField] private int maxHealth = 100;   // 可见、支持调整

	// == 添加标题分隔 == 
	[Header("移动设置")]
	[SerializeField] private float walkSpeed = 3f;
	[SerializeField] private float runSpeed = 7f;
	// == 添加 margin ==
	[Space(20)]

	// == 鼠标悬停时显示提示 ==
	[Tooltip("角色在地面上的最大移动速度")]
	[SerializeField] private float maxGroundSpeed = 10f;

	// == 限制范围 ==
	[Range(0f, 1f)]  // 滑块
	[TextArea(3, 5)] // 多行文本输入
	```

	此外，也支持自动导入注解
	```c#
	[RequireComponent(typeof(Rigidbody))]
	public class PhysicsCharacter : MonoBehaviour {
		private Rigidbody rb;
		void Awake() {
			rb = GetComponent<Rigidbody>(); // 一定存在
		}
	}
	```

- 一些属性：

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

Component 是挂载在 GameObject 上的功能模块，GameObject 的行为和外观由挂载的 Component 决定：

```txt
GameObject                      // 容器
	== 内置 ==
	Transform                     // 位置（必有）
	MeshRenderer                  // 渲染（外观）
	Rigidbody                     // 物理（行为）
	== 自定义 ==
	PlayerXXX (自定义脚本)         // 自定义逻辑
```

#### 组件间通信

- 获取自身组件（同一 GameObject 上） 

	```c#
	// == 
	Rigidbody rb = GetComponent<Rigidbody>();              // 内置组件
	PlayerHealth health = GetComponent<PlayerHealth>();    // 自定义组件

	/// 不确定组件是否存在
	/// A: 痴呆版判断
	if (health != null) {}
	/// B: 推荐版判断 ✅ （仅 if-block 内使用）
	if (TryGetComponent<Rigidbody>(out Rigidbody rigidbody))
		rigidbody.AddForce(Vector3.up * 10f);
	```

- 获取**子对象**组件

	```c#
	// 子对象（含自身）的 1st Match (~= QuerySelector)
	Renderer childRenderer = GetComponentInChildren<Renderer>();

	// 子对象（含自身）的 ALL Match（~= QuerySelectorAll）
	Renderer[] allRenderers = GetComponentsInChildren<Renderer>();
	```

- 获取**父对象**组件

	```c#
	// 父对象链中的 1st Match (~= .closest('.some-class'))
	Canvas parentCanvas = GetComponentInParent<Canvas>();
	```

- **全局查找**

	```c#
	// By Type
	/// 1st Match（~= document.querySelector('[data-type="player"]'))
	PlayerHealth player = FindObjectOfType<PlayerHealth>(); // ❌ 性能差
	/// All Match （~= document.querySelectorAll('.enemy')）
	PlayerHealth[] allPlayers = FindObjectsOfType<PlayerHealth>();

	// By Name （~= document.getElementById('player') 
	GameObject playerObj = GameObject.Find("Player");       // ❌ 性能差

	// ✅ 性能较好
	// By Tag (~= document.querySelector('[data-tag="player"]'))
	/// 1st Match
	GameObject taggedPlayer = GameObject.FindWithTag("Player");
	/// All Match
 	GameObject[] enemies = GameObject.FindGameObjectsWithTag("Enemy");
	```

!!! warning "查找组件的性能问题"
	- ❌ 在 `Update()` 中查找（每帧重复）
	- ✅ 在 `Start()` 中查找 + 记录缓存（~= useRef）
		```c#
		private Rigidbody rb;

		void Start() {
			rb = GetComponent<Rigidbody>();
		}

		void Update() {
			rb.AddForce(Vector3.up); // 直接引用，不重复查找
		}
		``` 

#### 添加与移除

- 显然，我们可以在检查器底部手动添加

- 然后也可以通过代码

	```c#
	// @ void Start()
	/// 添加组件
	Rigidbody rb = gameObject.AddComponent<Rigidbody>();   // 可用于赋值 rb.mass
	PlayerHealth health = gameObject.AddComponent<PlayerHealth>();

	/// 移除组件（销毁）
	Destroy(GetComponent<BoxCollider>());

	/// 启用/禁用（不销毁）⚠️ 会暂停 Update 回调
	Renderer renderer = GetComponent<Renderer>();
	renderer.enabled = false;  // 隐藏渲染（对象还在，只是看不见）
	renderer.enabled = true;   // 恢复渲染
	```

### 1.5 Prefab 系统
> Prefab（预制体）就是一个可复用的 GameObject 模板

- 创建

	1. 在 Hierarchy 中配置好一份样板 GameObject（挂好所有组件、调好参数）
	2. 从 Hierarchy 拖拽到 Project 窗口（然后就变蓝色的 Prefab 了）

- 实例化：如何一次性下一百个蛋

	```c#
	public class EnemySpawner : MonoBehaviour {
		// ⚠️ 需要通过检查器面板绑定具体 Prefab
		[SerializeField] private GameObject enemyPrefab;

		// 批量生成设置
		[SerializeField] private int enemyCount = 5;
    [SerializeField] private float spawnRadius = 10f;

		// 初始逻辑：生成一坨
		void Start() {
			for (int i=0; i < enemyCount ; i++) {
				// 确定位置
				Vector3 randomPosition = new Vector3(
						Random.Range(-spawnRadius, spawnRadius),
						0,
						Random.Range(-spawnRadius, spawnRadius)
				);

				// 实例化 Prefab
				GameObject enemy = Instantiate(
						enemyPrefab,           // 要实例化的 Prefab
						randomPosition,        // 位置
						Quaternion.identity    // 旋转（无旋转）
				);
				enemy.name = $"Enemy_{i}"; // 设置名称
				// [Optional] 设为当前对象的子对象
				enemy.transform.SetParent(transform);
			}
		}
	}

	// 主循环：按 G 随机下蛋
	void Update() {
		if (Input.GetKeyDown(KeyCode.G)) {
			Vector3 pos = new Vector3(
					Random.Range(-5f, 5f), 0, Random.Range(-5f, 5f)
			);
			Instantiate(enemyPrefab, pos, Quaternion.identity);
			Debug.Log("生成了一个新敌人！");
		}
	}
	```

- 修改与覆盖

	- 修改 Prefab **模板**会 <u>同步更新所有实例</u>

	- 修改 **单个实例** 不会影响模板，在检查器中会以 “粗体 + 蓝色标记” 标记

### 1.6 父子关系

!!!warning "Transform 和 GameObject 强绑定 => Unity 层级的本质就是 Transform 树"
	- 移动父对象时，所有子对象会跟着一起移动

		子对象的 Transform 是相对于父对象的 (~= `position: relative / absolute`)
		
		=>  **子对象世界坐标 = 父对象坐标 + 自身局部坐标** `(12, 0, 0)`

	- 同理，父对象缩放时、子对象也会同比缩放

- 父子关系设置

	```c#
	GameObject child = Instantiate(childPrefab);
        
	// A: 通过 SetParent 
	child.transform.SetParent(transform); // ⚠️ localPosition 相对 this
	child.transform.SetParent(transform, worldPositionStays: true); // 子对象的世界坐标不动

	// B: 直接设置 parent
	child.transform.parent = transform; 

	// 解除关系
	child.transform.SetParent(null);
	```

- 遍历子对象

	```c#
	// 获取子对象数量
	int childCount = transform.childCount; 

	// 通过索引获取子对象 （~= element.children[idx]）
	Transform firstChild = transform.GetChild(0);

	// 遍历所有直接子对象
	foreach (Transform child_t in transform)
		Debug.Log($"子对象: {child_t.name}, 局部坐标: {child_t.localPosition}");
	```

- 查找父对象

	```c#
	Transform parent = transform.parent; // 直接 Parent
	Transform root = transform.root;     // 顶层 Rarent（祖宗开盒器）
	```

### 1.7 Tag + Layer

- Tag (~= HTML 中的 `class` / `data-*`)

	- Unity 提供了一些内置 Tag，如：Untagged (默认)、MainCamera (主摄像机) ...
		
		我们可以在检查器顶部的 Tag 菜单中添加自定义标签

	- 通常用于：判断具体撞到了什么

		```c#
		void OnCollision(Collision collision) {
			if (collision.gameObject.CompareTag("Enemy")) ...
			elif (collision.gameObject.CompareTag("Ground")) ...
		}
		```

- Layer 则是一个更加底层的分组系统，主要用于渲染和交互控制

	- Unity 内置了 8 个 Layer，你可以最多拓展到 32 个

		```txt
		.
		├── 0: Default
		├── 1: TransparentFX
		├── 2: Ignore Raycast
		├── 3: (空)
		├── 4: Water
		├── 5: UI
		├── 6: (空)
		└── 7: (空)
		```

	- 代码示例：设置与检测

		```c#
		// 设置 Layer
		gameObject.layer = LayerMask.NameToLayer("Enemy");

		// 获取指定 Layer
		int groundLayer = LayerMask.GetMask("Ground");
		int groundAndWater = LayerMask.GetMask("Ground", "Water");

		// 从摄像机发射一条射线，只检测 Ground 层
		Ray ray = Camera.main.ScreenPointToRay(Input.mousePosition);
		if (Physics.Raycast(ray, out RaycastHit hit, 100f, groundLayer))
			Debug.Log($"射线击中了: {hit.point}");
		```
	
	- Layer 间的 **碰撞** 关系矩阵通过 Edit → Project Settings → Physics 设置

### 1.8 MonoBehaviour 生命周期

```txt title="基本生命周期"
                对象创建
                  ↓
              	Awake()                创建时调用（禁用也会调），初始化变量（无依赖）
                  ↓
              OnEnable()               每次启用都会调，注册事件监听器
                  ↓
              	Start()                仅首次启用时，初始化组件引用（依赖）
                  ↓
┌──────────── 每帧循环开始 ────────────┐
│        FixedUpdate() (可能多次)     │  固定时间间隔，物理逻辑更新
│                 ↓                  │
│              Update()              │  每帧一次，处理输入、非物理逻辑
│                 ↓                  │
│            LateUpdate()            │  每次 Update 后，相机跟随
│                 ↓                  │
│                渲染                 │
└───────────--─ 下一帧 ───────────────┘
                  ↓ (对象/组件被禁用)
              OnDisable()               每次禁用时，注销事件监听
                  ↓ (对象被销毁)
              OnDestroy()               销毁时（仅一次）
```

- 碰撞周期

	```c#
	// 物理碰撞开始：依赖 Rigidbody + Collider
	void OnCollisionEnter(Collision collision);

	// 碰撞持续中（每一帧）
	void OnCollisionStay(Collision collision);

	// 碰撞结束
	void OnCollisionExit(Collision collision);
	```

- 类似的，也有 Trigger 周期

	```c#
	void OnTriggerEnter(Collider other);
	void OnTriggerStay(Collider other);
	void OnTriggerExit(Collider other);
	```

- 其他回调

	```c#
	// 渲染至屏幕前（在 Scene View 里画一些辅助内容，不影响 Game View）
	void OnDrawGizmos();

	// 可见状态改变 (是否处于摄像机视野内)
	void OnBecameVisible();
	void OnBecameInvisible();

	// 应用暂停/恢复（切后台）
	void OnApplicationPause(bool pauseStatus);
	```

## 2 C\#

#### 声明

- 变量声明

	```c#
	// 普通变量
	int count = 0;                    

	// 编译时常量（必须在声明时赋值, value 嵌入代码）
	const int MaxCount = 100;       

	// == 两类 readonly 都可以在构造函数中赋值
	// 运行时常量
	readonly float spawnRate = 0.5f;  
	// 类级运行时常量
	static readonly string GameVersion = "1.0.0"; 
	```

- 方法声明：没有独立函数，<u>必须在类中</u>

	```c#
	// == 普通方法 ==

	/// 可选值放最后
	public void CreatePlayer(string name, int level = 1);
	CreatePlayer(level: 2, name: "Goblin"); // 命名参数乱序调用

	/// 传若干个参数：params
	public int Sum(params int[] numbers) {
		int tot = 0;
		foreach (int n in numbers) tot += n;
		return tot;
	}
	Sum(1, 2, 3, 4, 5);                    // 传多个参数

	/// ⚠️ out 参数：由方法赋值（返回多种值、覆盖所有分支）
	/// =>         其实也可以直接返回 tuple
	public bool TryGetPlayerScore(string playerName, out int score);
	TryGetPlayerScore("Hero", out int score); // 不需要 score = TryGet...

	/// ⚠️ ref（引用、修改影响原变量），in（只读引用、避免复制）
	public void DoubleHealth(ref int health) health *= 2;

	// == 表达式体方法 (~= 箭头函数) ==
	public int Add(int a, int b) => a+b;
	```

#### 命名空间

- C# 没有 `export`、直接通过 `public` 进行导出
- 只能全量导入
- 命名空间名称与路径无关


```c# title="MathUtil.cs"
namespace BellLab.Utils {
	public static class MathUtils {
		public static float Add(float a, float b) => a + b;
		public const float PI = 3.14159f;
	}
}
```

```c# title="player.cs"
namespace BellLab.Characters {
	public class Player : UnityEngine.MonoBehaviour {
		public string playerName;
	}
}
```

```c# title="GameManager.cs"
// import
using BellLab.Utils;     
using BellLab.Characters;
// alias
using Vec3 = UnityEngine.Vector3;

// 直接使用（因为已经 using）
float result = MathUtils.Add(1f, 2f);
Player player = new Player();
// 使用别名
Vec3 pos = Vec3.zero;
// 完全限定名
UnityEngine.Debug.Log("Hello");
```

#### 单例模式
> 通常用于 游戏管理器、音频管理器等 (~= 全局 store)

```c# title="泛型单例基类"
public class Singleton<T> : MonoBehaviour where T : MonoBehaviour {
	private static T _instance;
	public static T Instance {
		get {
			if (_instance == null) {
				_instance = FindObjectOfType<T>();
				if (_instance == null) Debug.LogError($"场景中没有 {typeof(T).Name} 实例！");
			}
			return _instance;
		}
	}

	protected virtual void Awake() {
		// 防止重复实例化
		if (_instance != null && _instance != this) {
			Destroy(gameObject);
			return;
		}

		_instance = this as T;
		DontDestroyOnLoad(gameObject); // 切换场景时不销毁
	}
}

// usage
public class GameManager : Singleton<GameManager> {
	public int score = 0;
	public bool isPaused = false;

	public void AddScore(int points) {
		score += points;
	}

	public void SwitchPause() {
		isPaused = !isPaused;
		Time.timeScale = isPaused ? 0f : 1f;
	}
}
// 可以在任意位置通过 GameManager.Instance 访问
GameManager.Instance.AddScore(points);
```

!!! info "Time.timeScale = 0f"
	- 物理引擎停止：FixedUpdate 停止调用，刚体（Rigidbody）停止运动，碰撞检测暂停
	- 基于时间的逻辑停止：所有依赖 Time.deltaTime 或 Time.fixedDeltaTime 的代码停止
	- 动画和粒子暂停：默认的 Animator 动画和 Particle System 也会暂停
	- ⚠️ 副作用
		- Update 仍会被调用（不依赖 deltaTime 的逻辑依然进行）
		- 协程中 `yield return new WaitForSeconds()` 会无限挂起

#### Feature

- 简写 Switch

	```c#
	// 是的，还能塞在 return 里
	return obj switch {
		int i when i > 100 => $"大数字: {i}",
		int i => $"数字: {i}",
		string s => $"字符串: {s}",
		Vector3 v => $"位置: {v}",
		null => "空值",
		_ => $"未知类型: {obj.GetType()}"  // default
	};
	```

- Using (~= `with open xxx as f`)
	
	```c#
	using (var reader = new System.IO.StreamReader("data.txt")) {
		string content = reader.ReadToEnd();
	}
	// 离开作用域自动释放 reader
	```

- 运算符重载: 自定义 +、-、*、/ 等运算符

	```c# title="以自定义结构 Vec2 为例"
	public struct Vec2 {
		public float X { get; set; }
		public float Y { get; set; }
		public Vec2(float x, float y) {
			X = x;
			Y = y;
		}
		
		// 重载 +
		public static Vec2 operator +(Vector2 a, Vector2 b) {
			return new Vector2(a.X + b.X, a.Y + b.Y);
		}

		// 重载 toString
		public override string ToString() {
      return $"({X}, {Y})";
    }
	}
	```

### 2.1 数据类型

- 类型推断：C# 支持 `var` 类型推断（编译时），推断后即固定（不是动态类型）

- 类型转换

	```c#
	// 隐式转换（安全）
	int intValue = 42;
	float floatValue = intValue;    // int -> float，自动转换
	double doubleValue = floatValue; // float -> double，自动转换

	// 显式转换（可能丢失精度）
	float pi = 3.14159f;
	int rounded = (int)pi;          // 结果是 3，直接截断（不是四舍五入）

	// 字符串转换
	string numberStr = "42";
	int parsed = int.Parse(numberStr);           // 如果格式错误会抛异常
	bool success = int.TryParse(numberStr, out int result); // 安全转换，推荐
	```

#### 常用类型

```c#
// 整数类型
byte small = 255;          // 0 到 255（无符号，8位）
short medium = 32767;      // -32768 到 32767（16位）
int normal = 2147483647;   // 最常用的整数类型（32位）
long big = 9223372036854775807L; // 大整数（64位），注意末尾 L

// 浮点类型
float speed = 5.5f;        // 单精度（Unity中最常用），注意末尾 f
double precise = 5.5;      // 双精度（科学计算用）
decimal money = 19.99m;    // 高精度十进制（金融计算），注意末尾 m

// 字符串
string name = "BellLab";   // 字符串（引用类型）
bool isActive = true;      // 布尔值
char grade = 'A';          // 单个字符（JS没有char类型）

// Unity 特有
Vector3 position = new Vector3(0f, 1f, 0f);    // 三维向量
Quaternion rotation = Quaternion.identity;     // 四元数（旋转）
Color color = Color.red;                       // 颜色
```

- 字符串处理

	```c#
	// 多行（@"" / """），模板字符串需要前加 $
	string template = $@"玩家: {name}
	分数: {score}
	等级: {score / 10}";

	// 数字格式化
	string formatted = $"血量: {health:F1}%";     // "血量: 75.5%"（1位小数）
	string padded = $"分数: {score:D5}";           // "分数: 00100"（补零）
	string currency = $"金币: {score:N0}";         // "金币: 100"（千分位）

	// 常用方法
	text.Trim()
	text.ToUpper() / ToLower()
	text.Contains("World") / StartsWith("Hello") / EndsWith("!")
	text.IndexOf("World")
	text.Substring(0, 5)
	text.Replace("World","C#")
	text.Split(',') // ⚠️ 注意是char
	text.PadLeft(20)

	string.Concat(Enumerable.Repeat(text, 3))
	string.Join(",", arr)
	```

- 枚举：底层是 int

	- 枚举类型定义

		```c#
		public enum Direction {    // 自动赋值
			Up,        // 0
			Down       // 1
		}
		public enum EnemyType {    // 指定值
				Goblin = 1,
				Dragon = 10,
				Boss = 100
		}

		// usage
		Direction moveDirection = Direction.Up;
		switch (moveDirection) {
			case Direction.Up:
				Debug.Log("上");
				break;
			case Direction.Down:
				Debug.Log("下");
				break;
			default:
				Debug.Log("其他方向");
				break;
		}
		```
	
	- 标志枚举（位运算）

		```c#
		[System.Flags]
		public enum DamageType {
				None = 0,
				Physical = 1,    // 0001
				Fire = 2,        // 0010
				Ice = 4,         // 0100
				Lightning = 8,   // 1000
				// 组合类型
				Elemental = Fire | Ice | Lightning  // 1110
		}

		// usage
		DamageType mixed = DamageType.Fire | DamageType.Ice; // 组合
		bool hasFire = (mixed & DamageType.Fire) != 0;       // 检查是否包含
		bool hasFire2 = mixed.HasFlag(DamageType.Fire);      // 更清晰的写法
		```

	- 其他操作

		```C#
		// == 类型转换 ==
		// 枚举 => 字符串
		string dirName = Direction.Up.ToString(); 
		// 字符串 => 枚举
		Direction parsed = (Direction)System.Enum.Parse(typeof(Direction), "Up");
		bool success = System.Enum.TryParse<Direction>("Up", out Direction result);

		// == 获取所有枚举值 ==
		Direction[] allDirections = (Direction[])System.Enum.GetValues(typeof(Direction));
		```

#### 数组与集合

- 数组

	```c# title="Array"
	// 本身是定长的（不嘻嘻）
	int[] numbers = new int[3];    // init，默认值为0
	numbers[1] = 2;

	// 初始化
	int[] scores = { 90, 85, 78, 92 };               // 简写
	string[] names = new string[] { "A", "B", "C" }; // 完整写法

	// 多维数组
	int[,] grid = new int[3, 3];      // 3x3 二维数组
	grid[1, 2] = 5;

	// 套娃数组 [[], []]
	int[][] jagged = new int[3][];
	jagged[0] = new int[] { 1, 2 };
	jagged[1] = new int[] { 3, 4, 5 };

	// 转 Vec（List）
	List<int> backToList = new List<int>(scoreArray); // arr => list
	```

	```c# title="Vector"
	using System.Collections.Generic; 
	
	// 声明与初始化
	List<int> scores = new List<int>();     // 空列表
	List<string> names = new List<string> { "Alice", "Bob", "Charlie" }; // 初始化

	// 插入
	scores.Add(90);        // append
	scores.Insert(1, 95);  // 指定位置插入

	// 删除
	scores.Remove(85);        // 删除第一个匹配的值
	scores.RemoveAt(0);       // 按索引删除
	
	// 查找
	int index = names.IndexOf("Bob");       // 1
	bool exists = names.Contains("Alice");  // true

	// 遍历
	foreach (string name in names) {}
	for (int i=0; i<names.Count ; i++) {}

	// 排序
	scores.Sort();                        // 升序
	scores.Sort((a,b) => b.CompareTo(a)); // 降序（自定义比较）

	// 转传统 Array
	int[] scoreArray = scores.ToArray();              // list => arr
	```

- 集合

	```c#
	using System.Collections.Generic;

	// == 初始化 == 
	/// 传统版
	Dictionary<string, int> inventory = new Dictionary<string, int> {
		{ "sword", 1 }, { "potion", 5 }, { "arrow", 20 }
	};
	/// 简化版
	var scores = new Dictionary<string, int> {
    ["Alice"] = 100, ["Bob"] = 85, ["Charlie"] = 92
  };

	// == 读写 == 
	inventory["shield"] = 1;
	// 读
	int potionCount = inventory["potion"]; // ⚠️ 可能导致 KeyNotFoundException
	if (inventory.TryGetValue("sword", out int swordCount)) {} // 安全访问
	// 删除
	inventory.Remove("arrow");     

	// == 检查是否存在 ==
	bool hasSword = inventory.ContainsKey("sword"); 
  bool hasValue = inventory.ContainsValue(20); 

	// == 遍历 ==
	/// 传统版
	foreach (KeyValuePair<string, int> item in inventory) 
		Debug.Log($"{item.Key}: {item.Value}");
	/// 简化版 (赞美动态类型)
	foreach (var item in inventory) {}
	/// 仅 Key 
	foreach (string key in inventory.Keys) {}
	/// 仅 Val
	foreach (int value in inventory.Values)

	// == 大小 ==
	int size = inventory.Count;
	```

#### LINQ 数组操作

!!! warning "在 Unity 的 `Update()` 方法中频繁使用 LINQ 可能导致性能问题（GC 分配）。需每帧执行的代码考虑使用传统的 for 循环"

|	C# LINQ 方法 |	说明 | 	C# LINQ 方法 |	说明 |
| --  | -- | --  | -- |
| .Where()| 筛选 | .Select() | 映射 |
| .SelectMany()	| 展平映射 | .FirstOrDefault()	| 找第一个 |
| .FindIndex()	| 找索引 | .Any()	| 存在判断 |
| .All()	| 全部判断 | .Aggregate()	| 聚合 |
|	.OrderBy() | 排序 | .Reverse() | 反转 |
| .Skip().Take() | 截取 | .Contains()	| 包含判断 |
| .ToList().ForEach()	| 遍历 | .Distinct() |	去重 |
|	.Count() |	数量 |  .Max() |	最大值 |
| .Min() |	最小值 | | |

```c#
using System.Linq; // 必须引入！
using System.Collections.Generic;

// 数据类
[System.Serializable] // 可以在检查器中面板中编辑非 MonoBehaviour 数据
public class Enemy {
	public string name;
	public int health;
	public string type;
	public float distanceToPlayer;
}

public class LINQExamples : MonoBehaviour {
	void Start() {
		// == init ==
		List<Enemy> enemies = new List<Enemy> {
			new Enemy { name = "哥布林A", health = 30, type = "哥布林", distanceToPlayer = 5f },
			new Enemy { name = "骷髅A", health = 50, type = "骷髅", distanceToPlayer = 10f },
			new Enemy { name = "哥布林B", health = 25, type = "哥布林", distanceToPlayer = 3f },
			new Enemy { name = "龙", health = 500, type = "龙", distanceToPlayer = 50f },
			new Enemy { name = "骷髅B", health = 45, type = "骷髅", distanceToPlayer = 8f },
		};

		// ========== 实际游戏开发中的 LINQ 示例 ==========
		// 找到最近的敌人
		Enemy nearest = enemies
				.OrderBy(e => e.distanceToPlayer)
				.FirstOrDefault();

		// 计算某类型敌人的平均血量
		double avgGoblinHealth = enemies
				.Where(e => e.type == "哥布林")
				.Average(e => e.health);

		// 获取血量最高的敌人
		Enemy strongest = enemies
				.OrderByDescending(e => e.health)
				.First();
		// ===============================================

		// ========== filter / Where ==========
		var strongEnemies = enemies.Where(e => e.health > 40).ToList();
		// ⚠️ LINQ 是惰性求值（lazy），需要 .ToList() 或 .ToArray() 来实际执行

		// ========== map / Select ==========
		var indexedNames = enemies.Select((e, i) => $"{i}: {e.name}").ToList();

		// ========== find / First, FirstOrDefault ==========
		Enemy dragon = enemies.FirstOrDefault(e => e.type == "龙");
		// FirstOrDefault 找不到时返回 null（引用类型）或默认值（值类型）
		// First 找不到时抛异常（类似 JS 没有对应）

		// ========== some / Any ==========
		bool hasDragon = enemies.Any(e => e.type == "龙"); // true
		// ========== every / All ==========
		bool allAlive = enemies.All(e => e.health > 0); // true
		// ========== includes / Contains ==========
		var types = new List<string> { "哥布林", "骷髅" };
		bool containsDragon = types.Contains("龙"); // false

		// ========== reduce / Aggregate ==========
		int totalHealth = enemies.Sum(e => e.health); // 简单求和
		int totalHealthAggregate = enemies.Aggregate(0, (sum, e) => sum + e.health); // 通用 reduce

		// ========== sort / OrderBy ==========
		var sortedByHealth = enemies.OrderBy(e => e.health).ToList();          // 升序
		var sortedDesc = enemies.OrderByDescending(e => e.health).ToList();    // 降序
		// 多级排序
		var multiSorted = enemies.OrderBy(e => e.type).ThenBy(e => e.health).ToList();

		// ========== slice / Skip, Take ==========
		var sliced = enemies.Skip(1).Take(2).ToList(); // 跳过1个，取2个

		// ========== groupBy 分组 ==========
		var grouped = enemies.GroupBy(e => e.type);
		foreach (var group in grouped) {
				Debug.Log($"类型: {group.Key}，数量: {group.Count()}");
				foreach (var enemy in group) Debug.Log($"  - {enemy.name}");
		}

		// ========== 链式调用 ==========
		var nearestWeak = enemies
				.Where(e => e.health < 100)                    // 筛选弱敌人
				.OrderBy(e => e.distanceToPlayer)              // 按距离排序
				.Select(e => e.name)                           // 只取名字
				.Take(3)                                       // 取前3个
				.ToList();

		// ========== distinct / 去重 ==========
		var uniqueTypes = enemies.Select(e => e.type).Distinct().ToList();

		// ========== flatMap / SelectMany ==========
		var nested = new List<List<int>> { new List<int> { 1, 2 }, new List<int> { 3, 4 } };
		var flat = nested.SelectMany(x => x).ToList(); // [1, 2, 3, 4]
	}
}
```


#### null

- 引用类型（class, string, array）可为 null
- 值类型（int, float, bool, struct）不能为 null

	能通过 “可空值类型” 绕过，但需要额外检查

	```c#
	int? nullableCount = null;

	// 配套检查
	if (nullableCount.HasValue)
		int actualValue = nullableCount.Value;

	// 取值 / fallbcak to 0
	int count = nullableCount ?? 0; 

	// 可选链：playerName 为 null 则 length 也为 null
	int? length = playerName?.Length;

	// 合并赋值
	displayName ??= "匿名玩家"; // 如果原本为 null，则改为 “匿名玩家”
	```

	- Unity 重写了 `==` 运算符，使得已销毁对象 `== null`
	
		`?.` 在 Unity 下的效果不稳定，应该显式判断 `!= null`

### 2.2 类/结构体

- Class 通常继承自 MonoBehaviour

	```c#
	public class Player : MonoBehaviour {
		// 字段声明
		public string playerName;
		private int _score = 0; 
		/// 其他访问修饰符
		protected float _baseSpeed = 5f; // 该类+子类 可访问
		internal bool isNPC = false;     // 同一 Assembly 可访问
		protected internal float healthMultiplier = 1f; // OR 关系
		private protected int _level = 1;               // AND 关系

		// Unity 生命周期钩子
		void Start();
		void Update();

		// 公开方法
		public void TakeDamage(int amount) {
			health -= amount;        // ⚠️ 访问属性不需要 this
      if (health <= 0) Die();  //    调用方法也不需要（离谱）
		}
		
		// 私有方法
		private void Die();
	}
	```

	- 属性：Getter & Setter (!= 字段，可以自定义 get / set 逻辑)

	```c#
	// == 自动属性 ==
	/// 普通简写
	public string Name { get; set; }
	/// 简写 + 默认值
	public int Level { get; set; } = 1;

	/// 只读：仅在构造函数中赋值
	public string PlayerId { get; }
	/// 只读：通过箭头函数覆盖 setter
	public bool IsDead => _health <= 0;

	/// 覆盖读写逻辑
	private int _health = 100;
	public int Health {
		get { return _health; }
		set {
			_health = Mathf.Clamp(value, 0, MaxHealth); // value 为内置关键字，表示传入值
			OnHealthChanged?.Invoke(_health);           // 触发事件
		}
	}

	// 读写权限不同 (仅内部可写)
	public int MaxHealth { get; private set; } = 100;
	```

- Struct 是存储在栈上的值类型（Vector3、Color、Quaternion 都是结构体）

	```c#
	public struct DamageInfo{
		public int amount;         // 伤害数值
		public string source;      // 伤害来源
		public Vector3 hitPoint;   // 命中位置
		public bool isCritical;    // 是否暴击

		// 可以有构造函数
		public DamageInfo(int amount, string source, Vector3 hitPoint, bool isCritical){
			this.amount = amount;
			this.source = source;
			this.hitPoint = hitPoint;
			this.isCritical = isCritical;
		}
	}

	// 使用
	DamageInfo damage1 = new DamageInfo(50, "剑", Vector3.zero, false);
	DamageInfo damage2 = damage1; // ⚠️ 复制！不是引用
	```

#### ❌ 继承
```c# title="基类"
public class Character : MonoBehaviour {
	// protected: 子类可以访问
	protected string characterName;
	protected int health;
	protected int maxHealth;

	// virtual: 允许子类重写
	public virtual void TakeDamage(int amount) {
		health -= amount;
		Debug.Log($"{characterName} 受到 {amount} 点伤害，剩余 {health}");

		if (health <= 0) Die();
	}
	protected virtual void Die() {
		Debug.Log($"{characterName} 已死亡");
		Destroy(gameObject);
	}

	// ⚠️ 非 virtual 方法不能被重写
	public int GetHealthPercentage() {
		return (int)((float)health / maxHealth * 100);
	}
}
```

```c# title="子类"
public class Player : Character {
	private int _armor = 10;

	void Start() {
		characterName = "英雄"; // 访问 protected
	}

	// 重写父类 virtual 方法
	public override void TakeDamage(int amount) {
		int actualDamage = Mathf.Max(0, amount-_armor);
		base.TakeDamage(actualDamage); // 调用父类方法
	}
	protected override void Die() {
		Debug.Log("游戏结束！"); // 也可以不调用父类方法
	}
}

public class Enemy : Character {
	public int experienceReward = 50;

	protected override void Die() {
		Debug.Log($"获得 {experienceReward} 经验值");
		base.Die();
	}
}
```

#### ✅ 组合
> Unity 更鼓励用多个 Components 合成大 GameObject（挂在一起就行）

```c# title="组件实现"
public class HealthComponent : MonoBehaviour {
	public int maxHealth = 100;
	public int currentHealth;

	public event System.Action<int> OnHealthChanged;
	public event System.Action OnDeath;
	
	void Start() {
		currentHealth = maxHealth; // init
	}

	public void TakeDamate(int amount) {
		// 更新状态
		currentHealth = Mathf.Max(0, currentHealth - amount);
		// 发布事件
		OnHealthChanged?.Invoke(currentHealth);
		if (currentHealth <= 0) OnDeath?.Invoke();
	}

	public void Heal(int amount) { // 同理：更新 + 发布
		currentHealth = Mathf.Min(maxHealth, currentHealth + amount);
  	OnHealthChanged?.Invoke(currentHealth);
	}
}

public class MovementComponent : MonoBehaviour {
	public float moveSpeed = 5f;
	private CharacterController _controller;

	void Start() {
		_controller = GetComponent<CharacterController>();
	}

	public void Move(Vector3 direction) {
		_controller.Move(direction * moveSpeed * Time.deltaTime);
	}
}
```

```c# title="搞里头"
public class PlayerController : MonoBehaviour {
	private HealthComponent _health;
  private MovementComponent _movement;

	void Start() { // 获取同一个 GameObject 上的其他组件
		_health = GetComponent<HealthComponent>();
    _movement = GetComponent<MovementComponent>();

		// 订阅事件
    _health.OnDeath += HandleDeath;
	}

	void Update() { // 移动逻辑
		float h = Input.GetAxis("Horizontal");
		float v = Input.GetAxis("Vertical");
		_movement.Move(new Vector3(h, 0, v));
	}

	 void HandleDeath() {
		Debug.Log("玩家死亡，显示游戏结束画面");
	}
}
```

#### 接口

- C# 接口用于定义行为契约（编译时 + 运行时多态）
- 仅支持单继承，但可以实现多个接口

```C#
public interface IDamageable
{
	// 定义属性（自动属性签名）
	int Health { get; set; }

	// 接口中的方法（没有实现体）
	void TakeDamage(int amount);
	// C# 8+ 支持默认实现
	void LogDamage(int amount) {
		UnityEngine.Debug.Log($"受到 {amount} 点伤害");
	}
}

public interface IInteractable {
	string InteractionPrompt { get; } // 只读属性
	void Interact(GameObject interactor);
}

// 实现多个接口
public class Crate : MonoBehaviour, IDamageable, IInteractable {
	// == 实现 IDamageable ==
	public int Health { get; set; } = 50;
	public void TakeDamage(int amount) {
		Health -= amount;
		if (Health <= 0) Destroy(gameObject);
	}

	// == 实现 IInteractable ==
	public string InteractionPrompt => "按 E 打开箱子";
	public void Interact(GameObject interactor) {
		Debug.Log("箱子被打开了！");
	}
}

// 其他：通过判断是否实现 IDamageable 接口，来具体进行伤害结算
foreach (Collider hit in hits) {
	// 尝试获取 IDamageable 接口
	IDamageable damageable = hit.GetComponent<IDamageable>();
	// 实现 IDamageable 的对象都可以结算伤害
	if (damageable != null) damageable.TakeDamage(damage); 
}
```

#### 泛型

- 泛型方法

	```c#
	public T Identity<T> (T value) => value;

	// struct/class 约束
	public void ValueTypeOnly<T>(T value) where T : struct { }   // 只接受值类型
	public void RefTypeOnly<T>(T value) where T : class { }      // 只接受引用类型

	// 更严格的约束：T 实现 IDamageable
	public void ProcessDamageable<T>(T target) where T : IDamageable {}
	// 多重约束
	public void ProcessObject<T>(T obj) where T : MonoBehaviour, IDamageable, IInteractable {}

	// new() 约束：T 必须存在无参构造函数
	public T CreateInstance<T>() where T : new() {
		return new T();
	}
	```

- 泛型类

	```c#
	public class ObjectPool<T> where T : MonoBehaviour {
		private Queue<T> _pool = new Queue<T>();
    private T _prefab;
    private Transform _parent;

		// 初始化对象池
		public ObjectPool (T prefab, int size, Transform parent = null) {
			_prefab = prefab;
			_parent = parent;

			for (int i = 0 ; i < size ; i++) {
				T obj = UnityEngine.Object.Instantiate(_prefab, _parent);
				obj.gameObjcet.SetActive(false);
				_pool.Enqueue(obj);
			}
		}

		// 从池子里拿
		public T Get() {
			if (_pool.Count > 0) {
				T obj = _pool.Dequeue();
				obj.gameObjcet.SetActive(true);
				return obj
			}
			return UnityEngine.Object.Instantiate(_prefab, _parent);
		}

		// 还到池子
		public void Return(T obj) {
			obj.gameObject.SetActive(false);
      _pool.Enqueue(obj);
		}
	}

	// usage: 泛型对象池
	public class BulletManager : MonoBehaviour {
		[SerializeField] private Bullet bulletPrefab;
		private ObjectPool<Bullet> _bulletPool;

		void Start() {
				_bulletPool = new ObjectPool<Bullet>(bulletPrefab, 20);
		}

		public void Fire(Vector3 position, Vector3 direction) {
			Bullet bullet = _bulletPool.Get();
			bullet.transform.position = position;
			bullet.Initialize(direction, () => _bulletPool.Return(bullet));
		}
	}
	```

### 2.3 异步

- Unity 传统并发通过 **协程（Coroutine）** 实现

	```c#
	using System.Collections;

	void Start() {
		StartCoroutine(SpawnEnemies()); // 启动协程
	}

	// 协程方法：返回 IEnumerator
	IEnumerator SpawnEnemies() {
		for (int i = 0; i < 5; i++) {
			Debug.Log($"生成第 {i + 1} 个敌人");
			yield return new WaitForSeconds(2f); // 等待2秒
		}
		Debug.Log("所有敌人已生成");
	}
	```

	!!! info "常用 yield 语句 (返回 `IEnumerator`)"
		
		```c#
		yield return null;                          // 等待下一帧
		yield return new WaitForSeconds(1f);        // 等待1秒
		yield return new WaitForEndOfFrame();       // 等待帧末
		yield return new WaitUntil(() => Input.GetKeyDown(KeyCode.Space)); // 等待条件
		```

- ✅ Unity 2023+ 对 Awaitable API 提供了更好的异步支持、该 `async/await` 系统基于 Task (~= Promise)

	```c#
	using System.Threading.Tasks;
	using UnityEngine.Networking;

	async Task<string> FetchPlayerData(string id) {
		// 发送 Web 请求
		using (UnityWebRequest request = UnityWebRequest.Get($"/api/players/{id}")) {
				var operation = request.SendWebRequest();
				// 等待完成
				while (!operation.isDone) 
					await Task.Yield(); // 让出控制权，下一帧继续
				// 结果状态判断
				if (request.result == UnityWebRequest.Result.Success)
					return request.downloadHandler.text;
				else
					throw new System.Exception($"请求失败: {request.error}");
		}
	}

	// 错误处理（try/catch）
	async void LoadGame() {
		try {
			string data = await FetchPlayerData("123");
			Debug.Log(data);
		} catch (System.Exception e) {
				Debug.LogError($"加载失败: {e.Message}");
		}
	}

	// 并行执行（~= Promise.all）
	async Task LoadAllData() {
		// 初始化所有任务
		Task<string> playerTask = FetchPlayerData("123");
		Task<string> inventoryTask = FetchPlayerData("456");

		// 等待所有任务完成
		await Task.WhenAll(playerTask, inventoryTask);

		string playerData = playerTask.Result;
		string inventoryData = inventoryTask.Result;
	}
	```

### 2.4 事件与委托


| 概念 | C# |
| :-- | :-- |
| 回调	| `Action&lt;T1, T2&gt;` 或 `delegate` |
| 事件注册 | `event += handler` |
| 事件移除 |	`event -= handler` |
| 事件触发 | `event?.Invoke()` |
| 多播 | 内置支持（`delegate` 自动多播）|

- 委托（Delegate）和 事件（Event）在这里都变成了一种 “类型”

	- “委托” 本质上是一类 <u>函数指针</u> 的集合，可以指向任何符合指定签名（参数+返回值）的函数

		```c#
		// 定义委托类型 => callback 的参数+返回值
		public delegate void DamageCallback(int amount, string source);
		
		// 委托变量（预制版）
		private Action<int, string> _onDamage;
		private Func<float, float, float> _calculateDamage;

		void HandleDamage(int amount, string source) {
			Debug.Log($"受到 {amount} 点 {source} 伤害");
		}

		void Start() {
			// 赋值
			_onDamage = HandleDamage; // 方法引用
			_calculateDamage = (baseDmg, multiplier) => baseDmg * multiplier; // lambda 表达式

			// 调用
			_onDamage(50, "火球");
			float damage = _calculateDamage(100f, 1.5f); // 150
		}
		```

		??? info "常用预定义委托类型"
			- Action：无返回值委托
				```txt
				Action              -> () => void
				Action<int>         -> (n: number) => void
				Action<int, string> -> (n: number, s: string) => void
				```
			- 有返回值委托：**最后一个**指定返回类型
				```txt
				Func<int>        -> () => number
				Func<int, bool>  -> (n: number) => boolean  （）
				```

	- 事件（Event）：基于委托构建，外部代码只能执行 订阅(+=) / 取消订阅(-=)

		```c# title="事件发布类"
		public class EventExample : MonoBehaviour {
			// 事件声明：外部只能 += / -=
			public event Action<int> OnHealthChanged;         // 血量变化
			public event Action OnDeath;                      // 死亡
			public event Action<string, int> OnItemCollected; // 自动拾取

			private int _health = 100;
			publicc void TakeDamate(int amout) {
				// 更新本地状态
				_health -= amount;

				// 发布事件：万一还有人想知道呢？
				OnHealthChanged?.Invoke(_health); // ?. 确保仅在有订阅者时调用
				if (_health<=0) OnDeath?.Invoke();
			}

			public void CollectItem(string itemName, int quantity) {
				OnItemCollected?.Invoke(itemName, quantity);
			}
		}
		```

		```c# title="事件订阅类"
		public class UIManager : MonoBehaviour {
			[SerializeField] private EventEample player;

			void OnEnable() { // 订阅事件 => 指定回调
				player.OnHealthChanged += UpdateHealthBar;
				player.OnDeath += ShowGameOverScreen;
				player.OnItemCollected += ShowCollectionNotice;
			}

			void OnDisable() { // 取消订阅（不然会内存泄露）
				player.OnHealthChanged -= UpdateHealthBar;
				player.OnDeath -= ShowGameOverScreen;
				player.OnItemCollected -= ShowCollectionNotice;
			}

			// 触发事件后的 callbacks
			void UpdateHealthBar(int currentHealth) {}
			void ShowGameOverScreen() {}
			void ShowCollectionNotive(string item, int quant) {}
		}
		```

		你也可以为同一个事件指定多个 callback，如：

		```c#
		player.OnHealthChanged += UpdateHealthBar;      // 1
		player.OnHealthChanged += ShowGameOverScreen;   // 2
		player.OnHealthChanged += ShowCollectionNotice; // 3
		```

		理论上会按照 1 -> 2 -> 3 的顺序调用（⚠️ 需要严格保证顺序时，最好再封装一层）

