import type { ButtonProps } from "./button";
import { Button } from "./button";
import { cn } from "@/lib/utils";

type ScanAppearance = {
  size?: "md" | "lg" | "fab";
  fullWidth?: boolean;
};
export type ScanButtonProps = ButtonProps extends infer P
  ? P extends ButtonProps
    ? Omit<P, "variant" | "size"> & ScanAppearance
    : never
  : never;
export function ScanButton({
  size = "md",
  fullWidth,
  children,
  className,
  ...props
}: ScanButtonProps) {
  const fab = size === "fab";
  return (
    <Button
      {...(props as ButtonProps)}
      variant={null}
      size={size === "lg" || fab ? "lg" : "md"}
      aria-label={fab ? "Scan my skin" : props["aria-label"]}
      className={cn(
        "control-outline border-on-scan bg-scan text-on-scan hover:bg-scan-hover",
        fab && "size-fab px-0",
        fullWidth && "w-full",
        className,
      )}
    >
      {fab ? <span aria-hidden="true">✦</span> : (children ?? "✦ Scan my skin")}
    </Button>
  );
}
