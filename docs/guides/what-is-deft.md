# 什么是 Deft

Deft 是一个跨平台的 UI 框架，用于使用 Rust 和 JavaScript 构建桌面和移动应用程序。

## 核心特性

### 🚀 混合编程
- **Rust 核心**：高性能、内存安全的底层实现
- **JavaScript UI**：灵活的界面开发体验
- **无缝集成**：Rust 和 JavaScript 之间的高效通信

### 🎨 非 Webview 架构
- **原生渲染**：使用 Skia 图形引擎进行高性能渲染
- **统一引擎**：JavaScript 引擎和渲染引擎的完美结合
- **轻量级**：无需嵌入完整的浏览器引擎

### 🎯 跨平台支持
支持多个主流平台：

| 平台 | 版本 | 支持状态 |
|------|------|----------|
| Windows | 10+ | ✅ 完全支持 |
| Linux | X11 & Wayland | ✅ 完全支持 |
| macOS | 10.12+ | ✅ 完全支持 |
| HarmonyOS | 5+ | ✅ 实验性支持 |
| Android | 6+ | ✅ 实验性支持 |
| iOS | - | ✅ 实验性支持 |
| WebAssembly | - | ✅ 实验性支持 |

### 🎭 主题支持
- 内置主题系统
- 支持明暗主题切换
- 自定义主题样式

### ⚛️ 框架无关
- 支持 React
- 支持 Vue
- 支持 Solid
- 支持任何支持自定义渲染的框架

## 技术架构

### 渲染层
```
JavaScript UI Layer
       ↓
QuickJS Engine
       ↓
Rust Core (Yoga Layout)
       ↓
Skia Rendering Engine
       ↓
Native Platform (Winit)
```

### 核心组件

1. **JavaScript 引擎**: 使用 QuickJS 提供高效的 JavaScript 运行时
2. **布局引擎**: 基于 Yoga 的 Flexbox 布局系统
3. **渲染引擎**: Skia 提供跨平台的 2D 图形渲染
4. **窗口系统**: Winit 提供跨平台的窗口管理

## 适用场景

Deft 适合以下应用场景：

- ✅ 桌面工具和实用程序
- ✅ 跨平台业务应用
- ✅ 移动应用开发
- ✅ 需要高性能 UI 的应用
- ✅ 需要细粒度控制的自定义 UI

## 限制

需要注意以下限制：

- ⚠️ 不是所有 CSS 属性都受支持（查看[文档](https://deft-ui.github.io/en/styles/properties/)了解详情）
- ⚠️ 可访问性功能尚未可用
- ⚠️ JavaScript 调试器尚未可用

## 与其他框架对比

### vs Electron
- ✅ 更小的应用体积
- ✅ 更低的内存占用
- ✅ 更快的启动速度
- ⚠️ 较小的生态系统

### vs Tauri
- ✅ 非 Webview 架构
- ✅ 更好的性能一致性
- ⚠️ 不支持完整的 Web 标准

### vs Native Development
- ✅ 跨平台开发效率
- ✅ JavaScript 的灵活性
- ⚠️ 某些场景下的性能开销

## 下一步

- [快速开始指南](./quick-start.md)
- [开发环境设置](./development-setup.md)
- [基础示例](../examples/basic-examples.md)
