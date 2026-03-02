export interface DirEntry {
  name: string;
  isDirectory: boolean;
  isFile: boolean;
}

export interface FileStat {
  size: number;
  isFile: boolean;
  isDirectory: boolean;
  createdAt: string;
  modifiedAt: string;
}

export interface ExecResult {
  stdout: string;
  stderr: string;
}

export interface PermissionRequest {
  operation: string;
  description: string;
  risk: 'low' | 'medium' | 'high' | 'critical';
}

export interface GeminiOSApi {
  fs: {
    readFile(filePath: string, encoding?: string): Promise<string>;
    writeFile(filePath: string, content: string): Promise<void>;
    readDir(dirPath: string): Promise<DirEntry[]>;
    stat(filePath: string): Promise<FileStat>;
    mkdir(dirPath: string, recursive?: boolean): Promise<void>;
    delete(targetPath: string, recursive?: boolean): Promise<void>;
  };
  shell: {
    openExternal(url: string): Promise<void>;
    exec(command: string, args: string[]): Promise<ExecResult>;
  };
  clipboard: {
    readText(): Promise<string>;
    writeText(text: string): Promise<void>;
  };
}

declare global {
  interface Window {
    geminiOS: GeminiOSApi;
  }
}
