// Developer notes panel: per-screen implementation notes taken from the
// product spec, plus demo scenarios that exercise the dynamic funnel.
import { html, Icon, cx } from './lib.js';
import { SCENARIOS } from './data.js';

const NOTES = [
  {
    title: 'מסך 1 · מה ידוע',
    items: [
      'אין חלון פתיחה: שורה מעל הכותרת ("נבנה את סל המוצרים · כ-20 דקות"), פתק "למה זה חשוב?" (פתוח רק בכניסה הראשונה, אחר כך לשונית), ו"יש לי כבר סל מוצרים" כלינק.',
      'הנתונים נשלפים מ-BusinessPlan ומסומנים "מילאנו לפי..." (לא שואלים פעמיים): תחום העסק, הבעיה שהעסק פותר, היתרון הבלתי הוגן, מודל אספקה. שמות השדות להמחשה, לאמת מול הסכמה.',
      'בכל כרטיס: אישור, עריכה, והתייעצות עם הכריש. ההתייעצות היא קריאת AI עם הקשר השדה, שמחזירה הסבר והצעת ניסוח עם "להכניס לתשובה".',
      '"להכניס לתשובה" ממלא את השדה, מסמן "הכריש מילא · ביטול", ומציג "ביטול" ל-5 שניות באמצע השורה התחתונה.',
      'כל תשובה נשמרת מיד (cache בכל הקלדה, DB בסיום השלב). בשורה התחתונה: "שומר...", "נשמר", או "לא נשמר, מנסים שוב".',
    ],
  },
  {
    title: 'מסך 2 · המוצר המרכזי',
    items: [
      'חלק חובה, לפני הסל: המוצר שהעסק בנוי סביבו. חמש שאלות, שאלה אחת בכל מסך, ו"חזרה" חוזר שאלה אחת.',
      '1 מוצר או שירות, 2 הצורה (4 אריחים לפי התחום, הראשון "מומלץ לתחום שלך"). בחירה עוברת לבד אחרי 600ms, עם "ביטול" ל-5 שניות.',
      '3 השם: שדה ו-3 הצעות של הכריש. 4 מה הלקוח מקבל: שאלות קבועות לפי הסוג (שירות: לכמה זמן, כמה מפגשים, אורך מפגש, איפה, עם מי, מה עוד כלול. מוצר: כמה יחידות, צורה, גישה, ליווי, מה עוד כלול), ממולאות מראש לפי הצורה ומסומנות "הכריש מילא".',
      'בחירה מרובה איפה שאפשר (איפה, עם מי, צורה, ליווי, מה עוד כלול), עם "אפשר לבחור כמה" מתחת לשאלה. "בלי" בליווי מבטל את השאר. בכל שורה "אחר" פותח שדה לערך משלך: אנטר מוסיף אותו כצ׳יפ ובוחר בו, Esc סוגר.',
      '5 השלבים שהלקוח עובר: 3 עד 5, ממולאים מראש, עריכה במקום, למעלה או למטה, מחיקה והוספה.',
      'בצד: "המוצר המרכזי שלך" מתמלא עם כל תשובה, עם "איפה הוא בסל?" (ברירת מחדל: פרימיום) ו"ממשיך איתך ל: תמחור · הצעה מנצחת · דף נחיתה".',
      'בסוף החלק המוצר נכנס לסל ולמשפך (id: anchor, source: anchor). בשירות, שעות העבודה = מפגשים × אורך מפגש, ונכנסות לעלות בתמחור. הצעות הכריש בסל נגזרות מהשם שלו.',
    ],
  },
  {
    title: 'מסך 3 · סל המוצרים',
    items: [
      'ארבע קטגוריות: חדירה, מעבר, פרימיום, מתמשך. אף אחת לא חובה. אפשר להתחיל ממוצר אחד בלבד. מספר המוצרים לא מוגבל.',
      'מחולל AI פרואקטיבי: מקבל את תחום העסק ממסך 1 ומחזיר כ-3 הצעות לכל קטגוריה ({name, description}). מוצגות שתיים בכל פעם: "הוספה", "הוספה ועריכה", או הסרה.',
      'הכפתור הראשי מושבת בלי מוצר, והסיבה כתובה באמצע השורה התחתונה ("צריך לפחות מוצר אחד כדי להמשיך").',
    ],
  },
  {
    title: 'מסך 4 · תמחור',
    items: [
      'אין שורת מחץ בשלב הזה: היא נבנית בצייד הלקוחות, בדיוק הנישה.',
      'לכל מוצר: מחיר מכירה ועלות. העלות היא סכום קבוע או שעות × שווי שעה (נשאל פעם אחת לכל הסל).',
      'רווח = מחיר − עלות, בזמן אמת. מוצר במחיר 0 מוצג כמוצר כניסה. חיווי מחיר שוק רק לפרימיום, כ-800ms אחרי ההקלדה.',
    ],
  },
  {
    title: 'מסך 5 · סיכום, ומסך הסיום',
    items: [
      'הסיכום הוא תעודת הזהות המוצרית, בסגנון מסמך הסיכום של מערכת העיצוב: כותרת כהה עם הלוגו, שם העסק, סוג המסמך והתאריך, שורת מספרים, והמשפך גדול במרכז. לחיצה על שכבה פותחת את המוצרים שלה לעריכה. הכריש מוסיף הערה אחת כפתק.',
      'המשפך נבנה רק מקטגוריות שיש בהן מוצר, בסדר קבוע מלמעלה (חדירה, הרחבה ביותר) למטה. קטגוריה אחת מוצגת כבלוק מרכזי.',
      '"סיום השלב": שמירת התעודה כ-PDF בקבצים, סנכרון לכספים ולניהול הלקוחות.',
      'מסך הסיום: פתק התג על ערימת פתקים, "+800 ₪" (מה שיועץ היה גובה), התקדמות הפרק, פתק "חסכת עד עכשיו", וקונפטי מחברת לשנייה. הכפתור: "לשלב הבא".',
    ],
  },
];

const BACKEND = [
  'בסיום השלב, כל נתוני הסל (שם, קטגוריה, מחיר מכירה, עלות) נכנסים אוטומטית לעמוד "כספים". משם אפשר לערוך מוצרים ולהוסיף חדשים.',
  'בניהול הלקוחות: "הוספת פריט לעסקה" פותח רשימה עם המוצרים. המערכת מחשבת את הרווח לעסקה ומזינה אותו לתחזית התזרים.',
  'השלב הזה הוא שלב 4 מתוך 21, הראשון בפרק 2 "שביל הכסף". שלושת הפרקים הראשונים פתוחים לכולם, והסליקה מגיעה אחרי פרק 3.',
  'העיצוב כולו לפי מערכת העיצוב של FlowBiz: assets/ds (טוקנים ורכיבי fb-*). הכריש נגרר לכל מקום פנוי בדף, ולא נוחת על כפתורים, שדות או פתקים.',
  'הכריש: assets/shark, 8 קבצים (4 הבעות, ובגרסה קטנה עד 40px). calm כברירת מחדל, thinking בזמן שהכריש מכין הצעות לסל, alert בפתק הסיכום כשיש מוצר עם רווח נמוך, happy במסך הסיום. העיגול והמסגרת בתוך הרכיב SharkAvatar.',
];

const SCHEMA = `product = {
  id: string,
  category: 'entry' | 'bridge' | 'premium' | 'recurring',
  name: string,
  description: string,        // מה הלקוח מקבל
  price: number | null,       // ₪, 0 = חינם
  cost_mode: 'fixed' | 'hours',
  cost: number | null,        // cost_mode = fixed
  hours: number | null,       // cost_mode = hours
  hourly_rate: number | null,
  source: 'ai' | 'manual'
}
product_step = {
  raw: { domain, problem, x_factor, delivery },
  products: product[],
  completed_at: timestamp
}`;

export function DevPanel({ open, onClose, screen, onScenario, onOpening }) {
  return html`<aside
    class=${cx(
      'fixed inset-y-0 end-0 z-40 flex w-full max-w-sm flex-col border-s border-slate-200 bg-white/95 shadow-2xl backdrop-blur-xl transition-transform duration-300',
      open ? 'translate-x-0' : '-translate-x-full pointer-events-none invisible',
    )}
    aria-hidden=${!open}
  >
    <div class="flex items-center justify-between border-b border-slate-200 px-4 py-3">
      <h2 class="flex items-center gap-2 text-[16px] font-bold text-slate-900"><${Icon} name="code-xml" size=${17} /> הערות למפתחים</h2>
      <button type="button" onClick=${onClose} aria-label="סגירה" class="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 cursor-pointer"><${Icon} name="x" size=${18} /></button>
    </div>
    <div class="flex-1 overflow-y-auto custom-scrollbar p-4 text-[14px] leading-relaxed text-slate-700">
      <section class="mb-4 rounded-xl border border-dashed border-brand-300 bg-brand-50/60 p-3">
        <h3 class="mb-1 font-bold text-brand-900">מסך הפתיחה</h3>
        <p class="mb-2 text-[12px] text-slate-600">מוצג רק בכניסה הראשונה לשלב. "המשך מכאן" מדף הבית (?from=home) מדלג עליו.</p>
        <button type="button" onClick=${onOpening} class="rounded-lg border border-brand-200 bg-white px-3 py-1.5 text-start text-[12px] font-semibold text-brand-800 hover:bg-brand-100 cursor-pointer">להציג שוב את מסך הפתיחה</button>
      </section>
      <section class="mb-5 rounded-xl border border-dashed border-brand-300 bg-brand-50/60 p-3">
        <h3 class="mb-2 font-bold text-brand-900">תרחישי משפך לבדיקה</h3>
        <p class="mb-2 text-[12px] text-slate-600">טוען סל מוצרים לדוגמה וקופץ לסיכום, כדי לראות איך המשפך מתנהג כשקטגוריות חסרות.</p>
        <div class="flex flex-col gap-1.5">
          ${SCENARIOS.map(
            (s) => html`<button
              key=${s.id}
              type="button"
              onClick=${() => onScenario(s.id)}
              class="rounded-lg border border-brand-200 bg-white px-3 py-1.5 text-start text-[12px] font-semibold text-brand-800 hover:bg-brand-100 cursor-pointer"
            >
              ${s.label}
            </button>`,
          )}
        </div>
      </section>

      ${NOTES.map(
        (n, i) => html`<section key=${n.title} class=${cx('mb-4 rounded-xl p-3', i === screen ? 'bg-amber-50 ring-1 ring-amber-200' : '')}>
          <h3 class="mb-1.5 flex items-center gap-2 font-bold text-slate-900">
            ${n.title} ${i === screen && html`<span class="rounded-full bg-amber-200 px-2 text-[12px] text-amber-900">מסך נוכחי</span>`}
          </h3>
          <ul class="list-disc ps-4 space-y-1">${n.items.map((t) => html`<li>${t}</li>`)}</ul>
        </section>`,
      )}

      <section class="mb-4 p-3">
        <h3 class="mb-1.5 font-bold text-slate-900">חיבור למערכת (חובה)</h3>
        <ul class="list-disc ps-4 space-y-1">${BACKEND.map((t) => html`<li>${t}</li>`)}</ul>
      </section>

      <section class="p-3">
        <h3 class="mb-1.5 font-bold text-slate-900">מבנה נתונים מוצע</h3>
        <pre dir="ltr" class="overflow-x-auto rounded-lg bg-slate-900 p-3 text-left text-[12px] leading-relaxed text-slate-100">${SCHEMA}</pre>
      </section>
    </div>
  </aside>`;
}
