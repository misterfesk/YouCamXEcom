import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
export type IconButtonProps = ComponentProps<"button"> & { label: string };
export function IconButton({
  label,
  className,
  type = "button",
  ...props
}: IconButtonProps) {
  return (
    <button
      {...props}
      type={type}
      aria-label={label}
      className={cn("icon-button", className)}
    />
  );
}
