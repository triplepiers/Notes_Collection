# 着色模型

## 基本光照模型

一般认为存在 3 种光照类型、光照即为三者之和（$L = L_s + L_d + L_a$）：

| 字符 | 含义 | 表现 |
| :--: | -- | -- |
| $L_s$ |「高光」Specular Light | 物体完全反射光源（且进入人眼）|
| $L_d$ |「漫反射」Diffuse Reflection |物体超任意方向反射相同亮度的光 |
| $L_a$ |「环境光」Ambient Lighting | 物体完全背对光源、但被其他物体的反射光照亮 |


### 1 Blinn-Phong

Blinn-Phong 忽略了各种能量损失，通过理想化的经验模型模拟了三种光线在物体表面的反射叠加

| 字母 | 含义                                  |
| ---- | ------------------------------------- |
| $L$  | 光源入射方向                          |
| $N$  | 法线方向（垂直于 shading point 平面） |
| $V$  | 视角方向                              |

#### $L_d$ 漫反射

1. 光源发射的能量，有多少到达 shading point ?

      - 假设：$R = 1$ 处的光强度为 $I$ => 据光源 $R = r$ 处的 shading point 光强 $I'$ 为？

      - 光源各球面的能量相等（能量守恒），有：

      $$
      4 \pi (1)^2\cdot I = 4 \pi r^2 \cdot I' \Rightarrow I' = \frac{1}{r^2}I
      $$

2. Shading point 能实际 **接收** 多少到达该点的光能？

      由 Lambert Cosine Law，这个比例为 $\cos\theta = \vec{l} \cdot \vec{n}$ （与 “光线——法线” 夹角有关）

      >  $\vec{l}, \vec{n}$ 均为表示方向的单位向量

3. Shading point 又能将多少能量反射出去？

      使用参数 $k_d \in [0,1]$ 表示这个反射比例（与表面颜色有关）

---

综上，Shading Point 最终反射到眼睛中的漫反射能量为:

$$
L_d = \frac{1}{r^2} I \cdot \max(0, \vec{l} \cdot \vec{n}) \cdot k_d
$$

> 即，$L_d$ = 从光源到达此处的能量 · 接收的能量（比例）· 反射的比例

#### $L_s$ 高光

- 视角方向 $\vec{V}$ 与 光线方向 $\vec{L}$ 镜面对称时，将看到高光

      定义 $\vec{R}$ 为镜面反射方向 => $\vec{V}$ &  $\vec{R}$  越接近时、高光越明显

- 「半程向量」：因为  $\vec{R}$  的计算量很大，所以换一种做法

      - 法线 $\vec{n}$ 即为 $\vec{L}$ 与  $\vec{R}$  的角平分线，我们也可以计算 $\vec{L}, \vec{V}$ 的角平分线 $\vec{h}$

      - 使用 $\vec{n}, \vec{h}$ 的夹角 $\alpha$ 评估两者的接近程度，有（两个单位向量）：
         $$
         \cos\alpha = \frac{\vec{n} \cdot \vec{h}}{|n|\cdot|h|} = \vec{n} \cdot \vec{h}
         $$

- 同样的，我们可以通过参数 $k_s \in [0,1]$ 表示物体对高光的反射比例（与表面颜色有关）

---

综上所述，高光能量为：
$$
L_s = \frac{1}{r^2}I \cdot \max(0, \cos\alpha)^p \cdot k_s = \frac{1}{r^2}I \cdot \max(0, \vec{n} \cdot \vec{h})^p \cdot k_s
$$

> 指数 $p$ 用于加速高光在 $\vec{R}$ 附近的衰减速度（很靠近镜面反射角才能看到）

#### $L_a$ 环境光

- Blinn-Phong 模型假设：<u>物体表面接收到的各种环境光都是相同强度的</u>

      因此，环境光与 光源角度 $\vec{L}$、观察角度 $\vec{V}$ 均无关，是一个 <u>常数</u>

      > 这显然不合理，但是算起来方便啊

- 但我们还是需要一个反射系数 $k_a$、以及环境光在此处的强度 $I_a \neq I'$

---

综上所述，环境光强度为：

$$
L_a = k_a \cdot I_a
$$

??? question "Blinn-Phong 怎么调都很塑料？"
      1. 漫反射与高光被强行解耦：Blinn-Phong 的漫反射和高光 <u>颜色</u> 是两个完全独立的参数

         > 设计师通常采用：彩色底色 + 白色高光 的配置，很像塑料
         
         而实际上：

         - 塑料（等非金属）= 有颜色的漫反射 + 纯白高光
         - 金属：❌ 没有漫反射，高光带金属颜色
            

      2. “菲涅尔效应（Fresnel Effect）” 缺失

         - 根据菲涅耳方程，所有材质均符合：视线与物体表面的夹角（掠射角）越小、物体反射率越高（急剧增加）=> 这使得 <u>物体边缘变得更亮</u>、以高光为主

         - Blinn-Phong 的高光项仅有用于改变高光位置和强度的 $\vec{n} \cdot \vec{h}$，<u>缺少在 “掠射角” 下需要的额外反射补正</u>

      3. 不遵循能量守恒

         - 在能量守恒下：高光很强时，漫反射必定会变暗
         - Blinn-Phong 支持同时把 漫反射 & 高光 都调得很亮、其总和甚至能超过光源

      4. 过于简陋的 “粗糙度” 模型

         - 微表面理论：粗糙表面存在若干凹凸，使光线会在微表面之间发生多次散射、遮挡

         - Blinn-Phong 仅通过 “光泽度”（Shininess，即公式中的 $p$）参数控制高光的大小：表面越粗糙，则高光斑点越大、越暗
         
            只能表现一团 “模糊高光”，无法模拟粗糙表面的颗粒感和材质

### 2 PBR

- PBR 简易光照模型：入射光与物体表面会产生以下两种作用

    1. 镜面反射
    2. 折射 = 漫反射 + 吸收（进入表面、转化为热能）

- PBR 考虑了以下物理性质：

    1. 粗糙度：“绝对光滑” 的理想表面将严格遵循光学、沿单一方向出射，粗糙表面则会使反射光和折射光在小范围内被发散到多个方向

         PBR 通过 <u>“微表面反射模型”</u> 对粗糙度进行量化：

         - 粗糙表面：模糊反射 + 暗淡、宽泛高光
         - 光滑表面：清晰、集中的反射 + 明亮高光

    2. 材质

        - 金属：只有镜面反射分量、<u>没有漫反射</u>（全部吸收）

        - 非金属：

            - 透明：穿透 => 沿折射方向继续前进至穿出
      
            - 不透明：重新从入射发射 => 漫反射

PBR 中的各种物理向量（辐射通量、辐射率）及各类反射系数（菲涅尔系数、反射率）均基于 RGB

#### 菲涅尔系数 x 反照率

1. 记理想（绝对光滑）表面下入射角为 $\theta_i$ 、折射角为 $\theta_t$，由 Snell 定律： 

    $$
    n_1 \sin(\theta_i) = n_2 \sin(\theta_t)
    $$

2. 设 "菲涅尔系数" $R_F(\theta_i)$ 为 “反射——折射” 的能量比例

    - 由能量守恒定律：反射能量为 $R_F(\theta_i)$、折射能量为 $1-R_F(\theta_i)$

    - 该系数取决于两侧介质的 折射率 + $(\vec{L}, \vec{N})$ 的夹角 $\theta_i$

???note "菲涅尔系数是 '能量——辐射通量' 比值，不是 '辐射率' 比值"
      - 反射辐射率 $L_o$ : 入射辐射率 $L_i$ = $R_F(\theta_i)$，因为 入射角 == 反射角

      - 但折射辐射率 $L_t$ : 入射辐射率 $L_i$ != $R_F(\theta_i)$，需考虑 '入射——折射' 光线在表面的投影面积：$L_t = (1 - R_F(\theta_i)) \frac{n_2^2}{n_1^2} L_i$

- 当 <u>材质固定时</u> ，菲涅尔系数仅取决于入射角 $\theta_i$（且为 <u>RGB 向量</u>、使反射光呈现不同颜色）

    - $\theta_i = 0$ 时，$R_F(0)$ 为定值，表现为材质镜面反射得到的 RGB 色

    - $\theta_i$ 逐渐增大时、视角逐渐接近掠射角，当 $\theta_i = 90 ^\circ$ 时、$R_F(90) = 1$ => 反射白光

- 菲涅尔曲线 $R_F(\cdot)$ 的特征

    - 高度非线性：在 $60 ^\circ$ 前几乎不变，随后快速接近 1。
    
    - 基本单调递增，仅部分特殊材质（如铝）会在中途略有下降。

---

由于精确描述菲涅尔曲线十分复杂，Schlick 给出了一个近似解、可以视为 $R_F(0) \rightarrow 1$ 的非线性插值：

$$
R_F(\theta_i) \approx R_F(0) + (1 - R_F(0))(1 - \cos \theta)^5
$$

!!!info "在方程中，$R_F(0)$ 唯一决定了其代表的材质"
    - 非金属： $R_F(0) \leq 0.05$，通常基于<u>漫反射</u>表现颜色
    - 金属：$R_F(0) \gt 0.5$，通常基于<u>菲涅尔效应</u>体现颜色

---

定义 "反照率"（scattering albedo）$\rho \in [0,1]$ 以描述 "漫反射:折射光总能量"，PBR 的简易光照模型即为：

1. 镜面反射 = 入射光 * $R_F(\theta_i)$
2. 折射
    - 漫反射 = 入射光 * $(1 - R_F(\theta_i))$ * $\rho$
    - 吸收  = 入射光 * $(1 - R_F(\theta_i))$ * $(1 - \rho)$

!!!info "大多数<u>非金属</u>的 折射 $\gt$ 反射、反照率 $\rho$ 对视觉效果的影响更大"

#### 双向反射分布函数 BRDF
> Bidirectional Reflectance Distribution Function

!!!note "概念定义"
    - 辐照度 (Irradiance) $E$：对于给定区域 $A$，穿过该区域的 <u>平均功率</u>
    - 辐射率（Radiance）$L$：光线亮度（与距离无关）

- 对于物体表面一点 $p$：

    - 入射角 $\omega_i$（由 $p$ 指向光源）存在 <u>入射</u>辐照度 $d E(\omega_i) = L_i (\omega_i) \cdot \cos\theta_i \cdot d\omega_i$

        ???question "为什么入射光要 * $\cos \theta_i$"
            本质上是需要把光线投影到 ⟂ 于平面的方向，即：$d E(\omega_i) = \frac{d \Phi_i(\omega_i)}{dA} = \frac{L_i \cdot d\omega_i \cdot d A_{proj}}{dA}$

            由于 $d A_{proj} = \cos\theta_i \cdot d A$ => 故 $d E(\omega_i)  = L_i \cos\theta_i \cdot d\omega_i$

    - 在其作用下，观察方向 $\omega_o$ 出射辐射率为 $d L_o(\omega_o)$

BRDF 被定义为 $d L_o(\omega_o)$ : $d E(\omega_i)$、在 <u>给定材质下恒定</u>，即：

$$
f_r(w_o, w_i) = \frac{d L_o(\omega_o)}{d E(\omega_i)}
$$

其单位是球面弧度（steradians，立体角单位），即 $sr^{-1}$



- BRDF 与 出/入射角 $(\omega_o, \omega_i)$ 相关，这两个角度可以通过 (仰角 $\theta$ + 旋转角 $\phi$) 描述

      => BRDF 最后变成了一个四元函数 $(\theta_i, \phi_i, \theta_o, \phi_o)$

- 由公式可知，最终出射的 $I_o$ 同时取决于入射辐照度 $E$ + 入射/出射方向
    
    受菲涅尔效应影响：

    - 入射角 $\theta_i$ 增大时、BRDF 增大
    - 观察角 $\omega_o$ 接近镜面反射方向时、观察到的出射光更强

- 各向同/异性

    - 各向同性：$(\phi_i, \phi_o)$ 同时绕法线旋转（保持相对位置不变）时，BRDF 保持不变

        => BRDF <u>蜕化为三元函数</u>（$\phi_i$、$\phi_o$ 中有一个冗余）

    - 各项异性：旋转后 BRDF 变化（头发、拉丝金属）

!!!question "为什么 BRDF 是 辐射**率**：辐照**度**，而不是 $L_o / L_i$？=> 因为比较好测（雷霆理由）" 

!!!question "为什么需要 BRDF"
    - 所谓的 PBR 建模就是找到材质的 BRDF 公式，最终目标是求出观察方向 $\omega_o$ 下的辐射率 $L_o$

    - 只要 "入射强度 + 材质的 BRDF" 已知，就可以用公式求解：

        $$
        L_o(\omega_o) = \int_\Omega f_r(\omega_i, \omega_o) L_i(\omega_i) \cos \theta_i \cdot d\omega_i
        $$

        - $\int_\Omega$ 负责对表面上方的半球面空间进行积分

        - $f_r(\omega_i, \omega_o)$ 是反射项 (BRDF))、可被进一步拆分为 $f_s + f_d$，以分别描述镜面反射和漫反射

##### Lambertian 漫反射

假设漫反射在<u>所有方向的出射强度一致</u>，其出射辐射率 $L_o$ 仅与 "入射光强+入射方向" 相关：

$$
L_o = f_d * E_L \cos\theta_i = \frac{c_{\text{diff}}}{\pi} * E_L \cos\theta_i
$$

其中 $c_{\text{diff}}$ 为 "漫反射颜色"，与材质相关

- 在之前的简化模型中，我们认为 漫反射 = 入射光 $*(1 - R_F(\theta_i)) * \rho$

    因此，可令 $c_{\text{diff}} = (1 - R_F(\theta_i)) * \rho$

- 但也有很多引擎直接忽略菲涅尔效应，直接令 $c_{\text{diff}} = \rho$、代表漫反射颜色（RGB 值）

!!!bug "Lambertian 缺少后向反射、边缘光只会因为入射角增加而变暗"
    后向反射 (Retroreflection) 指 <u>粗糙材质</u> 在 半向量x法线夹角 $\theta_h \rightarrow 90 ^\circ$ 时出现一个新的 BRDF 峰值，即入射光&观察角度都接近水平方向时、观察到的反射光又会增强

    该现象会让粗糙表面的亮度趋于平均（所以月亮更像一个平面的圆盘、而不是一个标准意义上的球体）

##### Disney 漫反射
> 该模型模拟了后向反射

$$
f_d = \frac{\text{baseColor}}{\pi} (1 + (F_{D90}-1)(1 - \cos\theta_l)^5) (1 + (F_{D90}-1)(1 - \cos\theta_v)^5)
$$

其中，$F_{D90} = 0.5 + 2 \cdot \text{roughness} \cdot \cos^2\theta_d$ 使得：

- 较光滑表面：在 gazing angle 考虑菲涅尔效应，适当变暗
- 较粗糙表面：因后向反射变亮

#### 微表面反射理论

该理论认为材质表面由一系列微小平坦的菲涅尔表面构成、都有独立的法线方向。此外，表面整体也有一个宏观的法线方向：

- 光滑表面：微法线方向变化较小、与宏观法线比较接近
- 粗糙表面：微法线更加随机分散

由于理论描述的尺度更加微观 << 单个像素，此时无法直接观测到微表面的凹凸结构、改用基于概率统计的 "法线分布函数 (Normal Distribution Function)" $D(\cdot)$ 进行描述：

- 对于面积为 $d A$ 的宏观表面，假设所有朝向立体角范围 $d \omega_h$ 的所有微表面面积为 $d A(h)$，有：

    $$
    D(h) = \frac{d A(h)}{dA * d\omega_h}
    $$

    - 该定义可满足约束 $\int_Omega D(\omega_h) \cos\theta_h \cdot d \omega_h = 1$，即所有微表面的投影面积 == 宏观表面面积

    - 此外，$D$ 的取值可 > 1，本质上更接近概率密度函数、而非概率分布函数

##### GGX 分布函数
> 是 $D(\cdot)$ 的一种具体数学形式

$$
D_{GGX}(\theta_h, \alpha) = \frac{\alpha^2}{\pi \cos^4\theta_h (\alpha^2 + \tan^2\theta_h)}
$$

其中，$\alpha \in [0,1]$ 表示粗糙度

相比于 Beckmann 和 Phong，GGX 具有更窄的峰值 + 更长的两侧尾部，更接近真实材质特性

##### 几何衰减函数 $G(\cdot)$
> Geometric Attenuation Factor

法线分布函数 $D(\cdot)$ 并没有描述：shadwing (入射光被其他微表面遮挡)、masking (反射光被其他微表面遮挡)

因此，引入 $G(\cdot)$（通常采用如下的 Smith 函数）：
> 主要在 gazing angles（观察角接近 90°）时衰减，且在粗糙度 $\alpha$ 较大时衰减得更加明显

$$
G(i,o,\alpha) = G_1(i,\alpha) \cdot G_1(o,\alpha)
$$

- $G_1(i,\alpha)$ 描述 shadwing、$G_1(o,\alpha)$ 描述 masking（可为同一函数）

- $G_1$ 的实际依赖于 $D(\cdot)$，当 $D(\cdot)$ 选用 GGX 时：

    $$
    G_1(o,\alpha) = \frac{2}{1 + \sqrt(1 + \alpha^2\tan^2\theta_o)}
    $$

##### 镜面反射

- 与观察角度 $o$ 直接相关 => 在 $\theta_o = \theta_i$ 时附近出现峰值

    对于绝对光滑表面，镜面反射仅在 $\theta_o == \theta_i$ 时存在且 $L_o = F(\theta_i) * L_i$

- 粗糙程度也将影响反射方向的分散程度，从而进一步影响高光的大小和强度

满足菲涅尔现象的绝对光滑微表面 + $D(\cdot)$ 描述表面法向分布 + $G(\cdot)$ 描述衰减的 Cook-Torrance 模型如下：

$$
f_s = \frac{DFG}{4\cos\theta_i\cos\theta_o}
$$

#### PBR Full

整合所有公式（将 BRDF 的 $f_r$ 拆分为 $f_s + f_d$），得到出射光线辐射率为：

$$
L_o(\omega_o) = \int_\Omega (\frac{c_{\text{diff}}}{\pi} + \frac{DFG}{4\cos\theta_i\cos\theta_o}) L_i(\omega_i) \cos\theta_i \cdot d \omega_i
$$

- 单光源下，PBR 也就是高光比 Blinn-Phong 更加锐利、没有特别出彩
- 全局光照（环境光）下，对所有输入光源的积分将会十分有用

### 3 Phong 的 BRDF 描述
> Lambertian 漫反射 + 镜面反射

$$
f_{\text{phong}} = \frac{c_{\text{diff}}}{\pi} + \frac{c_{\text{spec}} \cos^m \alpha_r}{\pi}
$$

- Lambertian 漫反射：$\frac{c_{\text{diff}}}{\pi}$

- 镜面反射：

      - $\alpha_r$ 是 "观察方向 $o$ —— 理想镜面反射角度 $r$" 间的夹角
      - $m$ 为高光指数：越大时表面越光滑
      - $c_{\text{spec}}$ 是镜面反射系数、根据经验人为调节

---

该方程的缺陷在于 $\max{\cos^m \alpha_r} = 1$，这使得 $m$ 增大时、镜面反射能量减小

- 为实现能量守恒，需要添加约束 $1 = \int_\Omega k * \cos\alpha_r^{m+1} \cdot d \omega_r$、使得整个反射半球的积分结果为 1 => $k = \frac{2+m}{2\pi}$

- 得到归一化 Phong：

      $$
      f_{\text{phong}} = \frac{c_{\text{diff}}}{\pi} + \frac{2+m}{2\pi} \cos^m \alpha_r
      $$

      $m$ 增大时，$k$ 将超过 1、但整个半球面的积分结果始终为 1。此时高光变窄 + 变亮

> Blinn-Phong 使用半向量 $h$ 与法线的夹角 $\theta_h$ 代替 $\alpha_r$，计算效率更高
