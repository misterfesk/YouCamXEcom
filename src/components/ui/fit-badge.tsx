import { FIT_LEVEL_LABEL, type Fit, type FitLevel } from "@/types/fit";
import { cn } from "@/lib/utils";
type FitBadgeProps = { size?: "card" | "pdp"; className?: string } & (
  { fit: Fit; level?: never } | { level: FitLevel; fit?: never }
);
/** Names why a product fits (or doesn't); the color and dot carry the match level. */
export function FitBadge({
  fit,
  level = "everyday",
  size = "card",
  className,
}: FitBadgeProps) {
  const resolved = fit?.level ?? level;
  const text = fit?.tag ?? FIT_LEVEL_LABEL[resolved];
  return (
    <span
      className={cn("fit-badge type-badge", `fit-${resolved}`, className)}
      data-size={size}
      title={fit?.reason}
    >
      <span className="fit-dot" aria-hidden="true" />
      {text !== FIT_LEVEL_LABEL[resolved] && (
        <span className="sr-only">{FIT_LEVEL_LABEL[resolved]}: </span>
      )}
      {text}
    </span>
  );
}
