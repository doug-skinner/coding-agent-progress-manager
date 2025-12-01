import { writeProgress, progressFileExists } from '../fileUtils.js';
import type { Requirement } from '../types.js';

/**
 * Initialize a new progress.json file with the first requirement
 */
export async function initCommand(title: string, description: string): Promise<void> {
  // Check if progress.json already exists
  if (progressFileExists()) {
    console.error('Error: progress.json already exists.');
    console.error('Use the "add" command to add more requirements.');
    process.exit(1);
  }

  // Create the first requirement
  const now = new Date().toISOString();
  const firstRequirement: Requirement = {
    id: 1,
    title,
    description,
    status: 'Not Started',
    notes: '',
    created: now,
    updated: now,
  };

  // Write to progress.json
  try {
    await writeProgress([firstRequirement]);
    console.log('Successfully initialized progress.json');
    console.log(`Created requirement #1: ${title}`);
  } catch (error) {
    console.error('Error creating progress.json:', error);
    process.exit(1);
  }
}
