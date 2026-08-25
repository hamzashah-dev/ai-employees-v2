import type { PropsWithClassName } from '@repo/types/common';

import type { FC } from 'react';

export const ImageCenterAlignIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    className={className}
  >
    <path
      d="M8.00038 14V2M6.27582 13.336H4.10069C3.30618 13.336 2.66797 12.6904 2.66797 11.9014V10.6169C2.66797 9.82136 3.30618 9.18229 4.10069 9.18229H6.27582M8.00097 9.18229H11.9019C12.6899 9.18229 13.3346 9.82136 13.3346 10.6169V11.9014C13.3346 12.6904 12.6899 13.336 11.9019 13.336H8.00097M8.00097 2.66276H10.4171C11.2116 2.66276 11.8498 3.30831 11.8498 4.09731V5.38188C11.8498 6.17741 11.2116 6.8164 10.4171 6.8164H8.00097M6.2761 6.8164H5.57928C4.79128 6.8164 4.14655 6.17741 4.14655 5.38188V4.09731C4.14655 3.30831 4.79128 2.66276 5.57928 2.66276H6.2761"
      stroke="currentColor"
      strokeWidth="currentStroke"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
