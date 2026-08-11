# Linux 平台开发

本指南介绍如何为 Linux 平台开发 Deft 应用程序。

## 平台支持

### 支持的显示服务器
- **X11**: 完全支持
- **Wayland**: 完全支持（通过 Wayland 和 XWayland）

### 支持的发行版
- Ubuntu 20.04+
- Debian 11+
- Fedora 35+
- Arch Linux
- openSUSE
- 其他主流 Linux 发行版

## 开发环境设置

详细安装步骤请参考[开发环境设置](../guides/development-setup.md#linux)。

### Ubuntu/Debian 快速设置

```bash
# 安装所有必需的依赖
sudo apt update && sudo apt install -y \
    build-essential \
    curl \
    libssl-dev \
    libclang-dev \
    libc++-dev \
    xorg-dev \
    libxcb-xfixes0-dev \
    libxcb-shape0-dev \
    libdbus-1-dev \
    libasound2-dev \
    libegl-dev \
    libgles-dev \
    librust-wayland-egl-dev

# 安装 Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# 安装 Node.js（使用 NodeSource）
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs
```

## 创建 Linux 应用

### 基本项目结构

```rust
// src/main.rs
use deft::app::{App, IApp};
use deft::bootstrap;
use deft::loader::StaticModuleLoader;
use quick_js::loader::JsModuleLoader;

struct LinuxApp {}

impl IApp for LinuxApp {
    fn create_module_loader(&mut self) -> Box<dyn JsModuleLoader + Send + Sync + 'static> {
        let mut ml = StaticModuleLoader::new();
        ml.add_module("index.js".to_string(), include_str!("index.js").to_string());
        Box::new(ml)
    }
}

fn main() {
    env_logger::init();
    let app = App::new(LinuxApp {});
    bootstrap(app);
}
```

### 窗口配置

```javascript
// src/index.js
const window = new Window({
    width: 1024,
    height: 768,
    title: "My Linux App",
    decorations: true,      // 使用系统窗口装饰
    resizable: true,
});
```

## Linux 特定功能

### DBus 集成

与系统服务交互：

```rust
// Cargo.toml
[dependencies]
deft = "0.13"
dbus = "0.9"

// src/main.rs
use dbus::blocking::Connection;
use std::time::Duration;

fn send_notification(title: &str, body: &str) -> Result<(), Box<dyn std::error::Error>> {
    let conn = Connection::new_session()?;
    let proxy = conn.with_proxy(
        "org.freedesktop.Notifications",
        "/org/freedesktop/Notifications",
        Duration::from_millis(5000),
    );
    
    use dbus::arg::{RefArg, Variant};
    let empty_array: Vec<&str> = vec![];
    let hints: std::collections::HashMap<String, Variant<Box<dyn RefArg>>> =
        std::collections::HashMap::new();
    
    let _: (u32,) = proxy.method_call(
        "org.freedesktop.Notifications",
        "Notify",
        (
            "MyApp",
            0u32,
            "",
            title,
            body,
            empty_array,
            hints,
            5000i32,
        ),
    )?;
    
    Ok(())
}
```

在 JavaScript 中调用：

```javascript
// 通过 Rust FFI 暴露功能
function showNotification(title, body) {
    // 调用 Rust 函数
    notify(title, body);
}
```

### 系统托盘

Linux 支持系统托盘（通过 StatusNotifier/AppIndicator）：

```javascript
if (typeof SystemTray !== 'undefined') {
    const tray = new SystemTray();
    
    // Linux 推荐使用 PNG 格式图标
    tray.setIcon("assets/icon.png");
    tray.setTitle("My Linux App");
    
    tray.bindActivate(() => {
        window.setVisible(true);
        window.focus();
    });
    
    tray.setMenus([
        {
            id: "show",
            label: "Show Window",
            handler() {
                window.setVisible(true);
            }
        },
        {
            id: "about",
            label: "About",
            handler() {
                showAboutDialog();
            }
        },
        {
            id: "quit",
            label: "Quit",
            handler() {
                process.exit(0);
            }
        }
    ]);
}
```

### 文件对话框

```javascript
async function openFile() {
    const dialog = new FileDialog();
    dialog.setTitle("Open File");
    dialog.setFilters([
        { name: "Text Files", extensions: ["txt", "md"] },
        { name: "All Files", extensions: ["*"] }
    ]);
    
    const filePath = await dialog.openFile();
    if (filePath) {
        console.log("Selected:", filePath);
        const content = await fs.readFile(filePath, "utf-8");
        console.log("Content:", content);
    }
}
```

### 剪贴板操作

```javascript
// 复制到剪贴板
clipboard.writeText("Hello from Linux!");

// 读取剪贴板
const text = clipboard.readText();
console.log("Clipboard:", text);
```

### HiDPI 支持

Deft 自动处理 HiDPI 显示：

```javascript
// 获取缩放因子
const scaleFactor = window.getScaleFactor();
console.log("Scale factor:", scaleFactor);

// 监听缩放变化
window.bindScaleFactorChange((e) => {
    console.log("New scale:", e.detail.scaleFactor);
    // 更新 UI
});
```

### Wayland 特定功能

```rust
// 检测 Wayland 会话
fn is_wayland() -> bool {
    std::env::var("WAYLAND_DISPLAY").is_ok()
}

// 在 Wayland 下可能需要特殊处理
fn main() {
    if is_wayland() {
        println!("Running on Wayland");
        // Wayland 特定初始化
    } else {
        println!("Running on X11");
    }
    
    let app = App::new(LinuxApp {});
    bootstrap(app);
}
```

## 构建和打包

### 开发构建

```bash
cargo build
cargo run
```

### 发布构建

```bash
cargo build --release
strip target/release/my-linux-app  # 移除符号以减小大小
```

### 创建 AppImage

AppImage 是 Linux 上流行的分发格式：

1. **安装 linuxdeploy**:

```bash
wget https://github.com/linuxdeploy/linuxdeploy/releases/download/continuous/linuxdeploy-x86_64.AppImage
chmod +x linuxdeploy-x86_64.AppImage
```

2. **创建 AppDir 结构**:

```bash
mkdir -p AppDir/usr/bin
mkdir -p AppDir/usr/share/applications
mkdir -p AppDir/usr/share/icons/hicolor/256x256/apps

# 复制二进制文件
cp target/release/my-linux-app AppDir/usr/bin/

# 复制图标
cp assets/icon.png AppDir/usr/share/icons/hicolor/256x256/apps/my-linux-app.png
```

3. **创建 .desktop 文件**:

```bash
cat > AppDir/usr/share/applications/my-linux-app.desktop << EOF
[Desktop Entry]
Type=Application
Name=My Linux App
Exec=my-linux-app
Icon=my-linux-app
Categories=Utility;
EOF
```

4. **构建 AppImage**:

```bash
./linuxdeploy-x86_64.AppImage --appdir AppDir --output appimage
```

### 创建 DEB 包

使用 `cargo-deb`:

```bash
# 安装 cargo-deb
cargo install cargo-deb

# 配置 Cargo.toml
```

添加到 `Cargo.toml`:

```toml
[package.metadata.deb]
maintainer = "Your Name <your@email.com>"
copyright = "2024, Your Name <your@email.com>"
depends = "$auto, libxcb1, libdbus-1-3"
section = "utility"
priority = "optional"
assets = [
    ["target/release/my-linux-app", "usr/bin/", "755"],
    ["assets/icon.png", "usr/share/icons/hicolor/256x256/apps/my-linux-app.png", "644"],
    ["my-linux-app.desktop", "usr/share/applications/", "644"],
]

[package.metadata.deb.systemd-units]
```

构建 DEB 包:

```bash
cargo deb
```

### 创建 RPM 包

使用 `cargo-generate-rpm`:

```bash
# 安装
cargo install cargo-generate-rpm

# 构建
cargo build --release
cargo generate-rpm
```

### Flatpak 打包

1. **创建 manifest** (`com.example.MyLinuxApp.yml`):

```yaml
app-id: com.example.MyLinuxApp
runtime: org.freedesktop.Platform
runtime-version: '23.08'
sdk: org.freedesktop.Sdk
command: my-linux-app
finish-args:
  - --share=ipc
  - --socket=x11
  - --socket=wayland
  - --device=dri
  - --filesystem=home

modules:
  - name: my-linux-app
    buildsystem: simple
    build-commands:
      - install -Dm755 my-linux-app /app/bin/my-linux-app
      - install -Dm644 icon.png /app/share/icons/hicolor/256x256/apps/com.example.MyLinuxApp.png
    sources:
      - type: file
        path: target/release/my-linux-app
      - type: file
        path: assets/icon.png
```

2. **构建 Flatpak**:

```bash
flatpak-builder build-dir com.example.MyLinuxApp.yml --force-clean
flatpak-builder --repo=repo --force-clean build-dir com.example.MyLinuxApp.yml
```

### Snap 打包

1. **创建 snapcraft.yaml**:

```yaml
name: my-linux-app
version: '1.0'
summary: My Linux Application
description: A Deft UI application

base: core22
confinement: strict
grade: stable

apps:
  my-linux-app:
    command: bin/my-linux-app
    plugs:
      - x11
      - wayland
      - desktop
      - desktop-legacy
      - home

parts:
  my-app:
    plugin: rust
    source: .
    build-packages:
      - libxcb-xfixes0-dev
      - libxcb-shape0-dev
      - libdbus-1-dev
```

2. **构建 Snap**:

```bash
snapcraft
```

## 桌面集成

### .desktop 文件

创建 `my-linux-app.desktop`:

```ini
[Desktop Entry]
Type=Application
Version=1.0
Name=My Linux App
Comment=A cross-platform application
Exec=/usr/bin/my-linux-app
Icon=my-linux-app
Terminal=false
Categories=Utility;Development;
Keywords=deft;app;
```

安装:

```bash
sudo cp my-linux-app.desktop /usr/share/applications/
sudo update-desktop-database
```

### MIME 类型关联

创建 `my-linux-app.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<mime-info xmlns="http://www.freedesktop.org/standards/shared-mime-info">
  <mime-type type="application/x-myapp-project">
    <comment>My App Project File</comment>
    <glob pattern="*.myapp"/>
  </mime-type>
</mime-info>
```

安装:

```bash
sudo cp my-linux-app.xml /usr/share/mime/packages/
sudo update-mime-database /usr/share/mime
```

## 性能优化

### 编译优化

在 `Cargo.toml` 中:

```toml
[profile.release]
opt-level = 3
lto = true
codegen-units = 1
strip = true
```

### 选择渲染后端

```javascript
// 优先使用 OpenGL 渲染
const window = new Window({
    preferredRenderers: ["GL", "SoftBuffer"],
});
```

在 `Cargo.toml` 中启用 GL 特性:

```toml
[dependencies]
deft = { version = "0.13", features = ["gl"] }
```

## 调试

### 启用日志

```bash
# 设置日志级别
RUST_LOG=debug cargo run

# 仅显示应用日志
RUST_LOG=my_linux_app=debug cargo run
```

### 使用 GDB 调试

```bash
# 调试构建
cargo build

# 使用 GDB
gdb target/debug/my-linux-app

# GDB 命令
(gdb) break main
(gdb) run
(gdb) backtrace
```

### Valgrind 内存检查

```bash
cargo build
valgrind --leak-check=full target/debug/my-linux-app
```

## 常见问题

### 缺少库依赖

**症状**: 运行时错误提示缺少共享库

**解决方案**:
```bash
# 检查依赖
ldd target/release/my-linux-app

# 安装缺少的库
sudo apt install <missing-package>
```

### Wayland 会话问题

**症状**: 在 Wayland 下窗口无法显示

**解决方案**: 确保安装了 Wayland 支持库:
```bash
sudo apt install librust-wayland-egl-dev
```

### 权限问题

**症状**: 无法访问某些系统资源

**解决方案**: 检查文件权限和用户组:
```bash
# 将用户添加到相关组
sudo usermod -a -G video,audio $USER
```

### HiDPI 缩放问题

**解决方案**: 设置环境变量:
```bash
# GTK 应用
export GDK_SCALE=2
export GDK_DPI_SCALE=0.5

# Qt 应用
export QT_AUTO_SCREEN_SCALE_FACTOR=1
```

## 示例项目

- [Linux 基础示例](../../examples/linux-basic/)
- [Linux 系统托盘示例](../../examples/linux-tray/)
- [DBus 集成示例](../../examples/linux-dbus/)

## 相关资源

- [FreeDesktop 标准](https://www.freedesktop.org/wiki/Specifications/)
- [Linux 桌面应用开发](https://developer.gnome.org/)
- [Wayland 协议](https://wayland.freedesktop.org/)
- [DBus 规范](https://dbus.freedesktop.org/doc/dbus-specification.html)
