// Writes one HTML file per route (routes/*.html) from index.html, each with its own
// title, description, canonical URL and social-preview tags, and with that page already
// marked active. Link previews (LinkedIn, X, WhatsApp) and crawlers that don't run
// JavaScript then see the right page. vercel.json rewrites each route to its file.
//
// It also writes 404.html, which Vercel serves with a real 404 status for unknown URLs.
//
// The page metadata is read from script.js (DEFAULT_META, PAGE_META, BLOG_POSTS), so
// there is one source of truth. Run after editing index.html or that metadata:
//   node scripts/build-pages.mjs
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'routes');
const STATIC_ROUTES = ['projects', 'blogs', 'contact'];

/** Returns the source text of `const NAME = ...;` from script.js, matching braces. */
function extractConst(source, name) {
  const start = source.indexOf(`const ${name} =`);
  if (start < 0) throw new Error(`script.js: could not find "const ${name} ="`);
  const open = source.indexOf('{', start);
  const lineEnd = source.indexOf('\n', start);
  if (open < 0 || open > lineEnd) {
    return source.slice(start, source.indexOf(';', start) + 1); // a plain value such as a string
  }
  let depth = 0;
  for (let i = open; i < source.length; i++) {
    if (source[i] === '{') depth++;
    else if (source[i] === '}' && --depth === 0) return source.slice(start, i + 1) + ';';
  }
  throw new Error(`script.js: unbalanced braces in ${name}`);
}

function loadMetadata(scriptSource) {
  const names = ['SITE_BASE_URL', 'BLOG_POSTS', 'DEFAULT_META', 'PAGE_META'];
  const code = names.map(n => extractConst(scriptSource, n)).join('\n') + `\nreturn { ${names.join(', ')} };`;
  return new Function(code)();
}

const escapeAttr = value => String(value)
  .replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Replaces the content of one meta/link tag; fails loudly if the tag is missing. */
function setTag(html, pattern, value, label) {
  if (!pattern.test(html)) throw new Error(`index.html: missing ${label}`);
  return html.replace(pattern, (_, before, after) => before + escapeAttr(value) + after);
}

function applyMeta(html, meta) {
  const metaTag = (attr, key) => new RegExp(`(<meta\\s+${attr}="${key}"\\s+content=")[^"]*(")`);
  let out = html;
  out = setTag(out, /(<title>)[^<]*(<\/title>)/, meta.title, '<title>');
  out = setTag(out, metaTag('name', 'title'), meta.title, 'meta title');
  out = setTag(out, metaTag('name', 'description'), meta.description, 'meta description');
  out = setTag(out, /(<link\s+rel="canonical"\s+href=")[^"]*(")/, meta.url, 'canonical link');
  out = setTag(out, metaTag('property', 'og:type'), meta.type, 'og:type');
  out = setTag(out, metaTag('property', 'og:url'), meta.url, 'og:url');
  out = setTag(out, metaTag('property', 'og:title'), meta.title, 'og:title');
  out = setTag(out, metaTag('property', 'og:description'), meta.description, 'og:description');
  out = setTag(out, metaTag('property', 'twitter:url'), meta.url, 'twitter:url');
  out = setTag(out, metaTag('property', 'twitter:title'), meta.title, 'twitter:title');
  out = setTag(out, metaTag('property', 'twitter:description'), meta.description, 'twitter:description');
  return out;
}

function setActivePage(html, pageId) {
  const home = '<div id="page-home" class="page active">';
  if (!html.includes(home)) throw new Error('index.html: home page is not the active page');
  const target = new RegExp(`(<div id="page-${pageId}" class="page)([^"]*")`);
  if (!target.test(html)) throw new Error(`index.html: missing <div id="page-${pageId}">`);
  return html.replace(home, '<div id="page-home" class="page">').replace(target, '$1 active$2');
}

/** The active page's title becomes the one <h1>; the home hero name drops to <h2>. */
function setMainHeading(html, pageId) {
  const hero = /<h1 class="hero-name">([\s\S]*?)<\/h1>/;
  if (!hero.test(html)) throw new Error('index.html: missing <h1 class="hero-name">');
  const out = html.replace(hero, '<h2 class="hero-name">$1</h2>');
  const pageStart = out.indexOf(`<div id="page-${pageId}"`);
  const title = /<h2(\s[^>]*class="page-title"[^>]*)>([\s\S]*?)<\/h2>/g;
  title.lastIndex = pageStart;
  const match = title.exec(out);
  if (!match) throw new Error(`index.html: page-${pageId} has no .page-title heading`);
  return out.slice(0, match.index) + `<h1${match[1]}>${match[2]}</h1>` + out.slice(match.index + match[0].length);
}

/** Every generated route needs an exact rewrite in vercel.json, or Vercel would 404 it. */
function checkRewrites(routes) {
  const config = JSON.parse(readFileSync(join(ROOT, 'vercel.json'), 'utf8'));
  const rewrites = new Map((config.rewrites || []).map(r => [r.source, r.destination]));
  for (const route of routes.filter(r => r.path)) {
    const expected = `/routes/${route.file}`;
    if (rewrites.get(route.path) !== expected) {
      throw new Error(`vercel.json: add { "source": "${route.path}", "destination": "${expected}" } to rewrites`);
    }
  }
}

function buildRoutes({ SITE_BASE_URL, BLOG_POSTS, DEFAULT_META, PAGE_META }) {
  const routes = STATIC_ROUTES.map(id => ({
    pageId: id,
    path: `/${id}`,
    file: `${id}.html`,
    meta: { ...DEFAULT_META, ...PAGE_META[id], url: `${SITE_BASE_URL}/${id}` }
  }));
  for (const post of Object.values(BLOG_POSTS)) {
    routes.push({
      pageId: post.pageId,
      path: post.slug,
      file: `${post.slug.replace(/^\//, '')}.html`,
      meta: { ...DEFAULT_META, title: `${post.title} | Jeman Kalita`, description: post.excerpt, url: SITE_BASE_URL + post.slug, type: 'article' }
    });
  }
  return routes;
}

const BANNER = '<!-- Generated by scripts/build-pages.mjs from index.html. Edit index.html, not this file. -->\n';

/** index.html with this page's metadata, this page active and its title as the one <h1>. */
function renderPage(html, meta, pageId) {
  return setMainHeading(setActivePage(applyMeta(html, meta), pageId), pageId)
    .replace(/^(<!DOCTYPE html>\r?\n)/i, `$1${BANNER}`); // banner after the doctype keeps standards mode
}

function main() {
  const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
  const metadata = loadMetadata(readFileSync(join(ROOT, 'script.js'), 'utf8'));
  const routes = buildRoutes(metadata);
  checkRewrites(routes);
  rmSync(OUT_DIR, { recursive: true, force: true });
  for (const route of routes) {
    const page = renderPage(html, route.meta, route.pageId);
    const file = join(OUT_DIR, route.file);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, page);
    console.log(`routes/${route.file}  ←  ${route.meta.title}`);
  }

  // 404.html at the root: Vercel returns it with status 404 for any URL nothing else matches.
  const { DEFAULT_META, PAGE_META } = metadata;
  const notFoundMeta = { ...DEFAULT_META, ...PAGE_META['not-found'] };
  const notFound = setTag(renderPage(html, notFoundMeta, 'not-found'),
    /(<meta\s+name="robots"\s+content=")[^"]*(")/, 'noindex', 'meta robots');
  writeFileSync(join(ROOT, '404.html'), notFound);
  console.log(`404.html  ←  ${notFoundMeta.title}`);
}

try {
  main();
} catch (err) {
  console.error(`build-pages failed: ${err.message}`);
  process.exit(1);
}
