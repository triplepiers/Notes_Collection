---
statistics: True
---

# Home

## About

本站目前：

- 共有 {{ pages }} 个页面，{{ words }} 个字，{{ codes }} 行代码，{{ images }} 张图片。
- 继承了学习前端框架的笔记
- 勉强消除了 Obsidian 和 Mkdocs 渲染结果不一致的问题
- 尝试搞了代码高亮（🤔似乎不支持 JS）&& MathJax（试一下： $E = MC^2$）

!!! Info "广告位招租 -> 试图成为指针数组"

## Credit

本站点通过 [TonyCrane](https://github.com/TonyCrane) 老师编写的 [mkdocs-statistics-plugin](https://github.com/TonyCrane/mkdocs-statistics-plugin) 插件实现 **字数统计 & 阅读时间估计**

- 如果您发现 icon 被错误显示为 `:material-circle-edit-outline:`：
  
    您可能需要在 YAML 文件中添加以下配置项

    ```yaml
    markdown_extensions:
        - md_in_html
        - pymdownx.emoji:
            emoji_index: !!python/name:material.extensions.emoji.twemoji
            emoji_generator: !!python/name:material.extensions.emoji.to_svg
    ```

- 如果您需要一份自动化部署脚本：
  
    可以看看 [这里](https://github.com/triplepiers/Notes_Collection/blob/main/.github/workflows/ci.yml)（只是在官方脚本上添加了依赖安装环节）

<script src="https://unpkg.com/scrollreveal"></script>
<script>
    // window.onload = function() {
    //     ScrollReveal().reveal('.md-content *', {
    //         reset: false,
    //         origin: 'bottom',
    //         distance: '50px',
    //         duration: 1000,
    //         easing: 'ease',
    //         opacity: 0
    //     });
    // }
</script>