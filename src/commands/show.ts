import { readProgress } from '../fileUtils.js';
import type { Requirement } from '../types.js';

/**
 * Format a date string for display
 */
function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Display detailed information for a single requirement
 */
export async function showCommand(id: number): Promise<void> {
  // Read requirements
  let requirements: Requirement[];
  try {
    requirements = await readProgress();
  } catch (error) {
    console.error('Error reading progress.json:', error);
    process.exit(1);
  }

  // Find the requirement
  const requirement = requirements.find((r) => r.id === id);
  if (!requirement) {
    console.error(`Error: Requirement #${id} not found`);
    process.exit(1);
  }

  // Display detailed information
  console.log('\n' + '='.repeat(80));
  console.log(`Requirement #${requirement.id}`);
  console.log('='.repeat(80));
  console.log();
  console.log(`Title:       ${requirement.title}`);
  console.log(`Status:      ${requirement.status}`);
  console.log(`Created:     ${formatDate(requirement.created)}`);
  console.log(`Updated:     ${formatDate(requirement.updated)}`);

  if (requirement.externalLink) {
    console.log(`Link:        ${requirement.externalLink}`);
  }

  console.log();
  console.log('Description:');
  console.log(requirement.description);

  if (requirement.notes) {
    console.log();
    console.log('Notes:');
    console.log(requirement.notes);
  }

  console.log();
  console.log('='.repeat(80) + '\n');
}
