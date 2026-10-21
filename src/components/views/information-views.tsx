import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Accent } from "@/components/ui/accent";
export type MethodSource = { title: string; publisher: string; url: string };
export function MethodView({ sources }: { sources: MethodSource[] }) {
  return (
    <main id="main-content" tabIndex={-1}>
      <Container>
        <section className="confirmation-hero on-brand">
          <p className="type-label">A little clarity</p>
          <h1 className="type-h1">
            Care with a<br />
            <Accent>reason.</Accent>
          </h1>
          <p>
            Your scan helps arrange the shelf. You decide what belongs in your
            routine.
          </p>
        </section>
        <div className="method-content section">
          <h2 className="type-h2">How your shelf takes shape</h2>
          <ol className="method-steps">
            <li>
              <h3 className="type-h3">Read the visible signals</h3>
              <p>
                YouCam Skin Analysis scores visible skin concerns from a photo.
                We group those signals into everyday goals, such as hydration,
                oil balance and under-eye care.
              </p>
            </li>
            <li>
              <h3 className="type-h3">Bring your focus to the front</h3>
              <p>
                The three most pronounced goals lead your shelf. Products are
                compared with those concerns, skin type and sun-sensitivity
                guidance. Texture mismatches and ingredient cautions affect the
                fit.
              </p>
            </li>
            <li>
              <h3 className="type-h3">Explain each match</h3>
              <p>
                Great match and Good match highlight stronger fits. Everyday
                pick is neutral. Use with care flags a caution; Not for your
                skin moves a product to the end. Open a product to read its
                reason.
              </p>
            </li>
          </ol>
          <h2 className="type-h2">Your choice, every time</h2>
          <p>
            Keep recommendations on, switch them off, change your focus or
            delete your results in the skin menu. The whole collection stays
            available. Scanning is optional.
          </p>
          <h2 className="type-h2">Guidance, not a diagnosis</h2>
          <p>
            A photo cannot tell the whole story. Lighting, angle and image
            quality affect analysis. A skin scan does not diagnose a condition,
            measure an allergy or replace a clinician’s advice. If a concern
            persists or feels uncomfortable, speak with a qualified clinician.
          </p>
          <h2 className="type-h2">What is real, what is a demo</h2>
          <p>
            Skin analysis is real: live scans use YouCam Skin Analysis and its
            Fitzpatrick estimate, and the sample faces replay real recorded
            results. The products, formulas and prices are a fictional house
            line made to show how matching works. Orders are never placed.
          </p>
          <h2 className="type-h2">A note on your photo</h2>
          <p>
            Your browser resizes the photo and sends it straight to YouCam for
            this one analysis. We never store it. Only the derived scores are
            kept, in this browser, until you delete them from the skin menu.
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
          <Button href="/shop">Explore the collection</Button>
        </div>
      </Container>
    </main>
  );
}
export function NotFoundView() {
  return (
    <main id="main-content" tabIndex={-1} className="section">
      <Container>
        <div className="confirmation-hero on-brand">
          <p className="type-label">404 / A small detour</p>
          <h1 className="type-h1">
            Let’s find your
            <br />
            <Accent>way back.</Accent>
          </h1>
          <p>
            This page is no longer on the shelf. There is plenty more to
            explore.
          </p>
          <Button href="/shop" variant="secondary-on-brand">
            Shop the collection
          </Button>
          <Button href="/" variant="secondary-on-brand">
            Back home
          </Button>
        </div>
      </Container>
    </main>
  );
}
