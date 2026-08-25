import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const SkillsIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="24"
    height="24"
    fill="none"
    viewBox="0 0 24 24"
    className={className}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="currentStroke"
      d="M5.162 15.429s1.161-2.858 4.646-2.858 4.646 2.286 4.646 2.286L12.131 8h-1.565a1.15 1.15 0 0 1-1.15-1.304l.107-.734C9.686 4.836 10.666 4 11.823 4h2.979c.488 0 .925.3 1.092.752l3.966 10.733c.253.683.16 1.444-.25 2.049l-1.076 1.588a2 2 0 0 1-1.656.878H4"
    />
  </svg>
);
