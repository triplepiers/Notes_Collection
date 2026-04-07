## 开法环境配置 (MacOS)

1. 下载 XCode（偷懒直接在 App Store 下载了）
2. 安装 XCode 命令行工具

    ```bash
    xcode-select --install
    ```

3. 配置镜像

    ```title=".zshrc"
    export PUB_HOSTED_URL=https://mirrors.tuna.tsinghua.edu.cn/dart-pub
    export FLUTTER_STORAGE_BASE_URL=https://mirrors.tuna.tsinghua.edu.cn/flutter
    ```

4. 安装 flutter

    ```bash
    brew install --cask flutter 
    
    flutter --version # 验证安装
    flutter doctor    # 运行环境诊断
    ```

    - 缺少 CocoaPods

        ```bash
        brew install ruby
        gem sources --add https://gems.ruby-china.com/ --remove https://rubygems.org/ # 替换为国内源
        brew install cocoapods 
        ```

    - 缺少 Android Toolchain

        - 安装 [Android Studio (for Mac)](https://developer.android.com/studio?hl=zh-cn)

            打开 Settings → Appearance & Behavior → System Settings → Android SDK，切换至 SDK Tools 标签、勾选：

            - Android SDK Command-line Tools
            - Android SDK Platform-Tools
            - Android SDK Build-Tools

        - 配置环境变量

            ```title="~/.zshrc"
            export ANDROID_HOME=~/Library/Android/sdk
            export PATH=$PATH:$ANDROID_HOME/emulator
            export PATH=$PATH:$ANDROID_HOME/platform-tools
            export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
            ```
        
        - 接受 Android 许可

            ```bash
            flutter doctor --android-licenses
            ```

5. Web 开法环境配置

    ```bash
    flutter config --enable-web # 启用 Web 支持
    flutter run -d chrome       # 在 Chrome 中运行
    ```

6. 创建 Android 虚拟设备

    - 在 Android Studio 中选择：More Actions → Virtual Device Manager → Create Virtual Device
    - 选中任意设备 + 系统镜像，随后启动设备
    - 运行应用：`cd path/to/project && flutter run`