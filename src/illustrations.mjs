// Threat illustrations for the home page: one picture per threat, read at a glance.
// Static inline SVG, drawn at build time. No scripts, no inline styles.
//   import { threatIllustration } from './illustrations.mjs';
//   threatIllustration('personal', 'a')  ->  '<figure class="ill ill-personal ill-personal-a">…</figure>'
// Styles: src/static/illustrations.css (every selector starts with .ill).

// ============================================================================
// WORDING. Edit the caption and the text alternative of every picture here and
// nowhere else.
//   caption  the one short line shown under the picture
//   alt      one sentence read out by screen readers in place of the picture
// Keep every statement inside what data/site.yaml says under threat_models.
// ============================================================================
export const ILLUSTRATION_TEXT = {
  personal: {
    a: {
      caption: 'Your email is the key to every other account.',
      alt: 'One large key with an envelope for its handle points at a row of five different doors that all have the same keyhole: whoever gets into your email can reset every other password.',
    },
    b: {
      caption: 'The same fake message goes to everyone at once. One of the phones is yours.',
      alt: 'A row of identical phones, every one showing the same incoming message, with one larger phone in the middle: nobody picks you out, the same scam is tried on everyone at once.',
    },
  },
  institutional: {
    a: {
      caption: 'The bank is shut. Your money is probably still inside.',
      alt: 'A bank building with a shutter pulled down over its door and a person standing outside, while stacks of coins are still visible between its columns: the money is probably still there, but you may not be able to reach it.',
    },
    b: {
      caption: 'An attacked bank switches itself off. The money stays inside.',
      alt: 'A bank building full of coin stacks whose power cable lies unplugged on the ground beside a wall socket: the bank has shut its own systems down, and the money is still inside.',
    },
  },
  crypto: {
    a: {
      caption: 'A slow bank transfer can often be pulled back. An instant payment is gone.',
      alt: 'A person holds one banknote on a string, like a kite, while a second banknote with no string shoots out of the picture: a slow bank transfer can often be stopped, an instant payment cannot.',
    },
    b: {
      caption: 'Once it is sent, it is out of reach.',
      alt: 'A person stands at the edge of a cliff reaching out as a banknote falls away below them: crypto, wire transfers and instant payments can’t be pulled back once sent.',
    },
  },
  infrastructure: {
    a: {
      caption: 'Prepare as you would for a storm.',
      alt: 'A dark street of houses under unlit street lamps, with one window lit in the middle house: an outage is less likely than the other threats, and the preparation is the same as for a storm.',
    },
    b: {
      caption: 'Power, internet, water and deliveries can all stop together.',
      alt: 'A light bulb, a wireless signal, a tap and a parcel, each struck through with a slash: the systems behind power, internet, water and deliveries can all be disrupted.',
    },
  },
};

// ============================================================================
// DRAWING. Every picture is drawn twice: a wide composition on a 960 x 240 field for
// the desktop panel, and a narrow one on a 360-wide field for phones. The stylesheet
// shows whichever fits the width of the figure itself.
//
// Marks: ink line, 2px, round joins. Objects are hollow shapes filled with the panel
// colour so they stand off the grey band. A person is a solid ink head and body.
// Red-orange is used for one thing per picture, the thing the picture is about, and
// that thing always differs in shape or fill as well as in colour.
//   k = ink line   p = ink line, panel fill   s = solid ink   f = panel fill, no line
//   a = accent line   ap = accent line, panel fill   af = solid accent   arm = a person's arm
// ============================================================================
const WIDE = [960, 240];
const n = (x) => +x.toFixed(1);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const path = (cls, d) => `<path class="ill-${cls}" d="${d}"/>`;
const rect = (cls, x, y, w, h, rx = 0) => `<rect class="ill-${cls}" x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}"${rx ? ` rx="${rx}"` : ''}/>`;
const circle = (cls, x, y, r) => `<circle class="ill-${cls}" cx="${n(x)}" cy="${n(y)}" r="${r}"/>`;
// Place a drawing: move to x,y, scale by s, turn by rot degrees.
const at = (x, y, s, body, rot = 0) =>
  `<g transform="translate(${n(x)} ${n(y)})${rot ? ` rotate(${rot})` : ''}${s !== 1 ? ` scale(${s})` : ''}">${body}</g>`;

// ---------------------------------------------------------------- shared parts
// Each part is drawn around its own origin; the origin is noted beside it.

// A person, standing on the origin. 62 tall.
const person = () => circle('s', 0, -52, 9.5) + path('s', 'M-13 0V-27a13 13 0 0 1 26 0V0Z');

// A banknote, centred on the origin. 100 x 54.
const note = (cls) =>
  rect(cls, -50, -27, 100, 54, 3) + circle(cls, 0, 0, 12) + path(cls, 'M-38 -15v30M38 -15v30');

// A bank, standing on the origin, 296 wide and 146 tall. `door` fills the middle bay.
const COLS = [-114, -72, -30, 30, 72, 114];
const stack = (x, count) => {
  let out = '';
  for (let k = 0; k < count; k++) out += rect('p', x - 11, -23 - k * 7, 22, 7, 3.5);
  return out;
};
const bank = (door) =>
  rect('f', -114, -88, 228, 72) +
  stack(-93, 5) + stack(-51, 8) + stack(51, 6) + stack(93, 4) +
  door +
  COLS.map((x) => rect('p', x - 6, -88, 12, 72)).join('') +
  rect('p', -138, -16, 276, 8) + rect('p', -148, -8, 296, 8) +
  rect('p', -138, -100, 276, 12) +
  path('p', 'M-148 -100L0 -146L148 -100Z') + circle('k', 0, -117, 7);

// ---------------------------------------------------------------- 1. accounts

// A. The key: an envelope for a handle. Points right; origin at the centre of the envelope.
const key = () =>
  path('ap', 'M32 -6H126V20H116V11H107V20H97V6H32') +
  rect('ap', -34, -24, 68, 48, 3) + path('a', 'M-34 -21L0 5L34 -21');
// Five doors to five different places, one keyhole. Origin: bottom centre of each door.
const keyhole = circle('s', 0, -66, 6) + path('s', 'M-3 -63L-5.5 -48H5.5L3 -63Z');
const DOORS = [
  path('p', 'M-29 0V-83a29 29 0 0 1 58 0V0Z'),
  rect('p', -29, -112, 58, 112) + path('k', 'M-29 -90H29'),
  rect('p', -29, -98, 58, 98) + path('p', 'M-37 -98L0 -122L37 -98Z'),
  rect('p', -29, -112, 58, 112) + path('k', 'M0 -112V-84M0 -30V0'),
  path('p', 'M-29 0V-83a29 29 0 0 1 58 0V0Z') + path('k', 'M-29 -83H29'),
].map((d) => d + keyhole);

const personalA = {
  wide: () =>
    path('k', 'M398 200H902') +
    DOORS.map((d, i) => at(450 + i * 100, 200, 1, d)).join('') +
    at(118, 134, 1.7, key()),
  narrow: [360, 250, () =>
    path('k', 'M14 230H346') +
    DOORS.map((d, i) => at(52 + i * 64, 230, 0.74, d)).join('') +
    at(124, 62, 1.2, key())],
};

// B. A phone with a message arriving. Origin: centre of the phone. 44 x 80.
const phone = () =>
  rect('p', -22, -40, 44, 80, 7) + path('k', 'M-5 -31H5') +
  path('af', 'M12 -56h24a5 5 0 0 1 5 5v14a5 5 0 0 1 -5 5H22l-9 9v-9h-1a5 5 0 0 1 -5 -5v-14a5 5 0 0 1 5 -5Z');

const personalB = {
  wide: () =>
    [-385, -300, -215, -130, 130, 215, 300, 385].map((dx) => at(476 + dx, 126, 1, phone())).join('') +
    at(476, 130, 1.8, phone()),
  narrow: [360, 260, () =>
    [32, 94, 244, 306].map((x) => [80, 196].map((y) => at(x, y, 1, phone())).join('')).join('') +
    at(166, 140, 1.7, phone())],
};

// ---------------------------------------------------------------- 2. the bank

// A. Shutter down over the door, a person outside, the money still visible.
const shutter = () => {
  let slats = '';
  for (let y = -80; y <= -24; y += 8) slats += `M-24 ${y}H24`;
  return rect('ap', -24, -88, 48, 72) + path('a', slats);
};
const institutionalA = {
  wide: () =>
    path('k', 'M214 204H800') + at(430, 204, 1.2, bank(shutter())) + at(730, 204, 1.4, person()),
  narrow: [360, 190, () =>
    path('k', 'M6 176H354') + at(142, 176, 0.88, bank(shutter())) + at(322, 176, 0.95, person())],
};

// B. The bank's own plug, pulled out. Plug origin: where the cable enters it.
const plug = () => rect('ap', 0, -11, 24, 22, 5) + path('a', 'M24 -5H37M24 5H37');
const socket = () => path('k', 'M0 0V-40') + rect('p', -19, -78, 38, 38, 6) + path('k', 'M-6 -65v12M6 -65v12');
const institutionalB = {
  wide: () =>
    path('k', 'M130 204H880') + at(346, 204, 1.2, bank(stack(0, 7))) +
    path('k', 'M524 196C580 196 590 150 632 170S668 198 696 192') +
    at(696, 190, 1.6, plug(), -12) + at(822, 204, 1.5, socket()),
  narrow: [360, 180, () =>
    path('k', 'M4 166H356') + at(112, 166, 0.74, bank(stack(0, 7))) +
    path('k', 'M222 161C238 161 240 136 252 144S256 160 262 157') +
    at(262, 157, 0.9, plug(), -12) + at(338, 166, 0.9, socket())],
};

// ------------------------------------------------------- 3. instant payments

// A. One note on a string, one already gone. The gone note runs off the edge of the picture.
const cryptoA = {
  wide: () =>
    path('k', 'M60 212H200') +
    path('k', 'M138 146C240 214 350 186 404 98') +
    at(120, 212, 1.5, person()) +
    at(462, 80, 1.25, note('p'), -10) +
    path('a', 'M690 126H790M640 148H800M712 170H790') +
    at(918, 148, 1.25, note('ap'), -5),
  narrow: [360, 250, () =>
    path('k', 'M14 232H92') +
    path('k', 'M58 188C104 226 150 168 172 86') +
    at(48, 232, 1, person()) +
    at(210, 72, 0.8, note('p'), -10) +
    path('a', 'M206 152H264M180 166H270M218 180H264') +
    at(338, 166, 0.8, note('ap'), -5)],
};

// B. Over the edge. A person at a cliff, the note out of reach below.
const cryptoB = {
  wide: () =>
    path('k', 'M-10 150H452V260') +
    at(416, 150, 1.5, person()) + path('arm', 'M430 106L480 124') +
    path('a', 'M556 108v22M580 98v26M604 116v18') +
    at(580, 184, 1, note('ap'), 24),
  narrow: [360, 260, () =>
    path('k', 'M-10 140H170V280') +
    at(144, 140, 1.1, person()) + path('arm', 'M155 106L190 118') +
    path('a', 'M238 112v20M258 104v22M278 120v16') +
    at(258, 186, 0.85, note('ap'), 24)],
};

// ------------------------------------------------------- 4. power and internet

// A. A dark street, one window lit. House origin: bottom centre. 92 wide, 94 tall.
const house = (lit) =>
  path('p', 'M-46 0V-58L0 -94L46 -58V0Z') + rect('k', 8, -38, 22, 38) +
  (lit
    ? rect('af', -34, -46, 26, 26) + path('k', 'M-21 -46v26M-34 -33h26') + rect('k', -34, -46, 26, 26) +
      path('a', 'M-21 -54v-8M-42 -33h-8M-36 -48l-6 -6M-6 -48l6 -6M0 -33h8')
    : rect('k', -34, -46, 26, 26) + path('k', 'M-21 -46v26M-34 -33h26'));
// An unlit street lamp. Origin: foot of the post. 112 tall, arm to the right.
const lamp = () => path('k', 'M0 0V-98a14 14 0 0 1 14 -14h8') + path('p', 'M22 -118h22l-5 14h-12Z');

const infrastructureA = {
  wide: () =>
    path('k', 'M96 204H864') +
    at(132, 204, 1, lamp()) + at(828, 204, 1, `<g transform="scale(-1 1)">${lamp()}</g>`) +
    [246, 363, 597, 714].map((x) => at(x, 204, 1, house(false))).join('') +
    at(480, 204, 1.3, house(true)),
  narrow: [360, 180, () =>
    path('k', 'M8 166H352') +
    at(66, 166, 0.9, house(false)) + at(294, 166, 0.9, house(false)) +
    at(180, 166, 1.3, house(true))],
};

// B. Four everyday supplies, each struck through. Origin: centre of each mark, about 90 across.
const slash = path('a', 'M40 -46L-40 46');
const SUPPLIES = [
  // light bulb
  path('p', 'M-12 16a28 28 0 1 1 24 0V28H-12Z') + path('k', 'M-12 22H12M-7 35H7'),
  // wireless signal
  path('k', 'M-16.3 12.7a23 23 0 0 1 32.6 0M-28.3 0.7a40 40 0 0 1 56.6 0M-40.3 -11.3a57 57 0 0 1 80.6 0') + circle('s', 0, 29, 5),
  // tap, with the drop that isn't coming
  path('p', 'M-38 -14H8a20 20 0 0 1 20 20V16H10V8a4 4 0 0 0 -4 -4H-38Z') + path('k', 'M-10 -14V-30M-24 -30H4') +
    path('p', 'M19 24c5 7 7 10 7 14a7 7 0 0 1 -14 0c0 -4 2 -7 7 -14Z'),
  // parcel
  rect('p', -32, -28, 64, 56, 2) + path('k', 'M-9 -28V-6H9V-28'),
].map((d) => d + slash);

const infrastructureB = {
  wide: () => SUPPLIES.map((d, i) => at(180 + i * 200, 120, 1.3, d)).join(''),
  narrow: [360, 300, () => SUPPLIES.map((d, i) => at(100 + (i % 2) * 160, 82 + Math.floor(i / 2) * 140, 1.15, d)).join('')],
};

const ART = {
  personal: { a: personalA, b: personalB },
  institutional: { a: institutionalA, b: institutionalB },
  crypto: { a: cryptoA, b: cryptoB },
  infrastructure: { a: infrastructureA, b: infrastructureB },
};

const svg = (cls, w, h, body) =>
  `<svg class="ill-art ${cls}" viewBox="0 0 ${w} ${h}" aria-hidden="true" focusable="false">${body}</svg>`;

/**
 * The complete figure for one threat.
 * @param {'personal'|'institutional'|'crypto'|'infrastructure'} id
 * @param {'a'|'b'} [variant]
 */
export function threatIllustration(id, variant = 'a') {
  const text = ILLUSTRATION_TEXT[id]?.[variant], art = ART[id]?.[variant];
  if (!text || !art) throw new Error(`No threat illustration for "${id}" variant "${variant}"`);
  const [nw, nh, narrow] = art.narrow;
  return `<figure class="ill ill-${id} ill-${id}-${variant}">
  <div class="ill-pic" role="img" aria-label="${esc(text.alt)}">
    ${svg('ill-wide', WIDE[0], WIDE[1], art.wide())}
    ${svg('ill-narrow', nw, nh, narrow())}
  </div>
  <figcaption class="ill-cap">${esc(text.caption)}</figcaption>
</figure>`;
}
