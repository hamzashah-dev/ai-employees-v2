import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const FontSizeIcon: FC<PropsWithClassName> = ({ className }) => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className={className}
    >
      <path
        d="M8.41146 12.6666L10.2393 6.89135C10.3232 6.62604 10.5809 6.44436 10.8731 6.44436C11.1652 6.44436 11.4229 6.62604 11.5068 6.89135L13.3346 12.6666M9.06792 10.5926H12.6782M2.66797 12.6666L4.93055 4.08781C5.0475 3.64435 5.46785 3.33325 5.95007 3.33325C6.43231 3.33325 6.85265 3.64435 6.96961 4.08781L7.89883 7.61103M3.48849 9.55547H7.18079"
        stroke="currentColor"
        strokeWidth="currentStroke"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
