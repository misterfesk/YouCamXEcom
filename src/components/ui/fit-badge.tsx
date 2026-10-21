import { FIT_LEVEL_LABEL, type Fit, type FitLevel } from "@/types/fit";
import { cn } from "@/lib/utils";
type FitBadgeProps = { size?: "card" | "pdp"; className?: string } & (
  { fit: Fit; level?: never } | { level: FitLevel; fit?: never }
);
export function FitBadge({
  fit,
  level = "everyday",
  size = "card",
  className,
}: FitBadgeProps) {
  const resolved = fit?.level ?? level;
  return (
    <span
      className={cn("fit-badge type-badge", `fit-${resolved}`, className)}
      data-size={size}
      title={fit?.reason}
    >
      <span className="fit-dot" aria-hidden="true" />
      {FIT_LEVEL_LABEL[resolved]}
    </span>
  );
}
