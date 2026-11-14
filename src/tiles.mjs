// News-feed tiles, drawn as static inline SVG at build time.
// A story with a real count gets counted dots; otherwise a schematic for its event type.

// Seeded random numbers, so a story always gets the same tile.
const n = (x) => +x.toFixed(2);
const rng = (str) => {
  let h = 2166136261;
  for (const c of str) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h += 0x6d2b79f5; let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
const svg = (w, h, body) => `<svg viewBox="0 0 ${w} ${h}" aria-hidden="true" focusable="false">${body}</svg>`;

// ------------------------------------------------- A. counted dots

// Fit `total` dots into the box as a regular grid: try every column count and keep
// the one with the largest pitch, preferring one that leaves no ragged last row.
const fit = (total, w, h) => {
  let best = null;
  for (let cols = 1; cols <= total; cols++) {
    const rows = Math.ceil(total / cols);
    const pitch = Math.min(w / cols, h / rows);
    const even = total % cols === 0 ? 1.12 : 1;
    if (!best || pitch * even > best.score) best = { cols, rows, pitch, score: pitch * even };
  }
  return best;
};
const tileA = (s, lvl, w, h) => {
  const { total, hit, spread } = s.count;
  const pad = 22;
  const g = fit(total, w - pad * 2, h - pad * 2);
  const pitch = Math.min(g.pitch, 24);
  // Let the columns spread a little so the grid reaches the right-hand margin.
  const px = Math.min((w - pad * 2) / g.cols, pitch * 1.2);
  const r = Math.max(1.1, Math.min(pitch * 0.3, 5.5));
  const lit = new Set();
  if (spread === 'scatter') {
    const rand = rng(s.id);
    const idx = Array.from({ length: total }, (_, k) => k);
    for (let k = total - 1; k > 0; k--) { const j = Math.floor(rand() * (k + 1)); [idx[k], idx[j]] = [idx[j], idx[k]]; }
    idx.slice(0, hit).forEach((k) => lit.add(k));
  } else for (let k = 0; k < hit; k++) lit.add(k);
  const x0 = pad + px / 2;
  const y0 = (h - g.rows * pitch) / 2 + pitch / 2;
  const off = [], on = [];
  for (let k = 0; k < total; k++) {
    const d = `M${n(x0 + (k % g.cols) * px)} ${n(y0 + Math.floor(k / g.cols) * pitch)}h0`;
    (lit.has(k) ? on : off).push(d);
  }
  // Round-capped zero-length strokes draw as dots: one path per colour keeps the markup small.
  const big = spread === 'scatter' ? Math.min(r * 1.35, pitch * 0.4) : r;
  const hollow = lvl === 'suspected';
  return svg(w, h,
    `<path class="d-off" stroke-width="${n(r * 2)}" d="${off.join('')}"/>` +
    (hollow
      ? `<path class="d-on d-${lvl}" stroke-width="${n(big * 2)}" d="${on.join('')}"/><path class="d-hole" stroke-width="${n(Math.max(big * 2 - 2.6, big * 0.9))}" d="${on.join('')}"/>`
      : `<path class="d-on d-${lvl}" stroke-width="${n(big * 2)}" d="${on.join('')}"/>`));
};

// ------------------------------------------------- B. schematic symbols

// Per-story variation. Everything below changes only details that carry no meaning
// (which nodes are marked, small counts, left-right mirroring), so two stories of the
// same type are recognisably the same symbol without being the same picture.
const pick = (rand, total, k) => {
  const idx = Array.from({ length: total }, (_, j) => j);
  for (let j = total - 1; j > 0; j--) { const m = Math.floor(rand() * (j + 1)); [idx[j], idx[m]] = [idx[m], idx[j]]; }
  return new Set(idx.slice(0, k));
};
const int = (rand, lo, hi) => lo + Math.floor(rand() * (hi - lo + 1));
const mirror = (rand, body) => (rand() < 0.5 ? body : `<g transform="scale(-1 1)">${body}</g>`);
const diamond = (cls, x, y, s) => `<path class="${cls}" d="M${x} ${y - s}L${x + s} ${y}L${x} ${y + s}L${x - s} ${y}Z"/>`;

// One drawing per event type, on a 240 x 150 field centred on 0,0. Each takes the
// story's seeded random-number source.
// k = ink line, a = accent line, node = hollow, solid = ink dot, hitn = accent dot.
const SYMBOL = {
  // A centre that has lost its links to everything around it.
  outage: (rand) => {
    const count = int(rand, 7, 9), turn = rand() * Math.PI * 2;
    let out = '';
    for (let k = 0; k < count; k++) {
      const t = (k / count) * Math.PI * 2 + turn, c = Math.cos(t), s = Math.sin(t);
      const rx = 100, ry = 58;
      out += `<path class="k" d="M${n(c * rx * 0.62)} ${n(s * ry * 0.62)}L${n(c * rx * 0.9)} ${n(s * ry * 0.9)}"/>`;
      out += `<circle class="solid" cx="${n(c * rx)}" cy="${n(s * ry)}" r="5"/>`;
    }
    return out + `<circle class="node a" cx="0" cy="0" r="13"/><path class="a" d="M-5 -5L5 5M5 -5L-5 5"/>`;
  },
  // Too much arriving at once for a narrow point to pass on.
  overload: (rand) => {
    let out = `<path class="k" d="M-108 -60L-8 -13H108M-108 60L-8 13H108"/>`;
    // Close-packed crowd: alternate columns sit half a step apart.
    [-98, -84, -70, -56, -42, -28].forEach((x, c) => {
      const room = 13 + (-8 - x) * 0.47 - 8, shift = c % 2 ? 0 : 8;
      const ys = [];
      for (let y = shift; y <= room; y += 16) { ys.push(y); if (y) ys.push(-y); }
      const gone = c < 2 ? pick(rand, ys.length, 1) : new Set();
      ys.forEach((y, j) => { if (!gone.has(j)) out += `<circle class="${c > 3 ? 'hitn' : 'solid'}" cx="${x}" cy="${y}" r="4.5"/>`; });
    });
    out += `<circle class="hitn" cx="-12" cy="0" r="4.5"/>`;
    out += `<path class="k dash" d="M10 0H104"/>`;
    return mirror(rand, out + `<circle class="k node" cx="${int(rand, 50, 86)}" cy="0" r="4.5"/>`);
  },
  // Systems intact but walled off from the people who use them, with one paid way through.
  lockout: (rand) => {
    const rows = int(rand, 3, 4), gate = int(rand, 0, rows - 1), gap = rows === 3 ? 38 : 30;
    let out = `<path class="a" d="M-9 -60V60M9 -60V60"/>`;
    for (let r = 0; r < rows; r++) {
      const y = (r - (rows - 1) / 2) * gap;
      out += `<path class="k" d="M-98 ${y}H-19M19 ${y}H76"/>`;
      out += `<path class="k" d="M-19 ${y - 5}V${y + 5}M19 ${y - 5}V${y + 5}"/>`;
      out += `<circle class="solid" cx="-100" cy="${y}" r="5"/><rect class="k node" x="76" y="${y - 11}" width="22" height="22"/>`;
      if (r === gate) out += `<circle class="hitn" cx="0" cy="${y}" r="5"/>`;
    }
    return mirror(rand, out);
  },
  // In through a supplier, into the institution, money out the other side.
  heist: (rand) => {
    const sx = int(rand, -90, -68);
    return mirror(rand,
      `<circle class="k node" cx="12" cy="0" r="40"/>` +
      `<path class="a" d="M-112 0H12M12 0L92 -44M12 0H104M12 0L92 44"/>` +
      `<rect class="k node" x="${sx}" y="-9" width="18" height="18"/>` +
      `<circle class="hitn" cx="12" cy="0" r="6"/>` +
      `<circle class="hitn" cx="96" cy="-46" r="5"/><circle class="hitn" cx="108" cy="0" r="5"/><circle class="hitn" cx="96" cy="46" r="5"/>`);
  },
  // Separate holdings emptied into one the attacker controls.
  'crypto-theft': (rand) => {
    const spots = [[-94, -48], [-70, -23], [-94, 0], [-70, 23], [-94, 48]];
    const hit = pick(rand, spots.length, 3);
    let lines = '', marks = '';
    spots.forEach(([x, y], k) => {
      if (hit.has(k)) lines += `<path class="a dash" d="M${x + 10} ${y}L50 ${n(y * 0.12)}"/>`;
      marks += diamond(hit.has(k) ? 'a node' : 'k node', x, y, 10);
    });
    return mirror(rand, lines + marks + diamond('hitn', 78, 0, 27));
  },
  // Many identical connected devices on one line, some taken over.
  devices: (rand) => {
    const hits = pick(rand, 7, 3);
    let out = `<path class="k" d="M-105 -34H105"/>`;
    [-90, -60, -30, 0, 30, 60, 90].forEach((x, k) => {
      const hit = hits.has(k);
      out += `<path class="${hit ? 'a' : 'k'}" d="M${x} -34V8"/><rect class="${hit ? 'hitn' : 'k node'}" x="${x - 9}" y="8" width="18" height="26"/>`;
    });
    return out;
  },
  // The same part in use everywhere, with the same gap in every copy.
  'software-flaw': (rand) => {
    const at = (int(rand, 0, 7) / 8) * Math.PI * 2 + Math.PI / 8, half = 0.72, r = 17;
    const p = (t) => `${n(Math.cos(t) * r)} ${n(Math.sin(t) * r)}`;
    const ring = `<path class="k" d="M${p(at + half)}A${r} ${r} 0 1 1 ${p(at - half)}"/><circle class="hitn" cx="${n(Math.cos(at) * r)}" cy="${n(Math.sin(at) * r)}" r="4.5"/>`;
    let out = '';
    for (const y of [-32, 32]) for (const x of [-84, -28, 28, 84]) out += `<g transform="translate(${x} ${y})">${ring}</g>`;
    return out;
  },
  // One supplier down, and every customer attached to it down with it.
  supplier: (rand) => {
    const count = int(rand, 5, 7), first = rand() < 0.5 ? 1 : -1, lean = rand() < 0.5 ? 16 : -16;
    const step = 156 / (count - 1), x0 = -58 - lean / 2;
    let out = `<path class="a" d="M-86 0H${n(x0 + 156 + Math.max(0, -lean))}"/>`;
    for (let k = 0; k < count; k++) {
      const x = n(x0 + k * step), up = (k % 2 ? -1 : 1) * first;
      out += `<path class="a" d="M${x} 0L${n(x + lean)} ${up * 40}"/><circle class="node a" cx="${n(x + lean * 1.1)}" cy="${up * 44}" r="7"/>`;
    }
    return mirror(rand, out + `<rect class="hitn" x="-108" y="-11" width="22" height="22"/>`);
  },
  // One attacker, many targets at once.
  'one-to-many': (rand) => {
    const hits = pick(rand, 9, 3);
    let lines = '', nodes = '';
    for (let k = 0; k < 9; k++) {
      const y = -64 + k * 16, x = 96 - Math.abs(k - 4) * 3;
      const hit = hits.has(k);
      lines += `<path class="${hit ? 'a' : 'k thin'}" d="M-96 0L${x} ${y}"/>`;
      nodes += `<circle class="${hit ? 'hitn' : 'k node'}" cx="${x}" cy="${y}" r="5"/>`;
    }
    return mirror(rand, lines + nodes + `<circle class="hitn" cx="-96" cy="0" r="9"/>`);
  },
  // A program let into an account, working its way through what is inside.
  agents: (rand) => {
    const turns = [[-64, 0], [-64, -28], [-22, -28], [-22, 28], [20, 28], [20, -28], [62, -28]];
    const hit = pick(rand, turns.length - 1, 3);
    let out = `<rect class="k node" x="-100" y="-54" width="200" height="108" rx="9"/>`;
    out += `<path class="k" d="M-116 0H-100"/><path class="a" d="M-100 0L${turns.map(([x, y]) => `${x} ${y}`).join('L')}V8"/>`;
    turns.slice(1).forEach(([x, y], k) => { out += `<circle class="${hit.has(k) ? 'hitn' : 'k node'}" cx="${x}" cy="${y}" r="5"/>`; });
    out += `<rect class="k node" x="-107" y="-7" width="14" height="14"/><circle class="hitn" cx="62" cy="14" r="8"/>`;
    const body = rand() < 0.5 ? out : `<g transform="scale(1 -1)">${out}</g>`;
    return mirror(rand, body);
  },
  // Things that were meant to stay inside a box, leaving it.
  breakout: (rand) => {
    const also = int(rand, 0, 5);
    let out = `<path class="k" d="M-20 -18V-52H-108V52H-20V18"/>`, j = 0;
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
      if (r === 1 && c === 2) continue;
      if (j++ === also && c > 0) continue;
      out += `<circle class="solid" cx="${-88 + c * 24}" cy="${-24 + r * 24}" r="4"/>`;
    }
    out += `<path class="a dash" d="M-40 0H62"/>`;
    [-40, -8, 24].forEach((x) => { out += `<circle class="hitn" cx="${x}" cy="0" r="5"/>`; });
    return mirror(rand, out + `<circle class="k node" cx="84" cy="0" r="24"/><circle class="hitn" cx="84" cy="0" r="5"/>`);
  },
  // Records copied out of where they are kept.
  'data-theft': (rand) => {
    const hits = pick(rand, 5, int(rand, 2, 3));
    let out = `<rect class="k node" x="-104" y="-52" width="92" height="104"/>`;
    [-32, -16, 0, 16, 32].forEach((y, k) => {
      const hit = hits.has(k);
      out += `<path class="${hit ? 'a' : 'k'}" d="M-90 ${y}H-26"/>`;
      if (hit) out += `<path class="a dash" d="M-4 ${y}H34"/><path class="a" d="M44 ${y}H108"/>`;
    });
    return mirror(rand, out);
  },
  // A ledger with entries that can no longer be filled in: who owns what is gone.
  'records-lost': (rand) => {
    const lost = pick(rand, 5, 3);
    let out = `<rect class="k node" x="-96" y="-55" width="192" height="110"/><path class="k" d="M-34 -55V55"/>`;
    for (let r = 0; r < 5; r++) {
      const y = -44 + r * 22;
      if (r) out += `<path class="k thin" d="M-96 ${y - 11}H96"/>`;
      out += `<path class="k" d="M-84 ${y}H${int(rand, -62, -46)}"/>`;
      out += lost.has(r) ? `<path class="a dash" d="M-20 ${y}H82"/>` : `<path class="k" d="M-20 ${y}H${int(rand, 30, 80)}"/>`;
    }
    return mirror(rand, out);
  },
  // An official warning going out from one source to everyone in range.
  advisory: (rand) => {
    const cy = -60, span = 1.1;
    const at = (r, t) => [n(Math.sin(t) * r), n(cy + Math.cos(t) * r)];
    let arcs = '', nodes = '';
    const rings = [[44, 0], [80, int(rand, 3, 4)], [116, int(rand, 6, 7)]];
    const hit = pick(rand, rings[1][1] + rings[2][1], 2);
    let j = 0;
    for (const [r, count] of rings) {
      arcs += `<path class="k" d="M${at(r, -span).join(' ')}A${r} ${r} 0 0 0 ${at(r, span).join(' ')}"/>`;
      for (let k = 0; k < count; k++) {
        const [x, y] = at(r, ((k + 0.5) / count - 0.5) * 2 * (span - 0.08));
        nodes += `<circle class="${hit.has(j++) ? 'hitn' : 'k node'}" cx="${x}" cy="${y}" r="5"/>`;
      }
    }
    return arcs + nodes + `<circle class="solid" cx="0" cy="${cy}" r="7"/>`;
  },
};
const tileB = (s, w, h) => {
  const k = Math.min((h - 44) / 150, 1.5);
  return svg(w, h,
    `<rect width="${w}" height="${h}" fill="url(#grid)"/>` +
    `<g class="sym" transform="translate(${w / 2} ${h / 2}) scale(${n(k)})">${SYMBOL[s.type](rng(`${s.id}:symbol`))}</g>`);
};


export const TILE_TYPES = Object.keys(SYMBOL);
export const GRID_DEFS = `<svg class="defs" width="0" height="0" aria-hidden="true" focusable="false"><defs><pattern id="grid" width="13" height="13" patternUnits="userSpaceOnUse"><circle class="b-grid" cx="6.5" cy="6.5" r="1"/></pattern></defs></svg>`;

/** Returns { cls, svg, caption } for an incident, or null if it has neither a count nor a type. */
export function tile(incident, level, lead) {
  const [w, h] = lead ? [480, 300] : [480, 190];
  if (incident.count) return { cls: 'tile-a', svg: tileA(incident, level, w, h), caption: incident.count.caption };
  if (incident.type) return { cls: 'tile-b', svg: tileB(incident, w, h), caption: '' };
  return null;
}
