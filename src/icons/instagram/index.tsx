import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const InstagramIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="28"
    height="28"
    fill="none"
    viewBox="0 0 28 28"
    className={className}
  >
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M13.812 11.043c-1.864 0-3.381 1.506-3.381 3.358s1.517 3.358 3.38 3.358c1.865 0 3.38-1.506 3.38-3.358s-1.515-3.358-3.38-3.358Z"
      clipRule="evenodd"
    />
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M19.976 9.614c-.7 0-1.271-.564-1.271-1.257 0-.695.57-1.259 1.27-1.259.7 0 1.27.564 1.27 1.26 0 .692-.57 1.256-1.27 1.256ZM13.81 19.59c-2.879 0-5.222-2.328-5.222-5.19 0-2.862 2.343-5.19 5.222-5.19 2.88 0 5.222 2.328 5.222 5.19 0 2.863-2.342 5.19-5.222 5.19Zm5.37-17.193H8.823c-3.88 0-6.487 2.714-6.487 6.753v9.695c0 4.038 2.607 6.753 6.487 6.753H19.18c3.88 0 6.49-2.715 6.49-6.753V9.151c0-4.04-2.608-6.753-6.489-6.753Z"
      clipRule="evenodd"
    />
  </svg>
);
