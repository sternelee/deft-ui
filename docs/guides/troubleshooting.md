# 常见问题和故障排除

本指南收集了 Deft UI 开发中常见的问题及其解决方案。

## 环境设置问题

### Rust 工具链问题

#### 问题：找不到 `rustc` 或 `cargo`

**症状**:
```bash
command not found: cargo
```

**解决方案**:
1. 确保已安装 Rust：
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

2. 重新加载环境变量：
```bash
source $HOME/.cargo/env
```

3. 验证安装：
```bash
rustc --version
cargo --version
```

#### 问题：Rust 版本过旧

**症状**:
```
error: package requires rustc 1.70.0 or newer
```

**解决方案**:
```bash
rustup update stable
rustup default stable
```

### Clang/LLVM 问题

#### 问题：找不到 Clang

**症状**:
```
error: failed to run custom build command for `skia-safe`
  = note: Could not find clang
```

**解决方案**:

**Linux (Ubuntu/Debian)**:
```bash
sudo apt install clang-14 libclang-14-dev
```

**macOS**:
```bash
brew install llvm
export PATH="/usr/local/opt/llvm/bin:$PATH"
```

**Windows**:
```powershell
choco install llvm
```

#### 问题：Clang 版本过低

**症状**:
```
error: Clang 14 or later is required
```

**解决方案**:
- 安装最新版本的 Clang（14+）
- 设置环境变量指向新版本

### 依赖库缺失

#### 问题：Linux 上缺少系统库

**症状**:
```
error: linking with `cc` failed
  = note: /usr/bin/ld: cannot find -lxcb
```

**解决方案**:

**Ubuntu/Debian**:
```bash
sudo apt install \
    build-essential \
    libxcb-xfixes0-dev \
    libxcb-shape0-dev \
    libdbus-1-dev \
    libasound2-dev \
    libegl-dev \
    libgles-dev
```

**Fedora**:
```bash
sudo dnf install \
    gcc gcc-c++ \
    libxcb-devel \
    dbus-devel \
    alsa-lib-devel \
    mesa-libEGL-devel
```

## 编译问题

### 编译错误

#### 问题：链接错误

**症状**:
```
error: linking with `cc` failed: exit status: 1
```

**解决方案**:
1. 清理构建缓存：
```bash
cargo clean
```

2. 更新依赖：
```bash
cargo update
```

3. 重新构建：
```bash
cargo build
```

#### 问题：内存不足

**症状**:
```
error: could not compile `deft` due to previous error
signal: 9, SIGKILL: kill
```

**解决方案**:
1. 减少并行编译任务：
```bash
cargo build -j 2
```

2. 在 `.cargo/config.toml` 中设置：
```toml
[build]
jobs = 2
```

#### 问题：增量编译问题

**症状**:
构建时出现奇怪的错误，但代码看起来正确。

**解决方案**:
1. 禁用增量编译：
```bash
CARGO_INCREMENTAL=0 cargo build
```

2. 或在 `Cargo.toml` 中：
```toml
[profile.dev]
incremental = false
```

### 特定平台问题

#### Android NDK 配置错误

**症状**:
```
error: linker `aarch64-linux-android33-clang` not found
```

**解决方案**:
1. 确保 `ANDROID_NDK_HOME` 正确设置
2. 检查 `.cargo/config.toml` 中的路径
3. 确保使用正确的 API level

#### iOS 构建失败

**症状**:
```
error: failed to run custom build command for `deft`
```

**解决方案**:
1. 确保安装了 Xcode Command Line Tools
2. 添加 iOS 目标：
```bash
rustup target add aarch64-apple-ios
```

## 运行时问题

### 应用崩溃

#### 问题：启动时崩溃

**症状**:
应用启动后立即崩溃，无错误信息。

**解决方案**:
1. 启用日志查看详细错误：
```rust
fn main() {
    env_logger::init();
    // ...
}
```

2. 运行时设置日志级别：
```bash
RUST_LOG=debug cargo run
```

3. 检查 JavaScript 语法错误：
```javascript
try {
    main();
} catch (error) {
    console.error("Error:", error, error.stack);
}
```

#### 问题：分段错误（Segfault）

**症状**:
```
Segmentation fault (core dumped)
```

**解决方案**:
1. 使用调试构建运行：
```bash
cargo build
./target/debug/your-app
```

2. 使用 GDB/LLDB 调试：
```bash
gdb target/debug/your-app
(gdb) run
(gdb) bt
```

3. 启用 backtrace：
```bash
RUST_BACKTRACE=1 cargo run
```

### 性能问题

#### 问题：UI 渲染缓慢

**症状**:
界面响应慢，帧率低。

**解决方案**:
1. 使用发布构建：
```bash
cargo build --release
```

2. 启用 OpenGL 渲染：
```toml
[dependencies]
deft = { version = "0.13", features = ["gl"] }
```

3. 减少不必要的重绘：
```javascript
// 避免在循环中频繁更新
// ❌ 不好
for (let i = 0; i < 1000; i++) {
    element.setStyle({ ... });
}

// ✅ 好
// 批量更新或使用虚拟化列表
```

#### 问题：内存占用过高

**症状**:
应用内存使用持续增长。

**解决方案**:
1. 检查内存泄漏：
```javascript
// 确保移除事件监听器
element.unbindClick(handler);

// 移除不用的元素
parent.removeChild(child);
```

2. 使用内存分析工具：
```bash
valgrind --leak-check=full ./target/debug/your-app
```

### JavaScript 相关问题

#### 问题：JavaScript 代码不执行

**症状**:
UI 不显示，控制台无输出。

**解决方案**:
1. 检查模块加载：
```rust
impl IApp for MyApp {
    fn create_module_loader(&mut self) -> Box<dyn JsModuleLoader + Send + Sync + 'static> {
        let mut ml = StaticModuleLoader::new();
        ml.add_module("index.js".to_string(), include_str!("index.js").to_string());
        Box::new(ml)
    }
}
```

2. 检查 JavaScript 语法：
```javascript
// 使用严格模式
"use strict";

// 捕获错误
try {
    // 你的代码
} catch (e) {
    console.error("Error:", e);
}
```

#### 问题：undefined 错误

**症状**:
```
TypeError: Cannot read property 'xxx' of undefined
```

**解决方案**:
1. 检查对象是否已初始化
2. 使用可选链：
```javascript
const value = obj?.property;
```

3. 添加防御性检查：
```javascript
if (element && element.parent) {
    // 安全操作
}
```

## 平台特定问题

### Windows

#### 问题：防病毒软件阻止

**症状**:
应用被防病毒软件标记为威胁。

**解决方案**:
1. 使用代码签名
2. 向防病毒厂商报告误报
3. 临时添加到白名单（仅开发时）

#### 问题：DPI 缩放问题

**症状**:
界面在高 DPI 显示器上模糊。

**解决方案**:
添加 manifest 启用 DPI 感知：
```rust
// 在 build.rs 中
#[cfg(target_os = "windows")]
{
    let mut res = winres::WindowsResource::new();
    res.set_manifest(r#"
        <assembly xmlns="urn:schemas-microsoft-com:asm.v1" manifestVersion="1.0">
          <application xmlns="urn:schemas-microsoft-com:asm.v3">
            <windowsSettings>
              <dpiAware xmlns="http://schemas.microsoft.com/SMI/2005/WindowsSettings">true</dpiAware>
            </windowsSettings>
          </application>
        </assembly>
    "#);
    res.compile().unwrap();
}
```

### macOS

#### 问题：Gatekeeper 阻止

**症状**:
```
"App" cannot be opened because the developer cannot be verified
```

**解决方案**:
1. 临时允许：
```bash
xattr -cr YourApp.app
```

2. 或进行代码签名：
```bash
codesign --force --deep --sign "Developer ID" YourApp.app
```

#### 问题：权限被拒绝

**症状**:
无法访问文件、摄像头等。

**解决方案**:
在 `Info.plist` 中添加权限说明：
```xml
<key>NSCameraUsageDescription</key>
<string>This app needs camera access</string>
<key>NSMicrophoneUsageDescription</key>
<string>This app needs microphone access</string>
```

### Linux

#### 问题：Wayland 显示问题

**症状**:
在 Wayland 下窗口无法显示或行为异常。

**解决方案**:
1. 确保安装 Wayland 支持：
```bash
sudo apt install libwayland-dev
```

2. 或临时使用 X11：
```bash
GDK_BACKEND=x11 ./your-app
```

#### 问题：缺少图标

**症状**:
应用图标不显示。

**解决方案**:
1. 确保图标文件存在
2. 使用正确的图标格式（PNG）
3. 检查 .desktop 文件配置

### Android

#### 问题：应用安装失败

**症状**:
```
INSTALL_FAILED_NO_MATCHING_ABIS
```

**解决方案**:
1. 确保为正确的架构构建
2. 检查 `build.gradle` 中的 `abiFilters`
3. 构建所有架构：
```bash
cargo build --target aarch64-linux-android --release
cargo build --target armv7-linux-androideabi --release
```

#### 问题：权限被拒绝

**症状**:
应用功能无法使用（网络、存储等）。

**解决方案**:
在 `AndroidManifest.xml` 中添加权限：
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
```

## 调试技巧

### 启用详细日志

```rust
// Cargo.toml
[dependencies]
log = "0.4"
env_logger = "0.11"

// main.rs
fn main() {
    env_logger::Builder::from_default_env()
        .filter_level(log::LevelFilter::Debug)
        .init();
    // ...
}
```

运行时：
```bash
RUST_LOG=debug cargo run
```

### 使用 backtrace

```bash
RUST_BACKTRACE=1 cargo run
RUST_BACKTRACE=full cargo run  # 更详细
```

### 性能分析

```bash
# 使用 perf (Linux)
cargo build --release
perf record ./target/release/your-app
perf report

# 使用 Instruments (macOS)
instruments -t "Time Profiler" ./target/release/your-app
```

### 内存分析

```bash
# Valgrind (Linux)
cargo build
valgrind --leak-check=full ./target/debug/your-app

# Heaptrack (Linux)
heaptrack ./target/release/your-app
heaptrack_gui heaptrack.your-app.*.gz
```

## 获取帮助

### 报告问题

当遇到无法解决的问题时：

1. **搜索现有 Issues**
   - 查看 [GitHub Issues](https://github.com/deft-ui/deft/issues)

2. **准备信息**
   - 操作系统和版本
   - Rust 版本（`rustc --version`）
   - Deft 版本
   - 完整错误信息
   - 最小复现代码

3. **创建新 Issue**
   ```markdown
   ### 环境
   - OS: Ubuntu 22.04
   - Rust: 1.75.0
   - Deft: 0.13.0
   
   ### 问题描述
   [详细描述问题]
   
   ### 复现步骤
   1. ...
   2. ...
   
   ### 预期行为
   [描述预期结果]
   
   ### 实际行为
   [描述实际结果]
   
   ### 错误信息
   ```
   [粘贴完整错误]
   ```
   ```

### 社区资源

- [GitHub Discussions](https://github.com/deft-ui/deft/discussions)
- [官方文档](https://deft-ui.github.io/)
- [示例代码](https://github.com/deft-ui/deft/tree/main/examples)

## 最佳实践

### 1. 渐进式开发

从简单开始，逐步添加功能：
```javascript
// 1. 先确保基础工作
const window = new Window();
window.setBody(new LabelElement().setText("Hello"));

// 2. 然后添加样式
// 3. 最后添加交互
```

### 2. 错误处理

始终处理可能的错误：
```javascript
try {
    // 可能出错的代码
} catch (error) {
    console.error("Error:", error);
    // 显示用户友好的错误信息
}
```

### 3. 测试

在不同环境测试：
- 不同操作系统
- 不同屏幕分辨率
- 不同 DPI 设置

### 4. 性能监控

定期检查性能：
```javascript
console.time('operation');
// 你的代码
console.timeEnd('operation');
```

## 相关资源

- [快速开始指南](./quick-start.md)
- [开发环境设置](./development-setup.md)
- [平台特定指南](../platforms/)
- [API 参考](../api/)
