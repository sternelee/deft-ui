# 多窗口管理

本指南介绍如何在 Deft 应用中创建和管理多个窗口。

## 多窗口架构

Deft 支持在单个应用中创建和管理多个独立窗口：

```
Application
  ├── Window 1 (Main)
  │   ├── Page 1
  │   └── Page 2
  ├── Window 2 (Settings)
  │   └── Page 1
  └── Window 3 (About)
      └── Page 1
```

## 创建多个窗口

### 基本用法

```javascript
// 创建主窗口
const mainWindow = new Window({
    width: 1024,
    height: 768,
    title: "主窗口",
});

// 创建设置窗口
const settingsWindow = new Window({
    width: 600,
    height: 400,
    title: "设置",
    resizable: false,
});

// 创建关于窗口
const aboutWindow = new Window({
    width: 400,
    height: 300,
    title: "关于",
    closable: true,
    minimizable: false,
    maximizable: false,
});
```

### 窗口配置选项

```javascript
const window = new Window({
    // 尺寸配置
    width: 800,                    // 窗口宽度
    height: 600,                   // 窗口高度
    minWidth: 400,                 // 最小宽度
    minHeight: 300,                // 最小高度
    maxWidth: 1920,                // 最大宽度
    maxHeight: 1080,               // 最大高度
    
    // 位置配置
    position: [100, 100],          // [x, y] 初始位置
    centered: true,                // 居中显示
    
    // 窗口装饰
    title: "My App",               // 窗口标题
    decorations: true,             // 显示标题栏和边框
    
    // 窗口行为
    resizable: true,               // 可调整大小
    minimizable: true,             // 可最小化
    maximizable: true,             // 可最大化
    closable: true,                // 可关闭
    alwaysOnTop: false,            // 始终置顶
    
    // 可见性
    visible: true,                 // 初始可见
    
    // 透明度
    transparent: false,            // 窗口透明
    
    // 窗口类型
    windowType: "normal",          // "normal" | "menu" | "dialog"
    
    // 渲染配置
    preferredRenderers: ["GL", "SoftBuffer"],  // 渲染器优先级
});
```

## 窗口管理

### 显示和隐藏

```javascript
// 显示窗口
window.setVisible(true);
window.show();

// 隐藏窗口
window.setVisible(false);
window.hide();

// 切换可见性
window.toggleVisible();
```

### 位置和尺寸

```javascript
// 设置位置
window.setPosition(100, 100);

// 获取位置
const position = window.getPosition();  // { x: 100, y: 100 }

// 移动窗口
window.moveTo(200, 200);
window.moveBy(50, 50);  // 相对移动

// 设置尺寸
window.setSize(1024, 768);

// 获取尺寸
const size = window.getSize();  // { width: 1024, height: 768 }

// 调整尺寸
window.resize(800, 600);
window.resizeBy(100, 50);  // 相对调整

// 设置最小/最大尺寸
window.setMinSize(400, 300);
window.setMaxSize(1920, 1080);
```

### 窗口状态

```javascript
// 最小化
window.minimize();

// 最大化
window.maximize();

// 还原
window.restore();

// 全屏
window.setFullscreen(true);

// 获取窗口状态
const isMinimized = window.isMinimized();
const isMaximized = window.isMaximized();
const isFullscreen = window.isFullscreen();
```

### 焦点管理

```javascript
// 聚焦窗口
window.focus();

// 检查焦点
const isFocused = window.isFocused();

// 监听焦点变化
window.bindFocus(() => {
    console.log("窗口获得焦点");
});

window.bindBlur(() => {
    console.log("窗口失去焦点");
});
```

## 无边框窗口

### 创建无边框窗口

```javascript
const borderlessWindow = new Window({
    width: 800,
    height: 600,
    decorations: false,  // 禁用默认装饰
    transparent: true,   // 可选：透明背景
});

// 设置自定义标题栏
const titleBar = new ContainerElement();
titleBar.setStyle({
    height: 40,
    background: '#2c3e50',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 10px',
});

// 标题文本
const title = new LabelElement();
title.setText("自定义标题栏");
title.setStyle({
    color: 'white',
    fontSize: 14,
});

// 窗口控制按钮
const controls = new ContainerElement();
controls.setStyle({
    flexDirection: 'row',
    gap: 5,
});

// 最小化按钮
const minimizeBtn = createControlButton("−", () => {
    borderlessWindow.minimize();
});

// 最大化/还原按钮
let isMaximized = false;
const maximizeBtn = createControlButton("□", () => {
    if (isMaximized) {
        borderlessWindow.restore();
    } else {
        borderlessWindow.maximize();
    }
    isMaximized = !isMaximized;
});

// 关闭按钮
const closeBtn = createControlButton("×", () => {
    borderlessWindow.close();
});

controls.addChild(minimizeBtn);
controls.addChild(maximizeBtn);
controls.addChild(closeBtn);

titleBar.addChild(title);
titleBar.addChild(controls);

// 辅助函数：创建控制按钮
function createControlButton(text, onClick) {
    const btn = new ButtonElement();
    const label = new LabelElement();
    label.setText(text);
    label.setStyle({
        color: 'white',
        fontSize: 16,
    });
    btn.addChild(label);
    btn.setStyle({
        width: 30,
        height: 30,
        background: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
    });
    btn.setHoverStyle({
        background: 'rgba(255, 255, 255, 0.1)',
    });
    btn.bindClick(onClick);
    return btn;
}
```

### 拖动无边框窗口

```javascript
// 使标题栏可拖动
let isDragging = false;
let dragStart = { x: 0, y: 0 };

titleBar.bindMouseDown((e) => {
    isDragging = true;
    dragStart = {
        x: e.detail.windowX,
        y: e.detail.windowY,
    };
});

titleBar.bindMouseMove((e) => {
    if (isDragging) {
        const dx = e.detail.windowX - dragStart.x;
        const dy = e.detail.windowY - dragStart.y;
        
        const pos = borderlessWindow.getPosition();
        borderlessWindow.setPosition(pos.x + dx, pos.y + dy);
    }
});

titleBar.bindMouseUp(() => {
    isDragging = false;
});

// 双击标题栏最大化/还原
titleBar.bindDoubleClick(() => {
    if (isMaximized) {
        borderlessWindow.restore();
    } else {
        borderlessWindow.maximize();
    }
    isMaximized = !isMaximized;
});
```

## 窗口间通信

### 方法 1: 全局状态

```javascript
// 创建全局状态管理器
const AppState = {
    windows: new Map(),
    data: {},
    
    registerWindow(id, window) {
        this.windows.set(id, window);
    },
    
    getWindow(id) {
        return this.windows.get(id);
    },
    
    broadcast(message) {
        this.windows.forEach((window, id) => {
            window.postMessage(message);
        });
    },
};

// 主窗口
const mainWindow = new Window({ title: "主窗口" });
AppState.registerWindow("main", mainWindow);

// 设置窗口
const settingsWindow = new Window({ title: "设置" });
AppState.registerWindow("settings", settingsWindow);

// 从设置窗口发送消息到主窗口
function sendToMain(data) {
    const mainWin = AppState.getWindow("main");
    if (mainWin) {
        mainWin.postMessage({ type: "settings-update", data });
    }
}
```

### 方法 2: 事件总线

```javascript
// 创建事件总线
class EventBus {
    constructor() {
        this.listeners = new Map();
    }
    
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }
    
    emit(event, data) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            callbacks.forEach(cb => cb(data));
        }
    }
    
    off(event, callback) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }
}

const eventBus = new EventBus();

// 窗口 1 监听事件
eventBus.on('data-updated', (data) => {
    console.log("窗口 1 收到更新:", data);
    updateUI(data);
});

// 窗口 2 触发事件
eventBus.emit('data-updated', { value: 42 });
```

### 方法 3: 窗口引用

```javascript
// 主窗口创建子窗口并保持引用
class MainWindow {
    constructor() {
        this.window = new Window({ title: "主窗口" });
        this.childWindows = [];
    }
    
    openSettings() {
        const settingsWindow = new Window({ title: "设置" });
        
        // 保存引用
        this.childWindows.push(settingsWindow);
        
        // 设置窗口可以访问主窗口
        settingsWindow.parent = this;
        
        // 监听关闭事件
        settingsWindow.bindClose(() => {
            const index = this.childWindows.indexOf(settingsWindow);
            if (index > -1) {
                this.childWindows.splice(index, 1);
            }
        });
        
        return settingsWindow;
    }
    
    updateFromSettings(data) {
        console.log("主窗口收到设置更新:", data);
        this.applySettings(data);
    }
}

// 使用
const mainWin = new MainWindow();
const settingsWin = mainWin.openSettings();

// 设置窗口更新主窗口
settingsWin.parent.updateFromSettings({ theme: 'dark' });
```

## 模态窗口

### 创建模态对话框

```javascript
class ModalDialog {
    constructor(options) {
        this.window = new Window({
            width: options.width || 400,
            height: options.height || 300,
            title: options.title || "对话框",
            resizable: false,
            windowType: "dialog",
        });
        
        this.result = null;
        this.callbacks = [];
        
        this.createContent(options);
    }
    
    createContent(options) {
        const container = new ContainerElement();
        container.setStyle({
            flex: 1,
            padding: 20,
            gap: 15,
        });
        
        // 消息内容
        const message = new LabelElement();
        message.setText(options.message || "");
        message.setStyle({
            flex: 1,
            textAlign: 'center',
        });
        
        // 按钮区域
        const buttonRow = new ContainerElement();
        buttonRow.setStyle({
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 10,
        });
        
        // 确认按钮
        const okButton = new ButtonElement();
        const okLabel = new LabelElement();
        okLabel.setText(options.okText || "确定");
        okButton.addChild(okLabel);
        okButton.bindClick(() => {
            this.result = true;
            this.close();
        });
        
        // 取消按钮（如果需要）
        if (options.showCancel) {
            const cancelButton = new ButtonElement();
            const cancelLabel = new LabelElement();
            cancelLabel.setText(options.cancelText || "取消");
            cancelButton.addChild(cancelLabel);
            cancelButton.bindClick(() => {
                this.result = false;
                this.close();
            });
            buttonRow.addChild(cancelButton);
        }
        
        buttonRow.addChild(okButton);
        
        container.addChild(message);
        container.addChild(buttonRow);
        
        this.window.setBody(container);
    }
    
    show() {
        return new Promise((resolve) => {
            this.callbacks.push(resolve);
            this.window.setVisible(true);
            this.window.focus();
        });
    }
    
    close() {
        this.window.close();
        this.callbacks.forEach(cb => cb(this.result));
        this.callbacks = [];
    }
}

// 使用模态对话框
async function confirmAction() {
    const dialog = new ModalDialog({
        title: "确认",
        message: "确定要删除这个项目吗？",
        showCancel: true,
    });
    
    const result = await dialog.show();
    if (result) {
        console.log("用户确认删除");
        deleteItem();
    } else {
        console.log("用户取消");
    }
}
```

## 窗口缩放

### DPI 缩放

```javascript
// 获取当前缩放因子
const scaleFactor = window.getScaleFactor();
console.log("DPI 缩放:", scaleFactor);  // 例如: 2.0 (Retina), 1.5 (150%)

// 监听缩放变化
window.bindScaleFactorChange((e) => {
    const newScale = e.detail.scaleFactor;
    console.log("缩放因子变化:", newScale);
    
    // 调整 UI
    adjustUIForScale(newScale);
});

// 根据缩放调整 UI
function adjustUIForScale(scale) {
    const baseSize = 16;
    const scaledSize = baseSize * scale;
    
    // 调整字体大小
    document.setStyle({
        fontSize: scaledSize,
    });
}
```

### 内容缩放

```javascript
// 实现应用级缩放
let zoomLevel = 1.0;

function setZoomLevel(level) {
    zoomLevel = level;
    
    // 缩放整个内容
    const body = window.getBody();
    body.setStyle({
        transform: `scale(${level})`,
        transformOrigin: 'top left',
    });
}

// 缩放控制
function zoomIn() {
    setZoomLevel(Math.min(zoomLevel + 0.1, 3.0));
}

function zoomOut() {
    setZoomLevel(Math.max(zoomLevel - 0.1, 0.5));
}

function resetZoom() {
    setZoomLevel(1.0);
}

// 键盘快捷键
window.bindKeyDown((e) => {
    if (e.detail.ctrlKey) {
        if (e.detail.key === '+' || e.detail.key === '=') {
            zoomIn();
            e.preventDefault();
        } else if (e.detail.key === '-') {
            zoomOut();
            e.preventDefault();
        } else if (e.detail.key === '0') {
            resetZoom();
            e.preventDefault();
        }
    }
});
```

## 多显示器支持

### 获取显示器信息

```javascript
// 获取所有显示器
const monitors = window.getMonitors();

monitors.forEach((monitor, index) => {
    console.log(`显示器 ${index}:`, {
        name: monitor.name,
        size: monitor.size,        // { width, height }
        position: monitor.position, // { x, y }
        scaleFactor: monitor.scaleFactor,
        isPrimary: monitor.isPrimary,
    });
});
```

### 在特定显示器上打开窗口

```javascript
// 获取主显示器
const primaryMonitor = window.getMonitors().find(m => m.isPrimary);

// 在主显示器中心打开窗口
const window = new Window({
    width: 800,
    height: 600,
    position: [
        primaryMonitor.position.x + (primaryMonitor.size.width - 800) / 2,
        primaryMonitor.position.y + (primaryMonitor.size.height - 600) / 2,
    ],
});

// 或使用居中选项
const centeredWindow = new Window({
    width: 800,
    height: 600,
    centered: true,  // 在当前显示器居中
});
```

### 监听显示器变化

```javascript
// 监听显示器配置变化
window.bindMonitorChange((e) => {
    console.log("显示器配置变化:", e.detail);
    
    // 重新调整窗口位置
    adjustWindowsForMonitors();
});
```

## 窗口生命周期

```javascript
// 窗口创建
const window = new Window({ title: "My App" });

// 监听窗口关闭
window.bindClose(() => {
    console.log("窗口即将关闭");
    
    // 保存状态
    saveWindowState();
    
    // 清理资源
    cleanup();
    
    // 返回 false 可以阻止关闭
    // return false;
});

// 监听窗口销毁
window.bindDestroy(() => {
    console.log("窗口已销毁");
});

// 监听窗口移动
window.bindMove((e) => {
    console.log("窗口移动到:", e.detail.position);
});

// 监听窗口调整大小
window.bindResize((e) => {
    console.log("窗口大小:", e.detail.width, e.detail.height);
});
```

## 最佳实践

### 1. 窗口管理器

```javascript
class WindowManager {
    constructor() {
        this.windows = new Map();
        this.nextId = 1;
    }
    
    create(config) {
        const id = this.nextId++;
        const window = new Window(config);
        
        this.windows.set(id, window);
        
        window.bindClose(() => {
            this.windows.delete(id);
        });
        
        return { id, window };
    }
    
    get(id) {
        return this.windows.get(id);
    }
    
    closeAll() {
        this.windows.forEach(window => window.close());
        this.windows.clear();
    }
    
    count() {
        return this.windows.size;
    }
}

// 使用
const windowManager = new WindowManager();
const { id, window } = windowManager.create({ title: "窗口 1" });
```

### 2. 记住窗口位置和大小

```javascript
function saveWindowState(window, key) {
    const state = {
        position: window.getPosition(),
        size: window.getSize(),
        isMaximized: window.isMaximized(),
    };
    
    localStorage.setItem(`window-${key}`, JSON.stringify(state));
}

function restoreWindowState(window, key) {
    const stateJson = localStorage.getItem(`window-${key}`);
    if (stateJson) {
        const state = JSON.parse(stateJson);
        
        window.setPosition(state.position.x, state.position.y);
        window.setSize(state.size.width, state.size.height);
        
        if (state.isMaximized) {
            window.maximize();
        }
    }
}

// 使用
const window = new Window({ title: "主窗口" });
restoreWindowState(window, "main");

window.bindClose(() => {
    saveWindowState(window, "main");
});
```

### 3. 防止意外关闭

```javascript
let hasUnsavedChanges = false;

window.bindClose(() => {
    if (hasUnsavedChanges) {
        const dialog = new ModalDialog({
            title: "未保存的更改",
            message: "您有未保存的更改，确定要关闭吗？",
            showCancel: true,
        });
        
        dialog.show().then(result => {
            if (result) {
                window.close();
            }
        });
        
        return false;  // 阻止立即关闭
    }
});
```

## 相关文档

- [窗口 API 参考](../api/ui-components.md#window)
- [事件处理](../examples/event-handling.md)
- [平台特定功能](../platforms/)
