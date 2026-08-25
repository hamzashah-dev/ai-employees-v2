import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

interface TextColorIconProps extends PropsWithClassName {
  underlineColor?: string;
}

export const TextColorIcon: FC<TextColorIconProps> = ({
  className,
  underlineColor,
}) => {
  return (
    <svg
      width="16"
      height="16"
      fill="none"
      viewBox="0 0 16 16"
      className={className}
    >
      <path
        stroke={underlineColor ?? '#FF1818'}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
        d="M2.633 13.813h10.73"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="currentStroke"
        d="m4.664 10.667 2.271-7.873c.136-.47.57-.794 1.062-.794.494 0 .927.324 1.063.794l2.27 7.873M5.444 8h5.11"
      />
    </svg>
  );
};
