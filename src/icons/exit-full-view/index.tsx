import type { PropsWithClassName } from '@repo/types/common';

import type { FC } from 'react';

export const ExitFullViewIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    className={className}
  >
    <path
      d="M15.75 12.6346L13.2954 12.6346C12.97 12.6346 12.6577 12.744 12.4276 12.9388C12.1975 13.1335 12.0682 13.3977 12.0682 13.6731L12.0682 15.75M12.0682 2.24999L12.0682 4.32692C12.0682 4.60232 12.1975 4.8665 12.4276 5.06121C12.6577 5.25592 12.97 5.36538 13.2954 5.36538L15.75 5.36538M2.25 12.6346L4.70455 12.6346C5.03005 12.6346 5.3422 12.744 5.57237 12.9388C5.80252 13.1335 5.93182 13.3977 5.93182 13.6731L5.93182 15.75M5.93182 2.24999L5.93182 4.32692C5.93182 4.60232 5.80252 4.8665 5.57237 5.06121C5.3422 5.25592 5.03005 5.36538 4.70455 5.36538L2.25 5.36538"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
