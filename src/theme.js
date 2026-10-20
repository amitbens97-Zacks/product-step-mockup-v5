// Category styling in the flag palette, graded as the customer goes deeper:
// note-blue -> sky -> flag blue -> ink. Hex values mirror the design-system tokens
// (needed for SVG fills).
export const CAT_STYLE = {
  entry: {
    fill: '#dde9fc',
    onFill: '#2d3e66',
    swatch: 'bg-brand-200',
    tab: 'bg-brand-200 text-ink',
  },
  bridge: {
    fill: '#8fb3ef',
    onFill: '#2d3e66',
    swatch: 'bg-brand-300',
    tab: 'bg-brand-300 text-ink',
  },
  premium: {
    fill: '#0038b8',
    onFill: '#ffffff',
    swatch: 'bg-brand-600',
    tab: 'bg-brand-600 text-white',
  },
  recurring: {
    fill: '#2d3e66',
    onFill: '#ffffff',
    swatch: 'bg-brand-900',
    tab: 'bg-brand-900 text-white',
  },
};

// The partner's opening message on each screen ("אנחנו" for what we do together,
// neutral wording for the entrepreneur).
export const PARTNER_MESSAGES = [
  'אספתי את מה שכבר כתבת בשלבים הקודמים. דבר אחד בולט: השילוב של ניסיון ארגוני עם שיטת עבודה מובנית הוא היתרון הבלתי הוגן שלך, ועליו נבנה את המוצרים.',
  'הכנתי רעיונות למוצרים בכל אחת מארבע הקטגוריות. אין חובה למלא את כולן: אפשר להתחיל ממוצר אחד ולהשלים כשהעסק יגדל.',
  'עכשיו נקבע מחיר לכל מוצר. אני אבדוק את מוצר הפרימיום מול השוק, ואסמן כל מוצר שלא משאיר מספיק רווח.',
  'זו תעודת הזהות המוצרית שלך. אפשר לתקן כל שכבה במשפך בלחיצה. כשהכל נראה נכון, נסיים את השלב והיא תישמר כ-PDF.',
];
