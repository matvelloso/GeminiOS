import { shell } from 'electron';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import type { ExecResult } from '../../shared/types';

const execFileAsync = promisify(execFile);

export async function openExternal(url: string): Promise<void> {
  await shell.openExternal(url);
}

export async function exec(command: string, args: string[]): Promise<ExecResult> {
  const { stdout, stderr } = await execFileAsync(command, args, {
    timeout: 30_000,
    maxBuffer: 1024 * 1024,
  });
  return { stdout, stderr };
}
