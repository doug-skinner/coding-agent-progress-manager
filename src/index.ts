#!/usr/bin/env node

import { Command } from 'commander';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { addCommand } from './commands/add.js';
import { initCommand } from './commands/init.js';
import { listCommand } from './commands/list.js';
import { updateCommand } from './commands/update.js';

// Get package version for CLI
const packageJsonPath = join(__dirname, '../package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

// Create the CLI program
const program = new Command();

program
  .name('cap-manager')
  .description('CLI tool for tracking lightweight requirements and progress across coding agent runs')
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
  .action(async (title: string, description: string) => {
    await addCommand(title, description);
  });

// Update command
program
  .command('update')
  .description('Update a requirement status and optionally its notes')
  .argument('<id>', 'ID of the requirement to update', Number.parseInt)
  .argument('<status>', 'New status (Not Started, In Progress, Completed, Blocked)')
  .argument('[notes]', 'Optional notes to add')
  .action(async (id: number, status: string, notes?: string) => {
    await updateCommand(id, status, notes);
  });

// List command
program
  .command('list')
  .description('List all requirements with their status')
  .action(async () => {
    await listCommand();
  });

// Command placeholders - will be implemented in subsequent requirements
// TODO: Add commands: show, delete, complete, block, prompt

// Parse command-line arguments
program.parse(process.argv);

// If no command is provided, show help
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
