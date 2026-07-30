# 基础示例

本章节提供 Deft UI 框架的基础使用示例。

## Hello World

最简单的 Deft 应用：

### Rust 代码

```rust
// src/main.rs
use deft::app::{App, IApp};
use deft::bootstrap;
use deft::loader::StaticModuleLoader;
use quick_js::loader::JsModuleLoader;

struct HelloApp {}

impl IApp for HelloApp {
    fn create_module_loader(&mut self) -> Box<dyn JsModuleLoader + Send + Sync + 'static> {
        let mut ml = StaticModuleLoader::new();
        ml.add_module("index.js".to_string(), include_str!("index.js").to_string());
        Box::new(ml)
    }
}

fn main() {
    let app = App::new(HelloApp {});
    bootstrap(app);
}
```

### JavaScript 代码

```javascript
// src/index.js
const window = new Window();
window.setTitle("Hello Deft");

const label = new LabelElement();
label.setText("Hello, World!");

window.setBody(label);
```

## 简单的计数器

一个带有按钮和状态的计数器应用：

```javascript
// 创建窗口
const window = new Window({
    width: 300,
    height: 200,
});
window.setTitle("Counter App");

// 状态
let count = 0;

// 创建容器
const container = new ContainerElement();
container.setStyle({
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    flex: 1,
});

// 显示计数的标签
const counterLabel = new LabelElement();
counterLabel.setText(`Count: ${count}`);
counterLabel.setStyle({
    fontSize: 32,
    fontWeight: 'bold',
});

// 更新计数函数
function updateCounter() {
    counterLabel.setText(`Count: ${count}`);
}

// 创建按钮容器
const buttonContainer = new ContainerElement();
buttonContainer.setStyle({
    flexDirection: 'row',
    gap: 10,
});

// 减少按钮
const decrementBtn = new ButtonElement();
const decrementLabel = new LabelElement();
decrementLabel.setText("-");
decrementBtn.addChild(decrementLabel);
decrementBtn.setStyle({
    padding: 10,
    minWidth: 50,
});
decrementBtn.bindClick(() => {
    count--;
    updateCounter();
});

// 增加按钮
const incrementBtn = new ButtonElement();
const incrementLabel = new LabelElement();
incrementLabel.setText("+");
incrementBtn.addChild(incrementLabel);
incrementBtn.setStyle({
    padding: 10,
    minWidth: 50,
});
incrementBtn.bindClick(() => {
    count++;
    updateCounter();
});

// 重置按钮
const resetBtn = new ButtonElement();
const resetLabel = new LabelElement();
resetLabel.setText("Reset");
resetBtn.addChild(resetLabel);
resetBtn.setStyle({
    padding: 10,
});
resetBtn.bindClick(() => {
    count = 0;
    updateCounter();
});

// 组装界面
buttonContainer.addChild(decrementBtn);
buttonContainer.addChild(incrementBtn);
buttonContainer.addChild(resetBtn);

container.addChild(counterLabel);
container.addChild(buttonContainer);

window.setBody(container);
```

## 待办事项列表

一个简单的待办事项管理应用：

```javascript
// 创建窗口
const window = new Window({
    width: 400,
    height: 600,
});
window.setTitle("Todo List");

// 数据状态
let todos = [];
let nextId = 1;

// 主容器
const mainContainer = new ContainerElement();
mainContainer.setStyle({
    flex: 1,
    padding: 20,
    gap: 15,
});

// 标题
const title = new LabelElement();
title.setText("My Todo List");
title.setStyle({
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
});

// 输入区域
const inputContainer = new ContainerElement();
inputContainer.setStyle({
    flexDirection: 'row',
    gap: 10,
});

const todoInput = new TextInputElement();
todoInput.setPlaceholder("Enter a new todo...");
todoInput.setStyle({
    flex: 1,
    padding: 8,
});

const addButton = new ButtonElement();
const addLabel = new LabelElement();
addLabel.setText("Add");
addButton.addChild(addLabel);
addButton.setStyle({
    padding: 8,
    minWidth: 60,
});

// 待办列表容器
const todoListContainer = new ScrollElement();
todoListContainer.setStyle({
    flex: 1,
    gap: 8,
});

// 添加待办事项
function addTodo() {
    const text = todoInput.getText();
    if (text.trim()) {
        todos.push({
            id: nextId++,
            text: text,
            completed: false,
        });
        todoInput.setText("");
        renderTodos();
    }
}

// 删除待办事项
function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    renderTodos();
}

// 切换完成状态
function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        renderTodos();
    }
}

// 渲染待办列表
function renderTodos() {
    // 清空容器
    while (todoListContainer.firstChild) {
        todoListContainer.removeChild(todoListContainer.firstChild);
    }
    
    // 渲染每个待办事项
    todos.forEach(todo => {
        const todoItem = new ContainerElement();
        todoItem.setStyle({
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            padding: 10,
            background: '#f5f5f5',
            borderRadius: 5,
        });
        
        // 复选框（使用按钮模拟）
        const checkbox = new ButtonElement();
        const checkLabel = new LabelElement();
        checkLabel.setText(todo.completed ? "☑" : "☐");
        checkbox.addChild(checkLabel);
        checkbox.setStyle({
            padding: 5,
            minWidth: 30,
        });
        checkbox.bindClick(() => toggleTodo(todo.id));
        
        // 待办文本
        const todoText = new LabelElement();
        todoText.setText(todo.text);
        todoText.setStyle({
            flex: 1,
            textDecoration: todo.completed ? 'line-through' : 'none',
            color: todo.completed ? '#888' : '#000',
        });
        
        // 删除按钮
        const deleteBtn = new ButtonElement();
        const deleteLabel = new LabelElement();
        deleteLabel.setText("×");
        deleteBtn.addChild(deleteLabel);
        deleteBtn.setStyle({
            padding: 5,
            minWidth: 30,
            background: '#ff4444',
            color: 'white',
        });
        deleteBtn.bindClick(() => deleteTodo(todo.id));
        
        todoItem.addChild(checkbox);
        todoItem.addChild(todoText);
        todoItem.addChild(deleteBtn);
        
        todoListContainer.addChild(todoItem);
    });
    
    // 如果没有待办事项，显示提示
    if (todos.length === 0) {
        const emptyLabel = new LabelElement();
        emptyLabel.setText("No todos yet. Add one above!");
        emptyLabel.setStyle({
            textAlign: 'center',
            color: '#888',
            marginTop: 20,
        });
        todoListContainer.addChild(emptyLabel);
    }
}

// 绑定事件
addButton.bindClick(addTodo);
todoInput.bindKeyDown((e) => {
    if (e.detail.key === 'Enter') {
        addTodo();
    }
});

// 组装界面
inputContainer.addChild(todoInput);
inputContainer.addChild(addButton);

mainContainer.addChild(title);
mainContainer.addChild(inputContainer);
mainContainer.addChild(todoListContainer);

window.setBody(mainContainer);

// 初始渲染
renderTodos();
```

## 表单示例

展示各种表单元素的使用：

```javascript
const window = new Window({
    width: 500,
    height: 700,
});
window.setTitle("Form Example");

// 样式表
const stylesheet = `
.form-row {
    flex-direction: row;
    align-items: center;
    gap: 10px;
    padding: 10px 0;
}
.form-label {
    min-width: 120px;
    font-weight: bold;
}
.form-input {
    flex: 1;
    padding: 8px;
}
.submit-button {
    background: #007bff;
    color: white;
    padding: 12px 24px;
    border-radius: 5px;
}
.submit-button:hover {
    background: #0056b3;
}
`;
navigator.stylesheet.append(stylesheet);

const container = new ScrollElement();
container.setStyle({
    padding: 20,
    gap: 10,
});

// 标题
const title = new LabelElement();
title.setText("User Registration Form");
title.setStyle({
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
});

// 姓名输入
const nameRow = new ContainerElement();
nameRow.setClass("form-row");

const nameLabel = new LabelElement();
nameLabel.setText("Name:");
nameLabel.setClass("form-label");

const nameInput = new TextInputElement();
nameInput.setPlaceholder("Enter your name");
nameInput.setClass("form-input");

nameRow.addChild(nameLabel);
nameRow.addChild(nameInput);

// 邮箱输入
const emailRow = new ContainerElement();
emailRow.setClass("form-row");

const emailLabel = new LabelElement();
emailLabel.setText("Email:");
emailLabel.setClass("form-label");

const emailInput = new TextInputElement();
emailInput.setPlaceholder("your@email.com");
emailInput.setClass("form-input");

emailRow.addChild(emailLabel);
emailRow.addChild(emailInput);

// 密码输入
const passwordRow = new ContainerElement();
passwordRow.setClass("form-row");

const passwordLabel = new LabelElement();
passwordLabel.setText("Password:");
passwordLabel.setClass("form-label");

const passwordInput = new TextInputElement();
passwordInput.setType("password");
passwordInput.setPlaceholder("Enter password");
passwordInput.setClass("form-input");

passwordRow.addChild(passwordLabel);
passwordRow.addChild(passwordInput);

// 多行文本
const bioRow = new ContainerElement();
bioRow.setClass("form-row");

const bioLabel = new LabelElement();
bioLabel.setText("Bio:");
bioLabel.setClass("form-label");

const bioInput = new TextEditElement();
bioInput.setText("Tell us about yourself...");
bioInput.setStyle({
    flex: 1,
    height: 100,
    padding: 8,
});

bioRow.addChild(bioLabel);
bioRow.addChild(bioInput);

// 提交按钮
const submitButton = new ButtonElement();
const submitLabel = new LabelElement();
submitLabel.setText("Submit");
submitButton.addChild(submitLabel);
submitButton.setClass("submit-button");

submitButton.bindClick(() => {
    const formData = {
        name: nameInput.getText(),
        email: emailInput.getText(),
        password: passwordInput.getText(),
        bio: bioInput.getText(),
    };
    
    console.log("Form submitted:", formData);
    
    // 显示提交结果
    const resultLabel = new LabelElement();
    resultLabel.setText("Form submitted successfully!");
    resultLabel.setStyle({
        color: 'green',
        fontWeight: 'bold',
        marginTop: 10,
    });
    container.addChild(resultLabel);
});

// 组装表单
container.addChild(title);
container.addChild(nameRow);
container.addChild(emailRow);
container.addChild(passwordRow);
container.addChild(bioRow);
container.addChild(submitButton);

window.setBody(container);
```

## 图片展示

显示和交互图片：

```javascript
const window = new Window({
    width: 600,
    height: 500,
});
window.setTitle("Image Viewer");

const container = new ContainerElement();
container.setStyle({
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    padding: 20,
});

// 图片元素
const imageElement = new ImageElement();
imageElement.setSource("assets/sample.png");
imageElement.setStyle({
    maxWidth: 500,
    maxHeight: 400,
    borderRadius: 10,
});

// 按钮容器
const buttonRow = new ContainerElement();
buttonRow.setStyle({
    flexDirection: 'row',
    gap: 10,
});

// 加载本地图片按钮
const loadButton = new ButtonElement();
const loadLabel = new LabelElement();
loadLabel.setText("Load Image");
loadButton.addChild(loadLabel);
loadButton.bindClick(async () => {
    // 打开文件选择对话框
    if (typeof FileDialog !== 'undefined') {
        const dialog = new FileDialog();
        dialog.setFilters([
            { name: "Images", extensions: ["png", "jpg", "jpeg", "gif"] }
        ]);
        const path = await dialog.openFile();
        if (path) {
            imageElement.setSource(`file://${path}`);
        }
    }
});

// 加载网络图片按钮
const loadUrlButton = new ButtonElement();
const urlLabel = new LabelElement();
urlLabel.setText("Load from URL");
loadUrlButton.addChild(urlLabel);
loadUrlButton.bindClick(() => {
    // 这里可以添加输入URL的对话框
    const url = "https://example.com/image.png";
    imageElement.setSource(url);
});

buttonRow.addChild(loadButton);
buttonRow.addChild(loadUrlButton);

container.addChild(imageElement);
container.addChild(buttonRow);

window.setBody(container);
```

## 定时器示例

使用定时器创建动态效果：

```javascript
const window = new Window({
    width: 400,
    height: 300,
});
window.setTitle("Timer Example");

const container = new ContainerElement();
container.setStyle({
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    flex: 1,
});

// 时钟显示
const clockLabel = new LabelElement();
clockLabel.setStyle({
    fontSize: 48,
    fontWeight: 'bold',
});

// 更新时钟
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    clockLabel.setText(`${hours}:${minutes}:${seconds}`);
}

// 每秒更新
updateClock();
setInterval(updateClock, 1000);

// 倒计时器
let countdown = 10;
const countdownLabel = new LabelElement();
countdownLabel.setText(`Countdown: ${countdown}`);
countdownLabel.setStyle({
    fontSize: 24,
});

const startButton = new ButtonElement();
const startLabel = new LabelElement();
startLabel.setText("Start Countdown");
startButton.addChild(startLabel);

let countdownInterval = null;

startButton.bindClick(() => {
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    
    countdown = 10;
    countdownLabel.setText(`Countdown: ${countdown}`);
    
    countdownInterval = setInterval(() => {
        countdown--;
        countdownLabel.setText(`Countdown: ${countdown}`);
        
        if (countdown <= 0) {
            clearInterval(countdownInterval);
            countdownLabel.setText("Time's up!");
        }
    }, 1000);
});

container.addChild(clockLabel);
container.addChild(countdownLabel);
container.addChild(startButton);

window.setBody(container);
```

## 下一步

- 查看 [UI 组件示例](./ui-components.md) 了解更多组件用法
- 阅读 [事件处理示例](./event-handling.md) 学习事件系统
- 探索 [自定义组件](./custom-components.md) 创建自己的组件
