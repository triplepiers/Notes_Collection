# TailWind CSS

> 还在为了手搓响应式布局吗？对它使用 [TailWind](https://www.tailwindcss.cn/) 吧！
>
> 那么代价是什么呢？你需要记住更多沟槽的类名 ...

不同于提供预制组件样式的 Bootstrap / ElementUI，Tailwind 只是提供了一堆预定义的类、使你能过通过 `className` 叠叠乐的方式减少硬核手搓 CSS 的时间：

- Before

  ```css
  .custom-div {
    background-color: #3490dc;
    color: white;
    padding: 16px;
    border-radius: 10px;
  }
  ```

- After

  ```html
  <div class="bg-blue-500 text-white p-4 rounded-lg">
    This is a Tailwind-styled div
  </div>
  ```

!!! comment "我觉得这个类名堆叠和 BootStrap 一样稀烂"

实际上这东西也只是对样式做了亿些拆分（也算是提高了复用性）：

```css
.flex { diplay: flex; }
.item-center { align-item: center; }
.justify-center { justify-content: center; }
.text-blue { color: blue; }
```

## 0 Install

此处介绍一下通过 NPM 安装 TailWind 的方法（顺便掺了 PostCSS）：

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init
```

随后，你需要在 PostCSS 的配置文件中写点东西：

```js title="postcss.config.js"
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  }
}
```

把你的所有模板文件路径喂给 TailWind 的配置文件：

```js title='tailwind.config.js'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

在你的 CSS 文件中引入 TailWind 模块：

```css title='main.css'
// 其实还有个 theme 模块，内置了颜色/间隔之类的
@tailwind base;       // 一些需要统一清除的格式：margin / padding 之类的
@tailwind components; // 你的自定义组件样式
@tailwind utilities;  // 实际使用的 CSS（只会动态 link 你用到的部分）
```

齐活了，直接开干吧！

## 1 Hello World

```html
<div class='bg-violet-200(背景色，200是基于原色的灰度？) h-10(组件高度) w-full(撑满)
            border-2(边框粗细) border-violet-600(边框颜色)
            my-4(Y向/上下的margin) p-2(padding)
            justify-center items-center(喜闻乐见居中)'>
  <h1 class='text-center(水平居中) text-lg(字号) text-blue-400(颜色和字号)
             font-mono font-extrabold
             mt-2(比较小的上间隔)'> 
  	Hello World
	</h1>
</div>
```

但显然，预制菜并不能 cover 你的所有需求。

好在 TailWind 提供了 JIT 编译器，使你可以自由的用变量定义一些客制化的类别，belike：

```text
text-[13px] 
=> JIT 
=> .text-\[13px\] {
	fontsize: 30px;
}
```

类似的，你可以搞出：`w-[762px]`，`text-[#FFEF89]`，`bg-[#777]`，`before:content-['jsm']`，甚至 `text=[min(10vw, 10px)]`

## 2 布局

TailWind 基于 FlexBox & Grid 进行布局（已经很先进了）

### Flex

```html
<div class="flex flex-col(纵向排列) jutify-end space-x-6(横向间隔)">
    <div class="h-16 w-16 rounded-full bg-blue-500"></div>
    <div class="h-16 w-16 rounded-full bg-blue-500"></div>
    <div class="h-16 w-16 rounded-full bg-blue-500"></div>
</div>
```

### Grid

```html
<div class="grid grid-cols-3(三列) gap-2(元素间间隔)">
    ...
</div>
```

### 响应式

- TailWind 同时提供了一组预定义的设备宽度，于是你可以开始写响应式了。

	!!! info "这东西设置的是 `min-width`，所以你处理的应该是屏幕 **更大** 的情况 "
	
	但你也可以通过 `max-sm / max-md` 的格式，把宽度限制改成 `max-width`

  ```text
  'md:block hidden' - 只在 middle 及以上大小的屏幕上显示为 block, 其余情况 hide
  'sm:bg-blue-100 md:bg-red-100' - 小屏背景为蓝，中屏及以上为红
  ```

	!!! info "请使用 **无前缀** 类名开发移动端（而非使用 `sm`，这只适用于大于 640px 的屏幕）"

- TailWind 同时允许你 **客制化设备宽度断点**，记得带上 `--breakpoint` 的前缀：

  ```css title=app.css
  @import 'tailwindcss';
  
  @theme {
    --breakpoint-xs: 30rem;
    --breakpoint-2xl: 100rem;
    --breakpoing-3xl: 120rem;
  }
  ```

- 你也可以通过变量的形式指定 `min/max-width`

  ```text
  max-[600px]:bg-sky-300 min-[320px]:text-center
  ```

## 3 主题切换

- TailWind 原生支持了暗色模式，你只需要在类名前添加 `dark` 关键字：

  ```text
  text-black bg-white dark:text-white dark:bg-black // 感觉好麻烦
  ```

- 下面你还需要手动控制亮暗模式的方法：

  1. 使用媒体查询：`prefers-color-scheme`

  2. 基于 CSS 选择器将 `dark` 变量覆盖为指定的选择器字符串
     ```css title='app.css'
     @cumstom-variant dark (&:where(.dark, .dark *));
     ```

     你需要配合以下 JS 食用

     ```js
     document.body.classList.toggle('dark')
     ```

  3. 使用 Data 属性

     ```css title='app.css'
     @cumstom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));
     ```

## 4 自定义主题

1. Inline 方案：你可以通过 `[]` 解决，belike：`bg-[#fff]`

2. 修改 Config：在 TW v4 中，你只需要注意前缀

   ```css
   @theme {
     --color-chestnut: #973F29; // 你就可以用 bg-chestnut 了
   }
   ```

3. 分部客制化

   - base：作用于页面上的 **所有** 元素
   - components：作用于一些特定组件（卡片之类的）
   - utilities：原子样式，margin / padding 之类的

   你可以通过 `@layer` 指定客制化的作用域

   ```css
   @layer base {
     h1 {
       @apply font-mono; // 创飞页面中的所有 h1 标签
     }
     p {
       @apply text-left;
     }
   }
   
   @layer components {
     .card { // 然后你只写 .card 就行了（又组合回去了属于是）
       @apply m-10 rounded-lg bg-white;
     }
   }
   
   @utility flex-center { // 熟悉的三件套
     @apply flex justify-center items-center;
   }
   ```

## 5 Samples

### 默认组件样式覆盖

- 覆盖 复选/单选 框的默认强调颜色：加上 `accent`

  ```html
  <input type='checkbox' class='accent-pink-500' checked />
  ```

- 文件选择器：你只需要加上 `file` 前缀

  ```html
  <input type='file'
         class='block w-full text-sm file:mr-4 file:border-0' />
  ```

- 选中时文件样式：加上 `selection` 前缀

  ```html
  <p class='selection:text-white selection:bg-green-400'>
    这是一段文字
  </p>
  ```

- TextArea 的光标颜色：加上 `caret`

  ```html
  <textarea class="w-full caret-pingk-200 text-white"
            placeholder="type sth ...">
  </textarea>
  ```

### 手风琴折叠栏

> 这东西能不用 JS 写出来，很神奇吧

```html
<div class="max-w-lg mx-auto p-8">
    <details
     class="open:bg-white open:ring-1 open:ring-black/5 open:shadow-lg
            dark:open:bg-slate-900 dark:open:ring-white/10
            p-6 rounded-lg" 
     open
    >
        <summary
         class="text-sm leading-6 font-semibold select-none
               text-slate-900 dark:text-white"
        >
            Why do they call it Ovaltine?
        </summary>
        <div class="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
            <p>这是一段文字</p>
        </div>
    </details>
</div>
```

