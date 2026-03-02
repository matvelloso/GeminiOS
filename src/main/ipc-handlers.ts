import { ipcMain, BaseWindow } from 'electron';
import { IPC_CHANNELS } from '../shared/channels';
import { showPermissionDialog } from './permission-manager';
import * as fsApi from './os-api/filesystem';
import * as shellApi from './os-api/shell';
import * as clipboardApi from './os-api/clipboard';

export function registerIpcHandlers(parentWindow: BaseWindow): void {
  // Filesystem
  ipcMain.handle(IPC_CHANNELS.FS_READ_FILE, async (_event, filePath: string, encoding?: string) => {
    const approved = await showPermissionDialog(parentWindow, {
      operation: 'Read File',
      description: `The application wants to read the file:\n${filePath}`,
      risk: 'low',
    });
    if (!approved) throw new Error('Permission denied by user');
    return fsApi.readFile(filePath, encoding);
  });

  ipcMain.handle(IPC_CHANNELS.FS_WRITE_FILE, async (_event, filePath: string, content: string) => {
    const approved = await showPermissionDialog(parentWindow, {
      operation: 'Write File',
      description: `The application wants to write to:\n${filePath}\n\nContent length: ${content.length} characters`,
      risk: 'high',
    });
    if (!approved) throw new Error('Permission denied by user');
    return fsApi.writeFile(filePath, content);
  });

  ipcMain.handle(IPC_CHANNELS.FS_READ_DIR, async (_event, dirPath: string) => {
    const approved = await showPermissionDialog(parentWindow, {
      operation: 'List Directory',
      description: `The application wants to list files in:\n${dirPath}`,
      risk: 'low',
    });
    if (!approved) throw new Error('Permission denied by user');
    return fsApi.readDir(dirPath);
  });

  ipcMain.handle(IPC_CHANNELS.FS_STAT, async (_event, filePath: string) => {
    const approved = await showPermissionDialog(parentWindow, {
      operation: 'Get File Info',
      description: `The application wants to check file info:\n${filePath}`,
      risk: 'low',
    });
    if (!approved) throw new Error('Permission denied by user');
    return fsApi.stat(filePath);
  });

  ipcMain.handle(IPC_CHANNELS.FS_MKDIR, async (_event, dirPath: string, recursive?: boolean) => {
    const approved = await showPermissionDialog(parentWindow, {
      operation: 'Create Directory',
      description: `The application wants to create directory:\n${dirPath}${recursive ? ' (recursive)' : ''}`,
      risk: 'medium',
    });
    if (!approved) throw new Error('Permission denied by user');
    return fsApi.mkdir(dirPath, recursive);
  });

  ipcMain.handle(IPC_CHANNELS.FS_DELETE, async (_event, targetPath: string, recursive?: boolean) => {
    const approved = await showPermissionDialog(parentWindow, {
      operation: 'Delete',
      description: `The application wants to DELETE:\n${targetPath}${recursive ? '\n\n⚠ RECURSIVE — all contents will be removed' : ''}`,
      risk: 'critical',
    });
    if (!approved) throw new Error('Permission denied by user');
    return fsApi.remove(targetPath, recursive);
  });

  // Shell
  ipcMain.handle(IPC_CHANNELS.SHELL_OPEN_EXTERNAL, async (_event, url: string) => {
    const approved = await showPermissionDialog(parentWindow, {
      operation: 'Open URL',
      description: `The application wants to open in your default browser:\n${url}`,
      risk: 'medium',
    });
    if (!approved) throw new Error('Permission denied by user');
    return shellApi.openExternal(url);
  });

  ipcMain.handle(IPC_CHANNELS.SHELL_EXEC, async (_event, command: string, args: string[]) => {
    const approved = await showPermissionDialog(parentWindow, {
      operation: 'Execute Command',
      description: `The application wants to run:\n${command} ${args.join(' ')}`,
      risk: 'critical',
    });
    if (!approved) throw new Error('Permission denied by user');
    return shellApi.exec(command, args);
  });

  // Clipboard
  ipcMain.handle(IPC_CHANNELS.CLIPBOARD_READ, async () => {
    const approved = await showPermissionDialog(parentWindow, {
      operation: 'Read Clipboard',
      description: 'The application wants to read your clipboard contents.',
      risk: 'medium',
    });
    if (!approved) throw new Error('Permission denied by user');
    return clipboardApi.readText();
  });

  ipcMain.handle(IPC_CHANNELS.CLIPBOARD_WRITE, async (_event, text: string) => {
    const preview = text.length > 200 ? text.substring(0, 200) + '...' : text;
    const approved = await showPermissionDialog(parentWindow, {
      operation: 'Write Clipboard',
      description: `The application wants to set your clipboard to:\n"${preview}"`,
      risk: 'low',
    });
    if (!approved) throw new Error('Permission denied by user');
    return clipboardApi.writeText(text);
  });
}
