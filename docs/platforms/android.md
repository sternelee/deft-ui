# Android 平台开发

本指南介绍如何为 Android 平台开发 Deft 应用程序。

## 平台支持

### 支持的 Android 版本
- Android 6.0 (API Level 23) 及更高版本
- 支持状态：✅ 实验性支持

### 支持的架构
- arm64-v8a (aarch64)
- armeabi-v7a (armv7)
- x86
- x86_64

## 开发环境设置

### 1. 安装 Android Studio

下载并安装 [Android Studio](https://developer.android.com/studio)。

### 2. 安装 SDK 和 NDK

在 Android Studio 中：
1. 打开 SDK Manager (`Tools > SDK Manager`)
2. 安装以下组件：
   - Android SDK Platform (API 33 或更高)
   - Android SDK Build-Tools
   - Android NDK (推荐版本 26.x)
   - CMake

### 3. 配置环境变量

```bash
# Linux/macOS (.bashrc 或 .zshrc)
export ANDROID_HOME=$HOME/Android/Sdk
export ANDROID_NDK_HOME=$ANDROID_HOME/ndk/26.0.10792818
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools/bin

# Windows (系统环境变量)
ANDROID_HOME=C:\Users\YourName\AppData\Local\Android\Sdk
ANDROID_NDK_HOME=%ANDROID_HOME%\ndk\26.0.10792818
```

### 4. 添加 Rust 目标

```bash
rustup target add aarch64-linux-android    # ARM64
rustup target add armv7-linux-androideabi  # ARMv7
rustup target add i686-linux-android       # x86
rustup target add x86_64-linux-android     # x86_64
```

### 5. 配置 Cargo

创建或编辑 `~/.cargo/config.toml`：

```toml
[target.aarch64-linux-android]
ar = "<ANDROID_NDK_HOME>/toolchains/llvm/prebuilt/linux-x86_64/bin/llvm-ar"
linker = "<ANDROID_NDK_HOME>/toolchains/llvm/prebuilt/linux-x86_64/bin/aarch64-linux-android33-clang"

[target.armv7-linux-androideabi]
ar = "<ANDROID_NDK_HOME>/toolchains/llvm/prebuilt/linux-x86_64/bin/llvm-ar"
linker = "<ANDROID_NDK_HOME>/toolchains/llvm/prebuilt/linux-x86_64/bin/armv7a-linux-androideabi33-clang"

[target.i686-linux-android]
ar = "<ANDROID_NDK_HOME>/toolchains/llvm/prebuilt/linux-x86_64/bin/llvm-ar"
linker = "<ANDROID_NDK_HOME>/toolchains/llvm/prebuilt/linux-x86_64/bin/i686-linux-android33-clang"

[target.x86_64-linux-android]
ar = "<ANDROID_NDK_HOME>/toolchains/llvm/prebuilt/linux-x86_64/bin/llvm-ar"
linker = "<ANDROID_NDK_HOME>/toolchains/llvm/prebuilt/linux-x86_64/bin/x86_64-linux-android33-clang"
```

注意：Windows 上使用 `prebuilt/windows-x86_64`，macOS 上使用 `prebuilt/darwin-x86_64`。

## 创建 Android 项目

### 项目结构

```
my-android-app/
├── Cargo.toml
├── src/
│   ├── lib.rs              # Android 入口点
│   └── index.js            # UI 代码
├── android/                # Android 项目
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── AndroidManifest.xml
│   │   │   ├── java/
│   │   │   └── res/
│   │   └── build.gradle
│   ├── build.gradle
│   └── settings.gradle
└── assets/                 # 资源文件
```

### Rust 代码

`Cargo.toml`:

```toml
[package]
name = "my-android-app"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib"]

[dependencies]
deft = { version = "0.13", features = ["audio"] }
android_logger = "0.11"
jni = "0.21"

[target.'cfg(target_os = "android")'.dependencies]
winit = { package = "deft-winit", version = "0.33.0", features = ["android-native-activity"] }
```

`src/lib.rs`:

```rust
use deft::app::{App, IApp};
use deft::loader::StaticModuleLoader;
use quick_js::loader::JsModuleLoader;
use winit::platform::android::activity::AndroidApp;

struct MyApp {}

impl IApp for MyApp {
    fn create_module_loader(&mut self) -> Box<dyn JsModuleLoader + Send + Sync + 'static> {
        let mut ml = StaticModuleLoader::new();
        ml.add_module("index.js".to_string(), include_str!("index.js").to_string());
        Box::new(ml)
    }
}

#[no_mangle]
fn android_main(android_app: AndroidApp) {
    // 初始化日志
    android_logger::init_once(
        android_logger::Config::default()
            .with_max_level(log::LevelFilter::Info)
    );
    
    let app = App::new(MyApp {});
    deft::android_bootstrap(android_app, app);
}
```

`src/index.js`:

```javascript
const window = new Window({
    width: 400,
    height: 600,
});
window.setTitle("My Android App");

const container = new ScrollElement();
container.setStyle({
    flex: 1,
    padding: 16,
    gap: 10,
});

const label = new LabelElement();
label.setText("Hello, Android!");
label.setStyle({
    fontSize: 24,
    textAlign: 'center',
});

container.addChild(label);
window.setBody(container);
```

### Android 项目配置

`android/app/build.gradle`:

```gradle
plugins {
    id 'com.android.application'
}

android {
    namespace 'com.example.myandroidapp'
    compileSdk 33

    defaultConfig {
        applicationId "com.example.myandroidapp"
        minSdk 23
        targetSdk 33
        versionCode 1
        versionName "1.0"
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt')
        }
    }

    sourceSets {
        main {
            jniLibs.srcDirs = ['../jniLibs']
        }
    }
}
```

`android/app/src/main/AndroidManifest.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    
    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:theme="@android:style/Theme.DeviceDefault.NoActionBar.Fullscreen"
        android:hasCode="false">
        
        <activity
            android:name="android.app.NativeActivity"
            android:exported="true"
            android:configChanges="orientation|keyboardHidden|screenSize">
            
            <meta-data
                android:name="android.app.lib_name"
                android:value="my_android_app" />
            
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
```

## 构建和运行

### 构建 Rust 库

```bash
# 构建所有架构
cargo build --target aarch64-linux-android --release
cargo build --target armv7-linux-androideabi --release
cargo build --target x86_64-linux-android --release

# 复制到 jniLibs
mkdir -p android/app/src/main/jniLibs/arm64-v8a
mkdir -p android/app/src/main/jniLibs/armeabi-v7a
mkdir -p android/app/src/main/jniLibs/x86_64

cp target/aarch64-linux-android/release/libmy_android_app.so \
   android/app/src/main/jniLibs/arm64-v8a/

cp target/armv7-linux-androideabi/release/libmy_android_app.so \
   android/app/src/main/jniLibs/armeabi-v7a/

cp target/x86_64-linux-android/release/libmy_android_app.so \
   android/app/src/main/jniLibs/x86_64/
```

### 使用 Gradle 构建

```bash
cd android
./gradlew assembleDebug
```

### 安装到设备

```bash
# 连接设备或启动模拟器
adb devices

# 安装 APK
./gradlew installDebug

# 启动应用
adb shell am start -n com.example.myandroidapp/.MainActivity
```

### 查看日志

```bash
adb logcat -s RustStdoutStderr
```

## Android 特定功能

### 触摸事件

```javascript
const button = new ButtonElement();
button.bindTouchStart((e) => {
    console.log("Touch start:", e.detail.touches);
});

button.bindTouchMove((e) => {
    console.log("Touch move:", e.detail.touches);
});

button.bindTouchEnd((e) => {
    console.log("Touch end:", e.detail.touches);
});
```

### 屏幕方向

```javascript
// 监听方向变化
window.bindResize((e) => {
    const { width, height } = e.detail;
    const isLandscape = width > height;
    console.log("Orientation:", isLandscape ? "landscape" : "portrait");
});
```

### 返回按钮处理

```javascript
// 处理 Android 返回按钮
window.bindKeyDown((e) => {
    if (e.detail.key === "Back") {
        // 处理返回逻辑
        console.log("Back button pressed");
        e.preventDefault();
    }
});
```

### 权限请求

在 Rust 中使用 JNI 请求权限：

```rust
use jni::JNIEnv;
use jni::objects::{JClass, JObject};

fn request_permission(env: &JNIEnv, permission: &str) {
    // 实现权限请求逻辑
    // 使用 Android API 通过 JNI
}
```

### 访问 Android Assets

```javascript
// 从 assets 目录加载文件
const imageData = await fs.readFile("assets://images/logo.png");
const imageElement = new ImageElement();
imageElement.setSource(imageData);
```

## 调试

### 启用 USB 调试

1. 在设备上：
   - 打开 **设置 > 关于手机**
   - 连续点击 **版本号** 7 次启用开发者选项
   - 打开 **开发者选项 > USB 调试**

2. 连接设备：
```bash
adb devices
```

### 使用 Android Studio 调试

1. 打开 Android Studio
2. 选择 **Run > Attach Debugger to Android Process**
3. 选择你的应用进程

### 日志记录

```rust
use log::{info, warn, error, debug};

info!("Application started");
debug!("Debug information");
warn!("Warning message");
error!("Error occurred");
```

查看日志：
```bash
adb logcat | grep MyApp
```

## 性能优化

### 减小 APK 大小

在 `Cargo.toml` 中：

```toml
[profile.release]
opt-level = "z"     # 优化大小
lto = true          # 链接时优化
strip = true        # 移除符号
codegen-units = 1   # 更好的优化
panic = "abort"     # 减少展开代码
```

### 只包含需要的架构

在 `build.gradle` 中：

```gradle
android {
    defaultConfig {
        ndk {
            abiFilters 'arm64-v8a'  // 只包含 ARM64
        }
    }
}
```

### 启用 ProGuard

```gradle
buildTypes {
    release {
        minifyEnabled true
        shrinkResources true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt')
    }
}
```

## 发布到 Google Play

### 生成签名密钥

```bash
keytool -genkey -v -keystore my-release-key.keystore \
    -alias my-key-alias \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000
```

### 配置签名

`android/app/build.gradle`:

```gradle
android {
    signingConfigs {
        release {
            storeFile file("my-release-key.keystore")
            storePassword "your-password"
            keyAlias "my-key-alias"
            keyPassword "your-password"
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

### 构建发布版本

```bash
./gradlew assembleRelease
```

生成的 APK 位于：
```
android/app/build/outputs/apk/release/app-release.apk
```

## 常见问题

### 构建错误：找不到 NDK

**解决方案**：确保 `ANDROID_NDK_HOME` 环境变量正确设置。

### 链接错误

**解决方案**：检查 `.cargo/config.toml` 中的链接器路径是否正确。

### 应用崩溃

**解决方案**：
1. 检查 logcat 输出
2. 确保所有必需的权限已在 AndroidManifest.xml 中声明
3. 验证库文件在正确的 jniLibs 目录中

### 性能问题

**解决方案**：
1. 使用发布构建而不是调试构建
2. 启用编译器优化
3. 使用 Android Profiler 分析性能

## 示例项目

- [Android 基础示例](../../examples/android-basic/)
- [Android 触摸示例](../../examples/android-touch/)
- [Android 传感器示例](../../examples/android-sensors/)

## 相关资源

- [Android 开发者文档](https://developer.android.com/)
- [Android NDK 指南](https://developer.android.com/ndk/guides)
- [Rust Android 开发](https://mozilla.github.io/firefox-browser-architecture/experiments/2017-09-21-rust-on-android.html)
- [cargo-apk](https://github.com/rust-windowing/android-ndk-rs)
