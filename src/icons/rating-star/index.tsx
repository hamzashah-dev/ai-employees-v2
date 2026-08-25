import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const RatingStarIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    className={className}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M10.79 3.206c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.163.093 1.636 1.545.748 2.305l-4.117 3.527 1.258 5.273c.27 1.136-.964 2.033-1.96 1.425L12 18.35l-4.627 2.826c-.996.608-2.23-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.75-2.305l5.403-.434 2.082-5.006Z"
      fill="currentColor"
    />
  </svg>
);
