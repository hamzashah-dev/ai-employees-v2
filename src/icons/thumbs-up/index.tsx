import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const ThumbsUpIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="18"
    height="18"
    fill="none"
    viewBox="0 0 16 16"
    className={className}
  >
    <path
      stroke="currentColor"
      strokeWidth="currentStroke"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.43 6.667h3.219a1.365 1.365 0 0 1 1.15.632 1.32 1.32 0 0 1 .059 1.297l-2.365 4.667a1.34 1.34 0 0 1-.498.538c-.214.13-.46.2-.711.199H7.57c-.11 0-.22-.013-.327-.04l-2.54-.627M9.43 6.667V3.333c0-.353-.143-.692-.396-.942A1.36 1.36 0 0 0 8.08 2h-.064a.607.607 0 0 0-.612.603c0 .476-.142.942-.41 1.338L4.701 7.333v6m4.729-6.666H8.08m-3.378 6.666H3.351a1.36 1.36 0 0 1-.955-.39A1.324 1.324 0 0 1 2 12V8c0-.354.142-.693.396-.943.253-.25.597-.39.955-.39H5.04"
    />
  </svg>
);
