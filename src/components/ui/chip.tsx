import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";
type ChipProps = { children: ReactNode; className?: string } & (
  | { static: true }
  | (Omit<ComponentProps<"button">, "onChange" | "onClick"> & {
      static?: false;
      pressed: boolean;
      onPressedChange: (pressed: boolean) => void;
    })
);
export function Chip(props: ChipProps) {
  if (props.static)
    return (
      <span className={cn("chip", props.className)} data-static="true">
        {props.children}
      </span>
    );
  const {
    pressed,
    onPressedChange,
    className,
    children,
    static: displayOnly,
    type = "button",
    ...rest
  } = props;
  void displayOnly;
  return (
    <button
      {...rest}
      type={type}
      aria-pressed={pressed}
      onClick={() => onPressedChange(!pressed)}
      className={cn("chip", className)}
    >
      {children}
    </button>
  );
}
