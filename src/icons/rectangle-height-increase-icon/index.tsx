import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const RectangleHeightIncreaseIcon: FC<PropsWithClassName> = ({
  className,
}) => {
  return (
    <svg
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      className={className}
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        d="m10 3 1.859-1.939a.194.194 0 0 1 .282 0L14 3m-4 18 1.859 1.939a.194.194 0 0 0 .282 0L14 21M4 17h16a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1Z"
      />
    </svg>
  );
};
