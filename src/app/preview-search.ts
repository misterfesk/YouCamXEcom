import type { Product } from "@/types/catalog";
import { CONCERN_LABEL } from "@/types/skin";
import { GOAL_DEFS } from "@/types/goal";
import { SUBTYPE_LABEL } from "@/types/catalog";
const aliases: Record<string, string> = {
  pimples: "acne",
  pimple: "acne",
  spots: "acne",
  dry: "moisture",
  hydration: "moisture",
  hydrating: "moisture",
  oily: "oiliness",
  "dark circles": "under eyes",
  spf: "sunscreen",
  sun: "sunscreen",
};
const words = (text: string) =>
  text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
function closeWord(query: string, word: string): boolean {
  if (query.length < 5 || Math.abs(query.length - word.length) > 1)
    return false;
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
export function searchProducts(products: Product[], query: string): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return products.filter((p) => p.bestseller).slice(0, 5);
  const phrase = aliases[q]?.includes(" ") ? aliases[q] : q;
  const terms = words(phrase).map((term) => [
    term,
    ...words(aliases[term] ?? ""),
  ]);
  if (!terms.length) return [];
  return products
    .map((product) => {
      const nameWords = words(product.name);
      const allWords = words(
        [
          product.name,
          product.tagline,
          product.step,
          product.spf ? "sunscreen" : "",
          SUBTYPE_LABEL[product.subtype],
          ...product.actives.map((a) => a.id),
          ...product.targets.flatMap((t) => [
            t.concern,
            CONCERN_LABEL[t.concern],
            ...Object.values(GOAL_DEFS)
              .filter((g) => g.concerns.includes(t.concern))
              .map((g) => g.id),
          ]),
        ].join(" "),
      );
      const scores = terms.map((variants) =>
        variants.some((term) => nameWords.some((word) => word.includes(term)))
          ? 4
          : variants.some((term) =>
                allWords.some((word) => word.includes(term)),
              )
            ? 3
            : variants.some((term) =>
                  allWords.some((word) => closeWord(term, word)),
                )
              ? 1
              : 0,
      );
      return {
        product,
        score: scores.every(Boolean)
          ? scores.reduce<number>((a, b) => a + b, 0)
          : 0,
      };
    })
    .filter((p) => p.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((p) => p.product);
}
