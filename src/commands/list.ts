import { readProgress } from '../fileUtils.js';
import type { Requirement, Status } from '../types.js';

// ANSI color codes for terminal output
const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
};

/**
 * Get color for a status
 */
function getStatusColor(status: Status): string {
  switch (status) {
    case 'Completed':
      return COLORS.green;
    case 'In Progress':
      return COLORS.blue;
    case 'Blocked':
      return COLORS.red;
    case 'Not Started':
      return COLORS.gray;
    default:
      return COLORS.reset;
  }
}

/**
 * Format a date string for display
 */
function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * List all requirements in a formatted table
 */
export async function listCommand(): Promise<void> {
  // Read requirements
  let requirements: Requirement[];
  try {
    requirements = await readProgress();
  } catch (error) {
    console.error('Error reading progress.json:', error);
    process.exit(1);
  }

  if (requirements.length === 0) {
    console.log('No requirements found.');
    return;
  }

  // Print header
  console.log('\n' + '='.repeat(80));
  console.log('Requirements List');
  console.log('='.repeat(80) + '\n');

  // Print each requirement
  for (const req of requirements) {
    const color = getStatusColor(req.status);
    const statusDisplay = `${color}${req.status}${COLORS.reset}`;
    const updatedDate = formatDate(req.updated);

    console.log(`ID: ${req.id}`);
    console.log(`Title: ${req.title}`);
    console.log(`Status: ${statusDisplay}`);
    console.log(`Updated: ${updatedDate}`);

    if (req.externalLink) {
      console.log(`Link: ${req.externalLink}`);
    }

    if (req.notes) {
      // Truncate notes if too long
      const maxNotesLength = 100;
      const notesDisplay =
        req.notes.length > maxNotesLength
          ? req.notes.substring(0, maxNotesLength) + '...'
          : req.notes;
      console.log(`Notes: ${notesDisplay}`);
    }

    console.log('-'.repeat(80));
  }

  // Print summary
  const statusCounts = requirements.reduce(
    (acc, req) => {
      acc[req.status] = (acc[req.status] || 0) + 1;
      return acc;
    },
    {} as Record<Status, number>
  );

  console.log('\nSummary:');
  console.log(`Total: ${requirements.length} requirements`);
  if (statusCounts['Not Started']) {
    console.log(`${COLORS.gray}Not Started: ${statusCounts['Not Started']}${COLORS.reset}`);
  }
  if (statusCounts['In Progress']) {
    console.log(`${COLORS.blue}In Progress: ${statusCounts['In Progress']}${COLORS.reset}`);
  }
  if (statusCounts.Completed) {
    console.log(`${COLORS.green}Completed: ${statusCounts.Completed}${COLORS.reset}`);
  }
  if (statusCounts.Blocked) {
    console.log(`${COLORS.red}Blocked: ${statusCounts.Blocked}${COLORS.reset}`);
  }
  console.log();
}
