import Link from "next/link";
import { cn } from "@/lib/utils";
export function Wordmark({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="[BRAND] home"
      className={cn(
        "type-wordmark inline-flex min-h-icon-button items-center",
        className,
      )}
    >
      [BRAND]
    </Link>
  );
}
