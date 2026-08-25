import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const OrganizationOverviewIcon: FC<PropsWithClassName> = ({
  className,
}) => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className={className}
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity="currentOpacity"
        strokeWidth="currentStroke"
        d="M6.254 10.556h3.5M4.54 14h6.923a2.21 2.21 0 0 0 2.205-2.214V7.003a1.98 1.98 0 0 0-.724-1.532l-3.7-3.027a1.96 1.96 0 0 0-2.485 0L3.06 5.47a1.98 1.98 0 0 0-.724 1.532v4.783A2.21 2.21 0 0 0 4.54 14"
      />
    </svg>
  );
};
