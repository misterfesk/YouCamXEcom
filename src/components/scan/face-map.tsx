import type { GoalId } from "@/types/goal";
export function FaceMap({ goal }: { goal?: GoalId }) {
  return (
    <svg
      className="face-map"
      viewBox="0 0 240 280"
      role="img"
      aria-label="Illustrated face map; your photo is no longer kept"
    >
      <ellipse cx="120" cy="133" rx="74" ry="102" className="face-outline" />
      <path
        d="M65 113q20-12 35 0m40 0q20-12 35 0M120 113l-9 46h18M94 184q26 18 52 0"
        className="face-line"
      />
      <g className="face-region" data-active={goal === "oil-pores"}>
        <path d="M67 70q53-40 106 0v22H67ZM111 96h18v67h-18Z" />
      </g>
      <g className="face-region" data-active={goal === "under-eyes"}>
        <ellipse cx="83" cy="129" rx="22" ry="9" />
        <ellipse cx="157" cy="129" rx="22" ry="9" />
      </g>
      <g
        className="face-region"
        data-active={
          goal === "calm" || goal === "even-tone" || goal === "hydrate"
        }
      >
        <ellipse cx="74" cy="154" rx="20" ry="23" />
        <ellipse cx="166" cy="154" rx="20" ry="23" />
      </g>
      <g className="face-region" data-active={goal === "smooth-firm"}>
        <path d="M72 74q48-32 96 0v13H72ZM85 208q35 16 70 0v13q-35 16-70 0Z" />
      </g>
      <g className="face-region" data-active={goal === "breakouts"}>
        <circle cx="80" cy="170" r="9" />
        <circle cx="152" cy="153" r="8" />
        <circle cx="120" cy="205" r="9" />
      </g>
    </svg>
  );
}
