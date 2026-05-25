import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import resolvePlugin from '@rollup/plugin-node-resolve';
import postcss from 'rollup-plugin-postcss';
import html from '@rollup/plugin-html';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import copy from 'rollup-plugin-copy';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dev = process.env.ROLLUP_WATCH === 'true';

/* -----------------------------------------------------------
   Content comes from content.json (single source of truth).
   We hand-wrote src/index.html as a template with {{TOKENS}};
   here we read the JSON, render the static parts (masthead,
   section headers, and the index ROWS — pre-rendered so the
   page works with JS off), and substitute them in. The client
   bundle (src/main.js) then adds the filter, reveal, clock and
   shader, reading the same data from an injected JSON blob.
   ----------------------------------------------------------- */
const content = JSON.parse(readFileSync(resolve(__dirname, 'content.json'), 'utf8'));

const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return u; } };
const pad2 = (n) => String(n).padStart(2, '0');

function renderRow(l, total) {
  // mirrors the original row markup; href/target on the row anchor
  return (
    `      <a class="row" href="${esc(l.url)}" target="_blank" rel="noopener" data-tag="${esc(l.tag)}">\n` +
    `        <div class="rnum">${pad2(l.order)}</div>\n` +
    `        <div class="main"><span class="title">${esc(l.title)}<span class="ar">↗</span></span>` +
    `<p class="desc">${esc(l.desc)}</p></div>\n` +
    `        <div class="meta"><span class="tag">${esc(l.tag)}</span>` +
    `<span class="host">${esc(host(l.url))}</span>` +
    `<span class="date">entry ${pad2(l.order)}/${total}</span></div>\n` +
    `      </a>\n`
  );
}

function renderSections() {
  const total = content.links.length;
  return content.sections
    .map((sec, i) => {
      const rows = content.links
        .filter((l) => l.section === sec.id)
        .map((l) => renderRow(l, total))
        .join('');
      const filterbar = i === 0 ? '    <div class="filterbar" id="filterbar"></div>\n' : '';
      return (
        `  <section class="sect" id="sec${i + 1}">\n` +
        `    <div class="sect-h">\n` +
        `      <span class="no">${esc(sec.no)}</span>\n` +
        `      <h2>${esc(sec.title)}</h2>\n` +
        `      <span class="desc">${esc(sec.desc)}</span>\n` +
        `    </div>\n` +
        filterbar +
        `    <div class="index" data-sec="${esc(sec.id)}">\n${rows}    </div>\n` +
        `  </section>\n`
      );
    })
    .join('\n');
}

function renderTopnav() {
  return content.sections
    .map((_, i) => `    <a href="#sec${i + 1}">${pad2(i + 1)}</a>`)
    .join('\n');
}

function renderRunhead() {
  return content.masthead.runhead.map((s) => `    <span>${esc(s)}</span>`).join('\n');
}

/* data the client filter needs (tags/counts) — kept minimal */
const indexJson = JSON.stringify({
  links: content.links.map((l) => ({ tag: l.tag, section: l.section, order: l.order })),
});

const tokens = {
  LANG: content.meta.lang || 'en',
  TITLE: esc(content.meta.title),
  DESCRIPTION: esc(content.meta.description),
  THEME_COLOR: esc(content.meta.themeColor),
  BRAND: `${esc(content.brand.name).replace(
    esc(content.brand.accentChar),
    `<span class="u">${esc(content.brand.accentChar)}</span>`
  )}`,
  TOPNAV: renderTopnav(),
  PLATE_FIG: esc(content.plate.figCaption),
  PLATE_STATE: esc(content.plate.stateLive),
  PLATE_PAUSED: esc(content.plate.statePaused),
  KICKER: esc(content.masthead.kicker),
  MAST_TITLE: content.masthead.title, // allows inline <i>
  ABSTRACT: content.masthead.abstract, // allows inline <b>/<span>
  RUNHEAD: renderRunhead(),
  SECTIONS: renderSections(),
  COL_MARK: esc(content.colophon.mark),
  COL_BLURB: content.colophon.blurb,
  COL_FILED_H: esc(content.colophon.filedHeading),
  COL_FILED: esc(content.colophon.filedUnder),
  COL_INDEX_H: esc(content.colophon.indexHeading),
  COL_INDEX_NOTE: esc(content.colophon.indexNote),
  INDEX_JSON: indexJson,
};

let template = readFileSync(resolve(__dirname, 'src/index.html'), 'utf8');
for (const [k, v] of Object.entries(tokens)) {
  template = template.split(`{{${k}}}`).join(v);
}

export default {
  input: 'src/main.js',
  output: {
    dir: 'dist',
    format: 'es',
    entryFileNames: 'assets/[name].[hash].js',
    assetFileNames: 'assets/[name].[hash][extname]',
    sourcemap: dev,
  },
  plugins: [
    resolvePlugin(),
    postcss({
      extract: 'assets/styles.css', // pull CSS out into its own file
      minimize: !dev,
      sourceMap: dev,
    }),
    html({
      fileName: 'index.html',
      template: ({ files }) => {
        const links = (files.css || [])
          .map((f) => `<link rel="stylesheet" href="/${f.fileName}" />`)
          .join('\n  ');
        const scripts = (files.js || [])
          .map((f) => `<script type="module" src="/${f.fileName}"></script>`)
          .join('\n  ');
        // inject the built stylesheet link into <head>, and the module
        // script before </body> (web4u has real client behaviour)
        return template
          .replace('</head>', `  ${links}\n</head>`)
          .replace('</body>', `  ${scripts}\n</body>`);
      },
    }),
    // copy anything in /public (favicon, share image, etc.) straight to dist
    copy({
      targets: [{ src: 'public/*', dest: 'dist' }],
      copyOnce: false,
    }),
    dev && serve({ contentBase: 'dist', port: 5173, historyApiFallback: true }),
    dev && livereload('dist'),
  ].filter(Boolean),
};
