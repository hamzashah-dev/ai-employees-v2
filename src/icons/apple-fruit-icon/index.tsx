import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const AppleFruitIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    className={className}
  >
    <path
      d="M9.99952 7.14618C9.99952 5.74433 9.02985 4.1487 7.24853 3.8033M7.24888 8.93633C6.60024 9.2445 6.12593 9.89225 6.02783 10.6033M3.65267 10.8505C3.93482 6.2809 7.29716 6.67818 8.18821 6.91899C9.39543 7.24411 10.6028 7.24411 11.81 6.91899C12.7019 6.67818 16.0634 6.2809 16.3455 10.8505C16.3812 15.1898 13.5864 17.3497 12.9029 17.4252C11.6714 17.7252 10.6011 17.0262 9.99952 17.0262C9.3971 17.0262 8.34143 17.6782 7.09527 17.4252C6.40367 17.3408 3.6178 15.1898 3.65267 10.8505ZM9.7731 5.47888C9.7731 5.47888 9.36035 2.48626 12.8987 2.50005C13.1954 5.87049 9.7731 5.47888 9.7731 5.47888Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
