import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const AiEditIcon: FC<PropsWithClassName> = ({ className }) => {
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
        strokeWidth="currentStroke"
        d="M7.615 13.744 4.667 14l.255-2.947 6.134-6.09a.983.983 0 0 1 1.405 0l1.248 1.256a.983.983 0 0 1 0 1.395l-6.094 6.13ZM2.248 5.33c-.33-.06-.33-.542 0-.6a3.016 3.016 0 0 0 2.41-2.348l.02-.093c.072-.332.537-.334.612-.002l.024.108a3.03 3.03 0 0 0 2.417 2.333c.332.059.332.544 0 .603a3.03 3.03 0 0 0-2.417 2.333l-.024.108c-.075.331-.54.33-.611-.003l-.02-.092a3.016 3.016 0 0 0-2.411-2.348Z"
      />
    </svg>
  );
};
