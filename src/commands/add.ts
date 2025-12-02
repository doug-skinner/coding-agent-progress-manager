import { readProgress, writeProgress } from '../fileUtils.js';
import type { Requirement } from '../types.js';

/**
 * Validate that a string is a valid HTTP/HTTPS URL
 */
function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Add a new requirement to progress.json
 */
export async function addCommand(title: string, description: string, link?: string): Promise<void> {
  // Validate external link if provided
  if (link && !isValidUrl(link)) {
    console.error(
      `Error: Invalid URL format for external link: "${link}". Must be a valid HTTP or HTTPS URL.`
    );
    process.exit(1);
  }

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

  // Add external link if provided
  if (link) {
    newRequirement.externalLink = link;
  }

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
