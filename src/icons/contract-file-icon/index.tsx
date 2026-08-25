import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const ContractFileIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="18"
    height="18"
    fill="none"
    viewBox="0 0 18 18"
    className={className}
  >
    <rect width="18" height="18" fill="#F5820A" rx="4" />
    <path
      fill="#fff"
      d="M14 5.8a.8.8 0 0 0-.8-.8H4.8a.8.8 0 1 0 0 1.6h8.4a.8.8 0 0 0 .8-.8ZM4 9a.8.8 0 0 1 .8-.8h8.4a.8.8 0 0 1 0 1.6H4.8A.8.8 0 0 1 4 9ZM11.5 12.2a.8.8 0 0 0-.8-.8H4.8a.8.8 0 0 0 0 1.6h5.9a.8.8 0 0 0 .8-.8Z"
    />
  </svg>
);
