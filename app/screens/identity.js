// Screen 4 (summary): the product identity document, in the design system's summary
// document style: a dark header with the logo, the business, the document type and the
// date; under it a light page with one row of numbers and the customer journey funnel,
// big, in the middle. A tap on a funnel layer edits its products. Beside it, one note
// from the shark. Then the finish screen: the badge note, the money saved, notebook
// confetti and what we did with the basket.
import { html, useState, useEffect, Icon, PencilCheck, PencilLine, cx, money, pct, parseNum, profitOf, confetti } from '../lib.js';
import { InlineEdit, Panel, PartnerNote, Note, Mark, SharkAvatar } from '../components.js';
import { Funnel, tiersOf } from '../funnel.js';
import { CATEGORIES, CATEGORY_ORDER, STEP, BUSINESS } from '../data.js';
import { CAT_STYLE } from '../theme.js';

// The shark's note on the basket, and its mood: alert for a business warning.
export function partnerMood(products) {
  return products.map(profitOf).some((r) => r && !r.free && r.margin != null && r.margin < 35) ? 'alert' : 'calm';
}

export function partnerTake(products) {
  const weak = products
    .map((p) => ({ p, r: profitOf(p) }))
    .filter(({ r }) => r && !r.free && r.margin != null && r.margin < 35)
    .sort((a, b) => a.r.margin - b.r.margin)[0];
  if (weak) return `הרווח ב"${weak.p.name}" נמוך (${pct(Math.max(weak.r.margin, 0))}). כדאי לבדוק את המחיר שלו לפני שמתחילים למכור.`;
  if (tiersOf(products).length < 2) return 'יש מוצר אחד ברור, וזו התחלה טובה. כשיהיו לקוחות, נוסיף מוצר כניסה שמביא אותם.';
  return 'הסל מאוזן: יש דרך כניסה ללקוחות, ומוצר שמחזיק את הרווח. אפשר לצאת לדרך.';
}

const today = () => new Intl.DateTimeFormat('he-IL', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());

function Stat({ icon, value, label }) {
  return html`<div class="flex items-center gap-2.5">
    <span class="fb-chip-ic h-9 w-9 shrink-0"><${Icon} name=${icon} size=${18} /></span>
    <span class="min-w-0">
      <b class="font-display block whitespace-nowrap text-[17px] font-extrabold leading-tight text-ink tabular-nums">${value}</b>
      <span class="block text-[12px] font-semibold text-muted">${label}</span>
    </span>
  </div>`;
}

export function IdentityScreen({ products, setProducts }) {
  const [openTier, setOpenTier] = useState(null);
  const update = (id, patch) => setProducts((l) => l.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  const priced = products.map(profitOf).filter((r) => r && !r.free && r.margin != null);
  const avg = priced.length ? priced.reduce((s, r) => s + r.margin, 0) / priced.length : null;
  const prices = products.map((p) => p.price).filter((p) => p != null);
  const lo = prices.length ? Math.min(...prices) : null;
  const hi = prices.length ? Math.max(...prices) : null;
  const span = lo == null ? '—' : lo === hi ? money(lo) : `${lo === 0 ? 'חינם' : money(lo).replace(' ₪', '')} עד ${money(hi)}`;
  const tierProducts = openTier ? products.filter((p) => p.category === openTier) : [];

  return html`<div class="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
    <article class="overflow-hidden rounded-[18px] bg-white ring-1 ring-line" style="box-shadow:var(--shadow-paper)" aria-label="תעודת זהות מוצרית">
      <header class="relative flex items-center gap-4 overflow-hidden px-5 py-2.5 text-white md:px-7" style="background:#2d3e66">
        <svg class="pointer-events-none absolute -left-6 -top-4 h-[130%] opacity-25" viewBox="0 0 200 100" aria-hidden="true">
          <path d="M0 70 C40 40 70 90 110 60 S170 20 200 40" fill="none" stroke="#8fb3ef" stroke-width="6" stroke-linecap="round" />
          <path d="M0 88 C40 60 80 104 120 78 S175 46 200 58" fill="none" stroke="#8fb3ef" stroke-width="3" stroke-linecap="round" />
        </svg>
        <span class="relative grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white p-1.5"><img src="assets/flowbiz-logo-sm.png" alt="FlowBiz" class="h-auto w-full" /></span>
        <div class="relative min-w-0 flex-1">
          <span class="flex items-center gap-2 text-[12px] font-bold" style="color:#8fb3ef"><span class="h-0.5 w-6" style="background:#8fb3ef"></span>תעודת זהות מוצרית</span>
          <h2 class="font-display truncate text-[20px] font-black leading-tight">${BUSINESS.businessName}</h2>
          <p class="truncate text-[14px]" style="color:rgba(255,255,255,.75)">${BUSINESS.domainShort}</p>
        </div>
        <span class="relative shrink-0 text-end text-[12px] leading-snug max-sm:hidden" style="color:rgba(255,255,255,.75)">${today()}<br />שלב ${STEP.stepNo} · ${STEP.chapter}</span>
      </header>

      <div class="px-5 pb-3 pt-3 md:px-7">
        <div class="grid grid-cols-2 gap-x-4 gap-y-3 border-b border-line pb-3 md:grid-cols-4">
          <${Stat} icon="package" value=${products.length} label="מוצרים" />
          <${Stat} icon="layers" value=${`${tiersOf(products).length} מתוך 4`} label="קטגוריות" />
          <${Stat} icon="wallet" value=${span} label="טווח מחירים" />
          <${Stat} icon="trending-up" value=${avg == null ? '—' : pct(avg)} label="רווחיות ממוצעת" />
        </div>
        <div class="mt-3" title="לחיצה על שכבה פותחת את המוצרים שלה לעריכה">
          <${Funnel} products=${products} size="full" rowH=${40} onTier=${setOpenTier} />
        </div>
      </div>
    </article>

    <${PartnerNote} title="הערה על הסל" tilt=${1} mood=${partnerMood(products)}>${partnerTake(products)}<//>

    ${openTier &&
    html`<div class="fixed inset-0 z-50">
      <div class="absolute inset-0 bg-ink/30" onClick=${() => setOpenTier(null)}></div>
      <div class="rise absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-[18px] bg-canvas p-5 md:inset-auto md:left-1/2 md:top-1/2 md:w-[520px] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[18px] md:shadow-2xl" role="dialog" aria-modal="true" aria-label=${CATEGORIES[openTier].label}>
        <div class="mb-3 flex items-center justify-between">
          <h3 class="fb-h3 flex items-center gap-2">
            <span class=${cx('sketch-chip flex h-9 w-9 items-center justify-center', CAT_STYLE[openTier].tab)}><${Icon} name=${CATEGORIES[openTier].icon} size=${18} /></span>
            ${CATEGORIES[openTier].label}
          </h3>
          <button type="button" aria-label="סגירה" class="rounded-lg p-1.5 text-muted hover:bg-white cursor-pointer" onClick=${() => setOpenTier(null)}><${Icon} name="x" size=${18} /></button>
        </div>
        <ul class="flex flex-col gap-2">
          ${tierProducts.map((p) => {
            const r = profitOf(p);
            return html`<li key=${p.id} class="fb-panel flex items-center gap-3 !p-3">
              <div class="min-w-0 flex-1">
                <${InlineEdit} value=${p.name} onSave=${(v) => update(p.id, { name: v })} class="font-display font-bold text-ink" inputClass="text-[16px]" />
                <p class="text-[12px] text-muted">${!r ? 'עוד אין עלות' : r.free ? 'מוצר כניסה' : `רווח ${pct(Math.max(r.margin, 0))}`}</p>
              </div>
              <${InlineEdit}
                value=${p.price == null ? '' : String(p.price)}
                format=${(v) => (v === '' ? '' : Number(v) === 0 ? 'חינם' : money(Number(v)))}
                placeholder="מחיר"
                onSave=${(v) => update(p.id, { price: parseNum(v) })}
                class="font-display text-[18px] font-extrabold text-ink tabular-nums"
                inputClass="w-24 text-[16px]"
              />
            </li>`;
          })}
        </ul>
        <p class="mt-3 text-[12px] text-muted">לחיצה על שם או על מחיר פותחת אותם לעריכה. הכל נשמר מיד.</p>
      </div>
    </div>`}
  </div>`;
}

// ---------- Finish ----------

export function DoneView({ products, stage }) {
  useEffect(() => {
    const t = setTimeout(() => confetti('step'), 250);
    return () => clearTimeout(t);
  }, []);

  const items = [
    ['file-text', 'תעודת הזהות נשמרה כ-PDF בקבצים'],
    ['wallet', `${products.length} מוצרים נכנסו לכספים`],
    ['handshake', 'המוצרים זמינים בניהול הלקוחות'],
  ];
  const [doneSteps, total] = [1, STEP.chapterSteps.length];

  return html`<div class="grid items-start gap-10 pt-6 md:grid-cols-[1fr_260px] md:gap-12 md:pt-10">
    <div class="fb-stack rise justify-self-center">
      <span class="fb-behind b1"></span><span class="fb-behind b2"></span>
      <div class="fb-note is-white fb-badge-note">
        <span class="fb-tape2" aria-hidden="true"></span>
        <span class="fb-seal" aria-hidden="true">
          <span class="fb-seal-in"><${Icon} name="package" size=${30} /><small>תג</small><b>${STEP.badge}</b></span>
        </span>
        <span class="fb-eyebrow justify-center">שלב ${STEP.stepNo} הושלם</span>
        <h1 class="fb-h2">סל המוצרים <${Mark}>מוכן<//></h1>
        <span class="fb-win tabular-nums">+${money(STEP.save)}<${PencilLine} color="#12805c" class="absolute inset-x-0 -bottom-1 h-3 w-full" /></span>
        <span class="flex items-center justify-center gap-2 text-muted"><${SharkAvatar} size=${34} mood="happy" />יועץ עסקי היה גובה על זה ${money(STEP.save)}. בנית את זה בעצמך!</span>
        <span class="fb-boxes">
          ${STEP.chapterSteps.map((s, i) => html`<i key=${s} title=${s}>${i < doneSteps ? html`<${PencilCheck} size=${18} color="#0038b8" />` : null}</i>`)}
          ${total - doneSteps === 1 ? 'עוד שלב אחד לסוף הפרק' : `${doneSteps} מתוך ${total} שלבים`}
        </span>
      </div>
    </div>

    <div class="flex flex-col gap-6">
      <${Note} class="fb-savings" tilt=${3}>
        <span class="fb-label">חסכת עד עכשיו</span>
        <b class="tabular-nums">${money(STEP.savedBefore + STEP.save)}</b>
      <//>
      <${Panel} class="!p-4">
        <p class="mb-2 text-[14px] font-bold text-ink">מה עשינו עם הסל</p>
        <ol class="flex flex-col gap-2.5">
          ${items.map(([icon, text], i) => {
            const done = stage > i;
            return html`<li key=${i} class=${cx('flex items-center gap-2.5 text-[14px] transition-opacity', done || stage === i ? 'opacity-100' : 'opacity-40')}>
              <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] border-2 border-ink bg-white">
                ${done ? html`<${PencilCheck} size=${17} color="#0038b8" weight=${3.2} />` : stage === i ? html`<span class="fb-spin"></span>` : null}
              </span>
              <span class=${done ? 'text-ink' : 'text-muted'}>${text}</span>
            </li>`;
          })}
        </ol>
      <//>
    </div>
  </div>`;
}
