import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const ZoomIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg fill="none" viewBox="0 0 18 18" className={className}>
    <path
      fill="#0b5cff"
      d="M12.694 0H5.306A5.31 5.31 0 0 0 0 5.306v7.388A5.31 5.31 0 0 0 5.306 18h7.388A5.31 5.31 0 0 0 18 12.694V5.306A5.31 5.31 0 0 0 12.694 0m-1.551 11.308c0 .383-.31.692-.692.692H4.716A1.716 1.716 0 0 1 3 10.284V6.263c0-.382.31-.692.692-.692h5.735c.947 0 1.716.769 1.716 1.717zM15 11.227c0 .336-.37.542-.656.363l-2.143-1.339A.43.43 0 0 1 12 9.888V7.684c0-.148.076-.285.201-.363l2.143-1.34a.428.428 0 0 1 .656.364z"
    />
  </svg>
);
