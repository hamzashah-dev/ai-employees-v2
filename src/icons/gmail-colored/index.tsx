import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const GmailColoredIcon: FC<PropsWithClassName> = ({ className }) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="M3.36345 20H6.54541V12.2723L1.99982 8.86328V18.6364C1.99982 19.3895 2.61036 20 3.36345 20Z"
        fill="#4285F4"
      />
      <path
        d="M17.4545 20H20.6365C21.3897 20 22.0002 19.3895 22.0002 18.6364V8.86328L17.4545 12.2723V20Z"
        fill="#34A853"
      />
      <path
        d="M17.4544 6.36363V12.2722L22.0002 8.86316V7.0454C22.0002 5.91572 21.0844 5 19.9546 5C19.5121 5 19.0815 5.14349 18.7274 5.40904L17.4544 6.36363Z"
        fill="#FBBC04"
      />
      <path
        d="M6.54547 12.2722V6.36365L12 10.4544L17.4545 6.36365V12.2722L12 16.3631L6.54547 12.2722Z"
        fill="#EA4335"
      />
      <path
        d="M2 7.04555V8.86331L6.54569 12.2723V6.36378L5.27271 5.4092C4.36897 4.73139 3.08685 4.91459 2.40904 5.81833C2.14358 6.17238 2 6.60302 2 7.04555Z"
        fill="#C5221F"
      />
    </svg>
  );
};
