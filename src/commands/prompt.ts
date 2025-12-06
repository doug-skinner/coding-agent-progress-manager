import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Output the contents of agent_prompt.txt to stdout
 */
export async function promptCommand(): Promise<void> {
  try {
    // Read agent_prompt.txt from the package root (two levels up from dist/commands/)
    // __dirname is available in CommonJS and points to the directory of this compiled file
    const promptPath = join(__dirname, '..', '..', 'agent_prompt.txt');
    const content = readFileSync(promptPath, 'utf-8');

    // Output contents directly to stdout without additional formatting
    console.log(content);
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      console.error('Error: agent_prompt.txt not found in the package installation');
      process.exit(1);
    }
    console.error('Error reading agent_prompt.txt:', error);
    process.exit(1);
  }
}
