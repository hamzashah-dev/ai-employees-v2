import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const PolygonIcon: FC<PropsWithClassName> = ({ className }) => {
  return (
    <svg width="36" height="29" viewBox="0 0 36 29" className={className}>
      <path d="M13.066 3.13c2.386-3.448 7.482-3.448 9.868 0l11.068 15.995c2.754 3.98-.094 9.415-4.934 9.415H6.932c-4.84 0-7.688-5.435-4.934-9.415L13.066 3.13Z" />
    </svg>
  );
};
