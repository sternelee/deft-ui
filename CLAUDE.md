# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Deft is a cross-platform UI framework for building desktop and mobile applications using Rust and JavaScript. It provides a hybrid programming model with a non-webview core, unified JavaScript engine and rendering engine, and supports React/Vue/Solid or any framework that supports custom renderers.

## Architecture

### Core Components

- **Rust Core (`src/`)**: The main UI framework implementation
  - `app.rs`: Application bootstrap and event loop management
  - `window.rs`: Window management and rendering coordination (67KB - major component)
  - `element.rs`: UI element tree and DOM-like structure (48KB)
  - `paint.rs`: Painting and rendering logic (36KB)
  - `style.rs`: CSS styling system (36KB)
  - `event.rs`: Event handling and dispatch system (17KB)
  - `animation.rs`: Animation system support

- **JavaScript Integration (`src/js/`)**: JavaScript engine bindings and JS APIs
- **Rendering System**: Uses Skia for graphics rendering via `skia-window` wrapper
- **Layout Engine**: Uses Yoga (Flexbox layout) via `deft-yoga`
- **JavaScript Engine**: Uses QuickJS via `deft-quick-js`

### Platform Support

- Desktop: Windows 10+, Linux (X11 & Wayland), macOS 10.12+
- Mobile: Android 6+, iOS (experimental), HarmonyOS 5+
- Web: WebAssembly (experimental)

## Development Commands

### Building

```bash
# Build the main library
cargo build

# Build with specific features (Linux)
cargo build --features x11,wayland

# Build for Android
cargo ndk -t arm64-v8a -p 30 build --features x11

# Build for WebAssembly (requires Emscripten SDK)
cd examples/gallery
cargo build --target wasm32-unknown-emscripten --release
```

### Testing

```bash
# Run tests
cargo test

# Run tests with specific features
cargo test --features x11,wayland

# Build and test (from build.sh)
./build.sh
```

### Running Examples

```bash
# Gallery demo (native)
cd examples/gallery
cargo run

# Gallery demo (WASM)
cd examples/gallery
cargo build --target wasm32-unknown-emscripten --release
python3 -m http.server
# Visit http://localhost:8000/web/
```

### Type Definitions

```bash
# Build TypeScript definitions
./build-dts.sh
```

## Project Structure

- `src/`: Core Rust implementation
- `examples/`: Example applications
  - `gallery/`: Component gallery demo
  - `hello.js`: Minimal "Hello World" example
- `js/`: JavaScript bindings and TypeScript definitions
- `packages/`: Supporting packages
  - `deft-macros/`: Procedural macros
  - `deft-tray/`: System tray support
  - `deft-ohos-logger/`: HarmonyOS logging
- `skia-window/`: Skia rendering window wrapper
- `fonts/`: Font resources
- `tests/`: Test files

## Key Features

- **Hybrid Programming**: Rust for performance-critical code, JavaScript for UI logic
- **CSS Styling**: Subset of CSS properties supported (see documentation)
- **Component Framework**: Supports custom renderers for React/Vue/Solid
- **Cross-Platform**: Single codebase for desktop and mobile
- **Theme Support**: Built-in dark/light theme support
- **Performance**: Native rendering with Skia, optimized paint system

## Development Notes

### Linux Dependencies
When developing on Linux, install these packages:
```bash
apt install build-essential libssl-dev libclang-dev libc++-dev \
    xorg-dev libxcb-xfixes0-dev libxcb-shape0-dev libdbus-1-dev \
    libasound2-dev libegl-dev libgles-dev librust-wayland-egl-dev
```

### Platform-Specific Features
- Use `DEFT_FORCE_WAYLAND` environment variable to force Wayland on Linux
- Android uses JNI bindings and native activity
- HarmonyOS has specialized bindings and logger integration

### Feature Flags
- `default`: Enables websocket, http, tray, clipboard
- `sqlite`: SQLite database support
- `audio`: Audio playback via rodio
- `gl`: OpenGL support
- `dialog`: Native dialog boxes

## Current Limitations

- Not all CSS properties are supported
- Accessibility features are not yet implemented
- JavaScript debugger is not available
- Mobile platforms are marked as experimental

## Testing Strategy

The project uses standard Rust testing with cargo test. Tests can be run with different feature combinations to ensure platform compatibility.