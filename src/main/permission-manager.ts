import { dialog, BaseWindow } from 'electron';
import type { PermissionRequest } from '../shared/types';

export async function showPermissionDialog(
  parentWindow: BaseWindow,
  request: PermissionRequest,
): Promise<boolean> {
  const result = await dialog.showMessageBox(parentWindow, {
    type: request.risk === 'critical' || request.risk === 'high' ? 'warning' : 'question',
    title: `Permission: ${request.operation}`,
    message: request.operation,
    detail: request.description,
    buttons: ['Allow', 'Deny'],
    defaultId: 1,
    cancelId: 1,
    noLink: true,
  });

  return result.response === 0;
}
