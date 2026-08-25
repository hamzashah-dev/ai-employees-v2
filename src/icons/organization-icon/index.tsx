import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const OrganizationIcon: FC<PropsWithClassName> = ({ className }) => {
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
        d="M10.2 12h3.6m-3.6-3.556h3.6M13.8 20v-2.667c0-.471-.19-.923-.527-1.257a1.8 1.8 0 0 0-1.273-.52c-.477 0-.935.187-1.273.52a1.77 1.77 0 0 0-.527 1.257V20m-3.6-9.778H4.8c-.477 0-.935.188-1.273.52A1.77 1.77 0 0 0 3 12v6.222c0 .472.19.924.527 1.257.338.334.796.521 1.273.521h14.4c.477 0 .935-.187 1.273-.52.337-.334.527-.786.527-1.258V9.333c0-.471-.19-.923-.527-1.257a1.8 1.8 0 0 0-1.273-.52h-1.8M6.6 20V5.778c0-.472.19-.924.527-1.257C7.465 4.187 7.923 4 8.4 4h7.2c.477 0 .935.187 1.273.52.337.334.527.786.527 1.258V20"
      />
    </svg>
  );
};
