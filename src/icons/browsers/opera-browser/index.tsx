import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const OperaBrowserIcon: FC<PropsWithClassName> = ({ className }) => {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      className={className}
    >
      <path
        d="M17.206 36.3462C14.6097 33.3129 12.9459 28.8263 12.8361 23.7949V22.7051C12.9459 17.6737 14.628 13.1871 17.206 10.1537C20.5703 5.83067 25.507 3.88712 31.0837 3.88712C34.521 3.88712 37.7574 4.12324 40.5 5.93964C36.386 2.25234 30.9557 0.0181682 24.9951 0H24.9036C11.9768 0 1.5 10.408 1.5 23.25C1.5 35.7105 11.3734 45.9006 23.7883 46.4819C24.1541 46.5 24.5379 46.5 24.9036 46.5C30.9008 46.5 36.3678 44.2658 40.5 40.5786C37.7574 42.3949 34.7039 42.4676 31.2664 42.4676C25.7082 42.4857 20.5521 40.6875 17.206 36.3462Z"
        fill="url(#paint0_linear_7615_522514)"
      />
      <path
        d="M17.25 10.1021C19.3651 7.57084 22.1129 6.05936 25.1137 6.05936C31.8567 6.05936 37.3161 13.7442 37.3161 23.25C37.3161 32.7559 31.8567 40.4406 25.1137 40.4406C22.1129 40.4406 19.3831 38.911 17.25 36.398C20.5763 40.732 25.5114 43.5 31.007 43.5C34.3876 43.5 37.5693 42.4621 40.2809 40.6409C45.0172 36.3433 48 30.1336 48 23.2318C48 16.3301 45.0172 10.1203 40.2809 5.85905C37.5693 4.038 34.4057 3 31.007 3C25.4934 3 20.5583 5.74979 17.25 10.1021Z"
        fill="url(#paint1_linear_7615_522514)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_7615_522514"
          x1="21.0011"
          y1="0.75795"
          x2="21.0011"
          y2="45.8234"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.3" stopColor="#FF1B2D" />
          <stop offset="0.4381" stopColor="#FA1A2C" />
          <stop offset="0.5939" stopColor="#ED1528" />
          <stop offset="0.7581" stopColor="#D60E21" />
          <stop offset="0.9272" stopColor="#B70519" />
          <stop offset="1" stopColor="#A70014" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_7615_522514"
          x1="32.6219"
          y1="3.34548"
          x2="32.6219"
          y2="43.3052"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#9C0000" />
          <stop offset="0.7" stopColor="#FF4B4B" />
        </linearGradient>
      </defs>
    </svg>
  );
};
