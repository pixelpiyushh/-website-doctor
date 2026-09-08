import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { CONFIG } from './config.js';
import { apiRouter } from './routes/api.js';
import { getDB } from './db/index.js';
import { seedDemoData } from './db/seed.js';
import { startMonitoringWorker, stopMonitoringWorker } from './services/monitorWorker.js';

const app = express();

// Security and CORS
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Request logger for development
app.use((req, res, next) => {
  if (req.path !== '/api/events') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  }
  next();
});

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    service: 'website-doctor-api',
    timestamp: new Date().toISOString(),
  });
});

// Mount main API router
app.use('/api', apiRouter);

// Production Static Frontend Serving
const frontendDistPath = path.resolve(process.cwd(), '../frontend/dist');
const altFrontendDistPath = path.resolve(process.cwd(), 'frontend/dist');
const staticPath = fs.existsSync(frontendDistPath) ? frontendDistPath : fs.existsSync(altFrontendDistPath) ? altFrontendDistPath : null;

if (staticPath) {
  console.log(`[Production] Serving static web assets from: ${staticPath}`);
  app.use(express.static(staticPath));
  app.get('*', (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api') || req.path === '/health') {
      return next();
    }
    res.sendFile(path.join(staticPath, 'index.html'));
  });
} else {
  // Clean 404 Handler for API only mode
  app.use((_req, res) => {
    res.status(404).json({ error: 'Endpoint not found.' });
  });
}

// Centralized Error Handling Middleware (Never exposes raw stack traces)
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Server Uncaught Error:', err);
  const status = err.status || 500;
  const message = err.message || 'An unexpected internal server error occurred.';
  res.status(status).json({
    error: message,
    statusCode: status,
    timestamp: new Date().toISOString(),
  });
});

// Server Initialization
async function startServer() {
  try {
    // 1. Initialize Database
    await getDB();

    // 2. Pre-seed demo data if empty
    await seedDemoData();

    // 3. Start Continuous Monitoring Background Worker
    startMonitoringWorker(CONFIG.workerIntervalMs);

    // 4. Start HTTP Server
    const server = app.listen(CONFIG.port, () => {
      console.log(`\n======================================================`);
      console.log(`  WEBSITE DOCTOR BACKEND API`);
      console.log(`  Live on: http://localhost:${CONFIG.port}`);
      console.log(`  API Routes: http://localhost:${CONFIG.port}/api`);
      console.log(`  Realtime Stream: http://localhost:${CONFIG.port}/api/events`);
      console.log(`======================================================\n`);
    });

    // Graceful Shutdown
    const gracefulShutdown = async () => {
      console.log('Shutting down Website Doctor cleanly...');
      await stopMonitoringWorker();
      server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);
  } catch (err: any) {
    console.error('Fatal startup error:', err);
    process.exit(1);
  }
}

startServer();
