# web4u — index

A small archive site, built with **Rollup** and deployable to **Vercel**.
All content lives in a single **`content.json`**; the build renders it into a
static page (the index reads fine with JavaScript disabled), and a small client
bundle adds the interactive layer — the tag filter, scroll-reveal, live clock,
and the WebGL shader plate.

## Project structure

```
web4u-site/
├── content.json          # ← all content lives here (edit this)
├── package.json          # dependencies + scripts (yarn)
├── rollup.config.mjs     # build config: reads content.json, fills the template
├── vercel.json           # Vercel deploy config
├── src/
│   ├── index.html        # template shell with {{TOKENS}} (rarely edited)
│   ├── main.js           # client runtime (filter, reveal, clock, shader)
│   └── styles/
│       └── main.css      # all styling
└── public/               # static files copied as-is (favicon.ico, share image…)
```

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or newer
- [Yarn](https://yarnpkg.com/) — if you don't have it: `npm install -g yarn`

## Local development

```bash
yarn install      # first time only
yarn dev          # dev server with live reload at http://localhost:5173
```

## Build for production

```bash
yarn build        # outputs the finished site to dist/
yarn preview      # optional: serve dist/ locally to check the build
```

## Editing the site — `content.json`

Everything you'd normally change lives in `content.json`. You don't touch the
HTML for routine edits.

- **`meta`** — page title, description, theme colour, language.
- **`brand`** — the wordmark and which character gets the accent colour
  (`"name": "web4u"`, `"accentChar": "u"`).
- **`plate`** — the captions on the shader plate.
- **`masthead`** — kicker line, big title (inline `<i>` allowed), the abstract
  paragraph (inline `<b>` and `<span class="hash">` allowed), and the run-head
  lines.
- **`sections`** — the three numbered groups. Each has an `id` (used to bucket
  links), a display `no`, a `title`, and a `desc`.
- **`links`** — the index. Each entry:
  ```json
  {
    "order": 1,                 // index number shown + entry NN/total
    "section": "theory",        // must match a section id
    "tag": "solar",             // becomes a filter chip + the meta tag
    "title": "Low-Tech Magazine",
    "url": "https://…",
    "desc": "One-line annotation."
  }
  ```
  To add a link, copy an entry, change the fields, and give it the next
  `order`. To move it between groups, change `section`. The filter chips and
  their counts are generated automatically from the `tag` values.
- **`colophon`** — the footer marks and the "filed under" / "index" notes.

After editing, run `yarn build` (or keep `yarn dev` running) and the page
re-renders. Styling lives in `src/styles/main.css`; the interactive behaviour
in `src/main.js`.

> How it works: `rollup.config.mjs` reads `content.json`, pre-renders the
> masthead, section headers and **all index rows** into `src/index.html`'s
> `{{TOKENS}}`, and injects a small JSON blob the client filter reads. Because
> the rows are rendered at build time, the archive is fully readable with no
> JavaScript — the bundle only adds interactivity.

## Favicon

Put `favicon.ico` in `public/`. It's linked in the page head and copied to the
site root on build. If it doesn't show after deploying, visit
`your-site.com/favicon.ico` directly: if it loads there it's browser caching
(hard-refresh); a 404 means the file isn't in `public/`.

## Share / link-preview card

Add `og:`/`twitter:` tags to `src/index.html`'s `<head>` and put a ~1200×630
image in `public/`, referencing it by its full absolute https URL (relative
paths don't work for share cards).

## Deploying to Vercel

### Option A — GitHub (recommended)
1. Push this folder to a GitHub repo.
2. vercel.com → Add New… → Project → import the repo.
3. `vercel.json` sets it up automatically (build `yarn build`, output `dist`).
4. Deploy. Every `git push` redeploys.

### Option B — Vercel CLI
```bash
npm install -g vercel
vercel            # preview deploy
vercel --prod     # production
```
