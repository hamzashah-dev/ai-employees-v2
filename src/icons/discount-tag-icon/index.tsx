import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const DiscountTagIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="14"
    height="14"
    fill="none"
    className={className}
    viewBox="0 0 14 14"
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth=".857"
      d="M12.205 3.556c-.016-.826-.653-1.577-1.466-1.73-.167-.032-2.117-.063-2.924-.076a2.7 2.7 0 0 0-2.027.815q-1.764 1.76-3.525 3.524c-.694.696-.684 1.782.03 2.504a512 512 0 0 0 3.114 3.113c.721.715 1.808.725 2.504.03a1129 1129 0 0 0 3.555-3.554c.457-.46.721-1.021.771-1.681.04-.527-.023-2.492-.032-2.945"
      clipRule="evenodd"
    />
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth=".857"
      d="M8.199 4.862a.98.98 0 0 0 .957.942c.511.008.929-.41.917-.918a.98.98 0 0 0-.971-.956.9.9 0 0 0-.903.932"
      clipRule="evenodd"
    />
  </svg>
);
