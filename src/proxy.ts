import { NextResponse, type NextRequest } from "next/server";
import { STEPS } from "@/types/catalog";
import { GOALS } from "@/types/goal";
import { getProducts } from "@/lib/catalog";

const allowed: Record<string, Set<string>> = {
  shop: new Set(STEPS),
  concerns: new Set(GOALS),
  products: new Set(getProducts().map((product) => product.slug)),
};

// Validate before streaming so missing catalog entries carry an HTTP 404.
export function proxy(request: NextRequest) {
  const [section, slug, ...rest] = request.nextUrl.pathname.split("/").filter(Boolean);
  if (slug && allowed[section] && (!allowed[section].has(slug) || rest.length)) {
    const url = request.nextUrl.clone();
    url.pathname = "/catalog-not-found";
    url.search = "";
    return NextResponse.rewrite(url, { status: 404 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/shop/:path*", "/concerns/:path*", "/products/:path*"],
};
