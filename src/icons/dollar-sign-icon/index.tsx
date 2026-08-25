import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const DollarSignIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    className={className}
  >
    <path
      d="M11.9638 7.94876C11.8962 7.75767 11.792 7.58391 11.6596 7.43594C11.3778 7.1212 10.9685 6.92311 10.5128 6.92311H9.32201C8.56356 6.92311 7.94872 7.53795 7.94872 8.2964C7.94872 8.94176 8.39809 9.50005 9.02854 9.63795L10.8416 10.0346C11.5479 10.1891 12.0513 10.815 12.0513 11.5379C12.0513 12.3876 11.3625 13.077 10.5128 13.077H9.48718C8.81733 13.077 8.24747 12.6489 8.03627 12.0513M9.99999 6.92305V5.38459M9.99999 14.6154V13.0769M10 17.5C14.1422 17.5 17.5 14.1422 17.5 10C17.5 5.85787 14.1422 2.5 10 2.5C5.85787 2.5 2.5 5.85787 2.5 10C2.5 14.1422 5.85787 17.5 10 17.5Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
