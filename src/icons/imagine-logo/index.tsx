import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const ImagineLogo: FC<PropsWithClassName> = ({ className }) => {
  return (
    <svg
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 24 24"
      className={className}
    >
      <path
        fill="currentColor"
        d="M19.373 10.313c-1.888-.443-4.028-.583-3.506-4.035l3.82 1.07L21 7.66A4.79 4.79 0 0 0 16.215 3H7.76A4.759 4.759 0 0 0 3 7.757v4c0 1.339.722 1.713 1.627 1.93 1.888.443 4.028.583 3.506 4.035l-3.82-1.07L3 16.34A4.756 4.756 0 0 0 7.759 21h8.482A4.759 4.759 0 0 0 21 16.244v-4c0-1.34-.722-1.714-1.627-1.931ZM17.451 12a8.63 8.63 0 0 0-5.447 5.444A8.61 8.61 0 0 0 6.558 12a8.65 8.65 0 0 0 5.446-5.443A8.61 8.61 0 0 0 17.451 12Z"
      />
    </svg>
  );
};
