#!/usr/bin/env node

import { Command } from 'commander';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { addCommand } from './commands/add.js';
import { blockCommand } from './commands/block.js';
import { completeCommand } from './commands/complete.js';
import { deleteCommand } from './commands/delete.js';
import { initCommand } from './commands/init.js';
import { listCommand } from './commands/list.js';
import { promptCommand } from './commands/prompt.js';
import { showCommand } from './commands/show.js';
import { updateCommand } from './commands/update.js';

// Get package version for CLI
const packageJsonPath = join(__dirname, '../package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

// Create the CLI program
const program = new Command();

program
  .name('cap-manager')
  .description(
    'CLI tool for tracking lightweight requirements and progress across coding agent runs'
  )
  .version(packageJson.version);

// Init command
program
  .command('init')
  .description('Initialize a new progress.json file with the first requirement')
  .argument('<title>', 'Title of the first requirement')
  .argument('<description>', 'Description of the first requirement')
  .action(async (title: string, description: string) => {
    await initCommand(title, description);
  });

// Add command
program
  .command('add')
  .description('Add a new requirement to progress.json')
  .argument('<title>', 'Title of the requirement')
  .argument('<description>', 'Description of the requirement')
  .option('-l, --link <url>', 'External link (e.g., Jira, GitHub Issue)')
  .action(async (title: string, description: string, options: { link?: string }) => {
    await addCommand(title, description, options.link);
  });

// Update command
program
  .command('update')
  .description('Update a requirement status and optionally its notes')
  .argument('<id>', 'ID of the requirement to update', Number.parseInt)
  .argument('<status>', 'New status (Not Started, In Progress, Completed, Blocked)')
  .argument('[notes]', 'Optional notes to add')
  .option('-l, --link <url>', 'Set or update external link (use empty string "" to clear)')
  .action(async (id: number, status: string, notes?: string, options?: { link?: string }) => {
    await updateCommand(id, status, notes, options?.link);
  });

// List command
program
  .command('list')
  .description('List all requirements with their status')
  .option('--status <status>', 'Filter by status')
  .option('--since <date>', 'Filter by updated date (after)')
  .option('--until <date>', 'Filter by updated date (before)')
  .option('--linked', 'Show only requirements with external links')
  .option('--unlinked', 'Show only requirements without external links')
  .action(async (options: { status?: string; since?: string; until?: string; linked?: boolean; unlinked?: boolean }) => {
    await listCommand(options);
  });

// Show command
program
  .command('show')
  .description('Display detailed information for a single requirement')
  .argument('<id>', 'ID of the requirement to show', Number.parseInt)
  .action(async (id: number) => {
    await showCommand(id);
  });

// Complete command
program
  .command('complete')
  .description('Mark a requirement as completed')
  .argument('<id>', 'ID of the requirement to complete', Number.parseInt)
  .argument('[notes]', 'Optional completion notes')
  .action(async (id: number, notes?: string) => {
    await completeCommand(id, notes);
  });

// Block command
program
  .command('block')
  .description('Mark a requirement as blocked with a required reason')
  .argument('<id>', 'ID of the requirement to block', Number.parseInt)
  .argument('<reason>', 'Reason why the requirement is blocked')
  .action(async (id: number, reason: string) => {
    await blockCommand(id, reason);
  });

// Delete command
program
  .command('delete')
  .description('Delete a requirement by ID')
  .argument('<id>', 'ID of the requirement to delete', Number.parseInt)
  .option('-f, --force', 'Skip confirmation prompt')
  .action(async (id: number, options: { force?: boolean }) => {
    await deleteCommand(id, options.force);
  });

// Prompt command
program
  .command('prompt')
  .description('Output the agent_prompt.txt file contents')
  .action(async () => {
    await promptCommand();
  });

// Parse command-line arguments
program.parse(process.argv);

// If no command is provided, show help
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
