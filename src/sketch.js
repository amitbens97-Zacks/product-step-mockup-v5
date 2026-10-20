// Hand-drawn preview of the funnel the user will have built by the end of the
// step, drawn in coloured pencil like the FlowBiz logo: wobbly grainy outlines,
// hatched fills a little off the lines, a pencil shadow, tiers named by category
// (entry widest on top), handwritten notes around it,
// and the habits to drop struck through in red.
import { html } from './lib.js';

const HAND = "'Amatic SC', 'Assistant', cursive";
const NAVY = '#2d3e66';
const SKY = '#8fb3ef';
const SKY_TEXT = '#2f5fc4'; // handwriting and arrows: sky is too light for text
const FAINT = '#a0a6af';

const CX = 350; // funnel centre line
const TOP = 58; // y of the first tier
const TIER_H = 56;
const GAP = 8;
const WIDTHS = [300, 244, 188, 132, 100]; // top edge of each tier, then the last bottom edge

const TIERS = [
  { label: 'מוצר חדירה', role: 'בונה אמון', fill: '#dde9fc', ink: NAVY },
  { label: 'מוצר מעבר', role: 'ניצחון מהיר', fill: SKY, ink: NAVY },
  { label: 'מוצר פרימיום', role: 'עיקר הרווח', fill: '#0038b8', ink: '#fff' },
  { label: 'מוצר מתמשך', role: 'הכנסה חוזרת', fill: NAVY, ink: '#fff' },
];

function tierGeom(i) {
  const y0 = TOP + i * (TIER_H + GAP);
  const y1 = y0 + TIER_H;
  const t = WIDTHS[i] / 2;
  const b = WIDTHS[i + 1] / 2;
  return { y0, y1, t, b, mid: (y0 + y1) / 2, leftMid: CX - (t + b) / 2, rightMid: CX + (t + b) / 2 };
}

// Pencil-drawn outline: each straight edge becomes a gentle curve that bows
// a little in or out (fixed per tier, so the drawing is stable between renders).
const JITTER = [
  [1.8, -1.4, 2.2, -1.2],
  [-1.6, 1.9, -1.3, 1.7],
  [2.0, -1.8, 1.5, -2.1],
  [-1.4, 1.5, -2.0, 1.3],
];
export function wobblyPath(pts, i) {
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let k = 0; k < pts.length; k++) {
    const [x1, y1] = pts[k];
    const [x2, y2] = pts[(k + 1) % pts.length];
    const len = Math.hypot(x2 - x1, y2 - y1) || 1;
    const nx = -(y2 - y1) / len;
    const ny = (x2 - x1) / len;
    const j = JITTER[i % JITTER.length][k];
    const cx = (x1 + x2) / 2 + nx * j;
    const cy = (y1 + y2) / 2 + ny * j;
    d += ` Q${cx.toFixed(1)},${cy.toFixed(1)} ${x2},${y2}`;
  }
  return `${d} Z`;
}

// `bare`: only the tiers and their names (the opening screen), cropped to the funnel.
export function FunnelSketch({ bare } = {}) {
  const last = tierGeom(TIERS.length - 1);
  return html`<svg viewBox=${bare ? '180 46 340 290' : '0 0 600 352'} class="w-full" role="img" aria-label="המשפך שנבנה בשלב: מוצר חדירה למעלה, ואחריו מוצר מעבר, מוצר פרימיום ומוצר מתמשך">
    ${!bare &&
    html`<text x=${CX} y="22" text-anchor="middle" font-family=${HAND} font-size="24" font-weight="700" fill=${SKY_TEXT}>הלקוח נכנס כאן</text>
      <path class="draw" d=${`M${CX} 30 C ${CX - 4} 38, ${CX + 3} 44, ${CX} 52`} stroke=${SKY_TEXT} stroke-width="2.5" fill="none" stroke-linecap="round" />
      <path d=${`M${CX - 6} 45 L${CX} 53 L${CX + 6} 45`} stroke=${SKY_TEXT} stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" />`}

    <ellipse cx=${CX} cy=${last.y1 + 13} rx="78" ry="7" fill="url(#pencil-hatch-lg)" opacity="0.9" />
    <ellipse cx=${CX} cy=${last.y1 + 13} rx="64" ry="4.5" fill=${NAVY} opacity="0.06" />

    ${TIERS.map((tier, i) => {
      const g = tierGeom(i);
      const d = wobblyPath(
        [
          [CX - g.t, g.y0],
          [CX + g.t, g.y0],
          [CX + g.b, g.y1],
          [CX - g.b, g.y1],
        ],
        i,
      );
      const dark = tier.ink !== NAVY;
      return html`<g key=${tier.label} class="grow" style=${{ animationDelay: `${i * 140}ms`, transformBox: 'fill-box', transformOrigin: 'top' }}>
        <g transform="translate(2.6 2.4)">
          <path d=${d} fill=${tier.fill} opacity=${dark ? 0.92 : 1} />
          <path d=${d} fill=${dark ? 'url(#pencil-hatch-light)' : 'url(#pencil-hatch-lg)'} />
        </g>
        <path d=${d} fill="none" stroke=${NAVY} stroke-width="1.2" stroke-linejoin="round" opacity="0.28" transform="translate(-1.6 1.8)" />
        <path d=${d} fill="none" stroke=${NAVY} stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round" filter="url(#pencil-rough-lg)" />
        <text x=${CX} y=${g.mid + 9} text-anchor="middle" font-family=${HAND} font-size="29" font-weight="700" fill=${tier.ink}>${tier.label}</text>

        ${!bare &&
        html`<line x1=${g.leftMid - 10} y1=${g.mid} x2="182" y2=${g.mid} stroke=${FAINT} stroke-width="1.6" stroke-dasharray="3 5" stroke-linecap="round" />
          <text x="110" y=${g.mid + 8} text-anchor="middle" font-family=${HAND} font-size="26" font-weight="700" fill=${NAVY}>${tier.role}</text>`}
      </g>`;
    })}

    ${!bare &&
    html`<text x="540" y=${tierGeom(2).mid + 7} text-anchor="middle" font-family=${HAND} font-size="23" font-weight="700" fill=${SKY_TEXT}>כאן הרווח</text>
    <path d=${`M503 ${tierGeom(2).mid} L${tierGeom(2).rightMid + 12} ${tierGeom(2).mid}`} stroke=${SKY_TEXT} stroke-width="2.5" stroke-linecap="round" />
    <path d=${`M${tierGeom(2).rightMid + 20} ${tierGeom(2).mid - 6} L${tierGeom(2).rightMid + 12} ${tierGeom(2).mid} L${tierGeom(2).rightMid + 20} ${tierGeom(2).mid + 6}`} stroke=${SKY_TEXT} stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" />

    <text x="540" y=${last.mid + 7} text-anchor="middle" font-family=${HAND} font-size="23" font-weight="700" fill=${SKY_TEXT}>כאן הם נשארים</text>
    <path d=${`M494 ${last.mid} L${last.rightMid + 12} ${last.mid}`} stroke=${SKY_TEXT} stroke-width="2.5" stroke-linecap="round" />
    <path d=${`M${last.rightMid + 20} ${last.mid - 6} L${last.rightMid + 12} ${last.mid} L${last.rightMid + 20} ${last.mid + 6}`} stroke=${SKY_TEXT} stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" />

    <text x=${CX} y="346" text-anchor="middle" font-family=${HAND} font-size="22" font-weight="700" fill=${FAINT}>ככה ייראה המשפך שלך בסוף השלב</text>`}
  </svg>`;
}

// Phone layout of the same sketch: no side columns, so the funnel uses the full
// width and each tier carries its role under its name. Same pencil drawing.
const M = { W: 360, CX: 180, TOP: 50, TIER_H: 66, GAP: 8, WIDTHS: [348, 286, 224, 162, 122] };

function mTierGeom(i) {
  const y0 = M.TOP + i * (M.TIER_H + M.GAP);
  const y1 = y0 + M.TIER_H;
  return { y0, y1, t: M.WIDTHS[i] / 2, b: M.WIDTHS[i + 1] / 2, mid: (y0 + y1) / 2 };
}

export function FunnelSketchCompact() {
  const last = mTierGeom(TIERS.length - 1);
  const H = last.y1 + 58;
  return html`<svg viewBox=${`0 0 ${M.W} ${H}`} class="w-full" role="img" aria-label="המשפך שנבנה בשלב: מוצר חדירה למעלה, ואחריו מוצר מעבר, מוצר פרימיום ומוצר מתמשך">
    <text x=${M.CX} y="22" text-anchor="middle" font-family=${HAND} font-size="25" font-weight="700" fill=${SKY_TEXT}>הלקוח נכנס כאן</text>
    <path class="draw" d=${`M${M.CX} 30 C ${M.CX - 4} 38, ${M.CX + 3} 42, ${M.CX} 47`} stroke=${SKY_TEXT} stroke-width="2.5" fill="none" stroke-linecap="round" />
    <path d=${`M${M.CX - 6} 41 L${M.CX} 48 L${M.CX + 6} 41`} stroke=${SKY_TEXT} stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" />

    <ellipse cx=${M.CX} cy=${last.y1 + 13} rx="70" ry="6.5" fill="url(#pencil-hatch-lg)" opacity="0.9" />
    <ellipse cx=${M.CX} cy=${last.y1 + 13} rx="56" ry="4" fill=${NAVY} opacity="0.06" />

    ${TIERS.map((tier, i) => {
      const g = mTierGeom(i);
      const d = wobblyPath(
        [
          [M.CX - g.t, g.y0],
          [M.CX + g.t, g.y0],
          [M.CX + g.b, g.y1],
          [M.CX - g.b, g.y1],
        ],
        i,
      );
      const dark = tier.ink !== NAVY;
      return html`<g key=${tier.label} class="grow" style=${{ animationDelay: `${i * 140}ms`, transformBox: 'fill-box', transformOrigin: 'top' }}>
        <g transform="translate(2.4 2.2)">
          <path d=${d} fill=${tier.fill} opacity=${dark ? 0.92 : 1} />
          <path d=${d} fill=${dark ? 'url(#pencil-hatch-light)' : 'url(#pencil-hatch-lg)'} />
        </g>
        <path d=${d} fill="none" stroke=${NAVY} stroke-width="1.1" stroke-linejoin="round" opacity="0.28" transform="translate(-1.5 1.7)" />
        <path d=${d} fill="none" stroke=${NAVY} stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round" filter="url(#pencil-rough-lg)" />
        <text x=${M.CX} y=${g.mid + 2} text-anchor="middle" font-family=${HAND} font-size="29" font-weight="700" fill=${tier.ink}>${tier.label}</text>
        <text x=${M.CX} y=${g.mid + 23} text-anchor="middle" font-family=${HAND} font-size="20" font-weight="700" fill=${dark ? '#ffffff' : '#2f5fc4'} opacity=${dark ? 0.78 : 0.9}>${tier.role}</text>
      </g>`;
    })}

    <text x=${M.CX} y=${H - 6} text-anchor="middle" font-family=${HAND} font-size="22" font-weight="700" fill=${FAINT}>ככה ייראה המשפך שלך בסוף השלב</text>
  </svg>`;
}

// The habits this step replaces, crossed out by hand.
export function StruckHabits({ items }) {
  return html`<div class="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 sm:gap-x-8">
    ${items.map((t) => html`<span class="strike-hand text-[26px]">${t}</span>`)}
  </div>`;
}
