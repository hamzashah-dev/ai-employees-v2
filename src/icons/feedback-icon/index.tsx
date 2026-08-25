import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const FeedbackIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="18"
    height="18"
    fill="none"
    viewBox="0 0 18 18"
    className={className}
  >
    <path
      stroke="currentColor"
      strokeLinejoin="round"
      strokeWidth="currentStroke"
      d="M9.306 7.626c.472-1.459.23-2.04-.238-2.136-.178-.036-.252-.034-.393.103a72.174 72.174 0 0 1-1.65 1.832 1.503 1.503 0 0 0-.202.243.688.688 0 0 0-.077.197c-.017.075-.017.154-.017.314v1.947c0 .466 0 .698.09.877a.846.846 0 0 0 .38.378c.178.09.411.09.878.09h2.043c.376 0 .564 0 .722-.065a.871.871 0 0 0 .366-.28c.103-.134.152-.316.25-.677l.172-.638c.185-.683.278-1.025.2-1.295a1.014 1.014 0 0 0-.454-.591c-.242-.145-.596-.145-1.307-.145h-.652c-.122 0-.145-.047-.11-.154Z"
    />
    <path
      stroke="currentColor"
      strokeLinejoin="round"
      strokeWidth="currentStroke"
      d="M9 15.75a6.75 6.75 0 1 0-5.243-2.498.39.39 0 0 1 .015.48l-.797 1.057a.6.6 0 0 0 .479.961H9Z"
    />
  </svg>
);
