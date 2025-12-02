import type { Express, Request, Response } from 'express';
import { readProgress, writeProgress } from '../fileUtils.js';
import type { Requirement, Status } from '../types.js';
import { VALID_STATUSES, isValidStatus, isValidUrl } from './validation.js';

/**
 * API response format
 */
interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Apply filtering and sorting to requirements
 */
function filterAndSortRequirements(
  requirements: Requirement[],
  query: Record<string, unknown>
): Requirement[] {
  let filtered = requirements;

  // Filter by status
  if (query.status && typeof query.status === 'string') {
    filtered = filtered.filter((req) => req.status === query.status);
  }

  // Filter by date range (since)
  if (query.since && typeof query.since === 'string') {
    const sinceDate = new Date(query.since);
    if (!Number.isNaN(sinceDate.getTime())) {
      filtered = filtered.filter((req) => new Date(req.updated) >= sinceDate);
    }
  }

  // Filter by date range (until)
  if (query.until && typeof query.until === 'string') {
    const untilDate = new Date(query.until);
    if (!Number.isNaN(untilDate.getTime())) {
      filtered = filtered.filter((req) => new Date(req.updated) <= untilDate);
    }
  }

  // Filter by external link presence
  if (query.linked === 'true') {
    filtered = filtered.filter((req) => req.externalLink !== undefined);
  }

  if (query.unlinked === 'true') {
    filtered = filtered.filter((req) => req.externalLink === undefined);
  }

  // Apply sorting
  const sortBy = (query.sort as string) || 'id';
  const order = (query.order as string) || 'asc';

  filtered.sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'id':
        comparison = a.id - b.id;
        break;
      case 'updated':
        comparison = new Date(a.updated).getTime() - new Date(b.updated).getTime();
        break;
      case 'created':
        comparison = new Date(a.created).getTime() - new Date(b.created).getTime();
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
    }

    return order === 'desc' ? -comparison : comparison;
  });

  return filtered;
}

/**
 * Register all API routes on the Express app
 */
export function registerRoutes(app: Express): void {
  // GET /api/requirements - List all requirements with optional filtering and sorting
  app.get('/api/requirements', async (_req: Request, res: Response) => {
    try {
      const requirements = await readProgress();
      const filtered = filterAndSortRequirements(requirements, _req.query);

      const response: ApiResponse<Requirement[]> = {
        success: true,
        data: filtered,
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to read requirements',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
      res.status(500).json(response);
    }
  });

  // GET /api/requirements/:id - Get a single requirement by ID
  app.get('/api/requirements/:id', async (req: Request, res: Response) => {
    try {
      const id = Number.parseInt(req.params.id, 10);
      if (Number.isNaN(id)) {
        const response: ApiResponse = {
          success: false,
          error: 'Invalid requirement ID',
        };
        res.status(400).json(response);
        return;
      }

      const requirements = await readProgress();
      const requirement = requirements.find((r) => r.id === id);

      if (!requirement) {
        const response: ApiResponse = {
          success: false,
          error: `Requirement #${id} not found`,
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<Requirement> = {
        success: true,
        data: requirement,
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to read requirement',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
      res.status(500).json(response);
    }
  });

  // POST /api/requirements - Create a new requirement
  app.post('/api/requirements', async (req: Request, res: Response) => {
    try {
      const { title, description, externalLink } = req.body;

      // Validate required fields
      if (!title || typeof title !== 'string' || title.trim() === '') {
        const response: ApiResponse = {
          success: false,
          error: 'Title is required',
        };
        res.status(400).json(response);
        return;
      }

      if (!description || typeof description !== 'string' || description.trim() === '') {
        const response: ApiResponse = {
          success: false,
          error: 'Description is required',
        };
        res.status(400).json(response);
        return;
      }

      // Validate external link if provided
      if (externalLink && !isValidUrl(externalLink)) {
        const response: ApiResponse = {
          success: false,
          error: 'Invalid URL format for external link',
        };
        res.status(400).json(response);
        return;
      }

      // Read existing requirements
      const requirements = await readProgress();

      // Generate next ID
      const maxId = Math.max(...requirements.map((r) => r.id));
      const nextId = maxId + 1;

      // Create new requirement
      const now = new Date().toISOString();
      const newRequirement: Requirement = {
        id: nextId,
        title: title.trim(),
        description: description.trim(),
        status: 'Not Started',
        notes: '',
        created: now,
        updated: now,
      };

      if (externalLink) {
        newRequirement.externalLink = externalLink;
      }

      // Add to requirements array
      requirements.push(newRequirement);

      // Write updated requirements
      await writeProgress(requirements);

      const response: ApiResponse<Requirement> = {
        success: true,
        data: newRequirement,
        message: `Successfully created requirement #${nextId}`,
      };
      res.status(201).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to create requirement',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
      res.status(500).json(response);
    }
  });

  // PUT /api/requirements/:id - Update an existing requirement
  app.put('/api/requirements/:id', async (req: Request, res: Response) => {
    try {
      const id = Number.parseInt(req.params.id, 10);
      if (Number.isNaN(id)) {
        const response: ApiResponse = {
          success: false,
          error: 'Invalid requirement ID',
        };
        res.status(400).json(response);
        return;
      }

      const { title, description, status, notes, externalLink } = req.body;

      // Validate status if provided
      if (status && !isValidStatus(status)) {
        const response: ApiResponse = {
          success: false,
          error: `Invalid status "${status}". Valid statuses are: ${VALID_STATUSES.join(', ')}`,
        };
        res.status(400).json(response);
        return;
      }

      // Validate external link if provided (null or empty string is for clearing)
      if (externalLink !== undefined && externalLink !== null && externalLink !== '' && !isValidUrl(externalLink)) {
        const response: ApiResponse = {
          success: false,
          error: 'Invalid URL format for external link',
        };
        res.status(400).json(response);
        return;
      }

      // Read existing requirements
      const requirements = await readProgress();
      const requirement = requirements.find((r) => r.id === id);

      if (!requirement) {
        const response: ApiResponse = {
          success: false,
          error: `Requirement #${id} not found`,
        };
        res.status(404).json(response);
        return;
      }

      // Update fields
      if (title !== undefined) requirement.title = title;
      if (description !== undefined) requirement.description = description;
      if (status !== undefined) requirement.status = status;
      if (notes !== undefined) requirement.notes = notes;

      // Update or clear external link if provided
      if (externalLink !== undefined && externalLink !== null) {
        if (externalLink === '') {
          delete requirement.externalLink;
        } else {
          requirement.externalLink = externalLink;
        }
      }

      requirement.updated = new Date().toISOString();

      // Write updated requirements
      await writeProgress(requirements);

      const response: ApiResponse<Requirement> = {
        success: true,
        data: requirement,
        message: `Successfully updated requirement #${id}`,
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to update requirement',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
      res.status(500).json(response);
    }
  });

  // DELETE /api/requirements/:id - Delete a requirement
  app.delete('/api/requirements/:id', async (req: Request, res: Response) => {
    try {
      const id = Number.parseInt(req.params.id, 10);
      if (Number.isNaN(id)) {
        const response: ApiResponse = {
          success: false,
          error: 'Invalid requirement ID',
        };
        res.status(400).json(response);
        return;
      }

      // Read existing requirements
      const requirements = await readProgress();
      const index = requirements.findIndex((r) => r.id === id);

      if (index === -1) {
        const response: ApiResponse = {
          success: false,
          error: `Requirement #${id} not found`,
        };
        res.status(404).json(response);
        return;
      }

      // Remove requirement
      requirements.splice(index, 1);

      // Write updated requirements
      await writeProgress(requirements);

      const response: ApiResponse = {
        success: true,
        message: `Successfully deleted requirement #${id}`,
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to delete requirement',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
      res.status(500).json(response);
    }
  });
}
