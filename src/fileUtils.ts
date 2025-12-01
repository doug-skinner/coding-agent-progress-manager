import * as fs from 'node:fs';
import * as path from 'node:path';
import type { Requirement } from './types.js';

const PROGRESS_FILE = 'progress.json';

/**
 * Get the absolute path to the progress.json file
 */
function getProgressFilePath(): string {
  return path.join(process.cwd(), PROGRESS_FILE);
}

/**
 * Read and parse the progress.json file
 * @returns Array of requirements
 * @throws Error if file doesn't exist, can't be read, or contains invalid JSON
 */
export function readProgress(): Requirement[] {
  const filePath = getProgressFilePath();

  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const requirements = JSON.parse(fileContent);

    if (!Array.isArray(requirements)) {
      throw new Error('progress.json must contain an array of requirements');
    }

    return requirements as Requirement[];
  } catch (error) {
    if (error instanceof Error) {
      if ('code' in error && error.code === 'ENOENT') {
        throw new Error(
          `progress.json file not found at ${filePath}. Run 'npm run progress -- init' to create it.`,
        );
      }
      if (error instanceof SyntaxError) {
        throw new Error(`progress.json contains invalid JSON: ${error.message}`);
      }
      throw error;
    }
    throw new Error('Unknown error reading progress.json');
  }
}

/**
 * Write requirements array to progress.json file with proper formatting
 * @param requirements - Array of requirements to write
 * @throws Error if file can't be written
 */
export function writeProgress(requirements: Requirement[]): void {
  const filePath = getProgressFilePath();

  try {
    const jsonContent = JSON.stringify(requirements, null, 2);
    fs.writeFileSync(filePath, `${jsonContent}\n`, 'utf-8');
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to write progress.json: ${error.message}`);
    }
    throw new Error('Unknown error writing progress.json');
  }
}

/**
 * Check if progress.json file exists
 */
export function progressFileExists(): boolean {
  const filePath = getProgressFilePath();
  return fs.existsSync(filePath);
}
