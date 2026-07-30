# macOS 平台开发

本指南介绍如何为 macOS 平台开发 Deft 应用程序。

## 平台支持

### 支持的 macOS 版本
- macOS 10.12 (Sierra) 及更高版本
- macOS 11 (Big Sur) 及更高版本
- macOS 12 (Monterey)、13 (Ventura)、14 (Sonoma)

### 支持的架构
- x86_64 (Intel)
- aarch64 (Apple Silicon / M1/M2/M3)

## 开发环境设置

### 前置条件

1. macOS 10.12 或更高版本
2. Xcode Command Line Tools
3. Rust 工具链
4. Homebrew (推荐)

### 安装步骤

```bash
# 1. 安装 Xcode Command Line Tools
xcode-select --install

# 2. 安装 Homebrew（如果尚未安装）
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 3. 安装依赖
brew install llvm pkg-config

# 4. 安装 Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# 5. 配置环境变量
echo 'export PATH="/usr/local/opt/llvm/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

详细设置请参考[开发环境设置](../guides/development-setup.md#macos)。

## 创建 macOS 应用

### 基本项目结构

```rust
// src/main.rs
#![windows_subsystem = "windows"]  // 隐藏终端窗口

use deft::app::{App, IApp};
use deft::bootstrap;
use deft::loader::StaticModuleLoader;
use quick_js::loader::JsModuleLoader;

struct MacOSApp {}

impl IApp for MacOSApp {
    fn create_module_loader(&mut self) -> Box<dyn JsModuleLoader + Send + Sync + 'static> {
        let mut ml = StaticModuleLoader::new();
        ml.add_module("index.js".to_string(), include_str!("index.js").to_string());
        Box::new(ml)
    }
}

fn main() {
    let app = App::new(MacOSApp {});
    bootstrap(app);
}
```

### 窗口配置

```javascript
// src/index.js
const window = new Window({
    width: 1024,
    height: 768,
    title: "My macOS App",
    decorations: true,      // 使用原生窗口装饰
    resizable: true,
});
```

## macOS 特定功能

### 菜单栏

macOS 应用通常使用顶部菜单栏：

```javascript
// 创建应用菜单
const appMenu = {
    label: "My App",
    submenu: [
        {
            label: "About My App",
            handler() {
                showAboutDialog();
            }
        },
        { type: "separator" },
        {
            label: "Preferences...",
            accelerator: "Cmd+,",
            handler() {
                showPreferences();
            }
        },
        { type: "separator" },
        {
            label: "Quit",
            accelerator: "Cmd+Q",
            handler() {
                process.exit(0);
            }
        }
    ]
};

const fileMenu = {
    label: "File",
    submenu: [
        {
            label: "New",
            accelerator: "Cmd+N",
            handler() {
                createNewDocument();
            }
        },
        {
            label: "Open...",
            accelerator: "Cmd+O",
            handler() {
                openFile();
            }
        },
        {
            label: "Save",
            accelerator: "Cmd+S",
            handler() {
                saveFile();
            }
        }
    ]
};

// 设置菜单
window.setMenuBar([appMenu, fileMenu]);
```

### 系统托盘（状态栏）

```javascript
if (typeof SystemTray !== 'undefined') {
    const tray = new SystemTray();
    
    // macOS 推荐使用 PNG 格式的模板图标
    tray.setIcon("assets/icon-template.png");
    tray.setTitle("My App");
    
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
                window.focus();
            }
        },
        { type: "separator" },
        {
            id: "quit",
            label: "Quit My App",
            handler() {
                process.exit(0);
            }
        }
    ]);
}
```

### 文件对话框

macOS 原生文件对话框：

```javascript
async function openFile() {
    const dialog = new FileDialog();
    dialog.setTitle("Open File");
    dialog.setFilters([
        { name: "Documents", extensions: ["txt", "md", "pdf"] },
        { name: "All Files", extensions: ["*"] }
    ]);
    
    // macOS 特定选项
    dialog.setOptions({
        canChooseFiles: true,
        canChooseDirectories: false,
        allowsMultipleSelection: false,
        canCreateDirectories: true,
    });
    
    const filePath = await dialog.openFile();
    if (filePath) {
        console.log("Selected:", filePath);
    }
}

async function saveFile() {
    const dialog = new FileDialog();
    dialog.setTitle("Save File");
    dialog.setDefaultPath("~/Documents/untitled.txt");
    
    const savePath = await dialog.saveFile();
    if (savePath) {
        await fs.writeFile(savePath, content, "utf-8");
    }
}
```

### Touch Bar 支持

对于带 Touch Bar 的 MacBook：

```javascript
// 配置 Touch Bar
if (window.supportsTouchBar) {
    window.setTouchBar([
        {
            type: "button",
            label: "Save",
            icon: "💾",
            handler() {
                saveFile();
            }
        },
        {
            type: "button",
            label: "Open",
            icon: "📂",
            handler() {
                openFile();
            }
        }
    ]);
}
```

### Retina 显示屏支持

Deft 自动处理 Retina 显示：

```javascript
// 获取缩放因子
const scaleFactor = window.getScaleFactor();
console.log("Scale factor:", scaleFactor);  // Retina 上通常是 2.0

// 监听缩放变化
window.bindScaleFactorChange((e) => {
    console.log("New scale:", e.detail.scaleFactor);
});
```

### 拖放支持

```javascript
container.bindDroppedFile((e) => {
    const files = e.detail.files;
    console.log("Dropped files:", files);
    
    files.forEach(file => {
        console.log("File:", file.path);
    });
});
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

# 可执行文件位置
# target/release/my-macos-app
```

### 创建 .app 包

创建标准的 macOS 应用包：

#### 1. 创建目录结构

```bash
mkdir -p MyApp.app/Contents/MacOS
mkdir -p MyApp.app/Contents/Resources
```

#### 2. 复制可执行文件

```bash
cp target/release/my-macos-app MyApp.app/Contents/MacOS/
```

#### 3. 创建 Info.plist

```bash
cat > MyApp.app/Contents/Info.plist << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>en</string>
    <key>CFBundleExecutable</key>
    <string>my-macos-app</string>
    <key>CFBundleIdentifier</key>
    <string>com.example.myapp</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>My App</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0.0</string>
    <key>CFBundleVersion</key>
    <string>1</string>
    <key>LSMinimumSystemVersion</key>
    <string>10.12</string>
    <key>NSHighResolutionCapable</key>
    <true/>
    <key>NSHumanReadableCopyright</key>
    <string>Copyright © 2024 Your Name</string>
</dict>
</plist>
EOF
```

#### 4. 添加图标

```bash
# 创建 .icns 图标文件（需要多个尺寸的 PNG）
# 使用 iconutil 工具
mkdir MyIcon.iconset
# 添加各种尺寸的图标...
# icon_16x16.png, icon_32x32.png, 等等
iconutil -c icns MyIcon.iconset -o MyApp.app/Contents/Resources/AppIcon.icns

# 在 Info.plist 中引用
# <key>CFBundleIconFile</key>
# <string>AppIcon</string>
```

### 代码签名

为了在 macOS 上分发，需要对应用进行签名：

```bash
# 使用开发者证书签名
codesign --force --deep --sign "Developer ID Application: Your Name" MyApp.app

# 验证签名
codesign --verify --verbose MyApp.app
spctl --assess --verbose MyApp.app
```

### 公证（Notarization）

对于 macOS 10.14.5+，需要公证应用：

```bash
# 1. 创建 DMG 或 ZIP
hdiutil create -volname "My App" -srcfolder MyApp.app -ov -format UDZO MyApp.dmg

# 2. 上传公证
xcrun notarytool submit MyApp.dmg --apple-id "your@email.com" --team-id "TEAM_ID" --wait

# 3. 装订公证票据
xcrun stapler staple MyApp.dmg
```

### 创建 DMG 安装包

使用 `create-dmg` 工具：

```bash
# 安装 create-dmg
brew install create-dmg

# 创建 DMG
create-dmg \
  --volname "My App" \
  --window-pos 200 120 \
  --window-size 800 400 \
  --icon-size 100 \
  --icon "MyApp.app" 200 190 \
  --hide-extension "MyApp.app" \
  --app-drop-link 600 185 \
  "MyApp.dmg" \
  "MyApp.app"
```

## Universal Binary（通用二进制）

构建同时支持 Intel 和 Apple Silicon 的应用：

```bash
# 添加目标
rustup target add x86_64-apple-darwin
rustup target add aarch64-apple-darwin

# 构建两个架构
cargo build --release --target x86_64-apple-darwin
cargo build --release --target aarch64-apple-darwin

# 合并为 Universal Binary
lipo -create \
  target/x86_64-apple-darwin/release/my-macos-app \
  target/aarch64-apple-darwin/release/my-macos-app \
  -output my-macos-app-universal
```

## 性能优化

### 编译优化

在 `Cargo.toml` 中：

```toml
[profile.release]
opt-level = 3
lto = true
codegen-units = 1
strip = true
```

### 减小应用大小

```bash
# 使用 strip 移除符号
strip target/release/my-macos-app

# 使用 UPX 压缩（可选）
brew install upx
upx --best --lzma target/release/my-macos-app
```

## 调试

### 使用 LLDB 调试

```bash
# 构建调试版本
cargo build

# 使用 LLDB
lldb target/debug/my-macos-app

# LLDB 命令
(lldb) breakpoint set --name main
(lldb) run
(lldb) bt  # 查看调用栈
```

### 查看系统日志

```bash
# 查看应用日志
log stream --predicate 'processImagePath contains "my-macos-app"' --level debug

# 使用 Console.app
open /Applications/Utilities/Console.app
```

## macOS 特定考虑事项

### 沙箱（Sandbox）

如果要在 Mac App Store 分发，需要启用沙箱：

```xml
<!-- Entitlements.plist -->
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.security.app-sandbox</key>
    <true/>
    <key>com.apple.security.files.user-selected.read-write</key>
    <true/>
    <key>com.apple.security.network.client</key>
    <true/>
</dict>
</plist>
```

签名时应用授权：

```bash
codesign --force --sign "Developer ID" --entitlements Entitlements.plist MyApp.app
```

### 暗黑模式支持

```javascript
// 检测系统主题
function getSystemTheme() {
    // macOS 会自动适配
    // 可以通过 CSS 媒体查询检测
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// 监听主题变化
window.matchMedia('(prefers-color-scheme: dark)').addListener((e) => {
    const theme = e.matches ? 'dark' : 'light';
    applyTheme(theme);
});
```

## 常见问题

### 权限问题

**症状**: 应用无法访问文件系统或网络

**解决方案**: 在 Info.plist 中添加权限说明：

```xml
<key>NSCameraUsageDescription</key>
<string>This app needs camera access</string>
<key>NSMicrophoneUsageDescription</key>
<string>This app needs microphone access</string>
```

### Gatekeeper 阻止

**症状**: 运行时提示"无法验证开发者"

**解决方案**:
```bash
# 临时允许
xattr -cr MyApp.app

# 或进行代码签名和公证
```

### Retina 显示模糊

**解决方案**: 在 Info.plist 中设置：

```xml
<key>NSHighResolutionCapable</key>
<true/>
```

## 示例项目

- [macOS 基础示例](../../examples/macos-basic/)
- [macOS 菜单栏示例](../../examples/macos-menubar/)
- [macOS 文件对话框示例](../../examples/macos-dialogs/)

## 相关资源

- [Apple Developer Documentation](https://developer.apple.com/documentation/)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/macos)
- [App Distribution Guide](https://developer.apple.com/distribute/)
- [Code Signing Guide](https://developer.apple.com/support/code-signing/)
