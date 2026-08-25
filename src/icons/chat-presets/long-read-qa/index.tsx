import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const LongReadQAPresetIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="32"
    height="32"
    fill="none"
    viewBox="0 0 32 32"
    className={className}
  >
    <path
      fill="#E5252A"
      fillRule="evenodd"
      d="M7 8.571A3.568 3.568 0 0 1 10.571 5h12.61a1.586 1.586 0 0 1 1.58 1.58v14.601a1.586 1.586 0 0 1-1.328 1.56v2.169h.412a.917.917 0 0 1 0 1.833H9.908A2.91 2.91 0 0 1 7 23.836V8.57Zm1.833 15.265c0 .59.483 1.074 1.075 1.074H21.6v-2.149H9.908c-.592 0-1.075.483-1.075 1.075Zm5.147-12.852c0-1.008.807-1.9 1.9-1.9 1.009 0 1.9.806 1.9 1.9 0 1.008-.806 1.9-1.9 1.9a.917.917 0 0 0-.916.917v1.65a.917.917 0 0 0 1.833 0v-.844c1.68-.417 2.817-1.955 2.817-3.623 0-2.169-1.776-3.734-3.733-3.734-2.17 0-3.734 1.776-3.734 3.734a.917.917 0 0 0 1.833 0Zm1.9 8.793a1.036 1.036 0 1 0 0-2.072 1.036 1.036 0 0 0 0 2.072Z"
      clipRule="evenodd"
    />
  </svg>
);
