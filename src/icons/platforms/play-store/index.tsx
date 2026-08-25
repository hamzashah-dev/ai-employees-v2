import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const PlayStoreIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    className={className}
    width="48"
    height="48"
    viewBox="0 0 48 48"
    fill="none"
  >
    <g
      clipPath="url(#clip0_13264_277491)"
      fillRule="evenodd"
      clipRule="evenodd"
    >
      <path
        d="M3.895.594c-.538.582-.848 1.47-.848 2.634V44.49c0 1.164.31 2.052.866 2.61l.144.126L27.08 24.108v-.517L4.039.47l-.144.125Z"
        fill="url(#paint0_linear_13264_277491)"
      />
      <path
        d="m34.742 31.84-7.68-7.71v-.54l7.68-7.711.166.102 9.084 5.184c2.6 1.47 2.6 3.9 0 5.389l-9.084 5.183-.166.103Z"
        fill="url(#paint1_linear_13264_277491)"
      />
      <path
        d="m34.903 31.738-7.846-7.879L3.891 47.121c.848.912 2.27 1.015 3.86.126l27.152-15.51Z"
        fill="url(#paint2_linear_13264_277491)"
      />
      <path
        d="M34.903 15.982 7.75.496C6.16-.417 4.734-.291 3.89.62L27.057 23.86l7.846-7.878Z"
        fill="url(#paint3_linear_13264_277491)"
      />
      <path
        opacity=".2"
        d="M34.741 31.57 7.774 46.954c-1.506.87-2.85.81-3.716.019l-.144.144.144.126c.866.786 2.21.851 3.716-.019l27.152-15.486-.185-.168Z"
        fill="#000"
      />
      <path
        opacity=".12"
        d="m43.992 26.284-9.273 5.286.167.168 9.083-5.184c1.302-.745 1.941-1.722 1.941-2.695-.078.894-.741 1.74-1.918 2.425Z"
        fill="#000"
      />
      <path
        opacity=".25"
        d="m7.755.766 36.235 20.67c1.177.665 1.84 1.535 1.942 2.424 0-.972-.64-1.95-1.942-2.694L7.755.496C5.155-.998 3.047.249 3.047 3.232v.27C3.047.514 5.155-.71 7.755.766Z"
        fill="#fff"
      />
    </g>
    <defs>
      <linearGradient
        id="paint0_linear_13264_277491"
        x1="25.015"
        y1="2.783"
        x2="-11.884"
        y2="12.574"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#00A0FF" />
        <stop offset=".007" stopColor="#00A1FF" />
        <stop offset=".26" stopColor="#00BEFF" />
        <stop offset=".512" stopColor="#00D2FF" />
        <stop offset=".76" stopColor="#00DFFF" />
        <stop offset="1" stopColor="#00E3FF" />
      </linearGradient>
      <linearGradient
        id="paint1_linear_13264_277491"
        x1="47.382"
        y1="23.859"
        x2="2.416"
        y2="23.859"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#FFE000" />
        <stop offset=".409" stopColor="#FFBD00" />
        <stop offset=".775" stopColor="orange" />
        <stop offset="1" stopColor="#FF9C00" />
      </linearGradient>
      <linearGradient
        id="paint2_linear_13264_277491"
        x1="30.637"
        y1="28.146"
        x2=".85"
        y2="78.073"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#FF3A44" />
        <stop offset="1" stopColor="#C31162" />
      </linearGradient>
      <linearGradient
        id="paint3_linear_13264_277491"
        x1="-1.943"
        y1="-13.126"
        x2="11.346"
        y2="9.172"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#32A071" />
        <stop offset=".069" stopColor="#2DA771" />
        <stop offset=".476" stopColor="#15CF74" />
        <stop offset=".801" stopColor="#06E775" />
        <stop offset="1" stopColor="#00F076" />
      </linearGradient>
      <clipPath id="clip0_13264_277491">
        <path fill="#fff" d="M0 0h48v48H0z" />
      </clipPath>
    </defs>
  </svg>
);
