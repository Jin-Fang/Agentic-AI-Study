#!/usr/bin/env node
// Build the four textbooks in this repo to self-contained HTML and/or PDF.
//
// Usage:
//   node build-books.mjs                      # all books, HTML + PDF
//   node build-books.mjs --html-only          # all books, HTML only
//   node build-books.mjs --pdf-only           # all books, PDF only (needs existing/rebuilt HTML)
//   node build-books.mjs agent-harness        # only the named book(s)
//   node build-books.mjs llm-foundations-zh --html-only
//
// Mermaid diagrams are rendered to real SVG (mermaid.min.js is inlined into the
// HTML). PDF generation shells out to headless Google Chrome / Chromium; set
// CHROME_PATH to override auto-detection.

import { marked } from 'marked';
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join, basename } from 'node:path';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(SCRIPT_DIR, '..');
const DIST = join(REPO_ROOT, 'dist');
const MERMAID_JS = join(SCRIPT_DIR, 'node_modules', 'mermaid', 'dist', 'mermaid.min.js');

// All four books live as sibling directories at the repo root.
const BOOKS = [
  { dir: 'agent-harness', lang: 'en' },
  { dir: 'agent-harness-zh', lang: 'zh' },
  { dir: 'llm-foundations', lang: 'en' },
  { dir: 'llm-foundations-zh', lang: 'zh' },
];

// ---- CLI ---------------------------------------------------------------
const argv = process.argv.slice(2);
const htmlOnly = argv.includes('--html-only');
const pdfOnly = argv.includes('--pdf-only');
const wanted = argv.filter((a) => !a.startsWith('--'));
const selected = wanted.length ? BOOKS.filter((b) => wanted.includes(b.dir)) : BOOKS;
if (wanted.length && selected.length === 0) {
  console.error(`No matching book. Known: ${BOOKS.map((b) => b.dir).join(', ')}`);
  process.exit(1);
}

// ---- helpers -----------------------------------------------------------
const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

marked.setOptions({ gfm: true, breaks: false });

// Ordered file list for a book: numbered chapters, then back matter.
function collectFiles(bookDir) {
  const all = readdirSync(bookDir).filter((f) => f.endsWith('.md'));
  const numbered = all
    .filter((f) => /^\d{2}-/.test(f))
    .sort((a, b) => a.localeCompare(b, 'en'));
  const back = ['references.md', 'glossary.md', 'source-map.md'].filter((f) => all.includes(f));
  return [...numbered, ...back];
}

// Cover title/subtitle parsed from the book's own README.md (falls back to dir name).
function parseCover(bookDir) {
  const readmePath = join(bookDir, 'README.md');
  let title = basename(bookDir);
  let subtitle = '';
  if (existsSync(readmePath)) {
    const lines = readFileSync(readmePath, 'utf8').split('\n');
    const h1 = lines.find((l) => /^#\s+/.test(l));
    if (h1) title = h1.replace(/^#\s+/, '').trim();
    const it = lines.find((l) => /^\*[^*].*\*\s*$/.test(l.trim()));
    if (it) subtitle = it.trim().replace(/^\*/, '').replace(/\*$/, '').trim();
  }
  return { title, subtitle };
}

// Convert one markdown file to HTML, turning ```mermaid blocks into live nodes.
function mdToHtml(md, state) {
  const blocks = [];
  md = md.replace(/```mermaid\s*\n([\s\S]*?)```/g, (_, code) => {
    blocks.push(code.replace(/\s+$/, ''));
    return `\n\n@@MERMAID${blocks.length - 1}@@\n\n`;
  });
  let html = marked.parse(md);
  html = html.replace(/<p>@@MERMAID(\d+)@@<\/p>/g, (_, n) => {
    state.hasMermaid = true;
    return `<figure class="mermaid-fig"><pre class="mermaid">${escapeHtml(blocks[+n])}</pre></figure>`;
  });
  return html;
}

const CSS = `
*{box-sizing:border-box;}
@page{ size:A4; margin:10mm 12mm; }
html,body{ margin:0; padding:0; }
body{
  font-family:"Helvetica Neue",Helvetica,Arial,"PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif;
  font-size:10pt; line-height:1.4; color:#111;
  -webkit-print-color-adjust:exact; print-color-adjust:exact;
}
.cover{ break-after:page; padding-top:70mm; text-align:center; }
.cover h1{ font-size:26pt; line-height:1.2; border:none; color:#0f2f57; margin:0 0 10pt; padding:0; }
.cover .sub{ font-size:11.5pt; color:#37506e; max-width:150mm; margin:0 auto 18pt; font-style:italic; text-align:left; }
.cover .meta{ font-size:9.5pt; color:#889; }
.chapter{ break-before:page; }
.chapter[data-first]{ break-before:auto; }
h1{ font-size:16.5pt; line-height:1.18; margin:0 0 6pt; padding-bottom:4pt; border-bottom:2px solid #1a4d8f; color:#0f2f57; }
h2{ font-size:12.5pt; margin:11pt 0 4pt; color:#123f6b; break-after:avoid; }
h3{ font-size:10.8pt; margin:8pt 0 3pt; color:#1a3a5c; break-after:avoid; }
p{ margin:0 0 4.5pt; text-align:left; }
ul,ol{ margin:0 0 4.5pt; padding-left:1.45em; }
li{ margin:0 0 1.5pt; }
li>ul,li>ol{ margin-top:1.5pt; }
strong{ font-weight:660; }
a{ color:#1a4d8f; text-decoration:none; }
code{ font-family:"SF Mono",Menlo,Consolas,monospace; font-size:8.4pt; background:#f2f3f5; padding:0.5pt 2.5pt; border-radius:3px; }
pre>code{ background:none; padding:0; }
hr{ border:none; border-top:1px solid #dcdcdc; margin:7pt 0; }
blockquote{ margin:0 0 4.5pt; padding-left:9pt; border-left:3px solid #dcdcdc; color:#555; }
table{ border-collapse:collapse; width:100%; font-size:8.8pt; margin:2pt 0 6pt; break-inside:avoid; }
th,td{ border:1px solid #d8d8d8; padding:3pt 5pt; text-align:left; vertical-align:top; }
th{ background:#eef2f7; font-weight:640; }
.mermaid-fig{ break-inside:avoid; margin:8pt 0; text-align:center; }
.mermaid svg{ max-width:100%; height:auto; }
`;

const MERMAID_INIT = `
mermaid.initialize({
  startOnLoad:false, theme:'neutral', securityLevel:'loose',
  flowchart:{ useMaxWidth:true, htmlLabels:true, curve:'basis' },
  sequence:{ useMaxWidth:true },
  themeVariables:{ fontSize:'12px' }
});
(async () => {
  try { await mermaid.run({ querySelector:'.mermaid' }); }
  catch (e) { document.body.setAttribute('data-err', String(e && e.message || e)); }
  document.title = 'RENDER_READY';
})();
`;

function buildHtml(book) {
  const bookDir = join(REPO_ROOT, book.dir);
  const files = collectFiles(bookDir);
  const { title, subtitle } = parseCover(bookDir);
  const state = { hasMermaid: false };

  let body = `<section class="cover">
    <h1>${escapeHtml(title)}</h1>
    ${subtitle ? `<p class="sub">${marked.parseInline(subtitle)}</p>` : ''}
    <p class="meta">${files.length} sections &middot; generated from Markdown sources</p>
  </section>\n`;

  files.forEach((f, i) => {
    const html = mdToHtml(readFileSync(join(bookDir, f), 'utf8'), state);
    body += `<section class="chapter"${i === 0 ? ' data-first="1"' : ''}>${html}</section>\n`;
  });

  const head =
    `<meta charset="utf-8"><title>${escapeHtml(title)}</title><style>${CSS}</style>` +
    (state.hasMermaid ? `<script>${readFileSync(MERMAID_JS, 'utf8')}</script>` : '');
  const tail = state.hasMermaid ? `<script>${MERMAID_INIT}</script>` : '';

  const doc = `<!doctype html><html lang="${book.lang}"><head>${head}</head><body>\n${body}\n${tail}\n</body></html>`;
  const outHtml = join(DIST, `${book.dir}.html`);
  writeFileSync(outHtml, doc);
  return { outHtml, files: files.length, hasMermaid: state.hasMermaid, sizeMB: doc.length / 1e6 };
}

// ---- Chrome discovery + PDF print -------------------------------------
function findChrome() {
  if (process.env.CHROME_PATH && existsSync(process.env.CHROME_PATH)) return process.env.CHROME_PATH;
  const candidates =
    process.platform === 'darwin'
      ? [
          '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
          '/Applications/Chromium.app/Contents/MacOS/Chromium',
          '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
        ]
      : process.platform === 'win32'
      ? [
          'C:/Program Files/Google/Chrome/Application/chrome.exe',
          'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
        ]
      : [
          '/usr/bin/google-chrome',
          '/usr/bin/google-chrome-stable',
          '/usr/bin/chromium',
          '/usr/bin/chromium-browser',
          '/snap/bin/chromium',
        ];
  return candidates.find((p) => existsSync(p)) || null;
}

function printPdf(chrome, htmlPath, pdfPath) {
  execFileSync(
    chrome,
    [
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      '--no-pdf-header-footer',
      '--virtual-time-budget=60000',
      '--run-all-compositor-stages-before-draw',
      `--print-to-pdf=${pdfPath}`,
      `file://${htmlPath}`,
    ],
    { stdio: 'ignore' }
  );
}

// ---- main --------------------------------------------------------------
mkdirSync(DIST, { recursive: true });
const doHtml = !pdfOnly;
const doPdf = !htmlOnly;

let chrome = null;
if (doPdf) {
  chrome = findChrome();
  if (!chrome) {
    console.error(
      'PDF step needs Google Chrome or Chromium, which was not found.\n' +
        'Install Chrome, or set CHROME_PATH to its executable, or run with --html-only.'
    );
    process.exit(1);
  }
}

console.log(`Building ${selected.length} book(s) -> ${DIST}\n`);
for (const book of selected) {
  const html = doHtml
    ? buildHtml(book)
    : { outHtml: join(DIST, `${book.dir}.html`), files: '?', hasMermaid: true, sizeMB: 0 };
  if (doHtml) {
    console.log(
      `  html  ${book.dir}.html  (${html.files} sections, ${html.hasMermaid ? 'diagrams' : 'no diagrams'}, ${html.sizeMB.toFixed(1)} MB)`
    );
  }
  if (doPdf) {
    if (!existsSync(html.outHtml)) {
      console.error(`  pdf   ${book.dir}: HTML missing (${html.outHtml}); build HTML first.`);
      continue;
    }
    const pdfPath = join(DIST, `${book.dir}.pdf`);
    printPdf(chrome, html.outHtml, pdfPath);
    console.log(`  pdf   ${book.dir}.pdf`);
  }
}
console.log('\nDone.');
