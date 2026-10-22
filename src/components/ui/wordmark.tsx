import Link from "next/link";
import { BRAND_NAME } from "@/config/site";
import { cn } from "@/lib/utils";
export function Wordmark({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label={`${BRAND_NAME} home`}
      className={cn(
        "type-wordmark inline-flex min-h-icon-button items-center",
        className,
      )}
    >
      {BRAND_NAME}
    </Link>
  );
}
