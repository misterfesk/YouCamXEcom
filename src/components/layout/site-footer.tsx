import Link from "next/link";
import { BRAND_NAME } from "@/config/site";
import { Container } from "@/components/ui/container";
import { Accent } from "@/components/ui/accent";
import { STEPS, STEP_LABEL } from "@/types/catalog";
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <Container>
        <div className="footer-grid">
          <div>
            <Link className="type-wordmark wordmark" href="/">
              {BRAND_NAME}
            </Link>
            <h2 className="type-h2 mt-6">
              Matched to
              <br />
              <Accent>your skin.</Accent>
            </h2>
            <p className="text-text-muted mt-4">
              Scan once to see what suits you, or shop the whole collection.
            </p>
          </div>
          <nav aria-label="Footer shop">
            <h3 className="type-label mb-3">Shop</h3>
            <Link href="/shop">Shop all</Link>
            {STEPS.map((step) => (
              <Link key={step} href={`/shop/${step}`}>
                {STEP_LABEL[step]}
              </Link>
            ))}
          </nav>
          <nav aria-label="About">
            <h3 className="type-label mb-3">About</h3>
            <Link href="/how-we-recommend">How we recommend</Link>
            <Link href="/cart">Your bag</Link>
          </nav>
        </div>
        <div className="footer-note type-small">
          <p>Skincare guidance, not a medical diagnosis.</p>
          <p>Demo store · USD · Nothing is charged or shipped</p>
        </div>
      </Container>
    </footer>
  );
}
