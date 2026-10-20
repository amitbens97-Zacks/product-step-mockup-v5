// Screen 2: the basket. One category at a time (choice tiles), the products in it,
// and the partner's suggestions beside it: choose instead of type, typing always possible.
import { html, useState, useEffect, useRef, Icon, cx } from '../lib.js';
import { Panel, Button, IconBtn } from '../components.js';
import { CATEGORIES, CATEGORY_ORDER, SUGGESTIONS, DEFAULT_HOURLY_RATE, PARTNER, newId } from '../data.js';
import { CAT_STYLE } from '../theme.js';
import { anchorSuggestions } from './anchor.js';

let generatedOnce = false;

const blank = (category, fields = {}) => ({
  id: newId(),
  category,
  name: '',
  description: '',
  price: null,
  costMode: 'hours',
  cost: null,
  hours: null,
  hourlyRate: DEFAULT_HOURLY_RATE,
  source: 'manual',
  ...fields,
});

// A one-line-looking text field that wraps and grows instead of cutting text off.
function GrowText({ inputRef, value, onValue, placeholder, class: cls }) {
  const own = useRef();
  const ref = inputRef || own;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  });
  return html`<textarea
    ref=${ref}
    rows="1"
    value=${value}
    placeholder=${placeholder}
    onInput=${(e) => onValue(e.target.value)}
    onKeyDown=${(e) => e.key === 'Enter' && e.preventDefault()}
    class=${`block w-full resize-none overflow-hidden bg-transparent outline-none placeholder:text-faint ${cls}`}
  ></textarea>`;
}

function ProductLine({ n, product, onChange, onRemove, autoFocus }) {
  const ref = useRef();
  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, []);
  return html`<li class="rise group flex gap-3 border-b border-line py-2.5 last:border-b-0">
    <span class="mt-0.5 w-5 shrink-0 text-center text-[14px] font-bold text-faint tabular-nums">${n}</span>
    <div class="min-w-0 flex-1">
      <${GrowText} inputRef=${ref} value=${product.name} placeholder="שם המוצר" onValue=${(v) => onChange({ name: v })} class="font-display text-[16px] font-bold leading-snug text-ink" />
      <${GrowText} value=${product.description} placeholder="מה הלקוח מקבל בפועל?" onValue=${(v) => onChange({ description: v })} class="mt-0.5 text-[14px] leading-snug text-muted" />
    </div>
    ${product.source === 'ai' && html`<span class="fb-filled-by mt-0.5 h-fit shrink-0"><${Icon} name="pencil" size=${12} />${PARTNER.name}</span>`}
    ${product.source === 'anchor' && html`<span class="mt-0.5 h-fit shrink-0 rounded-full bg-brand-600 px-2 py-0.5 text-[12px] font-bold text-white">המוצר המרכזי</span>`}
    <${IconBtn} icon="trash-2" label="מחיקה" onClick=${onRemove} class="opacity-60 group-hover:opacity-100" />
  </li>`;
}

export function CatalogScreen({ products, setProducts, dismissed, setDismissed, anchor }) {
  const [tab, setTab] = useState('entry');
  const around = anchorSuggestions(anchor);
  const [generating, setGenerating] = useState(!generatedOnce);
  const [focusId, setFocusId] = useState(null);

  useEffect(() => {
    if (generatedOnce) return;
    const t = setTimeout(() => {
      generatedOnce = true;
      setGenerating(false);
    }, 1400);
    return () => clearTimeout(t);
  }, []);

  const cat = CATEGORIES[tab];
  const list = products.filter((p) => p.category === tab);
  const adopted = new Set(products.map((p) => p.suggestionId).filter(Boolean));
  // Two suggestions at a time; the next one shows once one is added or removed.
  const suggestions = [...(around[tab] ? [around[tab]] : []), ...SUGGESTIONS[tab]].filter((s) => !adopted.has(s.id) && !dismissed.includes(s.id)).slice(0, 2);

  const add = (fields) => {
    const p = blank(tab, fields);
    setProducts((l) => [...l, p]);
    return p;
  };
  const update = (id, patch) => setProducts((l) => l.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  const remove = (id) => setProducts((l) => l.filter((p) => p.id !== id));

  return html`<div class="flex flex-col gap-3">
    <div role="tablist" aria-label="קטגוריות מוצרים" class="grid grid-cols-2 gap-3 md:grid-cols-4">
      ${CATEGORY_ORDER.map((c) => {
        const count = products.filter((p) => p.category === c).length;
        const on = c === tab;
        return html`<button key=${c} type="button" role="tab" aria-selected=${on} onClick=${() => setTab(c)} class=${cx('fb-tile text-start', on && 'is-on')}>
          <span class=${cx('sketch-chip flex h-10 w-10 shrink-0 items-center justify-center', CAT_STYLE[c].tab)}><${Icon} name=${CATEGORIES[c].icon} size=${20} /></span>
          <span class="min-w-0">
            <b class="truncate">${CATEGORIES[c].label}</b>
            <small class=${count ? '!text-brand-600 !font-bold' : ''}>${count === 0 ? 'ריק, וזה בסדר' : count === 1 ? 'מוצר אחד' : `${count} מוצרים`}</small>
          </span>
        </button>`;
      })}
    </div>

    <div class="grid gap-3 md:grid-cols-[1fr_280px]">
      <${Panel} class="!p-4 md:!p-5" role="tabpanel">
        <div class="mb-2">
          <h3 class="fb-h3">${cat.label}</h3>
          <p class="text-[14px] text-muted">${cat.description}</p>
        </div>
        ${list.length
          ? html`<ol class="thin-scroll max-h-[180px] overflow-y-auto">
              ${list.map(
                (p, i) => html`<${ProductLine}
                  key=${p.id}
                  n=${i + 1}
                  product=${p}
                  autoFocus=${p.id === focusId}
                  onChange=${(patch) => update(p.id, patch)}
                  onRemove=${() => remove(p.id)}
                />`,
              )}
            </ol>`
          : html`<div class="fb-empty !p-5">
              <span class="text-[16px]">עוד אין מוצרים כאן. אפשר להוסיף מהצעות הכריש, או מוצר משלך.</span>
            </div>`}
        <${Button} variant="secondary" class="mt-3 !h-10" onClick=${() => setFocusId(add().id)}>מוצר משלי <${Icon} name="plus" size=${16} /><//>
      <//>

      <aside class="fb-sugg !gap-2 !p-3.5" aria-label="הצעות הכריש">
        <p class="fb-sugg-title"><${Icon} name="sparkles" size=${16} class="text-brand-600" /> הצעות הכריש</p>
        ${generating
          ? [0, 1].map(() => html`<div class="fb-sugg-card"><div class="fb-skeleton w-3/4"></div><div class="fb-skeleton w-full"></div></div>`)
          : suggestions.length
            ? suggestions.map(
                (s) => html`<div key=${s.id} class="rise fb-sugg-card !gap-1 !py-2.5">
                  <b class="text-[16px] leading-snug">${s.name}</b>
                  <span class="line-clamp-2 leading-snug">${s.description}</span>
                  <div class="fb-sugg-actions">
                    <${Button} variant="mini" onClick=${() => add({ name: s.name, description: s.description, source: 'ai', suggestionId: s.id })}>הוספה<//>
                    <${Button} variant="text" onClick=${() => setFocusId(add({ name: s.name, description: s.description, source: 'ai', suggestionId: s.id }).id)}>הוספה ועריכה<//>
                    <button type="button" aria-label="הסרת ההצעה" title="הסרת ההצעה" onClick=${() => setDismissed((d) => [...d, s.id])} class="ms-auto rounded p-1 text-faint hover:text-error cursor-pointer">
                      <${Icon} name="x" size=${16} />
                    </button>
                  </div>
                </div>`,
              )
            : html`<p class="text-[14px] text-muted">אין עוד הצעות לקטגוריה הזו.</p>`}
      </aside>
    </div>
  </div>`;
}
