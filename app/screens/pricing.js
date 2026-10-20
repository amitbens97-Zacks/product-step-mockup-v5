// Screen 3: a clean pricing sheet (the punchline is built later, in צייד הלקוחות).
// One row per product: price, cost (hours or ₪, one toggle), and what you keep.
// The hourly value is asked once for the whole basket, not per product.
import { html, useState, useEffect, useRef, Icon, cx, money, pct, parseNum, profitOf } from '../lib.js';
import { Panel, Dots, Button } from '../components.js';
import { CATEGORIES, CATEGORY_ORDER, DEFAULT_HOURLY_RATE } from '../data.js';
import { CAT_STYLE } from '../theme.js';

const COLS = 'md:grid-cols-[minmax(0,1fr)_112px_138px_96px]';

// Number input with a trailing unit; the unit can be a toggle button.
function NumBox({ value, onInput, label, unit, step = 1, onUnit }) {
  return html`<label class="flex h-11 items-center gap-1 rounded-xl border-[1.5px] border-[#d3d9e4] bg-white px-3 transition-colors focus-within:border-brand-600 focus-within:ring-4 focus-within:ring-brand-100">
    <span class="sr-only">${label}</span>
    <input
      type="number"
      inputmode="decimal"
      min="0"
      step=${step}
      value=${value ?? ''}
      placeholder="0"
      onInput=${(e) => onInput(parseNum(e.target.value))}
      class="font-display w-full min-w-0 bg-transparent text-[16px] font-bold text-ink outline-none tabular-nums placeholder:text-faint/70"
    />
    ${onUnit
      ? html`<button
          type="button"
          onClick=${(e) => {
            e.preventDefault();
            onUnit();
          }}
          title="החלפה בין שעות לסכום"
          class="flex shrink-0 items-center gap-1 rounded-lg bg-brand-100 px-2 py-1 text-[12px] font-bold text-brand-600 hover:bg-brand-200 cursor-pointer"
        >
          ${unit} <${Icon} name="arrow-left-right" size=${11} />
        </button>`
      : html`<span class="shrink-0 text-[14px] text-faint">${unit}</span>`}
  </label>`;
}

function MarketChip({ price }) {
  const [state, setState] = useState('idle');
  useEffect(() => {
    if (!price) return setState('idle');
    setState('checking');
    const t = setTimeout(() => setState('done'), 850);
    return () => clearTimeout(t);
  }, [price]);
  if (state === 'idle') return null;
  const [lo, hi] = CATEGORIES.premium.marketRange;
  const v = price < lo ? ['נמוך מהשוק', 'bg-warn-50 text-warn'] : price > hi ? ['מעל השוק', 'bg-brand-100 text-brand-600'] : ['תחרותי', 'bg-brand-100 text-brand-600'];
  return html`<span class="slide-in flex flex-wrap items-center gap-x-1.5 gap-y-0.5" title=${`עסקים דומים מתמחרים בין ${money(lo)} ל-${money(hi)}`}>
    <span class=${cx('inline-flex items-center gap-1 rounded-full px-2 py-px text-[12px] font-bold', state === 'done' ? v[1] : 'bg-brand-50 text-brand-600')}>
      <${Icon} name="sparkles" size=${12} /> ${state === 'checking' ? html`<${Dots} />` : v[0]}
    </span>
    ${state === 'done' && html`<span class="whitespace-nowrap text-[12px] text-muted tabular-nums">בשוק: ${money(lo).replace(' ₪', '')} עד ${money(hi)}</span>`}
  </span>`;
}

function Keep({ product, hourlyRate }) {
  const r = profitOf({ ...product, hourlyRate });
  if (!r) return html`<span class="text-[16px] text-faint">—</span>`;
  if (r.free) return html`<span class="rounded-full bg-brand-100 px-2.5 py-1 text-[12px] font-bold text-brand-600">חינם</span>`;
  const m = r.margin;
  const tone = m >= 60 ? 'bg-brand-100 text-brand-600' : m >= 35 ? 'bg-warn-50 text-warn' : 'bg-error-50 text-error';
  return html`<div class="flex items-center gap-2 md:flex-col md:items-start md:gap-0.5">
    <span class=${cx('whitespace-nowrap text-[18px] font-black leading-tight tabular-nums', r.profit < 0 ? 'text-error' : 'text-ink')}>${money(r.profit)}</span>
    <span class=${cx('rounded-full px-2 py-px text-[12px] font-bold tabular-nums', tone)}>${pct(Math.max(m, 0))}</span>
  </div>`;
}

function Row({ product, update, hourlyRate }) {
  const set = (patch) => update(product.id, patch);
  const byHours = product.costMode === 'hours';
  return html`<li class=${cx('grid grid-cols-2 items-center gap-x-3 gap-y-2 px-4 py-2 md:px-5', COLS)}>
    <div class="col-span-2 min-w-0 md:col-span-1">
      <p class="font-display flex items-center gap-2 text-[16px] font-bold text-ink">
        <span class=${cx('h-2.5 w-2.5 shrink-0 rounded-full', CAT_STYLE[product.category].swatch)} title=${CATEGORIES[product.category].label}></span>
        <span class="line-clamp-2 leading-snug">${product.name || 'מוצר ללא שם'}</span>
      </p>
      ${product.category === 'premium' && html`<div class="mt-1 ps-[18px]"><${MarketChip} price=${product.price} /></div>`}
    </div>
    <div>
      <p class="mb-1 text-[12px] font-semibold text-muted md:hidden">מחיר</p>
      <${NumBox} label="מחיר ללקוח" unit="₪" value=${product.price} onInput=${(v) => set({ price: v })} />
    </div>
    <div>
      <p class="mb-1 text-[12px] font-semibold text-muted md:hidden">עלות</p>
      <${NumBox}
        label=${byHours ? 'שעות עבודה' : 'עלות בשקלים'}
        unit=${byHours ? 'שעות' : '₪'}
        step=${byHours ? 0.5 : 1}
        value=${byHours ? product.hours : product.cost}
        onInput=${(v) => set(byHours ? { hours: v } : { cost: v })}
        onUnit=${() => set({ costMode: byHours ? 'fixed' : 'hours' })}
      />
    </div>
    <div class="col-span-2 flex items-center justify-between md:col-span-1 md:justify-start">
      <p class="text-[12px] font-semibold text-muted md:hidden">נשאר לך</p>
      <${Keep} product=${product} hourlyRate=${hourlyRate} />
    </div>
  </li>`;
}

export function PricingScreen({ products, setProducts }) {
  const hourlyRate = products[0]?.hourlyRate ?? DEFAULT_HOURLY_RATE;
  const setHourlyRate = (v) => setProducts((l) => l.map((p) => ({ ...p, hourlyRate: v ?? 0 })));
  const update = (id, patch) => setProducts((l) => l.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  const ordered = CATEGORY_ORDER.flatMap((c) => products.filter((p) => p.category === c));
  const priced = products.map((p) => profitOf({ ...p, hourlyRate })).filter((r) => r && !r.free && r.margin != null);
  const avg = priced.length ? priced.reduce((s, r) => s + r.margin, 0) / priced.length : null;
  const anyHours = products.some((p) => p.costMode === 'hours');

  return html`<div>
    <section class="min-w-0">
      <div class="mb-2 flex flex-wrap items-center justify-between gap-3">
        <h3 class="fb-h3">מחיר לכל מוצר</h3>
        ${anyHours &&
        html`<label class="flex items-center gap-2 text-[14px] font-semibold text-ink">
          <${Icon} name="clock" size=${16} class="text-brand-600" />
          שעת עבודה שלך
          <span class="flex h-10 w-24 items-center rounded-lg border-[1.5px] border-[#d3d9e4] bg-white px-2.5 focus-within:border-brand-600 focus-within:ring-4 focus-within:ring-brand-100">
            <input
              type="number"
              inputmode="decimal"
              min="0"
              value=${hourlyRate}
              onInput=${(e) => setHourlyRate(parseNum(e.target.value))}
              class="font-display w-full min-w-0 bg-transparent text-[16px] font-bold text-ink outline-none tabular-nums"
            />
            <span class="text-[14px] text-faint">₪</span>
          </span>
        </label>`}
      </div>

      <${Panel} class="overflow-hidden !p-0">
        <div class=${cx('hidden gap-x-3 border-b border-line bg-brand-50 px-5 py-2.5 text-[12px] font-bold text-muted md:grid', COLS)}>
          <span>מוצר</span><span>מחיר</span><span>עלות</span><span>נשאר לך</span>
        </div>
        <ol class="thin-scroll max-h-[248px] divide-y divide-line overflow-y-auto">
          ${ordered.map((p) => html`<${Row} key=${p.id} product=${p} update=${update} hourlyRate=${hourlyRate} />`)}
        </ol>
        ${avg != null &&
        html`<div class="flex items-center justify-between border-t border-line bg-brand-50 px-5 py-2.5">
          <span class="text-[14px] font-semibold text-muted">רווחיות ממוצעת</span>
          <span class="text-[18px] font-black text-ink tabular-nums">${pct(avg)}</span>
        </div>`}
      <//>
    </section>
  </div>`;
}
