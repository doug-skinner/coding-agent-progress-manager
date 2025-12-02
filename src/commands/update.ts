import { readProgress, writeProgress } from '../fileUtils.js';
import type { Requirement, Status } from '../types.js';

const VALID_STATUSES: Status[] = ['Not Started', 'In Progress', 'Completed', 'Blocked'];

/**
 * Validate that a status value is one of the allowed values
 */
function isValidStatus(status: string): status is Status {
  return VALID_STATUSES.includes(status as Status);
}

/**
 * Update an existing requirement's status and optionally its notes
 */
export async function updateCommand(id: number, newStatus: string, notes?: string): Promise<void> {
  // Validate status
  if (!isValidStatus(newStatus)) {
    console.error(`Error: Invalid status "${newStatus}"`);
    console.error(`Valid statuses are: ${VALID_STATUSES.join(', ')}`);
    process.exit(1);
  }

  // Read existing requirements
  let requirements: Requirement[];
  try {
    requirements = await readProgress();
  } catch (error) {
    console.error('Error reading progress.json:', error);
    process.exit(1);
  }

  // Find the requirement to update
  const requirement = requirements.find((r) => r.id === id);
  if (!requirement) {
    console.error(`Error: Requirement #${id} not found`);
    process.exit(1);
  }

  // Update the requirement
  requirement.status = newStatus;
  if (notes !== undefined) {
    requirement.notes = notes;
  }
  requirement.updated = new Date().toISOString();

  // Write updated requirements
  try {
    await writeProgress(requirements);
    console.log(`Successfully updated requirement #${id}`);
    console.log(`Status: ${newStatus}`);
    if (notes !== undefined) {
      console.log(`Notes: ${notes}`);
    }
  } catch (error) {
    console.error('Error updating progress.json:', error);
    process.exit(1);
  }
}
