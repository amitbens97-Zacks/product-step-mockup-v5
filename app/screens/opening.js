// The step's opening screen (every step has one). One reading order: the heading first,
// then the pencil illustration of what we will build (with its own notes), then the
// primary button in the bottom bar. Parts, time, output and "יש לי כבר..." are one quiet block.
// Shown on the first entry; "המשך מכאן" skips it.
import { html, Icon } from '../lib.js';
import { Mark, Button } from '../components.js';
import { FunnelSketch, FunnelSketchCompact, StruckHabits } from '../sketch.js';
import { STEP } from '../data.js';

export function OpeningScreen({ parts, onHave }) {
  return html`<div class="rise grid items-center gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-12">
    <div class="flex flex-col">
      <span class="fb-eyebrow">פרק ${STEP.chapterNo} · ${STEP.chapter} · שלב ${STEP.stepNo} מתוך ${STEP.totalSteps}</span>
      <h1 class="fb-h1 mt-3 text-[28px] md:!text-[36px]">מה <${Mark}>מוכרים<//>, ובאיזה סדר?</h1>
      <p class="mt-4 max-w-[40ch] text-[18px] font-semibold leading-relaxed text-ink">
        נהפוך את מה שיודעים לעשות לסל מוצרים, מהמפגש הראשון עם לקוח ועד הכנסה שחוזרת כל חודש.
      </p>

      <div class="mt-8 border-t border-line pt-4 text-[14px] text-muted">
        <p class="flex flex-wrap items-center gap-x-1.5">
          <${Icon} name="list-ordered" size=${16} class="text-brand-600" />
          <b class="text-ink">${parts.length} חלקים:</b> ${parts.map(([name]) => name).join(' · ')}
        </p>
        <p class="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
          <span class="flex items-center gap-1.5"><${Icon} name="clock" size=${16} class="text-brand-600" /> כ-${STEP.minutes} דקות</span>
          <span class="flex items-center gap-1.5"><${Icon} name="file-text" size=${16} class="text-brand-600" /> בסוף: תעודת זהות מוצרית ב-PDF</span>
        </p>
        <${Button} variant="text" class="mt-3" onClick=${onHave}>יש לי כבר סל מוצרים <${Icon} name="arrow-left" size=${14} /><//>
      </div>
    </div>

    <div>
      <div class="hidden sm:block"><${FunnelSketch} /></div>
      <div class="-mx-1 sm:hidden"><${FunnelSketchCompact} /></div>
      <div class="mt-1"><${StruckHabits} items=${['מחיר מהבטן', 'מוצר אחד לכולם', 'עבודה בלי רווח']} /></div>
    </div>
  </div>`;
}
