import { clipboard } from 'electron';

export function readText(): string {
  return clipboard.readText();
}

export function writeText(text: string): void {
  clipboard.writeText(text);
}
