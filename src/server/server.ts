import express from 'express';
import type { Express, Request, Response, NextFunction } from 'express';
import { join } from 'node:path';
import { existsSync } from 'node:fs';

// __dirname is available in CommonJS but TypeScript needs it declared
declare const __dirname: string;

/**
 * Find the public directory for static files
 * Checks both src/server/public/ (dev) and dist/server/public/ (production)
 */
function findPublicDirectory(): string | null {
  // When running from dist/server/server.js, check dist/server/public
  const distPath = join(__dirname, 'public');
  if (existsSync(distPath)) {
    return distPath;
  }

  // When running from src/server/server.ts (dev), check src/server/public
  const srcPath = join(__dirname, '../../src/server/public');
  if (existsSync(srcPath)) {
    return srcPath;
  }

  return null;
}

/**
 * Create and configure Express application
 * @returns Configured Express application
 */
export function createServer(): Express {
  const app = express();

  // JSON body parsing middleware
  app.use(express.json());

  // CORS headers for localhost development
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  // Static file serving from public/ directory
  const publicDir = findPublicDirectory();
  if (publicDir) {
    app.use(express.static(publicDir));
    console.log(`Serving static files from: ${publicDir}`);
  } else {
    console.warn('Warning: Public directory not found. Static files will not be served.');
  }

  // Health check endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ success: true, message: 'Server is healthy' });
  });

  // Error handling middleware
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Server error:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: err.message,
    });
  });

  return app;
}
