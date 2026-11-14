// Threat diagrams for the home page: one picture per threat, showing how it happens.
// Static inline SVG plus real HTML text, drawn at build time. No scripts, no inline styles.
//   import { threatDiagram } from './diagrams.mjs';
//   threatDiagram('personal')  ->  '<figure class="dgm dgm-personal">…</figure>'
// Styles: src/static/diagrams.css (every selector starts with .dgm).

// ============================================================================
// WORDING. Edit the text of every diagram here and nowhere else.
//   alt    one or two sentences read out by screen readers in place of the picture
//   steps  one entry per stage, in order. label = at most 6 plain words.
//          note = optional smaller second line (a figure or a qualifier from the text).
//   lanes  (comparison diagram only) two paths drawn one against the other
// Keep every statement inside what data/site.yaml says under threat_models[*].how.
// ============================================================================
export const DIAGRAM_TEXT = {
  personal: {
    alt: 'How it happens: attackers buy leaked personal details in bulk. AI uses them to write convincing messages, copy voices and try stolen passwords on everyone at once, you included. The prize is your email, because it can reset every other password.',
    steps: [
      { label: 'Leaked details, bought in bulk' },
      { label: 'AI writes, copies voices, tries passwords' },
      { label: 'Everyone is tried at once' },
      { label: 'Your email resets every other password' },
    ],
  },
  institutional: {
    alt: 'How it happens: an attack hits a bank, or a supplier that several smaller banks share. The bank shuts its own systems down until it can prove they are clean. Your money is probably still there, but you can’t reach it. Past cases took about two weeks.',
    steps: [
      { label: 'A bank or supplier is attacked', note: 'Many smaller banks share one supplier' },
      { label: 'The bank shuts its systems down', note: 'until it can prove they are clean' },
      { label: 'You can’t reach your money', note: 'It is probably still there' },
      { label: 'About two weeks', note: 'is how long past cases took' },
    ],
  },
  crypto: {
    alt: 'A comparison of two ways money moves. A bank transfer that takes days can be stopped and reversed, so the money can come back. Crypto, wire transfers and instant payment apps can’t be stopped: once the money moves it is gone, and nobody is required to refund you.',
    lanes: [
      {
        name: 'Bank transfer that takes days',
        steps: [
          { label: 'Money leaves your account' },
          { label: 'Slow enough to be stopped' },
          { label: 'And it can be reversed' },
        ],
      },
      {
        name: 'Crypto, wire transfer or instant payment app',
        steps: [
          { label: 'Money leaves your account' },
          { label: 'It can’t be stopped' },
          { label: 'Gone. Nobody has to refund you.' },
        ],
      },
    ],
  },
  infrastructure: {
    alt: 'How it happens: water systems, power grids and delivery networks run on software that is old and rarely updated. An attack on it could cut them off, though this is less likely than the other three threats. The preparation is the same as for a storm.',
    steps: [
      { label: 'Old, rarely updated software', note: 'runs water, power and delivery networks' },
      { label: 'An attack cuts them off', note: 'Less likely than the other three threats' },
      { label: 'Prepare as for a storm', note: 'Same preparation, so cheap to cover' },
    ],
  },
};

// ============================================================================
// DRAWING. Each stage is a square field, 150 x 150, centred on 0,0, with the story
// running left to right along the x axis. Lines that carry on into the next stage
// run out to x = ±E, well past the field, so neighbouring stages join up whatever
// their width. On narrow screens the stylesheet turns each drawing a quarter turn,
// so the same picture reads top to bottom.
//
// The marks mean the same thing in every diagram (and in the news-feed symbols):
//   solid ink dot = a person     hollow square = an organisation's system
//   hollow circle = an account or service     diamond = money
//   red-orange = the attacker, or what has gone wrong (always also a different
//   shape: a cross, a filled mark, a bar)     dotted = slow, switched off or cut
// ============================================================================
const E = 340;
const n = (x) => +x.toFixed(1);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const path = (cls, d) => `<path class="${cls}" d="${d}"/>`;
const dot = (cls, x, y, r) => `<circle class="${cls}" cx="${n(x)}" cy="${n(y)}" r="${r}"/>`;
const box = (cls, x, y, s) => `<rect class="${cls}" x="${n(x - s / 2)}" y="${n(y - s / 2)}" width="${s}" height="${s}"/>`;
const diamond = (cls, x, y, s) => path(cls, `M${x} ${y - s}L${x + s} ${y}L${x} ${y + s}L${x - s} ${y}Z`);
const cross = (x, y, s = 6) => path('dgm-a', `M${x - s} ${y - s}L${x + s} ${y + s}M${x + s} ${y - s}L${x - s} ${y + s}`);
// A small arrowhead on a line: dir 1 points along the story, -1 points back.
const head = (cls, x, y, dir = 1) => path(cls, `M${x - 5 * dir} ${y - 5}L${x} ${y}L${x - 5 * dir} ${y + 5}`);
// A wavy line (a voice) from x0 to x1.
const wave = (cls, x0, x1, y) => {
  let d = `M${x0} ${y}q4 -4 8 0`;
  for (let x = x0 + 8; x < x1; x += 8) d += 't8 0';
  return path(cls, d);
};

const K = 'dgm-k', A = 'dgm-a', NODE = 'dgm-node', SOLID = 'dgm-solid', HIT = 'dgm-hit';
const THIN = ' dgm-thin', DOTTED = ' dgm-dotted';

// Seven parallel tracks, used where AI tries everyone at once. Three kinds of line,
// in the order the label names them: written message, copied voice, password try.
const TRACKS = [-54, -36, -18, 0, 18, 36, 54];
const track = (kind, x0, x1, y) =>
  kind === 1 ? wave(A, x0, x1, y) : path(A + (kind === 2 ? DOTTED : ''), `M${x0} ${y}H${x1}`);

const ART = {
  personal: [
    // A batch of people's details, boxed up and sold as one lot.
    () => {
      let out = '';
      for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) out += dot(SOLID, -38 + c * 14, -28 + r * 14, 3.5);
      return out + path(A, 'M-52 -42H32V42H-52Z') + path(A, `M32 0H${E}`);
    },
    // One AI, many attempts of three kinds leaving at the same moment.
    () => {
      let out = path(A, `M${-E} 0H-44`);
      TRACKS.forEach((y, k) => {
        out += path(A, `M-44 0L-8 ${y}`) + track(k % 3, -8, E, y);
      });
      return out + dot(HIT, -44, 0, 10);
    },
    // Every person gets one. You are the ringed one.
    () => {
      let out = '';
      TRACKS.forEach((y, k) => {
        out += track(k % 3, -E, -14, y) + head(A, -12, y) + dot(SOLID, 0, y, 5.5);
      });
      return out + dot(A, 0, 0, 12) + path(A, `M12 0H${E}`);
    },
    // Your email, taken, opens every other account.
    () => {
      let out = path(A, `M${-E} 0H-46`);
      [-52, -26, 0, 26, 52].forEach((y) => {
        out += path(A, `M-36 0L30 ${y}`) + box(`${K} ${NODE}`, 40, y, 18);
      });
      return out + dot(`${A} ${NODE}`, -36, 0, 13) + dot(HIT, -36, 0, 5.5);
    },
  ],

  institutional: [
    // The attack lands on one supplier; three banks hang off it.
    () => {
      let out = path(A, `M${-E} 0H-58`) + head(A, -58, 0);
      [-44, 0, 44].forEach((y) => {
        out += path(K, `M-28 0L10 ${y}H${E}`) + box(`${K} ${NODE}`, 28, y, 22);
      });
      return out + box(`${K} ${NODE}`, -40, 0, 30) + dot(HIT, -40, 0, 6.5);
    },
    // The banks switch themselves off: dotted outlines, links ended.
    () => {
      let out = '';
      [-44, 0, 44].forEach((y) => {
        out += path(K, `M${-E} ${y}H-30M-30 ${y - 6}V${y + 6}`) + box(`${K} ${NODE}${DOTTED}`, 0, y, 26);
      });
      return out + path(K + THIN + DOTTED, `M13 0H${E}`);
    },
    // Money still inside the bank; a barrier between it and you.
    () =>
      path(K + THIN + DOTTED, `M${-E} 0H-52`) +
      box(`${K} ${NODE}${DOTTED}`, -30, 0, 44) + diamond(`${K} ${NODE}`, -30, 0, 11) +
      path(A, 'M6 -50V50M16 -50V50') +
      path(K, 'M48 0H28M28 -6V6') + dot(SOLID, 50, 0, 7) +
      path(K + THIN + DOTTED, `M57 0H${E}`),
    // Fourteen days: two rows of seven.
    () => {
      let out = path(K + THIN + DOTTED, `M${-E} 0H-62`);
      let days = '';
      for (let r = 0; r < 2; r++) for (let c = 0; c < 7; c++) days += dot(HIT, -45 + c * 15, -8 + r * 16, 5);
      return out + `<g class="dgm-upright">${days}</g>`;
    },
  ],

  infrastructure: [
    // A stack of software with pieces missing (dotted), running three services.
    () => {
      let out = '';
      [-42, 0, 42].forEach((y) => {
        out += path(K, `M-48 ${y}H${E}`) + box(`${K} ${NODE}`, -48, y, 18) + dot(`${K} ${NODE}`, 16, y, 12);
      });
      [-21, 21].forEach((y) => { out += box(`${K} ${NODE}${THIN}${DOTTED}`, -48, y, 18); });
      return out;
    },
    // Each of the three lines is cut; past the cut it is dead.
    () => {
      let out = '';
      [-42, 0, 42].forEach((y) => {
        out += path(K, `M${-E} ${y}H-14`) + cross(0, y, 7) + path(K + THIN + DOTTED, `M14 ${y}H${E}`);
      });
      return out;
    },
    // The dead lines reach your home, where you have a store for each.
    () => {
      let out = '';
      [[-42, -11], [0, -38], [42, -11]].forEach(([y, x]) => {
        out += path(K + THIN + DOTTED, `M${-E} ${y}H${x}`);
      });
      out += dot(`${K} ${NODE}`, 10, 0, 48);
      let home = dot(SOLID, 10, -14, 7);
      [-10, 10, 30].forEach((x) => { home += box(SOLID, x, 16, 11); });
      return out + `<g class="dgm-upright">${home}</g>`;
    },
  ],
};

// The comparison. Both paths share one layout: you on the left, the far end on the
// right, money going out along the upper line. Only the slow path has a stopping
// point and a lower line bringing the money back.
const OUT = -22, BACK = 22;
const you = () => dot(SOLID, -40, 0, 8);
const LANE_ART = [
  [
    () => path(K, `M-40 0L-22 ${OUT}H${E}`) + path(K, `M${E} ${BACK}H-22L-40 0`) +
      diamond(`${K} ${NODE}`, 14, OUT, 10) + head(K, 44, OUT) + head(K, -6, BACK, -1) + you(),
    () => path(K + DOTTED, `M${-E} ${OUT}H${E}`) + path(K, `M${-E} ${BACK}H${E}`) +
      path(K, `M-10 ${OUT}V${BACK}`) + head(K, -40, BACK, -1) +
      path(K, `M2 ${OUT - 15}V${OUT + 15}M11 ${OUT - 15}V${OUT + 15}`),
    () => box(`${K} ${NODE}`, 26, 0, 72) +
      path(K + DOTTED, `M${-E} ${OUT}H-6`) +
      path(K, `M-6 ${OUT}H18A22 22 0 0 1 18 ${BACK}H${-E}`) +
      diamond(`${K} ${NODE}`, -40, BACK, 10) + head(K, -58, BACK, -1),
  ],
  [
    () => path(K, `M-40 0L-22 ${OUT}H${E}`) + diamond(`${K} ${NODE}`, 14, OUT, 10) + head(K, 44, OUT) + you(),
    () => path(K, `M${-E} ${OUT}H${E}`) + head(K, -6, OUT) + head(K, 6, OUT),
    () => box(`${A} ${NODE}`, 26, 0, 72) +
      path(K, `M${-E} ${OUT}H10L18 -12`) + diamond(HIT, 28, 0, 14) +
      path(K + THIN + DOTTED, `M-10 ${BACK}H-66`) + cross(-38, BACK, 9),
  ],
];

// ============================================================================
// MARKUP
// ============================================================================
const stage = (art, text) => `<li class="dgm-step">
      <svg class="dgm-art" viewBox="-75 -75 150 150" aria-hidden="true" focusable="false"><g class="dgm-turn">${art()}</g></svg>
      <p class="dgm-label"><b>${esc(text.label)}</b>${text.note ? ` <span class="dgm-note">${esc(text.note)}</span>` : ''}</p>
    </li>`;

const flow = (arts, steps) => `<ol class="dgm-flow">
    ${steps.map((s, k) => stage(arts[k], s)).join('\n    ')}
  </ol>`;

/** Complete HTML for one threat's diagram. `text` overrides the wording table. */
export function threatDiagram(id, text = DIAGRAM_TEXT[id]) {
  if (!text || !(id in DIAGRAM_TEXT)) return '';
  const body = text.lanes
    ? `<div class="dgm-lanes">
  ${text.lanes.map((lane, k) => `<div class="dgm-lane" role="group" aria-label="${esc(lane.name)}">
  <p class="dgm-lane-name">${esc(lane.name)}</p>
  ${flow(LANE_ART[k], lane.steps)}
  </div>`).join('\n  ')}
  </div>`
    : flow(ART[id], text.steps);
  return `<figure class="dgm dgm-${id}">
  <figcaption class="dgm-alt">${esc(text.alt)}</figcaption>
  ${body}
</figure>`;
}
