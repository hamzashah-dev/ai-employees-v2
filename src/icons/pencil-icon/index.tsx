import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const PencilIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18" fill="none" className={className}>
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1"
      d="m13.076 7.718-2.794-2.794M2.25 15.75l2.364-.263c.289-.032.433-.048.568-.091q.18-.06.339-.163c.118-.078.22-.181.426-.387l9.224-9.224a1.976 1.976 0 1 0-2.793-2.793l-9.224 9.224c-.206.205-.309.308-.387.426q-.104.159-.163.339c-.043.135-.06.28-.091.568z"
    />
  </svg>
);
