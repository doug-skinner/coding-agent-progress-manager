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

export interface ListOptions {
  status?: string;
  since?: string;
  until?: string;
  linked?: boolean;
  unlinked?: boolean;
  sort?: 'id' | 'updated' | 'created' | 'status';
  order?: 'asc' | 'desc';
  format?: 'default' | 'json' | 'summary' | 'detailed';
}

/**
 * List all requirements in a formatted table with optional filtering
 */
export async function listCommand(options: ListOptions = {}): Promise<void> {
  // Read requirements
  let requirements: Requirement[];
  try {
    requirements = await readProgress();
  } catch (error) {
    console.error('Error reading progress.json:', error);
    process.exit(1);
  }

  // Apply filters
  let filtered = requirements;

  // Filter by status
  if (options.status) {
    filtered = filtered.filter((req) => req.status === options.status);
  }

  // Filter by date range (since)
  if (options.since) {
    const sinceDate = new Date(options.since);
    if (Number.isNaN(sinceDate.getTime())) {
      console.error(`Error: Invalid date format for --since: "${options.since}"`);
      process.exit(1);
    }
    filtered = filtered.filter((req) => new Date(req.updated) >= sinceDate);
  }

  // Filter by date range (until)
  if (options.until) {
    const untilDate = new Date(options.until);
    if (Number.isNaN(untilDate.getTime())) {
      console.error(`Error: Invalid date format for --until: "${options.until}"`);
      process.exit(1);
    }
    filtered = filtered.filter((req) => new Date(req.updated) <= untilDate);
  }

  // Filter by external link presence
  if (options.linked) {
    filtered = filtered.filter((req) => req.externalLink !== undefined);
  }

  if (options.unlinked) {
    filtered = filtered.filter((req) => req.externalLink === undefined);
  }

  // Apply sorting
  const sortBy = options.sort || 'id';
  const order = options.order || 'asc';

  filtered.sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'id':
        comparison = a.id - b.id;
        break;
      case 'updated':
        comparison = new Date(a.updated).getTime() - new Date(b.updated).getTime();
        break;
      case 'created':
        comparison = new Date(a.created).getTime() - new Date(b.created).getTime();
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
    }

    return order === 'desc' ? -comparison : comparison;
  });

  if (filtered.length === 0) {
    console.log('No requirements match the specified filters.');
    return;
  }

  // Output based on format
  const format = options.format || 'default';

  switch (format) {
    case 'json': {
      // JSON format: output full requirement objects
      console.log(JSON.stringify(filtered, null, 2));
      break;
    }

    case 'summary': {
      // Summary format: show only counts by status
      const summaryCounts = filtered.reduce(
        (acc, req) => {
          acc[req.status] = (acc[req.status] || 0) + 1;
          return acc;
        },
        {} as Record<Status, number>
      );

      const summaryParts: string[] = [];
      if (summaryCounts['Not Started']) {
        summaryParts.push(`${summaryCounts['Not Started']} Not Started`);
      }
      if (summaryCounts['In Progress']) {
        summaryParts.push(`${summaryCounts['In Progress']} In Progress`);
      }
      if (summaryCounts.Completed) {
        summaryParts.push(`${summaryCounts.Completed} Completed`);
      }
      if (summaryCounts.Blocked) {
        summaryParts.push(`${summaryCounts.Blocked} Blocked`);
      }

      console.log(summaryParts.join(', '));
      break;
    }

    case 'detailed': {
      // Detailed format: include full descriptions and notes
      console.log(`\n${'='.repeat(80)}`);
      console.log('Requirements List (Detailed)');
      console.log(`${'='.repeat(80)}\n`);

      for (const req of filtered) {
        const color = getStatusColor(req.status);
        const statusDisplay = `${color}${req.status}${COLORS.reset}`;
        const updatedDate = formatDate(req.updated);
        const createdDate = formatDate(req.created);

        console.log(`ID: ${req.id}`);
        console.log(`Title: ${req.title}`);
        console.log(`Status: ${statusDisplay}`);
        console.log(`Created: ${createdDate}`);
        console.log(`Updated: ${updatedDate}`);

        if (req.externalLink) {
          console.log(`Link: ${req.externalLink}`);
        }

        console.log(`\nDescription:\n${req.description}`);

        if (req.notes) {
          console.log(`\nNotes:\n${req.notes}`);
        }

        console.log(`\n${'='.repeat(80)}\n`);
      }
      break;
    }

    default: {
      // Default format: formatted table with key info
      console.log(`\n${'='.repeat(80)}`);
      console.log('Requirements List');
      console.log(`${'='.repeat(80)}\n`);

      for (const req of filtered) {
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
              ? `${req.notes.substring(0, maxNotesLength)}...`
              : req.notes;
          console.log(`Notes: ${notesDisplay}`);
        }

        console.log('-'.repeat(80));
      }

      // Print summary
      const statusCounts = filtered.reduce(
        (acc, req) => {
          acc[req.status] = (acc[req.status] || 0) + 1;
          return acc;
        },
        {} as Record<Status, number>
      );

      console.log('\nSummary:');
      console.log(`Total: ${filtered.length} requirements`);
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
      break;
    }
  }
}
