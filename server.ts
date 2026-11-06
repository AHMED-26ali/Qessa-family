
import express from 'express';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

import videosHandler from './api/videos.js';
import refreshHandler from './api/refresh.js';
import sitemapHandler from './api/sitemap.js';

// Load local environment variables when supported.
try {
  process.loadEnvFile?.();
} catch {
  // Vercel provides environment variables automatically.
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();

  const port = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.disable('x-powered-by');

  app.use(express.json());

  // ==========================================
  // YouTube Videos API
  // ==========================================

  app.all('/api/videos', (req, res, next) => {
    Promise.resolve(videosHandler(req, res)).catch(next);
  });

  // ==========================================
  // Manual YouTube Refresh API
  // ==========================================

  app.all('/api/refresh', (req, res, next) => {
    Promise.resolve(refreshHandler(req, res)).catch(next);
  });

  // ==========================================
  // Video Sitemap
  // ==========================================

  app.get('/api/sitemap.xml', (req, res, next) => {
    Promise.resolve(sitemapHandler(req, res)).catch(next);
  });

  app.get('/sitemap.xml', (req, res, next) => {
    Promise.resolve(sitemapHandler(req, res)).catch(next);
  });

  // Never return the website HTML for missing API routes.
  app.use('/api', (_req, res) => {
    res.status(404).json({
      success: false,
      error: 'API endpoint not found',
    });
  });

  // ==========================================
  // Development Server
  // ==========================================

  if (!isProd) {
    const { createServer } = await import('vite');

    const vite = await createServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port,
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    // ==========================================
    // Production Static Files
    // ==========================================

    const distPath = path.resolve(__dirname, 'dist');
    const indexPath = path.join(distPath, 'index.html');

    if (fs.existsSync(indexPath)) {
      app.use(express.static(distPath));

      // Express 5-compatible SPA fallback.
      // Keeps React client-side routes working.
      app.get('/{*splat}', (_req, res) => {
        res.sendFile(indexPath);
      });
    } else {
      console.error(
        '[Qessa Family] Production build not found:',
        indexPath
      );

      app.get('/{*splat}', (_req, res) => {
        res.status(503).json({
          success: false,
          message: 'ملفات الموقع غير متاحة. يرجى مراجعة عملية البناء.',
        });
      });
    }
  }

  // ==========================================
  // Global Error Handler
  // ==========================================

  app.use((
    error: unknown,
    _req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error('[Qessa Family] Server error:', error);

    if (res.headersSent) {
      return next(error);
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'حدث خطأ أثناء معالجة الطلب.',
    });
  });

  // ==========================================
  // Start Local Express Server
  // ==========================================

  app.listen(port, '0.0.0.0', () => {
    console.log(
      `[Qessa Family] Server running at http://0.0.0.0:${port}`
    );
  });
}

startServer().catch((error) => {
  console.error(
    '[Qessa Family] Failed to start server:',
    error
  );

  process.exit(1);
});
