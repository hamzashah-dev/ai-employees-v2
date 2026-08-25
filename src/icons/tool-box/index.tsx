import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const ToolBoxIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    className={className}
  >
    <path
      d="M2 8.44447H14M5.23077 5.33335V3.55558C5.23077 3.06466 5.64405 2.66669 6.15385 2.66669H9.84615C10.356 2.66669 10.7692 3.06466 10.7692 3.55558V5.33335M13.0769 5.33335H2.92308C2.41328 5.33335 2 5.73133 2 6.22224V12.4445C2 12.9354 2.41328 13.3334 2.92308 13.3334H13.0769C13.5867 13.3334 14 12.9354 14 12.4445V6.22224C14 5.73133 13.5867 5.33335 13.0769 5.33335Z"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
