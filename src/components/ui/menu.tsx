"use client";
import * as Dropdown from "@radix-ui/react-dropdown-menu";
import Link from "next/link";
import type { ReactNode } from "react";
import { ScanButton } from "./scan-button";
export type MenuItem = {
  id: string;
  label: string;
  disabled?: boolean;
  scan?: boolean;
} & (
  { href: string; onSelect?: never } | { href?: never; onSelect: () => void }
);
export type MenuProps = {
  trigger: ReactNode;
  label: string;
  items: MenuItem[];
  align?: "start" | "center" | "end";
};
export function Menu({ trigger, label, items, align = "start" }: MenuProps) {
  return (
    <Dropdown.Root>
      <Dropdown.Trigger asChild>{trigger}</Dropdown.Trigger>
      <Dropdown.Portal>
        <Dropdown.Content
          aria-label={label}
          aria-labelledby={undefined}
          className="menu-panel"
          align={align}
        >
          {items.map((item) => (
            <Dropdown.Item
              key={item.id}
              asChild
              disabled={item.disabled}
              onSelect={item.href === undefined ? item.onSelect : undefined}
            >
              {item.href !== undefined && !item.disabled ? (
                <Link href={item.href} className="menu-item type-body">
                  {item.label}
                </Link>
              ) : item.scan ? (
                <ScanButton fullWidth disabled={item.disabled}>
                  ✦ {item.label}
                </ScanButton>
              ) : (
                <button
                  type="button"
                  disabled={item.disabled}
                  className="menu-item type-body w-full text-left"
                >
                  {item.label}
                </button>
              )}
            </Dropdown.Item>
          ))}
        </Dropdown.Content>
      </Dropdown.Portal>
    </Dropdown.Root>
  );
}
export const DropdownMenu = Menu;
