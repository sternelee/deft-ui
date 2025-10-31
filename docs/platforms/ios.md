# iOS 平台开发

本指南介绍如何为 iOS 平台开发 Deft 应用程序。

## 平台支持

### 支持状态
- ✅ 实验性支持
- 支持 iPhone 和 iPad

### 支持的 iOS 版本
- iOS 11.0 及更高版本（推荐 iOS 13+）

### 支持的架构
- arm64 (真实设备)
- x86_64 (模拟器 - Intel Mac)
- aarch64 (模拟器 - Apple Silicon)

## 开发环境设置

### 前置条件

1. **macOS** - iOS 开发需要 Mac
2. **Xcode** - 从 App Store 安装最新版本
3. **Xcode Command Line Tools**
4. **Rust 工具链**
5. **iOS 开发者账号**（用于真机测试和发布）

### 安装步骤

```bash
# 1. 安装 Xcode Command Line Tools
xcode-select --install

# 2. 安装 Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# 3. 添加 iOS 目标
rustup target add aarch64-apple-ios          # 真实设备
rustup target add aarch64-apple-ios-sim      # Apple Silicon 模拟器
rustup target add x86_64-apple-ios           # Intel 模拟器

# 4. 安装 cargo-xcode (可选，但推荐)
cargo install cargo-xcode
```

详细设置请参考[开发环境设置](../guides/development-setup.md#ios)。

## 创建 iOS 项目

### 项目结构

```
my-ios-app/
├── Cargo.toml
├── src/
│   ├── lib.rs          # Rust 库
│   └── index.js        # UI 代码
├── ios/                # iOS 项目
│   ├── MyApp.xcodeproj
│   ├── MyApp/
│   │   ├── Info.plist
│   │   ├── Assets.xcassets
│   │   └── LaunchScreen.storyboard
│   └── MyApp.entitlements
└── build.rs
```

### Rust 代码

`Cargo.toml`:

```toml
[package]
name = "my-ios-app"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["staticlib", "cdylib"]

[dependencies]
deft = { version = "0.13" }

[target.'cfg(target_os = "ios")'.dependencies]
objc = "0.2"
```

`src/lib.rs`:

```rust
use deft::app::{App, IApp};
use deft::loader::StaticModuleLoader;
use quick_js::loader::JsModuleLoader;

struct IOSApp {}

impl IApp for IOSApp {
    fn create_module_loader(&mut self) -> Box<dyn JsModuleLoader + Send + Sync + 'static> {
        let mut ml = StaticModuleLoader::new();
        ml.add_module("index.js".to_string(), include_str!("index.js").to_string());
        Box::new(ml)
    }
}

#[no_mangle]
pub extern "C" fn start_deft_app() {
    let app = App::new(IOSApp {});
    deft::bootstrap(app);
}
```

### JavaScript UI

`src/index.js`:

```javascript
console.log("iOS App starting...");

const window = new Window({
    width: 375,   // iPhone 标准宽度
    height: 812,  // iPhone X/11/12 高度
});
window.setTitle("My iOS App");

const container = new ScrollElement();
container.setStyle({
    flex: 1,
    padding: 20,
    gap: 15,
    backgroundColor: '#f5f5f5',
});

const title = new LabelElement();
title.setText("Hello from iOS!");
title.setStyle({
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#007AFF',  // iOS 蓝色
});

const subtitle = new LabelElement();
subtitle.setText("Deft UI on iOS");
subtitle.setStyle({
    fontSize: 17,
    textAlign: 'center',
    color: '#8E8E93',
});

container.addChild(title);
container.addChild(subtitle);

window.setBody(container);

console.log("iOS App loaded!");
```

### Xcode 项目配置

#### Info.plist

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>en</string>
    <key>CFBundleDisplayName</key>
    <string>My iOS App</string>
    <key>CFBundleExecutable</key>
    <string>$(EXECUTABLE_NAME)</string>
    <key>CFBundleIdentifier</key>
    <string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
    <key>CFBundleName</key>
    <string>$(PRODUCT_NAME)</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0</string>
    <key>CFBundleVersion</key>
    <string>1</string>
    <key>LSRequiresIPhoneOS</key>
    <true/>
    <key>UILaunchStoryboardName</key>
    <string>LaunchScreen</string>
    <key>UIRequiredDeviceCapabilities</key>
    <array>
        <string>arm64</string>
    </array>
    <key>UISupportedInterfaceOrientations</key>
    <array>
        <string>UIInterfaceOrientationPortrait</string>
        <string>UIInterfaceOrientationLandscapeLeft</string>
        <string>UIInterfaceOrientationLandscapeRight</string>
    </array>
    <key>UIStatusBarStyle</key>
    <string>UIStatusBarStyleDefault</string>
</dict>
</plist>
```

#### Build Script

在 Xcode 项目中添加 Build Phase：

```bash
# Build Rust library
cargo build --target aarch64-apple-ios --release

# Copy library
cp ${SRCROOT}/../target/aarch64-apple-ios/release/libmy_ios_app.a ${BUILT_PRODUCTS_DIR}/
```

## iOS 特定功能

### 触摸事件

iOS 主要使用触摸交互：

```javascript
const button = new ButtonElement();

// 触摸开始
button.bindTouchStart((e) => {
    console.log("Touch start:", e.detail.touches);
    e.detail.touches.forEach(touch => {
        console.log(`Touch ${touch.identifier} at (${touch.offsetX}, ${touch.offsetY})`);
    });
});

// 触摸移动
button.bindTouchMove((e) => {
    console.log("Touch move");
});

// 触摸结束
button.bindTouchEnd((e) => {
    console.log("Touch end");
});
```

### 手势识别

```javascript
// 点击手势
element.bindClick(() => {
    console.log("Tapped");
});

// 双击
element.bindDoubleClick(() => {
    console.log("Double tapped");
});

// 长按
element.bindLongPress(() => {
    console.log("Long pressed");
});

// 滑动
element.bindSwipe((e) => {
    console.log("Swiped:", e.detail.direction);  // 'left', 'right', 'up', 'down'
});
```

### 安全区域

处理刘海屏和底部指示器：

```javascript
// 获取安全区域
const safeArea = window.getSafeAreaInsets();
console.log("Safe area:", safeArea);  // { top, left, bottom, right }

// 应用安全区域
container.setStyle({
    paddingTop: safeArea.top,
    paddingBottom: safeArea.bottom,
    paddingLeft: safeArea.left,
    paddingRight: safeArea.right,
});
```

### 键盘处理

```javascript
// 监听键盘显示
window.bindKeyboardShow((e) => {
    const keyboardHeight = e.detail.height;
    console.log("Keyboard height:", keyboardHeight);
    
    // 调整布局
    container.setStyle({
        paddingBottom: keyboardHeight,
    });
});

// 监听键盘隐藏
window.bindKeyboardHide(() => {
    container.setStyle({
        paddingBottom: 0,
    });
});

// 关闭键盘
function dismissKeyboard() {
    window.endEditing();
}
```

### 状态栏

```javascript
// 隐藏状态栏
window.setStatusBarHidden(true);

// 设置状态栏样式
window.setStatusBarStyle('light');  // 'light' | 'dark'
```

### 方向变化

```javascript
// 监听设备方向变化
window.bindOrientationChange((e) => {
    const orientation = e.detail.orientation;
    console.log("Orientation:", orientation);  // 'portrait' | 'landscape-left' | 'landscape-right'
    
    // 调整布局
    if (orientation === 'portrait') {
        // 竖屏布局
    } else {
        // 横屏布局
    }
});
```

### 震动反馈

```javascript
// 轻微震动
hapticFeedback('light');

// 中等震动
hapticFeedback('medium');

// 重度震动
hapticFeedback('heavy');

// 成功反馈
hapticFeedback('success');

// 警告反馈
hapticFeedback('warning');

// 错误反馈
hapticFeedback('error');
```

## 构建和测试

### 在模拟器中运行

```bash
# 1. 构建 Rust 库（模拟器）
cargo build --target aarch64-apple-ios-sim --release

# 2. 在 Xcode 中选择模拟器
# 3. 点击 Run 或 Cmd+R
```

### 在真机上运行

```bash
# 1. 构建 Rust 库（真机）
cargo build --target aarch64-apple-ios --release

# 2. 连接 iOS 设备
# 3. 在 Xcode 中选择设备
# 4. 配置签名和 Team
# 5. 点击 Run
```

### 使用命令行构建

```bash
# 构建 ipa 包
xcodebuild -project ios/MyApp.xcodeproj \
    -scheme MyApp \
    -configuration Release \
    -archivePath build/MyApp.xcarchive \
    archive

xcodebuild -exportArchive \
    -archivePath build/MyApp.xcarchive \
    -exportOptionsPlist ExportOptions.plist \
    -exportPath build/
```

## 发布到 App Store

### 准备工作

1. **Apple Developer 账号**
   - 注册 [Apple Developer Program](https://developer.apple.com/programs/)
   - 费用：$99/年

2. **App Store Connect**
   - 创建应用记录
   - 填写元数据（名称、描述、截图等）

3. **证书和描述文件**
   - 创建 Distribution Certificate
   - 创建 App Store Provisioning Profile

### 配置签名

在 Xcode 中：
1. 选择项目 -> Signing & Capabilities
2. 选择 Team
3. 确保 Bundle Identifier 唯一

### 创建存档

```bash
# 使用 Xcode Archive
# Product -> Archive

# 或使用命令行
xcodebuild -project ios/MyApp.xcodeproj \
    -scheme MyApp \
    -configuration Release \
    -archivePath MyApp.xcarchive \
    archive
```

### 上传到 App Store

```bash
# 使用 xcodebuild
xcodebuild -exportArchive \
    -archivePath MyApp.xcarchive \
    -exportOptionsPlist ExportOptions.plist \
    -exportPath ./

# 上传
xcrun altool --upload-app \
    --type ios \
    --file MyApp.ipa \
    --username "your@email.com" \
    --password "@keychain:AC_PASSWORD"
```

### 审核提交

1. 在 App Store Connect 中选择构建版本
2. 填写审核信息
3. 提交审核
4. 等待苹果审核（通常 24-48 小时）

## 性能优化

### 编译优化

```toml
[profile.release]
opt-level = "z"      # 优化大小
lto = true
codegen-units = 1
strip = true
```

### 减小应用大小

```bash
# 使用 strip 移除符号
strip target/aarch64-apple-ios/release/libmy_ios_app.a

# 启用 Bitcode (Xcode 设置)
ENABLE_BITCODE = YES

# 优化图片资源
# 使用 Asset Catalog
# 启用 App Thinning
```

### 启动时间优化

```rust
// 延迟加载非必需资源
// 使用异步初始化
use tokio::task;

impl IApp for IOSApp {
    fn init_js_engine(&mut self, js_engine: &mut JsEngine) {
        // 只加载必需的模块
        
        // 异步加载其他资源
        task::spawn(async {
            load_additional_resources().await;
        });
    }
}
```

## 调试

### Xcode 调试

1. 在 Xcode 中设置断点
2. 运行应用（Cmd+R）
3. 使用 LLDB 命令：
```lldb
(lldb) po variable_name
(lldb) bt
(lldb) frame variable
```

### 日志查看

```bash
# 实时查看日志
xcrun simctl spawn booted log stream --predicate 'process == "MyApp"'

# 或使用 Console.app
```

### Instruments 性能分析

```bash
# 使用 Time Profiler
instruments -t "Time Profiler" -D trace.trace MyApp.app

# 使用 Leaks
instruments -t "Leaks" -D leaks.trace MyApp.app
```

## iOS 设计指南

### iOS 设计原则

遵循 [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/ios):

```javascript
// 使用 iOS 标准颜色
const iOSColors = {
    blue: '#007AFF',
    green: '#34C759',
    indigo: '#5856D6',
    orange: '#FF9500',
    pink: '#FF2D55',
    purple: '#AF52DE',
    red: '#FF3B30',
    teal: '#5AC8FA',
    yellow: '#FFCC00',
};

// 使用 iOS 标准字体大小
const iOSFontSizes = {
    largeTitle: 34,
    title1: 28,
    title2: 22,
    title3: 20,
    headline: 17,
    body: 17,
    callout: 16,
    subheadline: 15,
    footnote: 13,
    caption1: 12,
    caption2: 11,
};
```

### 适配 Dark Mode

```javascript
// 检测暗黑模式
const isDarkMode = window.isDarkMode();

// 应用主题
if (isDarkMode) {
    container.setStyle({
        background: '#000000',
        color: '#FFFFFF',
    });
} else {
    container.setStyle({
        background: '#FFFFFF',
        color: '#000000',
    });
}

// 监听主题变化
window.bindThemeChange((e) => {
    const isDark = e.detail.isDarkMode;
    applyTheme(isDark ? darkTheme : lightTheme);
});
```

## 常见问题

### 证书问题

**症状**: 无法在真机上运行

**解决方案**:
1. 在 Xcode 中登录 Apple ID
2. 自动管理签名
3. 或手动配置证书和描述文件

### 应用崩溃

**症状**: 应用在 iOS 上崩溃

**解决方案**:
1. 查看 Crash Report
2. 在 Xcode Console 查看日志
3. 使用 Instruments 分析

### 性能问题

**症状**: 应用在 iOS 上运行缓慢

**解决方案**:
1. 使用 Release 构建
2. 优化渲染（减少重绘）
3. 使用 Instruments 分析性能瓶颈

## 示例项目

- [iOS 基础示例](../../examples/ios-basic/)
- [iOS 触摸示例](../../examples/ios-touch/)
- [iOS 导航示例](../../examples/ios-navigation/)

## 相关资源

- [iOS Developer Documentation](https://developer.apple.com/documentation/)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Swift Documentation](https://swift.org/documentation/)
