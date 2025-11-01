#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const PKG_ROOT = process.cwd();
const APP_FILES = new Set([
  'page.tsx','page.ts','layout.tsx','layout.ts',
  'route.ts','route.tsx','not-found.tsx','error.tsx',
  'loading.tsx','template.tsx','default.tsx','head.tsx',
  'sitemap.ts','robots.ts'
]);

// trova cartelle chiamate "app" o "pages" (esclude node_modules/.git)
function findRoots(root) {
  const out = new Set();
  const stack = [root];
  while (stack.length) {
    const dir = stack.pop();
    for (const name of fs.readdirSync(dir)) {
      const full = path.join(dir, name);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        if (name === 'node_modules' || name === '.git') continue;
        if (name === 'app' || name === 'pages') out.add(full);
        stack.push(full);
      }
    }
  }
  return [...out];
}

const roots = findRoots(PKG_ROOT);
if (!roots.length) {
  console.log('Nessuna cartella "app" o "pages" trovata a partire da', PKG_ROOT);
  process.exit(0);
}

const stripGroup = s => (s.startsWith('(') && s.endsWith(')')) ? null : s;
const segToParam = s => {
  if (s.startsWith('[') && s.endsWith(']')) {
    const inner = s.slice(1,-1);
    if (inner.startsWith('...')) return `:${inner.slice(3)}*`;
    if (inner.startsWith('[') && inner.includes('...')) return `:${inner.replaceAll('[','').replaceAll(']','').replace('...','')}?*`;
    return `:${inner}`;
  }
  return s;
};

function toRouteFromApp(fileAbs, appRoot) {
  const rel = path.relative(appRoot, fileAbs);
  const parts = rel.split(path.sep);
  const type = parts.pop();
  const dir = parts;

  const mapped = dir.map(stripGroup).filter(Boolean).map(segToParam);
  const name = type.toLowerCase();
  let url = '/' + mapped.join('/');
  if (url.endsWith('/')) url = url.slice(0,-1);
  if (url === '') url = '/';

  let kind = 'page';
  if (name.startsWith('layout')) kind = 'layout';
  else if (name.startsWith('route')) kind = 'route (API)';
  else if (name.startsWith('not-found')) kind = 'not-found';
  else if (name.startsWith('error')) kind = 'error boundary';
  else if (name.startsWith('loading')) kind = 'loading';
  else if (name.startsWith('template')) kind = 'template';
  else if (name.startsWith('default')) kind = 'parallel default';
  else if (name.startsWith('head')) kind = 'head';
  else if (name.startsWith('sitemap')) kind = 'sitemap';
  else if (name.startsWith('robots')) kind = 'robots';

  const prefix = path.relative(PKG_ROOT, appRoot).replace(/\\/g,'/');
  return { kind, url: kind === 'page' ? url : (url || '/'), file: (prefix ? prefix + '/' : '') + rel.replace(/\\/g,'/') };
}

function toRouteFromPages(fileAbs, pagesRoot) {
  const rel = path.relative(pagesRoot, fileAbs).replace(/\\/g,'/');
  let url = '/' + rel.replace(/\.(tsx|ts|jsx|js)$/, '');
  url = url.replace(/index$/,'');
  url = url.replace(/\/+/g,'/');
  if (url !== '/' && url.endsWith('/')) url = url.slice(0,-1);
  const prefix = path.relative(PKG_ROOT, pagesRoot).replace(/\\/g,'/');
  return { kind: 'pages (legacy)', url, file: (prefix ? prefix + '/' : '') + rel };
}

const rows = [];
for (const root of roots) {
  const isApp = path.basename(root) === 'app';
  const stack = [root];
  while (stack.length) {
    const dir = stack.pop();
    for (const name of fs.readdirSync(dir)) {
      const full = path.join(dir, name);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        if (name === 'node_modules' || name === '.git') continue;
        stack.push(full);
      } else if (APP_FILES.has(name)) {
        rows.push(isApp ? toRouteFromApp(full, root) : toRouteFromPages(full, root));
      }
    }
  }
}

rows.sort((a,b) => (a.url === b.url ? a.kind.localeCompare(b.kind) : a.url.localeCompare(b.url)));

const pad = (s, n) => (s.length >= n ? s : (s + ' '.repeat(n - s.length)));
const K = 18, U = 40;
console.log(pad('KIND', K), pad('URL', U), 'FILE');
console.log('-'.repeat(K), '-'.repeat(U), '----');
for (const r of rows) console.log(pad(r.kind, K), pad(r.url, U), r.file);



