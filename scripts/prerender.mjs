/**
 * Prerender: runs after `vite build` (see package.json). Renders every public page at build time and writes it
 * into dist, so crawlers, AI tools and non-JS clients get each page's headings, copy, links, title, description,
 * canonical, social tags and structured data in the HTML itself. In the browser the app still renders afresh
 * (src/main.tsx), so nothing a visitor sees changes.
 *
 *   dist/index.html            Home
 *   dist/about.html            /about        (served extensionless: cleanUrls in vercel.json)
 *   dist/work/<path>.html      each case study
 *   dist/404.html              unknown addresses, served with a real 404 status
 *   dist/sitemap.xml           every page above except the 404
 */
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'vite';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, 'dist');
const ssrOut = resolve(root, 'node_modules/.prerender');

await build({
  root,
  logLevel: 'warn',
  build: { ssr: 'src/entry-server.tsx', outDir: ssrOut, emptyOutDir: true, copyPublicDir: false },
});

const { render, pages, caseStudies, caseStudyPath, site } = await import(pathToFileURL(resolve(ssrOut, 'entry-server.js')).href);
const template = await readFile(resolve(dist, 'index.html'), 'utf8');

const attr = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const urlFor = (path) => site.url + (path === '/' ? '/' : path);
const person = { '@id': `${site.url}/#person` };
const ogImage = `${site.url}/og.png?v=2`;

/** Structured data for each page, on top of the Person block every page carries from index.html. */
function jsonLd(path, meta) {
  const url = urlFor(path);
  if (path === '/') {
    return [
      { '@context': 'https://schema.org', '@type': 'WebSite', '@id': `${site.url}/#website`, name: site.name, url, description: meta.description, author: person, inLanguage: 'en-AU' },
      {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Case studies',
        itemListElement: caseStudies.map((p, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: urlFor(caseStudyPath(p.slug)),
          name: `${p.title}: ${p.summary}`,
        })),
      },
    ];
  }
  if (path === '/about') {
    return [{ '@context': 'https://schema.org', '@type': 'ProfilePage', name: meta.title, url, description: meta.description, mainEntity: person, isPartOf: { '@id': `${site.url}/#website` } }];
  }
  const project = caseStudies.find((p) => caseStudyPath(p.slug) === path);
  if (!project) return [];
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      '@id': `${url}#case-study`,
      name: project.title,
      headline: `${project.title}: ${project.summary}`,
      description: meta.description,
      abstract: [project.gist.problem, project.gist.decision, project.gist.outcome].join(' '),
      url,
      image: ogImage,
      author: person,
      creator: person,
      genre: 'Product design case study',
      inLanguage: 'en-AU',
      isPartOf: { '@id': `${site.url}/#website` },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Work', item: `${site.url}/#work` },
        { '@type': 'ListItem', position: 2, name: project.title, item: url },
      ],
    },
  ];
}

function setTag(html, pattern, value, path) {
  if (!pattern.test(html)) throw new Error(`prerender ${path}: index.html is missing ${pattern}`);
  return html.replace(pattern, (_, before, after) => `${before}${attr(value)}${after}`);
}

function page(path, { html, meta }, { indexable }) {
  if (!meta) throw new Error(`prerender ${path}: the page never called usePageMeta`);
  const url = urlFor(path);
  let out = template;
  out = out.replace(/<title>[^<]*<\/title>/, `<title>${attr(meta.title)}</title>`);
  out = setTag(out, /(<meta name="description" content=")[^"]*(")/, meta.description, path);
  out = setTag(out, /(<meta name="robots" content=")[^"]*(")/, meta.noindex ? 'noindex, follow' : 'index, follow', path);
  out = setTag(out, /(<meta property="og:title" content=")[^"]*(")/, meta.title, path);
  out = setTag(out, /(<meta property="og:description" content=")[^"]*(")/, meta.description, path);
  out = setTag(out, /(<meta name="twitter:title" content=")[^"]*(")/, meta.title, path);
  out = setTag(out, /(<meta name="twitter:description" content=")[^"]*(")/, meta.description, path);
  if (indexable) {
    out = setTag(out, /(<meta property="og:url" content=")[^"]*(")/, url, path);
    out = setTag(out, /(<link rel="canonical" href=")[^"]*(")/, url, path);
    const blocks = jsonLd(path, meta).map((d) => `    <script type="application/ld+json" data-page-ld>${JSON.stringify(d).replace(/</g, '\\u003c')}</script>\n`);
    out = out.replace('  </head>', `${blocks.join('')}  </head>`);
  } else {
    // a 404 has no address of its own to point at
    out = out.replace(/\s*<link rel="canonical" href="[^"]*" \/>/, '').replace(/\s*<meta property="og:url" content="[^"]*" \/>/, '');
  }
  // the page itself goes into #root; the app's scripts carry on exactly as before
  if (!out.includes('<div id="root"></div>')) throw new Error('prerender: index.html has no empty <div id="root">');
  const body = html.replace(/<script\b[\s\S]*?<\/script>/g, '');
  return out.replace('<div id="root"></div>', `<div id="root" data-prerendered>${body}</div>`);
}

async function write(file, contents) {
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, contents);
}

for (const path of pages) {
  const rendered = await render(path);
  if (rendered.status !== 200) throw new Error(`prerender ${path}: status ${rendered.status}`);
  if (rendered.meta?.noindex) throw new Error(`prerender ${path}: a public page asked for noindex`);
  const file = path === '/' ? resolve(dist, 'index.html') : resolve(dist, `.${path}.html`);
  await write(file, page(path, rendered, { indexable: true }));
  console.log(`prerendered ${path} → ${file.slice(root.length + 1)}`);
}

await write(resolve(dist, '404.html'), page('/404', await render('/__not-found__'), { indexable: false }));
console.log('prerendered 404 → dist/404.html');

const today = new Date().toISOString().slice(0, 10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((p) => `  <url><loc>${urlFor(p)}</loc><lastmod>${today}</lastmod><priority>${p === '/' ? '1.0' : '0.8'}</priority></url>`).join('\n')}
</urlset>
`;
await write(resolve(dist, 'sitemap.xml'), sitemap);
console.log(`wrote dist/sitemap.xml (${pages.length} pages)`);

await rm(ssrOut, { recursive: true, force: true });
