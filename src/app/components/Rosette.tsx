import { UNITS } from '../../content/course';

/**
 * Twoja wycinanka — the learner's paper-cut rosette, built like a Łowicz wycinanka:
 * a black paper base with coloured layers glued on top.
 * One petal per course unit (after the alphabet); each finished lesson glues on one coloured layer, from the
 * large back leaf (lesson 1, green)… to the small front leaf (lesson 3, yellow). The six phonics
 * lessons of Unit 0 are the seeds around the centre.
 */

const C = 200;
const R0 = 48;
// Back to front: the largest leaf is glued first.
const LAYERS = [
  { tip: 186, width: 26, cls: 'l3' },
  { tip: 156, width: 19, cls: 'l2' },
  { tip: 124, width: 12, cls: 'l1' },
];
const BASE = { tip: 198, width: 33 };

function leafPath(tip: number, w: number, r0 = R0): string {
  const mid = (r0 + tip) / 2;
  return `M0 ${-r0} C ${w} ${-mid + 8}, ${w * 0.7} ${-tip + 14}, 0 ${-tip} C ${-w * 0.7} ${-tip + 14}, ${-w} ${-mid + 8}, 0 ${-r0} Z`;
}

interface Props {
  done: Set<string>;
  /** Lesson to highlight as "cut next". */
  next?: string;
  /** Lesson just completed: its layer unfolds. */
  fresh?: string;
  label?: string;
}

export function Rosette({ done, next, fresh, label }: Props) {
  const units = UNITS.filter((u) => u.n > 0);
  const phonics = UNITS.find((u) => u.n === 0)?.lessons ?? [];
  const n = units.length;
  // Leaves were drawn for 18 petals; with more, they slim down so neighbours don't overlap.
  const slim = Math.min(1, 18 / n);
  const total = UNITS.reduce((s, u) => s + u.lessons.length, 0);
  const count = UNITS.flatMap((u) => u.lessons).filter((l) => done.has(l.id)).length;

  return (
    <svg className="rosette" viewBox="0 0 400 400" role="img" aria-label={label ?? `Your paper-cut rosette: ${count} of ${total} lessons done.`}>
      <g transform={`translate(${C} ${C})`}>
        {/* Black paper base */}
        {units.map((u, i) => (
          <path key={u.id} className="base" d={leafPath(BASE.tip, BASE.width * slim, 30)} transform={`rotate(${(360 / n) * i})`} />
        ))}
        <circle className="base" r="56" />

        {/* Coloured layers, one per finished lesson (lesson 1 is the back layer) */}
        {units.map((u, i) => (
          <g key={u.id} transform={`rotate(${(360 / n) * i})`}>
            {LAYERS.map((layer, k) => {
              const lesson = u.lessons[k];
              if (!lesson) return null;
              const isDone = done.has(lesson.id);
              const isNext = lesson.id === next && !isDone;
              if (!isDone && !isNext) return null;
              const cls = ['leaf', isDone ? layer.cls : 'uncut', isNext ? 'next' : '', lesson.id === fresh ? 'fresh' : '']
                .filter(Boolean)
                .join(' ');
              return <path key={lesson.id} className={cls} d={leafPath(layer.tip, layer.width * slim)} />;
            })}
            {/* Holes cut through every layer, as in real wycinanki */}
            <circle className="hole" cx="0" cy="-172" r="3.2" />
            <circle className="hole" cx="0" cy="-141" r="2.4" />
          </g>
        ))}

        {/* Centre: red disc with the six phonics lessons as seeds */}
        <circle className="centre" r="34" />
        {phonics.map((l, i) => (
          <circle
            key={l.id}
            className={`seed ${done.has(l.id) ? 'on' : ''}`}
            r="5.5"
            transform={`rotate(${(360 / phonics.length) * i}) translate(0 -18)`}
          />
        ))}
        <circle className="hole" r="5" />
      </g>
    </svg>
  );
}
