import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const PasteIcon: FC<PropsWithClassName> = ({ className }) => {
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
        d="M12.154 2.923c0 .51-.413.923-.923.923H9.385a.923.923 0 0 1-.923-.923m3.692 0A.923.923 0 0 0 11.23 2H9.385a.923.923 0 0 0-.923.923m3.692 0h.923c.51 0 .923.413.923.923v6.462c0 .51-.413.923-.923.923h-2.77M8.463 2.923h-.924a.923.923 0 0 0-.923.923v.923m0 4.385H3.846m2.77 2.307h-2.77M2 13.077V7.538c0-.51.413-.923.923-.923h4.615c.51 0 .924.414.924.923v5.539c0 .51-.414.923-.924.923H2.923A.923.923 0 0 1 2 13.077Z"
      />
    </svg>
  );
};
