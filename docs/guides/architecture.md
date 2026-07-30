# 系统架构和技术方案

本文档详细介绍 Deft UI 框架的系统架构、技术方案和核心设计理念。

## 整体架构

Deft 采用分层架构设计，各层职责清晰：

```
┌─────────────────────────────────────────┐
│   JavaScript UI Layer (QuickJS)         │  应用层
│   - React/Vue/Solid 等框架支持          │
│   - 业务逻辑                             │
└─────────────────────────────────────────┘
              ↕ FFI
┌─────────────────────────────────────────┐
│   Rust Core                              │  核心层
│   - 元素管理                             │
│   - 事件系统                             │
│   - 样式计算                             │
└─────────────────────────────────────────┘
              ↕
┌─────────────────────────────────────────┐
│   Layout Engine (Yoga)                   │  布局层
│   - Flexbox 布局计算                     │
│   - 尺寸和位置计算                       │
└─────────────────────────────────────────┘
              ↕
┌─────────────────────────────────────────┐
│   Rendering Engine (Skia)                │  渲染层
│   - 2D 图形渲染                          │
│   - 文本渲染                             │
│   - 图片处理                             │
└─────────────────────────────────────────┘
              ↕
┌─────────────────────────────────────────┐
│   Platform Layer (Winit)                 │  平台层
│   - 窗口管理                             │
│   - 事件循环                             │
│   - 平台适配                             │
└─────────────────────────────────────────┘
```

## 核心技术栈

### JavaScript 引擎 - QuickJS

**选择理由**:
- 轻量级：体积小（约 200KB）
- 高性能：JIT 编译支持
- ES2020 标准支持
- 低内存占用
- 易于嵌入

**集成方式**:
```rust
use quick_js::{Context, JsValue};

// 创建 JS 上下文
let context = Context::new();

// 注册全局对象
context.register_global("Window", window_constructor);
context.register_global("Element", element_constructor);

// 执行 JS 代码
context.eval_module(js_code)?;
```

### 布局引擎 - Yoga

**特性**:
- Facebook 开发的 Flexbox 实现
- 跨平台一致性
- 高性能 C++ 实现
- Rust 绑定

**布局流程**:
```
1. 样式解析 → 2. 布局计算 → 3. 位置确定 → 4. 渲染
```

### 渲染引擎 - Skia

**优势**:
- Google 开发，Chrome/Android 使用
- 硬件加速支持
- 丰富的 2D 图形 API
- 字体渲染优秀
- 跨平台支持

**渲染管线**:
```rust
pub struct Painter {
    canvas: Canvas,
    paint: Paint,
}

impl Painter {
    pub fn draw_rect(&mut self, rect: Rect, color: Color) {
        self.paint.set_color(color);
        self.canvas.draw_rect(rect, &self.paint);
    }
}
```

### 窗口管理 - Winit

**功能**:
- 跨平台窗口创建
- 事件循环管理
- 输入事件处理
- 多显示器支持

## 数据流

### 单向数据流

```
用户交互 → 事件触发 → JS 处理 → 状态更新 → UI 重渲染
```

### 详细流程

1. **事件捕获**:
```rust
// Rust 侧
window.handle_event(|event| {
    match event {
        Event::MouseClick { x, y } => {
            element.dispatch_click_event(x, y);
        }
    }
});
```

2. **事件分发到 JS**:
```javascript
// JavaScript 侧
element.bindClick((e) => {
    // 处理点击事件
    updateState();
});
```

3. **状态更新触发重渲染**:
```javascript
function updateState() {
    count++;
    label.setText(`Count: ${count}`);  // 触发重渲染
}
```

## 内存管理

### Rust 侧

使用 Rust 的所有权系统：
- **栈分配**: 基本类型和固定大小结构
- **堆分配**: 使用 `Box`、`Rc`、`Arc`
- **引用计数**: 元素树使用 `Rc<RefCell<>>`

```rust
pub type ElementRef = Rc<RefCell<ElementData>>;
pub type ElementWeak = Weak<RefCell<ElementData>>;

pub struct Element {
    data: ElementRef,
}
```

### JavaScript 侧

- QuickJS 垃圾回收
- 弱引用避免循环引用
- 手动释放大对象

```javascript
// 清理引用
element.unbindClick(handler);
parent.removeChild(child);
```

## 跨语言通信 (FFI)

### Rust → JavaScript

```rust
use quick_js::{Context, JsValue};

// 暴露 Rust 函数给 JS
#[js_func]
pub fn create_window(attrs: WindowAttrs) -> Window {
    Window::new(attrs)
}
```

### JavaScript → Rust

```javascript
// JS 调用 Rust
const window = new Window({ width: 800, height: 600 });
```

### 类型转换

```rust
impl TryFrom<JsValue> for WindowAttrs {
    type Error = Error;
    
    fn try_from(value: JsValue) -> Result<Self> {
        // JSON 反序列化
        serde_json::from_value(value.into_json()?)
    }
}
```

## 线程模型

### 主线程

- UI 渲染
- 事件处理
- JavaScript 执行

### Worker 线程

```javascript
// 创建 Worker
const worker = new Worker("./worker.js");

worker.bindMessage((data) => {
    console.log("Received:", data);
});

worker.postMessage({ type: "task", data: "..." });
```

### 线程通信

```rust
use tokio::sync::mpsc;

// 创建通道
let (tx, rx) = mpsc::channel(100);

// 主线程发送消息
tx.send(Message::Update).await?;

// Worker 接收消息
while let Some(msg) = rx.recv().await {
    process_message(msg);
}
```

## 性能优化策略

### 1. 虚拟化渲染

对于长列表使用虚拟滚动：

```javascript
class VirtualList {
    constructor(itemHeight, visibleCount) {
        this.itemHeight = itemHeight;
        this.visibleCount = visibleCount;
        this.scrollTop = 0;
    }
    
    render(items) {
        const startIndex = Math.floor(this.scrollTop / this.itemHeight);
        const endIndex = startIndex + this.visibleCount;
        
        // 只渲染可见项
        return items.slice(startIndex, endIndex);
    }
}
```

### 2. 增量更新

仅更新变化的元素：

```javascript
// ❌ 不好 - 完全重建
function updateList(items) {
    container.removeAllChildren();
    items.forEach(item => container.addChild(createItem(item)));
}

// ✅ 好 - 增量更新
function updateList(newItems, oldItems) {
    const diff = calculateDiff(newItems, oldItems);
    diff.added.forEach(item => container.addChild(createItem(item)));
    diff.removed.forEach(index => container.removeChildAt(index));
    diff.updated.forEach(({index, item}) => updateItem(index, item));
}
```

### 3. 批量操作

```rust
// 批量更新减少重绘
pub fn batch_update<F>(&mut self, f: F) 
where 
    F: FnOnce(&mut Self)
{
    self.begin_batch();
    f(self);
    self.end_batch();
    self.invalidate();  // 只重绘一次
}
```

### 4. 图层合成

```javascript
// 使用 transform 触发硬件加速
element.setStyle({
    transform: 'translateZ(0)',  // 创建新图层
    willChange: 'transform',     // 提示浏览器优化
});
```

## 模块化设计

### 核心模块

```
deft/
├── element/        # 元素系统
├── event/          # 事件系统
├── style/          # 样式系统
├── render/         # 渲染系统
├── window/         # 窗口管理
├── js/             # JS 绑定
├── platform/       # 平台适配
└── loader/         # 模块加载
```

### 插件系统

```rust
pub trait Plugin {
    fn init(&mut self, app: &mut App);
    fn on_event(&mut self, event: &Event);
}

// 注册插件
app.add_plugin(MyPlugin::new());
```

## 样式系统

### CSS 解析

```rust
use cssparser::{Parser, Token};

pub fn parse_stylesheet(css: &str) -> Stylesheet {
    let mut parser = Parser::new(css);
    let mut rules = Vec::new();
    
    while let Some(rule) = parse_rule(&mut parser) {
        rules.push(rule);
    }
    
    Stylesheet { rules }
}
```

### 样式计算

```
1. 选择器匹配
2. 特异性计算
3. 级联和继承
4. 计算值生成
```

### 样式应用

```rust
pub fn apply_styles(&mut self, element: &Element) {
    let computed = self.compute_styles(element);
    element.layout_node.set_style(computed.into());
}
```

## 渲染优化

### 脏区域标记

```rust
pub struct DirtyRegion {
    regions: Vec<Rect>,
}

impl DirtyRegion {
    pub fn mark_dirty(&mut self, rect: Rect) {
        self.regions.push(rect);
    }
    
    pub fn get_dirty_rects(&self) -> &[Rect] {
        &self.regions
    }
}
```

### 双缓冲

```rust
pub struct DoubleBuffer {
    front: Canvas,
    back: Canvas,
}

impl DoubleBuffer {
    pub fn swap(&mut self) {
        std::mem::swap(&mut self.front, &mut self.back);
    }
}
```

## 事件系统

### 事件冒泡

```
目标元素 → 父元素 → ... → 根元素
```

### 事件委托

```javascript
// 在父元素上监听
container.bindClick((e) => {
    const target = e.target;
    if (target.hasClass('button')) {
        handleButtonClick(target);
    }
});
```

## 测试策略

### 单元测试

```rust
#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_element_creation() {
        let element = Element::new();
        assert!(element.children().is_empty());
    }
}
```

### 集成测试

```javascript
// JavaScript 测试
describe('Window', () => {
    it('should create window with correct size', () => {
        const window = new Window({ width: 800, height: 600 });
        assert.equal(window.getSize().width, 800);
    });
});
```

## 扩展性设计

### 自定义元素

```rust
pub trait ElementBackend {
    fn create(element: &mut Element) -> Self;
    fn render(&mut self) -> RenderFn;
    fn on_event(&mut self, event: &Event) -> bool;
}

// 注册自定义元素
register_component::<MyCustomBackend>("my-custom");
```

### 自定义渲染器

```rust
pub trait Renderer {
    fn render(&mut self, tree: &RenderTree);
    fn present(&mut self);
}
```

## 安全考虑

### 1. 内存安全

- Rust 的所有权系统防止内存泄漏
- 无空指针、无数据竞争

### 2. 类型安全

```rust
// 编译时类型检查
pub struct Window {
    handle: WindowHandle,  // 类型安全的句柄
}
```

### 3. 沙箱隔离

- JavaScript 代码在隔离环境中运行
- 限制文件系统访问
- 控制网络权限

## 调试工具

### 日志系统

```rust
use log::{debug, info, warn, error};

info!("Window created: {:?}", window);
debug!("Layout calculation: {:?}", layout);
```

### 性能分析

```rust
use std::time::Instant;

let start = Instant::now();
render_tree(&tree);
let duration = start.elapsed();
println!("Render time: {:?}", duration);
```

### 元素检查器

```javascript
// 调试工具
window.inspectElement(element, {
    showBounds: true,
    showStyle: true,
    showEvents: true,
});
```

## 构建系统

### Cargo 配置

```toml
[workspace]
members = [
    "packages/deft-macros",
    "packages/deft-tray",
    "skia-window",
]

[profile.release]
opt-level = 3
lto = true
codegen-units = 1
```

### 条件编译

```rust
#[cfg(target_os = "windows")]
fn platform_init() {
    // Windows 特定初始化
}

#[cfg(target_os = "linux")]
fn platform_init() {
    // Linux 特定初始化
}
```

## 总结

Deft UI 框架通过精心设计的分层架构、高效的渲染引擎和灵活的扩展机制，提供了一个强大而轻量的跨平台 UI 解决方案。其核心优势包括：

- **性能**: Rust 核心 + Skia 渲染
- **轻量**: 无 WebView 依赖
- **灵活**: 支持多种 JS 框架
- **跨平台**: 统一的开发体验
- **可扩展**: 插件和自定义元素支持

## 相关文档

- [快速开始](../guides/quick-start.md)
- [API 参考](../api/ui-components.md)
- [性能优化](./performance.md)
- [插件开发](./plugin-development.md)
