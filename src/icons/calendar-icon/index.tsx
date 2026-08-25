import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const CalendarIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="16"
    height="16"
    fill="none"
    viewBox="0 0 16 16"
    className={className}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="currentStroke"
      d="M5.166 2v3m5.667-3v3M5.339 8h-.006m2.673 0h-.007m2.674 0h-.007m-5.327 3.333h-.006m2.673 0h-.007m-4.444-8a.84.84 0 0 0-.629.298c-.166.19-.26.449-.26.718v8.635c0 .27.094.528.26.719.167.19.393.297.629.297h8.889a.84.84 0 0 0 .628-.297c.167-.191.26-.45.26-.719V4.35c0-.27-.093-.528-.26-.718a.84.84 0 0 0-.628-.298z"
    />
  </svg>
);
