import type { SVGProps } from 'react';

/** Hand-drawn 24px stroke icons. */
const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.9,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const;

type P = SVGProps<SVGSVGElement>;

export const IconLearn = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 21c-2.5-2-5.5-2.6-9-2.2V4.6C6.5 4.2 9.5 4.8 12 7c2.5-2.2 5.5-2.8 9-2.4v14.2c-3.5-.4-6.5.2-9 2.2Z" />
    <path d="M12 7v14" />
  </svg>
);

export const IconReview = (p: P) => (
  <svg {...base} {...p}>
    <rect x="3" y="6" width="13" height="15" rx="2.5" />
    <path d="M8 3h10.5A2.5 2.5 0 0 1 21 5.5V17" />
    <path d="M7 12.5 9 14.5l4-4.5" />
  </svg>
);

export const IconWords = (p: P) => (
  <svg {...base} {...p}>
    <path d="M4 19 8.5 5h1L14 19" />
    <path d="M5.6 14h6.8" />
    <path d="M16 9h5M16 13h5M16 17h3" />
  </svg>
);

export const IconSounds = (p: P) => (
  <svg {...base} {...p}>
    <path d="M3 12h2M7 8v8M11 4v16M15 7v10M19 10v4" />
  </svg>
);

export const IconGrammar = (p: P) => (
  <svg {...base} {...p}>
    <rect x="3" y="4" width="18" height="16" rx="2.5" />
    <path d="M3 10h18M9 10v10" />
  </svg>
);

export const IconProfile = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="8.5" r="4" />
    <path d="M4 21c1.2-4 4.4-6 8-6s6.8 2 8 6" />
  </svg>
);

export const IconSpeaker = (p: P) => (
  <svg {...base} {...p}>
    <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" />
    <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" />
  </svg>
);

export const IconSlow = (p: P) => (
  <svg {...base} {...p}>
    <path d="M3 17c0-4 3-7 7-7h2c3 0 5 2 5 4.5 0 1.5-1 2.5-2.5 2.5H3Z" />
    <path d="M17 13.5c1.5-.2 2.5-1.2 2.5-2.8V9.5a1.5 1.5 0 0 1 3 0" />
    <circle cx="9" cy="14" r="0.6" fill="currentColor" />
  </svg>
);

export const IconClose = (p: P) => (
  <svg {...base} {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const IconCheck = (p: P) => (
  <svg {...base} {...p} strokeWidth={2.6}>
    <path d="m5 12.5 4.5 4.5L19 7" />
  </svg>
);

export const IconFlame = (p: P) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...p}>
    <path
      d="M12 22c-4.4 0-7.5-3-7.5-7.2 0-3.4 2.2-5.6 3.8-7.6.4 1.8 1.4 3 2.7 3.5C10.5 7.3 12 4.4 14.6 2c.4 3.1 2 4.9 3.3 6.6 1 1.4 1.6 3 1.6 4.8 0 5-3.3 8.6-7.5 8.6Z"
      fill="var(--pomarancz)"
    />
    <path d="M12 21c-2 0-3.4-1.4-3.4-3.3 0-1.7 1.3-2.9 2.3-4 .3 1 .9 1.6 1.7 1.8.2-1.5 1-2.8 2-3.8.5 1.7 1.7 2.8 1.7 4.8 0 2.6-1.8 4.5-4.3 4.5Z" fill="var(--slonecznik)" />
  </svg>
);

export const IconPetal = (p: P) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...p}>
    <path d="M12 21C5 15 5 8 12 2c7 6 7 13 0 19Z" fill="var(--malina)" />
    <circle cx="12" cy="11" r="2" fill="var(--paper)" />
  </svg>
);

export const IconPlay = (p: P) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...p}>
    <path d="M8 5.5v13a1 1 0 0 0 1.5.9l10-6.5a1 1 0 0 0 0-1.8l-10-6.5A1 1 0 0 0 8 5.5Z" fill="currentColor" />
  </svg>
);

export const IconArrow = (p: P) => (
  <svg {...base} {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

/** Scissors: the wycinanka tool, used for the Tools section. */
export const IconTools = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="18" r="3" />
    <path d="M8.2 16 18 3M15.8 16 6 3" />
  </svg>
);
