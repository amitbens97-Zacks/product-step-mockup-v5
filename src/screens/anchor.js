// "המוצר המרכזי": the product the business is built around, defined before the basket.
// Five short questions, one per screen: product or service, its form, its name, what the
// customer gets (fixed choices per kind, prefilled by the shark), and the steps the
// customer goes through. Beside it, "המוצר המרכזי שלך" fills with every answer; at the
// end the product enters the funnel (premium by default) and its work hours go to pricing.
import { html, useState, Icon, cx } from '../lib.js';
import { Panel, Button, IconBtn, FilledBy } from '../components.js';
import { CATEGORIES, CATEGORY_ORDER, DEFAULT_HOURLY_RATE } from '../data.js';
import { CAT_STYLE } from '../theme.js';

export const ANCHOR_QUESTIONS = 5;

const KINDS = [
  { id: 'service', label: 'שירות', sub: 'ליווי, ייעוץ, טיפול, סדנה', icon: 'handshake' },
  { id: 'product', label: 'מוצר', sub: 'קורס, ערכה, מוצר פיזי או דיגיטלי', icon: 'package' },
];

// Forms per kind, ordered for this business (the first is the recommendation).
const FORMATS = {
  service: [
    { id: 'one', label: 'ליווי אישי 1:1', sub: 'פגישות קבועות לאורך זמן' },
    { id: 'group', label: 'תוכנית קבוצתית', sub: 'כמה לקוחות יחד' },
    { id: 'workshop', label: 'סדנה', sub: 'מפגש אחד מרוכז' },
    { id: 'consult', label: 'ייעוץ חד-פעמי', sub: 'פגישה אחת ותוכנית' },
  ],
  product: [
    { id: 'course', label: 'קורס דיגיטלי', sub: 'שיעורים מוקלטים' },
    { id: 'kit', label: 'ערכה ותבניות', sub: 'קבצים מוכנים לשימוש' },
    { id: 'physical', label: 'מוצר פיזי', sub: 'נשלח ללקוח' },
    { id: 'club', label: 'מנוי לתוכן', sub: 'תוכן חדש כל חודש' },
  ],
};

const NAMES = {
  one: ['תוכנית ליווי 90 יום 1:1', 'שיטת 90 הימים: ליווי אישי', 'מערך שיווק שעובד ב-90 יום'],
  group: ['קבוצת 90 הימים', 'מאסטרמיינד שיווק לעסקים קטנים', 'תוכנית קבוצתית: שיווק שעובד'],
  workshop: ['סדנת אסטרטגיה: 90 יום קדימה', 'יום עבודה: תוכנית שיווק כתובה', 'סדנת שיווק דיגיטלי מעשית'],
  consult: ['פגישת אסטרטגיה ממוקדת', 'ייעוץ שיווק: שעה אחת, תוכנית אחת', 'בדיקת מערך השיווק'],
  course: ['קורס שיווק דיגיטלי לעסקים קטנים', 'שיטת 90 הימים: הקורס', 'שיווק שעובד: קורס מעשי'],
  kit: ['ערכת תוכן ל-90 יום', 'תבניות שיווק מוכנות', 'ערכת קמפיין ראשון'],
  physical: ['פלנר שיווק ל-90 יום', 'ערכת תכנון שיווק', 'מחברת השיווק של העסק'],
  club: ['מועדון שיווק חודשי', 'תוכן שיווקי מוכן כל חודש', 'מנוי תבניות לעסקים'],
};

// What the customer gets: fixed questions per kind, answered with one tap.
const ATTRS = {
  service: [
    { key: 'duration', label: 'לכמה זמן?', opts: ['יום אחד', 'חודש', '3 חודשים', '6 חודשים'] },
    { key: 'sessions', label: 'כמה מפגשים?', opts: ['1', '4', '8', '12', '24'] },
    { key: 'length', label: 'כמה זמן כל מפגש?', opts: ['45 דקות', '60 דקות', '90 דקות', '3 שעות'] },
    { key: 'where', label: 'איפה?', opts: ['זום', 'פרונטלי', 'משולב'] },
    { key: 'who', label: 'עם מי?', opts: ['אישי', 'קבוצה קטנה'] },
  ],
  product: [
    { key: 'units', label: 'כמה יחידות?', opts: ['5', '10', '20', '30'] },
    { key: 'media', label: 'באיזו צורה?', opts: ['וידאו', 'PDF', 'משולב'] },
    { key: 'access', label: 'לכמה זמן גישה?', opts: ['3 חודשים', 'שנה', 'לתמיד'] },
    { key: 'support', label: 'עם ליווי?', opts: ['בלי', 'קבוצת WhatsApp', 'מפגש חודשי'] },
  ],
};

const DEFAULTS = {
  one: { duration: '3 חודשים', sessions: '12', length: '60 דקות', where: 'משולב', who: 'אישי' },
  group: { duration: '3 חודשים', sessions: '8', length: '90 דקות', where: 'זום', who: 'קבוצה קטנה' },
  workshop: { duration: 'יום אחד', sessions: '1', length: '3 שעות', where: 'פרונטלי', who: 'קבוצה קטנה' },
  consult: { duration: 'יום אחד', sessions: '1', length: '90 דקות', where: 'זום', who: 'אישי' },
  course: { units: '10', media: 'משולב', access: 'לתמיד', support: 'קבוצת WhatsApp' },
  kit: { units: '20', media: 'PDF', access: 'לתמיד', support: 'בלי' },
  physical: { units: '5', media: 'PDF', access: 'לתמיד', support: 'בלי' },
  club: { units: '5', media: 'משולב', access: 'שנה', support: 'מפגש חודשי' },
};

const STEPS = {
  one: ['פגישת אבחון ומיפוי', 'אסטרטגיה כתובה ל-90 יום', 'הקמת הקמפיינים והתוכן', 'בקרה ושיפור כל שבועיים', 'סיכום ותוכנית להמשך'],
  group: ['מפגש פתיחה ומיפוי לכל משתתף', 'בניית האסטרטגיה בקבוצה', 'משימות שבועיות ובדיקה', 'מפגש סיכום ותוכנית אישית'],
  workshop: ['מיפוי המצב היום', 'בניית התוכנית יחד', 'תוכנית כתובה ל-90 יום'],
  consult: ['שאלון קצר לפני הפגישה', 'פגישת אסטרטגיה', 'סיכום והמלצות בכתב'],
  course: ['למי מוכרים, ובמה', 'בניית המסר', 'קמפיין ראשון', 'מדידה ושיפור'],
  kit: ['הורדת הערכה', 'התאמת התבניות לעסק', 'פרסום ראשון'],
  physical: ['קבלת הערכה', 'תכנון החודש הראשון', 'מעקב ושיפור'],
  club: ['הצטרפות', 'תוכן חדש בתחילת כל חודש', 'מפגש שאלות ותשובות'],
};

const MIN_STEPS = 3;
const MAX_STEPS = 5;

export const emptyAnchor = () => ({ kind: null, format: null, name: '', attrs: {}, steps: [], tier: 'premium', filled: {} });

export function anchorFormat(a) {
  return a.kind && a.format ? FORMATS[a.kind].find((f) => f.id === a.format) : null;
}

// Work hours for a service: sessions x session length. A product has a fixed cost instead.
export function anchorHours(a) {
  if (a.kind !== 'service') return null;
  const n = Number(a.attrs.sessions) || 0;
  const len = a.attrs.length;
  const mins = len === '3 שעות' ? 180 : parseInt(len, 10) || 0;
  return n && mins ? Math.round(((n * mins) / 60) * 10) / 10 : null;
}

export function anchorSummary(a) {
  const f = anchorFormat(a);
  if (!f) return '';
  const at = a.attrs;
  const bits =
    a.kind === 'service'
      ? [at.sessions && `${at.sessions === '1' ? 'מפגש אחד' : `${at.sessions} מפגשים`}${at.length ? ` של ${at.length}` : ''}`, at.duration && at.duration !== 'יום אחד' && `לאורך ${at.duration}`, at.where]
      : [at.units && `${at.units} יחידות`, at.media, at.access && `גישה ${at.access === 'לתמיד' ? 'לתמיד' : `ל${at.access}`}`];
  return [f.label, ...bits.filter(Boolean)].join(' · ');
}

// The anchor as a basket product (price is kept when it already has one).
export function anchorProduct(a, existing) {
  return {
    id: 'anchor',
    category: a.tier,
    name: a.name.trim(),
    description: anchorSummary(a),
    price: existing?.price ?? null,
    costMode: a.kind === 'service' ? 'hours' : 'fixed',
    hours: anchorHours(a),
    cost: existing?.cost ?? null,
    hourlyRate: existing?.hourlyRate ?? DEFAULT_HOURLY_RATE,
    source: 'anchor',
  };
}

// Basket suggestions built around the anchor, one per other category.
export function anchorSuggestions(a) {
  if (!a?.name?.trim()) return {};
  const n = a.name.trim();
  const out = {
    entry: { id: 'a-entry', name: 'שיחת היכרות של 30 דקות', description: `שיחה חינמית שבסופה ברור אם ${n} מתאים` },
    bridge: { id: 'a-bridge', name: `סדנה של 3 שעות: טעימה מ${n}`, description: 'ניצחון מהיר שמכין את הדרך לשירות המלא' },
    premium: { id: 'a-premium', name: `${n} בליווי צמוד`, description: 'אותו תהליך, עם זמינות גבוהה יותר' },
    recurring: { id: 'a-recurring', name: `ליווי המשך חודשי אחרי ${n}`, description: 'מפגש בחודש ובקרה שוטפת למי שסיים' },
  };
  delete out[a.tier];
  return out;
}

export function anchorReason(a, q) {
  if (q === 0 && !a.kind) return 'צריך לבחור מוצר או שירות כדי להמשיך';
  if (q === 1 && !a.format) return 'צריך לבחור צורה כדי להמשיך';
  if (q === 2 && !a.name.trim()) return 'צריך שם כדי להמשיך';
  if (q === 4 && a.steps.filter((s) => s.trim()).length < MIN_STEPS) return `צריך לפחות ${MIN_STEPS} שלבים כדי להמשיך`;
  return null;
}

// Heading per question: eyebrow, title [before, marked, after], one help line.
export function anchorHead(q, a) {
  const what = a.kind === 'product' ? 'המוצר' : 'השירות';
  return [
    { title: ['מה ', 'מוכרים', ': מוצר או שירות?'], sub: 'שירות הוא הזמן והמומחיות שלך. מוצר הוא משהו שהלקוח מקבל ונשאר אצלו.' },
    { title: ['באיזו ', 'צורה', '?'], sub: 'מסודר לפי מה שמתאים לתחום שלך. הראשון הוא ההמלצה.' },
    { title: ['איך ', 'קוראים', a.kind === 'product' ? ' למוצר?' : ' לשירות?'], sub: 'שם קצר שהלקוח מבין ממנו מיד מה הוא מקבל.' },
    { title: ['מה הלקוח ', 'מקבל', '?'], sub: 'הכריש מילא את המקובל בתחום. אפשר לשנות כל בחירה.' },
    { title: ['מה הלקוח ', 'עובר', ', שלב אחרי שלב?'], sub: `${MIN_STEPS} עד ${MAX_STEPS} שלבים לפי הסדר. אפשר לערוך ולשנות את הסדר.` },
  ][q];
}

function Tile({ on, onClick, icon, label, sub, badge }) {
  return html`<button type="button" role="radio" aria-checked=${on} onClick=${onClick} class=${cx('fb-tile relative !h-auto !min-h-[76px] text-start', on && 'is-on')}>
    ${icon && html`<span class="sketch-chip flex h-11 w-11 shrink-0 items-center justify-center bg-brand-50 text-brand-600"><${Icon} name=${icon} size=${22} /></span>`}
    <span class="min-w-0">
      <b class="block text-[17px]">${label}</b>
      <small class="block">${sub}</small>
      ${badge && html`<span class="mt-1 inline-block rounded-full bg-brand-100 px-2 py-px text-[12px] font-bold text-brand-600">${badge}</span>`}
    </span>
  </button>`;
}

function ChoiceRow({ label, opts, value, onPick }) {
  return html`<div class="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-line py-1.5 last:border-b-0">
    <span class="w-[150px] shrink-0 text-[15px] font-bold text-ink">${label}</span>
    <div class="flex flex-wrap gap-2" role="radiogroup" aria-label=${label}>
      ${opts.map(
        (o) => html`<button key=${o} type="button" role="radio" aria-checked=${value === o} onClick=${() => onPick(o)} class=${cx('fb-chip !h-9', value === o && 'is-on')}>${o}</button>`,
      )}
    </div>
  </div>`;
}

export function AnchorScreen({ anchor: a, set, q, pick }) {
  const [draft, setDraft] = useState('');
  const what = a.kind === 'product' ? 'המוצר' : 'השירות';

  if (q === 0)
    return html`<div class="grid max-w-3xl gap-3 sm:grid-cols-2" role="radiogroup" aria-label="מוצר או שירות">
      ${KINDS.map((k) => html`<${Tile} key=${k.id} on=${a.kind === k.id} icon=${k.icon} label=${k.label} sub=${k.sub} onClick=${() => pick({ kind: k.id, format: a.kind === k.id ? a.format : null })} />`)}
    </div>`;

  if (q === 1)
    return html`<div class="grid max-w-4xl grid-cols-2 gap-3 md:grid-cols-4" role="radiogroup" aria-label=${`הצורה של ${what}`}>
      ${FORMATS[a.kind].map(
        (f, i) => html`<${Tile}
          key=${f.id}
          on=${a.format === f.id}
          label=${f.label}
          sub=${f.sub}
          badge=${i === 0 ? 'מומלץ לתחום שלך' : null}
          onClick=${() => pick({ format: f.id, attrs: { ...DEFAULTS[f.id] }, steps: [...STEPS[f.id]], filled: { attrs: true, steps: true } })}
        />`,
      )}
    </div>`;

  if (q === 2)
    return html`<div class="flex max-w-2xl flex-col gap-3">
      <label class="fb-field-big flex items-center">
        <span class="sr-only">${`השם של ${what}`}</span>
        <input autofocus value=${a.name} onInput=${(e) => set({ name: e.target.value })} placeholder="לדוגמה: תוכנית ליווי 90 יום" class="w-full bg-transparent text-[20px] font-bold text-ink outline-none placeholder:text-faint" />
      </label>
      <div class="fb-sugg !gap-2 !p-3.5">
        <p class="fb-sugg-title"><${Icon} name="pencil" size=${16} class="text-brand-600" /> הצעות הכריש</p>
        <div class="flex flex-wrap gap-2">
          ${NAMES[a.format].map((n) => html`<button key=${n} type="button" class=${cx('fb-chip', a.name === n && 'is-on')} onClick=${() => set({ name: n })}>${n}</button>`)}
        </div>
      </div>
    </div>`;

  if (q === 3)
    return html`<${Panel} class="max-w-3xl !px-5 !py-2">
      ${a.filled.attrs && html`<div class="pt-2"><${FilledBy} /></div>`}
      ${ATTRS[a.kind].map(
        (r) => html`<${ChoiceRow} key=${r.key} label=${r.label} opts=${r.opts} value=${a.attrs[r.key]} onPick=${(o) => set({ attrs: { ...a.attrs, [r.key]: o }, filled: { ...a.filled, attrs: false } })} />`,
      )}
    <//>`;

  // q === 4: the steps, in order. Edit in place, move up or down, remove, add.
  const steps = a.steps;
  const setSteps = (list) => set({ steps: list, filled: { ...a.filled, steps: false } });
  const move = (i, d) => {
    const j = i + d;
    if (j < 0 || j >= steps.length) return;
    const l = [...steps];
    [l[i], l[j]] = [l[j], l[i]];
    setSteps(l);
  };
  const addStep = () => {
    const v = draft.trim();
    if (!v || steps.length >= MAX_STEPS) return;
    setSteps([...steps, v]);
    setDraft('');
  };
  return html`<${Panel} class="max-w-3xl !p-4 md:!px-5">
    ${a.filled.steps && html`<div class="mb-1.5"><${FilledBy} /></div>`}
    <ol class="flex flex-col gap-1.5">
      ${steps.map(
        (s, i) => html`<li key=${i} class="flex items-center gap-2 rounded-xl border border-line bg-white px-2 py-0.5">
          <span class="w-6 shrink-0 text-center text-[14px] font-bold text-brand-600 tabular-nums">${i + 1}</span>
          <input value=${s} aria-label=${`שלב ${i + 1}`} onInput=${(e) => setSteps(steps.map((x, k) => (k === i ? e.target.value : x)))} class="h-9 min-w-0 flex-1 bg-transparent text-[16px] font-semibold text-ink outline-none" />
          <${IconBtn} icon="arrow-up" label="למעלה" onClick=${() => move(i, -1)} disabled=${i === 0} class="disabled:opacity-30" />
          <${IconBtn} icon="arrow-down" label="למטה" onClick=${() => move(i, 1)} disabled=${i === steps.length - 1} class="disabled:opacity-30" />
          <${IconBtn} icon="trash-2" label="מחיקה" onClick=${() => setSteps(steps.filter((_, k) => k !== i))} />
        </li>`,
      )}
    </ol>
    ${steps.length < MAX_STEPS &&
    html`<div class="mt-2 flex gap-2">
      <input
        value=${draft}
        onInput=${(e) => setDraft(e.target.value)}
        onKeyDown=${(e) => e.key === 'Enter' && (e.preventDefault(), e.stopPropagation(), addStep())}
        placeholder="שלב נוסף"
        aria-label="שלב נוסף"
        class="h-10 min-w-0 flex-1 rounded-xl border-[1.5px] border-[#d3d9e4] bg-white px-3 text-[16px] outline-none focus:border-brand-600"
      />
      <${Button} variant="secondary" class="!h-10" disabled=${!draft.trim()} onClick=${addStep}>הוספה <${Icon} name="plus" size=${16} /><//>
    </div>`}
    <p class="mt-1.5 text-[12px] font-semibold text-muted tabular-nums">${steps.length} מתוך ${MIN_STEPS} עד ${MAX_STEPS} שלבים</p>
  <//>`;
}

// "המוצר המרכזי שלך": the side panel, a card that fills with every answer.
export function AnchorCard({ anchor: a, setTier, showTier }) {
  const f = anchorFormat(a);
  const hours = anchorHours(a);
  const rows = a.kind ? ATTRS[a.kind].filter((r) => a.attrs[r.key]) : [];
  const empty = (t) => html`<span class="text-[14px] text-faint">${t}</span>`;
  return html`<div class="flex flex-col gap-3">
    <div>
      <h2 class="fb-h3 flex items-center gap-2">
        <span class="h-2 w-2 rounded-full bg-brand-600" style="box-shadow:0 0 0 4px rgba(0,56,184,.15)"></span>המוצר המרכזי שלך
      </h2>
      <p class="fb-meta ps-4">מתמלא עם כל תשובה</p>
    </div>
    <div class="fb-panel !p-4">
      <p class="text-[12px] font-bold text-brand-600">${f ? `${a.kind === 'product' ? 'מוצר' : 'שירות'} · ${f.label}` : a.kind ? (a.kind === 'product' ? 'מוצר' : 'שירות') : 'מוצר או שירות?'}</p>
      <p class="font-display mt-0.5 text-[18px] font-extrabold leading-snug text-ink">${a.name.trim() || empty('השם יופיע כאן')}</p>
      ${rows.length
        ? html`<dl class="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-[13px]">
            ${rows.map((r) => html`<dt key=${r.key} class="text-muted">${r.label.replace('?', '')}</dt><dd class="font-semibold text-ink">${a.attrs[r.key]}</dd>`)}
          </dl>`
        : null}
      ${a.steps.length && !showTier
        ? html`<ol class="mt-2 border-t border-line pt-2 text-[13px] text-ink">
            ${a.steps.slice(0, MAX_STEPS).map((s, i) => html`<li key=${i} class="truncate"><span class="text-brand-600 tabular-nums">${i + 1}.</span> ${s}</li>`)}
          </ol>`
        : null}
      ${hours != null && html`<p class="mt-2 flex items-center gap-1.5 rounded-lg bg-brand-50 px-2 py-1 text-[12px] font-bold text-brand-600"><${Icon} name="clock" size=${14} /> כ-${hours} שעות עבודה · נכנס לתמחור</p>`}
      <p class="mt-2 text-[12px] leading-snug text-muted"><b class="text-ink">ממשיך איתך ל:</b> תמחור · הצעה מנצחת · דף נחיתה</p>
    </div>
    ${showTier &&
    a.name.trim() &&
    html`<div class="fb-panel !p-3">
      <p class="mb-1.5 text-[12px] font-bold text-muted">איפה הוא בסל?</p>
      <div class="flex flex-wrap gap-1.5">
        ${CATEGORY_ORDER.map(
          (c) => html`<button key=${c} type="button" onClick=${() => setTier(c)} class=${cx('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[12px] font-bold', a.tier === c ? 'border-brand-600 bg-brand-600 text-white' : 'border-line bg-white text-muted hover:border-brand-300')}>
            <span class=${cx('h-2 w-2 rounded-full', CAT_STYLE[c].swatch)}></span>${CATEGORIES[c].label.replace('מוצר ', '')}
          </button>`,
        )}
      </div>
    </div>`}
  </div>`;
}
