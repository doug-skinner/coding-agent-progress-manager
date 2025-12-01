import { readProgress, writeProgress } from '../fileUtils.js';
import { createInterface } from 'node:readline';
import type { Requirement } from '../types.js';

/**
 * Prompt user for confirmation
 */
function confirmDeletion(requirement: Requirement): Promise<boolean> {
  return new Promise((resolve) => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log(`\nYou are about to delete requirement #${requirement.id}:`);
    console.log(`Title: ${requirement.title}`);
    console.log(`Status: ${requirement.status}`);
    console.log();

    rl.question('Are you sure you want to delete this requirement? (yes/no): ', (answer) => {
      rl.close();
      const confirmed = answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y';
      resolve(confirmed);
    });
  });
}

/**
 * Delete a requirement by ID
 */
export async function deleteCommand(id: number, force = false): Promise<void> {
  // Read existing requirements
  let requirements: Requirement[];
  try {
    requirements = await readProgress();
  } catch (error) {
    console.error('Error reading progress.json:', error);
    process.exit(1);
  }

  // Find the requirement to delete
  const requirement = requirements.find((r) => r.id === id);
  if (!requirement) {
    console.error(`Error: Requirement #${id} not found`);
    process.exit(1);
  }

  // Confirm deletion unless force flag is set
  if (!force) {
    const confirmed = await confirmDeletion(requirement);
    if (!confirmed) {
      console.log('Deletion cancelled.');
      process.exit(0);
    }
  }

  // Remove the requirement
  const updatedRequirements = requirements.filter((r) => r.id !== id);

  // Write updated requirements
  try {
    await writeProgress(updatedRequirements);
    console.log(`Successfully deleted requirement #${id}`);
  } catch (error) {
    console.error('Error updating progress.json:', error);
    process.exit(1);
  }
}
