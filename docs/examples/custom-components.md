# 自定义组件

本指南展示如何在 Deft 中创建自定义组件。

## 两种方式

Deft 支持两种创建自定义组件的方式：

1. **JavaScript 组件**：纯 JavaScript 实现，使用现有元素组合
2. **Rust 后端组件**：在 Rust 中实现自定义渲染逻辑

## JavaScript 组件

### 基本组件封装

创建可复用的组件：

```javascript
// components/Button.js
class CustomButton {
    constructor(text, onClick) {
        this.element = new ButtonElement();
        
        // 创建标签
        const label = new LabelElement();
        label.setText(text);
        
        // 设置样式
        this.element.setStyle({
            background: '#007bff',
            color: 'white',
            padding: '10px 20px',
            borderRadius: 5,
            cursor: 'pointer',
            border: 'none',
        });
        
        this.element.setHoverStyle({
            background: '#0056b3',
        });
        
        this.element.addChild(label);
        
        if (onClick) {
            this.element.bindClick(onClick);
        }
    }
    
    getElement() {
        return this.element;
    }
    
    setText(text) {
        const label = this.element.children[0];
        label.setText(text);
    }
    
    setDisabled(disabled) {
        this.element.setStyle({
            opacity: disabled ? 0.5 : 1,
            cursor: disabled ? 'not-allowed' : 'pointer',
        });
    }
}

// 使用
const button = new CustomButton("Click Me", () => {
    console.log("Button clicked!");
});

container.addChild(button.getElement());
```

### 复杂组件示例：下拉菜单

```javascript
class Dropdown {
    constructor(options) {
        this.options = options;
        this.selectedIndex = 0;
        this.isOpen = false;
        this.onChange = null;
        
        // 创建主容器
        this.container = new ContainerElement();
        this.container.setStyle({
            position: 'relative',
            width: 200,
        });
        
        // 创建选择框
        this.selector = new ButtonElement();
        this.selector.setStyle({
            width: '100%',
            padding: 10,
            background: 'white',
            border: '1px #ccc',
            borderRadius: 4,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        });
        
        this.selectedLabel = new LabelElement();
        this.selectedLabel.setText(options[0]);
        
        const arrow = new LabelElement();
        arrow.setText("▼");
        arrow.setStyle({ fontSize: 12 });
        
        this.selector.addChild(this.selectedLabel);
        this.selector.addChild(arrow);
        
        // 创建下拉列表
        this.dropdown = new ContainerElement();
        this.dropdown.setStyle({
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'white',
            border: '1px #ccc',
            borderTop: 'none',
            maxHeight: 200,
            overflow: 'auto',
            display: 'none',
            zIndex: 1000,
        });
        
        // 创建选项
        options.forEach((option, index) => {
            const optionElement = new ButtonElement();
            optionElement.setStyle({
                width: '100%',
                padding: 10,
                background: 'white',
                textAlign: 'left',
            });
            
            optionElement.setHoverStyle({
                background: '#f0f0f0',
            });
            
            const optionLabel = new LabelElement();
            optionLabel.setText(option);
            optionElement.addChild(optionLabel);
            
            optionElement.bindClick(() => {
                this.select(index);
            });
            
            this.dropdown.addChild(optionElement);
        });
        
        // 绑定事件
        this.selector.bindClick(() => {
            this.toggle();
        });
        
        // 组装
        this.container.addChild(this.selector);
        this.container.addChild(this.dropdown);
    }
    
    toggle() {
        this.isOpen = !this.isOpen;
        this.dropdown.setStyle({
            display: this.isOpen ? 'flex' : 'none',
        });
    }
    
    select(index) {
        this.selectedIndex = index;
        this.selectedLabel.setText(this.options[index]);
        this.toggle();
        
        if (this.onChange) {
            this.onChange(index, this.options[index]);
        }
    }
    
    onChanged(callback) {
        this.onChange = callback;
    }
    
    getElement() {
        return this.container;
    }
    
    getValue() {
        return this.options[this.selectedIndex];
    }
    
    getIndex() {
        return this.selectedIndex;
    }
}

// 使用
const dropdown = new Dropdown([
    "Option 1",
    "Option 2",
    "Option 3",
    "Option 4"
]);

dropdown.onChanged((index, value) => {
    console.log("Selected:", index, value);
});

container.addChild(dropdown.getElement());
```

### 标签页组件

```javascript
class TabView {
    constructor() {
        this.tabs = [];
        this.activeIndex = 0;
        
        // 主容器
        this.container = new ContainerElement();
        this.container.setStyle({
            flex: 1,
            overflow: 'hidden',
        });
        
        // 标签头部
        this.tabHeader = new ContainerElement();
        this.tabHeader.setStyle({
            flexDirection: 'row',
            borderBottom: '2px #e0e0e0',
        });
        
        // 内容区域
        this.contentArea = new ContainerElement();
        this.contentArea.setStyle({
            flex: 1,
            padding: 20,
        });
        
        this.container.addChild(this.tabHeader);
        this.container.addChild(this.contentArea);
    }
    
    addTab(title, content) {
        const index = this.tabs.length;
        
        // 创建标签按钮
        const tabButton = new ButtonElement();
        tabButton.setStyle({
            padding: '12px 24px',
            background: 'transparent',
            borderBottom: '2px transparent',
        });
        
        const label = new LabelElement();
        label.setText(title);
        tabButton.addChild(label);
        
        tabButton.bindClick(() => {
            this.switchTo(index);
        });
        
        this.tabHeader.addChild(tabButton);
        
        // 保存标签信息
        this.tabs.push({
            title,
            content,
            button: tabButton,
        });
        
        // 如果是第一个标签，激活它
        if (this.tabs.length === 1) {
            this.switchTo(0);
        }
    }
    
    switchTo(index) {
        if (index < 0 || index >= this.tabs.length) {
            return;
        }
        
        // 更新标签样式
        this.tabs.forEach((tab, i) => {
            if (i === index) {
                tab.button.setStyle({
                    borderBottom: '2px #007bff',
                    color: '#007bff',
                });
            } else {
                tab.button.setStyle({
                    borderBottom: '2px transparent',
                    color: '#333',
                });
            }
        });
        
        // 清空内容区域
        while (this.contentArea.firstChild) {
            this.contentArea.removeChild(this.contentArea.firstChild);
        }
        
        // 显示新内容
        this.contentArea.addChild(this.tabs[index].content);
        this.activeIndex = index;
    }
    
    getElement() {
        return this.container;
    }
}

// 使用
const tabView = new TabView();

// 第一个标签
const tab1Content = new ContainerElement();
const label1 = new LabelElement();
label1.setText("This is the content of Tab 1");
tab1Content.addChild(label1);
tabView.addTab("Tab 1", tab1Content);

// 第二个标签
const tab2Content = new ContainerElement();
const label2 = new LabelElement();
label2.setText("This is the content of Tab 2");
tab2Content.addChild(label2);
tabView.addTab("Tab 2", tab2Content);

// 第三个标签
const tab3Content = new ContainerElement();
const label3 = new LabelElement();
label3.setText("This is the content of Tab 3");
tab3Content.addChild(label3);
tabView.addTab("Tab 3", tab3Content);

container.addChild(tabView.getElement());
```

## Rust 后端组件

对于需要自定义渲染的组件，可以在 Rust 中实现。

### 创建自定义 Rust 组件

```rust
// src/main.rs
use deft::app::{App, IApp};
use deft::bootstrap;
use deft::element::{register_component, Element, ElementBackend, ElementWeak};
use deft::js::js_engine::JsEngine;
use deft::render::RenderFn;
use deft::loader::StaticModuleLoader;
use quick_js::loader::JsModuleLoader;
use skia_safe::{Color, Paint, PaintStyle, Path};

/// 自定义圆形组件
struct CircleBackend {
    element_weak: ElementWeak,
}

impl ElementBackend for CircleBackend {
    fn create(element: &mut Element) -> Self
    where
        Self: Sized,
    {
        Self {
            element_weak: element.as_weak(),
        }
    }

    fn render(&mut self) -> RenderFn {
        let element = self.element_weak.upgrade_mut().unwrap();
        let bounds = element.get_bounds();
        let center = (bounds.width / 2.0, bounds.height / 2.0);
        let radius = f32::min(center.0, center.1);
        
        RenderFn::new(move |painter| {
            let mut paint = Paint::default();
            paint.set_style(PaintStyle::Fill);
            paint.set_color(Color::from_rgb(0, 120, 215));
            painter.canvas.draw_circle(center, radius, &paint);
        })
    }
}

/// 自定义星形组件
struct StarBackend {
    element_weak: ElementWeak,
}

impl ElementBackend for StarBackend {
    fn create(element: &mut Element) -> Self
    where
        Self: Sized,
    {
        Self {
            element_weak: element.as_weak(),
        }
    }

    fn render(&mut self) -> RenderFn {
        let element = self.element_weak.upgrade_mut().unwrap();
        let bounds = element.get_bounds();
        let center_x = bounds.width / 2.0;
        let center_y = bounds.height / 2.0;
        let radius = f32::min(center_x, center_y) * 0.8;
        
        RenderFn::new(move |painter| {
            let mut path = Path::new();
            
            // 绘制五角星
            for i in 0..5 {
                let angle = std::f32::consts::PI * 2.0 * i as f32 / 5.0 - std::f32::consts::PI / 2.0;
                let x = center_x + radius * angle.cos();
                let y = center_y + radius * angle.sin();
                
                if i == 0 {
                    path.move_to((x, y));
                } else {
                    path.line_to((x, y));
                }
                
                // 内角点
                let inner_angle = angle + std::f32::consts::PI / 5.0;
                let inner_radius = radius * 0.4;
                let inner_x = center_x + inner_radius * inner_angle.cos();
                let inner_y = center_y + inner_radius * inner_angle.sin();
                path.line_to((inner_x, inner_y));
            }
            
            path.close();
            
            let mut paint = Paint::default();
            paint.set_style(PaintStyle::Fill);
            paint.set_color(Color::from_rgb(255, 193, 7));
            painter.canvas.draw_path(&path, &paint);
        })
    }
}

struct MyApp {}

impl IApp for MyApp {
    fn init_js_engine(&mut self, _js_engine: &mut JsEngine) {
        // 注册自定义组件
        register_component::<CircleBackend>("circle");
        register_component::<StarBackend>("star");
    }
    
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

### 在 JavaScript 中使用

```javascript
// src/index.js

// 定义样式
const stylesheet = `
circle {
    width: 100px;
    height: 100px;
}

star {
    width: 100px;
    height: 100px;
}
`;
navigator.stylesheet.append(stylesheet);

// 创建窗口
const window = new Window({
    width: 500,
    height: 400,
});
window.setTitle("Custom Components");

const container = new ContainerElement();
container.setStyle({
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 30,
    flex: 1,
});

// 使用自定义组件
class CircleElement extends Element {
    constructor() {
        super("circle");
    }
}

class StarElement extends Element {
    constructor() {
        super("star");
    }
}

// 创建圆形
const circle = new CircleElement();

// 创建星形
const star = new StarElement();

container.addChild(circle);
container.addChild(star);

window.setBody(container);
```

## 高级 Rust 组件

### 可交互的自定义组件

```rust
use deft::element::{Element, ElementBackend, ElementWeak};
use deft::render::RenderFn;
use deft::event::MouseButton;
use skia_safe::{Color, Paint, PaintStyle};

struct InteractiveCircleBackend {
    element_weak: ElementWeak,
    color: Color,
}

impl ElementBackend for InteractiveCircleBackend {
    fn create(element: &mut Element) -> Self
    where
        Self: Sized,
    {
        let element_weak = element.as_weak();
        
        // 设置点击事件
        let weak_clone = element_weak.clone();
        element.on_click(move |_| {
            if let Some(mut elem) = weak_clone.upgrade_mut() {
                // 改变颜色
                if let Some(backend) = elem.backend_mut::<InteractiveCircleBackend>() {
                    backend.color = Color::from_rgb(
                        rand::random::<u8>(),
                        rand::random::<u8>(),
                        rand::random::<u8>(),
                    );
                    elem.invalidate();
                }
            }
        });
        
        Self {
            element_weak,
            color: Color::from_rgb(0, 120, 215),
        }
    }

    fn render(&mut self) -> RenderFn {
        let element = self.element_weak.upgrade_mut().unwrap();
        let bounds = element.get_bounds();
        let center = (bounds.width / 2.0, bounds.height / 2.0);
        let radius = f32::min(center.0, center.1);
        let color = self.color;
        
        RenderFn::new(move |painter| {
            let mut paint = Paint::default();
            paint.set_style(PaintStyle::Fill);
            paint.set_color(color);
            painter.canvas.draw_circle(center, radius, &paint);
        })
    }
}
```

### 动画组件

```rust
use std::time::Instant;

struct AnimatedCircleBackend {
    element_weak: ElementWeak,
    start_time: Instant,
}

impl ElementBackend for AnimatedCircleBackend {
    fn create(element: &mut Element) -> Self
    where
        Self: Sized,
    {
        let element_weak = element.as_weak();
        
        // 设置动画更新
        let weak_clone = element_weak.clone();
        element.on_frame(move || {
            if let Some(mut elem) = weak_clone.upgrade_mut() {
                elem.invalidate();
            }
        });
        
        Self {
            element_weak,
            start_time: Instant::now(),
        }
    }

    fn render(&mut self) -> RenderFn {
        let element = self.element_weak.upgrade_mut().unwrap();
        let bounds = element.get_bounds();
        let center = (bounds.width / 2.0, bounds.height / 2.0);
        
        // 计算动画进度
        let elapsed = self.start_time.elapsed().as_secs_f32();
        let radius = (f32::min(center.0, center.1) * (elapsed.sin() * 0.5 + 0.5)).max(10.0);
        
        RenderFn::new(move |painter| {
            let mut paint = Paint::default();
            paint.set_style(PaintStyle::Fill);
            paint.set_color(Color::from_rgb(0, 120, 215));
            painter.canvas.draw_circle(center, radius, &paint);
        })
    }
}
```

## 组件库设计

### 创建可复用的组件库

```javascript
// components/ui-library.js

export class Button {
    constructor(config = {}) {
        this.element = new ButtonElement();
        this.config = {
            variant: 'primary',  // 'primary' | 'secondary' | 'danger'
            size: 'medium',      // 'small' | 'medium' | 'large'
            ...config
        };
        
        this.render();
    }
    
    render() {
        const styles = this.getStyles();
        this.element.setStyle(styles);
    }
    
    getStyles() {
        const baseStyles = {
            padding: this.getSizePadding(),
            borderRadius: 4,
            cursor: 'pointer',
            border: 'none',
        };
        
        const variantStyles = this.getVariantStyles();
        
        return { ...baseStyles, ...variantStyles };
    }
    
    getSizePadding() {
        switch (this.config.size) {
            case 'small': return '6px 12px';
            case 'large': return '14px 28px';
            default: return '10px 20px';
        }
    }
    
    getVariantStyles() {
        switch (this.config.variant) {
            case 'primary':
                return {
                    background: '#007bff',
                    color: 'white',
                };
            case 'secondary':
                return {
                    background: '#6c757d',
                    color: 'white',
                };
            case 'danger':
                return {
                    background: '#dc3545',
                    color: 'white',
                };
            default:
                return {};
        }
    }
    
    setText(text) {
        const label = new LabelElement();
        label.setText(text);
        this.element.addChild(label);
    }
    
    onClick(handler) {
        this.element.bindClick(handler);
    }
    
    getElement() {
        return this.element;
    }
}

export class Card {
    constructor() {
        this.element = new ContainerElement();
        this.element.setStyle({
            background: 'white',
            borderRadius: 8,
            padding: 20,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        });
    }
    
    setTitle(title) {
        const titleLabel = new LabelElement();
        titleLabel.setText(title);
        titleLabel.setStyle({
            fontSize: 20,
            fontWeight: 'bold',
            marginBottom: 10,
        });
        this.element.addChild(titleLabel);
    }
    
    setContent(content) {
        if (typeof content === 'string') {
            const label = new LabelElement();
            label.setText(content);
            this.element.addChild(label);
        } else {
            this.element.addChild(content);
        }
    }
    
    getElement() {
        return this.element;
    }
}
```

使用组件库：

```javascript
import { Button, Card } from './components/ui-library.js';

// 创建卡片
const card = new Card();
card.setTitle("Welcome");
card.setContent("This is a reusable card component");

// 创建按钮
const primaryBtn = new Button({ variant: 'primary', size: 'large' });
primaryBtn.setText("Primary Button");
primaryBtn.onClick(() => console.log("Primary clicked"));

const dangerBtn = new Button({ variant: 'danger' });
dangerBtn.setText("Delete");
dangerBtn.onClick(() => console.log("Delete clicked"));
```

## 下一步

- 查看[样式和主题](./styling-theming.md)了解样式系统
- 阅读[动画效果](./animations.md)学习动画实现
- 探索[系统集成](./system-integration.md)了解平台特定功能
