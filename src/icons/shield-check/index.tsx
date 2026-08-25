import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const ShieldCheckIcon: FC<PropsWithClassName> = ({ className }) => {
  return (
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
        d="m6.163 7.785 1.338 1.34 2.756-2.757M8 14.667s5.425-1.643 5.425-6.171c0-4.53.197-4.883-.238-5.318C12.752 2.742 8.712 1.333 8 1.333c-.71 0-4.75 1.409-5.186 1.845-.435.435-.239.789-.239 5.318 0 4.528 5.425 6.17 5.425 6.17Z"
      />
    </svg>
  );
};
