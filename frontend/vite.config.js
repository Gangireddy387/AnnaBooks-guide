import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { defineConfig } from 'vite';
import { contentFiles } from './scripts/content.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const contentModule = pathToFileURL(path.join(root, 'scripts/content.mjs')).href;
const site = path.join(root, 'public');
const load = () => import(`${contentModule}?t=${Date.now()}`);

function annabooksGuide() {
  let isBuild = false;
  let outDir = path.join(root, 'dist');
  return {
    name: 'annabooks-guide',
    configResolved(config) {
      isBuild = config.command === 'build';
      outDir = path.resolve(root, config.build.outDir);
    },
    transformIndexHtml: {
      order: 'pre',
      async handler(template, ctx) {
        const { buildGuide, fillTemplate, checkSite, pageIdForUrl, HOME_ID } = await load();
        const guide = buildGuide(root);
        const issues = checkSite(template, guide, site);
        if (issues.length) {
          const msg = `Guide check found ${issues.length} problem(s):\n  ${issues.slice(0, 40).join('\n  ')}`;
          if (isBuild) throw new Error(msg);
          console.warn(msg);
        }
        const id = isBuild ? HOME_ID : pageIdForUrl(guide, ctx.originalUrl);
        if (isBuild) console.log(`[guide] ${guide.stats.pages} pages: ${guide.stats.parts} parts, ${guide.stats.sections} sections, ${guide.stats.images} screenshots, ${guide.stats.videos} videos`);
        return fillTemplate(template, guide, id);
      },
    },
    configureServer(server) {
      for (const f of [...contentFiles(root), path.join(root, 'scripts/content.mjs')]) server.watcher.add(f);
      server.watcher.on('change', (file) => {
        const f = file.replace(/\\/g, '/');
        if (f.includes('/content/') || f.endsWith('/scripts/content.mjs')) server.ws.send({ type: 'full-reload' });
      });
      server.middlewares.use(async (req, res, next) => {
        const url = (req.url || '').split('?')[0];
        if (url !== '/search-index.json' && url !== '/sitemap.xml') return next();
        const { buildGuide } = await load();
        const guide = buildGuide(root);
        res.setHeader('Content-Type', url.endsWith('.json') ? 'application/json' : 'application/xml');
        res.end(url.endsWith('.json') ? JSON.stringify(guide.searchIndex) : guide.sitemap);
      });
    },
    async writeBundle() {
      const { buildGuide, fillTemplate, stripMarkers, urlFor } = await load();
      const guide = buildGuide(root);
      const indexFile = path.join(outDir, 'index.html');
      const built = fs.readFileSync(indexFile, 'utf8');
      for (const p of guide.pages) {
        const file = p.kind === 'notfound' ? path.join(outDir, '404.html') : path.join(outDir, urlFor(p.id).slice(1), 'index.html');
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, stripMarkers(fillTemplate(built, guide, p.id)));
      }
      fs.writeFileSync(path.join(outDir, 'search-index.json'), JSON.stringify(guide.searchIndex));
      fs.writeFileSync(path.join(outDir, 'sitemap.xml'), guide.sitemap);
      console.log(`[guide] wrote ${guide.pages.length} pages, search-index.json and sitemap.xml`);
    },
  };
}

export default defineConfig({
  plugins: [annabooksGuide()],
  appType: 'spa',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    assetsInlineLimit: 0,
    cssCodeSplit: false,
    target: 'es2019',
  },
  server: { port: 5175, open: false },
  preview: { port: 4173 },
});
