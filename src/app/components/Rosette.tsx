import { UNITS } from '../../content/course';

/**
 * Twoja wycinanka — the learner's paper-cut rosette.
 * One petal per unit (18, like a folk "gwiazda"); each petal has three layered leaves, one per lesson,
 * from the small inner leaf (lesson 1, sunflower) to the large back leaf (lesson 3, cobalt).
 * Unfinished lessons are drawn as dashed pencil lines waiting to be cut.
 */

const C = 200;
const R0 = 46;
const LAYERS = [
  { tip: 196, width: 30 }, // lesson 3 — back, largest
  { tip: 164, width: 22 }, // lesson 2
  { tip: 128, width: 14 }, // lesson 1 — front, smallest
];

function leafPath(tip: number, w: number): string {
  const mid = (R0 + tip) / 2;
  return `M0 ${-R0} C ${w} ${-mid + 8}, ${w * 0.7} ${-tip + 14}, 0 ${-tip} C ${-w * 0.7} ${-tip + 14}, ${-w} ${-mid + 8}, 0 ${-R0} Z`;
}

interface Props {
  done: Set<string>;
  /** Lesson to highlight as "cut next". */
  next?: string;
  /** Lesson that was just completed: its leaf unfolds. */
  fresh?: string;
  size?: number;
  label?: string;
}

export function Rosette({ done, next, fresh, label }: Props) {
  const n = UNITS.length;
  const total = UNITS.reduce((s, u) => s + u.lessons.length, 0);
  const count = [...done].filter((id) => UNITS.some((u) => u.lessons.some((l) => l.id === id))).length;
  const scallops = Array.from({ length: 16 }, (_, i) => i);

  return (
    <svg
      className="rosette"
      viewBox="0 0 400 400"
      role="img"
      aria-label={label ?? `Your paper-cut rosette: ${count} of ${total} lessons cut.`}
    >
      <g transform={`translate(${C} ${C})`}>
        {UNITS.map((u, i) => (
          <g key={u.id} transform={`rotate(${(360 / n) * i})`}>
            {[2, 1, 0].map((lessonIdx, layer) => {
              const lesson = u.lessons[lessonIdx];
              if (!lesson) return null;
              const { tip, width } = LAYERS[layer];
              const isDone = done.has(lesson.id);
              const cls = ['leaf', isDone ? `l${lessonIdx + 1}` : 'uncut', lesson.id === next ? 'next' : '', lesson.id === fresh ? 'fresh' : '']
                .filter(Boolean)
                .join(' ');
              return (
                <g key={lesson.id}>
                  <path className={cls} d={leafPath(tip, width)} />
                  {isDone && lessonIdx === 2 && <circle className="hole" cx="0" cy={-(tip - 22)} r="3.2" />}
                  {isDone && lessonIdx === 1 && <circle className="hole" cx="0" cy={-(tip - 16)} r="2.4" />}
                </g>
              );
            })}
          </g>
        ))}
        {scallops.map((i) => (
          <circle key={i} className="centre-ring" r="8" transform={`rotate(${22.5 * i}) translate(0 -38)`} />
        ))}
        <circle className="centre-ring" r="38" />
        <circle className="centre" r="27" />
        <text
          textAnchor="middle"
          dominantBaseline="central"
          fill="var(--paper)"
          style={{ font: '700 22px var(--font-pl)' }}
          aria-hidden="true"
        >
          {count}
        </text>
      </g>
    </svg>
  );
}
