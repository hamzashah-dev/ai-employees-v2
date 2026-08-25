import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const QuoteIcon: FC<PropsWithClassName> = ({ className }) => {
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
        d="M6 7.444H3.867a.523.523 0 0 1-.378-.163.567.567 0 0 1-.156-.393V5.222c0-.148.056-.29.156-.393a.523.523 0 0 1 .378-.163h1.6c.141 0 .277.059.377.163.1.104.156.245.156.393v3.333c0 1.482-.711 2.407-2.133 2.778m8.8-3.89h-2.134a.523.523 0 0 1-.377-.162.568.568 0 0 1-.156-.393V5.222c0-.148.056-.29.156-.393a.523.523 0 0 1 .377-.163h1.6c.142 0 .277.059.377.163.1.104.157.245.157.393v3.333c0 1.482-.711 2.407-2.134 2.778"
      />
    </svg>
  );
};
