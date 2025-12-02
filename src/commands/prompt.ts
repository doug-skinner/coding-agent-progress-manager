import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Output the contents of agent_prompt.txt to stdout
 */
export async function promptCommand(): Promise<void> {
  try {
    // Read agent_prompt.txt from repository root
    const promptPath = join(process.cwd(), 'agent_prompt.txt');
    const content = readFileSync(promptPath, 'utf-8');

    // Output contents directly to stdout without additional formatting
    console.log(content);
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      console.error('Error: agent_prompt.txt not found in the current directory');
      process.exit(1);
    }
    console.error('Error reading agent_prompt.txt:', error);
    process.exit(1);
  }
}
