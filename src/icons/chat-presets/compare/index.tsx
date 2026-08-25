import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const ComparePresetIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="32"
    height="32"
    fill="none"
    viewBox="0 0 32 32"
    className={className}
  >
    <path
      fill="#00CC71"
      d="M13.663 15.58a.829.829 0 0 0-1.414.586v2.142a.518.518 0 0 1-.518.517H6.036A1.036 1.036 0 0 0 5 19.861v1.035a1.036 1.036 0 0 0 1.036 1.036h5.695a.518.518 0 0 1 .518.518v2.142a.828.828 0 0 0 1.414.585l4.213-4.213a.826.826 0 0 0 0-1.171l-4.213-4.213ZM26.607 11.56v-1.036a1.035 1.035 0 0 0-1.036-1.036h-5.695a.517.517 0 0 1-.518-.517V6.829a.828.828 0 0 0-1.414-.586l-4.213 4.213a.831.831 0 0 0 0 1.171l4.213 4.214a.829.829 0 0 0 1.414-.586v-2.142a.518.518 0 0 1 .518-.518h5.695a1.036 1.036 0 0 0 1.036-1.036Z"
    />
  </svg>
);
