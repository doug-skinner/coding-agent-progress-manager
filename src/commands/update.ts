import { readProgress, writeProgress } from '../fileUtils.js';
import type { Requirement } from '../types.js';
import { VALID_STATUSES, isValidStatus, isValidUrl } from '../server/validation.js';

/**
 * Update an existing requirement's status and optionally its notes
 */
export async function updateCommand(
  id: number,
  newStatus: string,
  notes?: string,
  link?: string | null
): Promise<void> {
  // Validate status
  if (!isValidStatus(newStatus)) {
    console.error(`Error: Invalid status "${newStatus}"`);
    console.error(`Valid statuses are: ${VALID_STATUSES.join(', ')}`);
    process.exit(1);
  }

  // Validate external link if provided and not empty string (empty string is for clearing)
  if (link !== undefined && link !== null && link !== '' && !isValidUrl(link)) {
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
    process.exit(1);
  }

  // Find the requirement to update
  const requirement = requirements.find((r) => r.id === id);
  if (!requirement) {
    console.error(`Error: Requirement #${id} not found`);
    process.exit(1);
  }

  // Update the requirement
  requirement.status = newStatus;
  if (notes !== undefined) {
    requirement.notes = notes;
  }

  // Update or clear external link if provided
  if (link !== undefined && link !== null) {
    if (link === '') {
      // Empty string clears the link
      delete requirement.externalLink;
    } else {
      // Set or update the link
      requirement.externalLink = link;
    }
  }

  requirement.updated = new Date().toISOString();

  // Write updated requirements
  try {
    await writeProgress(requirements);
    console.log(`Successfully updated requirement #${id}`);
    console.log(`Status: ${newStatus}`);
    if (notes !== undefined) {
      console.log(`Notes: ${notes}`);
    }
  } catch (error) {
    console.error('Error updating progress.json:', error);
    process.exit(1);
  }
}
