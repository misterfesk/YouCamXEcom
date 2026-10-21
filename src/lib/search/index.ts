import { ACTIVE_BY_ID } from "@/lib/knowledge/actives";
import { SUBTYPE_LABEL, STEP_LABEL, type Product } from "@/types/catalog";
import { GOAL_DEFS, GOALS } from "@/types/goal";
import { CONCERN_LABEL } from "@/types/skin";

/** Everyday words → catalog vocabulary. Multi-word values are matched as a phrase. */
const SYNONYMS: Record<string, string> = {
  pimples: "acne",
  pimple: "acne",
  zits: "acne",
  zit: "acne",
  spots: "acne",
  breakout: "acne",
  blemish: "acne",
  blemishes: "acne",
  blackheads: "pore",
  shine: "oiliness",
  shiny: "oiliness",
  oily: "oiliness",
  greasy: "oiliness",
  dry: "moisture",
  dryness: "moisture",
  dehydrated: "moisture",
  hydration: "moisture",
  hydrating: "moisture",
  sensitive: "redness",
  irritated: "redness",
  pigmentation: "age_spot",
  marks: "age_spot",
  dull: "radiance",
  glow: "radiance",
  wrinkles: "wrinkle",
  lines: "wrinkle",
  aging: "wrinkle",
  ageing: "wrinkle",
  sagging: "firmness",
  puffy: "eye_bag",
  puffiness: "eye_bag",
  "dark circles": "under eyes",
  "eye bags": "under eyes",
  spf: "sunscreen",
  sun: "sunscreen",
  sunblock: "sunscreen",
  moisturiser: "moisturizer",
  wash: "cleanser",
  facewash: "cleanser",
  exfoliant: "exfoliating",
  peel: "exfoliating",
  bha: "salicylic",
  aha: "glycolic lactic mandelic",
  pha: "gluconolactone",
  "vitamin c": "ascorbic ascorbyl",
  retinoid: "retinol retinal",
};

const words = (text: string) =>
  text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);

/** One edit (insert, delete or substitute) between words of 5+ letters. */
function closeWord(query: string, word: string): boolean {
  if (query.length < 5 || Math.abs(query.length - word.length) > 1) return false;
  let left = 0,
    right = 0,
    edits = 0;
  while (left < query.length && right < word.length) {
    if (query[left] === word[right]) {
      left++;
      right++;
      continue;
    }
    if (++edits > 1) return false;
    if (query.length >= word.length) left++;
    if (word.length >= query.length) right++;
  }
  return edits + Number(left < query.length || right < word.length) <= 1;
}

type Entry = { product: Product; name: string[]; all: string[] };

export type SearchIndex = { entries: Entry[]; bestsellers: Product[] };

/** Pre-tokenizes the catalog once; queries then only scan word lists. */
export function buildSearchIndex(products: Product[]): SearchIndex {
  return {
    bestsellers: products.filter((p) => p.bestseller).slice(0, 5),
    entries: products.map((product) => ({
      product,
      name: words(product.name),
      all: [
        ...new Set(
          words(
            [
              product.name,
              product.tagline,
              product.step,
              STEP_LABEL[product.step],
              product.spf ? "sunscreen spf" : "",
              SUBTYPE_LABEL[product.subtype],
              product.subtype,
              ...product.actives.flatMap((a) => [a.id, ACTIVE_BY_ID[a.id]?.name ?? ""]),
              ...product.targets.flatMap((t) => [
                t.concern,
                CONCERN_LABEL[t.concern],
                ...GOALS.filter((g) => GOAL_DEFS[g].concerns.includes(t.concern)).flatMap((g) => [
                  g,
                  GOAL_DEFS[g].title,
                ]),
              ]),
            ].join(" "),
          ),
        ),
      ],
    })),
  };
}

/**
 * Every query term (or one of its synonyms) must match: name hit 4, other field 3, typo in name 2, other typo 1.
 * Empty query → bestsellers. Results best first; ties keep catalog order.
 */
export function search(index: SearchIndex, query: string): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return index.bestsellers;
  // A known multi-word phrase ("dark circles") becomes one term; otherwise each word is a term.
  const terms =
    q.includes(" ") && SYNONYMS[q]
      ? [words(SYNONYMS[q])]
      : words(q).map((term) => [term, ...words(SYNONYMS[term] ?? "")]);
  if (!terms.length) return [];
  return index.entries
    .map(({ product, name, all }) => {
      let total = 0;
      for (const variants of terms) {
        const score = variants.some((t) => name.some((w) => w.includes(t)))
          ? 4
          : variants.some((t) => all.some((w) => w.includes(t)))
            ? 3
            : variants.some((t) => name.some((w) => closeWord(t, w)))
              ? 2
              : variants.some((t) => all.some((w) => closeWord(t, w)))
                ? 1
                : 0;
        if (!score) return { product, total: 0 };
        total += score;
      }
      return { product, total };
    })
    .filter((r) => r.total > 0)
    .sort((a, b) => b.total - a.total)
    .map((r) => r.product);
}
