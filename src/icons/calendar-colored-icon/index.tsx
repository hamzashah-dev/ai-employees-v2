import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const CalendarColoredIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 17 17"
    fill="none"
    className={className}
  >
    <path
      fill="#bbe2ff"
      d="M2.75 3.163A2.475 2.475 0 0 1 5.225.688h6.05a2.475 2.475 0 0 1 2.475 2.475v2.612a2.475 2.475 0 0 1-2.475 2.475h-6.05A2.475 2.475 0 0 1 2.75 5.775z"
    />
    <path
      fill="#3c90ff"
      d="M1.707 4.245a2.234 2.234 0 0 1 2.215-2.526h8.655a2.234 2.234 0 0 1 2.215 2.526l-.527 4.005.527 4.005a2.234 2.234 0 0 1-2.215 2.526H3.922a2.234 2.234 0 0 1-2.215-2.526l.527-4.005z"
    />
    <mask
      id="a"
      width="14"
      height="14"
      x="1"
      y="1"
      maskUnits="userSpaceOnUse"
      style={{ maskType: 'alpha' }}
    >
      <path
        fill="#3c90ff"
        d="M1.707 4.245a2.234 2.234 0 0 1 2.215-2.526h8.655a2.234 2.234 0 0 1 2.215 2.526l-.527 4.005.527 4.005a2.234 2.234 0 0 1-2.215 2.526H3.922a2.234 2.234 0 0 1-2.215-2.526l.527-4.005z"
      />
    </mask>
    <g mask="url(#a)">
      <path fill="url(#b)" d="M1.117 14.781h14.266V8.25H1.117z" />
    </g>
    <mask
      id="c"
      width="14"
      height="14"
      x="1"
      y="1"
      maskUnits="userSpaceOnUse"
      style={{ maskType: 'alpha' }}
    >
      <path
        fill="#3186ff"
        d="M1.707 4.245a2.234 2.234 0 0 1 2.215-2.526h8.655a2.234 2.234 0 0 1 2.215 2.526l-.527 4.005.527 4.005a2.234 2.234 0 0 1-2.215 2.526H3.922a2.234 2.234 0 0 1-2.215-2.526l.527-4.005z"
      />
    </mask>
    <g filter="url(#d)" mask="url(#c)">
      <path
        fill="url(#e)"
        d="M2.75 2.338c0-.912.739-1.65 1.65-1.65h7.7c.911 0 1.65.738 1.65 1.65V8.25h-11z"
      />
    </g>
    <path
      fill="#fff"
      d="M6.476 11.459q-.54 0-.926-.176a1.98 1.98 0 0 1-1.027-1.053q-.11-.285-.088-.347a.18.18 0 0 1 .088-.097l.487-.193a.15.15 0 0 1 .123-.009q.062.019.145.202.088.184.246.39c.105.133.237.242.386.321q.225.114.553.114.531 0 .843-.307.316-.307.316-.781 0-.513-.334-.79-.333-.28-.882-.281h-.46a.16.16 0 0 1-.115-.044.16.16 0 0 1-.044-.11v-.47q0-.065.044-.109a.16.16 0 0 1 .114-.048h.4q.49 0 .79-.268a.89.89 0 0 0 .298-.694q0-.42-.268-.68-.267-.26-.737-.259-.264 0-.456.088a1 1 0 0 0-.334.246 2 2 0 0 0-.241.325q-.102.166-.163.184a.16.16 0 0 1-.118-.022l-.461-.224a.15.15 0 0 1-.075-.097q-.017-.065.105-.307.128-.245.387-.5c.173-.171.379-.306.605-.395q.347-.14.808-.14.856 0 1.356.451.5.448.5 1.186 0 .509-.245.882-.242.372-.685.527v.017q.536.158.843.58.312.416.312.996 0 .83-.58 1.36-.58.532-1.51.532m4.405-.101a.18.18 0 0 1-.132-.057.2.2 0 0 1-.053-.136V6.284l-.987.71a.15.15 0 0 1-.123.027.17.17 0 0 1-.106-.066l-.285-.404a.17.17 0 0 1-.03-.123.17.17 0 0 1 .07-.11l1.75-1.25a.2.2 0 0 1 .05-.027.14.14 0 0 1 .06-.013h.37q.075 0 .118.053a.17.17 0 0 1 .048.123v5.96a.19.19 0 0 1-.057.137.17.17 0 0 1-.132.057z"
    />
    <defs>
      <linearGradient
        id="b"
        x1="8.25"
        x2="8.25"
        y1="8.25"
        y2="14.781"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#4fa0ff" />
        <stop offset="1" stopColor="#3186ff" />
      </linearGradient>
      <linearGradient
        id="e"
        x1="7.654"
        x2="7.654"
        y1="1.869"
        y2="8.284"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#a9a8ff" />
        <stop offset=".8" stopColor="#3c90ff" />
      </linearGradient>
      <filter
        id="d"
        width="35"
        height="31.563"
        x="-9.25"
        y="-11.313"
        colorInterpolationFilters="sRGB"
        filterUnits="userSpaceOnUse"
      >
        <feFlood floodOpacity="0" result="BackgroundImageFix" />
        <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
        <feGaussianBlur
          result="effect1_foregroundBlur_20298_53484"
          stdDeviation="6"
        />
      </filter>
    </defs>
  </svg>
);
