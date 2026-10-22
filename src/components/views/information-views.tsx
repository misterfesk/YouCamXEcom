import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Accent } from "@/components/ui/accent";
import { YOUCAM_PRIVACY_POLICY_URL } from "@/config/site";
export type MethodSource = { title: string; publisher: string; url: string };
export function MethodView({ sources }: { sources: MethodSource[] }) {
  return (
    <main id="main-content" tabIndex={-1}>
      <Container>
        <section className="confirmation-hero on-brand">
          <p className="type-label">How we recommend</p>
          <h1 className="type-h1">
            Every pick has a<br />
            <Accent>reason.</Accent>
          </h1>
          <p>
            What your scan looks at, how products are matched, and what each
            tag means.
          </p>
        </section>
        <div className="method-content section">
          <h2 className="type-h2">How matching works</h2>
          <ol className="method-steps">
            <li>
              <h3 className="type-h3">Your scan reads your photo</h3>
              <p>
                YouCam Skin Analysis finds your skin type and scores visible
                concerns such as breakouts, shine, redness, dryness and dark
                spots. It also estimates how easily your skin tone burns
                (its Fitzpatrick type).
              </p>
              <p>
                We group those scores into the concerns you see in your
                results and rate each as Slight, Visible or Very visible. These
                levels are our own early cut-offs from recorded sample faces,
                not medical grades.
              </p>
            </li>
            <li>
              <h3 className="type-h3">What stood out leads the shop</h3>
              <p>
                The three most visible concerns go first. Each product is
                scored on whether it is made for those concerns, whether its
                texture suits your skin type, and, for sunscreens, how well it
                fits your skin tone’s sun needs.
              </p>
            </li>
            <li>
              <h3 className="type-h3">Every card says why</h3>
              <p>
                The tag on a product names its main reason, such as “Targets
                breakouts” or “Controls shine”. Its color and the line under
                the price show how strong the match is: Great match, Good
                match or Everyday pick.
              </p>
              <p>
                Amber tags such as “May clog pores” mean use with care. Red
                “Not for your skin” means the formula may be too rich, too
                drying or too strong for your skin right now, so it moves to
                the end. Open any product to read the full reason.
              </p>
            </li>
          </ol>
          <h2 className="type-h2">Shopping for someone else?</h2>
          <p>
            Every product stays in the shop, scan or no scan. A flagged product
            can still be the right buy: a gift, something your dermatologist
            recommended, or a favorite that already works for you. Hide your
            matches, rescan or delete your results anytime from Skin in the
            menu.
          </p>
          <h2 className="type-h2">Guidance, not a diagnosis</h2>
          <p>
            A photo cannot tell the whole story: lighting, angle and image
            quality all change the result. A scan cannot diagnose a condition
            or test for allergies. If a concern keeps coming back or feels
            sore, a dermatologist can help.
          </p>
          <h2 className="type-h2">What is real and what is a demo</h2>
          <p>
            Skin analysis is real: live scans use YouCam Skin Analysis and its
            Fitzpatrick estimate, and the sample faces replay real recorded
            results. The products, formulas and prices are a fictional house
            line made to show how matching works. Orders are never placed.
          </p>
          <h2 id="your-photo" className="type-h2">Your photo</h2>
          <p>
            Your browser resizes the photo and sends it straight to YouCam for
            this one analysis. Our application never saves your photo; closing
            the scan discards its browser preview. Derived scores stay in this
            browser until you delete them from the skin menu. To avoid repeat
            analysis, our server also caches derived scores for 24 hours,
            keyed by a salted visitor hash and photo hash, without the photo
            or mask URLs. Deleting browser results does not clear that temporary
            server cache.{" "}
            <a href={YOUCAM_PRIVACY_POLICY_URL} target="_blank" rel="noopener noreferrer" className="text-brand underline inline-flex min-h-icon-button items-center">
              YouCam processes the uploaded photo under its own terms.
            </a>
          </p>
          <h2 className="type-h2">Research & sources</h2>
          <p>
            Every ingredient rule and caution behind a match cites one of these
            references.
          </p>
          <ul className="method-sources">
            {sources.map((source) => (
              <li key={source.url}>
                <a href={source.url} className="text-brand underline" target="_blank" rel="noreferrer">
                  {source.title}
                </a>
                <span className="type-small text-text-muted"> · {source.publisher}</span>
              </li>
            ))}
          </ul>
          <Button href="/shop">Shop all</Button>
        </div>
      </Container>
    </main>
  );
}
export function NotFoundView() {
  return (
    <main id="main-content" tabIndex={-1} className="pb-12">
      <Container>
        <div className="confirmation-hero on-brand">
          <p className="type-label">404 / Page not found</p>
          <h1 className="type-h1">
            This page has
            <br />
            <Accent>moved on.</Accent>
          </h1>
          <p>
            The link may be old or mistyped. Everything else is still in the
            shop.
          </p>
          <Button href="/shop" variant="secondary-on-brand">
            Shop all
          </Button>
          <Button href="/" variant="secondary-on-brand">
            Back home
          </Button>
        </div>
      </Container>
    </main>
  );
}
