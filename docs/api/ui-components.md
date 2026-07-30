# UI 组件 API

本文档详细介绍 Deft UI 框架中所有可用的 UI 组件。

## 基础组件

### Element

所有 UI 元素的基类。

```typescript
class Element {
    // 属性
    eid: number;                    // 元素唯一ID
    parent: Element | null;         // 父元素
    window: Window | null;          // 所属窗口
    
    // 样式
    style: StyleObject;             // 内联样式
    hoverStyle: StyleObject;        // 悬停样式
    activeStyle: StyleObject;       // 激活样式
    class: string;                  // CSS类名
    
    // 方法
    addChild(child: Element): void;
    removeChild(child: Element): void;
    insertBefore(newChild: Element, referenceChild: Element): void;
    getBounds(): ElementRect;
    focus(): void;
    blur(): void;
    
    // 事件绑定
    bindClick(handler: (e: MouseEvent) => void): void;
    bindMouseDown(handler: (e: MouseEvent) => void): void;
    bindMouseUp(handler: (e: MouseEvent) => void): void;
    bindMouseMove(handler: (e: MouseEvent) => void): void;
    bindMouseEnter(handler: (e: MouseEvent) => void): void;
    bindMouseLeave(handler: (e: MouseEvent) => void): void;
    bindKeyDown(handler: (e: KeyEvent) => void): void;
    bindKeyUp(handler: (e: KeyEvent) => void): void;
}
```

### ContainerElement

容器元素，用于布局和组织子元素。

```javascript
const container = new ContainerElement();

// 设置样式
container.setStyle({
    flexDirection: 'row',      // 'row' | 'column' | 'row-reverse' | 'column-reverse'
    justifyContent: 'center',  // 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around'
    alignItems: 'center',      // 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline'
    gap: 10,                   // 子元素间距
    padding: 20,               // 内边距
    margin: 10,                // 外边距
});

// 添加子元素
const child = new LabelElement();
child.setText("Hello");
container.addChild(child);
```

**示例：水平布局**

```javascript
const row = new ContainerElement();
row.setStyle({
    flexDirection: 'row',
    gap: 10,
    padding: 10,
});

for (let i = 0; i < 3; i++) {
    const box = new ContainerElement();
    box.setStyle({
        width: 100,
        height: 100,
        background: `#${Math.floor(Math.random()*16777215).toString(16)}`,
    });
    row.addChild(box);
}
```

### LabelElement

文本标签元素。

```javascript
const label = new LabelElement();
label.setText("Hello, World!");

// 设置样式
label.setStyle({
    fontSize: 16,
    fontWeight: 'bold',        // 'normal' | 'bold' | 100-900
    fontStyle: 'italic',       // 'normal' | 'italic'
    color: '#333333',
    textAlign: 'center',       // 'left' | 'center' | 'right' | 'justify'
    lineHeight: 1.5,
    letterSpacing: 1,
    textDecoration: 'underline', // 'none' | 'underline' | 'line-through'
});
```

**示例：多样式文本**

```javascript
const title = new LabelElement();
title.setText("Application Title");
title.setStyle({
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 20,
});

const subtitle = new LabelElement();
subtitle.setText("Version 1.0.0");
subtitle.setStyle({
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    fontStyle: 'italic',
});
```

### ButtonElement

按钮元素。

```javascript
const button = new ButtonElement();

// 添加标签
const label = new LabelElement();
label.setText("Click Me");
button.addChild(label);

// 设置样式
button.setStyle({
    background: '#007bff',
    color: 'white',
    padding: 10,
    borderRadius: 5,
    cursor: 'pointer',
});

// 悬停样式
button.setHoverStyle({
    background: '#0056b3',
});

// 点击事件
button.bindClick(() => {
    console.log("Button clicked!");
});
```

**示例：图标按钮**

```javascript
const iconButton = new ButtonElement();
iconButton.setStyle({
    width: 40,
    height: 40,
    borderRadius: 20,
    background: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
});

const icon = new LabelElement();
icon.setText("🔍");
icon.setStyle({ fontSize: 20 });
iconButton.addChild(icon);

iconButton.bindClick(() => {
    console.log("Search clicked");
});
```

### TextInputElement

单行文本输入框。

```javascript
const input = new TextInputElement();
input.setPlaceholder("Enter text...");

// 设置样式
input.setStyle({
    width: 300,
    padding: 10,
    fontSize: 14,
    border: '1px #ccc',
    borderRadius: 4,
});

// 输入类型
input.setType("text");      // 'text' | 'password' | 'email' | 'number'

// 事件
input.bindTextChange((e) => {
    console.log("Text changed:", e.detail.value);
});

input.bindKeyDown((e) => {
    if (e.detail.key === 'Enter') {
        console.log("Enter pressed, value:", input.getText());
    }
});

// 获取/设置值
const value = input.getText();
input.setText("New value");
```

**示例：表单验证**

```javascript
const emailInput = new TextInputElement();
emailInput.setPlaceholder("your@email.com");
emailInput.setType("email");

const errorLabel = new LabelElement();
errorLabel.setStyle({ color: 'red', fontSize: 12 });

emailInput.bindTextChange((e) => {
    const email = e.detail.value;
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    
    if (email && !isValid) {
        errorLabel.setText("Invalid email format");
        emailInput.setStyle({ border: '1px #ff0000' });
    } else {
        errorLabel.setText("");
        emailInput.setStyle({ border: '1px #ccc' });
    }
});
```

### TextEditElement

多行文本编辑器。

```javascript
const textEdit = new TextEditElement();
textEdit.setText("Multi-line\ntext\neditor");

// 设置样式
textEdit.setStyle({
    width: 400,
    height: 200,
    padding: 10,
    fontSize: 14,
    border: '1px #ccc',
    overflow: 'auto',
});

// 自动聚焦
textEdit.setAutoFocus(true);

// 事件
textEdit.bindTextChange((e) => {
    console.log("Content:", e.detail.value);
});
```

**示例：代码编辑器**

```javascript
const codeEditor = new TextEditElement();
codeEditor.setStyle({
    width: 600,
    height: 400,
    padding: 15,
    fontSize: 14,
    fontFamily: 'monospace',
    background: '#1e1e1e',
    color: '#d4d4d4',
    border: 'none',
    lineHeight: 1.5,
});

codeEditor.setText(`function hello() {
    console.log("Hello, World!");
}`);
```

### ScrollElement

可滚动容器。

```javascript
const scrollContainer = new ScrollElement();
scrollContainer.setStyle({
    width: 400,
    height: 300,
    overflow: 'auto',     // 'visible' | 'hidden' | 'scroll' | 'auto'
    padding: 10,
});

// 添加大量内容
for (let i = 0; i < 100; i++) {
    const item = new LabelElement();
    item.setText(`Item ${i}`);
    scrollContainer.addChild(item);
}

// 滚动事件
scrollContainer.bindScroll((e) => {
    console.log("Scroll position:", e.detail.scrollTop, e.detail.scrollLeft);
});

// 编程式滚动
scrollContainer.scrollTo(0, 100);  // x, y
```

### ImageElement

图片显示元素。

```javascript
const image = new ImageElement();

// 加载本地图片
image.setSource("assets/logo.png");

// 加载网络图片
image.setSource("https://example.com/image.png");

// 加载 base64 图片
image.setSource("data:image/png;base64,iVBORw0KG...");

// 设置样式
image.setStyle({
    width: 200,
    height: 200,
    objectFit: 'cover',    // 'fill' | 'contain' | 'cover' | 'scale-down'
    borderRadius: 10,
});

// 加载事件
image.bindLoad(() => {
    console.log("Image loaded");
});

image.bindError(() => {
    console.log("Failed to load image");
});
```

**示例：图片画廊**

```javascript
const gallery = new ContainerElement();
gallery.setStyle({
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
});

const images = [
    "assets/photo1.jpg",
    "assets/photo2.jpg",
    "assets/photo3.jpg",
];

images.forEach(src => {
    const img = new ImageElement();
    img.setSource(src);
    img.setStyle({
        width: 150,
        height: 150,
        objectFit: 'cover',
        borderRadius: 8,
        cursor: 'pointer',
    });
    
    img.bindClick(() => {
        // 打开大图查看
        console.log("Open image:", src);
    });
    
    gallery.addChild(img);
});
```

## 高级组件

### RichTextElement

富文本元素，支持多样式文本。

```javascript
const richText = new RichTextElement();

// 添加一行文本，包含多个样式段
richText.addLine([
    {
        type: "text",
        text: "Bold text ",
        fontWeight: 'bold',
        fontSize: 16,
    },
    {
        type: "text",
        text: "colored text ",
        color: '#ff0000',
        fontSize: 16,
    },
    {
        type: "text",
        text: "with background",
        backgroundColor: '#ffff00',
        fontSize: 16,
    }
]);

// 添加另一行
richText.addLine([
    {
        type: "text",
        text: "Different font size",
        fontSize: 20,
    }
]);
```

**示例：代码高亮**

```javascript
const codeDisplay = new RichTextElement();

// 模拟语法高亮
codeDisplay.addLine([
    { type: "text", text: "function ", color: '#569cd6' },
    { type: "text", text: "hello", color: '#dcdcaa' },
    { type: "text", text: "() {", color: '#d4d4d4' },
]);

codeDisplay.addLine([
    { type: "text", text: "  console", color: '#4ec9b0' },
    { type: "text", text: ".", color: '#d4d4d4' },
    { type: "text", text: "log", color: '#dcdcaa' },
    { type: "text", text: "(", color: '#d4d4d4' },
    { type: "text", text: '"Hello"', color: '#ce9178' },
    { type: "text", text: ");", color: '#d4d4d4' },
]);

codeDisplay.addLine([
    { type: "text", text: "}", color: '#d4d4d4' },
]);
```

### CanvasElement

自定义绘制元素。

```javascript
const canvas = new CanvasElement();
canvas.setStyle({
    width: 400,
    height: 300,
});

// 绘制
canvas.bindPaint((painter) => {
    // 绘制矩形
    painter.drawRect(10, 10, 100, 50, {
        color: '#ff0000',
        strokeWidth: 2,
    });
    
    // 绘制圆形
    painter.drawCircle(200, 100, 50, {
        fill: '#0000ff',
    });
    
    // 绘制文本
    painter.drawText("Hello Canvas", 50, 150, {
        fontSize: 24,
        color: '#000000',
    });
});

// 触发重绘
canvas.invalidate();
```

## 系统组件

### Window

窗口对象。

```javascript
const window = new Window({
    width: 800,
    height: 600,
    title: "My App",
    resizable: true,
    decorations: true,
    position: [100, 100],
    visible: true,
    minimizable: true,
    maximizable: true,
    closable: true,
});

// 属性
window.setTitle("New Title");
window.setSize(1024, 768);
window.setPosition(200, 200);
window.setVisible(true);
window.setFullscreen(true);

// 获取属性
const size = window.getSize();
const position = window.getPosition();
const handle = window.handle;

// 设置内容
window.setBody(container);

// 事件
window.bindResize((e) => {
    console.log("Window resized:", e.detail.width, e.detail.height);
});

window.bindClose(() => {
    console.log("Window closing");
    return true;  // 返回 false 阻止关闭
});

window.bindFocus(() => {
    console.log("Window focused");
});

window.bindBlur(() => {
    console.log("Window blurred");
});

// 从句柄获取窗口
const sameWindow = Window.fromHandle(handle);
```

### SystemTray

系统托盘图标（仅桌面平台）。

```javascript
if (typeof SystemTray !== 'undefined') {
    const tray = new SystemTray();
    
    // 设置图标
    tray.setIcon("assets/icon.png");
    
    // 设置标题
    tray.setTitle("My App");
    
    // 点击事件
    tray.bindActivate(() => {
        console.log("Tray icon clicked");
    });
    
    // 设置菜单
    tray.setMenus([
        {
            id: "show",
            label: "Show Window",
            handler() {
                window.setVisible(true);
            }
        },
        {
            id: "separator",
            type: "separator",
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

### FileDialog

文件对话框（仅桌面平台）。

```javascript
if (typeof FileDialog !== 'undefined') {
    const dialog = new FileDialog();
    
    // 设置标题
    dialog.setTitle("Select File");
    
    // 设置过滤器
    dialog.setFilters([
        { name: "Text Files", extensions: ["txt", "md"] },
        { name: "Images", extensions: ["png", "jpg", "jpeg"] },
        { name: "All Files", extensions: ["*"] }
    ]);
    
    // 设置默认路径
    dialog.setDefaultPath("/home/user/documents");
    
    // 打开文件
    const filePath = await dialog.openFile();
    if (filePath) {
        console.log("Selected file:", filePath);
    }
    
    // 打开多个文件
    const files = await dialog.openFiles();
    
    // 选择目录
    const dirPath = await dialog.openDirectory();
    
    // 保存文件
    const savePath = await dialog.saveFile();
}
```

## 组件组合示例

### 卡片组件

```javascript
function createCard(title, content) {
    const card = new ContainerElement();
    card.setStyle({
        background: 'white',
        borderRadius: 8,
        padding: 20,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        gap: 10,
    });
    
    const titleLabel = new LabelElement();
    titleLabel.setText(title);
    titleLabel.setStyle({
        fontSize: 20,
        fontWeight: 'bold',
    });
    
    const contentLabel = new LabelElement();
    contentLabel.setText(content);
    contentLabel.setStyle({
        color: '#666',
        lineHeight: 1.5,
    });
    
    card.addChild(titleLabel);
    card.addChild(contentLabel);
    
    return card;
}

// 使用
const card = createCard(
    "Welcome to Deft",
    "This is a cross-platform UI framework built with Rust and JavaScript."
);
```

### 导航栏组件

```javascript
function createNavBar(items) {
    const nav = new ContainerElement();
    nav.setStyle({
        flexDirection: 'row',
        background: '#2c3e50',
        padding: 15,
        gap: 20,
    });
    
    items.forEach(item => {
        const button = new ButtonElement();
        button.setStyle({
            background: 'transparent',
            color: 'white',
            padding: 10,
        });
        
        button.setHoverStyle({
            background: '#34495e',
        });
        
        const label = new LabelElement();
        label.setText(item.label);
        button.addChild(label);
        
        button.bindClick(item.onClick);
        
        nav.addChild(button);
    });
    
    return nav;
}

// 使用
const navbar = createNavBar([
    { label: "Home", onClick: () => console.log("Home") },
    { label: "About", onClick: () => console.log("About") },
    { label: "Contact", onClick: () => console.log("Contact") },
]);
```

## 下一步

- 查看 [事件系统](./events.md) 了解事件处理
- 阅读 [样式系统](./styling.md) 学习样式定制
- 探索 [动画系统](./animations.md) 创建动画效果
