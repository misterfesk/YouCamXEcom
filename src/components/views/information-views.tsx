import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Accent } from "@/components/ui/accent";
export function MethodView() {
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
          <h2 className="type-h2">What this demo shows</h2>
          <p>
            The sample faces use recorded YouCam results. Product formulas,
            prices and match levels are illustrative fixtures. Live camera
            capture, live analysis and the final ranking rules will be connected
            separately.
          </p>
          <h2 className="type-h2">A note on your photo</h2>
          <p>
            This frontend preview keeps an uploaded photo only in browser memory
            while the scan is open and never sends it for analysis. Closing
            clears it. Only the sample’s derived scores remain for this visit.
          </p>
          <h2 className="type-h2">Research & sources</h2>
          <p>
            [PLACEHOLDER] — Verified references for ingredient guidance, ranking
            rules and Fitzpatrick sun notes will be supplied before live
            recommendations launch.
          </p>
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
