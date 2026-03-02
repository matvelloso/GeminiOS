import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../shared/channels';

contextBridge.exposeInMainWorld('geminiOS', {
  fs: {
    readFile: (filePath: string, encoding?: string): Promise<string> =>
      ipcRenderer.invoke(IPC_CHANNELS.FS_READ_FILE, filePath, encoding),

    writeFile: (filePath: string, content: string): Promise<void> =>
      ipcRenderer.invoke(IPC_CHANNELS.FS_WRITE_FILE, filePath, content),

    readDir: (dirPath: string): Promise<Array<{ name: string; isDirectory: boolean; isFile: boolean }>> =>
      ipcRenderer.invoke(IPC_CHANNELS.FS_READ_DIR, dirPath),

    stat: (filePath: string): Promise<{ size: number; isFile: boolean; isDirectory: boolean; createdAt: string; modifiedAt: string }> =>
      ipcRenderer.invoke(IPC_CHANNELS.FS_STAT, filePath),

    mkdir: (dirPath: string, recursive?: boolean): Promise<void> =>
      ipcRenderer.invoke(IPC_CHANNELS.FS_MKDIR, dirPath, recursive),

    delete: (targetPath: string, recursive?: boolean): Promise<void> =>
      ipcRenderer.invoke(IPC_CHANNELS.FS_DELETE, targetPath, recursive),
  },

  shell: {
    openExternal: (url: string): Promise<void> =>
      ipcRenderer.invoke(IPC_CHANNELS.SHELL_OPEN_EXTERNAL, url),

    exec: (command: string, args: string[]): Promise<{ stdout: string; stderr: string }> =>
      ipcRenderer.invoke(IPC_CHANNELS.SHELL_EXEC, command, args),
  },

  clipboard: {
    readText: (): Promise<string> =>
      ipcRenderer.invoke(IPC_CHANNELS.CLIPBOARD_READ),

    writeText: (text: string): Promise<void> =>
      ipcRenderer.invoke(IPC_CHANNELS.CLIPBOARD_WRITE, text),
  },
});
