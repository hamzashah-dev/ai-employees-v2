import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const LanguageIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    className={className}
  >
    <path
      d="M2 3.92592H10.6667M6.33338 2V3.92593M9.2223 3.92592L3.44452 10.6667M3.44452 3.92592L8.13932 9.40318M8 14L10.3796 7.75061C10.475 7.49996 10.7228 7.33333 11 7.33333C11.2772 7.33333 11.525 7.49996 11.6204 7.75061L14 14M8.84611 11.7778H13.1538"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
