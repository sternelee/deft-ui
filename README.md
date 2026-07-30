# Introduction

Deft is a framework for building desktop and mobile applications with Rust and JavaScript.

[![crates.io](https://img.shields.io/crates/v/deft)](https://crates.io/crates/deft)


# Features

* Hybrid programming with Rust and JavaScript
* Non-webview core
* Unified JavaScript engine and rendering engine
* Themes support
* Support React/Vue/Solid or any framework that supports custom render

# Limits

* Not all CSS properties are supported, see [documentation](https://deft-ui.github.io/en/styles/properties/) for more details.
* Accessibility is not yet available.
* JavaScript debugger is not yet available.

# Component Gallery

[Live Demo(WASM)](https://deft-ui.github.io/gallery/)

<img width="360" src="https://github.com/deft-ui/deft/blob/main/snapshots/gallery.png?raw=true" />
<img width="360" src="https://github.com/deft-ui/deft/blob/main/snapshots/gallery-dark.png?raw=true" />


# Quick Start

```
npm create deft@latest hello-deft
cd hello-deft
npm install
npm run dev
```

# Documentation

📚 **Comprehensive Documentation Available!**

- [Getting Started](./docs/guides/quick-start.md) - Quick start guide for beginners
- [Development Setup](./docs/guides/development-setup.md) - Environment setup for all platforms
- [What is Deft](./docs/guides/what-is-deft.md) - Framework overview and architecture

## Platform Guides
- [Windows Development](./docs/platforms/windows.md)
- [Linux Development](./docs/platforms/linux.md)
- [Android Development](./docs/platforms/android.md)
- [More platforms...](./docs/platforms/)

## API Reference
- [UI Components](./docs/api/ui-components.md) - Complete component reference
- [Events](./docs/api/events.md) - Event system
- [Styling](./docs/api/styling.md) - Style system

## Code Examples
- [Basic Examples](./docs/examples/basic-examples.md) - Hello World, Counter, Todo List
- [Custom Components](./docs/examples/custom-components.md) - Creating reusable components
- [More examples...](./docs/examples/)

## Online Resources

[Official Documentation](https://deft-ui.github.io/en/guides/what-is-deft/)

[Live Demo (WASM)](https://deft-ui.github.io/gallery/)

[More Demos](https://deft-ui.github.io/en/demos/)

# Platforms

| Platform    | Versions      | Supported      |
|-------------|---------------|----------------|
| Windows     | 10+           | ✅              |
| Linux       | X11 & Wayland | ✅              |
| MacOS       | 10.12+        | ✅              |
| HarmonyOS   | 5+            | ✅experimental  |
| Android     | 6+            | ✅experimental  |
| iOS         | -             | ✅experimental  |
| WebAssembly | -             | ✅experimental  |

# Develop

### Prerequisites

Make sure `Rust`, `Node.js` and `Clang14+` installed.

Some extra packages need to be installed on Linux.

```
apt install build-essential libssl-dev libclang-dev libc++-dev \
    xorg-dev libxcb-xfixes0-dev libxcb-shape0-dev libdbus-1-dev \
    libasound2-dev libegl-dev libgles-dev librust-wayland-egl-dev
```

# Examples

### Run Built-in Examples

**Gallery Demo** (Native):
```bash
cd examples/gallery
cargo run
```

**Simple UI Components**:
```bash
cd examples/simple-ui-components
cargo run
```

**Hello World**:
```bash
cargo run --example hello
```

**Custom Elements**:
```bash
cargo run --example custom_element
```

**WebAssembly Demo**:
> Make sure that [Emscripten SDK](https://emscripten.org/docs/getting_started/downloads.html) is installed.
```bash
cd examples/gallery
cargo build --target wasm32-unknown-emscripten --release
python3 -m http.server
```
Visit `http://localhost:8000/web/` to preview.

# License

MIT