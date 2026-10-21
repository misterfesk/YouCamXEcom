import { z } from "zod";
import { PACK_SHAPES, STEPS, SUBTYPES, type Product } from "../../types/catalog";
import { CONCERNS, SKIN_TYPES } from "../../types/skin";
import { ACTIVE_BY_ID } from "../knowledge/actives";

const COLORS = ["brand", "lilac", "tangerine", "surface", "ink"] as const;
const FITS = ["suitable", "neutral", "avoid"] as const;
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const text = z.string().trim().min(1);
const fitRecord = z.object(
  Object.fromEntries(SKIN_TYPES.map((t) => [t, z.enum(FITS)])) as Record<
    (typeof SKIN_TYPES)[number],
    z.ZodEnum<{ suitable: "suitable"; neutral: "neutral"; avoid: "avoid" }>
  >,
);

export const productSchema = z
  .object({
    id: z.string().regex(SLUG),
    slug: z.string().regex(SLUG),
    name: text,
    tagline: text,
    description: text,
    step: z.enum(STEPS),
    subtype: z.string(),
    price: z.number().positive(),
    currency: z.literal("USD"),
    size: text,
    image: z.object({
      kind: z.literal("svg"),
      shape: z.enum(PACK_SHAPES),
      color: z.enum(COLORS),
    }),
    skinTypes: fitRecord,
    targets: z.array(
      z.object({
        concern: z.enum(CONCERNS),
        strength: z.union([z.literal(1), z.literal(2), z.literal(3)]),
      }),
    ),
    actives: z.array(z.object({ id: z.string(), percent: z.number().positive().optional() })),
    flags: z.object({
      fragranceFree: z.boolean(),
      nonComedogenic: z.boolean(),
      alcoholFree: z.boolean(),
      mineralSpf: z.boolean().optional(),
      tinted: z.boolean().optional(),
    }),
    spf: z.number().int().positive().optional(),
    safety: z.array(z.enum(["pregnancy", "strongActives"])),
    usage: z.object({
      when: z.enum(["am", "pm", "both"]),
      howTo: text,
      frequency: text,
    }),
    ingredientsInci: text,
    bestseller: z.boolean().optional(),
    new: z.boolean().optional(),
  })
  .strict()
  .superRefine((p, ctx) => {
    const issue = (message: string, path: (string | number)[] = []) =>
      ctx.addIssue({ code: "custom", message, path });
    if (p.id !== p.slug) issue("id must equal slug", ["id"]);
    if (!(SUBTYPES[p.step] as readonly string[]).includes(p.subtype)) {
      issue(`subtype "${p.subtype}" does not belong to step "${p.step}"`, ["subtype"]);
    }
    p.actives.forEach((a, i) => {
      if (!ACTIVE_BY_ID[a.id]) issue(`unknown active "${a.id}"`, ["actives", i, "id"]);
    });
    if (p.step === "protect" && p.spf === undefined) issue("protect products need spf", ["spf"]);
    if (p.step !== "protect" && p.spf !== undefined) issue("only protect products have spf", ["spf"]);
  });

export const catalogSchema = z.array(productSchema).superRefine((list, ctx) => {
  const seen = new Set<string>();
  list.forEach((p, i) => {
    if (seen.has(p.id)) ctx.addIssue({ code: "custom", message: `duplicate id "${p.id}"`, path: [i, "id"] });
    seen.add(p.id);
  });
});

/** Parses and validates raw catalog JSON. Throws a ZodError listing every problem. */
export function parseCatalog(raw: unknown): Product[] {
  return catalogSchema.parse(raw) as Product[];
}
