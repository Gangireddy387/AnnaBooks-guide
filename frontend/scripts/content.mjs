import fs from 'node:fs';
import path from 'node:path';

const SITE_URL = 'https://guide.annaccounting.com/';
export const HOME_ID = 'how-to-use';
const ORG_ID = 'https://annaccounting.com/#organization';
const SITE_ID = `${SITE_URL}#website`;
const SITE_NAME = 'AnnaBooks Feature Guide';
const PUBLISHED = '2026-10-21';

const read = (root, f) => fs.readFileSync(path.join(root, 'content', f), 'utf8');
const json = (root, f) => JSON.parse(read(root, f).replace(/^\uFEFF/, ''));
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const strip = (s) => String(s).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const decode = (s) => s.replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
const clip = (s, n) => (s.length > n ? s.slice(0, s.lastIndexOf(' ', n)).replace(/[,;:.]$/, '') + '…' : s);
const mmss = (sec) => { const s = Math.round(sec); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
const isoDur = (sec) => { const s = Math.round(sec); return `PT${Math.floor(s / 60)}M${s % 60}S`; };
export const urlFor = (id) => (id === HOME_ID ? '/' : `/${id}/`);
const absUrl = (id) => `${SITE_URL}${urlFor(id).slice(1)}`;
const jsonScript = (id, data) => `<script type="application/json" id="${id}">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;
const ldScript = (graph) => `<script type="application/ld+json">\n${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 1).replace(/</g, '\\u003c')}\n</script>`;

const ICONS = {
  rocket: '<path d="M5 15c-1.5 1.5-2 5-2 5s3.5-.5 5-2M9 11l4 4M14.5 4.5c2-2 6-1.5 6-1.5s.5 4-1.5 6l-6 6-4.5-4.5 6-6Z"/><circle cx="15.5" cy="8.5" r="1.4"/>',
  home: '<path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10M10 20v-6h4v6"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5a6.5 6.5 0 0 1 3.5 5.5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
  receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z"/><path d="M9 8h6M9 12h6M9 16h3"/>',
  bank: '<path d="M3 10 12 4l9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18"/>',
  box: '<path d="M21 8 12 3 3 8v8l9 5 9-5V8Z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>',
  window: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M7 6.5h.01M10 6.5h.01"/>',
  list: '<path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/>',
};
const icon = (name, cls = 'icon') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ICONS.list}</svg>`;
const PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5-11-6.5Z" fill="currentColor"/></svg>';
const ARROW = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

export function contentFiles(root) {
  const dir = path.join(root, 'content');
  const out = [];
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).forEach((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : out.push(path.join(d, e.name))));
  walk(dir);
  return out;
}

function parseToc(toc) {
  const parts = [];
  for (const m of toc.matchAll(/<li class="(part|item)"><a href="#([^"]+)"><span class="toc-num">([^<]+)<\/span><span class="toc-title">([^<]+)<\/span>/g)) {
    const it = { kind: m[1], id: m[2], num: m[3], title: m[4] };
    if (it.kind === 'part') parts.push({ ...it, items: [] });
    else parts[parts.length - 1].items.push(it);
  }
  return parts;
}

function navHtml(parts) {
  const chevron = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>';
  const groups = parts.map((p) => `<li class="nav-group" data-part="${p.id}">
<div class="nav-part-row"><a class="nav-part" href="${urlFor(p.id)}" data-go="${p.id}"><span class="nav-num">${p.num}</span><span class="nav-text">${p.title}</span><span class="nav-count" data-part-count></span><span class="nav-expand" aria-hidden="true">${chevron}</span></a></div>
<ul class="nav-items">${p.items.map((i) => `<li><a class="nav-item" href="${urlFor(i.id)}" data-go="${i.id}"><span class="nav-num">${i.num}</span><span class="nav-text">${i.title}</span></a></li>`).join('')}</ul>
</li>`).join('\n');
  return `<nav class="nav" aria-label="Guide index">
<a class="nav-home" href="/" data-go="${HOME_ID}"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11 12 4l9 7M5 10v10h14V10"/></svg><span>Introduction</span></a>
<ol class="nav-list">
${groups}
</ol>
</nav>`;
}

function existing(site, shots) {
  return (shots || []).filter((s) => fs.existsSync(path.join(site, 'screens', s.file)));
}

function gallery(shots, title) {
  if (!shots.length) return '';
  const first = shots[0];
  const alt = (s) => esc(s.alt || strip(s.caption));
  const thumbs = shots.length > 1
    ? `<div class="gallery-thumbs" role="tablist" aria-label="Screens in this section">${shots.map((s, i) => `<a class="gallery-thumb${i === 0 ? ' active' : ''}" href="/screens/${s.file}" data-lightbox data-caption="${esc(s.caption)}" role="tab" aria-selected="${i === 0}"><img src="/screens/${s.file}" alt="${alt(s)}" width="1440" height="900" loading="lazy" decoding="async"><span>${strip(s.caption)}</span></a>`).join('')}</div>`
    : '';
  return `<figure class="gallery" data-gallery>
<div class="gallery-frame"><div class="frame-bar" aria-hidden="true"><i></i><i></i><i></i><span class="frame-url">app.annaccounting.com</span><span class="frame-title">${esc(title)}</span></div>
<a class="gallery-main" href="/screens/${first.file}" data-lightbox ${shots.length > 1 ? 'data-gallery-main' : ''}><img src="/screens/${first.file}" alt="${alt(first)}" width="1440" height="900" fetchpriority="high" decoding="async"><span class="gallery-zoom" aria-hidden="true"><svg class="icon" viewBox="0 0 24 24"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>View full size</span></a></div>
<figcaption class="gallery-caption"><span class="gallery-count">${shots.length > 1 ? `Screen <b data-gallery-index>1</b> of ${shots.length}` : 'Screen'}</span><span data-gallery-caption>${first.caption}</span></figcaption>
${thumbs}
</figure>`;
}

function videoCard(v, variant = '') {
  return `<button class="vcard ${variant}" type="button" data-video="${v.slug}" aria-label="Play video: ${esc(v.title)}, ${mmss(v.duration || 0)}">
<span class="vcard-media"><img src="/videos/${v.slug}.jpg" alt="" width="1920" height="1080" loading="lazy" decoding="async"><span class="vcard-play">${PLAY}</span>${v.duration ? `<span class="vcard-dur">${mmss(v.duration)}</span>` : ''}</span>
<span class="vcard-body"><span class="vcard-ep">Episode ${v.episode}</span><span class="vcard-title">${esc(v.title)}</span><span class="vcard-sub">${esc(v.subtitle)}</span></span>
</button>`;
}

function transcript(v) {
  return `<details class="transcript"><summary>Video transcript: ${esc(v.title)}</summary><ol>${v.transcript.map((l) => `<li>${esc(l)}</li>`).join('')}</ol></details>`;
}

function scanFeatures(html) {
  const starts = [...html.matchAll(/<div class="feature(?: feature-report)?">\s*<h2 id="([^"]+)">([\s\S]*?)<\/h2>/g)];
  return starts.map((m, i) => {
    const end = i + 1 < starts.length ? starts[i + 1].index : html.length;
    const block = html.slice(m.index, end);
    const lead = /<p class="lead">([\s\S]*?)<\/p>/.exec(block);
    return {
      id: m[1], heading: m[2], num: strip(/<span class="h-num">([^<]*)<\/span>/.exec(m[2])?.[1] || ''),
      title: strip(m[2].replace(/<span class="h-num">[^<]*<\/span>/, '')), lead: lead ? decode(strip(lead[1])) : '',
      steps: (block.match(/<article class="step">/g) || []).length, report: block.startsWith('<div class="feature feature-report">'),
    };
  });
}

const TAB_DEFS = [
  ['screens', 'Screens', 'Screens', /<figure class="gallery"/],
  ['flow', 'Workflow', 'Workflow', /<ol class="fc" aria-label="Flowchart">/],
  ['steps', 'Instructions', 'Instructions', /<section class="steps">/],
  ['records', 'Sample records', 'Sample records', /<(\w+) class="rpt"/],
  ['detail', 'More detail', 'More detail', /<details class="full">/],
];

const blockTitle = (id, title, note) => `<div class="block-title"><h2 id="${id}-title">${title}</h2><p>${note}</p></div>`;

function addAnchors(html, pid) {
  const tabs = [];
  const stepCount = (html.match(/<article class="step">/g) || []).length;
  for (const [key, label, railLabel, re] of TAB_DEFS) {
    const m = re.exec(html);
    if (!m) continue;
    const id = `${pid}--${key}`;
    let tag = m[0].replace(/^<(\w+)/, `<$1 id="${id}"`);
    if (key === 'flow') tag = `<section class="workflow" id="${id}" aria-labelledby="${id}-title">${blockTitle(id, 'Workflow', 'Each box is one action in AnnaBooks. Follow the arrows in order; the color and icon show the kind of action.')}\n<ol class="fc" aria-label="Workflow">`;
    if (key === 'steps') tag = `<section class="steps" id="${id}" aria-labelledby="${id}-title">${blockTitle(id, 'Instructions', `${stepCount} ${stepCount === 1 ? 'step' : 'steps'}, shown with the sample company Northline Staffing LLC.`)}`;
    html = html.slice(0, m.index) + tag + html.slice(m.index + m[0].length);
    if (key === 'flow') {
      const close = html.indexOf('</ol>', m.index + tag.length);
      html = `${html.slice(0, close + 5)}</section>${html.slice(close + 5)}`;
    }
    tabs.push({ id, key, label, railLabel });
  }
  const steps = [];
  html = html.replace(/<article class="step">([\s\S]*?<h4>([\s\S]*?)<\/h4>)/g, (all, rest, h4) => {
    const id = `${pid}--step-${steps.length + 1}`;
    steps.push({ id, text: `${steps.length + 1}. ${decode(strip(h4))}` });
    return `<article class="step" id="${id}">${rest}`;
  });
  const thumbs = (html.match(/class="gallery-thumb/g) || []).length;
  tabs.forEach((t) => { t.count = t.key === 'screens' ? thumbs || null : t.key === 'steps' ? steps.length || null : null; });
  return { html, tabs, steps };
}

const CHEV_L = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>';
const CHEV_R = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>';
const CLOCK = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" style="width:14px;height:14px"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';
const label = (p) => (p.kind === 'home' ? 'Introduction' : p.kind === 'part' ? `Part ${p.partNum}: ${p.title}` : `${p.num ? p.num + ' ' : ''}${p.title}`);

function chromeFor(p, ctx) {
  const { byId, sequence, features } = ctx;
  const crumbs = ['<a href="/">Guide</a>'];
  if (p.kind === 'part') crumbs.push(`<span aria-current="page">${esc(label(p))}</span>`);
  if (p.kind === 'feature') crumbs.push(`<a href="${urlFor(p.part)}">${esc(label(byId[p.part]))}</a>`, `<span aria-current="page">${esc(label(p))}</span>`);
  if (p.kind === 'notfound') crumbs.push('<span aria-current="page">Page not found</span>');

  let prev = null; let next = null;
  if (p.kind === 'part') {
    const first = features.find((f) => f.part === p.id);
    prev = sequence[sequence.indexOf(first) - 1] || null;
    next = first || null;
  } else if (p.kind !== 'notfound') {
    const i = sequence.indexOf(p);
    prev = sequence[i - 1] || null;
    next = sequence[i + 1] || null;
  }
  const pager = [
    prev ? `<a class="prev" href="${urlFor(prev.id)}" rel="prev"><small>Previous</small><b>${esc(label(prev))}</b></a>` : '',
    next ? `<a class="next" href="${urlFor(next.id)}" rel="next"><small>Next</small><b>${esc(label(next))}</b></a>` : '',
  ].join('');

  const words = (searchText(p.html).match(/\S+/g) || []).length;
  const meta = `${CLOCK}${Math.max(1, Math.round(words / 230))} min read`;

  let secnav = '';
  if (p.kind === 'feature') {
    const i = features.indexOf(p);
    const fp = features[i - 1]; const fn = features[i + 1];
    const inPart = features.filter((f) => f.part === p.part);
    const step = (f, attr, aria, chev) => (f
      ? `<a class="icon-btn sec-step-btn" ${attr} href="${urlFor(f.id)}" title="${esc(label(f))}" aria-label="${aria}: ${esc(label(f))}">${chev}</a>`
      : `<a class="icon-btn sec-step-btn" ${attr} href="#" aria-disabled="true" aria-label="${aria}">${chev}</a>`);
    secnav = `<nav class="sec-nav" aria-label="This section">
      <div class="sec-nav-inner">
        <span class="sec-nav-num" data-secnav-num>${esc(p.num)}</span>
        <ul class="sec-tabs" data-secnav-tabs>${p.tabs.map((t, k) => `<li><a href="#${t.id}" data-secnav="${t.id}"${k === 0 ? ' class="active"' : ''}>${t.label}${t.count ? `<span>${t.count}</span>` : ''}</a></li>`).join('')}</ul>
        <div class="sec-step">${step(fp, 'data-secnav-prev', 'Previous section', CHEV_L)}<span class="sec-step-pos" data-secnav-pos>${inPart.indexOf(p) + 1} of ${inPart.length}</span>${step(fn, 'data-secnav-next', 'Next section', CHEV_R)}</div>
      </div>
    </nav>`;
  }

  let rail = [];
  if (p.kind === 'feature') {
    for (const t of p.tabs) {
      rail.push(`<li><a href="#${t.id}" data-rail="${t.id}">${esc(t.railLabel)}</a></li>`);
      if (t.key === 'steps') rail.push(...p.steps.map((s) => `<li class="sub"><a href="#${s.id}" data-rail="${s.id}">${esc(s.text)}</a></li>`));
    }
  } else if (p.kind === 'part') {
    rail = features.filter((f) => f.part === p.id).map((f) => `<li><a href="${urlFor(f.id)}">${esc(label(f))}</a></li>`);
  } else if (p.kind === 'home') {
    rail = [...p.html.matchAll(/<h2 id="([^"]+)">([\s\S]*?)<\/h2>/g)].map((m) => `<li><a href="#${m[1]}" data-rail="${m[1]}">${esc(decode(strip(m[2])))}</a></li>`);
  }
  return { crumbs: crumbs.join('<span class="sep" aria-hidden="true">/</span>'), pager, meta, secnav, rail: rail.join(''), railEmpty: rail.length < 2 };
}

function navFor(nav, p) {
  let out = nav.replace(new RegExp(`<a class="(nav-item|nav-part|nav-home)" href="([^"]*)" data-go="${p.id}">`), '<a class="$1 active" aria-current="page" href="$2" data-go="' + p.id + '">');
  const partId = p.kind === 'part' ? p.id : p.part;
  if (partId) out = out.replace(`<li class="nav-group" data-part="${partId}">`, `<li class="nav-group open has-active" data-part="${partId}">`);
  return out;
}

function searchText(html) {
  return decode(strip(html
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<h1[\s\S]*?<\/h1>/g, ' ')
    .replace(/<p class="eyebrow">[\s\S]*?<\/p>/g, ' ')
    .replace(/<ul class="(?:sec-meta|part-stats)">[\s\S]*?<\/ul>/g, ' ')
    .replace(/<p class="grid-label">[\s\S]*?<\/p>/g, ' ')
    .replace(/<div class="block-title">[\s\S]*?<\/div>/g, ' ')
    .replace(/<span class="h-num">[\s\S]*?<\/span>/g, ' ')
    .replace(/<\/(p|li|h\d|div|td|th|figcaption|summary)>/g, '$& ')));
}

function videoLd(v, total, pageId) {
  return {
    '@type': 'VideoObject', '@id': `${absUrl(pageId)}#video-${v.slug}`, name: `AnnaBooks: ${v.title}`,
    description: `${v.subtitle}. Episode ${v.episode} of ${total} in the AnnaBooks walkthrough, using the sample company Northline Staffing LLC.`,
    thumbnailUrl: `${SITE_URL}videos/${v.slug}.jpg`, contentUrl: `${SITE_URL}videos/${v.slug}.mp4`, uploadDate: v.uploadDate || '2026-10-22',
    ...(v.duration ? { duration: isoDur(v.duration) } : {}), inLanguage: 'en', transcript: v.transcript.join(' '), publisher: { '@id': ORG_ID },
  };
}

function headFor(base, p, ctx) {
  const url = absUrl(p.id);
  const image = p.image ? `${SITE_URL}screens/${p.image}` : `${SITE_URL}og-image.png`;
  const [iw, ih] = p.image ? [1440, 900] : [1200, 630];
  const isHome = p.kind === 'home';
  const org = { '@type': 'Organization', '@id': ORG_ID, name: 'AnnaBooks', url: 'https://annaccounting.com/', logo: { '@type': 'ImageObject', url: `${SITE_URL}annabooks-logo.jpg`, width: 1024, height: 326 } };
  const website = { '@type': 'WebSite', '@id': SITE_ID, url: SITE_URL, name: SITE_NAME, inLanguage: 'en', publisher: { '@id': ORG_ID } };
  const crumbs = [{ name: 'Guide', id: HOME_ID }];
  if (p.part) crumbs.push({ name: ctx.byId[p.part].title, id: p.part });
  if (!isHome) crumbs.push({ name: p.title, id: p.id });
  const breadcrumb = { '@type': 'BreadcrumbList', '@id': `${url}#breadcrumb`, itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: absUrl(c.id) })) };
  const graph = [org, website];
  if (isHome) {
    graph.push(
      { '@type': 'WebPage', '@id': `${url}#webpage`, url, name: p.headTitle, description: p.desc, inLanguage: 'en', isPartOf: { '@id': SITE_ID }, primaryImageOfPage: { '@type': 'ImageObject', url: image, width: iw, height: ih }, datePublished: PUBLISHED, dateModified: ctx.today },
      { '@type': 'TechArticle', '@id': `${url}#guide`, headline: p.headTitle, description: 'A step-by-step guide to the AnnaBooks client application, following one sample company from sign-up through invoices, bills, consultant time, payroll, banking, and the month-end reports.', image, datePublished: PUBLISHED, dateModified: ctx.today, inLanguage: 'en', proficiencyLevel: 'Beginner', author: { '@id': ORG_ID }, publisher: { '@id': ORG_ID }, mainEntityOfPage: { '@id': `${url}#webpage` }, isPartOf: { '@id': SITE_ID }, articleSection: ctx.partTitles },
    );
  } else if (p.kind === 'part') {
    graph.push({ '@type': 'CollectionPage', '@id': `${url}#webpage`, url, name: p.headTitle, description: p.desc, inLanguage: 'en', isPartOf: { '@id': SITE_ID }, breadcrumb: { '@id': `${url}#breadcrumb` }, primaryImageOfPage: { '@type': 'ImageObject', url: image, width: iw, height: ih } }, breadcrumb);
  } else if (p.kind === 'feature') {
    graph.push({ '@type': 'TechArticle', '@id': `${url}#article`, url, headline: p.title, description: p.desc, image, datePublished: PUBLISHED, dateModified: ctx.today, inLanguage: 'en', proficiencyLevel: 'Beginner', articleSection: ctx.byId[p.part].title, author: { '@id': ORG_ID }, publisher: { '@id': ORG_ID }, isPartOf: { '@id': SITE_ID }, mainEntityOfPage: url, breadcrumb: { '@id': `${url}#breadcrumb` } }, breadcrumb);
  }
  if (p.video) graph.push(videoLd(p.video, ctx.videoCount, p.id));
  const noindex = p.kind === 'notfound';
  return `${base.trim()}
<title>${esc(p.headTitle)}</title>
<meta name="description" content="${esc(p.desc)}">
${noindex ? '<meta name="robots" content="noindex, follow">' : `<link rel="canonical" href="${url}">`}
<meta property="og:type" content="${isHome ? 'website' : 'article'}">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${esc(p.headTitle)}">
<meta property="og:description" content="${esc(p.desc)}">
<meta property="og:image" content="${image}">
<meta property="og:image:width" content="${iw}">
<meta property="og:image:height" content="${ih}">
<meta property="og:image:alt" content="${esc(p.imageAlt || p.headTitle)}">
${isHome || noindex ? '' : `<meta property="article:published_time" content="${PUBLISHED}">\n<meta property="article:modified_time" content="${ctx.today}">\n`}<meta name="twitter:title" content="${esc(p.headTitle)}">
<meta name="twitter:description" content="${esc(p.desc)}">
<meta name="twitter:image" content="${image}">
<meta name="twitter:image:alt" content="${esc(p.imageAlt || p.headTitle)}">
${noindex ? '' : ldScript(graph)}`;
}

function rewriteLinks(html, pageId, idPage, pageIds, issues) {
  return html
    .replace(/(src|href|poster)="(screens|videos)\//g, '$1="/$2/')
    .replace(/href="#([^"]*)"/g, (m, x) => {
      if (!x) return m;
      if (idPage.get(x) === pageId) return m;
      if (pageIds.has(x)) return `href="${urlFor(x)}"`;
      if (idPage.has(x)) return `href="${urlFor(idPage.get(x))}#${x}"`;
      issues.push(`${pageId}: link to #${x} has no target`);
      return m;
    });
}

export function buildGuide(root) {
  const site = path.join(root, 'public');
  const parts = parseToc(read(root, 'toc.html'));
  const screens = json(root, 'screens.json');
  const videos = json(root, 'videos.json').filter((v) => fs.existsSync(path.join(site, 'videos', `${v.slug}.mp4`)));
  const modules = json(root, 'modules.json');
  const videoFor = Object.fromEntries(videos.map((v) => [v.page, v]));
  const totalSections = parts.reduce((n, p) => n + p.items.length, 0);
  const totalVideo = videos.reduce((n, v) => n + (v.duration || 0), 0);
  const today = new Date().toISOString().slice(0, 10);
  const issues = [];

  const files = fs.readdirSync(path.join(root, 'content/parts')).filter((f) => /^part-\d\d\.html$/.test(f)).sort();
  const partHtml = files.map((f) => read(root, `parts/${f}`));
  const partInfo = partHtml.map((html, i) => {
    const m = /<h1 class="chapter" id="([^"]+)">([^<]+)<\/h1>/.exec(html);
    const feats = scanFeatures(html);
    const shots = feats.flatMap((f) => existing(site, screens[f.id]));
    return { id: m[1], h1: m[0], title: strip(m[2]).replace(/^\d+\.\s*/, ''), index: i + 1, feats, shots, steps: feats.reduce((n, f) => n + f.steps, 0) };
  });
  const uniqueShots = new Set(partInfo.flatMap((p) => p.shots.map((s) => s.file))).size;

  const pages = [];

  // Home
  const front = read(root, 'front.html');
  const kicker = /<p class="hero-kicker">[\s\S]*?<\/p>/.exec(front)[0];
  const h1 = /<h1 class="front" id="how-to-use">[\s\S]*?<\/h1>/.exec(front)[0];
  const lead = /<p class="lead">[\s\S]*?<\/p>/.exec(front)[0];
  let rest = front.replace('<section class="front">', '').replace(/<\/section>\s*$/, '').replace(kicker, '').replace(h1, '').replace(lead, '');
  rest = rest.replace(/<h3>What you can do<\/h3>\s*<div class="cap-grid">[\s\S]*?<\/div>\s*(?=<div class="subscribe">)/, '');
  const overview = videoFor[HOME_ID];
  const moduleCards = partInfo.map((p) => {
    const mod = modules[p.id] || {};
    const thumb = p.shots[0];
    const v = videoFor[p.id];
    return `<a class="module-card" href="#${p.id}">
<span class="module-media${thumb ? '' : ' module-media-empty'}">${thumb ? `<img src="screens/${thumb.file}" alt="" width="1440" height="900" loading="lazy" decoding="async">` : icon(mod.icon, 'icon module-empty-icon')}<span class="module-icon">${icon(mod.icon)}</span></span>
<span class="module-body"><span class="module-kicker">Part ${p.index}</span><span class="module-title">${esc(p.title)}</span><span class="module-desc">${esc(mod.desc || '')}</span>
<span class="module-foot"><span>${p.feats.length} sections</span>${v ? `<span class="module-video">${PLAY}${mmss(v.duration || 0)}</span>` : ''}</span></span></a>`;
  }).join('\n');
  pages.push({
    id: HOME_ID, kind: 'home', num: '', title: 'Introduction', headTitle: 'AnnaBooks Feature Guide: Invoices, Bills, Payroll & Reports',
    desc: 'Step-by-step AnnaBooks guide: set up a company, invoice customers, pay bills, bill consultant time, record payroll, reconcile the bank and read reports.',
    imageAlt: 'AnnaBooks Feature Guide — how the accounting app works', video: overview, shots: [],
    html: `<section class="page page-home" data-page="${HOME_ID}" data-kind="home">
<div class="hero">
<div class="hero-copy">${kicker}${h1}${lead}
<div class="hero-actions"><a class="btn btn-primary btn-lg" href="#${partInfo[0].feats[0].id}">Start with step 1${ARROW}</a><button class="btn btn-ghost btn-lg" type="button" data-open-search><svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>Search the guide<kbd>/</kbd></button></div>
<ul class="hero-stats"><li><b>${parts.length}</b><span>parts</span></li><li><b>${totalSections}</b><span>sections</span></li><li><b>${videos.length}</b><span>videos</span></li><li><b>${uniqueShots}</b><span>screens</span></li></ul>
</div>
<div class="hero-media">${overview ? videoCard(overview, 'vcard-hero') : ''}</div>
</div>
<section class="home-block" aria-labelledby="explore-the-guide">
<header class="block-head"><p class="eyebrow">${parts.length} parts · ${totalSections} sections</p><h2 id="explore-the-guide">Explore the guide</h2><p>Each part covers one area of AnnaBooks with a flowchart, clear steps, and product screenshots from one sample company.</p></header>
<div class="module-grid">${moduleCards}</div>
</section>
<section class="home-block" aria-labelledby="watch-the-series">
<header class="block-head"><p class="eyebrow">${videos.length} episodes · ${Math.round(totalVideo / 60)} minutes</p><h2 id="watch-the-series">Watch the video series</h2><p>Short narrated walkthroughs, one per module, using Northline Staffing's March 2026 books.</p></header>
<div class="episode-grid">${videos.map((v) => videoCard(v)).join('\n')}</div>
${overview ? transcript(overview) : ''}
</section>
<section class="home-block home-rest" aria-labelledby="before-you-start">
<header class="block-head"><p class="eyebrow">Before you start</p><h2 id="before-you-start">How AnnaBooks works</h2></header>
${rest.trim()}
</section>
</section>`,
  });

  // Parts and sections
  partHtml.forEach((src, i) => {
    const info = partInfo[i];
    const mod = modules[info.id] || {};
    const v = videoFor[info.id];
    const cards = info.feats.map((f) => {
      const s = existing(site, screens[f.id])[0];
      const n = existing(site, screens[f.id]).length;
      return `<a class="section-card" href="#${f.id}"><span class="section-media">${s ? `<img src="screens/${s.file}" alt="" width="1440" height="900" loading="lazy" decoding="async">` : `<span class="section-media-empty">${icon(f.report ? 'chart' : mod.icon)}</span>`}</span>
<span class="section-body"><span class="section-num">${f.num}</span><span class="section-title">${esc(f.title)}</span><span class="section-desc">${esc(clip(f.lead, 130))}</span><span class="section-foot">${f.report ? 'Sample records' : `${f.steps} steps`}${n ? ` · ${n} ${n === 1 ? 'screen' : 'screens'}` : ''}</span></span></a>`;
    }).join('\n');
    const head = `<header class="page part-head" data-page="${info.id}" data-kind="part" data-part="${info.id}">
<div class="part-hero">
<div class="part-hero-copy"><p class="eyebrow"><span class="part-icon">${icon(mod.icon)}</span>Part ${info.index} of ${files.length}</p>${info.h1}<p class="part-desc">${esc(mod.desc || '')}</p>
<ul class="part-stats"><li><b>${info.feats.length}</b> sections</li><li><b>${info.steps}</b> steps</li><li><b>${new Set(info.shots.map((s) => s.file)).size}</b> screens</li></ul>
<div class="part-actions"><a class="btn btn-primary" href="#${info.feats[0].id}">Start with ${info.feats[0].num}${ARROW}</a></div></div>
${v ? `<div class="part-hero-media">${videoCard(v, 'vcard-hero')}</div>` : ''}
</div>
<p class="grid-label">Sections in this part</p>
<div class="section-grid">${cards}</div>
${v ? transcript(v) : ''}
</header>`;
    let html = src.replace(info.h1, head);
    for (const f of info.feats) {
      const open = new RegExp(`<div class="(feature(?: feature-report)?)">(\\s*)<h2 id="${f.id}">([\\s\\S]*?)<\\/h2>\\s*(<p class="lead">[\\s\\S]*?<\\/p>)`);
      const shots = existing(site, screens[f.id]);
      html = html.replace(open, (all, cls, ws, h2, leadP) => {
        const meta = [f.report ? 'Sample records' : `${f.steps} steps`, shots.length ? `${shots.length} ${shots.length === 1 ? 'screen' : 'screens'}` : '', f.report ? '' : 'Workflow'].filter(Boolean);
        return `<div class="${cls} page" data-page="${f.id}" data-kind="feature" data-part="${info.id}">
<header class="sec-head"><p class="eyebrow"><a href="#${info.id}">Part ${info.index} · ${esc(info.title)}</a></p><h1 id="${f.id}">${h2}</h1>${leadP}<ul class="sec-meta">${meta.map((m) => `<li>${m}</li>`).join('')}</ul></header>
${gallery(shots, f.title)}`;
      });
    }
    const starts = [...html.matchAll(/<div class="feature(?: feature-report)? page" data-page="([^"]+)"/g)];
    const first = starts.length ? starts[0].index : html.length;
    const partShots = info.shots;
    pages.push({ id: info.id, kind: 'part', num: String(info.index), partNum: info.index, title: info.title, headTitle: `${info.title} | ${SITE_NAME}`, desc: mod.desc || `Part ${info.index} of the AnnaBooks feature guide.`, image: partShots[0]?.file, imageAlt: partShots[0] ? strip(partShots[0].caption) : '', video: v, shots: [], count: info.feats.length, icon: icon(mod.icon), html: html.slice(0, first).trim() });
    starts.forEach((m, k) => {
      const f = info.feats.find((x) => x.id === m[1]);
      const shots = existing(site, screens[f.id]);
      const anchored = addAnchors(html.slice(m.index, k + 1 < starts.length ? starts[k + 1].index : html.length).trim(), f.id);
      pages.push({ id: f.id, kind: 'feature', part: info.id, partNum: info.index, num: f.num, title: f.title, headTitle: `${f.title} | ${SITE_NAME}`, desc: clip(f.lead || `${f.title} in AnnaBooks, step by step.`, 158), image: shots[0]?.file, imageAlt: shots[0] ? strip(shots[0].caption) : '', shots, html: anchored.html, tabs: anchored.tabs, steps: anchored.steps });
    });
  });

  // Not found
  pages.push({
    id: '404', kind: 'notfound', num: '', title: 'Page not found', headTitle: `Page not found | ${SITE_NAME}`, desc: 'This page of the AnnaBooks feature guide could not be found.', shots: [],
    html: `<section class="page page-404" data-page="404" data-kind="notfound">
<div class="part-hero"><div class="part-hero-copy"><p class="eyebrow">Error 404</p><h1 class="chapter" id="page-not-found">This page could not be found</h1><p class="part-desc">The link may be old or mistyped. Search the guide, or pick one of the parts below.</p>
<div class="part-actions"><a class="btn btn-primary" href="#${HOME_ID}">Go to the guide home${ARROW}</a><button class="btn btn-ghost" type="button" data-open-search>Search the guide<kbd>/</kbd></button></div></div></div>
<p class="grid-label">Parts of the guide</p>
<div class="module-grid">${moduleCards}</div>
</section>`,
  });

  const pageIds = new Set(pages.filter((p) => p.kind !== 'notfound').map((p) => p.id));
  const idPage = new Map();
  for (const p of pages) for (const m of p.html.matchAll(/\sid="([^"]+)"/g)) if (!idPage.has(m[1])) idPage.set(m[1], p.id);
  for (const p of pages) p.html = rewriteLinks(p.html, p.id, idPage, pageIds, issues);

  const byId = Object.fromEntries(pages.map((p) => [p.id, p]));
  const ctx = { byId, today, videoCount: videos.length, partTitles: partInfo.map((p) => p.title) };
  const base = read(root, 'head.html');
  for (const p of pages) p.head = headFor(base, p, ctx);
  const nav = navHtml(parts);
  const chromeCtx = { byId, sequence: pages.filter((p) => p.kind === 'home' || p.kind === 'feature'), features: pages.filter((p) => p.kind === 'feature') };
  for (const p of pages) { p.chrome = chromeFor(p, chromeCtx); p.nav = navFor(nav, p); }

  const siteData = { pages: pages.filter((p) => p.kind !== 'notfound').map((p) => ({ id: p.id, kind: p.kind, part: p.part || null, num: p.num, title: p.title, partNum: p.partNum || null, url: urlFor(p.id), ...(p.kind === 'part' ? { count: p.count, icon: p.icon } : {}) })) };
  const videoData = videos.map((v) => ({ slug: v.slug, episode: v.episode, title: v.title, subtitle: v.subtitle, duration: v.duration, page: v.page, url: urlFor(v.page), transcript: v.transcript, vtt: fs.existsSync(path.join(site, 'videos', `${v.slug}.vtt`)) }));
  const shared = `${jsonScript('ab-site', siteData)}\n${jsonScript('ab-videos', videoData)}`;
  const searchIndex = Object.fromEntries(pages.filter((p) => p.kind !== 'notfound').map((p) => [p.id, searchText(p.html)]));

  const entry = (p) => {
    const imgs = p.kind === 'home' ? ['og-image.png', 'annabooks-logo.jpg'] : [...new Set(p.shots.map((s) => `screens/${s.file}`))];
    const v = p.video;
    return `  <url>
    <loc>${absUrl(p.id)}</loc>
    <lastmod>${today}</lastmod>
${imgs.map((f) => `    <image:image><image:loc>${SITE_URL}${f}</image:loc></image:image>`).join('\n')}${v ? `
    <video:video>
      <video:thumbnail_loc>${SITE_URL}videos/${v.slug}.jpg</video:thumbnail_loc>
      <video:title>${esc(`AnnaBooks: ${v.title}`)}</video:title>
      <video:description>${esc(`${v.subtitle}. Episode ${v.episode} of ${videos.length} in the AnnaBooks walkthrough.`)}</video:description>
      <video:content_loc>${SITE_URL}videos/${v.slug}.mp4</video:content_loc>${v.duration ? `\n      <video:duration>${Math.round(v.duration)}</video:duration>` : ''}
      <video:publication_date>${v.uploadDate || '2026-10-22'}</video:publication_date>
    </video:video>` : ''}
  </url>`;
  };
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${pages.filter((p) => p.kind !== 'notfound').map(entry).join('\n')}
</urlset>
`;

  return {
    pages, byId, nav, shared, searchIndex, sitemap, issues,
    stats: { parts: parts.length, sections: totalSections, pages: pageIds.size, images: uniqueShots, videos: videos.length },
  };
}

export function pageIdForUrl(guide, url) {
  const p = decodeURIComponent((url || '/').split(/[?#]/)[0]).replace(/\/index\.html$/, '/').replace(/^\/+|\/+$/g, '');
  if (!p) return HOME_ID;
  return guide.byId[p] && p !== HOME_ID ? p : '404';
}

const HEAD_RE = /<!--ab:head-->[\s\S]*?<!--\/ab:head-->/;
const NAV_RE = /<!--ab:nav-->[\s\S]*?<!--\/ab:nav-->/;
const CONTENT_RE = /<!--ab:content-->[\s\S]*?<!--\/ab:content-->/;

export function fillTemplate(template, guide, id = HOME_ID) {
  const p = guide.byId[id];
  const c = p.chrome;
  const head = `<!--ab:head-->\n${p.head}\n<!--/ab:head-->`;
  const nav = `<!--ab:nav-->${p.nav}<!--/ab:nav-->`;
  const content = `<!--ab:content-->\n${p.html}\n${guide.shared}\n<!--/ab:content-->`;
  const filled = template.includes('<!--@head-->')
    ? template.replace('<!--@head-->', head).replace('<!--@nav-->', nav).replace('<!--@content-->', content)
    : template.replace(HEAD_RE, head).replace(NAV_RE, nav).replace(CONTENT_RE, content);
  return filled
    .replace(/<body[^>]*>/, `<body data-view="${p.kind}" data-page="${p.id}">`)
    .replace(/<nav class="crumbs" aria-label="Breadcrumb">[\s\S]*?<\/nav>/, `<nav class="crumbs" aria-label="Breadcrumb">${c.crumbs}</nav>`)
    .replace(/<span class="page-meta">[\s\S]*?<\/span>/, `<span class="page-meta">${c.meta}</span>`)
    .replace(/<nav class="sec-nav"[\s\S]*?<\/nav>/, c.secnav || '<nav class="sec-nav" aria-label="This section" hidden></nav>')
    .replace(/<nav class="pager" aria-label="Previous and next section">[\s\S]*?<\/nav>/, `<nav class="pager" aria-label="Previous and next section">${c.pager}</nav>`)
    .replace(/<aside class="rail"[^>]*>/, `<aside class="rail" aria-label="On this page"${c.railEmpty ? ' data-empty' : ''}>`)
    .replace(/<ol class="rail-list">[\s\S]*?<\/ol>/, `<ol class="rail-list">${c.rail}</ol>`);
}

export const stripMarkers = (html) => html.replace(/<!--\/?ab:(head|nav|content)-->\n?/g, '');

function checkPage(html, site, guide) {
  const issues = [];
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  const seen = new Set();
  for (const id of ids) { if (seen.has(id)) issues.push(`duplicate id: ${id}`); seen.add(id); }
  for (const m of html.matchAll(/href="#([^"]+)"/g)) if (!seen.has(m[1])) issues.push(`broken link: #${m[1]}`);
  for (const m of html.matchAll(/href="\/(?:([a-z0-9-]+)\/)?(?:#([^"]+))?"/g)) {
    const target = m[1] || HOME_ID;
    if (!guide.byId[target] || target === '404') { issues.push(`broken link: /${m[1] || ''}/`); continue; }
    if (m[2] && !new RegExp(`\\sid="${m[2].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`).test(guide.byId[target].html)) issues.push(`broken link: ${urlFor(target)}#${m[2]}`);
  }
  for (const m of html.matchAll(/(?:src|href|poster)="\/?((?:screens|videos)\/[^"]+)"/g)) if (!fs.existsSync(path.join(site, m[1]))) issues.push(`missing file: ${m[1]}`);
  const body = html.slice(html.indexOf('<body'));
  for (const t of ['div', 'section', 'article', 'figure', 'table', 'details', 'ol', 'ul', 'header', 'aside', 'main', 'nav', 'a', 'button']) {
    const a = (body.match(new RegExp(`<${t}[\\s>]`, 'g')) || []).length;
    const b = (body.match(new RegExp(`</${t}>`, 'g')) || []).length;
    if (a !== b) issues.push(`unbalanced <${t}>: ${a} open, ${b} close`);
  }
  if ((html.match(/<h1[\s>]/g) || []).length !== 1) issues.push(`expected one <h1>, found ${(html.match(/<h1[\s>]/g) || []).length}`);
  if (/Ã.|â€|\uFFFD/.test(html)) issues.push('broken characters (encoding) found');
  return issues;
}

export function checkSite(template, guide, site) {
  const issues = [...guide.issues];
  for (const p of guide.pages) for (const i of checkPage(fillTemplate(template, guide, p.id), site, guide)) issues.push(`${p.id}: ${i}`);
  return issues;
}
