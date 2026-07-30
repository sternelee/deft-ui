# WebAssembly 平台开发

本指南介绍如何为 WebAssembly (WASM) 平台开发 Deft 应用程序。

## 平台支持

### 支持状态
- ✅ 实验性支持
- 支持在现代 Web 浏览器中运行 Deft 应用

### 目标平台
- `wasm32-unknown-emscripten` - 使用 Emscripten 工具链

## 开发环境设置

### 1. 安装 Emscripten SDK

```bash
# 克隆 emsdk 仓库
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk

# 安装最新版本
./emsdk install latest
./emsdk activate latest

# 配置环境变量
source ./emsdk_env.sh

# 验证安装
emcc --version
```

### 2. 添加 Rust 目标

```bash
rustup target add wasm32-unknown-emscripten
```

### 3. 验证环境

```bash
# 检查 Emscripten
which emcc

# 检查 Rust 目标
rustup target list | grep wasm32-unknown-emscripten
```

## 创建 WebAssembly 应用

### 项目结构

```
my-wasm-app/
├── Cargo.toml
├── src/
│   ├── lib.rs          # WASM 入口点
│   └── index.js        # UI 代码
└── web/
    └── index.html      # HTML 页面
```

### Rust 代码

`Cargo.toml`:

```toml
[package]
name = "my-wasm-app"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib"]

[dependencies]
deft = { version = "0.13" }

[target.'cfg(target_os = "emscripten")'.dependencies]
skia-window = { package = "deft-skia-window", version = "0.9.0", features = ["webgl"] }
```

`src/lib.rs`:

```rust
use deft::app::{App, IApp};
use deft::bootstrap;
use deft::loader::StaticModuleLoader;
use deft::log::SimpleLogger;
use quick_js::loader::JsModuleLoader;

struct WasmApp {}

impl IApp for WasmApp {
    fn create_module_loader(&mut self) -> Box<dyn JsModuleLoader + Send + Sync + 'static> {
        let mut ml = StaticModuleLoader::new();
        ml.add_module("index.js".to_string(), include_str!("index.js").to_string());
        Box::new(ml)
    }
}

#[no_mangle]
pub extern "C" fn asm_main() {
    // 初始化日志
    SimpleLogger::init_with_max_level(log::LevelFilter::Info);
    
    let app = App::new(WasmApp {});
    bootstrap(app);
}
```

### JavaScript UI

`src/index.js`:

```javascript
console.log("WASM App starting...");

const window = new Window({
    width: 800,
    height: 600,
});
window.setTitle("My WASM App");

const container = new ContainerElement();
container.setStyle({
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    gap: 20,
});

const title = new LabelElement();
title.setText("Hello from WebAssembly!");
title.setStyle({
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
});

const subtitle = new LabelElement();
subtitle.setText("This Deft app is running in your browser");
subtitle.setStyle({
    fontSize: 18,
    color: '#7f8c8d',
});

container.addChild(title);
container.addChild(subtitle);

window.setBody(container);

console.log("WASM App loaded!");
```

### HTML 页面

`web/index.html`:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My WASM App</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: #f5f5f5;
        }
        
        #loading {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            flex-direction: column;
            gap: 20px;
        }
        
        .spinner {
            width: 50px;
            height: 50px;
            border: 5px solid #f3f3f3;
            border-top: 5px solid #3498db;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        #canvas {
            display: block;
            margin: 20px auto;
            border: 1px solid #ddd;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
    </style>
</head>
<body>
    <div id="loading">
        <div class="spinner"></div>
        <p>Loading WASM Application...</p>
    </div>
    
    <canvas id="canvas"></canvas>
    
    <script>
        var Module = {
            canvas: (function() {
                var canvas = document.getElementById('canvas');
                return canvas;
            })(),
            onRuntimeInitialized: function() {
                document.getElementById('loading').style.display = 'none';
                console.log('WASM Runtime initialized');
                // 调用 WASM 入口函数
                Module._asm_main();
            },
            print: function(text) {
                console.log(text);
            },
            printErr: function(text) {
                console.error(text);
            }
        };
    </script>
    <script src="my-wasm-app.js"></script>
</body>
</html>
```

## 构建和运行

### 构建 WASM

```bash
# 构建发布版本
cargo build --target wasm32-unknown-emscripten --release

# 构建产物位置
# target/wasm32-unknown-emscripten/release/my_wasm_app.wasm
# target/wasm32-unknown-emscripten/release/my_wasm_app.js
```

### 复制文件到 web 目录

```bash
# 复制 WASM 和 JS 文件
cp target/wasm32-unknown-emscripten/release/my_wasm_app.wasm web/
cp target/wasm32-unknown-emscripten/release/my_wasm_app.js web/
```

### 启动本地服务器

```bash
# 使用 Python
cd web
python3 -m http.server 8000

# 或使用 Node.js
npx http-server web -p 8000
```

访问 `http://localhost:8000` 查看应用。

## WebAssembly 特定功能

### 浏览器 API 访问

```javascript
// 访问 localStorage
if (typeof localStorage !== 'undefined') {
    localStorage.setItem('key', 'value');
    const value = localStorage.getItem('key');
}

// 访问 fetch API
async function fetchData() {
    try {
        const response = await fetch('https://api.example.com/data');
        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

// 使用 Canvas API
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
```

### 文件上传

```html
<!-- 添加文件输入 -->
<input type="file" id="fileInput" accept=".txt,.json" />

<script>
document.getElementById('fileInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target.result;
            // 传递给 WASM 应用
            Module.ccall('handle_file_upload', 'void', ['string', 'string'], 
                [file.name, content]);
        };
        reader.readAsText(file);
    }
});
</script>
```

### 与 JavaScript 交互

在 Rust 中暴露函数：

```rust
use std::ffi::CString;
use std::os::raw::c_char;

#[no_mangle]
pub extern "C" fn rust_function(input: *const c_char) -> *const c_char {
    let c_str = unsafe { std::ffi::CStr::from_ptr(input) };
    let input_str = c_str.to_str().unwrap();
    
    // 处理输入
    let result = format!("Processed: {}", input_str);
    
    CString::new(result).unwrap().into_raw()
}
```

在 JavaScript 中调用：

```javascript
// 调用 Rust 函数
const result = Module.ccall(
    'rust_function',     // 函数名
    'string',            // 返回类型
    ['string'],          // 参数类型
    ['Hello from JS']    // 参数值
);
console.log(result);
```

### 性能监控

```javascript
// 监控性能
const perfObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
        console.log(`${entry.name}: ${entry.duration}ms`);
    }
});
perfObserver.observe({ entryTypes: ['measure'] });

// 标记性能点
performance.mark('wasm-start');
// ... WASM 代码执行
performance.mark('wasm-end');
performance.measure('wasm-execution', 'wasm-start', 'wasm-end');
```

## 优化

### 减小 WASM 大小

在 `Cargo.toml` 中：

```toml
[profile.release]
opt-level = "z"      # 优化大小
lto = true           # 链接时优化
codegen-units = 1    # 更好的优化
panic = "abort"      # 减少展开代码
strip = true         # 移除符号
```

### 使用 wasm-opt

```bash
# 安装 Binaryen
npm install -g binaryen

# 优化 WASM
wasm-opt -Oz -o my_wasm_app_opt.wasm my_wasm_app.wasm
```

### 启用 SIMD

在构建时启用 SIMD 特性：

```bash
RUSTFLAGS="-C target-feature=+simd128" \
cargo build --target wasm32-unknown-emscripten --release
```

### 压缩传输

配置服务器启用 gzip/brotli 压缩：

```nginx
# Nginx 配置
location ~ \.(wasm|js)$ {
    gzip on;
    gzip_types application/wasm application/javascript;
    add_header Cache-Control "public, max-age=31536000";
}
```

## 部署

### 静态网站托管

**GitHub Pages**:

```bash
# 创建 gh-pages 分支
git checkout --orphan gh-pages
git rm -rf .
cp -r web/* .
git add .
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages
```

**Netlify**:

```bash
# netlify.toml
[build]
  command = "cargo build --target wasm32-unknown-emscripten --release && cp target/wasm32-unknown-emscripten/release/*.{wasm,js} web/"
  publish = "web"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Vercel**:

```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "web/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/web/$1"
    }
  ]
}
```

### CDN 分发

使用 CDN 加速 WASM 加载：

```html
<script>
var Module = {
    locateFile: function(path) {
        if (path.endsWith('.wasm')) {
            return 'https://cdn.example.com/wasm/' + path;
        }
        return path;
    }
};
</script>
```

## 调试

### 浏览器开发者工具

```javascript
// 在控制台查看日志
console.log('Debug message');

// 使用 debugger 语句
debugger;

// 查看性能
console.time('operation');
// ... 代码
console.timeEnd('operation');
```

### Source Maps

启用 source maps 进行调试：

```bash
RUSTFLAGS="-g" cargo build --target wasm32-unknown-emscripten
```

### WASM 分析工具

```bash
# 使用 twiggy 分析 WASM 大小
cargo install twiggy
twiggy top my_wasm_app.wasm

# 查看最大的函数
twiggy top -n 20 my_wasm_app.wasm
```

## 浏览器兼容性

### 特性检测

```javascript
// 检查 WebAssembly 支持
if (typeof WebAssembly === 'undefined') {
    alert('Your browser does not support WebAssembly');
} else {
    // 加载 WASM 应用
}

// 检查 WebGL 支持
const canvas = document.createElement('canvas');
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
if (!gl) {
    alert('WebGL is not supported');
}
```

### Polyfills

```html
<!-- 为旧浏览器添加 polyfills -->
<script src="https://cdn.jsdelivr.net/npm/promise-polyfill@8/dist/polyfill.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/whatwg-fetch@3.6.2/dist/fetch.umd.js"></script>
```

## 限制和注意事项

### 功能限制

- ⚠️ 无法使用原生文件系统（除非通过浏览器 API）
- ⚠️ 无法使用系统托盘
- ⚠️ 无法使用原生窗口装饰
- ⚠️ 受浏览器沙箱限制

### 性能考虑

- WASM 启动时间可能较长
- 网络延迟影响加载速度
- 内存使用受浏览器限制

### 安全考虑

- 遵守 CORS 策略
- 使用 HTTPS 传输
- 验证用户输入

## 示例项目

- [WASM 基础示例](../../examples/wasm-basic/)
- [WASM 画布示例](../../examples/wasm-canvas/)
- [WASM 交互示例](../../examples/wasm-interactive/)

## 相关资源

- [WebAssembly 官方网站](https://webassembly.org/)
- [Emscripten 文档](https://emscripten.org/docs/)
- [Rust WASM 工作组](https://rustwasm.github.io/)
- [MDN WebAssembly](https://developer.mozilla.org/en-US/docs/WebAssembly)
