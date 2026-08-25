import type { PropsWithClassName } from '@repo/types/common';

import type { FC } from 'react';

export const ImageCaptionIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    className={className}
  >
    <path
      d="M2.92188 11.4615H13.0757M2.92188 14H9.01419M10.6932 8.92307L6.25091 4.48076L2.92234 7.80934M3.84495 8.92308H12.1526C12.6625 8.92308 13.0757 8.5098 13.0757 8V2.92308C13.0757 2.41328 12.6625 2 12.1526 2H3.84495C3.33515 2 2.92188 2.41328 2.92188 2.92308V8C2.92188 8.5098 3.33515 8.92308 3.84495 8.92308ZM10.2681 5.40386C9.7583 5.40386 9.34503 4.99058 9.34503 4.48078C9.34503 3.97099 9.7583 3.55771 10.2681 3.55771C10.7779 3.55771 11.1911 3.97099 11.1911 4.48078C11.1911 4.99058 10.7779 5.40386 10.2681 5.40386Z"
      stroke="currentColor"
      strokeWidth="currentStroke"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
