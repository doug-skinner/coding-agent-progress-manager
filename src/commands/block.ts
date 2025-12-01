import { updateCommand } from './update.js';

/**
 * Mark a requirement as blocked with a required reason
 */
export async function blockCommand(id: number, reason: string): Promise<void> {
  if (!reason || reason.trim() === '') {
    console.error('Error: A reason is required when blocking a requirement');
    console.error('Usage: cap-manager block <id> <reason>');
    process.exit(1);
  }

  await updateCommand(id, 'Blocked', reason);
}
