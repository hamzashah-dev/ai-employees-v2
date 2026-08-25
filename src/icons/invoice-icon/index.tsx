import type { PropsWithClassName } from '@repo/types/common';

import type { FC } from 'react';

export const InvoiceIcon: FC<PropsWithClassName> = ({ className }) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity="currentOpacity"
        strokeWidth="currentStroke"
        d="M14.7 12h-4.5m4.5-3.556h-4.5m-3.6 0H3.9a.9.9 0 0 1-.636-.26A.88.88 0 0 1 3 7.556V5.778c0-.472.19-.924.527-1.257C3.865 4.187 4.323 4 4.8 4h11.7c.477 0 .935.187 1.273.52.337.334.527.786.527 1.258v10.666M4.8 4c.477 0 .935.187 1.273.52.337.334.527.786.527 1.258v12.444c0 .472.19.924.527 1.257.338.334.796.521 1.273.521m0 0h10.8c.477 0 .935-.187 1.273-.52.337-.334.527-.786.527-1.258v-.889a.88.88 0 0 0-.264-.628.9.9 0 0 0-.636-.26h-9a.9.9 0 0 0-.636.26.88.88 0 0 0-.264.628v.89c0 .47-.19.923-.527 1.256-.338.334-.796.521-1.273.521"
      />
    </svg>
  );
};
