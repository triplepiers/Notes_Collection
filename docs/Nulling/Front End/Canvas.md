## 矢量路径

### 1 矢量路径

- Canvas 的矢量路径由一系列 "命令" + "坐标" 构成
- 矢量路径绘制流程

    1. `beginPath()`: 创建一个新路径（并清楚所有旧路径）
    2. `moveTo(x,y)`: 将绘图光标移动至路径 **起点**
    3. 连接 `curPos` => 指定位置 `(x,y)`
       1. 绘制直线 `lineTo(x,y)`
       2. 绘制曲线: `(x,y)` 为终点坐标，`cp[i](x,y)` 为控制点坐标
        
            | Method | Desc. |
            | :----: | :---  |
            | `quadraticCurveTo(cp1x, cp1y, x, y)` | 二次贝塞尔曲线 |
            | `bezierCurveTo(cp1x, cp1y, cp2x, cp2y ,x, y)` | 三次贝塞尔曲线 |
    4. `closePath()`: 连接 `curPos` => `initPoint` 的 **直线**
    5. 绘制路径：`stroke()` 仅绘制路径轮廓，`fill()` 填充路径内部

## Credit to

[1] [canvas矢量路径缠绕规则、闭合以及布尔运算](https://juejin.cn/post/7404777095644463130), [povxa](https://juejin.cn/user/307518989140552/posts)@稀土掘金

