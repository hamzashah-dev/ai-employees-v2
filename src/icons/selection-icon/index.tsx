import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const SelectionIcon: FC<PropsWithClassName> = ({ className }) => (
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
      strokeWidth="1.2"
      transform="translate(2.067 2.067)"
      d="M5.26667 0.6H6.6M5.26667 11.2667H6.6M0.6 5.26667V6.6M0.6 10.1556V10.3778C0.6 10.8687 0.997973 11.2667 1.48889 11.2667H1.71111M10.1556 11.2667H10.3778C10.8687 11.2667 11.2667 10.8687 11.2667 10.3778V10.1556M11.2667 1.71111V1.48889C11.2667 0.997973 10.8687 0.6 10.3778 0.6H10.1556M0.6 1.71111V1.48889C0.6 0.997973 0.997973 0.6 1.48889 0.6H1.71111M11.2667 5.26667V6.6"
    />
  </svg>
);
