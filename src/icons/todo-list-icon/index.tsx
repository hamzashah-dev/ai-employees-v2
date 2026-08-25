import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const TodoListIcon: FC<PropsWithClassName> = ({ className }) => {
  return (
    <svg viewBox="0 0 14.5834 14.5834" fill="none" className={className}>
      <path
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.40281 13.125H13.9584M8.40281 1.76136H13.9584M8.40281 5.54915H13.9584M8.40281 9.33722H13.9584M5.62504 9.79167L2.29171 13.9583L0.625037 12.7083M5.62504 1.19318C5.62504 0.879386 5.3763 0.625 5.06948 0.625H1.18059C0.87377 0.625 0.625037 0.879386 0.625037 1.19318V5.17045C0.625037 5.48425 0.87377 5.73864 1.18059 5.73864H5.06948C5.3763 5.73864 5.62504 5.48425 5.62504 5.17045V1.19318Z"
      />
    </svg>
  );
};
