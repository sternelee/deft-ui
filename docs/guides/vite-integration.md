# Vite 构建集成指南

本指南介绍如何将 Vite 构建工具集成到 Deft 项目中，实现快速的开发体验和优化的生产构建。

## 为什么使用 Vite

**优势**:
- ⚡ 极速的冷启动
- 🔥 即时的模块热更新 (HMR)
- 🛠️ 丰富的插件生态
- 📦 优化的生产构建
- 🔧 TypeScript 支持
- 🎨 CSS 预处理器支持

## 项目结构

```
my-deft-app/
├── Cargo.toml
├── src/
│   └── lib.rs          # Rust 入口
├── web/                # Web 资源
│   ├── index.html
│   ├── main.js         # JS 入口
│   ├── App.jsx         # 应用组件
│   ├── components/     # UI 组件
│   ├── styles/         # 样式文件
│   └── assets/         # 静态资源
├── vite.config.js      # Vite 配置
├── package.json
└── tsconfig.json       # TypeScript 配置（可选）
```

## 快速开始

### 1. 初始化项目

```bash
# 创建 Rust 项目
cargo new my-deft-app --lib
cd my-deft-app

# 初始化 npm 项目
npm init -y

# 安装 Vite 和相关依赖
npm install -D vite
npm install -D @vitejs/plugin-vue  # 如果使用 Vue
npm install -D @vitejs/plugin-react  # 如果使用 React
```

### 2. 配置 package.json

```json
{
  "name": "my-deft-app",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "build:rust": "cargo build --release",
    "build:all": "npm run build:rust && npm run build"
  },
  "devDependencies": {
    "vite": "^5.0.0"
  }
}
```

### 3. 创建 Vite 配置

`vite.config.js`:

```javascript
import { defineConfig } from 'vite';

export default defineConfig({
  root: 'web',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: 'web/index.html'
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
});
```

### 4. 创建 HTML 入口

`web/index.html`:

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Deft App</title>
</head>
<body>
    <div id="app"></div>
    <script type="module" src="/main.js"></script>
</body>
</html>
```

### 5. 创建 JavaScript 入口

`web/main.js`:

```javascript
import './styles/main.css';
import { createApp } from './App.js';

// 初始化应用
createApp();
```

## 与 React 集成

### 安装依赖

```bash
npm install react react-dom
npm install -D @vitejs/plugin-react
```

### 配置 Vite

`vite.config.js`:

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: 'web',
  plugins: [react()],
  build: {
    outDir: '../dist',
    emptyOutDir: true
  }
});
```

### React 组件示例

`web/App.jsx`:

```jsx
import React, { useState } from 'react';
import './App.css';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="app">
      <h1>Deft UI with React</h1>
      <div className="card">
        <button onClick={() => setCount(count + 1)}>
          Count: {count}
        </button>
      </div>
    </div>
  );
}

export default App;
```

`web/main.jsx`:

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/main.css';

// 创建 Deft 窗口
const window = new Window({
  width: 800,
  height: 600,
  title: "React + Deft"
});

// 创建容器
const container = new ContainerElement();
container.setAttribute('id', 'root');
window.setBody(container);

// 渲染 React 应用到 Deft 元素
// 注意：这需要自定义 React Renderer
ReactDOM.createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

## 与 Vue 集成

### 安装依赖

```bash
npm install vue
npm install -D @vitejs/plugin-vue
```

### 配置 Vite

`vite.config.js`:

```javascript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  root: 'web',
  plugins: [vue()],
  build: {
    outDir: '../dist',
    emptyOutDir: true
  }
});
```

### Vue 组件示例

`web/App.vue`:

```vue
<template>
  <div class="app">
    <h1>Deft UI with Vue</h1>
    <div class="card">
      <button @click="count++">Count: {{ count }}</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const count = ref(0);
</script>

<style scoped>
.app {
  text-align: center;
  padding: 20px;
}

.card {
  margin-top: 20px;
}

button {
  padding: 10px 20px;
  font-size: 16px;
}
</style>
```

`web/main.js`:

```javascript
import { createApp } from 'vue';
import App from './App.vue';
import './styles/main.css';

// 创建 Vue 应用并挂载到 Deft
const app = createApp(App);
app.mount('#app');
```

## TypeScript 支持

### 安装 TypeScript

```bash
npm install -D typescript @types/node
```

### TypeScript 配置

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["web"]
}
```

### Deft API 类型定义

`web/types/deft.d.ts`:

```typescript
// Deft UI 类型定义
declare class Window {
  constructor(attrs?: WindowAttrs);
  setTitle(title: string): void;
  setBody(element: Element): void;
  setVisible(visible: boolean): void;
  getSize(): { width: number; height: number };
  // ... 其他方法
}

declare class Element {
  constructor(tag?: string);
  addChild(child: Element): void;
  removeChild(child: Element): void;
  setStyle(style: StyleObject | string): void;
  setText(text: string): void;
  bindClick(handler: (e: MouseEvent) => void): void;
  // ... 其他方法
}

declare class ContainerElement extends Element {
  constructor();
}

declare class LabelElement extends Element {
  constructor();
}

declare class ButtonElement extends Element {
  constructor();
}

declare class TextInputElement extends Element {
  constructor();
  setPlaceholder(text: string): void;
  getText(): string;
  // ... 其他方法
}

interface WindowAttrs {
  width?: number;
  height?: number;
  title?: string;
  resizable?: boolean;
  decorations?: boolean;
  // ... 其他属性
}

interface StyleObject {
  width?: number | string;
  height?: number | string;
  background?: string;
  color?: string;
  padding?: number | string;
  margin?: number | string;
  // ... 其他样式属性
}

interface MouseEvent {
  detail: {
    button: number;
    offsetX: number;
    offsetY: number;
    // ... 其他属性
  };
}
```

### TypeScript 代码示例

`web/main.ts`:

```typescript
import './styles/main.css';

// 创建窗口
const window: Window = new Window({
  width: 800,
  height: 600,
  title: "TypeScript + Deft",
  resizable: true
});

// 创建 UI
const container = new ContainerElement();
container.setStyle({
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  gap: 20
});

const title = new LabelElement();
title.setText("Hello from TypeScript!");
title.setStyle({
  fontSize: 24,
  fontWeight: 'bold'
});

const button = new ButtonElement();
const buttonLabel = new LabelElement();
buttonLabel.setText("Click Me");
button.addChild(buttonLabel);
button.bindClick((e: MouseEvent) => {
  console.log("Button clicked at:", e.detail.offsetX, e.detail.offsetY);
});

container.addChild(title);
container.addChild(button);

window.setBody(container);
```

## CSS 预处理器

### Sass/SCSS

```bash
npm install -D sass
```

`web/styles/main.scss`:

```scss
$primary-color: #007bff;
$font-stack: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

.app {
  font-family: $font-stack;
  
  .button {
    background: $primary-color;
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    
    &:hover {
      background: darken($primary-color, 10%);
    }
  }
}
```

### Less

```bash
npm install -D less
```

`web/styles/main.less`:

```less
@primary-color: #007bff;

.app {
  .button {
    background: @primary-color;
    
    &:hover {
      background: darken(@primary-color, 10%);
    }
  }
}
```

## 环境变量

### 定义环境变量

`.env`:

```
VITE_APP_TITLE=My Deft App
VITE_API_URL=https://api.example.com
```

`.env.development`:

```
VITE_APP_TITLE=My Deft App (Dev)
VITE_API_URL=http://localhost:3001
```

`.env.production`:

```
VITE_APP_TITLE=My Deft App
VITE_API_URL=https://api.example.com
```

### 使用环境变量

```javascript
// 在代码中使用
console.log(import.meta.env.VITE_APP_TITLE);
console.log(import.meta.env.VITE_API_URL);

// TypeScript 类型
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

## 优化配置

### 代码分割

```javascript
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'ui-components': ['./web/components/Button', './web/components/Input']
        }
      }
    }
  }
});
```

### 资源优化

```javascript
export default defineConfig({
  build: {
    // 压缩选项
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,  // 移除 console
        drop_debugger: true
      }
    },
    
    // 资源内联限制
    assetsInlineLimit: 4096,
    
    // Chunk 大小警告限制
    chunkSizeWarningLimit: 500
  }
});
```

### 图片优化

```bash
npm install -D vite-plugin-imagemin
```

```javascript
import viteImagemin from 'vite-plugin-imagemin';

export default defineConfig({
  plugins: [
    viteImagemin({
      gifsicle: {
        optimizationLevel: 7
      },
      optipng: {
        optimizationLevel: 7
      },
      mozjpeg: {
        quality: 80
      },
      pngquant: {
        quality: [0.8, 0.9],
        speed: 4
      },
      svgo: {
        plugins: [
          { name: 'removeViewBox' },
          { name: 'removeEmptyAttrs', active: false }
        ]
      }
    })
  ]
});
```

## 热模块替换 (HMR)

### 配置 HMR

```javascript
// web/main.js
if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    // 处理模块更新
    console.log('Module updated:', newModule);
  });
}
```

### React Fast Refresh

使用 `@vitejs/plugin-react` 自动启用 Fast Refresh。

### Vue HMR

使用 `@vitejs/plugin-vue` 自动支持 HMR。

## 路径别名

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './web'),
      '@components': path.resolve(__dirname, './web/components'),
      '@styles': path.resolve(__dirname, './web/styles'),
      '@assets': path.resolve(__dirname, './web/assets')
    }
  }
});
```

使用别名：

```javascript
import Button from '@components/Button';
import '@styles/main.css';
import logo from '@assets/logo.png';
```

## 集成 Deft 构建流程

### 完整构建脚本

`package.json`:

```json
{
  "scripts": {
    "dev": "concurrently \"cargo build\" \"vite\"",
    "build": "npm run build:rust && npm run build:web",
    "build:rust": "cargo build --release",
    "build:web": "vite build",
    "preview": "vite preview",
    "clean": "rm -rf dist target"
  },
  "devDependencies": {
    "concurrently": "^8.0.0",
    "vite": "^5.0.0"
  }
}
```

### 自动化工作流

`build.sh`:

```bash
#!/bin/bash

echo "Building Rust library..."
cargo build --release

echo "Building web assets..."
npm run build:web

echo "Copying files..."
mkdir -p dist/app
cp target/release/libmy_deft_app.* dist/app/
cp -r dist/web/* dist/app/

echo "Build complete!"
```

## 多平台构建

### 桌面平台

```bash
# Windows
npm run build:rust
npm run build:web
# 打包为 .exe

# macOS
npm run build:rust
npm run build:web
# 打包为 .app

# Linux
npm run build:rust
npm run build:web
# 打包为 AppImage/DEB
```

### WebAssembly

```bash
# 安装 wasm-pack
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh

# 构建 WASM
wasm-pack build --target web --out-dir web/wasm

# 构建 Web 资源
npm run build:web
```

`vite.config.js` for WASM:

```javascript
export default defineConfig({
  build: {
    target: 'esnext'
  },
  optimizeDeps: {
    exclude: ['web/wasm']
  }
});
```

## 调试配置

### Source Maps

```javascript
export default defineConfig({
  build: {
    sourcemap: true  // 生产环境也启用 source maps（可选）
  }
});
```

### 开发服务器代理

```javascript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
});
```

## 性能监控

### Bundle 分析

```bash
npm install -D rollup-plugin-visualizer
```

```javascript
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true
    })
  ]
});
```

## 最佳实践

1. **代码分割**: 使用动态导入实现按需加载
2. **资源优化**: 压缩图片和其他资源
3. **缓存策略**: 利用浏览器缓存
4. **Tree Shaking**: 确保使用 ES 模块以支持 tree shaking
5. **懒加载**: 非关键资源懒加载
6. **预加载**: 使用 `<link rel="preload">` 预加载关键资源

## 示例项目

完整的 Vite + Deft 项目模板：

```bash
git clone https://github.com/deft-ui/deft-vite-template
cd deft-vite-template
npm install
npm run dev
```

## 相关资源

- [Vite 官方文档](https://vitejs.dev/)
- [Deft 官方文档](https://deft-ui.github.io/)
- [快速开始指南](../guides/quick-start.md)
- [构建和打包](./build-and-package.md)
