# AnnaBooks Feature Guide

Source for https://guide.annaccounting.com/, the step-by-step guide to the AnnaBooks accounting app.

## Commands

Requires Node.js 18 or newer. The site lives in `frontend/`; run every command from there (`cd frontend`).

| Command | What it does |
|---|---|
| `npm install` | Install dependencies (first time only) |
| `npm run dev` | Local preview at http://localhost:5175 that reloads when you save a file |
| `npm run check` | Validate every page: one `<h1>`, unique ids, working links between pages, existing images and videos, balanced HTML, clean encoding |
| `npm run build` | Build the production site into `dist/` (runs the same checks and fails on any problem) |
| `npm run preview` | Serve the built `dist/` at http://localhost:4173 |

Pushing a change under `frontend/` to `main` runs `.github/workflows/deploy.yml`, which installs, checks, builds, and publishes `frontend/dist/` to `/var/www/html/guide.annaccounting.com` on the `annabook` runner. The previous release is kept in `guide.annaccounting.com.prev` for rollback.

## How the site is built

Every page is a static HTML file with its own address, title, description, canonical URL, social card, and structured data:

| Page | Address | File in `dist/` |
|---|---|---|
| Introduction | `/` | `index.html` |
| Part | `/part-customers-and-sales/` | `part-customers-and-sales/index.html` |
| Section | `/customer-invoice/` | `customer-invoice/index.html` |
| Not found | any unknown address | `404.html` (not indexed) |

The build also writes `sitemap.xml` (every page with its screenshots and video) and `search-index.json` (loaded the first time someone uses search). Old links such as `/#customer-invoice` redirect to the new address.

## Web server

The site needs no rewrite rules. In the nginx site for guide.annaccounting.com, serve 404s with the guide's page:

```nginx
root /var/www/html/guide.annaccounting.com;
index index.html;
location / { try_files $uri $uri/ =404; }
error_page 404 /404.html;
location ~* ^/(assets|screens|videos)/ { expires 30d; add_header Cache-Control "public"; }
```

## Where things live

All paths below are inside `frontend/`.

| Path | Contents |
|---|---|
| `content/front.html` | The Introduction page |
| `content/parts/part-01.html` ... `part-11.html` | One file per Part: flowcharts, steps, sample screens, More detail |
| `content/toc.html` | The contents list; the sidebar and page order are built from it, so add new sections here too |
| `content/screens.json` | Which screenshots appear under which section |
| `content/videos.json` | Video titles, transcripts, durations, and the page each video sits on |
| `content/modules.json` | Icon and one-line description for each Part |
| `content/head.html` | Tags shared by every page; titles, descriptions, and structured data are generated per page |
| `public/` | Files served as-is: `screens/`, `videos/`, favicons, logo, `robots.txt` |
| `src/styles/` | Design tokens (light and dark), layout, components, content, sample-screen mockups, print |
| `src/js/` | Page setup, sidebar, section bar, "On this page" rail, top-bar search, screenshot viewer, video player, theme |
| `scripts/content.mjs` | Builds every page, its metadata, the sitemap, and the search index |
| `index.html` | The page shell; `<!--@head-->`, `<!--@nav-->`, and `<!--@content-->` are filled for each page |

## Editing

- **Change text:** edit the Part file in `content/parts/`. Keep each `id` unchanged; page addresses and links rely on them.
- **Link to another section:** write `href="#section-id"`; the build turns it into the right page address.
- **Add a screenshot to a section:** put the image in `public/screens/` and add an entry under the section id in `content/screens.json`.
- **Add a section:** add the `<div class="feature">` block with its `<h2 id="...">` to the Part file, then a matching `<li class="item">` line in `content/toc.html`.
- **Replace a video:** overwrite `public/videos/<slug>.mp4`, `.jpg`, and `.vtt`, and update its `duration` in `content/videos.json`.

## Videos

The site serves only the web copies in `public/videos/`. Keep each one under about 25 MB (GitHub rejects files over 100 MB): encode with `ffmpeg -i master.mp4 -c:v libx264 -crf 24 -preset slow -c:a aac -b:a 128k -movflags +faststart <slug>.mp4`.

The full-quality masters (square and 1920x1080 clips, captions, scripts, the long walkthroughs) live on the shared drive, not in git. Restore them into `marketing/` locally when you need them; the folder is ignored.

## Keyboard shortcuts

`Ctrl K` or `/` focuses search, arrow keys move through results, `Enter` opens. On a section page, the left and right arrow keys go to the previous and next section. In the screenshot viewer, the arrow keys switch images and `Esc` closes.
