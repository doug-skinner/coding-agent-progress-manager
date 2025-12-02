import type { Status } from '../types.js';

/**
 * Valid status values for requirements
 */
export const VALID_STATUSES: Status[] = ['Not Started', 'In Progress', 'Completed', 'Blocked'];

/**
 * Validate that a status value is one of the allowed values
 * @param status - The status string to validate
 * @returns True if the status is valid, false otherwise
 */
export function isValidStatus(status: string): status is Status {
  return VALID_STATUSES.includes(status as Status);
}

/**
 * Validate that a string is a valid HTTP/HTTPS URL
 * @param urlString - The URL string to validate
 * @returns True if the URL is valid HTTP/HTTPS, false otherwise
 */
export function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}
