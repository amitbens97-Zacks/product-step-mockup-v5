// Mock data for the "Product Profiling" step mockup.
// Everything here stands in for data that, in production, comes from
// BusinessPlan (earlier steps) or from AI calls.

// Where this step sits in the journey (8 chapters, 21 steps), and what it is worth.
export const STEP = {
  name: 'בניית סל מוצרים',
  chapter: 'שביל הכסף',
  chapterNo: 2,
  stepNo: 4,
  totalSteps: 21,
  minutes: 20,
  save: 800, // what a business consultant would charge for this output
  savedBefore: 1200, // steps 1-3: 400 + 500 + 300
  badge: 'בונה הסל',
  next: { name: 'צייד הלקוחות', minutes: 20 },
  chapterSteps: ['בניית סל מוצרים', 'צייד הלקוחות'],
};

// The business partner: one character, the shark. Until it has an illustration it is a
// circle with a pencil fish icon (fb-avatar in the design system).
export const PARTNER = { name: 'הכריש', role: 'השותף העסקי', icon: 'fish' };

export const BUSINESS = {
  ownerName: 'דניאל כהן',
  businessName: 'דניאל כהן · שיווק שעובד',
  domainShort: 'ייעוץ שיווק דיגיטלי לעסקים קטנים',
};

// The four product categories, in customer-journey order (entry first).
export const CATEGORY_ORDER = ['entry', 'bridge', 'premium', 'recurring'];

export const CATEGORIES = {
  entry: {
    id: 'entry',
    label: 'מוצר חדירה',
    icon: 'door-open',
    description: 'מחיר סמלי או חינם. מוריד את חסם הכניסה ובונה אמון.',
    tier: 'from-blue-100 to-blue-200 text-slate-800',
    solid: 'bg-blue-100 text-blue-800',
    dot: 'bg-blue-300',
    marketRange: [0, 150],
  },
  bridge: {
    id: 'bridge',
    label: 'מוצר מעבר',
    icon: 'trending-up',
    description: 'מחיר נגיש. נותן ללקוח ניצחון מהיר ומכין את הקרקע לשירות המלא.',
    tier: 'from-blue-400 to-blue-500 text-white',
    solid: 'bg-blue-200 text-blue-900',
    dot: 'bg-blue-500',
    marketRange: [450, 1200],
  },
  premium: {
    id: 'premium',
    label: 'מוצר פרימיום',
    icon: 'crown',
    description: 'שירות הליבה. כאן נמצא עיקר הרווח.',
    tier: 'from-blue-600 to-blue-700 text-white',
    solid: 'bg-blue-600 text-white',
    dot: 'bg-blue-700',
    marketRange: [4500, 9000],
  },
  recurring: {
    id: 'recurring',
    label: 'מוצר מתמשך',
    icon: 'repeat',
    description: 'הכנסה חוזרת: מנוי, ריטיינר או אספקה קבועה.',
    tier: 'from-blue-800 to-slate-900 text-white',
    solid: 'bg-slate-800 text-white',
    dot: 'bg-slate-800',
    marketRange: [1500, 3500],
  },
};

// Screen 1: raw materials pulled from earlier steps.
export const RAW_FIELDS = [
  {
    key: 'domain',
    label: 'תחום העסק',
    icon: 'briefcase',
    source: 'אפיון העסק',
    value: 'ייעוץ וליווי שיווק דיגיטלי לעסקים קטנים ולעצמאים',
    tip: 'התחום רחב מדי. "עסקים קטנים" יכול להיות מספרה וגם משרד עורכי דין. נישה חדה תייצר מוצרים חדים יותר.',
    apply: 'ייעוץ וליווי שיווק דיגיטלי לעסקי שירות מקומיים עם 1 עד 5 עובדים',
  },
  {
    key: 'problem',
    label: 'הבעיה שהעסק פותר',
    icon: 'target',
    source: 'אפיון העסק',
    value: 'בעלי עסקים קטנים מפרסמים ברשתות בלי אסטרטגיה, שורפים תקציב ולא מקבלים פניות איכותיות',
    tip: 'כדאי לנסח את הבעיה במילים של הלקוח עצמו. כך היא תעבוד גם בשיווק.',
    apply: '"אני משלם על פרסום כל חודש ואין לי מושג מה זה מביא לי." בעלי עסקים קטנים שורפים תקציב בלי אסטרטגיה ובלי פניות איכותיות.',
  },
  {
    key: 'xFactor',
    label: 'היתרון הבלתי הוגן',
    icon: 'sparkles',
    source: 'אפיון יזם',
    highlight: true,
    value: '12 שנות ניסיון כמנהל שיווק בחברת צריכה גדולה, ושיטת עבודה מובנית של 90 יום שנבדקה על יותר מ-40 עסקים',
    tip: 'לקוחות לא קונים ותק, הם קונים תוצאה. כדאי לתת לשיטה שם, והיא תהפוך לנכס שאפשר למכור.',
    apply: '"שיטת 90 הימים": תהליך מובנה שנבדק על יותר מ-40 עסקים, מבוסס על 12 שנות ניהול שיווק בחברת צריכה גדולה',
  },
  {
    key: 'delivery',
    label: 'מודל האספקה',
    icon: 'package',
    source: 'אפיון העסק',
    value: 'ליווי אישי 1:1 בזום ובפגישות פרונטליות, בתוספת חומרים דיגיטליים וזמינות בוואטסאפ בין המפגשים',
    tip: 'זמינות בוואטסאפ היא יתרון, אבל בעסק של אדם אחד היא גם מלכודת זמן. כדאי להגדיר לה גבולות.',
    apply: 'ליווי אישי 1:1 בזום ובפגישות פרונטליות, חומרים דיגיטליים, ומענה בוואטסאפ בימים א׳ עד ה׳ תוך 24 שעות',
  },
];

// Screen 2: AI suggestions per category (what the proactive generator returns).
export const SUGGESTIONS = {
  entry: [
    { id: 's-e1', name: 'שיחת אבחון שיווקי (30 דק׳)', description: 'שיחת זום חינמית: מיפוי 3 החורים הגדולים בשיווק של העסק ותוכנית פעולה ראשונית' },
    { id: 's-e2', name: 'מדריך: 7 טעויות ששורפות תקציב פרסום', description: 'מדריך PDF להורדה בתמורה להשארת פרטים' },
    { id: 's-e3', name: 'וובינר חודשי: שיווק דיגיטלי ב-60 דקות', description: 'הרצאה חיה בזום עם שאלות ותשובות, פתוחה לכולם' },
  ],
  bridge: [
    { id: 's-b1', name: 'סדנת אסטרטגיה אישית (3 שעות)', description: 'מפגש עבודה 1:1 שבסופו יש ללקוח תוכנית שיווק כתובה ל-90 יום' },
    { id: 's-b2', name: 'אודיט דיגיטלי ודו״ח המלצות', description: 'בדיקת עומק של הרשתות, האתר והקמפיינים, עם דו״ח מסודר ושיחת הצגה' },
    { id: 's-b3', name: 'ערכת תבניות תוכן ל-30 יום', description: 'תבניות פוסטים, סטוריז ומודעות מותאמות לעסק' },
  ],
  premium: [
    { id: 's-p1', name: 'תוכנית ליווי 90 יום 1:1', description: '12 מפגשים אישיים, בניית מערך שיווק מלא וזמינות בוואטסאפ' },
    { id: 's-p2', name: 'יום VIP אסטרטגי', description: 'יום עבודה מרוכז שבסופו המערך השיווקי מוכן לעלייה' },
    { id: 's-p3', name: 'הקמת מערך קמפיינים מלא', description: 'הקמה של קהלים, מודעות ודפי נחיתה מקצה לקצה' },
  ],
  recurring: [
    { id: 's-r1', name: 'ריטיינר ליווי חודשי', description: 'שני מפגשים בחודש, בקרה על הקמפיינים וזמינות שוטפת' },
    { id: 's-r2', name: 'מועדון בעלי עסקים', description: 'מנוי חודשי: מפגש קבוצתי, ספריית תכנים וקהילה' },
    { id: 's-r3', name: 'ניהול קמפיינים שוטף', description: 'ניהול ואופטימיזציה חודשית של הקמפיינים בתשלום קבוע' },
  ],
};

export const DEFAULT_HOURLY_RATE = 150;

// Demo scenarios (developer panel) to show how the funnel adapts.
const P = {
  e1: { category: 'entry', name: 'שיחת אבחון שיווקי (30 דק׳)', description: 'שיחת זום חינמית: מיפוי 3 החורים הגדולים בשיווק', price: 0, costMode: 'hours', hours: 0.5 },
  e2: { category: 'entry', name: 'מדריך: 7 טעויות ששורפות תקציב', description: 'מדריך PDF להורדה', price: 0, costMode: 'fixed', cost: 0 },
  b1: { category: 'bridge', name: 'סדנת אסטרטגיה אישית (3 שעות)', description: 'תוכנית שיווק כתובה ל-90 יום', price: 890, costMode: 'hours', hours: 4 },
  p1: { category: 'premium', name: 'תוכנית ליווי 90 יום 1:1', description: '12 מפגשים ובניית מערך שיווק מלא', price: 7500, costMode: 'hours', hours: 20 },
  p2: { category: 'premium', name: 'יום VIP אסטרטגי', description: 'יום עבודה מרוכז', price: 3900, costMode: 'hours', hours: 8 },
  r1: { category: 'recurring', name: 'ריטיינר ליווי חודשי', description: 'שני מפגשים בחודש ובקרה שוטפת', price: 2200, costMode: 'hours', hours: 5 },
};

export const SCENARIOS = [
  { id: 'full', label: 'משפך מלא (4 קטגוריות)', items: ['e1', 'e2', 'b1', 'p1', 'p2', 'r1'] },
  { id: 'skip-bridge', label: 'חדירה ← פרימיום ← מתמשך (בלי מעבר)', items: ['e1', 'p1', 'r1'] },
  { id: 'from-bridge', label: 'מתחיל ממוצר מעבר (בלי חדירה)', items: ['b1', 'p1', 'r1'] },
  { id: 'entry-premium', label: 'חדירה ← פרימיום בלבד', items: ['e1', 'p1'] },
  { id: 'premium-only', label: 'מוצר פרימיום בלבד', items: ['p1'] },
];

let seq = 0;
export const newId = () => `p${Date.now().toString(36)}${(seq++).toString(36)}`;

export function scenarioProducts(scenarioId) {
  const s = SCENARIOS.find((x) => x.id === scenarioId);
  return s.items.map((k) => ({
    id: newId(),
    source: 'ai',
    cost: null,
    hours: null,
    hourlyRate: DEFAULT_HOURLY_RATE,
    ...P[k],
  }));
}
