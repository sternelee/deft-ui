// Simple UI Components Example
// 这个示例展示了 Deft UI 中各种基础组件的使用

// 创建样式表
const stylesheet = `
.title {
    font-size: 28px;
    font-weight: bold;
    text-align: center;
    margin-bottom: 20px;
    color: #2c3e50;
}

.section-title {
    font-size: 18px;
    font-weight: bold;
    margin-top: 15px;
    margin-bottom: 10px;
    color: #34495e;
}

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

.button-danger {
    background: #e74c3c;
}

.button-danger:hover {
    background: #c0392b;
}

.button-success {
    background: #2ecc71;
}

.button-success:hover {
    background: #27ae60;
}

.input {
    padding: 8px;
    border: 1px #bdc3c7;
    border-radius: 4px;
    width: 300px;
}

.result-text {
    margin-top: 10px;
    color: #7f8c8d;
    font-style: italic;
}

.item {
    padding: 10px;
    margin: 5px 0;
    background: #ecf0f1;
    border-radius: 4px;
}

.item:hover {
    background: #d5dbdb;
}
`;

// 应用样式
navigator.stylesheet.append(stylesheet);

// 创建主窗口
const window = new Window({
    width: 600,
    height: 700,
});
window.setTitle("Deft UI - Simple Components Demo");

// 创建主滚动容器
const mainContainer = new ScrollElement();
mainContainer.setStyle({
    flex: 1,
    padding: 20,
    gap: 10,
    overflow: 'auto',
});

// 标题
const title = new LabelElement();
title.setText("🎨 Simple UI Components Demo");
title.setClass("title");
mainContainer.addChild(title);

// === 按钮部分 ===
const buttonSectionTitle = new LabelElement();
buttonSectionTitle.setText("Buttons");
buttonSectionTitle.setClass("section-title");
mainContainer.addChild(buttonSectionTitle);

const buttonContainer = new ContainerElement();
buttonContainer.setStyle({
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
});

// 主要按钮
const primaryButton = new ButtonElement();
const primaryLabel = new LabelElement();
primaryLabel.setText("Primary Button");
primaryButton.addChild(primaryLabel);
primaryButton.setClass("button");
primaryButton.bindClick(() => {
    console.log("Primary button clicked!");
    showMessage("Primary button clicked!");
});

// 成功按钮
const successButton = new ButtonElement();
const successLabel = new LabelElement();
successLabel.setText("Success");
successButton.addChild(successLabel);
successButton.setClass("button button-success");
successButton.bindClick(() => {
    console.log("Success button clicked!");
    showMessage("Success!");
});

// 危险按钮
const dangerButton = new ButtonElement();
const dangerLabel = new LabelElement();
dangerLabel.setText("Danger");
dangerButton.addChild(dangerLabel);
dangerButton.setClass("button button-danger");
dangerButton.bindClick(() => {
    console.log("Danger button clicked!");
    showMessage("Danger action!");
});

buttonContainer.addChild(primaryButton);
buttonContainer.addChild(successButton);
buttonContainer.addChild(dangerButton);
mainContainer.addChild(buttonContainer);

// === 文本输入部分 ===
const inputSectionTitle = new LabelElement();
inputSectionTitle.setText("Text Input");
inputSectionTitle.setClass("section-title");
mainContainer.addChild(inputSectionTitle);

const inputContainer = new ContainerElement();
inputContainer.setStyle({
    gap: 10,
});

const textInput = new TextInputElement();
textInput.setPlaceholder("Type something here...");
textInput.setClass("input");

const inputResultLabel = new LabelElement();
inputResultLabel.setText("Your input will appear here");
inputResultLabel.setClass("result-text");

textInput.bindTextChange((e) => {
    const value = e.detail.value;
    if (value) {
        inputResultLabel.setText(`You typed: ${value}`);
        inputResultLabel.setStyle({ color: '#2c3e50' });
    } else {
        inputResultLabel.setText("Your input will appear here");
        inputResultLabel.setStyle({ color: '#7f8c8d' });
    }
});

inputContainer.addChild(textInput);
inputContainer.addChild(inputResultLabel);
mainContainer.addChild(inputContainer);

// === 计数器部分 ===
const counterSectionTitle = new LabelElement();
counterSectionTitle.setText("Counter");
counterSectionTitle.setClass("section-title");
mainContainer.addChild(counterSectionTitle);

let counter = 0;
const counterContainer = new ContainerElement();
counterContainer.setStyle({
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
});

const counterLabel = new LabelElement();
counterLabel.setText(`Count: ${counter}`);
counterLabel.setStyle({
    fontSize: 24,
    fontWeight: 'bold',
    minWidth: 100,
});

const decrementBtn = new ButtonElement();
const decrementLbl = new LabelElement();
decrementLbl.setText("-");
decrementBtn.addChild(decrementLbl);
decrementBtn.setClass("button");
decrementBtn.bindClick(() => {
    counter--;
    counterLabel.setText(`Count: ${counter}`);
});

const incrementBtn = new ButtonElement();
const incrementLbl = new LabelElement();
incrementLbl.setText("+");
incrementBtn.addChild(incrementLbl);
incrementBtn.setClass("button");
incrementBtn.bindClick(() => {
    counter++;
    counterLabel.setText(`Count: ${counter}`);
});

const resetBtn = new ButtonElement();
const resetLbl = new LabelElement();
resetLbl.setText("Reset");
resetBtn.addChild(resetLbl);
resetBtn.setClass("button button-danger");
resetBtn.bindClick(() => {
    counter = 0;
    counterLabel.setText(`Count: ${counter}`);
});

counterContainer.addChild(decrementBtn);
counterContainer.addChild(counterLabel);
counterContainer.addChild(incrementBtn);
counterContainer.addChild(resetBtn);
mainContainer.addChild(counterContainer);

// === 列表部分 ===
const listSectionTitle = new LabelElement();
listSectionTitle.setText("Dynamic List");
listSectionTitle.setClass("section-title");
mainContainer.addChild(listSectionTitle);

const listContainer = new ContainerElement();
listContainer.setStyle({
    gap: 5,
});

const addItemInput = new TextInputElement();
addItemInput.setPlaceholder("Enter item name...");
addItemInput.setClass("input");

const addItemBtn = new ButtonElement();
const addItemLbl = new LabelElement();
addItemLbl.setText("Add Item");
addItemBtn.addChild(addItemLbl);
addItemBtn.setClass("button button-success");

const itemsList = new ContainerElement();
itemsList.setStyle({
    gap: 5,
    marginTop: 10,
});

let items = [];

function addItem(itemText) {
    if (!itemText || !itemText.trim()) {
        return;
    }
    
    items.push(itemText);
    renderItems();
    addItemInput.setText("");
}

function removeItem(index) {
    items.splice(index, 1);
    renderItems();
}

function renderItems() {
    // 清空列表
    while (itemsList.firstChild) {
        itemsList.removeChild(itemsList.firstChild);
    }
    
    // 渲染每个项目
    items.forEach((item, index) => {
        const itemContainer = new ContainerElement();
        itemContainer.setClass("item");
        itemContainer.setStyle({
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        });
        
        const itemLabel = new LabelElement();
        itemLabel.setText(`${index + 1}. ${item}`);
        
        const deleteBtn = new ButtonElement();
        const deleteLbl = new LabelElement();
        deleteLbl.setText("×");
        deleteLbl.setStyle({ fontSize: 20 });
        deleteBtn.addChild(deleteLbl);
        deleteBtn.setStyle({
            background: '#e74c3c',
            color: 'white',
            padding: '5px 10px',
            borderRadius: 3,
            cursor: 'pointer',
        });
        deleteBtn.bindClick(() => removeItem(index));
        
        itemContainer.addChild(itemLabel);
        itemContainer.addChild(deleteBtn);
        itemsList.addChild(itemContainer);
    });
    
    if (items.length === 0) {
        const emptyLabel = new LabelElement();
        emptyLabel.setText("No items yet. Add one above!");
        emptyLabel.setStyle({
            color: '#95a5a6',
            fontStyle: 'italic',
            textAlign: 'center',
            padding: 20,
        });
        itemsList.addChild(emptyLabel);
    }
}

addItemBtn.bindClick(() => {
    addItem(addItemInput.getText());
});

addItemInput.bindKeyDown((e) => {
    if (e.detail.key === 'Enter') {
        addItem(addItemInput.getText());
    }
});

const addItemContainer = new ContainerElement();
addItemContainer.setStyle({
    flexDirection: 'row',
    gap: 10,
});
addItemContainer.addChild(addItemInput);
addItemContainer.addChild(addItemBtn);

listContainer.addChild(addItemContainer);
listContainer.addChild(itemsList);
mainContainer.addChild(listContainer);

// 初始渲染
renderItems();

// === 消息显示 ===
const messageLabel = new LabelElement();
messageLabel.setStyle({
    marginTop: 20,
    padding: 10,
    background: '#3498db',
    color: 'white',
    borderRadius: 5,
    textAlign: 'center',
    display: 'none',
});
mainContainer.addChild(messageLabel);

function showMessage(text) {
    messageLabel.setText(text);
    messageLabel.setStyle({ display: 'flex' });
    
    setTimeout(() => {
        messageLabel.setStyle({ display: 'none' });
    }, 2000);
}

// 设置窗口主体
window.setBody(mainContainer);

console.log("Simple UI Components Demo loaded successfully!");
