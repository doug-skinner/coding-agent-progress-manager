import { readProgress, writeProgress } from '../fileUtils.js';
import type { Requirement } from '../types.js';

/**
 * Add a new requirement to progress.json
 */
export async function addCommand(title: string, description: string): Promise<void> {
  // Read existing requirements
  let requirements: Requirement[];
  try {
    requirements = await readProgress();
  } catch (error) {
    console.error('Error reading progress.json:', error);
    console.error('Run "init" command first to create progress.json');
    process.exit(1);
  }

  // Generate next ID
  const maxId = Math.max(...requirements.map((r) => r.id));
  const nextId = maxId + 1;

  // Create new requirement
  const now = new Date().toISOString();
  const newRequirement: Requirement = {
    id: nextId,
    title,
    description,
    status: 'Not Started',
    notes: '',
    created: now,
    updated: now,
  };

  // Add to requirements array
  requirements.push(newRequirement);

  // Write updated requirements
  try {
    await writeProgress(requirements);
    console.log(`Successfully added requirement #${nextId}: ${title}`);
  } catch (error) {
    console.error('Error updating progress.json:', error);
    process.exit(1);
  }
}
