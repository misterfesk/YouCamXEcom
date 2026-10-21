"use client";
import { useId, useRef, type ComponentProps } from "react";
import { Icon } from "@/components/icons/icon";
import { IconButton } from "./icon-button";
import { cn } from "@/lib/utils";
export type SearchInputProps = Omit<
  ComponentProps<"input">,
  "type" | "value" | "onChange" | "size"
> & { label: string; value: string; onValueChange: (value: string) => void };
export function SearchInput({
  label,
  value,
  onValueChange,
  className,
  id,
  disabled,
  ...props
}: SearchInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const input = useRef<HTMLInputElement>(null);
  return (
    <div className={cn("search-field", className)}>
      <label htmlFor={inputId} className="sr-only">
        {label}
      </label>
      <Icon name="search" />
      <input
        {...props}
        id={inputId}
        ref={input}
        type="search"
        value={value}
        disabled={disabled}
        onChange={(event) => onValueChange(event.target.value)}
      />
      {value && (
        <IconButton
          label={`Clear ${label.toLowerCase()}`}
          disabled={disabled}
          onClick={() => {
            onValueChange("");
            input.current?.focus();
          }}
        >
          <Icon name="close" />
        </IconButton>
      )}
    </div>
  );
}
