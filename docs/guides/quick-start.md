# 快速开始

本指南将帮助你快速创建第一个 Deft 应用程序。

## 使用脚手架创建项目

最快的方式是使用官方脚手架工具：

```bash
npm create deft@latest hello-deft
cd hello-deft
npm install
npm run dev
```

这将创建一个包含基本配置的项目，并启动开发服务器。

## 手动创建项目

如果你想更好地理解项目结构，可以手动创建：

### 1. 创建 Rust 项目

```bash
cargo new my-deft-app
cd my-deft-app
```

### 2. 添加依赖

编辑 `Cargo.toml`：

```toml
[package]
name = "my-deft-app"
version = "0.1.0"
edition = "2021"

[dependencies]
deft = "0.13"
```

### 3. 创建主程序

编辑 `src/main.rs`：

```rust
use deft::app::{App, IApp};
use deft::bootstrap;
use deft::loader::StaticModuleLoader;
use quick_js::loader::JsModuleLoader;

struct MyApp {}

impl IApp for MyApp {
    fn create_module_loader(&mut self) -> Box<dyn JsModuleLoader + Send + Sync + 'static> {
        let mut ml = StaticModuleLoader::new();
        ml.add_module("index.js".to_string(), include_str!("index.js").to_string());
        Box::new(ml)
    }
}

fn main() {
    let app = App::new(MyApp {});
    bootstrap(app);
}
```

### 4. 创建 JavaScript UI

创建 `src/index.js`：

```javascript
// 创建窗口
const window = new Window({
    width: 800,
    height: 600,
});
window.setTitle("My Deft App");

// 创建容器
const container = new ContainerElement();
container.setStyle({
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
});

// 创建标签
const label = new LabelElement();
label.setText("Hello, Deft!");
label.setStyle({
    fontSize: 24,
    color: '#333',
});

// 添加到容器
container.addChild(label);
window.setBody(container);
```

### 5. 运行应用

```bash
cargo run
```

## 项目结构

典型的 Deft 项目结构：

```
my-deft-app/
├── Cargo.toml          # Rust 依赖配置
├── src/
│   ├── main.rs        # Rust 入口点
│   └── index.js       # JavaScript UI 代码
└── assets/            # 资源文件（图片、字体等）
```

## 开发工作流

### 开发模式

使用文件系统模块加载器进行开发，支持热重载：

```rust
use quick_js::loader::FsJsModuleLoader;

impl IApp for MyApp {
    fn create_module_loader(&mut self) -> Box<dyn JsModuleLoader + Send + Sync + 'static> {
        let ml = FsJsModuleLoader::new("src");
        Box::new(ml)
    }
}
```

运行开发服务器：
```bash
cargo run
```

### 生产构建

使用静态模块加载器构建发布版本：

```rust
use deft::loader::StaticModuleLoader;

impl IApp for MyApp {
    fn create_module_loader(&mut self) -> Box<dyn JsModuleLoader + Send + Sync + 'static> {
        let mut ml = StaticModuleLoader::new();
        ml.add_module("index.js".to_string(), include_str!("index.js").to_string());
        Box::new(ml)
    }
}
```

构建发布版本：
```bash
cargo build --release
```

## 添加更多功能

### 添加按钮

```javascript
const button = new ButtonElement();
button.addChild(new LabelElement().setText("Click Me"));
button.bindClick(() => {
    console.log("Button clicked!");
});
container.addChild(button);
```

### 添加输入框

```javascript
const input = new TextInputElement();
input.setPlaceholder("Enter text...");
input.bindTextChange((e) => {
    console.log("Text changed:", e.detail.value);
});
container.addChild(input);
```

### 添加样式

```javascript
const stylesheet = `
.button {
    background: #007bff;
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
}
.button:hover {
    background: #0056b3;
}
`;

navigator.stylesheet.append(stylesheet);

button.setClass("button");
```

## 下一步

- 查看[开发环境设置](./development-setup.md)了解详细的环境配置
- 阅读[基础示例](../examples/basic-examples.md)学习更多用法
- 探索[API 参考](../api/core-api.md)了解完整的 API
- 查看[平台指南](../platforms/)了解特定平台的开发方式
