/**
 * Status type for requirements
 * Represents the four allowed status values
 */
export type Status = 'Not Started' | 'In Progress' | 'Completed' | 'Blocked';

/**
 * Requirement interface representing a single requirement in progress.json
 */
export interface Requirement {
  /** Unique identifier for the requirement */
  id: number;

  /** Short title describing the requirement */
  title: string;

  /** Detailed description of what needs to be done */
  description: string;

  /** Current status of the requirement */
  status: Status;

  /** Additional notes about progress, blockers, or decisions */
  notes: string;

  /** ISO 8601 timestamp when the requirement was created */
  created: string;

  /** ISO 8601 timestamp when the requirement was last updated */
  updated: string;

  /** Optional external link to project management system (e.g., Jira, GitHub Issues) */
  externalLink?: string;
}
