import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const PrivacyPolicyIcon: FC<PropsWithClassName> = ({ className }) => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className={className}
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="currentStroke"
        d="M4.63 5.417h3.93M4.63 7.774h2.75M4.63 10.13h2.75m-.785 2.75H3.452a.786.786 0 0 1-.785-.786V3.452a.786.786 0 0 1 .785-.785H8.56l2.75 2.75m-1.964 2.75a1.179 1.179 0 1 0 2.357 0 1.179 1.179 0 0 0-2.357 0m1.179 2.357a2.357 2.357 0 0 0-2.357 2.357h4.714a2.357 2.357 0 0 0-2.357-2.357"
      />
    </svg>
  );
};
