import type { PropsWithClassName } from '@repo/types/common';

import type { FC } from 'react';

export const HeadingOneIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    className={className}
  >
    <path
      d="M11.6936 13.3337V8.41058C11.6936 9.09032 11.1426 9.64135 10.4628 9.64135H10.0526M13.3346 13.3337H10.0526M2.66797 2.66699V11.6926M7.59105 2.66699V11.6926M2.66797 7.17981H7.59105"
      stroke="currentColor"
      strokeWidth="currentStroke"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
