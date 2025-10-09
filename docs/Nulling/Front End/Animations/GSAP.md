# GSAP

[GSAP](https://greensock.com/gsap/) 是一个强劲有力的动画工具，具有运行超快、超鲁棒、可兼容的特点

[这里](https://github.com/triplepiers/WebDevelopment/tree/main/Basic/api/GSAP) 有一些相关 Sample

## Getting Started

### Installation 

- 基于 CDN 引入（单文件战士友好）

    ```html
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js"></script>
    ```

- 基于 NPM 安装，并在 React 中引入

    ```bash
    npm install gsap @gsap/react
    ```

    ```ts
    import { gsap } from "gsap";
    import { useGSAP } from "@gsap/react";
    // 注册组件
    gsap.registerPlugin(useGSAP); 
    ```

### Create Animation

- 首先，你需要在 HTML 里添加需要驱动的对象（废话）

    ```html
    <!-- style 里胡乱添加一些居中样式就好，GSAP 不会干扰 CSS 设置的初始状态 -->
    <body>
        <div class="box"></div>
    </body>
    ```

- OK，那么来塞动画罢！

    ```js
    // box 可以往右边跑了口牙
    gsap.to(".box", { duration: 2, x: 200 })
    ```

## 1 Timline Animation

> 关键帧动画啊，关键帧动画。复活罢，我的 Flash！

### Tween

- 上面的基础动画在 GSAP 中被称为 "tween"，可以通过以下四种方式定义
  
    | Method | Desc |
    | :---   | :--- |
    | `gsap.to` | 指定了动画的“终点”|
    | `gsap.from` | 指定“终点”信息，然后“挪回起点”|
    | `gsap.fromTo` | 同时指定动画的起止点信息 |
    | `gsap.set` | **立即** 重设属性|

    `fromTo` 形式的定义如下（感觉没啥意义，from 可以写在 base CSS 里）：
    
    ```js
    gsap.fromTo(
        target,
        {} // from config
        {} // to config
    )
    ```

- Target：除 `QuerySelectorALL` 形式的选择器外，GSAP 还支持多种不同的选择方式

    ```js
    let box = document.querySelector(".box");
    let circle = document.querySelector(".circle");
    /* 
      - Singe: box
      - List:  [box, circle]
    */
    ```

- GSAP 支持驱动多种属性，[这里](https://gsap.com/docs/v3/GSAP/CorePlugins/CSS#quick-reference) 有详细的配置说明

    ```js
    gsap.to(
        ".box",
        {
            /* play config */
            yoyo: true,     // running alternative
            repeat:   3,    // 可以限制 yoyo 次数, -1=unlimited
            repeatDelay: 0, // repeat 间 delay
            duration: 3,
            stagger: 0.5,   // list item 间的执行间隔

            /* Ease:
             * - 有 in / out / inOut 三种
             * - 有多种可选曲线，详见 https://gsap.com/docs/v3/Eases
             */ 
            ease: 'power1.out', // 不会出错的选择

            /* Animation:
             * - 基本是改变 opacity & transform
             * - 基于 transform 的动画会比基于 Top-Left 的方式丝滑
             */ 
            opacity: 0,
            x: 200,       // translateX(200px)

            /* Style */
            borderRadius: '',
            backgroundColor: '', // 但不能用 hue ...

            /* Callback Function 
             * onStart / onComplete / onReverseComplete / onUpdate / onRepeat
             */
            onComplete: () => {} 
        }
    )
    ```

- 可动对象摩多摩多

    - GSAP 以同样的方式操作 SVG 元素，基于 `attr` 项甚至能操作 `viewBox` 本身

    - GSAP 同时支持对自定义结构体的变换操作（离谱）

        意义：Canvas / ThreeJS 没办法直接挪动对象，会需要从结构体 `(x,y)` 中读取坐标

        ```js
        let obj = { num: 10, clr: 'red' };
        gsap.to(
            obj,
            {
                duration: 2,
                num: 200,
                clr: 'blue',
                onUpdate: () => console.log(obj.num, obj.clr)
            }
        )
        ```

- 更精细的播放控制

    ```js
    let tween = gsap.to();

    // 播放控制
    tween.pause();
    tween.resume();
    tween.reverse(); // 从当前位置开始返回
    tween.restart(); // 立即返回初始位置

    // 拉条
    tween.seek(0.5);          // 跳到 0.5s 处
    tween.progress(0.25);     // 跳到 25% 处
    tween.timeScale(0.5 / 2); // 0.5 倍速 / 2 倍速

    // 丢掉
    tween.kill();
    ```

### Timeline

- 手动给 tween 设置 delay 还是太痛苦面具了，所以我们端上了：

    ```js
    // timeline 整体设置
    let tl = gsap.timeline({
        repeat: -1,
        repeatDelay: 1,
        yoyo: true,
        // tween 的默认设置
        defulats: { duration: 1 }
    });
    // 会按添加顺序依次执行
    tl.to(".green", {});
    tl.to(".green", { delay: 1 }); // 在原来的接续位置上延后 1s（会导致向后重叠）
    tl.to(".yellow", {});
    ```

- 更加优雅的写法：如何避免设置中途 delay 导致的向后重叠？

    ```js
    // 很像 PPT 啊 ...
    tl.to(".green", {}, 1);      // 在 t=1s 时开始
    tl.to(".green", {}, "<");    // 和上一个动画 **同时** 开始
    tl.to(".yellow",{}, "+=1");  // 上一动画 **结束后1s** 开始
    ```

## 2 Plugins (TODO)

### Scroll Trigger

### Draggable

### Motion Path
