import type { PropsWithClassName } from '@repo/types/common';

import type { FC } from 'react';

export const GlobeStarIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="18"
    height="18"
    fill="none"
    viewBox="0 0 18 18"
    className={className}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="currentStroke"
      d="M8.429 15.75c-3.464-.281-6.179-3.192-6.179-6.743 0-3.726 3.009-6.757 6.724-6.757 3.436 0 6.263 2.588 6.669 5.927m-4.325-1.519c-.35-2.573-1.267-4.408-2.345-4.408-1.07 0-1.994 1.835-2.343 4.408a16.507 16.507 0 0 0-.162 2.349c0 .83.056 1.624.162 2.355.245 1.786 1 3.509 1.798 4.387M2.25 9.013h9.068m2.494 2.109.075.205c.284.774.89 1.383 1.66 1.67l.203.076-.204.075a2.818 2.818 0 0 0-1.66 1.67l-.074.205-.076-.205a2.817 2.817 0 0 0-1.66-1.67l-.203-.075.204-.076a2.817 2.817 0 0 0 1.659-1.67l.075-.205Z"
    />
  </svg>
);
