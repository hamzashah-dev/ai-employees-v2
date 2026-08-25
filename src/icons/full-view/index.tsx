import type { PropsWithClassName } from '@repo/types/common';

import type { FC } from 'react';

export const FullViewIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    className={className}
  >
    <path
      d="M12.6346 2.25H14.7115C14.9869 2.25 15.2511 2.37931 15.4458 2.60946C15.6405 2.83962 15.75 3.15178 15.75 3.47727V5.93182M2.25 5.93182V3.47727C2.25 3.15178 2.35941 2.83962 2.55416 2.60946C2.74891 2.37931 3.01304 2.25 3.28846 2.25H5.36539M12.6346 15.75H14.7115C14.9869 15.75 15.2511 15.6206 15.4458 15.3905C15.6405 15.1604 15.75 14.8482 15.75 14.5227V12.0682M2.25 12.0682V14.5227C2.25 14.8482 2.35941 15.1604 2.55416 15.3905C2.74891 15.6206 3.01304 15.75 3.28846 15.75H5.36539"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
