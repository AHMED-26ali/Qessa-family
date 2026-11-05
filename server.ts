import express from 'express';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import videosHandler from './api/videos.js';
import refreshHandler from './api/refresh.js';
import sitemapHandler from './api/sitemap.js';

try {
  process.loadEnvFile?.();
} catch {}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // Mount API endpoints
  app.all('/api/videos', (req, res) => {
    videosHandler(req, res);
  });

  app.all('/api/refresh', (req, res) => {
    refreshHandler(req, res);
  });

  app.get('/api/sitemap.xml', (req, res) => {
    sitemapHandler(req, res);
  });
  app.get('/sitemap.xml', (req, res) => {
    sitemapHandler(req, res);
  });

  if (!isProd) {
    // Development mode: Mount Vite dev server middleware
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
    // Production mode: Serve built dist assets
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`[Qessa Family] Server listening on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
