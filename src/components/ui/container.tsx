import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
export function Container({ className, ...props }: ComponentProps<"div">) {
  return <div {...props} className={cn("container", className)} />;
}
