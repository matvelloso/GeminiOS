export const IPC_CHANNELS = {
  // Filesystem
  FS_READ_FILE: 'geminiOS:fs:readFile',
  FS_WRITE_FILE: 'geminiOS:fs:writeFile',
  FS_READ_DIR: 'geminiOS:fs:readDir',
  FS_STAT: 'geminiOS:fs:stat',
  FS_MKDIR: 'geminiOS:fs:mkdir',
  FS_DELETE: 'geminiOS:fs:delete',

  // Shell
  SHELL_OPEN_EXTERNAL: 'geminiOS:shell:openExternal',
  SHELL_EXEC: 'geminiOS:shell:exec',

  // Clipboard
  CLIPBOARD_READ: 'geminiOS:clipboard:read',
  CLIPBOARD_WRITE: 'geminiOS:clipboard:write',
} as const;
