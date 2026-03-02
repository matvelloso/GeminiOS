# GeminiOS

> **Prototype / Experimental** — This project is a proof of concept and is not supported. Use at your own risk.

GeminiOS is an Electron shell that embeds [Google AI Studio](https://aistudio.google.com/) and provides a bridge that allows applications generated within AI Studio to communicate with your local operating system.

## What This Does

GeminiOS wraps Google AI Studio in a desktop application. When AI Studio generates and runs an app inside its preview iframe, that app gains access to a `window.geminiOS` JavaScript API that can read/write files, execute commands, access the clipboard, and more — all on your local machine.

Simple example here: youtube.com/watch?v=SrOCR46jxmM&feature=youtu.be

### ⚠️ Security Warning

**This effectively gives a website access to your local operating system.** While every operation requires explicit user approval through a permission dialog, you should:

- **Carefully read each permission request** before clicking "Allow"
- **Deny any operation** you don't recognize or didn't expect
- **Never run this against sensitive directories** or systems
- **Treat this as you would any application with full OS access** — because that's what it is once you click "Allow"

This is a prototype for exploring what's possible when AI-generated applications can interact with the OS. It is not hardened for production use.

## How It Works

```
Google AI Studio (in Electron WebContentsView)
  └─ Generated app runs in a sandboxed iframe
       └─ window.geminiOS API (injected automatically)
            └─ Private MessageChannel → parent frame bridge
                 └─ Electron IPC → main process
                      └─ Permission dialog (user must approve)
                           └─ OS operation executes
```

1. AI Studio loads inside an Electron window
2. When AI Studio generates and previews an app, the app runs in an iframe
3. GeminiOS automatically injects the `window.geminiOS` API into that iframe via a secure MessageChannel bridge
4. When the app calls any API method (e.g., `window.geminiOS.fs.readFile(...)`), a native permission dialog appears
5. The user must click **Allow** for the operation to proceed — clicking **Deny** rejects the Promise
6. If approved, the Electron main process executes the operation and returns the result

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install & Run

```bash
git clone https://github.com/user/GeminiOS.git
cd GeminiOS
npm install
npm start
```

### Building

```bash
# Package for current platform
npm run make
```

Builds are configured for macOS (ZIP) and Windows (Squirrel installer).

## Teaching AI Studio to Use the Bridge

When creating an application in AI Studio that should interact with the OS, **attach the [`GEMINI_OS_API.md`](./GEMINI_OS_API.md) file as context** in your prompt. This file contains the full API specification, usage examples, and error handling patterns that AI Studio needs to generate working code.

For example, you might prompt:

> "Build me a file browser app that lets me navigate my local filesystem. Use the GeminiOS API described in the attached document."

The spec covers:
- **Filesystem** — read, write, list, stat, mkdir, delete
- **Shell** — open URLs in the default browser, execute commands
- **Clipboard** — read and write text
- Environment detection with `waitForGeminiOS()` for proper initialization
- Error handling for permission denials

## Available API Methods

| Namespace   | Method                        | Description                    |
|-------------|-------------------------------|--------------------------------|
| `fs`        | `readFile(path, encoding?)`   | Read file contents             |
| `fs`        | `writeFile(path, content)`    | Write string to file           |
| `fs`        | `readDir(path)`               | List directory entries         |
| `fs`        | `stat(path)`                  | Get file size, type, timestamps|
| `fs`        | `mkdir(path, recursive?)`     | Create directory               |
| `fs`        | `delete(path, recursive?)`    | Delete file or directory       |
| `shell`     | `openExternal(url)`           | Open URL in default browser    |
| `shell`     | `exec(command, args[])`       | Run a command (30s timeout)    |
| `clipboard` | `readText()`                  | Read clipboard text            |
| `clipboard` | `writeText(text)`             | Write text to clipboard        |

## License

MIT
