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

### 2.1 非门 NOT



### 2.2 或非门 NOR
- 全 0 出 1，有 1 出 0
- 两个 NPN 串联接电源，两个 PNP 并联接地

### 2.3 或门 OR
- 或非门取反

### 2.4 与非门 NAND
- 全 1 出 0，有 0 出 1
- 两个 NPN 并联接电源，两个 PNP 串联接地

### 2.5 与门 AND
- 与非门取反
