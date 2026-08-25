import type { PropsWithClassName } from '@repo/types/common';

import type { FC } from 'react';

export const HeadingThreeIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    className={className}
  >
    <path
      d="M2.66797 2.66699V11.6926M7.59105 2.66699V11.6926M2.66797 7.17981H7.59105M10.1226 12.5131C10.2916 12.9912 10.7475 13.3337 11.2834 13.3337H12.1039C12.7836 13.3337 13.3346 12.7826 13.3346 12.1029V11.8978C13.3346 11.218 12.7836 10.667 12.1039 10.667H11.6936H12.0013C12.6244 10.667 13.1295 10.1619 13.1295 9.53879C13.1295 8.91569 12.6244 8.41057 12.0013 8.41058L11.3859 8.41059C10.8695 8.41059 10.4341 8.75756 10.3002 9.23109"
      stroke="currentColor"
      strokeWidth="currentStroke"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
