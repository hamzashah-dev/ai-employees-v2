import type { PropsWithClassName } from '@repo/types/common';

import type { FC } from 'react';

export const BrainIcon: FC<PropsWithClassName> = ({ className }) => (
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
      d="M12 6.996C12 5.066 10.493 3.5 8.634 3.5c-1.86 0-3.367 1.565-3.367 3.496 0 .128.007.254.02.379C3.939 8.135 3 10.069 3 12.059c0 1.46.506 3.21 1.308 4.104a4.21 4.21 0 0 0-.014.336c0 2.21 1.725 4.001 3.853 4.001S12 18.709 12 16.5m0-9.504v9.503m0-9.503c0-1.93 1.507-3.496 3.367-3.496 1.859 0 3.366 1.565 3.366 3.496 0 .128-.007.254-.02.379 1.348.76 2.287 2.694 2.287 4.684 0 1.46-.506 3.21-1.308 4.104a4.2 4.2 0 0 1 .014.336c0 2.21-1.725 4.001-3.853 4.001S12 18.709 12 16.5M7.066 9.75c-.495-.116-1.615-.88-1.784-2.366m.056 6.681c-.503.413-.904 1.347-1.034 2.096m12.63-6.41c.495-.117 1.615-.88 1.784-2.367m-.056 6.681c.503.413.904 1.347 1.034 2.096"
    />
  </svg>
);
