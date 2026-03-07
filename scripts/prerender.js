/**
 * Prerender script — generates static HTML for all routes.
 *
 * 1. Starts a local server serving the built SPA from dist/
 * 2. Puppeteer visits each route, waits for render, captures HTML
 * 3. Saves each as a standalone .html file in dist/
 * 4. Cloudflare Pages serves the static HTML to bots/crawlers
 *
 * Run after `vite build`: node scripts/prerender.js
 */

import { launch } from 'puppeteer';
import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, '..', 'dist');
const PORT = 4173;

// All routes to prerender
const ROUTES = [
  '/',
  '/models',
  '/network',
  '/whitepaper',
  '/about',
  '/ecosystem',
  '/economic-impact',
  '/governance',
  '/community',
  '/essays',
  '/essays/the-wealth-of-bodies',
  '/essays/the-guardian-network',
  '/learn',
  '/learn/why-verify',
  '/learn/how-we-test',
  '/learn/the-score',
  '/learn/data-splits',
  '/learn/privacy-attacks',
  '/learn/data-format',
  '/learn/certification-tiers',
  '/learn/neurips-competition',
  '/learn/verify-yourself',
  '/verify',
  '/verify/eeg-consciousness',
  '/verify/t2d-metabolomics',
  '/verify/raman-disease',
  '/verify/audio-respiratory',
  '/verify/mental-health',
  '/verify/haven-crisis',
  '/proof-pipeline',
  '/docs',
  '/apps',
  '/apps/crisis-screening',
  '/apps/breathe-screen',
  '/apps/neuro-monitor',
  '/apps/voice-parkinson',
  '/apps/t2d-screening',
  '/apps/covid-raman',
  '/exchange',
];

// Simple static file server for dist/
function startServer() {
  return new Promise((resolve) => {
    const mimeTypes = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.svg': 'image/svg+xml',
      '.woff2': 'font/woff2',
    };

    const server = createServer(async (req, res) => {
      let filePath = join(DIST, req.url === '/' ? 'index.html' : req.url);

      try {
        const data = await readFile(filePath);
        const ext = '.' + filePath.split('.').pop();
        res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
        res.end(data);
      } catch {
        // SPA fallback — serve index.html for all routes
        try {
          const data = await readFile(join(DIST, 'index.html'));
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(data);
        } catch {
          res.writeHead(404);
          res.end('Not found');
        }
      }
    });

    server.listen(PORT, () => {
      console.log(`  Static server on http://localhost:${PORT}`);
      resolve(server);
    });
  });
}

async function prerender() {
  console.log(`\nPrerendering ${ROUTES.length} routes...\n`);

  const server = await startServer();
  const browser = await launch({ headless: true, args: ['--no-sandbox'] });

  let success = 0;
  let failed = 0;

  for (const route of ROUTES) {
    try {
      const page = await browser.newPage();

      // Block only WebSocket connections (they hang forever waiting)
      // Allow HTTP fetches to external APIs so pages render with data
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        const url = req.url();
        if (url.startsWith('ws://') || url.startsWith('wss://')) {
          req.abort();
        } else {
          req.continue();
        }
      });

      // Stub out Magic SDK before page loads — it hangs in headless
      await page.evaluateOnNewDocument(() => {
        // Mock localStorage to prevent auth checks from hanging
        window.__PRERENDER = true;
      });

      await page.goto(`http://localhost:${PORT}${route}`, {
        waitUntil: 'domcontentloaded',
        timeout: 20000,
      });

      // Wait for React to mount and pass the loading screen.
      // Poll until we see actual content (not the loading spinner).
      await page.waitForFunction(() => {
        const root = document.getElementById('root');
        if (!root) return false;
        const text = root.textContent || '';
        // Loading screen says "Loading ParagonDAO..."
        if (text.includes('Loading ParagonDAO')) return false;
        // Must have some real content
        return text.length > 100;
      }, { timeout: 15000 }).catch(() => {
        // If it times out, we still capture whatever rendered
      });

      // Extra settle time for animations/effects
      await page.evaluate(() => new Promise(r => setTimeout(r, 1000)));

      // Get the full rendered HTML
      const html = await page.content();

      // Determine output path
      let outPath;
      if (route === '/') {
        outPath = join(DIST, 'index.html');
      } else {
        // /network -> /network/index.html (clean URLs)
        outPath = join(DIST, route, 'index.html');
      }

      await mkdir(dirname(outPath), { recursive: true });
      await writeFile(outPath, html, 'utf-8');

      const sizeKB = (Buffer.byteLength(html) / 1024).toFixed(1);
      console.log(`  ✓ ${route.padEnd(35)} ${sizeKB} KB`);
      success++;

      await page.close();
    } catch (err) {
      console.log(`  ✗ ${route.padEnd(35)} ${err.message}`);
      failed++;
    }
  }

  await browser.close();
  server.close();

  console.log(`\nDone: ${success} succeeded, ${failed} failed out of ${ROUTES.length} routes.\n`);
}

prerender().catch((err) => {
  console.error('Prerender failed:', err);
  process.exit(1);
});
