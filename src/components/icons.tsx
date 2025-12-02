import type { SVGProps } from 'react';

export const LogoIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 22h6a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v1" />
    <path d="M2 12.33V13a2 2 0 0 0 2 2h1" />
    <path d="m15 9-3-3-3 3" />
    <path d="M12 15V6" />
  </svg>
);
