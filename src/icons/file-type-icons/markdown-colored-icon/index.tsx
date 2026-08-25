import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const MarkdownColoredIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="14"
    height="14"
    fill="none"
    viewBox="0 0 14 14"
    className={className}
  >
    <rect width="14" height="14" fill="#e0e0e0" rx="4" />
    <path
      fill="#0f0f0f"
      fillOpacity=".5"
      d="M2.412 4.736H3.55l1.202 2.932h.05l1.203-2.932h1.137V9.1h-.895V6.26h-.036L5.082 9.079h-.61l-1.129-2.83h-.036V9.1h-.895zM9.526 9.1H7.98V4.736h1.56q.659 0 1.133.263.475.26.731.747.258.489.258 1.168 0 .682-.258 1.172-.255.49-.735.752-.477.262-1.142.262m-.624-.79h.586q.41 0 .688-.145a.93.93 0 0 0 .422-.454q.143-.31.143-.797 0-.484-.143-.79a.92.92 0 0 0-.42-.452 1.5 1.5 0 0 0-.688-.145h-.588z"
    />
  </svg>
);
