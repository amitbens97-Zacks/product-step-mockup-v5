// Journey funnel: colored-pencil tiers on one side, labels beside them. Each
// tier is drawn in real pixels (so hatching and grain never stretch) with a
// wobbly outline, hatched fill a little off the lines and a second pencil pass.
// Only categories with products are drawn, in a fixed order top -> bottom
// (entry widest on top, then bridge, premium, recurring), widths re-spaced by the
// number of tiers actually present, and a single category becomes a hero block.
import { html, useState, useEffect, useRef, Icon, cx, money } from './lib.js';
import { wobblyPath } from './sketch.js';
import { CATEGORIES, CATEGORY_ORDER } from './data.js';
import { CAT_STYLE } from './theme.js';

const MAX_SHRINK = 44;

export function tiersOf(products) {
  return CATEGORY_ORDER.map((c) => ({ ...CATEGORIES[c], style: CAT_STYLE[c], products: products.filter((p) => p.category === c) })).filter(
    (t) => t.products.length,
  );
}

function priceSpan(products) {
  const prices = products.map((p) => p.price).filter((p) => p != null);
  if (!prices.length) return 'טרם תומחר';
  const lo = Math.min(...prices);
  const hi = Math.max(...prices);
  const fmt = (n) => (n === 0 ? 'חינם' : money(n));
  return lo === hi ? fmt(lo) : `${fmt(lo)} עד ${fmt(hi)}`;
}

function Ghost({ size }) {
  return html`<div class="flex flex-col items-center gap-1 py-2" aria-hidden="true">
    ${[70, 56, 42].map(
      (w) => html`<div class="h-7 rounded border-[1.5px] border-dashed border-[#d3d9e4] bg-white/60" style=${{ width: `${w}%` }}></div>`,
    )}
    <p class="mt-2 text-center text-[14px] text-muted">המשפך ייבנה כאן כשנוסיף מוצר ראשון</p>
  </div>`;
}

function Hero({ tier, size }) {
  const dark = tier.id !== 'entry';
  const big = size === 'full';
  return html`<div
    class=${cx('grow relative overflow-hidden rounded-2xl text-center', big ? 'mx-auto max-w-sm p-8' : 'p-5')}
    style=${{ background: `linear-gradient(160deg, ${tier.style.fill}, ${dark ? '#2d3e66' : '#eef3fd'})`, color: tier.style.onFill }}
  >
    <span class=${cx('sketch-chip mx-auto mb-2 flex items-center justify-center', big ? 'h-14 w-14' : 'h-10 w-10', dark ? 'bg-white/15' : 'bg-white/70')}>
      <${Icon} name=${tier.icon} size=${big ? 26 : 19} />
    </span>
    <p class="text-[12px] font-bold opacity-80">מוצר הדגל · ${tier.label}</p>
    <p class=${cx('font-black leading-snug', big ? 'mt-1 text-[24px]' : 'text-[16px]')}>${tier.products[0].name || 'מוצר ללא שם'}</p>
    <p class=${cx('font-semibold opacity-90', big ? 'text-[16px]' : 'text-[14px]')}>${priceSpan(tier.products)}</p>
    ${tier.products.length > 1 && html`<p class="mt-1 text-[12px] opacity-80">ועוד ${tier.products.length - 1} מוצרים באותה קטגוריה</p>`}
  </div>`;
}

// Tracks an element's rendered size.
function useSize() {
  const ref = useRef();
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize((s) => (Math.abs(s.w - width) < 0.5 && Math.abs(s.h - height) < 0.5 ? s : { w: width, h: height }));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, size];
}

function PencilTier({ tier, index, topPct, bottomPct, height, full, class: cls, children }) {
  const [ref, { w }] = useSize();
  const dark = tier.id !== 'entry';
  const m = 3; // room for the wobble and the offset colouring
  const cxp = w / 2;
  const t = ((topPct / 100) * (w - m * 2)) / 2;
  const b = ((bottomPct / 100) * (w - m * 2)) / 2;
  const d =
    w > 0 &&
    wobblyPath(
      [
        [cxp - t, m],
        [cxp + t, m],
        [cxp + b, height - m],
        [cxp - b, height - m],
      ],
      index,
    );
  return html`<div ref=${ref} class=${cx('relative shrink-0', cls)} style=${{ height: `${height}px` }}>
    ${d &&
    html`<svg width=${w} height=${height} class="absolute inset-0 overflow-visible" aria-hidden="true">
      <g transform="translate(2.2 2)">
        <path d=${d} fill=${tier.style.fill} opacity=${dark ? 0.92 : 1} />
        <path d=${d} fill=${dark ? 'url(#pencil-hatch-light)' : 'url(#pencil-hatch-lg)'} />
      </g>
      <path d=${d} fill="none" stroke="#2d3e66" stroke-width="1.1" stroke-linejoin="round" opacity="0.28" transform="translate(-1.4 1.6)" />
      <path
        d=${d}
        fill="none"
        stroke="#2d3e66"
        stroke-width=${full ? 2.4 : 1.8}
        stroke-linejoin="round"
        stroke-linecap="round"
        filter=${full ? 'url(#pencil-rough-lg)' : undefined}
      />
    </svg>`}
    <div class="relative flex h-full items-center justify-center gap-1.5 font-bold" style=${{ color: tier.style.onFill }}>${children}</div>
  </div>`;
}

// `onTier(tierId)` makes each tier a button (the summary opens its products for editing);
// `rowH` overrides the tier height of the full funnel.
export function Funnel({ products, size = 'mini', onTier, rowH: rowHeight }) {
  const tiers = tiersOf(products);
  if (!tiers.length) return html`<${Ghost} size=${size} />`;
  if (tiers.length === 1)
    return onTier
      ? html`<button type="button" class="block w-full cursor-pointer text-start" onClick=${() => onTier(tiers[0].id)}><${Hero} tier=${tiers[0]} size=${size} /></button>`
      : html`<${Hero} tier=${tiers[0]} size=${size} />`;

  const n = tiers.length;
  const full = size === 'full';
  const step = MAX_SHRINK / (n - 1);
  const rowH = rowHeight || (full ? 86 : 48);

  return html`<div>
    <ol class=${cx('flex flex-col', full ? 'gap-1.5' : 'gap-[3px]')} aria-label="מסע הלקוח, מלמעלה למטה">
      ${tiers.map((t, i) => {
        // Entry sits on top and is the widest; each tier below is narrower,
        // and its top edge matches the bottom edge of the tier above it.
        const top = 100 - i * step;
        const bottom = i === n - 1 ? top - step * 0.55 : 100 - (i + 1) * step;
        const Row = onTier ? 'button' : 'div';
        return html`<li key=${t.id} class="grow" style=${{ animationDelay: `${i * 80}ms` }}>
          <${Row}
            type=${onTier ? 'button' : undefined}
            onClick=${onTier ? () => onTier(t.id) : undefined}
            class=${cx('flex w-full items-stretch gap-3 text-start', onTier && 'group cursor-pointer rounded-xl transition-colors hover:bg-brand-50')}
          >
          <${PencilTier} tier=${t} index=${i} topPct=${top} bottomPct=${bottom} height=${rowH} full=${full} class=${full ? 'w-[52%]' : 'w-[46%]'}>
            <${Icon} name=${t.icon} size=${full ? 18 : 14} />
            ${full && html`<span class="font-display text-[18px] font-extrabold leading-none">${t.products.length}</span>`}
          <//>
          <div class="flex min-w-0 flex-1 flex-col justify-center border-s border-dashed border-line ps-3">
            <p class=${cx('flex flex-wrap items-baseline gap-x-2 font-bold text-ink leading-tight', full ? 'text-[16px]' : 'text-[14px]')}>
              ${t.label}
              ${full && i === 0 && html`<span class="hand text-[26px]">כאן הם נכנסים</span>`}
              ${full && i === n - 1 && i > 0 && html`<span class="hand text-[26px]">כאן הם נשארים</span>`}
            </p>
            <p class=${cx('text-muted', full ? 'text-[14px]' : 'text-[12px]')}>${priceSpan(t.products)}</p>
            ${full &&
            html`<p class="mt-0.5 hidden truncate text-[12px] text-muted sm:block" title=${t.products.map((p) => p.name).join(' · ')}>
              ${t.products.map((p) => p.name || 'מוצר ללא שם').join(' · ')}
            </p>`}
          </div>
          ${onTier && html`<span class="flex items-center pe-2 text-faint transition-colors group-hover:text-brand-600"><${Icon} name="pencil" size=${16} /></span>`}
          <//>
        </li>`;
      })}
    </ol>
    ${!full &&
    html`<p class="mt-2 flex items-center gap-1 text-[12px] font-semibold text-muted">
      <${Icon} name="arrow-down" size=${13} strokeWidth=${2.5} /> הלקוח נכנס מלמעלה ומתקדם למטה
    </p>`}
  </div>`;
}
