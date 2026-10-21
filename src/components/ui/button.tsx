import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva("control type-button", {
  variants: {
    variant: {
      primary: "button-primary",
      secondary: "button-secondary",
      "secondary-on-brand": "button-secondary-on-brand",
      ghost: "button-ghost",
      link: "button-link",
    },
  },
  defaultVariants: { variant: "primary" },
});
type Appearance = VariantProps<typeof buttonVariants> & {
  size?: "md" | "lg";
  disabled?: boolean;
};
export type ButtonProps = Appearance &
  (
    | (ComponentProps<"button"> & { href?: never })
    | (Omit<ComponentProps<typeof Link>, "href"> & { href: string })
  );
export function Button(props: ButtonProps) {
  if (props.href !== undefined) {
    const { variant, size = "md", disabled, className, href, ...rest } = props;
    if (disabled)
      return (
        <a
          {...rest}
          className={cn(buttonVariants({ variant }), className)}
          data-size={size}
          aria-disabled="true"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
          tabIndex={-1}
        />
      );
    return (
      <Link
        {...rest}
        href={href}
        className={cn(buttonVariants({ variant }), className)}
        data-size={size}
      />
    );
  }
  const {
    variant,
    size = "md",
    disabled,
    className,
    type = "button",
    ...rest
  } = props;
  return (
    <button
      {...rest}
      type={type}
      disabled={disabled}
      className={cn(buttonVariants({ variant }), className)}
      data-size={size}
    />
  );
}
