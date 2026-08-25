import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const ResearchDeepIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg fill="none" viewBox="14 14 28 28" className={className}>
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="currentStroke"
      d="M22.556 33.6h7.259m-9.982 3.733h16.334m-6.352 0c1.685 0 3.3-.688 4.491-1.913a6.63 6.63 0 0 0 1.86-4.62 6.63 6.63 0 0 0-1.86-4.62 6.26 6.26 0 0 0-4.491-1.913h-.908m-3.63 5.6h1.816M28 22.4v-2.8a.95.95 0 0 0-.266-.66.9.9 0 0 0-.641-.273h-1.815a.9.9 0 0 0-.642.273.95.95 0 0 0-.266.66v2.8m.908 5.6a1.8 1.8 0 0 1-1.283-.547 1.9 1.9 0 0 1-.532-1.32V22.4h5.444v3.733c0 .495-.19.97-.531 1.32a1.8 1.8 0 0 1-1.283.547z"
    />
  </svg>
);
