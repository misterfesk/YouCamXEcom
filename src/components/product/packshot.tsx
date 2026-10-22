import type { PackShape, PackColor } from "@/types/catalog";
import { BRAND_NAME } from "@/config/site";
const silhouettes: Record<PackShape, React.ReactNode> = {
  tube: (
    <>
      <path d="M65 68h110l-10 174H75Z" />
      <rect x="76" y="242" width="88" height="24" rx="4" className="pack-cap" />
      <path d="M70 78h100" className="pack-seam" />
    </>
  ),
  pump: (
    <>
      <rect x="70" y="114" width="100" height="152" rx="18" />
      <path d="M102 114V86h36v28M105 86V63h64v14h-46v9" className="pack-cap" />
    </>
  ),
  dropper: (
    <>
      <rect x="74" y="132" width="92" height="134" rx="18" />
      <path
        d="M94 132V99h52v33M104 99V67a16 16 0 0 1 32 0v32"
        className="pack-cap"
      />
    </>
  ),
  jar: (
    <>
      <rect x="46" y="176" width="148" height="90" rx="20" />
      <rect
        x="42"
        y="154"
        width="156"
        height="30"
        rx="6"
        className="pack-cap"
      />
    </>
  ),
  bottle: (
    <>
      <path d="M94 85h52v20c0 12 22 17 22 36v109q0 16-16 16H88q-16 0-16-16V141c0-19 22-24 22-36Z" />
      <rect x="92" y="62" width="56" height="26" rx="4" className="pack-cap" />
    </>
  ),
  stick: (
    <>
      <rect x="73" y="105" width="94" height="161" rx="24" />
      <path d="M73 206h94" className="pack-seam" />
    </>
  ),
  sachet: (
    <>
      <path d="M42 90h156v176H42Z" />
      <path d="M49 99h142M49 257h142" className="pack-seam" />
    </>
  ),
};
export function Packshot({
  shape,
  color,
  label = "DAILY CARE",
  step = "01",
  className = "",
}: {
  shape: PackShape;
  color: PackColor;
  label?: string;
  step?: string;
  className?: string;
}) {
  const isJar = shape === "jar";
  return (
    <svg
      viewBox="0 0 240 300"
      className={`packshot pack-${color} ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      <g className="pack-body">{silhouettes[shape]}</g>
      <g className="pack-type" textAnchor="middle">
        <text x="120" y={isJar ? 210 : 166} className="pack-logo">
          {BRAND_NAME}
        </text>
        <text x="120" y={isJar ? 232 : 190} className="pack-label">
          {label}
        </text>
        {!isJar && (
          <text x="120" y="226" className="pack-step">
            {step}
          </text>
        )}
      </g>
    </svg>
  );
}
