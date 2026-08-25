import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const MemoryIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg width="16" height="16" fill="none" className={className}>
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8 4.664c0-1.287-1.005-2.33-2.244-2.33S3.51 3.377 3.51 4.664q0 .128.014.253C2.626 5.424 2 6.713 2 8.039c0 .974.337 2.14.872 2.736a3 3 0 0 0-.01.225c0 1.473 1.15 2.667 2.57 2.667C6.85 13.667 8 12.473 8 11m0 0c0 1.473 1.15 2.667 2.569 2.667 1.418 0 2.568-1.194 2.568-2.667q0-.113-.009-.225c.535-.596.872-1.762.872-2.736 0-1.326-.626-2.615-1.524-3.122a3 3 0 0 0 .013-.253c0-1.287-1.005-2.33-2.245-2.33S8 3.377 8 4.664zM4.71 6.5c-.33-.077-1.076-.586-1.188-1.577m.037 4.454c-.336.275-.603.898-.69 1.397m8.42-4.273c.33-.078 1.077-.587 1.19-1.578m-.038 4.454c.336.275.603.898.69 1.397"
    />
  </svg>
);
