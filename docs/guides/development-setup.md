# 开发环境设置

本指南将帮助你在不同平台上设置 Deft 开发环境。

## 通用依赖

所有平台都需要以下工具：

### 1. Rust 工具链

访问 [rustup.rs](https://rustup.rs/) 安装 Rust：

```bash
# Linux/macOS
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Windows
# 下载并运行 rustup-init.exe
```

验证安装：
```bash
rustc --version
cargo --version
```

### 2. Node.js

访问 [nodejs.org](https://nodejs.org/) 安装 Node.js（建议 LTS 版本）。

验证安装：
```bash
node --version
npm --version
```

### 3. Clang/LLVM

Deft 需要 Clang 14 或更高版本。

## 平台特定设置

### Windows

#### 依赖安装

1. 安装 Visual Studio Build Tools 或 Visual Studio：
   - 下载 [Visual Studio](https://visualstudio.microsoft.com/)
   - 选择 "Desktop development with C++" 工作负载

2. 安装 LLVM：
   ```powershell
   # 使用 Chocolatey
   choco install llvm
   
   # 或下载安装器
   # https://releases.llvm.org/
   ```

#### 环境变量

确保以下路径在 PATH 中：
- `C:\Program Files\LLVM\bin`
- Rust 工具链路径

#### 验证

```powershell
clang --version  # 应显示 14.0 或更高
cargo --version
```

### Linux

#### Ubuntu/Debian

```bash
# 更新包列表
sudo apt update

# 安装依赖
sudo apt install -y \
    build-essential \
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
```

#### Fedora/RHEL

```bash
# 安装依赖
sudo dnf install -y \
    gcc \
    gcc-c++ \
    clang \
    openssl-devel \
    libxcb-devel \
    xcb-util-devel \
    dbus-devel \
    alsa-lib-devel \
    mesa-libEGL-devel \
    mesa-libGLES-devel \
    wayland-devel
```

#### Arch Linux

```bash
# 安装依赖
sudo pacman -S \
    base-devel \
    clang \
    openssl \
    libxcb \
    dbus \
    alsa-lib \
    mesa
```

#### 验证

```bash
clang --version
pkg-config --modversion xcb
```

### macOS

#### 安装 Xcode 命令行工具

```bash
xcode-select --install
```

#### 使用 Homebrew 安装依赖

```bash
# 安装 Homebrew（如果尚未安装）
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 安装依赖
brew install llvm pkg-config
```

#### 环境变量

添加到 `~/.zshrc` 或 `~/.bash_profile`：

```bash
export PATH="/usr/local/opt/llvm/bin:$PATH"
export LDFLAGS="-L/usr/local/opt/llvm/lib"
export CPPFLAGS="-I/usr/local/opt/llvm/include"
```

#### 验证

```bash
clang --version
cargo --version
```

## 移动平台设置

### Android

1. **安装 Android Studio**
   - 下载 [Android Studio](https://developer.android.com/studio)
   - 安装 Android SDK 和 NDK

2. **配置环境变量**

```bash
export ANDROID_HOME=$HOME/Android/Sdk
export ANDROID_NDK_HOME=$ANDROID_HOME/ndk/26.0.10792818  # 使用你的 NDK 版本
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

3. **添加 Rust 目标**

```bash
rustup target add aarch64-linux-android
rustup target add armv7-linux-androideabi
rustup target add i686-linux-android
rustup target add x86_64-linux-android
```

4. **配置 Cargo**

创建 `~/.cargo/config.toml`：

```toml
[target.aarch64-linux-android]
ar = "$ANDROID_NDK_HOME/toolchains/llvm/prebuilt/linux-x86_64/bin/llvm-ar"
linker = "$ANDROID_NDK_HOME/toolchains/llvm/prebuilt/linux-x86_64/bin/aarch64-linux-android33-clang"

[target.armv7-linux-androideabi]
ar = "$ANDROID_NDK_HOME/toolchains/llvm/prebuilt/linux-x86_64/bin/llvm-ar"
linker = "$ANDROID_NDK_HOME/toolchains/llvm/prebuilt/linux-x86_64/bin/armv7a-linux-androideabi33-clang"
```

### iOS

1. **安装 Xcode**
   - 从 App Store 安装 Xcode
   - 安装命令行工具：`xcode-select --install`

2. **添加 Rust 目标**

```bash
rustup target add aarch64-apple-ios
rustup target add aarch64-apple-ios-sim
rustup target add x86_64-apple-ios
```

3. **安装 cargo-xcode**

```bash
cargo install cargo-xcode
```

### HarmonyOS

1. **安装 DevEco Studio**
   - 下载 [DevEco Studio](https://developer.harmonyos.com/cn/develop/deveco-studio)
   - 安装 HarmonyOS SDK

2. **配置环境变量**

```bash
export OHOS_SDK_HOME=$HOME/OpenHarmony/Sdk
export PATH=$PATH:$OHOS_SDK_HOME/native/llvm/bin
```

3. **添加 Rust 目标**

```bash
rustup target add aarch64-unknown-linux-ohos
```

## WebAssembly

### 安装 Emscripten SDK

1. **下载 Emscripten**

```bash
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
./emsdk install latest
./emsdk activate latest
source ./emsdk_env.sh
```

2. **添加 Rust 目标**

```bash
rustup target add wasm32-unknown-emscripten
```

3. **验证**

```bash
emcc --version
```

## IDE 配置

### Visual Studio Code

推荐安装以下扩展：
- **rust-analyzer**: Rust 语言支持
- **CodeLLDB**: 调试支持
- **Even Better TOML**: TOML 文件支持

配置 `.vscode/settings.json`：

```json
{
    "rust-analyzer.cargo.features": "all",
    "rust-analyzer.checkOnSave.command": "clippy"
}
```

### CLion / IntelliJ IDEA

安装插件：
- **Rust**
- **TOML**

## 验证环境

创建测试项目验证环境设置：

```bash
# 创建项目
cargo new test-deft
cd test-deft

# 添加依赖
cargo add deft

# 构建
cargo build

# 如果构建成功，环境配置正确！
```

## 常见问题

### Clang 版本过低

**症状**: 编译错误提示需要更高版本的 Clang

**解决方案**: 
```bash
# Ubuntu
sudo apt install clang-14

# macOS
brew install llvm
```

### 链接错误

**症状**: 链接时找不到库

**解决方案**: 确保已安装所有平台依赖，特别是：
- Linux: `libxcb`, `dbus`, `alsa`
- macOS: Xcode 命令行工具

### 权限问题

**症状**: 在 Linux 上无法访问某些设备

**解决方案**: 将用户添加到相关组：
```bash
sudo usermod -a -G video,audio $USER
```

## 下一步

- 返回[快速开始](./quick-start.md)创建第一个应用
- 查看[平台指南](../platforms/)了解特定平台的开发
- 阅读[基础示例](../examples/basic-examples.md)学习更多用法
