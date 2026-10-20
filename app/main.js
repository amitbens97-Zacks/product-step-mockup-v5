// v5 shell, built to the FlowBiz design system (v20):
//   fixed top bar     - step and chapter, the step's progress in the middle, "דילוג על השלב"
//                       (this mockup has no way out to the home page)
//   notebook page     - the heading written on the page, content in small panels,
//                       "סל המוצרים שלך" beside it, the shark's bubble bottom-right
//   fixed bottom bar  - "חזרה", one status in the middle, the one primary button
import { html, render, useState, useEffect, useRef, Icon, cx, pct, profitOf } from './lib.js';
import {
  Button,
  Toast,
  TopBar,
  BottomBar,
  Progress,
  Status,
  PrimaryButton,
  StepHeading,
  PartnerBubble,
  FillButton,
} from './components.js';
import { RawScreen } from './screens/raw.js';
import { CatalogScreen } from './screens/catalog.js';
import { PricingScreen } from './screens/pricing.js';
import { IdentityScreen, DoneView } from './screens/identity.js';
import { OpeningScreen } from './screens/opening.js';
import { AnchorScreen, AnchorCard, ANCHOR_QUESTIONS, emptyAnchor, anchorProduct, anchorReason, anchorHead } from './screens/anchor.js';
import { Funnel, tiersOf } from './funnel.js';
import { DevPanel } from './devnotes.js';
import { RAW_FIELDS, STEP, PARTNER, scenarioProducts } from './data.js';
import { PARTNER_MESSAGES } from './theme.js';
import { EMBED, IS_PHONE, readView, saveView, writeHandoff, takeHandoff, applyPhoneViewport, ViewToggle, PhonePreview } from './viewswitch.js';

// The opening screen opens every visit to this mockup link (for review). In the product it
// shows on the first entry only: "?from=home", like "המשך מכאן" on the home page, skips it.
const OPENED_KEY = 'flowbiz-v5-opened';
const wasOpened = () => new URLSearchParams(location.search).get('from') === 'home';
const markOpened = (on = true) => {
  try {
    on ? localStorage.setItem(OPENED_KEY, '1') : localStorage.removeItem(OPENED_KEY);
  } catch {}
};
// Screens: 0 מה ידוע, 1 המוצר המרכזי (five questions), 2 סל המוצרים, 3 תמחור, 4 סיכום.
const ANCHOR = 1;
const BASKET = 2;
const SUMMARY = 4;
const PARTS = ['מה ידוע', 'המוצר המרכזי', 'סל המוצרים', 'תמחור', 'סיכום'];
// The parts as the opening screen lists them: name, and what happens there.
const PARTS_DESC = [
  ['מה ידוע', 'מאשרים את מה שכבר כתבנו'],
  ['המוצר המרכזי', 'המוצר שהעסק בנוי סביבו'],
  ['סל המוצרים', 'מוצרים בארבע קטגוריות'],
  ['תמחור', 'מחיר ועלות לכל מוצר'],
  ['סיכום', 'תעודת הזהות המוצרית'],
];
const OPENING_MESSAGE = 'בשלב הזה נבנה יחד את סל המוצרים. אני כבר מכיר את העסק מהשלבים הקודמים, אז חלק גדול מהעבודה מוכן.';

// Each screen: what we build (eyebrow), the question as a title [before, marked, after],
// one help line, and the primary label from the button dictionary.
const HEAD = [
  { eyebrow: 'חומרי הגלם', title: ['מה כבר ', 'ידוע', ' על העסק?'], sub: 'מילאנו מהשלבים הקודמים. נעבור, נדייק ונאשר, ועל זה נבנה את המוצרים.', next: 'המשך' },
  { eyebrow: 'המוצר המרכזי', title: ['', '', ''], sub: '', next: 'המשך' },
  { eyebrow: 'סל המוצרים', title: ['בונים ', 'סביבו', ' את הסל'], sub: 'מה מוביל אל המוצר המרכזי, ומה בא אחריו. אף קטגוריה לא חובה.', next: 'המשך' },
  { eyebrow: 'תמחור', title: ['', 'מחיר', ' לכל מוצר'], sub: 'מחיר ועלות לכל מוצר, ונראה מיד כמה נשאר לך.', next: 'המשך' },
  { eyebrow: 'תעודת הזהות המוצרית', title: ['ככה נראה ', 'סל המוצרים', ' שלך'], sub: '', next: 'סיום השלב' },
];

// After about a minute with no input, the partner offers an example (can be turned off in settings).
const STUCK = [
  'נתקעים? אפשר לאשר את מה שנראה נכון, ולדייק את השאר בהמשך. שום דבר לא ננעל.',
  'נתקעים? אפשר להתחיל ממה שכבר עושים היום ללקוחות, ולדייק אחר כך.',
  'נתקעים? דוגמה מהשטח: יועצת עסקית התחילה משיחת אבחון חינם, והמשיכה לליווי של 3 חודשים.',
  'נתקעים? כלל אצבע: מחיר שמשאיר לפחות חצי ממנו כרווח. את מוצר הכניסה אפשר לתת בחינם.',
  'נתקעים? אפשר לסיים עכשיו. כל כרטיס נשאר פתוח לעריכה גם אחרי השלב.',
];

// "סל המוצרים שלך": the side panel, named for what is being built, filling with every answer.
function BasketPanel({ products }) {
  const tiers = tiersOf(products);
  const priced = products.map(profitOf).filter((r) => r && !r.free && r.margin != null);
  const avg = priced.length ? priced.reduce((s, r) => s + r.margin, 0) / priced.length : null;
  return html`<div class="flex flex-col gap-3">
    <div>
      <h2 class="fb-h3 flex items-center gap-2">
        <span class="h-2 w-2 rounded-full bg-brand-600" style="box-shadow:0 0 0 4px rgba(0,56,184,.15)"></span>סל המוצרים שלך
      </h2>
      <p class="fb-meta ps-4">מתמלא עם כל תשובה</p>
    </div>
    <div class="fb-panel !p-3.5"><${Funnel} products=${products} size="mini" /></div>
    <div class="grid grid-cols-3 gap-2 text-center">
      ${[
        [products.length, 'מוצרים'],
        [`${tiers.length}/4`, 'קטגוריות'],
        [avg == null ? '—' : pct(avg), 'רווחיות'],
      ].map(
        ([v, l]) => html`<div key=${l} class="fb-panel !rounded-[14px] !px-1 !py-2">
          <p class="text-[18px] font-black text-ink tabular-nums">${v}</p>
          <p class="text-[12px] font-semibold text-muted">${l}</p>
        </div>`,
      )}
    </div>
  </div>`;
}

function App({ view, onViewChange }) {
  // Progress handed over from the other view (see viewswitch.js), read once.
  const handoff = useRef();
  if (handoff.current === undefined) handoff.current = takeHandoff();
  const from = (key, fallback) => (handoff.current && key in handoff.current ? handoff.current[key] : fallback);

  const [screen, setScreen] = useState(() => from('screen', wasOpened() ? 0 : -1)); // -1: the opening screen
  const [maxReached, setMaxReached] = useState(() => from('maxReached', 0));
  const [raw, setRaw] = useState(() => from('raw', Object.fromEntries(RAW_FIELDS.map((f) => [f.key, f.value]))));
  const [filled, setFilled] = useState(() => from('filled', {}));
  const [confirmed, setConfirmed] = useState(() => from('confirmed', {}));
  const [products, setProducts] = useState(() => from('products', []));
  const [dismissed, setDismissed] = useState(() => from('dismissed', []));
  const [anchor, setAnchor] = useState(() => from('anchor', emptyAnchor()));
  const [anchorQ, setAnchorQ] = useState(() => from('anchorQ', 0));
  const [doneStage, setDoneStage] = useState(() => (from('doneStage', -1) >= 3 ? 3 : -1)); // -1 not finished, 0..3 progress
  const [save, setSave] = useState('');
  const [undo, setUndo] = useState(null);
  const [read, setRead] = useState(() => new Set());
  const [stuck, setStuck] = useState(false);
  const [dev, setDev] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [toast, setToast] = useState(null);
  const canvas = useRef();

  const showToast = (text, icon) => {
    const id = Date.now();
    setToast({ id, text, icon });
    setTimeout(() => setToast((t) => (t && t.id === id ? null : t)), 2400);
  };

  // Every answer is saved as it is given: "שומר..." then "נשמר", no save button.
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setSave('saving');
    const t = setTimeout(() => setSave('saved'), 700);
    return () => clearTimeout(t);
  }, [raw, confirmed, products, anchor]);

  // "ביטול" stays for 5 seconds after anything done automatically.
  const offerUndo = (text, revert) => setUndo({ id: Date.now(), text, revert });
  useEffect(() => {
    if (!undo) return;
    const t = setTimeout(() => setUndo(null), 5000);
    return () => clearTimeout(t);
  }, [undo]);

  const go = (i) => {
    setDoneStage(-1);
    setUndo(null);
    setScreen(i);
    setMaxReached((m) => Math.max(m, i));
    setStuck(false);
    canvas.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const finish = () => {
    setDoneStage(0);
    setUndo(null);
    canvas.current?.scrollTo({ top: 0 });
    [1, 2, 3].forEach((s, i) => setTimeout(() => setDoneStage(s), 700 * (i + 1)));
  };

  // "דילוג על השלב": no confirmation. In the product it moves to the next step and keeps
  // everything done so far; here it shows the undo for 5 seconds and where it would go.
  const skip = () => {
    offerUndo(`דילגת על ${STEP.name}`, () => showToast('חזרנו בדיוק לאותה נקודה', 'undo-2'));
    showToast(`כאן נפתח השלב הבא: ${STEP.next.name}. כל מה שעשית נשמר`, 'arrow-left');
  };

  const fieldLabel = (k) => RAW_FIELDS.find((f) => f.key === k).label;
  const fillRawField = (key, value) => {
    const prev = raw[key];
    const prevConfirmed = !!confirmed[key];
    setRaw((r) => ({ ...r, [key]: value }));
    setFilled((f) => ({ ...f, [key]: true }));
    setConfirmed((c) => ({ ...c, [key]: true }));
    offerUndo(`${PARTNER.name} מילא את "${fieldLabel(key)}"`, () => {
      setRaw((r) => ({ ...r, [key]: prev }));
      setFilled((f) => ({ ...f, [key]: false }));
      setConfirmed((c) => ({ ...c, [key]: prevConfirmed }));
    });
  };
  const undoFill = (key) => {
    if (undo) {
      undo.revert();
      setUndo(null);
    } else {
      const f = RAW_FIELDS.find((x) => x.key === key);
      setRaw((r) => ({ ...r, [key]: f.value }));
      setFilled((m) => ({ ...m, [key]: false }));
    }
  };

  const opening = screen === -1 && doneStage < 0;
  const working = doneStage < 0 && !opening;
  const anchorWhy = working && screen === ANCHOR ? anchorReason(anchor, anchorQ) : null;
  const nextDisabled = working && (screen === ANCHOR ? !!anchorWhy : screen >= BASKET && products.length === 0);

  // The anchor enters the basket (and the funnel) when its questions are done.
  const commitAnchor = (a = anchor) =>
    setProducts((l) => {
      const old = l.find((p) => p.id === 'anchor');
      const p = anchorProduct(a, old);
      return old ? l.map((x) => (x.id === 'anchor' ? p : x)) : [p, ...l];
    });
  const setAnchorField = (patch) => setAnchor((a) => ({ ...a, ...patch }));
  // A single choice moves on by itself, with "ביטול" for 5 seconds.
  const pickAnchor = (patch) => {
    const before = anchor;
    const q = anchorQ;
    setAnchor((a) => ({ ...a, ...patch }));
    setTimeout(() => {
      setAnchorQ(q + 1);
      offerUndo('עברנו לשאלה הבאה', () => {
        setAnchor(before);
        setAnchorQ(q);
      });
    }, 600);
  };
  const back = () => {
    if (screen === ANCHOR && anchorQ > 0) return setAnchorQ(anchorQ - 1);
    if (screen === BASKET) {
      setAnchorQ(ANCHOR_QUESTIONS - 1);
      return go(ANCHOR);
    }
    go(screen - 1);
  };
  useEffect(() => {
    if (screen === ANCHOR) setMaxReached((m) => Math.max(m, ANCHOR));
  }, [anchorQ]);

  const next = () => {
    if (opening) {
      markOpened();
      return go(0);
    }
    if (!working) return showToast(`כאן נפתח השלב הבא: ${STEP.next.name}`, 'arrow-left');
    if (nextDisabled) return;
    if (screen === 0) setConfirmed(Object.fromEntries(RAW_FIELDS.map((f) => [f.key, true])));
    if (screen === ANCHOR && anchorQ < ANCHOR_QUESTIONS - 1) return setAnchorQ(anchorQ + 1);
    if (screen === ANCHOR) commitAnchor();
    if (screen < SUMMARY) go(screen + 1);
    else finish();
  };

  // ?scenario=full (or any id from the developer panel) opens straight on the summary with a sample basket.
  useEffect(() => {
    // ?screen=1|2 opens that screen with the sample basket, ?done=1 the finish screen (for review screenshots).
    const qs = new URLSearchParams(location.search);
    const id = qs.get('scenario');
    if (id) loadScenario(id, true);
    const at = Number(qs.get('screen'));
    if (id && at >= 0 && at < SUMMARY && qs.has('screen')) go(at);
    // &q=0..4 opens a question of the core product part.
    if (id && qs.has('q')) setAnchorQ(Math.min(Math.max(Number(qs.get('q')) || 0, 0), ANCHOR_QUESTIONS - 1));
    if (id && qs.has('done')) finish();
  }, []);

  // Enter continues (not inside a multi-line field or on a focused button).
  const nextRef = useRef(next);
  nextRef.current = next;
  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName;
      if (e.key === 'D' && e.shiftKey && !['INPUT', 'TEXTAREA'].includes(tag)) setDev((d) => !d);
      if (e.key === 'Enter' && !e.shiftKey && !e.defaultPrevented && !['TEXTAREA', 'BUTTON', 'A', 'SELECT'].includes(tag) && document.activeElement?.getAttribute('role') == null) {
        e.preventDefault();
        nextRef.current();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // About a minute with no input on a screen: the partner offers an example.
  useEffect(() => {
    if (!working) return;
    let t;
    const arm = () => {
      clearTimeout(t);
      t = setTimeout(() => setStuck(true), 60000);
    };
    arm();
    const events = ['keydown', 'pointerdown'];
    events.forEach((ev) => window.addEventListener(ev, arm));
    return () => {
      clearTimeout(t);
      events.forEach((ev) => window.removeEventListener(ev, arm));
    };
  }, [screen, working]);

  const snapshot = () => ({ screen, maxReached, raw, filled, confirmed, products, dismissed, anchor, anchorQ, doneStage });
  useEffect(() => {
    window.__flowbizSnapshot = snapshot;
  });
  const switchView = (v) => {
    if (!IS_PHONE) writeHandoff(snapshot());
    onViewChange(v);
  };

  const loadScenario = (id, quiet) => {
    // The sample basket's premium program is the anchor, defined through its five questions.
    const sample = {
      kind: 'service', format: 'one', name: 'תוכנית ליווי 90 יום 1:1', tier: 'premium', filled: {},
      attrs: { duration: '3 חודשים', sessions: '12', length: '60 דקות', where: ['זום', 'פרונטלי'], who: ['אישי'], extras: ['זמינות ב-WhatsApp', 'חומרי עבודה'] }, custom: {},
      steps: ['פגישת אבחון ומיפוי', 'אסטרטגיה כתובה ל-90 יום', 'הקמת הקמפיינים והתוכן', 'בקרה ושיפור כל שבועיים', 'סיכום ותוכנית להמשך'],
    };
    const list = scenarioProducts(id);
    const i = list.findIndex((p) => p.name === sample.name);
    if (i >= 0) list[i] = { ...anchorProduct(sample, list[i]), category: list[i].category };
    else if (id !== 'premium-only') list.unshift(anchorProduct(sample));
    setAnchor(sample);
    setAnchorQ(ANCHOR_QUESTIONS - 1);
    setProducts(list);
    setConfirmed(Object.fromEntries(RAW_FIELDS.map((f) => [f.key, true])));
    setMaxReached(SUMMARY);
    go(SUMMARY);
    showToast(quiet ? 'מילאנו את סל המוצרים הקיים' : 'נטען תרחיש דוגמה', quiet ? 'package' : 'flask-conical');
  };

  const h = screen === ANCHOR ? { ...HEAD[ANCHOR], ...anchorHead(anchorQ, anchor), eyebrow: `המוצר המרכזי · שאלה ${anchorQ + 1} מתוך ${ANCHOR_QUESTIONS}` } : HEAD[Math.max(screen, 0)];
  const message = opening ? OPENING_MESSAGE : stuck ? STUCK[screen] : PARTNER_MESSAGES[screen];
  const msgKey = `${screen}-${stuck}`; // one message per part, not per question
  const unread = (working || opening) && !read.has(msgKey);
  const xf = RAW_FIELDS.find((f) => f.key === 'xFactor');
  const partnerAction =
    working && screen === 0 && !filled.xFactor && !stuck
      ? html`<${FillButton} onClick=${() => fillRawField('xFactor', xf.apply)} />`
      : null;
  // The side panel shows only once there is something in the basket to show.
  const showBasket = working && screen >= ANCHOR && screen < SUMMARY;
  const reason = !nextDisabled ? null : anchorWhy || 'צריך לפחות מוצר אחד כדי להמשיך';
  // Only the core product in the basket: say plainly that one product is enough.
  const onlyAnchor = working && screen === BASKET && products.length === 1 && products[0].source === 'anchor';
  const hint = opening
    ? ''
    : !working
      ? `הבא: ${STEP.next.name} · כ-${STEP.next.minutes} דקות`
      : screen === 0
        ? 'המשך מאשר את כל הנתונים'
        : onlyAnchor
          ? 'אפשר להמשיך עם מוצר אחד, ולהוסיף עוד כשהעסק יגדל'
          : '';

  const tools = html`<span class="rounded border border-warn/40 bg-warn-50 px-1.5 py-0.5 text-[12px] font-bold text-warn max-lg:hidden">מוק-אפ v5</span>
    ${!EMBED && !window.FB_NO_PHONE_FRAME && html`<${ViewToggle} view=${view} onChange=${switchView} />`}
    <button type="button" onClick=${() => setDev((d) => !d)} title="הערות למפתחים (Shift+D)" aria-label="הערות למפתחים" class="inline-flex h-10 w-10 items-center justify-center rounded-xl text-muted hover:bg-brand-50 hover:text-brand-600 cursor-pointer max-sm:hidden">
      <${Icon} name="code-xml" size=${18} />
    </button>`;

  return html`<div dir="rtl" class="flex h-dvh flex-col bg-canvas text-ink">
    ${EMBED &&
    html`<div dir="ltr" class="flex h-11 shrink-0 items-end justify-between bg-surface px-7 pb-1.5 text-[14px] font-bold text-ink" aria-hidden="true">
      <span>9:41</span>
      <span class="flex items-center gap-1.5"><${Icon} name="signal" size=${15} /><${Icon} name="wifi" size=${15} /><${Icon} name="battery-full" size=${18} /></span>
    </div>`}

    <${TopBar}
      step=${STEP}
      tools=${tools}
      onSkip=${working || opening ? skip : null}
      progress=${html`<${Progress} parts=${PARTS} current=${opening ? -1 : working ? screen : SUMMARY} maxReached=${opening ? -1 : working ? maxReached : SUMMARY} onJump=${go} done=${!working && !opening} />`}
    />

    <div class="fb-notebook fb-margin flex min-h-0 flex-1">
      <main class="relative flex min-w-0 flex-1 flex-col">
        <div ref=${canvas} class="thin-scroll flex-1 overflow-y-auto">
          <div class=${cx('mx-auto px-4 md:px-10', working && screen === SUMMARY ? 'pb-1 pt-3' : 'pb-6 pt-6', !working || screen === SUMMARY ? 'max-w-6xl' : screen >= ANCHOR ? 'max-w-5xl' : 'max-w-4xl', opening && 'flex min-h-full items-center md:py-10 [&>*]:w-full')}>
            ${opening && html`<${OpeningScreen} parts=${PARTS_DESC} onHave=${() => loadScenario('full', true)} />`}
            ${working &&
            html`<div key=${screen === ANCHOR ? `a${anchorQ}` : screen} class="rise">
              <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-8">
                <${StepHeading} n=${screen + 1} eyebrow=${h.eyebrow} title=${h.title} sub=${h.sub}>
                <//>
              </div>
              ${showBasket &&
              html`<button type="button" class="fb-note-tab mb-5 me-3 cursor-pointer md:hidden" onClick=${() => setSheet(true)}>
                <${Icon} name="chart-no-axes-column" size=${16} />${screen === ANCHOR ? 'המוצר המרכזי שלך' : `סל המוצרים שלך · ${products.length}`}
              </button>`}
              ${screen === 0 &&
              html`<${RawScreen}
                raw=${raw}
                setRawField=${(k, v) => setRaw((r) => ({ ...r, [k]: v }))}
                fillRawField=${fillRawField}
                filled=${filled}
                undoFill=${undoFill}
              />`}
              ${screen === ANCHOR && html`<${AnchorScreen} anchor=${anchor} set=${setAnchorField} q=${anchorQ} pick=${pickAnchor} />`}
              ${screen === BASKET && html`<${CatalogScreen} products=${products} setProducts=${setProducts} dismissed=${dismissed} setDismissed=${setDismissed} anchor=${anchor} />`}
              ${screen === 3 &&
              html`<${PricingScreen} products=${products} setProducts=${setProducts} />`}
              ${screen === SUMMARY &&
              html`<${IdentityScreen} products=${products} setProducts=${setProducts} />`}
            </div>`}
            ${!working && !opening && html`<${DoneView} products=${products} stage=${doneStage} />`}
          </div>
        </div>
        ${(working || opening) &&
        html`<${PartnerBubble}
          message=${message}
          unread=${unread}
          onRead=${() => setRead((s) => new Set(s).add(msgKey))}
          action=${partnerAction}
        />`}
      </main>

      ${showBasket &&
      html`<aside class="no-print hidden w-[330px] shrink-0 overflow-y-auto thin-scroll py-8 pe-8 ps-2 xl:block">
        ${screen === ANCHOR ? html`<${AnchorCard} anchor=${anchor} setTier=${(t) => setAnchorField({ tier: t })} showTier=${anchorQ === ANCHOR_QUESTIONS - 1} />` : html`<${BasketPanel} products=${products} />`}
      </aside>`}
    </div>

    <${BottomBar}
      back=${opening
        ? null
        : working
        ? screen > 0 && html`<${Button} variant="secondary" onClick=${back}>חזרה <${Icon} name="arrow-right" size=${18} /><//>`
        : html`<${Button} variant="secondary" onClick=${() => go(SUMMARY)}>חזרה <${Icon} name="arrow-right" size=${18} /><//>`}
      extra=${html`
        ${showBasket &&
        html`<${Button} variant="secondary" class="xl:hidden max-md:hidden" onClick=${() => setSheet(true)}>${screen === ANCHOR ? 'המוצר המרכזי שלך' : 'סל המוצרים שלך'} <${Icon} name="chart-no-axes-column" size=${16} /><//>`}
        ${working && screen === SUMMARY && html`<${Button} variant="secondary" class="max-sm:hidden" onClick=${() => window.print()}>הורדה <${Icon} name="download" size=${16} /><//>`}
      `}
      status=${html`<${Status}
        undo=${undo}
        onUndo=${() => {
          undo?.revert();
          setUndo(null);
        }}
        reason=${reason}
        save=${working && !onlyAnchor ? save : ''}
        hint=${hint}
      />`}
      primary=${html`<${PrimaryButton} label=${opening ? 'מתחילים' : working ? h.next : 'לשלב הבא'} onClick=${next} disabled=${nextDisabled} check=${working && screen === SUMMARY} />`}
    />

    ${sheet &&
    html`<div class="fixed inset-0 z-50 xl:hidden">
      <div class="absolute inset-0 bg-ink/30" onClick=${() => setSheet(false)}></div>
      <div class="rise absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-[18px] bg-canvas p-5 md:inset-x-auto md:end-6 md:bottom-24 md:w-[360px] md:rounded-[18px] md:shadow-2xl">
        <div class="mb-1 flex justify-end">
          <button type="button" aria-label="סגירה" class="rounded-lg p-1.5 text-muted hover:bg-white cursor-pointer" onClick=${() => setSheet(false)}><${Icon} name="x" size=${18} /></button>
        </div>
        ${screen === ANCHOR ? html`<${AnchorCard} anchor=${anchor} setTier=${(t) => setAnchorField({ tier: t })} showTier=${anchorQ === ANCHOR_QUESTIONS - 1} />` : html`<${BasketPanel} products=${products} />`}
      </div>
    </div>`}

    ${EMBED &&
    html`<div class="flex h-6 shrink-0 items-center justify-center bg-surface" aria-hidden="true">
      <span class="h-[5px] w-32 rounded-full bg-ink/80"></span>
    </div>`}

    <${DevPanel}
      open=${dev}
      onClose=${() => setDev(false)}
      screen=${screen}
      onScenario=${(id) => loadScenario(id)}
      onOpening=${() => {
        markOpened(false);
        setDev(false);
        go(-1);
      }}
    />
    <${Toast} toast=${toast} />
  </div>`;
}

// Chooses between the app itself and, on a computer in mobile view, the phone frame.
function Root() {
  const [view, setView] = useState(readView);
  useEffect(() => applyPhoneViewport(view), [view]);
  const change = (v) => {
    saveView(v);
    setView(v);
  };
  if (!EMBED && !IS_PHONE && !window.FB_NO_PHONE_FRAME && view === 'mobile') return html`<${PhonePreview} onSwitch=${change} />`;
  return html`<${App} view=${view} onViewChange=${change} />`;
}

applyPhoneViewport(readView());
render(html`<${Root} />`, document.getElementById('app'));
