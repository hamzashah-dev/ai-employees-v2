import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const ToolsIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    className={className}
  >
    <path
      d="M8.44558 8.12834L8.83208 6.37413C8.86267 6.23526 8.82033 6.09038 8.71983 5.98984L5.76321 3.03322C7.85115 2.03603 10.3409 2.46321 11.9771 4.09934C13.6132 5.73548 14.0403 8.22524 13.0432 10.3132L16.9346 14.2046C17.6885 14.9585 17.6885 16.1808 16.9346 16.9346C16.1808 17.6885 14.9585 17.6885 14.2046 16.9346L10.3132 13.0432C8.22525 14.0403 5.73548 13.6132 4.09934 11.9771C2.46321 10.3409 2.03603 7.85115 3.03322 5.76321L5.98984 8.71983C6.09038 8.82033 6.23526 8.86267 6.37413 8.83208L8.12834 8.44558C8.28686 8.41067 8.41067 8.28686 8.44558 8.12834Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
