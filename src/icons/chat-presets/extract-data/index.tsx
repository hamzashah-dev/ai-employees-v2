import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const ExtractDataPresetIcon: FC<PropsWithClassName> = ({
  className,
}) => (
  <svg
    width="32"
    height="32"
    fill="none"
    viewBox="0 0 32 32"
    className={className}
  >
    <path
      fill="#9168C0"
      d="M21.454 7a.907.907 0 0 0-.909.91v16.363c0 .503.406.909.91.909h3.636c.503 0 .909-.406.909-.91V7.91A.907.907 0 0 0 25.09 7h-3.636Zm-7.272 5.454a.907.907 0 0 0-.91.91v10.909c0 .503.406.909.91.909h3.636c.504 0 .91-.406.91-.91V13.365a.907.907 0 0 0-.91-.91h-3.636ZM6.909 17.91a.907.907 0 0 0-.909.91v5.454c0 .503.405.909.91.909h3.636a.907.907 0 0 0 .909-.91v-5.454a.907.907 0 0 0-.91-.909H6.91Z"
    />
  </svg>
);
