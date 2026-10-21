import type { ConcernTileData } from "@/components/home/home-sections";
import type { GoalId } from "@/types/goal";
export const concernTiles: ConcernTileData[] = [
  {
    goal: "hydrate",
    image: "/images/water-study.webp",
    alt: "Daylight catches a ripple in clear water beside cobalt ceramic",
  },
  {
    goal: "breakouts",
    image: "/images/gel-study.webp",
    alt: "A translucent gel swatch with small bubbles on white and lilac ceramic tiles",
  },
  {
    goal: "calm",
    image: "/images/cream-study.webp",
    alt: "A soft white cream swoosh on a cool grey slab beside a cobalt tile",
  },
];
export const otherHomeGoals: GoalId[] = [
  "oil-pores",
  "even-tone",
  "under-eyes",
  "smooth-firm",
];
