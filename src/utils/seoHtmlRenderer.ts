import { ToolSeoInfo, HOMEPAGE_SEO, generateSchemaJsonLd } from '../data/seoToolsData.ts';

/**
 * Injects tool-specific SEO tags into the base index.html template
 */
export function injectSeoTagsIntoHtml(rawHtml: string, tool: ToolSeoInfo): string {
  let html = rawHtml;
  const isHome = tool.id === 'home';

  // 1. Replace <title>
  html = html.replace(
    /<title>.*?<\/title>/i,
    `<title>${escapeHtml(tool.title)}</title>`
  );

  // 2. Replace meta description
  html = html.replace(
    /<meta\s+name="description"\s+content=".*?"\s*\/?>/i,
    `<meta name="description" content="${escapeHtml(tool.description)}" />`
  );

  // 3. Ensure robots meta tag
  if (!html.includes('name="robots"')) {
    html = html.replace(
      /<\/head>/i,
      `    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />\n  </head>`
    );
  }

  // 4. Replace Canonical URL
  html = html.replace(
    /<link\s+rel="canonical"\s+href=".*?"\s*\/?>/i,
    `<link rel="canonical" href="${tool.canonicalUrl}" />`
  );

  // 5. Replace Open Graph tags
  html = html.replace(
    /<meta\s+property="og:title"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:title" content="${escapeHtml(tool.title)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:description"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:description" content="${escapeHtml(tool.description)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:url"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:url" content="${tool.canonicalUrl}" />`
  );

  // 6. Replace Twitter tags
  html = html.replace(
    /<meta\s+name="twitter:title"\s+content=".*?"\s*\/?>/i,
    `<meta name="twitter:title" content="${escapeHtml(tool.title)}" />`
  );
  html = html.replace(
    /<meta\s+name="twitter:description"\s+content=".*?"\s*\/?>/i,
    `<meta name="twitter:description" content="${escapeHtml(tool.description)}" />`
  );

  // 7. Inject structured data (JSON-LD)
  const schemaJson = JSON.stringify(generateSchemaJsonLd(tool), null, 2);
  html = html.replace(
    /<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/i,
    `<script type="application/ld+json">\n${schemaJson}\n    </script>`
  );

  // 8. If this is a tool page, inject semantic H1 and description inside #root initial shell
  if (!isHome) {
    const semanticFallback = `
    <div id="root">
      <div style="min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: 'Hind Siliguri', -apple-system, sans-serif; background-color: #f8fafc; color: #1e293b; padding: 24px; text-align: center;">
        <div style="width: 72px; height: 72px; border-radius: 22px; background: #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 25px -5px rgba(79, 70, 229, 0.25); border: 1px solid #f1f5f9; margin-bottom: 16px; overflow: hidden; padding: 2px;">
          <img src="/logo.png" alt="${escapeHtml(tool.title)}" style="width: 100%; height: 100%; object-fit: contain;" />
        </div>
        <h1 style="font-size: 22px; sm:font-size: 26px; font-weight: 800; color: #0f172a; margin: 0 0 10px 0; max-width: 680px; line-height: 1.3;">${escapeHtml(tool.h1)}</h1>
        <p style="font-size: 14px; color: #475569; max-width: 640px; margin: 0 0 20px 0; line-height: 1.6;">${escapeHtml(tool.description)}</p>
        <p style="font-size: 13px; color: #64748b; margin: 0 0 18px 0;">
          <a href="/" style="color: #4f46e5; text-decoration: underline; font-weight: 600;">← MoSaFa Tools সকল টুলস দেখুন</a>
        </p>
        <div style="width: 32px; height: 32px; border: 3.5px solid #e2e8f0; border-top-color: #4f46e5; border-radius: 50%; animation: mosafa-spin 0.75s linear infinite;"></div>
        <style>@keyframes mosafa-spin { to { transform: rotate(360deg); } }</style>
      </div>
    </div>`;

    html = html.replace(/<div id="root">[\s\S]*?<\/div>\s*<\/div>/i, semanticFallback);
  }

  return html;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
