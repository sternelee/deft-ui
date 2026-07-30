# Windows 平台开发

本指南介绍如何为 Windows 平台开发 Deft 应用程序。

## 平台特性

### 支持的 Windows 版本
- Windows 10 (版本 1809 或更高)
- Windows 11

### 渲染后端
- **SoftBuffer**: 软件渲染（默认）
- **GL**: OpenGL 渲染
- **SoftGL**: 软件实现的 OpenGL

## 开发环境

### 前置条件

1. Windows 10 或更高版本
2. Visual Studio 2019 或更高（包含 C++ 工作负载）
3. Rust 工具链
4. LLVM/Clang 14+

详细安装步骤请参考[开发环境设置](../guides/development-setup.md#windows)。

## 创建 Windows 应用

### 基本项目结构

```rust
// src/main.rs
#![windows_subsystem = "windows"]  // 隐藏控制台窗口

use deft::app::{App, IApp};
use deft::bootstrap;
use deft::loader::StaticModuleLoader;
use quick_js::loader::JsModuleLoader;

struct WindowsApp {}

impl IApp for WindowsApp {
    fn create_module_loader(&mut self) -> Box<dyn JsModuleLoader + Send + Sync + 'static> {
        let mut ml = StaticModuleLoader::new();
        ml.add_module("index.js".to_string(), include_str!("index.js").to_string());
        Box::new(ml)
    }
}

fn main() {
    let app = App::new(WindowsApp {});
    bootstrap(app);
}
```

### 窗口配置

```javascript
// src/index.js
const window = new Window({
    width: 1024,
    height: 768,
    title: "My Windows App",
    decorations: true,      // 显示标题栏
    resizable: true,        // 允许调整大小
    minimizable: true,      // 允许最小化
    maximizable: true,      // 允许最大化
    closable: true,         // 允许关闭
});
```

## Windows 特定功能

### 系统托盘图标

```javascript
// 检查系统托盘是否可用
if (typeof SystemTray !== 'undefined') {
    const tray = new SystemTray();
    tray.icon = "assets/icon.ico";  // Windows ICO 格式
    tray.title = "My App";
    
    tray.bindActivate(() => {
        console.log("Tray icon clicked");
        window.setVisible(true);
    });
    
    tray.setMenus([
        {
            id: "show",
            label: "显示窗口",
            handler() {
                window.setVisible(true);
                window.focus();
            }
        },
        {
            id: "quit",
            label: "退出",
            handler() {
                process.exit(0);
            }
        }
    ]);
}
```

### 文件对话框

```javascript
// 打开文件对话框
async function openFile() {
    const dialog = new FileDialog();
    dialog.setTitle("选择文件");
    dialog.setFilters([
        { name: "文本文件", extensions: ["txt", "md"] },
        { name: "所有文件", extensions: ["*"] }
    ]);
    
    const result = await dialog.openFile();
    if (result) {
        console.log("Selected file:", result);
        // 读取文件内容
        const content = await fs.readFile(result, "utf-8");
        console.log("File content:", content);
    }
}

// 保存文件对话框
async function saveFile() {
    const dialog = new FileDialog();
    dialog.setTitle("保存文件");
    dialog.setDefaultPath("document.txt");
    
    const result = await dialog.saveFile();
    if (result) {
        await fs.writeFile(result, "Hello, World!", "utf-8");
    }
}
```

### 剪贴板操作

```javascript
// 复制到剪贴板
clipboard.writeText("Hello, Windows!");

// 从剪贴板读取
const text = clipboard.readText();
console.log("Clipboard content:", text);

// 复制图片
const imageData = canvas.toDataURL();
clipboard.writeImage(imageData);
```

### DPI 缩放

Windows 应用需要正确处理 DPI 缩放：

```javascript
// 获取 DPI 缩放因子
const scaleFactor = window.getScaleFactor();
console.log("DPI scale factor:", scaleFactor);

// 监听 DPI 变化
window.bindScaleFactorChange((e) => {
    console.log("New scale factor:", e.detail.scaleFactor);
    // 更新 UI 以适应新的缩放
});
```

## 构建和打包

### 开发构建

```bash
# 调试构建
cargo build

# 运行
cargo run
```

### 发布构建

```bash
# 优化构建
cargo build --release

# 可执行文件位置
# target/release/your-app.exe
```

### 应用图标

1. 创建 `build.rs` 文件：

```rust
#[cfg(target_os = "windows")]
extern crate winres;

fn main() {
    #[cfg(target_os = "windows")]
    {
        let mut res = winres::WindowsResource::new();
        res.set_icon("assets/icon.ico");
        res.compile().unwrap();
    }
}
```

2. 添加构建依赖到 `Cargo.toml`：

```toml
[build-dependencies]
winres = "0.1"
```

3. 准备图标文件 `assets/icon.ico`（推荐 256x256 像素）

### 创建安装程序

#### 使用 NSIS

1. 安装 [NSIS](https://nsis.sourceforge.io/)

2. 创建 `installer.nsi`：

```nsis
!define APP_NAME "My Deft App"
!define COMP_NAME "My Company"
!define VERSION "1.0.0.0"
!define INSTALL_DIR "$PROGRAMFILES64\${APP_NAME}"

Name "${APP_NAME}"
OutFile "MyApp-Setup.exe"
InstallDir "${INSTALL_DIR}"

Section "MainSection" SEC01
    SetOutPath "$INSTDIR"
    File "target\release\your-app.exe"
    File /r "assets\*.*"
    
    CreateDirectory "$SMPROGRAMS\${APP_NAME}"
    CreateShortCut "$SMPROGRAMS\${APP_NAME}\${APP_NAME}.lnk" "$INSTDIR\your-app.exe"
    CreateShortCut "$DESKTOP\${APP_NAME}.lnk" "$INSTDIR\your-app.exe"
SectionEnd

Section "Uninstall"
    Delete "$INSTDIR\your-app.exe"
    RMDir /r "$INSTDIR\assets"
    Delete "$SMPROGRAMS\${APP_NAME}\${APP_NAME}.lnk"
    Delete "$DESKTOP\${APP_NAME}.lnk"
    RMDir "$SMPROGRAMS\${APP_NAME}"
    RMDir "$INSTDIR"
SectionEnd
```

3. 构建安装程序：

```bash
makensis installer.nsi
```

#### 使用 WiX Toolset

1. 安装 [WiX Toolset](https://wixtoolset.org/)

2. 创建 `Product.wxs`

3. 使用 cargo-wix：

```bash
cargo install cargo-wix
cargo wix init
cargo wix
```

## Windows 商店发布

### 准备

1. 注册 [Microsoft Partner Center](https://partner.microsoft.com/)
2. 创建应用预留
3. 配置应用信息

### 打包

使用 [MSIX](https://docs.microsoft.com/en-us/windows/msix/) 打包：

1. 安装 Windows SDK
2. 创建 `AppxManifest.xml`
3. 使用 MakeAppx.exe 创建包：

```bash
makeappx pack /d "build" /p "MyApp.msix"
```

## 性能优化

### 启用链接时优化 (LTO)

在 `Cargo.toml` 中：

```toml
[profile.release]
lto = true
opt-level = 3
codegen-units = 1
```

### 减小二进制大小

```toml
[profile.release]
strip = true
opt-level = "z"
lto = true
codegen-units = 1
```

### 启用 OpenGL 渲染

在 `Cargo.toml` 中：

```toml
[dependencies]
deft = { version = "0.13", features = ["gl"] }
```

在代码中指定渲染器：

```javascript
const window = new Window({
    preferredRenderers: ["GL", "SoftBuffer"],
});
```

## 调试

### 启用日志

```rust
fn main() {
    env_logger::init();
    let app = App::new(WindowsApp {});
    bootstrap(app);
}
```

添加依赖：
```toml
[dependencies]
env_logger = "0.11"
log = "0.4"
```

### 调试控制台

开发时显示控制台：

```rust
// 开发模式
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
```

## 常见问题

### 防病毒软件误报

**解决方案**: 
- 使用代码签名证书
- 联系防病毒软件厂商报告误报

### 启动性能

**优化策略**:
- 延迟加载非关键模块
- 使用异步初始化
- 预编译资源

### 高 DPI 显示

**解决方案**:
```rust
// 在 Cargo.toml 中添加 manifest
[package.metadata.winres]
OriginalFilename = "MyApp.exe"
LegalCopyright = "Copyright © 2024"

[[package.metadata.winres.manifest]]
'''
<assembly xmlns="urn:schemas-microsoft-com:asm.v1" manifestVersion="1.0">
  <application xmlns="urn:schemas-microsoft-com:asm.v3">
    <windowsSettings>
      <dpiAware xmlns="http://schemas.microsoft.com/SMI/2005/WindowsSettings">true</dpiAware>
    </windowsSettings>
  </application>
</assembly>
'''
```

## 示例项目

查看完整的 Windows 示例：
- [基础 Windows 应用](../../examples/windows-basic/)
- [系统托盘示例](../../examples/windows-tray/)
- [文件对话框示例](../../examples/windows-dialog/)

## 相关资源

- [Windows API 文档](https://docs.microsoft.com/en-us/windows/)
- [Rust Windows 开发](https://docs.microsoft.com/en-us/windows/dev-environment/rust/)
- [Winit Windows 后端](https://docs.rs/winit/latest/winit/)
