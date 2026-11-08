import { ToolSeoInfo, generateSchemaJsonLd, TOOLS_SEO_REGISTRY, SITE_BASE_URL } from '../data/seoToolsData.ts';
import { TOOLS_RICH_CONTENT, ToolArticleContent } from '../data/seoToolsContent.ts';

/**
 * Injects tool-specific SEO tags into the base index.html template,
 * generating a full, crawlable semantic article inside #root for search engine crawlers.
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

  // 3. Ensure robots meta tag with full indexing directives
  if (!html.includes('name="robots"')) {
    html = html.replace(
      /<\/head>/i,
      `    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />\n  </head>`
    );
  }

  // 4. Replace Canonical URL (Must strictly match tool.canonicalUrl without trailing slash)
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

  // 8. If this is a tool page, inject real, meaningful, crawlable tool content inside #root
  if (!isHome) {
    const rich = TOOLS_RICH_CONTENT[tool.slug] || getDefaultRichContent(tool);
    const semanticToolHtml = renderCrawlableToolPage(tool, rich);

    // Replace the default #root loading placeholder with full crawlable content
    html = html.replace(
      /<div id="root">[\s\S]*?<\/div>\s*<\/div>/i,
      `<div id="root">\n${semanticToolHtml}\n    </div>`
    );
  }

  return html;
}

/**
 * Builds rich, semantic HTML containing actual tool content, instructions, features, FAQs, and links
 */
function renderCrawlableToolPage(tool: ToolSeoInfo, rich: ToolArticleContent): string {
  const relatedToolsHtml = rich.relatedSlugs
    .map((rSlug) => {
      const rTool = TOOLS_SEO_REGISTRY[rSlug];
      if (!rTool) return '';
      return `
        <li style="margin-bottom: 8px;">
          <a href="/tools/${rSlug}" style="color: #4338ca; text-decoration: none; font-weight: 600; display: inline-flex; align-items: center; gap: 6px;">
            <span style="color: #6366f1;">➔</span> ${escapeHtml(rTool.title)}
          </a>
        </li>`;
    })
    .join('');

  const featuresListHtml = rich.features
    .map(
      (f) =>
        `<li style="margin-bottom: 8px; line-height: 1.6; color: #334155; display: flex; align-items: flex-start; gap: 8px;"><span style="color: #10b981; font-weight: bold;">✓</span> <span>${escapeHtml(f)}</span></li>`
    )
    .join('');

  const howToStepsHtml = rich.howToUseSteps
    .map(
      (s, idx) =>
        `<li style="margin-bottom: 10px; line-height: 1.6; color: #334155;"><strong>ধাপ ${idx + 1}:</strong> ${escapeHtml(s)}</li>`
    )
    .join('');

  const audienceHtml = rich.targetAudience
    .map(
      (a) =>
        `<span style="display: inline-block; background-color: #f1f5f9; color: #475569; font-size: 13px; font-weight: 600; padding: 4px 12px; border-radius: 9999px; margin: 4px 6px 4px 0; border: 1px solid #e2e8f0;">${escapeHtml(a)}</span>`
    )
    .join('');

  const faqsHtml = rich.faqs
    .map(
      (faq) => `
      <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 20px; margin-bottom: 12px;">
        <h3 style="font-size: 16px; font-weight: 700; color: #0f172a; margin: 0 0 6px 0;">Q: ${escapeHtml(faq.q)}</h3>
        <p style="font-size: 14px; color: #475569; margin: 0; line-height: 1.6;">A: ${escapeHtml(faq.a)}</p>
      </div>`
    )
    .join('');

  return `
      <!-- Crawlable Semantic Tool Page (Rendered for Googlebot, users & screen readers; hydrated by React) -->
      <div style="min-height: 100vh; background-color: #f8fafc; font-family: 'Hind Siliguri', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0f172a;">
        <!-- Top Navigation Bar -->
        <header style="background-color: #ffffff; border-bottom: 1px solid #e2e8f0; padding: 12px 20px; position: sticky; top: 0; z-index: 40; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <div style="max-width: 1024px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
            <a href="/" style="display: flex; align-items: center; gap: 10px; text-decoration: none; color: inherit;">
              <img src="/logo.png" alt="MoSaFa Tools Logo" style="width: 40px; height: 40px; object-fit: contain; border-radius: 10px;" />
              <div>
                <span style="font-size: 18px; font-weight: 800; color: #0f172a; display: block; line-height: 1.2;">MoSaFa Tools</span>
                <span style="font-size: 11px; color: #64748b; font-weight: 500;">অনলাইন সেবার দারুণ প্ল্যাটফর্ম</span>
              </div>
            </a>
            <nav style="display: flex; align-items: center; gap: 16px;">
              <a href="/" style="font-size: 14px; font-weight: 600; color: #4338ca; text-decoration: none; display: flex; align-items: center; gap: 4px;">
                <span>←</span> সকল টুলস দেখুন
              </a>
            </nav>
          </div>
        </header>

        <!-- Breadcrumb Navigation -->
        <nav aria-label="Breadcrumb" style="max-width: 1024px; margin: 16px auto 0; padding: 0 20px; font-size: 13px; color: #64748b;">
          <a href="/" style="color: #64748b; text-decoration: none;">হোম</a>
          <span style="margin: 0 6px;">/</span>
          <a href="/" style="color: #64748b; text-decoration: none;">টুলস</a>
          <span style="margin: 0 6px;">/</span>
          <span style="color: #0f172a; font-weight: 600;">${escapeHtml(tool.title.split('–')[0].trim())}</span>
        </nav>

        <!-- Main Content Area -->
        <main style="max-width: 1024px; margin: 20px auto 40px; padding: 0 20px;">
          <!-- Hero Section -->
          <article style="background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; padding: 28px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); margin-bottom: 28px;">
            <div style="display: inline-block; background-color: #e0e7ff; color: #4338ca; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; margin-bottom: 12px;">
              ${escapeHtml(rich.categoryBadge || tool.category)}
            </div>

            <h1 style="font-size: 26px; font-weight: 800; color: #0f172a; margin: 0 0 14px 0; line-height: 1.35;">
              ${escapeHtml(tool.h1)}
            </h1>

            <p style="font-size: 16px; color: #334155; line-height: 1.7; margin: 0 0 16px 0; font-weight: 400;">
              ${escapeHtml(tool.description)}
            </p>

            ${rich.summary.map((para) => `<p style="font-size: 15px; color: #475569; line-height: 1.7; margin: 0 0 14px 0;">${escapeHtml(para)}</p>`).join('')}

            <!-- Direct Action Button -->
            <div style="margin: 24px 0 12px 0; padding: 18px 20px; background: linear-gradient(135deg, #eef2ff 0%, #faf5ff 100%); border: 1px solid #c7d2fe; border-radius: 14px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px;">
              <div>
                <strong style="display: block; font-size: 16px; color: #1e1b4b;">অনলাইনে এখনই সরাসরি ব্যবহার করুন</strong>
                <span style="font-size: 13px; color: #4338ca;">কোনো ইনস্টলেশন বা রেজিস্ট্রেশন ছাড়াই ১০০% ফ্রি</span>
              </div>
              <a href="${tool.path}" style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff; font-size: 15px; font-weight: 700; padding: 10px 24px; border-radius: 10px; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.35);">
                ⚡ টুল শুরু করুন
              </a>
            </div>
          </article>

          <!-- Grid: Features & Instructions -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; margin-bottom: 28px;">
            <!-- Key Features -->
            <section style="background-color: #ffffff; border-radius: 18px; border: 1px solid #e2e8f0; padding: 24px; box-shadow: 0 2px 4px rgba(0,0,0,0.03);">
              <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin: 0 0 16px 0; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                <span>✨</span> প্রধান বৈশিষ্ট্য ও সুবিধাসমূহ
              </h2>
              <ul style="list-style: none; padding: 0; margin: 0;">
                ${featuresListHtml}
              </ul>
            </section>

            <!-- How to Use -->
            <section style="background-color: #ffffff; border-radius: 18px; border: 1px solid #e2e8f0; padding: 24px; box-shadow: 0 2px 4px rgba(0,0,0,0.03);">
              <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin: 0 0 16px 0; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                <span>📋</span> কীভাবে ব্যবহার করবেন (ধাপে ধাপে গাইড)
              </h2>
              <ol style="padding-left: 20px; margin: 0;">
                ${howToStepsHtml}
              </ol>
            </section>
          </div>

          <!-- Target Audience -->
          <section style="background-color: #ffffff; border-radius: 18px; border: 1px solid #e2e8f0; padding: 22px 24px; margin-bottom: 28px;">
            <h2 style="font-size: 17px; font-weight: 700; color: #0f172a; margin: 0 0 12px 0;">
              👥 কাদের জন্য এই টুলটি প্রযোজ্য ও উপকারী
            </h2>
            <div>${audienceHtml}</div>
          </section>

          <!-- FAQs Section -->
          <section style="margin-bottom: 28px;">
            <h2 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 16px 0;">
              ❓ সচরাচর জিজ্ঞাসিত প্রশ্নাবলী (FAQ)
            </h2>
            ${faqsHtml}
          </section>

          <!-- Related Tools Cross Linking -->
          <section style="background-color: #ffffff; border-radius: 18px; border: 1px solid #e2e8f0; padding: 22px 24px;">
            <h2 style="font-size: 17px; font-weight: 700; color: #0f172a; margin: 0 0 14px 0;">
              🔗 MoSaFa Tools-এর অন্যান্য জনপ্রিয় টুলস
            </h2>
            <ul style="list-style: none; padding: 0; margin: 0;">
              ${relatedToolsHtml}
            </ul>
          </section>
        </main>

        <!-- Footer -->
        <footer style="background-color: #ffffff; border-top: 1px solid #e2e8f0; padding: 24px; text-align: center; font-size: 13px; color: #64748b;">
          <p style="margin: 0 0 6px 0;">© 2026 <strong>MoSaFa Tools</strong>. সকল অধিকার সংরক্ষিত।</p>
          <p style="margin: 0;">অনলাইন সেবার দারুণ প্ল্যাটফর্ম — ভিজিট করুন <a href="/" style="color: #4338ca; text-decoration: underline;">tools.mosafabd.com</a></p>
        </footer>
      </div>`;
}

function getDefaultRichContent(tool: ToolSeoInfo): ToolArticleContent {
  return {
    slug: tool.slug,
    headline: tool.title,
    summary: [tool.description],
    categoryBadge: tool.category,
    features: [
      '১০০% বিনামূল্যে অনলাইনে ব্যবহারের সুবিধা',
      'কম্পিউটার ও মোবাইল উভয় ডিভাইসে উপযোগী',
      'কোনো সফটওয়্যার ইনস্টল ছাড়াই সরাসরি ব্রাউজারে ব্যবহার্য',
      'তাত্ক্ষণিক ও নির্ভরযোগ্য ফলাফল',
    ],
    howToUseSteps: [
      'টুল পেজে প্রবেশ করুন।',
      'প্রয়োজনীয় তথ্য ইনপুট বক্সে প্রদান করুন।',
      'অ্যাকশন বাটনে ক্লিক করে ফলাফল দেখুন ও ডাউনলোড করুন।',
    ],
    targetAudience: ['শিক্ষার্থী', 'পেশাজীবী', 'সাধারণ নাগরিক', 'অনলাইন ব্যবহারকারী'],
    faqs: [
      {
        q: 'এই টুলটি কি সম্পূর্ণ বিনামূল্যে ব্যবহার করা যায়?',
        a: 'হ্যাঁ, MoSaFa Tools-এর সকল সেবা ব্যবহারকারীদের জন্য সম্পূর্ণ ফ্রি।',
      },
    ],
    relatedSlugs: ['studymate-bd', 'bd-online-portal', 'typing-test', 'all-form-fillup'],
  };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
