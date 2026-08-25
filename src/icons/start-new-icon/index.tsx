import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const StartNewIcon: FC<PropsWithClassName> = ({ className }) => {
  return (
    <svg
      width="20"
      height="20"
      fill="none"
      viewBox="0 0 20 20"
      className={className}
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="currentStroke"
        d="M9.469 2.5H6.486c-2.447 0-3.983 1.734-3.983 4.188v6.623c0 2.455 1.528 4.189 3.983 4.189h7.033c2.457 0 3.984-1.734 3.984-4.19v-2.983m-3.637-7.065c.845-.943 1.829-.3 2.557.353.728.652 1.475 1.558.63 2.5l-5.72 6.153a1.443 1.443 0 0 1-1.001.478l-1.933.098a.48.48 0 0 1-.504-.452l-.114-1.93a1.442 1.442 0 0 1 .365-1.048l5.72-6.152Z"
      />
    </svg>
  );
};
