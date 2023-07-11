## 1 MOS 晶体管
> 全称是 ”金属氧化物半导体“ Metal-Oxide Semiconductor

!!! comment "死去的 NPN 和 PNP 三极管突然开始攻击我"

- 我们认为 MOS 管由三部分构成：

    | Gate 栅极 | Drain 漏极 | Source 源级 |
    |:---------:|:----------:|:-----------:|
    |   基极    |   集电极   |   发射极    |

- MOS 管分为 n-MOS 管（高压导通） & p-MOS管（低压导通）两种：
	  ![MOS](https://github.com/triplepiers/Notes_Collection/blob/main/docs/Nulling/ICS/assets/MOS.png?raw=true)

 	> 同时包含两种晶体管的电路称为 CMOS（ Complementary Metal-Oxide Semiconductor）电路

- 此处仅考虑晶体管的两种状态：导通 & 开路

	> 我这么大一个 “放大” 跑哪儿去了！
	
## 2 逻辑门

基本逻辑门图例：

 ![legend](https://github.com/triplepiers/Notes_Collection/blob/main/docs/Nulling/ICS/assets/gates.png?raw=true)

### 2.1 非门 NOT

![NOT Gate](https://github.com/triplepiers/Notes_Collection/blob/main/docs/Nulling/ICS/assets/NOT.png?raw=true)

### 2.2 或非门 NOR
- 全 0 出 1，有 1 出 0
- 两个 NPN 串联接电源，两个 PNP 并联接地

![NOR Gate](https://github.com/triplepiers/Notes_Collection/blob/main/docs/Nulling/ICS/assets/NOR.png?raw=true)

### 2.3 或门 OR
- 或非门取反

![OR Gate](https://github.com/triplepiers/Notes_Collection/blob/main/docs/Nulling/ICS/assets/OR.png?raw=true)

### 2.4 与非门 NAND
- 全 1 出 0，有 0 出 1
- 两个 NPN 并联接电源，两个 PNP 串联接地

![NAND Gate](https://github.com/triplepiers/Notes_Collection/blob/main/docs/Nulling/ICS/assets/NAND.png?raw=true)

### 2.5 与门 AND
- 与非门取反

![AND Gate](https://github.com/triplepiers/Notes_Collection/blob/main/docs/Nulling/ICS/assets/AND.png?raw=true)

### 2.6 摩根定律 De Morgan's Law

$$
	\overline{A \cdot B} = \overline{A} + \overline{B}
$$

??? question "为啥不直接 NPN 接电源 + PNP 接地？"
	- 在示例中，我们用 PNP 接电源 & NPN 接地，最后取反（这似乎增加了非门的开销）
	- 但由于晶体管的电学特性，反过来接会使输出 != 0，因此不能偷工减料。

## 3 组合逻辑
> 下列逻辑电路均 **无法存储信息**

### 3.1 译码器 Decoder

- 只有一个输出端口为 1，其余均为 0
  
	每个端口仅在 1 种输入模式下输出 1
	
- 对于 k 个输入，有 2<sup>k</sup> 种可能的输入模式（input pattern），对应 2<sup>k</sup> 个输出端口

- 主要用于解释一个二进制数，比如指令中的操作码（opcode）

### 3.2 多路复用器 MUX

- 从多个输入中选择一路进行输出，通常由 2<sup>k</sup> 条输入 + k 个选择信号 + 1 个输出组成
- 由选择信号 S 决定具体选择哪一个输入：
  
	每一路都是个或门，该路上的选择信号全 1 时，该路输入 == 最终输出

### 3.3 全加器 Full Adder

- 用于计算两个二进制串 `A[], B[]` 逐位相加的结果
- 计算由低位至高位进行，除最低位外，每一位：
	- 有三个输入：`A[i], B[i]` 以及低位产生的进位 `carry[i-1]`
	- 有两个输出：
		- 本位产生的进位：`carry[i]`，存在大于等于两个 1 输入时出 1
		- 本位最后的结果：`s[i]`，奇数个 1 出 1，偶数个出 0

### 3.4 可编程逻辑阵列 PLA
> 全称为 Programmable Logic Array，也叫 “可构建模块” Building Block

对于 识别 X\*输入，并产生 Y\*输出 的 逻辑函数：

- 需要 2<sup>x</sup> 个 AND（搭配 `[0, X]` 个 NOT）识别 `00...0 ~ 11...1` 的所有可能输入
- 需要 Y 个 OR 实现所有可能的输出
- 通过将对应 AND 的输出作为 OR 的输入，我们可以实现 **任意逻辑函数**

### 3.5 逻辑完备性 Logical Completeness

我们已经证明了仅用 AND，OR，NOT 构成的 PLA 可以实现任意逻辑函数，这表明 `[AND, OR, NOT]` 这一集合是 “逻辑完备的”：

即，通过对不同数量的 AND，OR，NOT 进行组合，就可以实现 **任何真值表**

## 4 存储单元
> 下列逻辑电路 **可以存储信息**

### 4.1 R-S 锁存器 R-S Latch
> 就是 “保持器” 捏，可以存储 1 bit 信息

|  A  |  B  | 状态  |    a     |    b     |
|:---:|:---:|:-----:|:--------:|:--------:|
|  1  |  1  | 保持  | 维持前态 | 维持前态 |
|  1  |  0  | clear |    0     |    1     |
|  0  |  1  | clear |    1     |    0     |
|  0  |  0  | 错误  |  不确定  |  不确定  |

### 4.2 门锁 D 锁存器

由 R-S 锁存器 + 两个 NOR 组成，支持用输入 WE 控制 **锁存器状态**：
> WE = Write Enable “可写”

- WE = 0，则 S == R = 1，锁存器为 **保持态**
- WE = 1，则 S = not(R) = not(D)，输出与 D 相同

### 4.3 寄存器 Register

- 寄存器由多个 bit 组合而成，大小为 `[1, n] bit`
  
- 由于具备存储功能，寄存器实际由 n 个门锁锁存器构成，当 WE = 1 时允许修改
  
- 字段（field）：
	我们将长 n 的寄存器记为 `A[n-1 : 0]` ，并使用 `A[m : n]` 截取的部分称为 “字段”（闭区间）

## 5 内存

$$
	内存 = N(address) * k(bit)
$$

- 拥有 16 MB 内存的机器 = 16M 个 address + 每个地址存储 1B 信息
  
- 2<sup>2</sup> * 3 内存 = 4 个地址 + 每个地址存 3 bit
  
	- 需要 4 * output 的译码器（拥有 4 根 “字线” word line）
	  
	- 每根字线包含 1 个字（即 3 bit）
	  
	- 对于每种输入
	  
		- 读：WE = 0，从对应的字线中取出该位置锁存器存储的一个字（3 bit）
		  
		- 写：WE = 1，修改对应字线锁存器中保存的数据

### 5.1 寻址空间 Address Space

- 内存中可独立识别的位置总数：16MB 内存 = 有 16M 个内存位置
- 对于用 n bit 表示的地址，一般有 2<sup>n</sup> 个独立地址

### 5.2 寻址能力

- 每个位置中存储信息的 bit 数目：16 MB 内存 = 每个位置存 1 B = 8 bit 信息
  
- 大多数内存都是 “字节寻址” Byte-Addressable
  
	这实际是个历史遗留问题：输入输出会转成 ASCII（8 bit），恰好占一个独立位置比较方便读写
	
	用于科学计算的机器可能采用 64 bit 寻址 -> 因为一个浮点数占 64 bit

## 6 时序逻辑电路 Sequential Logic Circuit

- 电路输出既与当前输入有关，又与历史输入（当前保存的状态）有关

- 由 组合逻辑电路 + 存储单元（仅记录 **上一个状态**）构成

- 主要用于实现有限状态机

- 区分 “时序” 与 “组合”

	- 时序：依次输入 2 -> 1 -> 3 方可通过

	- 组合：以任意顺序输入 `{1, 2, 3}` 均可通过

### 6.1 有限状态机 FSM


### 6.2 时钟信号

- 一个高低电平周期性交换的方波
- 时钟周期 clock cycle = 变换周期
- 有限状态机的状态转移发生在每个时钟周期的 **起始位置**（每隔 T 检查一遍输入）

### 6.3 主从锁存器 Master-Slave Flip-Flop

在当前时钟周期内：

- 存储器输出是组合逻辑电路的**一个**输入（有两个输入）
- 组合逻辑电路的输出是存储器的输入（只有一个输入）

---

- 如果使用 D锁存器，则本周期输出将 **立即** 覆盖存储器。
  
- 为使本周期输出在 **下一周期开始时** 覆盖存储器，此处使用 ”主从锁存器“ 实现 存储器功能：

	> 其实就是串了两个 D 锁存器 A + B，WE 由时钟信号控制
	
	- 前半个周期
		- WE<sub>A</sub> = 0， A 保持上一周期输入
		- WE<sub>B</sub> = 1，B 输出来自 A 的输入（保持上一周期）
	- 后半个周期
		- WE<sub>A</sub> = 1，A 接受组合逻辑电路输入（储存本周期状态）
		- WE<sub>B</sub> = 0，B 保持前半周期的输出（保持上一周期）



