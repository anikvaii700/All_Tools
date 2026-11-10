import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getAllSeoTools, HOMEPAGE_SEO } from '../src/data/seoToolsData.ts';
import { injectSeoTagsIntoHtml } from '../src/utils/seoHtmlRenderer.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');
const indexHtmlPath = path.resolve(distDir, 'index.html');

async function generateSeoPages() {
  console.log('[SEO Generator] Starting static HTML generation for all 26 tools...');

  if (!fs.existsSync(indexHtmlPath)) {
    console.error('[SEO Generator] dist/index.html not found! Run vite build first.');
    process.exit(1);
  }

  const baseHtml = fs.readFileSync(indexHtmlPath, 'utf-8');
  const tools = getAllSeoTools();

  // Ensure dist/tools directory exists
  const toolsDir = path.resolve(distDir, 'tools');
  if (!fs.existsSync(toolsDir)) {
    fs.mkdirSync(toolsDir, { recursive: true });
  }

  let generatedCount = 0;

  for (const tool of tools) {
    const toolHtml = injectSeoTagsIntoHtml(baseHtml, tool);

    // 1. Write dist/tools/[slug]/index.html (directory style)
    const toolSubDir = path.resolve(toolsDir, tool.slug);
    if (!fs.existsSync(toolSubDir)) {
      fs.mkdirSync(toolSubDir, { recursive: true });
    }
    fs.writeFileSync(path.resolve(toolSubDir, 'index.html'), toolHtml, 'utf-8');

    // 2. Also write dist/tools/[slug].html (clean URL style)
    fs.writeFileSync(path.resolve(toolsDir, `${tool.slug}.html`), toolHtml, 'utf-8');

    // 3. For legal and trust pages, also write at root level: dist/[slug].html and dist/[slug]/index.html
    if (['about', 'contact', 'privacy', 'terms'].includes(tool.slug)) {
      const rootLegalDir = path.resolve(distDir, tool.slug);
      if (!fs.existsSync(rootLegalDir)) {
        fs.mkdirSync(rootLegalDir, { recursive: true });
      }
      fs.writeFileSync(path.resolve(rootLegalDir, 'index.html'), toolHtml, 'utf-8');
      fs.writeFileSync(path.resolve(distDir, `${tool.slug}.html`), toolHtml, 'utf-8');
    }

    generatedCount++;
    console.log(`  ✓ Generated: ${tool.path} -> "${tool.title}"`);
  }

  // Ensure sitemap.xml and robots.txt are in dist
  const publicSitemap = path.resolve(rootDir, 'public', 'sitemap.xml');
  const distSitemap = path.resolve(distDir, 'sitemap.xml');
  if (fs.existsSync(publicSitemap)) {
    fs.copyFileSync(publicSitemap, distSitemap);
    console.log('  ✓ Copied: sitemap.xml to dist/');
  }

  const publicRobots = path.resolve(rootDir, 'public', 'robots.txt');
  const distRobots = path.resolve(distDir, 'robots.txt');
  if (fs.existsSync(publicRobots)) {
    fs.copyFileSync(publicRobots, distRobots);
    console.log('  ✓ Copied: robots.txt to dist/');
  }

  console.log(`[SEO Generator] Successfully generated ${generatedCount} tool pages + homepage + sitemap.xml!`);
}

generateSeoPages().catch((err) => {
  console.error('[SEO Generator] Error:', err);
  process.exit(1);
});
