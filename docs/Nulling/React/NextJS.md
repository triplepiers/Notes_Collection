# NextJS
> 这里是 [中文文档](https://next.nodejs.cn/docs/)

基于 Vue / React 搭建的 SPA(Single Page web Application) 往往面临着首评加载过慢、无法针对搜索引擎优化（SEO）两个关键问题。

NextJS 是一个用于构建 **全栈** Web 应用的 React 框架，支持对页面进行 客户端渲染 / **服务端** 渲染（SSR）。

## 1 项目创建

```bash
npx create-next-app@latest [projectName] # 按需求选一下 option
# 需要取消使用 App Router 才能有预期的文件结构
# Would you like to use App Router? (recommended) … No
npm run dev # 熟悉的运行指令 => 会生成 .next 记录开发环境
```

> 如果你确定你的网站是纯静态的，可以使用 `next export` 进行导出

下面稍微解释一下项目结构（这是勾选 App Router 的版本）：

- 总之，`index` 文件是 `app/page.tsx`
- 你可以在 `app/global.css` 下编写一些全局适用的样式
- `page.module.css` 提供的样式隔离很有趣：

    ```ts title="app/page.tsx"
    import styles from "./page.module.css";
    // 这下面是 HomePage 的 HTML 内容
    export default function Home() {
        return (
            // 你会发现这俩效果不一样
            <div className={styles.page}></div>
            <div className="page"></div>
        )
    }
    ```

## 2 路由

### 2.1 静态路由

- 对于页面来说超级简单，只要在 `/pages` 路径下新建一个 `[pageName].tsx` 、就可以通过 `/pageName` 访问了。

- 多级页面路由同理，只要新建 `/pages/team/member.tsx`，你就可以通过 `/team/member` 来访问对应的二级路由页面。

- 缺省：如果你在某个路径下创建了 `index.tsx`（例如 `/pages/post/index.tsx`），那么缺省路径 `/post` 直接会 link 到这个 index 文件上。同理，`/` 访问的是 `/pages/index.tsx`。

- 404 页面：如果不手动创建 `/pages/404.tsx`，NextJS 将为我们提供一个默认的 404 页面

### 2.2 动态路由

感觉非常奇妙，NextJS 是用文件名来收参数的。请看下面的例子：

- 创建 `/pages/comments/[commentID].tsx`，你可以通过 `/comments/12345` 来访问

- 获取路由参数

    ```ts
    import { useRouter } from 'next/router'

    export default function commentPage() {
        const router = useRouter()
        return (
            // router.query.[argName] => argName 是你在[]里塞的变量名
            <h1>当前评论编号: {router.query.commentID}</h1>
        )
    }
    ```

- 实际上的文件结构可能长这个样子：
  
    ```text
    pages
    └── team
        ├── index.tsx    # 这里放所有队伍的信息列表
        └── [teamID].tsx # 这里展示 ID 对应的队伍详情
        └── comments
            └── [commentID].tsx
    ```

- 如果你想拿两层的动态参数：

  - 你需要通过如下路由访问：`/team/111/comments/222`
  - 两个参数分别为：`router.query.teamID = 111` 和 `router.query.commentID = 222`
  
- 还有一种不需要定义老多目录结构的多参数接收方法：

    - 用于接收参数的文件名长这样：`/help/[...params].tsx`，很熟悉的析构不是吗？
    - 下面是用来接收参数的代码：

        ```ts
        import { useRouter } from 'next/router';
        export default function helpDetail() {
            const router = useRouter()
            const params = router.params // 这其实是一个数组
            return (
                <h1>Help Page: {params?.join?.(' ')}</h1>
            )
        }
        ```

        通过 `/help/111/who/123` 访问时，`params = ['111', 'who', '123']`

### 2.3 前端路由跳转

- 非常熟悉的操作：用一些路由组件来替换原生的 `<a>`

    Next 会把 Link 组件指向的页面数据和脚本都预先加载过来

    ```ts
    import Link from 'next/link'; // 不同于 Vue，React 把路由的活完全外包了
    export default function Home() {
        return (
            <div>
                Welcome to
                <Link href='/about'>About</Link>
                Page
            </div>
        )
    }
    ```

- 通过函数控制 button 跳转

    ```ts title="/components/RouterButton.tsx"
    import { useRouter } from 'next/router'
    // 组件的导出写法和 Page 略微有些不同
    export const RouterButton = () => {
        const router = useRouter()
        return (
            <div style=({
                marginTop: '1rem'. display: 'flex' // 有点难绷的 CSS 写法
            })>
                <button onClick=(()=> router.back())>Go Back</button>
                <button onClick=(()=> router.push('/'))>Go Home</button>
            </div>
        )
    }
    ```

## 3 Runtime Fetch
> 运行时获取数据

```ts
// 需要用到的一些 hook
import { useState, useEffect } from 'react';
export default function Page(){
    // 这边是在定义本页会用到的一些 变量 + setter 方法
    const [data, setData] = useState<any[]>([])
    const [dt,   setDt]   = useState(' ') // 这个是时间戳

    const fetchData = () => {
        fetch(
            URL
        ).then((res) => {
            return res.json();
        }).then((reply) => {
            setData(reply.posts) // 把返回的数据赋给 data
            setDt((new Date()).toString())
        })
    }

    userEffect(() => {
        fetchData()  // 页面加载时获取数据
    }, [])

    return (
        <h2>Data fetched @{dt}</h2> // 显示数据获取时间
        <ul>{ // 根据返回的 JSON 数据创建列表
            data.map((item) => (
                <li>{item.title}</li>
            ))
        }</ul>
    )
}
```

## 4 Pre Generate
> 预生成静态网络

!!! question "原生 React 也能完成 Runtime Fetch，我们为什么还需要 Next？"

SPA 的 HTML 文件本身脑袋空空，其作用是指明 JS 文件 => 然后做一些运行时的处理（比如说画页面）

- 这种动态数据加载对 SEO 非常不友好：HTML 根本没有实质内容，而爬虫也不会真正去运行 JS 脚本、获取实际数据
- Gatsby 和 Next 通过自己运行 JS 提前生成页面解决了这一问题

```ts
// 继续 3 中的代码，我们需要暴露一个用于构建静态页面的函数

// 构建时，框架会先调用 getStaticProps，然后基于 props 构建静态页面
export async function getStaticProps() {
    const dt = getCurrentTime() // 时间戳，这个是一个自定义的方法

    // 把之前的 promise 调用链改成了 async-await
    const responser = await fetch(URL)
    const reply = await response.json()
    return ({ props: { // 这个最终会作为 Page 函数的输入参数
        dt,
        data: reply.posts
    }})
}

export default function Page(props: any) {
    // 把数据获取丢到 getStaticProps 里了（不能实时拿了）
    return (
        <h2>Data fetched @{props.dt}</h2> // 显示数据获取时间
        <ul>{ // 根据返回的 JSON 数据创建列表
            props.data.map((item) => (
                <li>{item.title}</li>
            ))
        }</ul>
    )
}
```

!!! question "如何获取动态路由参数"

```ts
// 这个的返回值会进一步丢给 getStaticProps
export async function getStaicPaths() {
    return ({
        paths: [ // 用于模拟用户输入的 URL，在 build 时会静态构建下面的页面
            { params: {postID: '1'} },
            { params: {postID: '2'} },
            /*
                这边也可以通过一些 map 操作把东西放全（全量生成），belike：
                reply.posts.map((item:any) => ({
                    params: { postID: item.id.toString() }
                }))
            */
        ],
        fallback: false 
        /*
            true:  需要动态构建的时候会给用户一些提示
                   export default function Page(props: any) {
                        const router = uesRouter()
                        if (router.isFallback) {
                            return (<h1>Loading ... </h1>)
                        } else { // 加载好之后会返回这个分支
                            return (原来的东西)
                         }
                   }
            false: 输入 '3' 的时候找不到 => 直接报 404 了（纯前端）
            'blocking': 需要后端服务支持（比如 Next），会在请求时动态构建访问的页面
                        之后会把构建得到的页面放到静态目录下（不是服务端渲染）
        */
    })
}

export async function getStaticProps(context: any) {
    const postID = context.params.postID
    const response = await fetch(`URL/${postID}`)
    ...
}
```

### 增量更新

直接通过上述方法构建静态页面会导致：页面内容固定在构建时，之后发布的新内容无法即使更新到页面里

为了解决这个问题，我们需要增加一些设置：

```ts
export async function getStaticPaths() {
    return ({
        paths: [],
        fallback: false // ⚠️ 设置 revalidate 时，此处一定是 false
    })
}

export async function getStaticProps(context:any) {
    return ({
        props: { dt, data },
        revalidate: 3000    // ⚠️ 这是新增的参数，单位是 s（超时访问会重新构建）
    })
}
```

## 5 SSR 服务端渲染

我们需要替换一下前面的 `getStaticProps`（所以说两者不是同一个东西）

```ts
// 用户每次请求时都执行（前者的话：只在构建时执行 / 在用户首次请求时执行）
export async function getServerSideProps(context: any) {
    ... // 函数里面的操作和之前一样

    const { req, res, params, query, ...rest } = context
    /* 此外，我们不需要手动指定 getStaticPaths 了（因为是真实的动态请求）
       - (req, res) 和 express 中的类似
       - 你也可以拿到 cookie: req.headers.cookie
       - 也可以像 express 一样对包头进行一些操作：res.setHeader('Set-Cookie', 'token=xxx')

       对于 /team/abc/def?class=a (没错，你可以同时丢两类进去)，有：
       - params = ['abc', 'def']
       - query  = { class: 'a' }
    */
}
```

!!! warning "对于 `/team/[...params].tsx`，在不存在 `/team/index.tsx` 时、访问缺省路径报错"

    你可以将动态路由改成这样 `/team/[[...params]].tsx` => 两层 `[]` 表示参数可选

### 6 后端 API 创建

相关文件存放在 `/pages/api` 下，这些 `tsx` 文件并不是页面，但可以通过 `/api/[apiName]` 访问

```ts
// 你可以在本地写一个 mock 数据文件
import mock from './mock.json';
// 你需要拿到 Next 那边的相关定义
import type { NextApiRequest, NextApiResponse } from "next";
// 然后自己定义一个结构体
type Data = {
    name: string,
    age:  number,
    products: any[] // 用来接收类型不确定的数组数据
};
// 然后实现一个处理函数
export default async function handler (
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    // 从其他地方请求 products 信息
    const response = await fetch(URL);
    const reply    = await response.json();

    // 你也可以通过 req.method & req.query 拿到请求的 方式 & query 参数

    res.status(200) // 响应码正常
    .json({         // 返回 JSON 格式数据
        name: 'John Doe',
        age:  20,
        products: reply.products // 或者直接用 mock.products
    })
}
```

### 6.1 RestFul CURD 操作

暂时先用本地的 mock 数据模拟一下：
```ts
import mock from './mock.json';
const products = [ ...mock.products ];
```

类似的，我们对上述的 API 函数进行进一步修改：
```ts
export default async function handler (
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    switch(req.method) {
        case 'POST': # 插入
            productsList.push(req.body)
            break;
        case 'GET':  # 查找：直接丢回去就行
            break;
        case 'PUT':  # 修改
            {
                const idx = productsList.findIndex((item:any) => (item.id === req.body.id));
                if (idx >= 0) { productsList.splice(idx, 1, req.body) } // 替换 idx 处的数据
            }
            break;
        case 'DELETE':# 删除
            {
                const idx = productsList.findIndex((item:any) => (item.id === req.body.id));
                if (idx >= 0) { productsList.splice(idx, 1) }
            }
            break;
    }
    res.status(200).json({
        total: productsList.length,
        products: productsList
    })
}
```

## 7 Layout 全局页面布局
> 你也不想每个页面重新敲一遍 header & footer 罢

```ts title='/pages/_app.tsx'
import "@/styles/globals.css";            // 引入全局样式
import type { AppProps } from "next/app";

const Header = () => {
    return (
        <header><h1>This is Header</h1></header>
    )
};
const Footer = () => {
    return (
        <footer>Contact me @xxx.com</footer>
    )
}

// 你可以通过 Component（Page的函数式组件） & pageProps(会丢给 Page) 做一些 
export default function App({ Component, pageProps }: AppProps) {
    console.log((Component as any).getTitle()) // 定义在下个 block 了
    console.log(pageProps.pageName)            // => staticProps 返回的
    
    // 有 render 函数就返回定义内容，否则返回默认的 template
    if(!!(Component as any).render) {
        return (Component as any).render()
    } else {
        return (
            <Header></Header>
            <Component {...pageProps} />;
            <Footer></Footer>
        )
    }
}
```

```ts title='/pages/home.tsx'
export default function Home() {}
// 函数式组件在 JS 里被视为对象，所以你可以往上面挂各种奇怪的东西
Home.getTitile = function() {
    return {
        title: 'Home'
    }
}
Home.render = function() {
    return (
        <h2>Nothing Here</h2>
    )
}
// 这个导出的 props 也会传给 Home()
export function getstaticProps() {
    return ({
        props: {
            pageName: 'HomePage'
        }
    })
}
```

## 8 Head 辅助信息设置
> 糟蹋 html 的 `<head>` 标签

```ts
// @ 随便哪个 Page
import Head from 'next/head'

export default function Page() {
    return (
        <main>
            <Head>
                <title>Document</title> // 标签页的 Title
            </Head>
            // 下面是页面内容了
            <h1>Page Title</h1>
        </main>
    )
}
```