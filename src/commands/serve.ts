import { progressFileExists } from '../fileUtils.js';
import { createServer } from '../server/server.js';
import { registerRoutes } from '../server/routes.js';
import open from 'open';
import type { Server } from 'node:http';

/**
 * Session management state
 */
let lastPingTime = Date.now();
let pingCheckInterval: NodeJS.Timeout | null = null;
let server: Server | null = null;

/**
 * Serve command - Start web UI server with session management
 * @param port - Port to run the server on (default: 3005)
 */
export async function serveCommand(port = 3005): Promise<void> {
  // Check if progress.json exists
  if (!progressFileExists()) {
    console.error('Error: progress.json not found.');
    console.error('Run "init" command first to create progress.json');
    process.exit(1);
  }

  try {
    // Create Express app
    const app = createServer();

    // Register API routes
    registerRoutes(app);

    // Add ping endpoint for session management
    app.post('/api/ping', (_req, res) => {
      lastPingTime = Date.now();
      res.json({ success: true, message: 'Ping received' });
    });

    // Start server
    server = app.listen(port, () => {
      console.log(`\n🚀 Server started on port ${port}`);
      console.log(`📊 Web UI: http://localhost:${port}`);
      console.log(`⏱️  Session timeout: 15 minutes of inactivity`);
      console.log(`\nPress Ctrl+C to stop the server\n`);

      // Open browser automatically
      open(`http://localhost:${port}`).catch((error) => {
        console.warn('Could not auto-open browser:', error.message);
        console.log(`Please open http://localhost:${port} manually`);
      });
    });

    // Set up session timeout check (every 60 seconds)
    const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds
    const CHECK_INTERVAL = 60 * 1000; // Check every 60 seconds

    pingCheckInterval = setInterval(() => {
      const timeSinceLastPing = Date.now() - lastPingTime;

      if (timeSinceLastPing > SESSION_TIMEOUT) {
        console.log('\n⏱️  Session timeout: No activity for 15 minutes');
        console.log('Shutting down server...');
        gracefulShutdown();
      }
    }, CHECK_INTERVAL);

    // Handle graceful shutdown on Ctrl+C
    process.on('SIGINT', () => {
      console.log('\n\n👋 Received shutdown signal (Ctrl+C)');
      gracefulShutdown();
    });

    process.on('SIGTERM', () => {
      console.log('\n\n👋 Received shutdown signal (SIGTERM)');
      gracefulShutdown();
    });

  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

/**
 * Gracefully shut down the server
 */
function gracefulShutdown(): void {
  console.log('Stopping server...');

  // Clear ping check interval
  if (pingCheckInterval) {
    clearInterval(pingCheckInterval);
    pingCheckInterval = null;
  }

  // Close server
  if (server) {
    server.close(() => {
      console.log('✅ Server stopped successfully');
      process.exit(0);
    });

    // Force close after 5 seconds if graceful shutdown fails
    setTimeout(() => {
      console.log('⚠️  Forcing server shutdown');
      process.exit(0);
    }, 5000);
  } else {
    process.exit(0);
  }
}
