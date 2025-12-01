#!/usr/bin/env node

import { Command } from 'commander';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Get package version for CLI
const packageJsonPath = join(__dirname, '../package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

// Create the CLI program
const program = new Command();

program
  .name('cap-manager')
  .description('CLI tool for tracking lightweight requirements and progress across coding agent runs')
  .version(packageJson.version);

// Command placeholders - will be implemented in subsequent requirements
// TODO: Add commands: init, add, update, list, show, delete, complete, block, prompt

// Parse command-line arguments
program.parse(process.argv);

// If no command is provided, show help
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
