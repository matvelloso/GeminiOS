import fs from 'node:fs/promises';
import path from 'node:path';
import type { DirEntry, FileStat } from '../../shared/types';

export async function readFile(filePath: string, encoding?: string): Promise<string> {
  const resolved = path.resolve(filePath);
  const content = await fs.readFile(resolved, { encoding: (encoding || 'utf-8') as BufferEncoding });
  return content as string;
}

export async function writeFile(filePath: string, content: string): Promise<void> {
  const resolved = path.resolve(filePath);
  await fs.writeFile(resolved, content, 'utf-8');
}

export async function readDir(dirPath: string): Promise<DirEntry[]> {
  const resolved = path.resolve(dirPath);
  const entries = await fs.readdir(resolved, { withFileTypes: true });
  return entries.map((entry) => ({
    name: entry.name,
    isDirectory: entry.isDirectory(),
    isFile: entry.isFile(),
  }));
}

export async function stat(filePath: string): Promise<FileStat> {
  const resolved = path.resolve(filePath);
  const stats = await fs.stat(resolved);
  return {
    size: stats.size,
    isFile: stats.isFile(),
    isDirectory: stats.isDirectory(),
    createdAt: stats.birthtime.toISOString(),
    modifiedAt: stats.mtime.toISOString(),
  };
}

export async function mkdir(dirPath: string, recursive?: boolean): Promise<void> {
  const resolved = path.resolve(dirPath);
  await fs.mkdir(resolved, { recursive: recursive ?? false });
}

export async function remove(targetPath: string, recursive?: boolean): Promise<void> {
  const resolved = path.resolve(targetPath);
  await fs.rm(resolved, { recursive: recursive ?? false });
}
