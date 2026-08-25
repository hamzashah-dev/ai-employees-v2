import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const DefaultFileIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="16"
    height="16"
    fill="none"
    viewBox="0 0 16 16"
    className={className}
  >
    <path
      fill="#6b7280"
      d="M0 4a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4z"
    />
    <path
      fill="#fff"
      d="M4.111 4h1.82a1 1 0 0 1 .693.279L7.71 5.32a1 1 0 0 0 .692.279h3.487c.295 0 .577.112.786.312.208.2.325.472.325.755v4.266c0 .283-.117.555-.325.755s-.491.312-.786.312H4.11c-.295 0-.577-.112-.786-.312A1.05 1.05 0 0 1 3 10.933V5.067c0-.283.117-.555.325-.755S3.816 4 4.111 4"
    />
  </svg>
);
