"use client";
import { BRAND_NAME } from "@/config/site";
import { useState, type ReactNode } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Icon, ICON_NAMES } from "@/components/icons/icon";
import { Accent } from "@/components/ui/accent";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { ScanButton } from "@/components/ui/scan-button";
import { Chip } from "@/components/ui/chip";
import { SearchInput } from "@/components/ui/search-input";
import { FitBadge } from "@/components/ui/fit-badge";
import { Wordmark } from "@/components/ui/wordmark";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Modal } from "@/components/ui/modal";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Menu } from "@/components/ui/menu";
import {
  enterPreset,
  resortTransition,
  reducedHighlight,
  uiTransition,
} from "@/styles/motion";
import type { Fit, FitLevel } from "@/types/fit";

type Token = { name: string; value: string };
type Product = {
  id: string;
  name: string;
  category: string;
  level: FitLevel;
  color: "brand" | "lilac" | "tangerine" | "surface";
  rank: number;
};
export type StyleguideViewProps = {
  colors: Token[];
  spaces: Token[];
  radii: Token[];
  fits: Fit[];
  products: Product[];
  samples: { id: string; label: string; alt: string }[];
};
const sections = [
  { id: "colors", label: "Foundations" },
  { id: "primitives", label: "Components" },
  { id: "motion", label: "Motion" },
];
function Heading({
  number,
  title,
  children,
}: {
  number: string;
  title: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="spec-heading">
      <div>
        <Eyebrow className="mb-3 text-text-muted">
          {number} / System specimen
        </Eyebrow>
        <h2 className="type-h2">{title}</h2>
      </div>
      <p className="type-small max-w-copy text-text-muted">{children}</p>
    </div>
  );
}
function Example({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col items-start gap-3">
      <p className="type-label text-text-muted">{label}</p>
      {children}
    </div>
  );
}
function Packshot({ color }: { color: Product["color"] }) {
  return (
    <svg
      className={`spec-packshot packshot-${color}`}
      viewBox="0 0 120 160"
      fill="none"
      aria-hidden="true"
    >
      <rect x="47" y="8" width="26" height="28" rx="5" className="fill-text" />
      <rect x="38" y="32" width="44" height="12" rx="3" className="fill-text" />
      <rect x="26" y="42" width="68" height="108" rx="14" fill="currentColor" />
      <path
        d="M38 92h44M38 98h44M38 104h26"
        className="stroke-text"
        strokeWidth={2}
      />
    </svg>
  );
}
export function StyleguideView({
  colors,
  spaces,
  radii,
  fits,
  products,
  samples,
}: StyleguideViewProps) {
  const reduced = useReducedMotion() ?? true;
  const [search, setSearch] = useState("");
  const [pressed, setPressed] = useState(true);
  const [modal, setModal] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [scan, setScan] = useState(false);
  const [scanNotice, setScanNotice] = useState(
    "No photo has been captured or uploaded.",
  );
  const [sorted, setSorted] = useState(false);
  const [shown, setShown] = useState(true);
  const [notice, setNotice] = useState(
    "Ready to explore. Try a control below.",
  );
  const sortedProducts = sorted
    ? [...products].sort((a, b) => a.rank - b.rank)
    : products;
  const announce = (message: string) => () => setNotice(message);
  return (
    <>
      <a href="#main-content" className="skip-link control button-primary type-button">
        Skip to specimens
      </a>
      <header>
        <Container className="spec-header">
          <Wordmark />
          <nav aria-label="Styleguide" className="spec-nav">
            {sections.map((item) => (
              <Button key={item.id} href={`#${item.id}`} variant="ghost">
                {item.label}
              </Button>
            ))}
          </nav>
          <span className="type-label hidden tablet:block text-text-muted">
            Design system / 01
          </span>
        </Container>
      </header>
      <main id="main-content" tabIndex={-1}>
        <Container className="pb-12 pt-4 tablet:pb-16">
          <div className="spec-cover on-brand">
            <div className="flex min-w-0 flex-col items-start gap-6">
              <Eyebrow>Swiss Cover / {BRAND_NAME}</Eyebrow>
              <h1 className="type-display">
                A system for
                <br />
                <Accent>real</Accent> skin.
              </h1>
              <p className="type-body-lg max-w-copy">
                Confident type. A clear point of view.
                <br />
                The foundations of a more personal skincare store.
              </p>
              <Button variant="secondary-on-brand" href="#primitives" size="lg">
                Explore the components <Icon name="chevron-down" />
              </Button>
            </div>
            <div className="spec-cover-aside">
              <p className="type-display" aria-hidden="true">
                Aa
              </p>
              <div className="spec-cover-card">
                <Eyebrow className="text-text-muted">
                  The signature action
                </Eyebrow>
                <h2 className="type-h3">Start with your skin.</h2>
                <p className="type-small text-text-muted">
                  One unmistakable action. Every other detail stays calm.
                </p>
                <ScanButton fullWidth onClick={() => setScan(true)} />
              </div>
              <p className="type-small">
                Archivo + Bodoni Moda
                <br />
                Modern · Bold · Elegant
              </p>
              <div className="flex flex-col items-start gap-3">
                <Eyebrow>Secondary on cobalt / medium</Eyebrow>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="secondary-on-brand"
                    onClick={announce("Cobalt button activated.")}
                  >
                    Medium
                  </Button>
                  <Button variant="secondary-on-brand" disabled>
                    Disabled
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Container>
        <Section id="colors" band="surface">
          <Heading
            number="01"
            title={
              <>
                Color with <Accent>purpose</Accent>
              </>
            }
          >
            Cobalt leads. Soft neutrals give the system room to breathe. Lime
            belongs to the scan action alone.
          </Heading>
          <div className="color-grid">
            {colors.map(({ name, value }) => (
              <div key={name} className="flex min-w-0 flex-col gap-2">
                {name === "scan" || name === "scan-hover" ? (
                  <div className="color-swatch flex items-center">
                    <ScanButton onClick={() => setScan(true)}>
                      {name === "scan-hover" ? "✦ Hover to scan" : undefined}
                    </ScanButton>
                  </div>
                ) : (
                  <div
                    className="color-swatch"
                    style={{ backgroundColor: `var(--color-${name})` }}
                  />
                )}
                <p className="type-small font-bold break-words">{name}</p>
                <p className="type-small break-words text-text-muted">
                  {value}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-6">
            <p className="type-small text-success">Success / saved</p>
            <p className="type-small text-warning">Warning / check first</p>
            <p className="type-small text-danger">Error / try again</p>
          </div>
        </Section>
        <Section id="typography">
          <Heading
            number="02"
            title={
              <>
                Type that <Accent>speaks</Accent>
              </>
            }
          >
            Archivo does the work. A single italic word adds emphasis. Headline
            width is 80%; the accent keeps its own proportions.
          </Heading>
          <div className="type-specimens">
            <div>
              <p className="type-label text-text-muted">
                Display / 48–84 · 800
              </p>
              <h2 className="type-display">
                Skin comes <Accent>first.</Accent>
              </h2>
            </div>
            <div>
              <p className="type-label text-text-muted">H1 / 40–56 · 800</p>
              <h2 className="type-h1">A routine for you.</h2>
            </div>
            <div>
              <p className="type-label text-text-muted">H2 / 32–44 · 800</p>
              <h2 className="type-h2">Made for the everyday.</h2>
            </div>
            <div>
              <p className="type-label text-text-muted">H3 / 22 · 700</p>
              <h3 className="type-h3">Get to know your skin</h3>
            </div>
            <div>
              <p className="type-label text-text-muted">
                Body large / 18 · 400
              </p>
              <p className="type-body-lg">
                A little understanding goes a long way.
              </p>
            </div>
            <div>
              <p className="type-label text-text-muted">Body / 16 · 400</p>
              <p className="type-body">
                Find the products that fit your daily routine.
              </p>
            </div>
            <div>
              <p className="type-label text-text-muted">Small / 13 · 400</p>
              <p className="type-small text-text-muted">
                Your scan is optional. You can always browse the full catalog.
              </p>
            </div>
            <div>
              <p className="type-label text-text-muted">Label / 12 · 700</p>
              <Eyebrow>Everyday essentials</Eyebrow>
            </div>
            <div>
              <p className="type-label text-text-muted">Button / 15 · 700</p>
              <p className="type-button">Add to bag</p>
            </div>
            <div>
              <p className="type-label text-text-muted">
                Price / 15 · 400 / PDP 700
              </p>
              <p className="type-price">Demo price · $24.00</p>
              <p className="type-price font-bold text-text">Demo price · $24.00</p>
            </div>
          </div>
        </Section>
        <Section id="shape" band="surface">
          <Heading number="03" title="Space & shape">
            Pills for controls. Softer corners for surfaces. Elevation only when
            the interface needs a little separation.
          </Heading>
          <div className="spec-grid">
            {radii.map(({ name, value }) => (
              <Example key={name} label={`${name} / ${value}`}>
                <div
                  className="shape-specimen"
                  style={{ borderRadius: `var(--radius-${name})` }}
                />
              </Example>
            ))}
          </div>
          <div className="mt-12 spec-grid">
            {["card", "raised", "modal"].map((name) => (
              <Example key={name} label={`Shadow / ${name}`}>
                <div
                  className="shadow-specimen"
                  style={{ boxShadow: `var(--shadow-${name})` }}
                />
              </Example>
            ))}
          </div>
          <div className="mt-12 space-grid">
            {spaces.map(({ name, value }) => (
              <div key={name} className="flex items-center gap-4">
                <div
                  className="space-bar"
                  style={{ width: `var(--spacing-${name})` }}
                />
                <span className="type-small text-text-muted">
                  {name} / {value}
                </span>
              </div>
            ))}
          </div>
        </Section>
        <Section id="primitives">
          <Heading
            number="04"
            title={
              <>
                Everyday <Accent>interactions</Accent>
              </>
            }
          >
            A small vocabulary of controls, each with a clear job. Use Tab to
            walk through; Enter and Space to activate.
          </Heading>
          <div className="spec-stack">
            <div className="spec-row">
              <h3 className="type-h3">Buttons</h3>
              <div className="flex flex-wrap gap-6">
                {(["primary", "secondary", "ghost", "link"] as const).map(
                  (variant) => (
                    <Example key={variant} label={variant}>
                      <div className="flex flex-wrap items-center gap-3">
                        <Button
                          variant={variant}
                          onClick={announce(`${variant} button activated.`)}
                        >
                          Add to bag
                        </Button>
                        <Button
                          variant={variant}
                          size="lg"
                          onClick={announce(
                            `${variant} large button activated.`,
                          )}
                        >
                          Large
                        </Button>
                        <Button variant={variant} disabled>
                          Disabled
                        </Button>
                      </div>
                    </Example>
                  ),
                )}
              </div>
              <Example label="Navigation / next/link">
                <div className="flex flex-wrap gap-3">
                  <Button href="#motion">Go to motion</Button>
                  <Button href="#motion" disabled>
                    Disabled link
                  </Button>
                </div>
              </Example>
            </div>
            <div className="spec-row">
              <h3 className="type-h3">Scan action</h3>
              <div className="flex flex-wrap items-end gap-6">
                <Example label="Pill / medium">
                  <ScanButton onClick={() => setScan(true)} />
                </Example>
                <Example label="Pill / large">
                  <ScanButton size="lg" onClick={() => setScan(true)} />
                </Example>
                <Example label="Mobile / fab">
                  <ScanButton size="fab" onClick={() => setScan(true)} />
                </Example>
                <Example label="Disabled">
                  <ScanButton disabled />
                </Example>
                <Example label="Scan / navigation">
                  <ScanButton
                    href="#samples"
                    onClick={(event) => {
                      event.preventDefault();
                      setScan(true);
                    }}
                  >
                    ✦ Scan with a sample
                  </ScanButton>
                </Example>
              </div>
              <div className="max-w-copy">
                <Example label="Full width">
                  <ScanButton fullWidth onClick={() => setScan(true)} />
                </Example>
              </div>
            </div>
            <div className="spec-row">
              <h3 className="type-h3">Chips & tags</h3>
              <div className="flex flex-wrap gap-3">
                <Chip pressed={pressed} onPressedChange={setPressed}>
                  Hydrating
                </Chip>
                <Chip
                  pressed={!pressed}
                  onPressedChange={(value) => setPressed(!value)}
                >
                  Oil control
                </Chip>
                <Chip pressed={false} onPressedChange={() => {}} disabled>
                  Disabled
                </Chip>
                <Chip pressed disabled onPressedChange={() => {}}>
                  Selected / disabled
                </Chip>
                <Chip static>Display-only tag</Chip>
              </div>
              <p className="type-small text-text-muted">
                Hydrating: {pressed ? "selected" : "not selected"}. Toggle
                either chip to change the state.
              </p>
            </div>
            <div className="spec-row">
              <h3 className="type-h3">Search input</h3>
              <div className="grid gap-6 tablet:grid-cols-2">
                <Example label="Interactive / clearable">
                  <SearchInput
                    className="w-full"
                    label="Search products"
                    placeholder="Search products"
                    value={search}
                    onValueChange={setSearch}
                  />
                </Example>
                <Example label="Disabled">
                  <SearchInput
                    label="Unavailable search"
                    placeholder="Search products"
                    value=""
                    onValueChange={() => {}}
                    disabled
                  />
                </Example>
              </div>
              <p className="type-small text-text-muted" role="status">
                {search
                  ? `Searching the specimen for “${search}”.`
                  : "Type to preview a search query."}
              </p>
            </div>
            <div className="spec-row">
              <h3 className="type-h3">Fit badges</h3>
              <Example label="Card">
                <div className="flex flex-wrap gap-3">
                  {fits.map((fit) => (
                    <FitBadge key={fit.level} fit={fit} />
                  ))}
                </div>
              </Example>
              <Example label="Product detail">
                <div className="flex flex-wrap gap-3">
                  {fits.map((fit) => (
                    <FitBadge key={fit.level} level={fit.level} size="pdp" />
                  ))}
                </div>
              </Example>
              <p className="type-small text-text-muted">
                Each level has a text label and a leading dot. Product cards at
                the final level dim the packshot to 60%, keeping text readable.
              </p>
            </div>
            <div className="spec-row">
              <h3 className="type-h3">Icons & icon buttons</h3>
              <div className="icon-grid">
                {ICON_NAMES.map((name) => (
                  <Example key={name} label={name}>
                    <IconButton
                      label={`Preview ${name} icon`}
                      onClick={announce(`${name} icon button activated.`)}
                    >
                      <Icon name={name} />
                    </IconButton>
                  </Example>
                ))}
              </div>
              <IconButton label="Unavailable bag" disabled>
                <Icon name="bag" />
              </IconButton>
            </div>
            <div className="spec-row">
              <h3 className="type-h3">Menus & overlays</h3>
              <div className="flex flex-wrap items-center gap-4">
                <Menu
                  label="Specimen navigation"
                  trigger={
                    <Button variant="secondary">
                      Browse specimens <Icon name="chevron-down" />
                    </Button>
                  }
                  items={[
                    {
                      id: "colors",
                      label: "Color foundations",
                      href: "#colors",
                    },
                    { id: "type", label: "Typography", href: "#typography" },
                    {
                      id: "action",
                      label: "Try a menu action",
                      onSelect: announce("Menu action selected."),
                    },
                    {
                      id: "disabled",
                      label: "Unavailable item",
                      disabled: true,
                      onSelect: () => {},
                    },
                    {
                      id: "disabled-link",
                      label: "Unavailable destination",
                      href: "#samples",
                      disabled: true,
                    },
                  ]}
                />
                <Modal
                  open={modal}
                  onOpenChange={setModal}
                  title="A little more detail"
                  description="A dialog specimen. Escape closes it; focus returns to the opener."
                  trigger={<Button variant="secondary">Open modal</Button>}
                  onBack={() => {
                    setModal(false);
                    setNotice("Back from the dialog.");
                  }}
                  footer={
                    <>
                      <Button onClick={() => setModal(false)}>Done</Button>
                      <Button
                        variant="secondary"
                        onClick={() => setModal(false)}
                      >
                        Cancel
                      </Button>
                    </>
                  }
                >
                  <p className="type-body">
                    The desktop panel becomes a full-screen sheet on mobile.
                  </p>
                  <div className="mt-6">
                    <SearchInput
                      label="Search inside dialog"
                      value={search}
                      onValueChange={setSearch}
                      placeholder="Try focus inside the dialog"
                    />
                  </div>
                </Modal>
                <BottomSheet
                  open={sheet}
                  onOpenChange={setSheet}
                  title="Your preferences"
                  description="A bottom sheet on mobile; a centered panel on larger screens."
                  trigger={
                    <Button variant="secondary">Open bottom sheet</Button>
                  }
                  footer={
                    <Button onClick={() => setSheet(false)}>
                      Save preferences
                    </Button>
                  }
                >
                  <div className="flex flex-wrap gap-3">
                    <Chip pressed={pressed} onPressedChange={setPressed}>
                      Recommendations on
                    </Chip>
                    <Chip static>Sample profile</Chip>
                  </div>
                </BottomSheet>
              </div>
            </div>
            <div className="spec-row">
              <h3 className="type-h3">Wordmark & eyebrow</h3>
              <Wordmark />
              <Eyebrow>New / everyday skincare</Eyebrow>
              <p className="type-small text-text-muted">
                Container: 1280 max, 32 side padding; mobile: 16. Alternating
                section bands demonstrate both Section variants.
              </p>
            </div>
          </div>
          <p role="status" className="spec-notice type-small">
            {notice}
          </p>
        </Section>
        <Section id="motion" band="surface">
          <Heading
            number="05"
            title={
              <>
                A change you can <Accent>follow</Accent>
              </>
            }
          >
            Motion explains the new order. The cards keep their identity as they
            move; fit badges arrive with the ranking.
          </Heading>
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="type-label mb-2">Catalog re-sort / specimen</p>
              <p className="type-small text-text-muted" role="status">
                {sorted
                  ? "Sorted for the sample profile. Serum, sunscreen, cleanser, moisturiser."
                  : "Default catalog order. Recommendations are off."}
              </p>
            </div>
            <Button aria-pressed={sorted} onClick={() => setSorted(!sorted)}>
              {sorted ? "Reset catalog order" : "Sort for sample skin"}
              <Icon name="chevron-right" />
            </Button>
          </div>
          <div className="product-grid">
            {sortedProducts.map((product, index) => (
              <motion.article
                key={product.id}
                layout={!reduced}
                transition={resortTransition(reduced, index)}
                className="product-specimen"
              >
                <div className="product-well">
                  <AnimatePresence initial={false}>
                    {sorted && (
                      <motion.div
                        className="absolute left-4 top-4"
                        {...enterPreset(reduced)}
                      >
                        <FitBadge level={product.level} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <Packshot color={product.color} />
                  <AnimatePresence initial={false}>
                    {reduced && sorted && (
                      <motion.div
                        key={`highlight-${sorted}`}
                        aria-hidden="true"
                        className="resort-highlight"
                        initial={{ opacity: 0 }}
                        animate={reducedHighlight}
                        exit={{ opacity: 0 }}
                        transition={uiTransition(false)}
                      />
                    )}
                  </AnimatePresence>
                </div>
                <div className="border-t border-border p-4">
                  <Eyebrow className="mb-2 text-text-muted">
                    {product.category}
                  </Eyebrow>
                  <h3 className="type-body font-bold">{product.name}</h3>
                  <p className="type-price mt-1">Demo price · $24.00</p>
                </div>
              </motion.article>
            ))}
          </div>
          <div className="mt-12 flex flex-wrap items-start gap-8">
            <Example label="Enter / 400ms">
              <Button
                variant="secondary"
                aria-expanded={shown}
                onClick={() => setShown(!shown)}
              >
                {shown ? "Hide preview" : "Show preview"}
              </Button>
              <div className="enter-well">
                <AnimatePresence initial={false}>
                  {shown && (
                    <motion.p
                      key="preview"
                      {...enterPreset(reduced)}
                      className="type-h3"
                    >
                      A quiet arrival.
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </Example>
            <div className="max-w-copy">
              <Eyebrow className="mb-3 text-text-muted">UI / 200ms</Eyebrow>
              <p className="type-small text-text-muted">
                Buttons use a subtle press. Dialogs fade and enter. Cards
                re-sort within 400ms with a small stagger. With reduced motion,
                the order changes instantly and a brief fade marks the change.
              </p>
            </div>
          </div>
        </Section>
        <Section id="samples">
          <Heading number="06" title="Real texture. Generated faces.">
            Synthetic test portraits for the scan integration. These people are
            generated, and are never presented as customers or treatment
            results.
          </Heading>
          <div className="sample-grid">
            {samples.map((sample) => (
              <figure key={sample.id}>
                <Image
                  src={`/samples/${sample.id}.jpg`}
                  alt={sample.alt}
                  width={1254}
                  height={1254}
                  className="aspect-square w-full rounded-panel object-cover"
                />
                <figcaption className="mt-4">
                  <Eyebrow>{sample.label}</Eyebrow>
                  <p className="type-small mt-1 text-text-muted">
                    Generated / scan test sample
                  </p>
                </figcaption>
              </figure>
            ))}
          </div>
        </Section>
      </main>
      <footer className="bg-surface py-8">
        <Container className="flex flex-wrap items-center justify-between gap-4">
          <Wordmark />
          <p className="type-small text-text-muted">
            Swiss Cover / Design system specimen
          </p>
          <Button variant="ghost" href="#main-content">
            Back to top <Icon name="back" className="size-icon rotate-90" />
          </Button>
        </Container>
      </footer>
      <Modal
        open={scan}
        onOpenChange={setScan}
        title="Meet your skin"
        description="Scan dialog preview. This specimen does not capture or upload a photo."
        footer={
          <ScanButton
            fullWidth
            onClick={() => {
              setScan(false);
              setNotice(
                "Scan preview completed. No photo was captured or uploaded.",
              );
            }}
          >
            ✦ Continue preview
          </ScanButton>
        }
      >
        <p className="type-body">
          Start with a clear, front-facing photo in even daylight. Keep your
          face free of makeup and glasses.
        </p>
        <p role="status" className="type-small mt-4 text-text-muted">
          {scanNotice}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            variant="secondary"
            onClick={() =>
              setScanNotice(
                "Camera preview selected. No camera access requested.",
              )
            }
          >
            <Icon name="camera" />
            Camera preview
          </Button>
          <Button
            variant="secondary"
            href="#samples"
            onClick={() => setScan(false)}
          >
            <Icon name="upload" />
            View sample faces
          </Button>
        </div>
      </Modal>
    </>
  );
}
