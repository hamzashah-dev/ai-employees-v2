import type { IconProps } from '@repo/icons/types';

import type { FC } from 'react';

export const MasterCardWithoutLabelIcon: FC<IconProps> = ({
  className,
  ...props
}) => (
  <svg
    width="36"
    height="28"
    viewBox="0 0 36 22"
    fill="none"
    className={className}
    {...props}
  >
    <path d="M22.734 19.374h-9.472V2.484h9.472v16.89Z" fill="#FF5F00" />
    <path
      d="M13.865 10.93c0-3.426 1.617-6.478 4.134-8.445A10.832 10.832 0 0 0 11.31.188C5.331.188.484 4.998.484 10.93c0 5.933 4.847 10.742 10.825 10.742 2.526 0 4.85-.859 6.69-2.297-2.517-1.967-4.134-5.019-4.134-8.445Z"
      fill="#EB001B"
    />
    <path
      d="M35.516 10.93c0 5.933-4.847 10.742-10.825 10.742-2.525 0-4.85-.859-6.691-2.297 2.518-1.967 4.135-5.019 4.135-8.445S20.518 4.452 18 2.485A10.836 10.836 0 0 1 24.69.188c5.98 0 10.826 4.81 10.826 10.742Z"
      fill="#F79E1B"
    />
  </svg>
);
