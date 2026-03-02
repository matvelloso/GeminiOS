# GeminiOS API Specification

You are running inside GeminiOS, an Electron shell that wraps Google AI Studio. Your generated apps run in a sandboxed iframe within AI Studio. The GeminiOS shell automatically injects a `window.geminiOS` API into your iframe that lets you interact with the user's operating system.

**Every operation requires user approval** — a permission dialog will appear, and the user must click "Allow" before it executes.

All methods are asynchronous and return Promises. If the user denies a request, the Promise rejects with `"Permission denied by user"`. Always handle rejections gracefully.

---

## Environment Detection

The `window.geminiOS` API is injected automatically but may not be available immediately when your app starts. Always wait for it:

```js
function waitForGeminiOS(timeout = 5000) {
  return new Promise((resolve, reject) => {
    if (window.geminiOS) return resolve(window.geminiOS);
    const interval = setInterval(() => {
      if (window.geminiOS) {
        clearInterval(interval);
        resolve(window.geminiOS);
      }
    }, 100);
    setTimeout(() => {
      clearInterval(interval);
      reject(new Error('GeminiOS not available'));
    }, timeout);
  });
}

// Use at app startup
const os = await waitForGeminiOS();
const files = await os.fs.readDir('/tmp');
```

---

## Filesystem — `window.geminiOS.fs`

### Read a file
```js
const content = await window.geminiOS.fs.readFile('/path/to/file.txt', 'utf-8');
```
- `encoding` is optional, defaults to `'utf-8'`

### Write a file
```js
await window.geminiOS.fs.writeFile('/path/to/file.txt', 'Hello, world!');
```
- Creates the file if it doesn't exist, overwrites if it does

### List a directory
```js
const entries = await window.geminiOS.fs.readDir('/path/to/folder');
// Returns: [{ name: "file.txt", isFile: true, isDirectory: false }, ...]
```

### Get file info
```js
const info = await window.geminiOS.fs.stat('/path/to/file.txt');
// Returns: { size: 1024, isFile: true, isDirectory: false, createdAt: "...", modifiedAt: "..." }
```

### Create a directory
```js
await window.geminiOS.fs.mkdir('/path/to/new-folder', true); // true = recursive
```

### Delete a file or directory
```js
await window.geminiOS.fs.delete('/path/to/file.txt');
await window.geminiOS.fs.delete('/path/to/folder', true); // true = recursive
```

---

## Shell — `window.geminiOS.shell`

### Open a URL in the default browser
```js
await window.geminiOS.shell.openExternal('https://example.com');
```

### Execute a command
```js
const result = await window.geminiOS.shell.exec('ls', ['-la', '/tmp']);
// Returns: { stdout: "...", stderr: "..." }
```
- First argument is the command, second is an array of arguments
- 30-second timeout, 1MB output limit

---

## Clipboard — `window.geminiOS.clipboard`

### Read clipboard
```js
const text = await window.geminiOS.clipboard.readText();
```

### Write to clipboard
```js
await window.geminiOS.clipboard.writeText('Copied!');
```

---

## Error Handling

Always wrap calls in try/catch. The user can deny any operation:

```js
try {
  const content = await window.geminiOS.fs.readFile('/some/file.txt', 'utf-8');
  console.log(content);
} catch (err) {
  if (err.message === 'Permission denied by user') {
    console.log('User denied access');
  } else {
    console.error('Operation failed:', err.message);
  }
}
```

---

## Complete Example: A Simple Note-Taking App

```js
async function main() {
  // Wait for the GeminiOS API to become available
  await waitForGeminiOS();

  const NOTES_DIR = '/tmp/gemini-notes';

  // Ensure the notes directory exists
  await window.geminiOS.fs.mkdir(NOTES_DIR, true);

  // Save a note
  async function saveNote(filename, content) {
    const path = `${NOTES_DIR}/${filename}`;
    await window.geminiOS.fs.writeFile(path, content);
    return path;
  }

  // List all notes
  async function listNotes() {
    const entries = await window.geminiOS.fs.readDir(NOTES_DIR);
    return entries.filter(e => e.isFile).map(e => e.name);
  }

  // Read a note
  async function readNote(filename) {
    return await window.geminiOS.fs.readFile(`${NOTES_DIR}/${filename}`, 'utf-8');
  }

  // Delete a note
  async function deleteNote(filename) {
    await window.geminiOS.fs.delete(`${NOTES_DIR}/${filename}`);
  }

  // Usage
  await saveNote('hello.txt', 'My first note from GeminiOS!');
  const notes = await listNotes();
  console.log('Notes:', notes);
  const content = await readNote('hello.txt');
  console.log('Content:', content);
}

main();
```

---

## Important Notes

- `window.geminiOS` is automatically injected into your app's iframe — you do not need to import or include anything
- Use `waitForGeminiOS()` at startup since the API is injected asynchronously and may not be instantly available
- Each call triggers a visible permission dialog — batch your operations where possible to avoid excessive prompts
- File paths are absolute OS paths (e.g. `/Users/name/file.txt` on Mac, `C:\Users\name\file.txt` on Windows)
- `shell.exec` runs commands directly (no shell interpretation) — pipe operators and shell syntax won't work; use explicit command arguments instead
