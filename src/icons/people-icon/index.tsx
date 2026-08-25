import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const PeopleIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    className={className}
  >
    <path
      d="M13.6731 14.6249H15.75V14.1135C15.75 11.9233 14.1965 10.0904 12.1154 9.62535M10.5577 3.43944C10.7236 3.39738 10.8976 3.375 11.0769 3.375C12.224 3.375 13.1538 4.29078 13.1538 5.42045C13.1538 6.55013 12.224 7.46591 11.0769 7.46591C10.8976 7.46591 10.7236 7.44353 10.5577 7.40147M6.92308 9.51136C4.34221 9.51136 2.25 11.5719 2.25 14.1136V14.625H11.5962V14.1136C11.5962 11.5719 9.50394 9.51136 6.92308 9.51136ZM6.92308 7.46591C8.07013 7.46591 9 6.55013 9 5.42045C9 4.29078 8.07013 3.375 6.92308 3.375C5.77602 3.375 4.84615 4.29078 4.84615 5.42045C4.84615 6.55013 5.77602 7.46591 6.92308 7.46591Z"
      stroke="currentColor"
      strokeWidth="currentStroke"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
