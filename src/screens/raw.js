// Screen 1: what we already know. Four facts from earlier steps, pre-filled and marked
// "מילאנו לפי..." (never ask twice). Each one can be edited or improved with the partner,
// whose wording goes in with one tap ("להכניס לתשובה") and can be undone. "המשך" confirms all.
import { html, useState, useRef, useEffect, Icon, cx } from '../lib.js';
import { IconBtn, Button, Dots, PartnerNote, FillButton, FilledBy } from '../components.js';
import { RAW_FIELDS, PARTNER } from '../data.js';

function FieldCard({ field, value, onSave, onFill, filled, onUndoFill }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [tip, setTip] = useState('closed'); // closed | thinking | open
  const ref = useRef();
  useEffect(() => {
    if (editing) ref.current?.focus();
  }, [editing]);

  const save = () => {
    onSave(draft.trim() || value);
    setEditing(false);
  };
  const toggleTip = () => {
    if (tip !== 'closed') return setTip('closed');
    setTip('thinking');
    setTimeout(() => setTip('open'), 800);
  };

  return html`<div class=${cx('fb-panel relative flex flex-col gap-2 !p-4', field.highlight && 'ring-[1.5px] ring-brand-300')}>
    ${field.highlight &&
    html`<span class="fb-note-tab pointer-events-none absolute -top-4 end-6 !gap-1.5 !px-3 !py-1.5 !text-[14px] !font-bold text-ink">
      <${Icon} name="sparkles" size=${15} class="text-brand-600" />כאן הכוח שלך
    </span>`}
    <div class="flex items-start gap-2.5">
      <span class="fb-chip-ic h-10 w-10 shrink-0"><${Icon} name=${field.icon} size=${21} /></span>
      <div class="min-w-0 flex-1">
        <h3 class="text-[18px] font-bold leading-tight text-ink">${field.label}</h3>
        ${filled
          ? html`<${FilledBy} onUndo=${onUndoFill} />`
          : html`<span class="fb-filled-by"><${Icon} name="corner-down-left" size=${14} />מילאנו לפי ${field.source}</span>`}
      </div>
      <span class="flex shrink-0 items-center gap-0.5">
        <${IconBtn} icon="pencil" label="עריכה" active=${editing} onClick=${() => { setDraft(value); setEditing(!editing); }} />
        <${IconBtn} icon="message-circle-question" label=${`התייעצות עם ${PARTNER.name}`} active=${tip !== 'closed'} onClick=${toggleTip} />
      </span>
    </div>

    ${editing
      ? html`<div>
          <textarea
            ref=${ref}
            rows="3"
            value=${draft}
            onInput=${(e) => setDraft(e.target.value)}
            onKeyDown=${(e) => {
              if (e.key === 'Escape') setEditing(false);
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) save();
            }}
            class="fb-field !h-auto py-2.5 leading-relaxed"
          ></textarea>
          <div class="mt-2 flex items-center gap-3">
            <${Button} variant="mini" onClick=${save}>שמירה<//>
            <${Button} variant="text" onClick=${() => setEditing(false)}>ביטול<//>
          </div>
        </div>`
      : html`<p class="line-clamp-2 text-[16px] leading-relaxed text-ink" title=${value}>${value}</p>`}

    ${tip !== 'closed' &&
    (tip === 'thinking'
      ? html`<p class="flex items-center gap-2 text-[14px] font-semibold text-brand-600">${PARTNER.name} חושב <${Dots} /></p>`
      : html`<${PartnerNote}
          tilt=${-0.6}
          class="mt-2"
          action=${html`<${FillButton}
            onClick=${() => {
              onFill(field.apply);
              setTip('closed');
            }}
          />`}
        >
          <p>${field.tip}</p>
          <p class="mt-1.5 text-[14px] text-muted"><b class="text-ink">הצעה לניסוח:</b> ${field.apply}</p>
        <//>`)}
  </div>`;
}

export function RawScreen({ raw, setRawField, fillRawField, filled, undoFill }) {
  return html`<div class="flex flex-col gap-3">
    <div class="grid gap-4 md:grid-cols-2">
      ${RAW_FIELDS.map(
        (f) => html`<${FieldCard}
          key=${f.key}
          field=${f}
          value=${raw[f.key]}
          onSave=${(v) => setRawField(f.key, v)}
          onFill=${(v) => fillRawField(f.key, v)}
          filled=${!!filled[f.key]}
          onUndoFill=${() => undoFill(f.key)}
        />`,
      )}
    </div>
  </div>`;
}
