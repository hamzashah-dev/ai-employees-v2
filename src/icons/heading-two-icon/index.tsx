import type { PropsWithClassName } from '@repo/types/common';

import type { FC } from 'react';

export const HeadingTwoIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    className={className}
  >
    <path
      d="M2.66797 2.66699V11.6926M7.59105 2.66699V11.6926M2.66797 7.17981H7.59105M13.3346 13.3337H10.0526V12.6343C10.0526 12.1453 10.3421 11.7027 10.7901 11.5067L12.6163 10.7078C13.0527 10.5168 13.3346 10.0857 13.3346 9.60943C13.3346 8.94732 12.7979 8.41058 12.1358 8.41058H11.2834C10.7475 8.41058 10.2916 8.75306 10.1226 9.23109"
      stroke="currentColor"
      strokeWidth="currentStroke"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
