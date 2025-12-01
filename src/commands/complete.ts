import { updateCommand } from './update.js';

/**
 * Mark a requirement as completed (shorthand for update with status="Completed")
 */
export async function completeCommand(id: number, notes?: string): Promise<void> {
  await updateCommand(id, 'Completed', notes);
}
