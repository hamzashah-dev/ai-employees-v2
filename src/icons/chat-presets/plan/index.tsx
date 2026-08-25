import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const PlanPresetIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="32"
    height="32"
    fill="none"
    viewBox="0 0 32 32"
    className={className}
  >
    <path
      fill="#82A90C"
      d="m15.4 22.161 7.396-7.396a10.289 10.289 0 0 1-3.326-2.234 10.29 10.29 0 0 1-2.235-3.327L9.839 16.6c-.577.577-.866.866-1.114 1.184a6.556 6.556 0 0 0-.749 1.211c-.173.364-.302.752-.56 1.526l-1.362 4.083a1.06 1.06 0 0 0 1.342 1.342l4.083-1.362c.775-.258 1.162-.387 1.526-.56.43-.205.836-.456 1.211-.749.318-.248.607-.537 1.184-1.114Zm9.448-9.448a3.932 3.932 0 0 0-5.561-5.561l-.887.887.038.111a8.753 8.753 0 0 0 2.092 3.32 8.753 8.753 0 0 0 3.431 2.13l.887-.887Z"
    />
  </svg>
);
