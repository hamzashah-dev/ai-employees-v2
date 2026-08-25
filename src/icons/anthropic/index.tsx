import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const AnthropicIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="19"
    height="14"
    viewBox="0 0 19 14"
    fill="none"
    className={className}
  >
    <path
      d="M13.4826 0.65625H10.7299L15.7473 13.3461H18.5L13.4826 0.65625ZM5.51735 0.65625L0.5 13.3461H3.31128L4.34599 10.691H9.59761L10.6128 13.3461H13.4241L8.40672 0.65625H5.51735ZM5.24403 8.3287L6.96204 3.87751L8.68004 8.3287H5.24403Z"
      fill="currentColor"
    />
  </svg>
);
