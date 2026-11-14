// Threat diagrams for the home page: one picture per threat, showing how it happens.
// Static inline SVG plus real HTML text, drawn at build time. No scripts, no inline styles.
//   import { threatDiagram } from './diagrams.mjs';
//   threatDiagram('personal')  ->  '<figure class="dgm dgm-personal">…</figure>'
// Two diagrams ('crypto' and 'infrastructure') exist in two versions, 'a' and 'b'.
// DIAGRAM_VERSION below picks the live one; threatDiagram('crypto', 'b') draws the other.
// Styles: src/static/diagrams.css (every selector starts with .dgm).

// ============================================================================
// WORDING. Edit the text of every diagram here and nowhere else.
//   alt    one or two sentences read out by screen readers in place of the picture
//   steps  one entry per stage, in order. label = at most 6 plain words.
//          note = optional smaller second line (a figure or a qualifier from the text).
//   A diagram with two versions has one entry per version: { a: {alt, steps}, b: {alt, steps} }.
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
    alt: 'How it happens: an attack hits a bank, or a supplier that several smaller banks share. The bank shuts its own systems down until it can prove they are clean. Your money is probably still there, but you may not be able to reach it. In the best-known case so far, that took about two weeks.',
    steps: [
      { label: 'A bank or supplier is attacked', note: 'Many smaller banks share one supplier' },
      { label: 'The bank shuts its systems down', note: 'until it can prove they are clean' },
      { label: 'You may not reach your money', note: 'It is probably still there' },
      { label: 'About two weeks', note: 'in the best-known case so far' },
    ],
  },
  crypto: {
    // a: three stages, the fork happens as the money leaves.
    a: {
      alt: 'A comparison of two ways money leaves your account. A bank transfer that takes days is slow enough that it can often be stopped, so the money can often come back. Crypto, wire transfers and instant payment apps can’t be pulled back once sent. If you sent the money yourself, nobody is required to refund you. If a thief sent it from your US payment app or bank account without you, report it at once, because federal rules can still require a refund. Crypto has no such rule.',
      steps: [
        { label: 'Money leaves your account', note: 'by slow bank transfer, or by crypto, wire or instant payment app' },
        { label: 'Slow transfers can often be stopped', note: 'So it can often come back' },
        { label: 'Instant payments can’t be pulled back', note: 'Gone. Sent it yourself? No refund.' },
      ],
    },
  },
    // b: four stages, the fork is a stage of its own.
    b: {
      alt: 'A comparison of two ways money leaves your account. A bank transfer that takes days is slow enough that it can often be stopped, so the money can often come back. Crypto, wire transfers and instant payment apps can’t be pulled back once sent. If you sent the money yourself, nobody is required to refund you. If a thief sent it from your US payment app or bank account without you, report it at once, because federal rules can still require a refund. Crypto has no such rule.',
      steps: [
        { label: 'Money leaves your account' },
        { label: 'It travels slowly or instantly', note: 'A bank transfer can take days' },
        { label: 'Slow enough to be stopped', note: 'So it can often come back' },
        { label: 'Gone. Sent it yourself? No refund.', note: 'Crypto, wire transfers and instant payment apps can’t be pulled back' },
      ],
    },
  infrastructure: {
    // a: three stages, starting from the attack.
    a: {
      alt: 'How it could happen: a home depends on water, power, the internet and deliveries, and the networks behind them run on software that is old and rarely updated. An attack on that software could cut them off at your home, though this is less likely than the other three threats. You would get by on what you had stored. The preparation is the same as for a storm, so it is cheap to cover.',
      steps: [
        { label: 'An attack on old software', note: 'It runs water, power, internet and deliveries' },
        { label: 'Those services could be cut off', note: 'Less likely than the other three threats' },
        { label: 'Home gets by on its stores', note: 'Same preparation as for a storm' },
      ],
    },
  },
    // b: four stages, starting from what a home depends on.
    b: {
      alt: 'How it could happen: a home depends on water, power, the internet and deliveries, and the networks behind them run on software that is old and rarely updated. An attack on that software could cut them off at your home, though this is less likely than the other three threats. You would get by on what you had stored. The preparation is the same as for a storm, so it is cheap to cover.',
      steps: [
        { label: 'Water, power, internet and deliveries', note: 'Every home depends on them' },
        { label: 'An attack on their old software', note: 'Less likely than the other three threats' },
        { label: 'Your home could be cut off' },
        { label: 'Get by on what you stored', note: 'Same preparation as for a storm' },
      ],
    },
};

// Which version is live on the site. Change 'a' to 'b' on one line to swap.
export const DIAGRAM_VERSION = { crypto: 'a', infrastructure: 'a' };

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
// The outages diagram adds five small pictures so its subject can be recognised:
//   drop = water   bolt = power   fan of arcs = internet   carton = deliveries   house = home
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

};

// ---------------------------------------------------------------- pictures
// Drawn around 0,0 and about 22 across. `up` places one and keeps it the right
// way up when the stylesheet turns the drawing for narrow screens.
const up = (x, y, inner) => `<g transform="translate(${x} ${y})"><g class="dgm-upright">${inner}</g></g>`;
const PIC = {
  water: () => path(`${K} ${NODE}`, 'M0 -11C5 -4 8 0 8 3.5A8 8 0 0 1 -8 3.5C-8 0 -5 -4 0 -11Z'),
  power: () => path(`${K} ${NODE}`, 'M3 -11L-7 2H0L-3 11L7 -2H0Z'),
  internet: () => path(K, 'M-10.6 -2.6A15 15 0 0 1 10.6 -2.6M-5.7 2.3A8 8 0 0 1 5.7 2.3') + dot(SOLID, 0, 8, 2.5),
  deliveries: () => path(`${K} ${NODE}`, 'M0 -11L9.5 -5.5V5.5L0 11L-9.5 5.5V-5.5Z') + path(K, 'M-9.5 -5.5L0 0L9.5 -5.5M0 0V11'),
};
const SERVICES = ['water', 'power', 'internet', 'deliveries'];
const at = (x, y, inner) => `<g transform="translate(${x} ${y})">${inner}</g>`;
// A house: walls half-width a, roof peak at -h, floor at +h, so it turns about its middle.
const house = (a, h, inside = '') => {
  const o = a * 0.3, eave = -h * 0.14, wall = n(-h + (eave + h) * a / (a + o));
  return path(`${K} ${NODE}`, `M${-a} ${wall}L0 ${-h}L${a} ${wall}V${h}H${-a}Z`) +
    path(K, `M${-a} ${wall}L${n(-a - o)} ${n(eave)}M${a} ${wall}L${n(a + o)} ${n(eave)}`) + inside;
};
// The home with a person in it and a store of water, power and supplies.
const stockedHome = (x) => up(x, 0, house(40, 54,
  dot(SOLID, 0, -15, 7) + ['water', 'power', 'deliveries'].map((p, k) => at(-24 + k * 24, 27, PIC[p]())).join('')));

// Four service lines, one above the other.
const LINES_A = [-39, -13, 13, 39];
const LINES_B = [-48, -16, 16, 48];

const ART_INFRASTRUCTURE = {
  a: [
    // The attack lands on one system; the four services hang off it.
    () => {
      let out = path(A, `M${-E} 0H-64`) + head(A, -64, 0);
      LINES_B.forEach((y, k) => {
        out += path(K, `M-36 0L-10 ${y}H${E}`) + up(18, y, at(0, 0, `<circle class="${NODE} dgm-blank" r="14"/>`) + PIC[SERVICES[k]]());
      });
      return out + box(`${K} ${NODE}`, -48, 0, 28) + dot(HIT, -48, 0, 6.5);
    },
    // Each line is cut; past the cut it is dead.
    () => LINES_B.map((y) => path(K, `M${-E} ${y}H-14`) + cross(0, y, 7) + path(K + THIN + DOTTED, `M14 ${y}H${E}`)).join(''),
    // The dead lines reach the home, which has its own store.
    () => LINES_B.map((y) => path(K + THIN + DOTTED, `M${-E} ${y}H-46`)).join('') + stockedHome(10),
  ],
  b: [
    // The four things a home is supplied with, each on its own line.
    () => LINES_A.map((y, k) => path(K, `M-16 ${y}H${E}`) + up(-30, y, PIC[SERVICES[k]]())).join(''),
    // All four lines pass through one system. It is attacked; past it they are dead.
    () => {
      let out = '';
      LINES_A.forEach((y) => { out += path(K, `M${-E} ${y}H-14`) + path(K + THIN + DOTTED, `M14 ${y}H${E}`); });
      return out + path(`${K} ${NODE}`, 'M-14 -50H14V50H-14Z') +
        path(A, `M0 ${-E}V-53M-5 -58L0 -53L5 -58`) + dot(HIT, 0, 0, 6.5);
    },
    // The dead lines stop short of the home.
    () => {
      let out = '';
      LINES_A.forEach((y) => { out += path(K + THIN + DOTTED, `M${-E} ${y}H-40`) + cross(-26, y, 5); });
      return out + up(26, 0, house(22, 30)) + path(K + THIN + DOTTED, `M58 0H${E}`);
    },
    // The home, living on what is stored inside it.
    () => path(K + THIN + DOTTED, `M${-E} 0H-58`) + stockedHome(4),
  ],
};

// The payments comparison. Money leaves you on one line, which forks: the upper
// route is slow (dotted) and meets a stopping point, where it turns round; the lower
// route is instant (double arrowheads) and runs straight through to someone else.
const SLOW = -22, FAST = 34, HOME = -46;
const fast = (x) => head(K, x, FAST) + head(K, x + 9, FAST);
const fork = (x) => path(K + DOTTED, `M${x} 0L${x + 28} ${SLOW}H${E}`) + path(K, `M${x} 0L${x + 28} ${FAST}H${E}`);
// The slow route stopped and turned back towards you; the instant route passes by.
const stopped = () =>
  path(K + DOTTED, `M${-E} ${SLOW}H8`) +
  path(K, `M8 ${SLOW}A12 12 0 0 0 8 ${HOME}H-50`) + head(K, -50, HOME, -1) + diamond(`${K} ${NODE}`, -20, HOME, 9) +
  path(K, `M32 ${HOME - 12}V${SLOW + 14}M41 ${HOME - 12}V${SLOW + 14}`) +
  path(K, `M${-E} ${FAST}H${E}`) + fast(-4);
// The instant route ends in someone else's account.
const gone = () =>
  path(K, `M${-E} ${FAST}H-34L-10 10`) + fast(-52) + dot(`${A} ${NODE}`, 14, 0, 27) + diamond(HIT, 14, 0, 13);

const ART_CRYPTO = {
  a: [
    () => path(K, 'M-52 0H0') + fork(0) + fast(52) + diamond(`${K} ${NODE}`, -24, 0, 10) + dot(SOLID, -52, 0, 8),
    stopped,
    gone,
  ],
  b: [
    () => path(K, `M-46 0H${E}`) + diamond(`${K} ${NODE}`, -6, 0, 10) + head(K, 32, 0) + dot(SOLID, -46, 0, 8),
    () => path(K, `M${-E} 0H-40`) + fork(-40) + fast(34),
    stopped,
    gone,
  ],
};

const VERSIONS = { crypto: ART_CRYPTO, infrastructure: ART_INFRASTRUCTURE };

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

/**
 * Complete HTML for one threat's diagram.
 * `pick` is optional: 'a' or 'b' chooses a version of a diagram that has two
 * (default: DIAGRAM_VERSION); an object { alt, steps } overrides the wording.
 */
export function threatDiagram(id, pick) {
  if (!(id in DIAGRAM_TEXT)) return '';
  const two = VERSIONS[id];
  const version = two ? (typeof pick === 'string' && pick in two ? pick : DIAGRAM_VERSION[id]) : null;
  const text = pick && typeof pick === 'object' ? pick : two ? DIAGRAM_TEXT[id][version] : DIAGRAM_TEXT[id];
  const arts = two ? two[version] : ART[id];
  if (!text?.steps || text.steps.length !== arts.length) return '';
  return `<figure class="dgm dgm-${id}${two ? ` dgm-${id}-${version}` : ''}">
  <figcaption class="dgm-alt">${esc(text.alt)}</figcaption>
  ${flow(arts, text.steps)}
</figure>`;
}
