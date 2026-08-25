import type { PropsWithClassName } from '@repo/types/common';

import type { FC } from 'react';

export const CropIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    className={className}
  >
    <path
      d="M4.84103 4.76923H10.3077C10.5525 4.76923 10.7873 4.86649 10.9604 5.03959C11.1335 5.2127 11.2308 5.44749 11.2308 5.69231V11.159M4.76924 2V10.3077C4.76924 10.5525 4.86649 10.7873 5.0396 10.9604C5.21271 11.1335 5.4475 11.2308 5.69232 11.2308H14M4.76923 4.76923H2M11.2308 11.2308V14"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
