import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { Container } from "./container";
export function Section({
  band = "bg",
  className,
  children,
  ...props
}: ComponentProps<"section"> & { band?: "bg" | "surface" }) {
  return (
    <section {...props} className={cn("section", `section-${band}`, className)}>
      <Container>{children}</Container>
    </section>
  );
}
