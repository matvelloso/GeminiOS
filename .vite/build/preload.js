"use strict";
const electron = require("electron");
const IPC_CHANNELS = {
  // Filesystem
  FS_READ_FILE: "geminiOS:fs:readFile",
  FS_WRITE_FILE: "geminiOS:fs:writeFile",
  FS_READ_DIR: "geminiOS:fs:readDir",
  FS_STAT: "geminiOS:fs:stat",
  FS_MKDIR: "geminiOS:fs:mkdir",
  FS_DELETE: "geminiOS:fs:delete",
  // Shell
  SHELL_OPEN_EXTERNAL: "geminiOS:shell:openExternal",
  SHELL_EXEC: "geminiOS:shell:exec",
  // Clipboard
  CLIPBOARD_READ: "geminiOS:clipboard:read",
  CLIPBOARD_WRITE: "geminiOS:clipboard:write"
};
electron.contextBridge.exposeInMainWorld("geminiOS", {
  fs: {
    readFile: (filePath, encoding) => electron.ipcRenderer.invoke(IPC_CHANNELS.FS_READ_FILE, filePath, encoding),
    writeFile: (filePath, content) => electron.ipcRenderer.invoke(IPC_CHANNELS.FS_WRITE_FILE, filePath, content),
    readDir: (dirPath) => electron.ipcRenderer.invoke(IPC_CHANNELS.FS_READ_DIR, dirPath),
    stat: (filePath) => electron.ipcRenderer.invoke(IPC_CHANNELS.FS_STAT, filePath),
    mkdir: (dirPath, recursive) => electron.ipcRenderer.invoke(IPC_CHANNELS.FS_MKDIR, dirPath, recursive),
    delete: (targetPath, recursive) => electron.ipcRenderer.invoke(IPC_CHANNELS.FS_DELETE, targetPath, recursive)
  },
  shell: {
    openExternal: (url) => electron.ipcRenderer.invoke(IPC_CHANNELS.SHELL_OPEN_EXTERNAL, url),
    exec: (command, args) => electron.ipcRenderer.invoke(IPC_CHANNELS.SHELL_EXEC, command, args)
  },
  clipboard: {
    readText: () => electron.ipcRenderer.invoke(IPC_CHANNELS.CLIPBOARD_READ),
    writeText: (text) => electron.ipcRenderer.invoke(IPC_CHANNELS.CLIPBOARD_WRITE, text)
  }
});
