import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
/** Use once per display, h1, or h2 headline, for one or two words. */
export function Accent({ className, ...props }: ComponentProps<"span">) {
  return <span {...props} className={cn("accent", className)} />;
}
