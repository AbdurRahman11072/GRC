import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import next from 'next';
import { envConfig } from './app/config/envConfig';
import { RootRoutes } from './app/routes';
import { HealthRoutes } from './app/routes/health.routes';
import globalErrorHandler from './app/middleware/globalErrorHandler';
import { prisma } from './lib/prisma';

const dev = envConfig.NODE_ENV !== 'production';
const nextApp = next({
  dev,
  dir: process.cwd(),
});
const handle = nextApp.getRequestHandler();
const port = envConfig.PORT || 5000;

nextApp
  .prepare()
  .then(async () => {
    const app = express();

    app.set('trust proxy', 1);

    // Security & utility middlewares
    app.use(
      cors({
        origin: (origin, callback) => {
          if (!origin) return callback(null, true);
          return callback(null, origin);
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With', 'Accept'],
        exposedHeaders: ['Set-Cookie'],
      })
    );

    app.use(
      helmet({
        contentSecurityPolicy: false, // Let Next.js handle CSP for its scripts & styles
      })
    );

    app.use(cookieParser(envConfig.COOKIE_SECRET));
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true }));

    // Health check endpoints
    app.use('/health', HealthRoutes);
    app.use('/api/health', HealthRoutes);

    // Express API Routes - BEFORE Next.js handler
    app.use('/api/v1', RootRoutes);

    // Next.js handler for all frontend pages and SSR routes (must be after API routes)
    app.use((req: Request, res: Response) => {
      return handle(req, res);
    });

    // Global Error Handler for API errors
    app.use(globalErrorHandler);

    const httpServer = app.listen(port, () => {
      console.log(`[Zio Tech GRC] Hybrid server running on http://localhost:${port}`);
      console.log(`[Zio Tech GRC] API Root: http://localhost:${port}/api/v1`);
      console.log(`[Zio Tech GRC] Health check: http://localhost:${port}/health`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n[Zio Tech GRC] ${signal} received. Shutting down gracefully...`);
      httpServer.close(async () => {
        try {
          await prisma.$disconnect();
          console.log('[Zio Tech GRC] Database connection closed.');
        } catch (_e) {}
        process.exit(0);
      });

      setTimeout(() => {
        console.error('[Zio Tech GRC] Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  })
  .catch(async (err) => {
    console.error('[Zio Tech GRC] Error starting hybrid server:', err);
    try {
      await prisma.$disconnect();
    } catch (_e) {}
    process.exit(1);
  });
