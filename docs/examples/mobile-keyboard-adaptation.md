# 移动端键盘高度适配

本指南介绍如何在移动平台（Android 和 iOS）上正确处理虚拟键盘的显示和隐藏。

## 问题说明

在移动设备上，当用户点击输入框时，虚拟键盘会弹出并占据屏幕的一部分空间。如果不做适配，可能会导致：

- 输入框被键盘遮挡
- 内容无法滚动到可见区域
- 用户体验差

## 解决方案概览

Deft 提供多种方式来处理键盘适配：

1. **自动适配** - 框架自动调整布局
2. **手动监听** - 监听键盘事件并手动调整
3. **安全区域** - 使用安全区域 API
4. **滚动到输入框** - 自动滚动使输入框可见

## 键盘事件

### 监听键盘显示和隐藏

```javascript
// 键盘显示事件
window.bindKeyboardShow((e) => {
    const keyboardHeight = e.detail.height;
    console.log("键盘高度:", keyboardHeight);
    
    // 调整布局
    adjustForKeyboard(keyboardHeight);
});

// 键盘隐藏事件
window.bindKeyboardHide(() => {
    console.log("键盘已隐藏");
    
    // 恢复布局
    restoreLayout();
});

// 键盘高度变化（支持分屏、浮动键盘等）
window.bindKeyboardHeightChange((e) => {
    const newHeight = e.detail.height;
    console.log("键盘高度变化:", newHeight);
    
    adjustForKeyboard(newHeight);
});
```

## 自动适配方案

### 方案 1: 底部内边距

最简单的方法是动态调整容器的底部内边距：

```javascript
const container = new ScrollElement();
container.setStyle({
    flex: 1,
    padding: 20,
});

// 存储原始内边距
let originalPaddingBottom = 20;

window.bindKeyboardShow((e) => {
    const keyboardHeight = e.detail.height;
    
    // 增加底部内边距
    container.setStyle({
        paddingBottom: keyboardHeight + originalPaddingBottom,
    });
});

window.bindKeyboardHide(() => {
    // 恢复原始内边距
    container.setStyle({
        paddingBottom: originalPaddingBottom,
    });
});
```

### 方案 2: 调整容器高度

```javascript
const mainContainer = new ContainerElement();
mainContainer.setStyle({
    flex: 1,
});

const content = new ScrollElement();
content.setStyle({
    flex: 1,
});

let keyboardVisible = false;
let keyboardHeight = 0;

window.bindKeyboardShow((e) => {
    keyboardVisible = true;
    keyboardHeight = e.detail.height;
    
    // 减少内容区域高度
    const windowHeight = window.getSize().height;
    content.setStyle({
        height: windowHeight - keyboardHeight,
    });
});

window.bindKeyboardHide(() => {
    keyboardVisible = false;
    
    // 恢复全屏高度
    content.setStyle({
        height: '100%',
    });
});
```

### 方案 3: 使用 Transform

```javascript
let keyboardOffset = 0;

window.bindKeyboardShow((e) => {
    keyboardOffset = e.detail.height;
    
    // 向上移动整个内容
    container.setStyle({
        transform: `translateY(-${keyboardOffset}px)`,
        transition: 'transform 0.3s ease-out',
    });
});

window.bindKeyboardHide(() => {
    // 恢复位置
    container.setStyle({
        transform: 'translateY(0)',
        transition: 'transform 0.3s ease-out',
    });
});
```

## 输入框焦点处理

### 自动滚动到输入框

```javascript
class SmartForm {
    constructor() {
        this.container = new ScrollElement();
        this.inputs = [];
        this.setupKeyboardHandling();
    }
    
    setupKeyboardHandling() {
        // 监听键盘显示
        window.bindKeyboardShow((e) => {
            const keyboardHeight = e.detail.height;
            
            // 找到当前聚焦的输入框
            const focusedInput = this.findFocusedInput();
            if (focusedInput) {
                this.scrollToInput(focusedInput, keyboardHeight);
            }
        });
    }
    
    addInput(input) {
        this.inputs.push(input);
        
        // 监听输入框焦点
        input.bindFocus(() => {
            // 延迟执行，等待键盘动画
            setTimeout(() => {
                const keyboardHeight = window.getKeyboardHeight();
                if (keyboardHeight > 0) {
                    this.scrollToInput(input, keyboardHeight);
                }
            }, 300);
        });
        
        this.container.addChild(input);
    }
    
    findFocusedInput() {
        return this.inputs.find(input => input.isFocused());
    }
    
    scrollToInput(input, keyboardHeight) {
        const inputBounds = input.getBounds();
        const windowHeight = window.getSize().height;
        const visibleHeight = windowHeight - keyboardHeight;
        
        // 计算输入框相对于窗口的位置
        const inputBottom = inputBounds.y + inputBounds.height;
        
        // 如果输入框被键盘遮挡
        if (inputBottom > visibleHeight) {
            // 计算需要滚动的距离
            const scrollOffset = inputBottom - visibleHeight + 20; // 额外 20px 边距
            
            // 滚动到输入框
            this.container.scrollBy(0, scrollOffset);
        }
    }
}

// 使用
const form = new SmartForm();

const nameInput = new TextInputElement();
nameInput.setPlaceholder("姓名");
form.addInput(nameInput);

const emailInput = new TextInputElement();
emailInput.setPlaceholder("邮箱");
form.addInput(emailInput);

const messageInput = new TextEditElement();
messageInput.setPlaceholder("留言");
form.addInput(messageInput);
```

### 精确计算可见区域

```javascript
function calculateVisibleArea() {
    const windowSize = window.getSize();
    const keyboardHeight = window.getKeyboardHeight();
    const safeArea = window.getSafeAreaInsets();
    
    return {
        top: safeArea.top,
        bottom: windowSize.height - keyboardHeight - safeArea.bottom,
        left: safeArea.left,
        right: windowSize.width - safeArea.right,
        height: windowSize.height - keyboardHeight - safeArea.top - safeArea.bottom,
        width: windowSize.width - safeArea.left - safeArea.right,
    };
}

// 使用
function adjustLayout() {
    const visibleArea = calculateVisibleArea();
    
    container.setStyle({
        paddingTop: visibleArea.top,
        paddingBottom: window.getSize().height - visibleArea.bottom,
        paddingLeft: visibleArea.left,
        paddingRight: window.getSize().width - visibleArea.right,
    });
}

window.bindKeyboardShow(() => adjustLayout());
window.bindKeyboardHide(() => adjustLayout());
```

## Android 特定处理

### AndroidManifest 配置

```xml
<!-- AndroidManifest.xml -->
<activity
    android:name=".MainActivity"
    android:windowSoftInputMode="adjustResize">
    <!-- adjustResize: 调整窗口大小以适应键盘 -->
    <!-- adjustPan: 平移窗口使输入框可见 -->
    <!-- adjustNothing: 不做任何调整 -->
</activity>
```

### 在 Rust 中设置

```rust
// src/lib.rs (Android)
#[cfg(target_os = "android")]
use android_activity::AndroidApp;

#[cfg(target_os = "android")]
#[no_mangle]
fn android_main(app: AndroidApp) {
    // 设置键盘模式
    let window = app.native_window();
    // ... 配置键盘行为
    
    let deft_app = App::new(MyApp {});
    deft::android_bootstrap(app, deft_app);
}
```

### Android 键盘类型

```javascript
// 设置输入类型以显示合适的键盘
const emailInput = new TextInputElement();
emailInput.setType("email");  // 邮箱键盘

const phoneInput = new TextInputElement();
phoneInput.setType("tel");     // 电话键盘

const numberInput = new TextInputElement();
numberInput.setType("number"); // 数字键盘

const urlInput = new TextInputElement();
urlInput.setType("url");       // URL 键盘
```

## iOS 特定处理

### 安全区域适配

iOS 设备（特别是有刘海的设备）需要考虑安全区域：

```javascript
function adaptForIOSSafeArea() {
    const safeArea = window.getSafeAreaInsets();
    
    // 应用安全区域
    container.setStyle({
        paddingTop: safeArea.top,
        paddingBottom: safeArea.bottom,
        paddingLeft: safeArea.left,
        paddingRight: safeArea.right,
    });
}

// 键盘显示时还需要额外处理
window.bindKeyboardShow((e) => {
    const safeArea = window.getSafeAreaInsets();
    const keyboardHeight = e.detail.height;
    
    container.setStyle({
        paddingBottom: keyboardHeight + safeArea.bottom,
    });
});
```

### iOS 键盘工具栏

```javascript
// 创建键盘工具栏（iOS）
class KeyboardToolbar {
    constructor() {
        this.toolbar = new ContainerElement();
        this.toolbar.setStyle({
            height: 44,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#f7f7f7',
            borderTop: '1px #c6c6c8',
            padding: '0 10px',
        });
        
        this.createButtons();
    }
    
    createButtons() {
        // 上一个输入框
        const prevBtn = this.createButton("◀", () => {
            this.focusPrevInput();
        });
        
        // 下一个输入框
        const nextBtn = this.createButton("▶", () => {
            this.focusNextInput();
        });
        
        // 完成按钮
        const doneBtn = this.createButton("完成", () => {
            this.dismissKeyboard();
        });
        
        const leftGroup = new ContainerElement();
        leftGroup.setStyle({ flexDirection: 'row', gap: 10 });
        leftGroup.addChild(prevBtn);
        leftGroup.addChild(nextBtn);
        
        this.toolbar.addChild(leftGroup);
        this.toolbar.addChild(doneBtn);
    }
    
    createButton(text, onClick) {
        const btn = new ButtonElement();
        const label = new LabelElement();
        label.setText(text);
        btn.addChild(label);
        btn.setStyle({
            padding: '8px 12px',
            background: 'transparent',
        });
        btn.bindClick(onClick);
        return btn;
    }
    
    dismissKeyboard() {
        window.endEditing();  // iOS 关闭键盘
    }
}
```

## 完整示例：聊天界面

```javascript
class ChatInterface {
    constructor() {
        this.setupUI();
        this.setupKeyboardHandling();
    }
    
    setupUI() {
        // 主容器
        this.container = new ContainerElement();
        this.container.setStyle({
            flex: 1,
        });
        
        // 消息列表
        this.messageList = new ScrollElement();
        this.messageList.setStyle({
            flex: 1,
            padding: 10,
            gap: 10,
        });
        
        // 输入区域
        this.inputArea = new ContainerElement();
        this.inputArea.setStyle({
            flexDirection: 'row',
            padding: 10,
            gap: 10,
            background: '#f5f5f5',
            alignItems: 'flex-end',
        });
        
        // 输入框
        this.input = new TextEditElement();
        this.input.setPlaceholder("输入消息...");
        this.input.setStyle({
            flex: 1,
            maxHeight: 100,
            padding: 8,
            background: 'white',
            borderRadius: 20,
        });
        
        // 发送按钮
        this.sendBtn = new ButtonElement();
        const sendLabel = new LabelElement();
        sendLabel.setText("发送");
        this.sendBtn.addChild(sendLabel);
        this.sendBtn.setStyle({
            padding: '8px 16px',
            background: '#007AFF',
            color: 'white',
            borderRadius: 20,
        });
        this.sendBtn.bindClick(() => this.sendMessage());
        
        this.inputArea.addChild(this.input);
        this.inputArea.addChild(this.sendBtn);
        
        this.container.addChild(this.messageList);
        this.container.addChild(this.inputArea);
    }
    
    setupKeyboardHandling() {
        let originalInputAreaBottom = 0;
        
        window.bindKeyboardShow((e) => {
            const keyboardHeight = e.detail.height;
            
            // 调整输入区域位置
            this.inputArea.setStyle({
                transform: `translateY(-${keyboardHeight}px)`,
                transition: 'transform 0.3s ease-out',
            });
            
            // 同时调整消息列表高度
            const windowHeight = window.getSize().height;
            this.messageList.setStyle({
                height: windowHeight - this.inputArea.getBounds().height - keyboardHeight,
            });
            
            // 滚动到底部
            setTimeout(() => {
                this.scrollToBottom();
            }, 100);
        });
        
        window.bindKeyboardHide(() => {
            // 恢复原始位置
            this.inputArea.setStyle({
                transform: 'translateY(0)',
                transition: 'transform 0.3s ease-out',
            });
            
            this.messageList.setStyle({
                flex: 1,
                height: 'auto',
            });
        });
        
        // 输入框获得焦点时也滚动到底部
        this.input.bindFocus(() => {
            setTimeout(() => this.scrollToBottom(), 300);
        });
    }
    
    sendMessage() {
        const text = this.input.getText();
        if (text.trim()) {
            this.addMessage(text, 'user');
            this.input.setText("");
            this.scrollToBottom();
        }
    }
    
    addMessage(text, sender) {
        const message = new ContainerElement();
        message.setStyle({
            padding: 10,
            background: sender === 'user' ? '#007AFF' : '#E5E5EA',
            color: sender === 'user' ? 'white' : 'black',
            borderRadius: 18,
            maxWidth: '70%',
            alignSelf: sender === 'user' ? 'flex-end' : 'flex-start',
        });
        
        const label = new LabelElement();
        label.setText(text);
        message.addChild(label);
        
        this.messageList.addChild(message);
    }
    
    scrollToBottom() {
        const scrollHeight = this.messageList.getScrollHeight();
        this.messageList.scrollTo(0, scrollHeight);
    }
}

// 使用
const chat = new ChatInterface();
window.setBody(chat.container);
```

## 高级技巧

### 1. 防止输入框被遮挡的通用方案

```javascript
class KeyboardAvoidingView {
    constructor() {
        this.container = new ContainerElement();
        this.activeInput = null;
        this.setupListeners();
    }
    
    setupListeners() {
        window.bindKeyboardShow((e) => {
            if (this.activeInput) {
                this.ensureInputVisible(e.detail.height);
            }
        });
    }
    
    registerInput(input) {
        input.bindFocus(() => {
            this.activeInput = input;
            const keyboardHeight = window.getKeyboardHeight();
            if (keyboardHeight > 0) {
                this.ensureInputVisible(keyboardHeight);
            }
        });
        
        input.bindBlur(() => {
            this.activeInput = null;
        });
    }
    
    ensureInputVisible(keyboardHeight) {
        const windowHeight = window.getSize().height;
        const visibleHeight = windowHeight - keyboardHeight;
        const inputBounds = this.activeInput.getBounds();
        
        if (inputBounds.y + inputBounds.height > visibleHeight) {
            const offset = (inputBounds.y + inputBounds.height) - visibleHeight + 20;
            this.container.setStyle({
                transform: `translateY(-${offset}px)`,
                transition: 'transform 0.25s ease-out',
            });
        }
    }
}
```

### 2. 响应式键盘高度

```javascript
// 平滑过渡键盘高度变化
let currentKeyboardHeight = 0;

window.bindKeyboardHeightChange((e) => {
    const newHeight = e.detail.height;
    const diff = newHeight - currentKeyboardHeight;
    
    // 使用动画过渡
    container.setStyle({
        paddingBottom: newHeight,
        transition: 'padding-bottom 0.25s ease-out',
    });
    
    currentKeyboardHeight = newHeight;
});
```

### 3. 键盘状态管理

```javascript
class KeyboardManager {
    constructor() {
        this.isVisible = false;
        this.height = 0;
        this.callbacks = {
            show: [],
            hide: [],
            change: [],
        };
        
        this.setupListeners();
    }
    
    setupListeners() {
        window.bindKeyboardShow((e) => {
            this.isVisible = true;
            this.height = e.detail.height;
            this.callbacks.show.forEach(cb => cb(this.height));
        });
        
        window.bindKeyboardHide(() => {
            this.isVisible = false;
            this.height = 0;
            this.callbacks.hide.forEach(cb => cb());
        });
        
        window.bindKeyboardHeightChange((e) => {
            this.height = e.detail.height;
            this.callbacks.change.forEach(cb => cb(this.height));
        });
    }
    
    onShow(callback) {
        this.callbacks.show.push(callback);
    }
    
    onHide(callback) {
        this.callbacks.hide.push(callback);
    }
    
    onChange(callback) {
        this.callbacks.change.push(callback);
    }
    
    getHeight() {
        return this.height;
    }
    
    isKeyboardVisible() {
        return this.isVisible;
    }
}

// 全局键盘管理器
const keyboardManager = new KeyboardManager();

// 使用
keyboardManager.onShow((height) => {
    console.log("键盘显示，高度:", height);
});
```

## 最佳实践

1. **总是监听键盘事件** - 不要假设键盘高度固定
2. **使用过渡动画** - 提供流畅的用户体验
3. **考虑安全区域** - 特别是在 iOS 上
4. **测试不同键盘** - 第三方键盘可能有不同的高度
5. **保存输入状态** - 键盘隐藏时可能触发失焦事件
6. **适配横屏模式** - 横屏时键盘占用更多空间

## 相关文档

- [Android 平台开发](../platforms/android.md)
- [iOS 平台开发](../platforms/ios.md)
- [事件处理](./event-handling.md)
- [UI 组件 API](../api/ui-components.md)
