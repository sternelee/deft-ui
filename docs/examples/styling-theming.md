# 样式和主题

本指南介绍 Deft UI 的样式系统和主题定制。

## 样式系统概述

Deft 使用类似 CSS 的样式系统，基于 Flexbox 布局引擎（Yoga）。

### 样式设置方式

有三种方式设置样式：

1. **内联样式** - 直接在元素上设置
2. **CSS 类** - 使用样式表和类名
3. **状态样式** - hover、active 等状态

## 内联样式

### 基本用法

```javascript
const element = new ContainerElement();

// 对象语法
element.setStyle({
    width: 200,
    height: 100,
    background: '#3498db',
    padding: 10,
    margin: 5,
});

// 字符串语法
element.setStyle("width: 200; height: 100; background: #3498db;");
```

### 支持的样式属性

#### 布局属性

```javascript
element.setStyle({
    // Flexbox 布局
    display: 'flex',              // 'flex' | 'none'
    flexDirection: 'row',         // 'row' | 'column' | 'row-reverse' | 'column-reverse'
    flexWrap: 'wrap',            // 'nowrap' | 'wrap' | 'wrap-reverse'
    flex: 1,                     // flex-grow
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 'auto',
    
    // 对齐
    justifyContent: 'center',     // 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly'
    alignItems: 'center',         // 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline'
    alignContent: 'center',
    alignSelf: 'center',
    
    // 尺寸
    width: 200,                   // 数字（像素）或 '50%'
    height: 100,
    minWidth: 100,
    minHeight: 50,
    maxWidth: 500,
    maxHeight: 300,
    
    // 间距
    padding: 10,                  // 所有方向
    paddingTop: 10,
    paddingRight: 10,
    paddingBottom: 10,
    paddingLeft: 10,
    
    margin: 5,                    // 所有方向
    marginTop: 5,
    marginRight: 5,
    marginBottom: 5,
    marginLeft: 5,
    
    gap: 10,                      // 子元素间距
});
```

#### 视觉属性

```javascript
element.setStyle({
    // 颜色
    background: '#3498db',        // 背景色
    color: '#ffffff',             // 文本颜色
    opacity: 0.8,                 // 透明度 0-1
    
    // 边框
    border: '2px #e74c3c',       // 宽度 颜色
    borderTop: '1px #333',
    borderRight: '1px #333',
    borderBottom: '1px #333',
    borderLeft: '1px #333',
    borderRadius: 5,              // 圆角
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    
    // 阴影
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
});
```

#### 文本属性

```javascript
label.setStyle({
    // 字体
    fontSize: 16,
    fontWeight: 'bold',           // 'normal' | 'bold' | 100-900
    fontStyle: 'italic',          // 'normal' | 'italic'
    fontFamily: 'Arial',
    
    // 文本布局
    textAlign: 'center',          // 'left' | 'center' | 'right' | 'justify'
    lineHeight: 1.5,
    letterSpacing: 1,
    
    // 文本装饰
    textDecoration: 'underline',  // 'none' | 'underline' | 'line-through'
    textTransform: 'uppercase',   // 'none' | 'uppercase' | 'lowercase' | 'capitalize'
});
```

#### 定位属性

```javascript
element.setStyle({
    position: 'absolute',         // 'relative' | 'absolute'
    top: 10,
    right: 10,
    bottom: 10,
    left: 10,
    zIndex: 100,
});
```

#### 变换属性

```javascript
element.setStyle({
    transform: 'rotate(45deg)',
    // 或组合多个变换
    transform: 'translate(10px, 20px) rotate(45deg) scale(1.5)',
});
```

#### 其他属性

```javascript
element.setStyle({
    overflow: 'auto',             // 'visible' | 'hidden' | 'scroll' | 'auto'
    cursor: 'pointer',            // 'default' | 'pointer' | 'text' | 'move' | 'not-allowed'
    visibility: 'visible',        // 'visible' | 'hidden'
});
```

## 样式表和 CSS 类

### 创建样式表

```javascript
const stylesheet = `
.button {
    background: #3498db;
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
}

.button:hover {
    background: #2980b9;
}

.button-large {
    padding: 15px 30px;
    font-size: 18px;
}

.card {
    background: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.text-center {
    text-align: center;
}

.mt-10 {
    margin-top: 10px;
}
`;

// 应用样式表
navigator.stylesheet.append(stylesheet);
```

### 使用 CSS 类

```javascript
// 单个类
const button = new ButtonElement();
button.setClass("button");

// 多个类
button.setClass("button button-large");

// 动态添加/移除类
button.addClass("active");
button.removeClass("active");
button.toggleClass("active");
```

### CSS 选择器

Deft 支持基本的 CSS 选择器：

```css
/* 类选择器 */
.button { }

/* 标签选择器 */
label { }
button { }

/* ID 选择器 */
#main-container { }

/* 属性选择器 */
[disabled] { }
[type="primary"] { }

/* 伪类选择器 */
.button:hover { }
.button:active { }
.input:focus { }

/* 组合选择器 */
.container .button { }
.button.primary { }
```

## 状态样式

### Hover 样式

```javascript
const button = new ButtonElement();
button.setStyle({
    background: '#3498db',
    padding: 10,
});

// 鼠标悬停时的样式
button.setHoverStyle({
    background: '#2980b9',
    transform: 'scale(1.05)',
});
```

### Active 样式

```javascript
button.setActiveStyle({
    background: '#21618c',
    transform: 'scale(0.95)',
});
```

### Focus 样式

```javascript
const input = new TextInputElement();
input.setStyle({
    border: '1px #ccc',
});

input.setFocusStyle({
    border: '2px #3498db',
    boxShadow: '0 0 5px rgba(52,152,219,0.5)',
});
```

## 主题系统

### 定义主题

```javascript
// 定义颜色主题
const lightTheme = {
    primary: '#3498db',
    secondary: '#2ecc71',
    danger: '#e74c3c',
    background: '#ffffff',
    surface: '#f5f5f5',
    text: '#333333',
    textSecondary: '#666666',
    border: '#dddddd',
};

const darkTheme = {
    primary: '#3498db',
    secondary: '#2ecc71',
    danger: '#e74c3c',
    background: '#1a1a1a',
    surface: '#2c2c2c',
    text: '#ffffff',
    textSecondary: '#aaaaaa',
    border: '#444444',
};

// 当前主题
let currentTheme = lightTheme;
```

### 应用主题

```javascript
function applyTheme(theme) {
    currentTheme = theme;
    
    // 创建主题样式表
    const themeStylesheet = `
        body {
            background: ${theme.background};
            color: ${theme.text};
        }
        
        .button-primary {
            background: ${theme.primary};
            color: white;
        }
        
        .card {
            background: ${theme.surface};
            border: 1px ${theme.border};
        }
        
        .text-secondary {
            color: ${theme.textSecondary};
        }
    `;
    
    // 移除旧样式，应用新样式
    navigator.stylesheet.clear();
    navigator.stylesheet.append(themeStylesheet);
}

// 切换主题
function toggleTheme() {
    if (currentTheme === lightTheme) {
        applyTheme(darkTheme);
    } else {
        applyTheme(lightTheme);
    }
}
```

### 主题切换示例

```javascript
// 创建主题切换按钮
const themeToggle = new ButtonElement();
const toggleLabel = new LabelElement();
toggleLabel.setText("🌙 Dark Mode");
themeToggle.addChild(toggleLabel);

themeToggle.bindClick(() => {
    toggleTheme();
    toggleLabel.setText(
        currentTheme === darkTheme ? "☀️ Light Mode" : "🌙 Dark Mode"
    );
});
```

## 响应式布局

### 基于容器大小的布局

```javascript
const container = new ContainerElement();

function updateLayout() {
    const bounds = container.getBounds();
    const width = bounds.width;
    
    if (width < 600) {
        // 移动布局
        container.setStyle({
            flexDirection: 'column',
            padding: 10,
        });
    } else if (width < 1024) {
        // 平板布局
        container.setStyle({
            flexDirection: 'row',
            flexWrap: 'wrap',
            padding: 20,
        });
    } else {
        // 桌面布局
        container.setStyle({
            flexDirection: 'row',
            padding: 30,
        });
    }
}

// 监听尺寸变化
window.bindResize(() => {
    updateLayout();
});

updateLayout();
```

### 百分比和相对单位

```javascript
element.setStyle({
    width: '50%',      // 父容器的50%
    height: '100%',    // 父容器的100%
    padding: '5%',     // 相对于宽度的5%
});
```

## 动画和过渡

### CSS 动画

```javascript
// 定义动画
const animationStylesheet = `
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(-20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.fade-in {
    animation-name: fadeIn;
    animation-duration: 0.3s;
    animation-timing-function: ease-out;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

.spinning {
    animation-name: spin;
    animation-duration: 1s;
    animation-iteration-count: infinite;
    animation-timing-function: linear;
}
`;

navigator.stylesheet.append(animationStylesheet);

// 使用动画
const element = new ContainerElement();
element.setClass("fade-in");
```

### 程序化动画

```javascript
// 创建动画
animation_create("slideIn", {
    "0": {
        transform: 'translateX(-100%)',
        opacity: 0,
    },
    "1": {
        transform: 'translateX(0)',
        opacity: 1,
    }
});

// 应用动画
element.setStyle({
    animationName: 'slideIn',
    animationDuration: 500,  // 毫秒
    animationTimingFunction: 'ease-out',
});
```

## 实用工具类

### 创建工具类库

```javascript
const utilityClasses = `
/* 间距工具类 */
.m-0 { margin: 0; }
.m-5 { margin: 5px; }
.m-10 { margin: 10px; }
.m-20 { margin: 20px; }

.mt-5 { margin-top: 5px; }
.mt-10 { margin-top: 10px; }
.mt-20 { margin-top: 20px; }

.p-0 { padding: 0; }
.p-5 { padding: 5px; }
.p-10 { padding: 10px; }
.p-20 { padding: 20px; }

/* 文本工具类 */
.text-left { text-align: left; }
.text-center { text-align: center; }
.text-right { text-align: right; }

.font-bold { font-weight: bold; }
.font-normal { font-weight: normal; }

.text-sm { font-size: 12px; }
.text-base { font-size: 16px; }
.text-lg { font-size: 20px; }
.text-xl { font-size: 24px; }

/* 布局工具类 */
.flex { display: flex; }
.flex-row { flex-direction: row; }
.flex-col { flex-direction: column; }

.justify-start { justify-content: flex-start; }
.justify-center { justify-content: center; }
.justify-end { justify-content: flex-end; }
.justify-between { justify-content: space-between; }

.items-start { align-items: flex-start; }
.items-center { align-items: center; }
.items-end { align-items: flex-end; }

/* 颜色工具类 */
.bg-primary { background: #3498db; }
.bg-success { background: #2ecc71; }
.bg-danger { background: #e74c3c; }
.bg-white { background: #ffffff; }
.bg-gray { background: #f5f5f5; }

.text-primary { color: #3498db; }
.text-success { color: #2ecc71; }
.text-danger { color: #e74c3c; }
.text-white { color: #ffffff; }
.text-gray { color: #666666; }

/* 边框工具类 */
.border { border: 1px #dddddd; }
.border-2 { border: 2px #dddddd; }
.rounded { border-radius: 4px; }
.rounded-lg { border-radius: 8px; }
.rounded-full { border-radius: 9999px; }

/* 显示工具类 */
.hidden { display: none; }
.visible { visibility: visible; }
.invisible { visibility: hidden; }
`;

navigator.stylesheet.append(utilityClasses);
```

### 使用工具类

```javascript
const card = new ContainerElement();
card.setClass("bg-white p-20 rounded-lg m-10");

const title = new LabelElement();
title.setText("Card Title");
title.setClass("text-xl font-bold text-center mb-10");

const content = new LabelElement();
content.setText("Card content");
content.setClass("text-base text-gray");
```

## 最佳实践

### 1. 使用 CSS 类而非内联样式

```javascript
// ❌ 不推荐
element.setStyle({
    background: '#3498db',
    padding: 10,
    borderRadius: 5,
});

// ✅ 推荐
element.setClass("button-primary");
```

### 2. 组织样式表

```javascript
// 将样式按功能分组
const baseStyles = `/* 基础样式 */`;
const componentStyles = `/* 组件样式 */`;
const utilityStyles = `/* 工具类 */`;

navigator.stylesheet.append(baseStyles);
navigator.stylesheet.append(componentStyles);
navigator.stylesheet.append(utilityStyles);
```

### 3. 使用 CSS 变量（通过主题）

```javascript
const theme = {
    spacing: {
        xs: 5,
        sm: 10,
        md: 20,
        lg: 30,
        xl: 40,
    },
    colors: { /* ... */ },
};
```

### 4. 保持样式一致性

```javascript
// 定义标准组件样式
const buttonStyles = {
    base: "button",
    primary: "button button-primary",
    secondary: "button button-secondary",
    danger: "button button-danger",
};
```

## 下一步

- 查看[动画效果](./animations.md)了解更多动画技巧
- 阅读[事件处理](./events.md)学习交互实现
- 探索[示例项目](../examples/)查看实际应用
