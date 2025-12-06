import { writeProgress, progressFileExists } from '../fileUtils.js';
import type { Requirement } from '../types.js';

/**
 * Initialize a new progress.json file with optional first requirement
 */
export async function initCommand(title?: string, description?: string): Promise<void> {
  // Check if progress.json already exists
  if (progressFileExists()) {
    console.error('Error: progress.json already exists.');
    console.error('Use the "add" command to add more requirements.');
    process.exit(1);
  }

  // Create empty array or array with first requirement
  const requirements: Requirement[] = [];

  if (title && description) {
    // Create the first requirement if title and description provided
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
    requirements.push(firstRequirement);
  }

  // Write to progress.json
  try {
    await writeProgress(requirements);
    if (requirements.length > 0) {
      console.log('Successfully initialized progress.json');
      console.log(`Created requirement #1: ${title}`);
    } else {
      console.log('Successfully initialized empty progress.json');
      console.log('Use the "add" command or web UI (cap-manager serve) to add requirements.');
    }
  } catch (error) {
    console.error('Error creating progress.json:', error);
    process.exit(1);
  }
}
