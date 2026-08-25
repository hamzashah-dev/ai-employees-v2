import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const SuperAgentIcon: FC<PropsWithClassName> = ({ className }) => {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      className={className}
    >
      <g filter="url(#sa-icon-shadow)">
        <path
          fill="url(#sa-icon-grad)"
          fillRule="evenodd"
          clipRule="evenodd"
          d="M14.15 4.162a3.7 3.7 0 0 1 3.696 0l7.48 4.32a3.7 3.7 0 0 1 1.848 3.2v8.638c0 1.32-.704 2.54-1.848 3.2l-7.48 4.32a3.7 3.7 0 0 1-3.696 0l-7.48-4.32a3.7 3.7 0 0 1-1.848-3.2v-8.638c0-1.32.705-2.54 1.848-3.2zm1.85 6.17a8.52 8.52 0 0 1-5.667 5.669 8.52 8.52 0 0 1 5.666 5.666 8.52 8.52 0 0 1 5.667-5.666 8.52 8.52 0 0 1-5.667-5.668"
        />
      </g>
      <defs>
        <linearGradient
          id="sa-icon-grad"
          x1="4.822"
          x2="27.174"
          y1="16.001"
          y2="16.001"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#8b72f7" />
          <stop offset=".505" stopColor="#ff8789" />
          <stop offset="1" stopColor="#ffb42b" />
        </linearGradient>
        <filter
          id="sa-icon-shadow"
          x="4.822"
          y="3.668"
          width="22.352"
          height="26.666"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="bg" />
          <feBlend in="SourceGraphic" in2="bg" result="shape" />
          <feColorMatrix
            in="SourceAlpha"
            result="hardAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />
          <feMorphology in="SourceAlpha" radius="1" result="shrunk" />
          <feOffset dy="2" />
          <feGaussianBlur stdDeviation="2" />
          <feComposite
            in2="hardAlpha"
            k2="-1"
            k3="1"
            operator="arithmetic"
            result="shadowAlpha"
          />
          <feFlood
            floodColor="rgb(var(--bg-fill-elevated))"
            floodOpacity="1"
            result="shadowColor"
          />
          <feComposite in="shadowColor" in2="shadowAlpha" operator="in" />
          <feBlend in2="shape" result="innerShadow" />
        </filter>
      </defs>
    </svg>
  );
};
