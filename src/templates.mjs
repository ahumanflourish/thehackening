// Page templates. Structure and field labels only: all reader-facing copy comes
// from data/*.yaml, CONTRIBUTING.md and research/notes.md.

import { marked } from 'marked';
import { tile, GRID_DEFS } from './tiles.mjs';
import { threatDiagram } from './diagrams.mjs';

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const md = (s) => marked.parseInline(String(s ?? ''));
const when = (cond, html) => (cond ? (typeof html === 'function' ? html() : html) : '');
const each = (items, fn) => (items ?? []).map(fn).join('');

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fmtDate = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
};
const time = (iso) => `<time datetime="${iso}">${fmtDate(iso)}</time>`;
const host = (url) => new URL(url).hostname.replace(/^www\./, '');
const ext = (url, text) => `<a href="${esc(url)}" rel="noopener noreferrer">${text}</a>`;
const monthsBetween = (a, b) => (Date.parse(b) - Date.parse(a)) / (1000 * 60 * 60 * 24 * 30.44);

export function renderSite(ctx) {
  const { site, advice, incidents, questions, basics, charts, builtOn } = ctx;
  const defs = site.definitions;
  const adviceById = new Map(advice.map((a) => [a.id, a]));
  const incidentsByAdvice = new Map();
  const questionsByAdvice = new Map();
  const index = (map, rows) => {
    for (const row of rows)
      for (const id of row.related_advice ?? []) map.set(id, [...(map.get(id) ?? []), row]);
  };
  index(incidentsByAdvice, incidents);
  index(questionsByAdvice, questions);
  const byDateDesc = (a, b) => b.date.localeCompare(a.date);
  const asOf = [...advice.map((a) => a.updated), ...incidents.map((i) => i.updated ?? i.date)].sort().at(-1);

  // ---------------------------------------------------------------- shell

  const layout = ({ path, title, headTitle, intro, body, cls = '' }) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title || headTitle ? `${title || headTitle} | ${site.name}` : `${site.name}: ${site.headline} ${site.subhead}`)}</title>
<meta name="description" content="${esc(intro ?? site.lede)}">
<link rel="stylesheet" href="/style.css">
<link rel="stylesheet" href="/diagrams.css">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
</head>
<body class="${cls}">
<a class="skip" href="#main">Skip to content</a>
<header class="site-head">
  <a class="wordmark" href="/"${when(path === '/', ' aria-current="page"')}>${esc(site.name)}</a>
  <nav aria-label="Main">
    ${each(site.nav, (n) => `<a href="${n.href}"${when(path === n.href, ' aria-current="page"')}>${esc(n.label)}</a>`)}
  </nav>
</header>
<main id="main">
${when(title, () => `<header class="page-head"><h1>${esc(title)}</h1>${when(intro, `<p class="lede">${md(intro)}</p>`)}</header>`)}
${body}
</main>
<footer class="site-foot">
  <p class="notice">${md(site.notice)}</p>
  ${when(site.never, () => `<p class="notice">${md(site.never)}</p>`)}
  <p>Content as of ${time(asOf)}. Built ${time(builtOn)}.
    ${each(site.footer_links, (l) => `<a href="${l.href}">${esc(l.label)}</a>. `)}
    ${ext(site.repo_url, 'Source and data on GitHub')}.</p>
</footer>
</body>
</html>
`;

  // --------------------------------------------------------------- labels

  const modelById = new Map(site.threat_models.map((m) => [m.id, m]));
  const incidentById = new Map(incidents.map((i) => [i.id, i]));

  const aiLevel = (level) =>
    `<span class="ai ai-${level}" title="${esc(defs.ai_level[level].meaning)}"><i aria-hidden="true"></i>${esc(defs.ai_level[level].label)}</span>`;

  const stages = Object.keys(defs.ai_stage);
  const levels = Object.keys(defs.ai_level);
  // One overall rating per event: the strongest level reported at any stage.
  const overall = (i) => {
    // The headline rating describes the attack itself (or AI acting alone), never how defenders found a flaw.
    const by = Object.fromEntries((i.ai_involvement ?? []).map((r) => [r.stage, r.level]));
    const got = [by.attack, by.agent_behavior].filter(Boolean);
    if (!got.length) return 'unknown';
    return ['confirmed', 'suspected', 'unknown', 'unlikely'].find((l) => got.includes(l));
  };
  // Short AI-involvement mark used beside any mention of an incident, so the home page never claims more than the news page.
  const aiMark = (i) => { const l = overall(i); return `<span class="ai-note ai-${l}"><span class="ai ai-${l}"><i aria-hidden="true"></i></span>${esc(site.pages.incidents.badge)}: ${esc(defs.ai_level[l].label.toLowerCase())}</span>`; };

  const sourceList = (sources) =>
    `<ul class="sources">${each(sources, (s) => `<li>${ext(s.url, esc(s.title))} <span class="host">${esc(host(s.url))}</span></li>`)}</ul>`;

  const adviceLinks = (idsList) =>
    each(idsList, (id) => `<li><a href="/do/${id}/">${esc(adviceById.get(id).title)}</a></li>`);

  // Badges open a native popover (no JavaScript) holding the definition and sources.
  const gauge = (level) => {
    const n = { established: 3, reasoned: 2, speculative: 1 }[level];
    return `<span class="gauge" aria-hidden="true">${[1, 2, 3].map((i) => `<i${i <= n ? ' class="on"' : ''}></i>`).join('')}</span>`;
  };
  const reviewDue = (a) => {
    const latest = (a.reviews ?? []).map((r) => r.date).sort().at(-1);
    return a.review_status === 'expert_reviewed' && latest && monthsBetween(latest, builtOn) > defs.review_due_months;
  };
  const badges = (a) => {
    const conf = defs.confidence[a.confidence];
    const rev = defs.review_status[a.review_status];
    return `<div class="badges">
    <button type="button" class="badge" popovertarget="ev-${a.id}">${gauge(a.confidence)}Evidence <b>${esc(conf.label)}</b></button>
    <button type="button" class="badge badge-${a.review_status}" popovertarget="rv-${a.id}">Checked by <b>${esc(rev.label)}</b></button>
    ${when(a.sides, '<span class="badge flag">Disputed</span>')}
    ${when(a.needs_source, '<a class="badge flag" href="/contribute/">Needs a source</a>')}
    ${when(reviewDue(a), `<span class="badge flag">${esc(defs.review_due_label)}</span>`)}
    <div class="pop" popover id="ev-${a.id}"><button type="button" class="pop-close" popovertarget="ev-${a.id}" popovertargetaction="hide" aria-label="Close">&times;</button>
      <p class="pop-title">${gauge(a.confidence)}Evidence: ${esc(conf.label)}</p>
      <p>${esc(conf.meaning)}</p>
      ${when(a.confidence_note, `<p>${esc(a.confidence_note)}</p>`)}
      ${when(a.sources?.length, () => `<h5>Sources</h5>${sourceList(a.sources)}`)}
      <p class="pop-foot">Updated ${time(a.updated)}</p>
    </div>
    <div class="pop" popover id="rv-${a.id}"><button type="button" class="pop-close" popovertarget="rv-${a.id}" popovertargetaction="hide" aria-label="Close">&times;</button>
      <p class="pop-title">Checked by: ${esc(rev.label)}</p>
      <p>${esc(rev.meaning)}</p>
      ${each(a.reviews, (r) => `<p>${esc(r.name)} (${r.profile ? ext(r.profile, esc(r.background)) : esc(r.background)}), ${time(r.date)}. Checked: ${esc(r.scope)}</p>`)}
      <p><a href="/contribute/">${esc(site.home.help_link)}</a></p>
    </div>
  </div>`;
  };

  // The on-demand layer: mechanism, what it protects against, dispute, sources, origin.
  const detailBody = (a) => {
    const relatedIncidents = incidentsByAdvice.get(a.id) ?? [];
    const relatedQuestions = questionsByAdvice.get(a.id) ?? [];
    return `<p class="advice">${esc(a.advice)}</p>
    <dl class="reasoning">
      <dt>How it works</dt><dd>${esc(a.why)}</dd>
      <dt>Protects against</dt><dd>${esc(a.protects_against)}</dd>
    </dl>
    ${when(a.sides, () => `<section class="sides" aria-label="Disagreement">
      <div><h5>For</h5><p>${esc(a.sides.for)}</p></div>
      <div><h5>Against</h5><p>${esc(a.sides.against)}</p></div>
      <div class="synthesis"><h5>On balance</h5><p>${esc(a.sides.synthesis)}</p></div>
    </section>`)}
    <div class="evidence">
      ${when(a.sources?.length, () => `<section><h5>Sources</h5>${sourceList(a.sources)}</section>`)}
      ${when(relatedIncidents.length || relatedQuestions.length, () => `<section><h5>Related</h5><ul class="sources">${each(
        relatedIncidents,
        (i) => `<li>Incident: <a href="/incidents/#${i.id}">${esc(i.title)}</a></li>`,
      )}${each(relatedQuestions, (q) => `<li>Open question: <a href="/questions/#${q.id}">${esc(q.question)}</a></li>`)}</ul></section>`)}
      ${when(a.thread_refs?.length, () => `<section><h5>Where this came from</h5><ul class="sources">${each(
        a.thread_refs,
        (t) => `<li>${ext(t.url, esc(t.author))}, in online discussion${when(t.note, `: ${esc(t.note)}`)}</li>`,
      )}</ul></section>`)}
    </div>`;
  };
  const detail = (a) => `<details class="more"><summary>${esc(site.home.detail_label)}</summary>${detailBody(a)}</details>`;

  const coversText = (a) => a.covers.map((c) => `<b>${esc(modelById.get(c).tab)}</b>`).join(', ');

  // A step in the table: opening it gives the reason, the short version and a link to its guide.
  const actionItem = (a, n) => `<details class="action" id="${a.id}" data-tier="${a.tier}">
  <summary>
    <span class="a-n">${n}</span>
    <span class="a-title">${esc(a.title)}</span>
    <span class="chip">Time <b>${esc(a.time)}</b></span>
    <span class="chip">Cost <b>${esc(a.money)}</b></span>
  </summary>
  <div class="a-body">
    <p class="short">${esc(a.short)}</p>
    <p>${esc(a.advice)}</p>
    <p><a class="go" href="/do/${a.id}/">${esc(site.home.guide_link)}</a></p>
  </div>
</details>`;

  const knowItem = (a) => `<article class="know" id="${a.id}">
  <p class="know-kind">${esc(site.kinds[a.kind])}</p>
  <h4><a href="/do/${a.id}/">${esc(a.title)}</a></h4>
  <p class="short">${esc(a.short)}</p>
</article>`;

  // The guide page for one item: an article with numbered steps, the reasoning, and sources.
  const guidePage = (a) => {
    const relatedIncidents = incidentsByAdvice.get(a.id) ?? [];
    const relatedQuestions = questionsByAdvice.get(a.id) ?? [];
    const g = site.pages.guide;
    const ordered = advice.filter((x) => x.kind === 'action').sort((x, y) => x.rank - y.rank);
    const pos = ordered.findIndex((x) => x.id === a.id);
    return layout({
      path: `/do/${a.id}/`,
      cls: 'guide',
      headTitle: a.title,
      intro: a.short,
      body: `<div class="g-wrap">
  <details class="g-nav" open>
    <summary>${esc(g.back)}</summary>
    <ol>
      ${each(ordered, (x, i) => `<li${when(x.id === a.id, ' aria-current="page"')}><a href="/do/${x.id}/"><span>${i + 1}</span>${esc(x.title)}</a></li>`)}
    </ol>
    <p><a href="/#advice">${esc(g.table)}</a></p>
  </details>
  <article class="g-main">
    ${when(a.kind !== 'action', () => `<p class="know-kind">${esc(site.kinds[a.kind])}</p>`)}
    <h1>${esc(a.title)}</h1>
    <p class="standfirst">${esc(a.short)}</p>
    <div class="g-meta">
      ${when(a.kind === 'action', () => `<span class="chip">Time <b>${esc(a.time)}</b></span><span class="chip">Cost <b>${esc(a.money)}</b></span>`)}
      ${badges(a)}
    </div>

    <section>
      <h2>${esc(a.kind === 'action' ? g.what : g.fact)}</h2>
      <p>${esc(a.advice)}</p>
      ${when(a.steps?.length, () => `<ol class="steps">${each(a.steps, (st) => `<li>
        <p class="step-do">${esc(st.do)}</p>
        ${when(st.detail, () => `<p class="step-detail">${esc(st.detail)}</p>`)}
        ${when(st.url, () => `<p class="step-link">${ext(st.url, esc(st.link ?? host(st.url)))} <span class="host">${esc(host(st.url))}</span></p>`)}
      </li>`)}</ol>`)}
    </section>

    <section>
      <h2>${esc(g.why)}</h2>
      <p>${esc(a.why)}</p>
      <p class="g-protects"><b>${esc(g.protects)}</b> ${esc(a.protects_against)}</p>
    </section>

    ${when(a.sides, () => `<section>
      <h2>${esc(g.disagree)}</h2>
      <div class="sides">
        <div><h5>For</h5><p>${esc(a.sides.for)}</p></div>
        <div><h5>Against</h5><p>${esc(a.sides.against)}</p></div>
        <div class="synthesis"><h5>On balance</h5><p>${esc(a.sides.synthesis)}</p></div>
      </div>
    </section>`)}

    ${when(a.sources?.length || a.needs_source, () => `<section>
      <h2>${esc(g.sources)}</h2>
      ${when(a.sources?.length, () => sourceList(a.sources))}
      ${when(a.confidence_note, () => `<p class="g-note">${esc(a.confidence_note)}</p>`)}
    </section>`)}

    ${when(relatedIncidents.length || relatedQuestions.length, () => `<section>
      <h2>${esc(g.related)}</h2>
      <ul class="sources">${each(relatedIncidents, (i) => `<li>${time(i.date)} <a href="/incidents/#${i.id}">${esc(i.title)}</a></li>`)}${each(
        relatedQuestions,
        (q) => `<li>Open question: <a href="/questions/#${q.id}">${esc(q.question)}</a></li>`,
      )}</ul>
    </section>`)}

    ${when(a.thread_refs?.length, () => `<section>
      <h2>${esc(g.origin)}</h2>
      <ul class="sources">${each(a.thread_refs, (t) => `<li>${ext(t.url, esc(t.author))}, in online discussion${when(t.note, `: ${esc(t.note)}`)}</li>`)}</ul>
    </section>`)}
    <p class="g-foot">${esc(g.helps)}: ${a.covers.map((c) => esc(modelById.get(c).tab)).join(', ')}. ${esc(g.updated)} ${time(a.updated)}.</p>
    ${when(pos >= 0, () => `<nav class="g-next" aria-label="More steps">
      ${pos > 0 ? `<a href="/do/${ordered[pos - 1].id}/"><small>Previous step</small>${esc(ordered[pos - 1].title)}</a>` : '<span></span>'}
      ${pos < ordered.length - 1 ? `<a class="g-fwd" href="/do/${ordered[pos + 1].id}/"><small>Next step</small>${esc(ordered[pos + 1].title)}</a>` : '<span></span>'}
    </nav>`)}
  </article>
</div>`,
    });
  };


  // ---------------------------------------------------------------- chart

  // One series, monthly bars, drawn as static SVG. Each bar has a native tooltip;
  // the full numbers are in a table underneath.
  const barChart = (c) => {
    const W = 720, H = 300, L = 44, R = 12, T = 28, B = 30;
    const pts = c.points;
    const max = Math.max(...pts.map((p) => p.value));
    const step = [50, 100, 250, 500, 1000, 2500].find((s) => max / s <= 5);
    const top = Math.ceil(max / step) * step;
    const slot = (W - L - R) / pts.length;
    const bw = Math.max(2, slot - 2);
    const y = (v) => T + (H - T - B) * (1 - v / top);
    const label = (m) => `${MONTHS[Number(m.slice(5)) - 1]} ${m.slice(0, 4)}`;
    const peak = pts.reduce((a, b) => (b.value > a.value ? b : a));
    const grid = [];
    for (let v = 0; v <= top; v += step)
      grid.push(`<line class="grid" x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"/><text class="tick" x="${L - 8}" y="${y(v) + 4}" text-anchor="end">${v}</text>`);
    const bars = pts.map((p, i) => {
      const x = L + i * slot + 1;
      const h = Math.max(1, y(0) - y(p.value));
      const year = p.month.endsWith('-01')
        ? `<line class="grid" x1="${x - 1}" x2="${x - 1}" y1="${y(0)}" y2="${y(0) + 6}"/><text class="tick" x="${x + 2}" y="${H - 8}">${p.month.slice(0, 4)}</text>`
        : '';
      return `${year}<rect class="bar" x="${x.toFixed(1)}" y="${(y(0) - h).toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" rx="1.5"><title>${label(p.month)}: ${p.value} ${esc(c.unit)}</title></rect>`;
    });
    const pi = pts.indexOf(peak);
    const px = L + pi * slot + slot / 2;
    return `<figure class="chart" id="${c.id}">
  <figcaption><strong>${esc(c.title)}</strong><span>${esc(c.takeaway)}</span></figcaption>
  <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMinYMid meet" role="img" aria-label="${esc(`${c.title}. ${c.takeaway}`)}">
    ${grid.join('')}
    ${bars.join('')}
    <text class="callout" x="${px - slot / 2 - 6}" y="${y(peak.value) + 12}" text-anchor="end">${peak.value} in ${label(peak.month)}</text>
  </svg>
  <details class="more"><summary>${esc(site.home.chart_about)}</summary>
    <p class="chart-note">${esc(c.note)}</p>
    <p class="chart-source">Source: ${ext(c.source.url, esc(c.source.title))}, as of ${time(c.as_of)}.${when(c.also, () => ` See also ${ext(c.also.url, esc(c.also.title))}.`)}</p>
    <table class="data"><thead><tr><th>Month</th><th>${esc(c.unit)}</th></tr></thead><tbody>${each(pts, (p) => `<tr><td>${label(p.month)}</td><td>${p.value}</td></tr>`)}</tbody></table>
  </details>
</figure>`;
  };

  // ----------------------------------------------------------------- home

  const actions = advice.filter((a) => a.kind === 'action');
  const h = site.home;

  const home = layout({
    path: '/',
    cls: 'home',
    body: `<section class="screen dark hero" id="top">
  <div class="hero-text">
    <h1>${esc(site.headline)}</h1>
    <p class="subhead">${esc(site.subhead)}</p>
    <p class="lede">${md(site.lede)}</p>
    <p class="cta-row">
      <a class="cta" href="#advice">${esc(h.hero_cta)}</a>
      <a class="cta cta-2" href="#threats">${esc(h.hero_cta2)}</a>
    </p>
    ${when(h.byline, () => `<p class="byline"><span>${esc(h.byline)}</span><span>Updated ${time(asOf)}</span><a href="/about/">About</a></p>`)}
  </div>
</section>

<section class="screen cols" id="why" aria-labelledby="why-h">
  <header class="screen-head">
    <h2 id="why-h">${esc(h.why_title)}</h2>
    <p>${md(h.outlook)}</p>
    <p><a class="go" href="/incidents/">${esc(h.examples_more)}</a></p>
  </header>
  <ul class="examples">
    ${each(h.examples, (e) => {
      const i = incidentById.get(e.incident);
      return `<li><p class="fig"><strong>${esc(e.figure)}</strong> <span>${esc(e.label)}</span></p><p>${esc(e.text)}</p><p class="ex-meta">${time(i.date)}${aiMark(i)}<a href="/incidents/#${i.id}">Details</a></p></li>`;
    })}
  </ul>
</section>

<section class="screen dark cols" id="changed" aria-labelledby="ch-h">
  <header class="screen-head">
    <h2 id="ch-h">${esc(h.then_now_title)}</h2>
    <dl class="thennow">
      ${each(h.then_now, (r) => `<div><dt>${esc(r.what)}</dt><dd><s>${esc(r.before)}</s><b>${esc(r.now)}</b></dd></div>`)}
    </dl>
  </header>
  ${each(charts.slice(0, 1), barChart)}
</section>

<section class="screen cols" id="threats" aria-labelledby="threats-h">
  <header class="screen-head">
    <h2 id="threats-h">${esc(h.threats_title)}</h2>
    <p>${md(h.threats_intro)}</p>
    <div class="tablist" role="radiogroup" aria-labelledby="threats-h">
      ${each(site.threat_models, (m) => `<label class="tab" data-threat="${m.id}"><input type="radio" name="threat" id="t-${m.id}"${when(m === site.threat_models[0], " checked")}><span>${esc(m.tab)}</span></label>`)}
    </div>
  </header>
  <div class="panels">
  ${each(site.threat_models, (m) => {
    const facts = advice.filter((a) => a.kind !== 'action' && a.covers[0] === m.id);
    const n = actions.filter((a) => a.covers.includes(m.id)).length;
    return `<div class="panel" data-threat="${m.id}">
    <h3>${esc(m.reach)}</h3>
    ${threatDiagram(m.id)}
    <div class="panel-main">
      <p><a class="go" href="#advice">${esc(h.threat_link)}</a></p>
      ${when(m.incidents?.length, () => `<h4 class="minor">${esc(h.threat_incidents_label)}</h4>
      <ul class="sources">${each(m.incidents, (id) => `<li>${time(incidentById.get(id).date)} <a href="/incidents/#${id}">${esc(incidentById.get(id).title)}</a> ${aiMark(incidentById.get(id))}</li>`)}</ul>`)}
    </div>
    ${when(facts.length, () => `<div class="panel-side">${each(facts, knowItem)}</div>`)}
  </div>`;
  })}
  </div>
</section>

<section class="screen cols tall" id="advice" aria-labelledby="advice-h">
  <header class="screen-head">
    <h2 id="advice-h">${esc(h.advice_title)}</h2>
    <p>${md(h.advice_intro)}</p>
    <p><a class="go" href="/checklist/">${esc(h.advice_print)}</a></p>
  </header>
  <div>
    <div class="levels" role="radiogroup" aria-label="${esc(h.advice_title)}">
      ${each(site.tiers, (t, i) => `<label class="level"><input type="radio" name="level" id="lv-${t.id}"${when(i === 0, ' checked')}><span><b>${esc(t.name)}</b><small>${actions.filter((a) => a.tier === t.id).length} steps, ${esc(t.effort.toLowerCase())}</small></span></label>`)}
      <label class="level"><input type="radio" name="level" id="lv-all"><span><b>${esc(h.advice_all)}</b><small>${actions.length} steps</small></span></label>
    </div>
    <div class="tiers">
    ${each([...actions].sort((x, y) => x.rank - y.rank), (a, i) => actionItem(a, i + 1))}
    </div>
  </div>
</section>

<section class="screen dark cols" id="help" aria-labelledby="help-h">
  <header class="screen-head"><h2 id="help-h">${esc(h.help_title)}</h2></header>
  <div class="help-body">
    ${each(h.help, (p) => `<p>${md(p)}</p>`)}
    <p><a class="go" href="/contribute/">${esc(h.help_link)}</a></p>
  </div>
</section>`,
  });

  // --------------------------------------------------------------- basics

  const basicsPage = layout({
    path: '/basics/',
    title: site.pages.basics.title,
    intro: site.pages.basics.intro,
    body: `<div class="entries">${each(
      basics,
      (b) => `<article class="entry" id="${b.id}">
  <h2>${ext(b.url, esc(b.title))} <span class="host">${esc(host(b.url))}</span></h2>
  <dl class="reasoning">
    <dt>Covers</dt><dd>${esc(b.what_it_covers)}</dd>
    <dt>Under the new threat model</dt><dd>${esc(b.commentary)}</dd>
  </dl>
</article>`,
    )}</div>`,
  });

  // ------------------------------------------------------------ questions

  const statusOrder = Object.keys(defs.question_status);
  const questionsPage = layout({
    path: '/questions/',
    title: site.pages.questions.title,
    intro: site.pages.questions.intro,
    body: `<div class="entries">${each(
      [...questions].sort((a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status)),
      (q) => `<article class="entry" id="${q.id}">
  <p class="entry-meta"><span class="label qstatus qstatus-${q.status}">${esc(defs.question_status[q.status].label)}</span>
    ${when(q.asked_by?.length, () => `Asked by ${q.asked_by.map((a) => ext(a.url, esc(a.author))).join(', ')}`)}</p>
  <h2><a href="#${q.id}">${esc(q.question)}</a></h2>
  ${when(q.current_best_answer, () => `<dl class="reasoning"><dt>Current best answer</dt><dd>${esc(q.current_best_answer)}</dd></dl>`)}
  <div class="evidence">
    ${when(q.sources?.length, () => `<section><h4>Sources</h4>${sourceList(q.sources)}</section>`)}
    ${when(q.related_advice?.length, () => `<section><h4>Related advice</h4><ul class="sources">${adviceLinks(q.related_advice)}</ul></section>`)}
  </div>
</article>`,
    )}</div>`,
  });

  // ------------------------------------------------------------ incidents

  const story = (i, lead) => {
    const lvl = overall(i);
    const first = i.sources?.[0];
    const t = tile(i, lvl, lead);
    return `<article class="story${lead ? ' lead' : ''}${t ? ' has-tile' : ''}" id="${i.id}" data-ai="${lvl}">
  ${when(t, () => `<div class="tile ${t.cls}" aria-hidden="true">${t.svg}${when(t.caption, `<span class="tile-cap">${esc(t.caption)}</span>`)}</div>`)}
  <div class="story-body">
  <p class="story-meta">${time(i.date)}${when(first, () => `<span>${esc(host(first.url))}</span>`)}</p>
  <h3>${first ? ext(first.url, esc(i.title)) : esc(i.title)}</h3>
  <p class="story-sum">${esc(i.summary)}</p>
  <div class="badges">
    <button type="button" class="badge" popovertarget="ai-${i.id}"><span class="ai ai-${lvl}"><i aria-hidden="true"></i></span>${esc(np.badge)} <b>${esc(defs.ai_level[lvl].label)}</b></button>
    ${when(i.needs_research, () => `<a class="badge flag" href="/contribute/">${esc(np.developing)}</a>`)}
    <div class="pop" popover id="ai-${i.id}"><button type="button" class="pop-close" popovertarget="ai-${i.id}" popovertargetaction="hide" aria-label="Close">&times;</button>
      <p class="pop-title">${esc(np.badge)}: ${esc(defs.ai_level[lvl].label)}</p>
      <p>${esc(defs.ai_level[lvl].meaning)}</p>
      <table class="ai-table"><tbody>
      ${each(stages, (st) => {
        const r = (i.ai_involvement ?? []).find((x) => x.stage === st);
        return `<tr><th scope="row">${esc(defs.ai_stage[st].label)}</th><td>${r ? aiLevel(r.level) : '<span class="ai ai-none">Not rated</span>'}${when(r?.note, () => `<br><span class="note">${esc(r.note)}</span>`)}</td></tr>`;
      })}
      </tbody></table>
    </div>
  </div>
  <details class="more"><summary>${esc(np.more)}</summary>
    <p class="story-full">${esc(i.summary)}</p>
    ${when(i.impact, () => `<dl class="reasoning"><dt>Impact</dt><dd>${esc(i.impact)}</dd></dl>`)}
    <div class="evidence">
      ${when(i.sources?.length, () => `<section><h5>Sources</h5>${sourceList(i.sources)}</section>`)}
      ${when(i.related_advice?.length, () => `<section><h5>What to do about it</h5><ul class="sources">${adviceLinks(i.related_advice)}</ul></section>`)}
    </div>
  </details>
  </div>
</article>`;
  };
  const np = site.pages.incidents;
  const current = incidents.filter((i) => i.kind === 'current').sort(byDateDesc);
  // The lead story is the newest one shown by default, i.e. with confirmed or suspected AI involvement.
  const leadStory = current.find((i) => ['confirmed', 'suspected'].includes(overall(i))) ?? current[0];
  const incidentsPage = layout({
    path: '/incidents/',
    cls: 'news',
    intro: np.intro,
    headTitle: np.title,
    body: `${GRID_DEFS}<div class="screen cols tall">
  <header class="screen-head">
    <h1>${esc(np.title)}</h1>
    <p>${esc(np.intro)}</p>
    <div class="filter" role="radiogroup" aria-label="${esc(np.filter_label)}">
      <span>${esc(np.filter_label)}</span>
      <label class="pick" data-ai="ai"><input type="radio" name="ai" id="ai-f-ai" checked><span>${esc(np.filter_default)}</span></label>
      ${each(levels, (l) => `<label class="pick" data-ai="${l}"><input type="radio" name="ai" id="ai-f-${l}"><span><span class="ai ai-${l}"><i aria-hidden="true"></i></span>${esc(defs.ai_level[l].label)}</span></label>`)}
      <label class="pick" data-ai="all"><input type="radio" name="ai" id="ai-all"><span>${esc(np.filter_all)}</span></label>
    </div>
    <p class="filter-note">${esc(np.filter_note)}</p>
  </header>
  <div>
    <div class="feed">${each(current, (i) => story(i, i === leadStory))}</div>
    <div class="earlier">
      <h2 class="feed-h">${esc(np.precedent_title)}</h2>
      <p>${esc(np.precedent_intro)}</p>
      <div class="feed">${each(incidents.filter((i) => i.kind === 'precedent').sort(byDateDesc), (i) => story(i, false))}</div>
    </div>
  </div>
</div>`,
  });

  // ------------------------------------------------------------ checklist

  const checklistPage = layout({
    path: '/checklist/',
    title: site.pages.checklist.title,
    intro: site.pages.checklist.intro,
    cls: 'checklist',
    body: `<p class="print-only print-title">${esc(site.name)} checklist, as of ${fmtDate(asOf)}</p>
${each(site.tiers, (t) => {
  const items = advice.filter((a) => a.kind === 'action' && a.tier === t.id && a.checklist).sort((x, y) => x.rank - y.rank);
  return when(items.length, () => `<section class="check-group">
  <h2>${esc(t.name)}</h2>
  <ul>
    ${each(items, (a) => `<li><label><input type="checkbox"> <span>${esc(a.checklist_text)}</span></label> <a class="why" href="/do/${a.id}/">Guide</a></li>`)}
  </ul>
</section>`);
})}
<p class="print-only print-foot">${esc(site.pages.checklist.print_footer)}. ${md(site.notice)}</p>`,
  });

  // ------------------------------------------------------ markdown pages

  const prose = (path, page, source) =>
    layout({
      path,
      title: page.title,
      intro: page.intro,
      // The page title replaces the document's own top-level heading.
      body: `<div class="prose">${marked.parse(source.replace(/^# .*\n/, ''))}</div>`,
    });

  return {
    'index.html': home,
    ...Object.fromEntries(advice.map((a) => [`do/${a.id}/index.html`, guidePage(a)])),
    'basics/index.html': basicsPage,
    'questions/index.html': questionsPage,
    'incidents/index.html': incidentsPage,
    'checklist/index.html': checklistPage,
    'contribute/index.html': prose('/contribute/', site.pages.contribute, ctx.contributing),
    'notes/index.html': prose('/notes/', site.pages.notes, ctx.notes),
    'about/index.html': prose('/about/', site.pages.about, ctx.about),
    '404.html': layout({ path: '', title: 'Page not found', body: '<p><a href="/">Back to the home page</a></p>' }),
  };
}
