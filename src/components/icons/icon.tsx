import type { SVGProps } from "react";

const paths = {
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m16 16 4 4" />
    </>
  ),
  bag: (
    <>
      <path d="M5 8h14l-1 12H6L5 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </>
  ),
  close: <path d="m6 6 12 12M18 6 6 18" />,
  back: <path d="m11 5-7 7 7 7M4 12h16" />,
  "chevron-down": <path d="m6 9 6 6 6-6" />,
  "chevron-right": <path d="m9 6 6 6-6 6" />,
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  check: <path d="m5 12 4 4L19 6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v6M12 7h.01" />
    </>
  ),
  camera: (
    <>
      <path d="M3 7h4l2-3h6l2 3h4v13H3Z" />
      <circle cx="12" cy="13" r="4" />
    </>
  ),
  upload: (
    <>
      <path d="M12 16V3m-5 5 5-5 5 5M4 16v5h16v-5" />
    </>
  ),
} as const;
export type IconName = keyof typeof paths;
export const ICON_NAMES = Object.keys(paths) as IconName[];
type IconProps = Omit<SVGProps<SVGSVGElement>, "children" | "name"> & {
  name: IconName;
};
export function Icon({ name, className = "size-icon", ...props }: IconProps) {
  return (
    <svg
      {...props}
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths[name]}
    </svg>
  );
}
