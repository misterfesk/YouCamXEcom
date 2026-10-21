import type {
  Product,
  Step,
  Subtype,
  PackShape,
  PackColor,
} from "@/types/catalog";
import type { Concern } from "@/types/skin";

type Seed = {
  name: string;
  tagline: string;
  description: string;
  subtype: Subtype;
  price: number;
  size: string;
  shape: PackShape;
  color: PackColor;
  targets: Concern[];
  active: string;
  percent?: number;
  inci: string;
  how: string;
  frequency?: string;
  when?: "am" | "pm" | "both";
  strong?: boolean;
  retinoid?: boolean;
  rich?: boolean;
  fragrance?: boolean;
  spf?: number;
  tinted?: boolean;
  bestseller?: boolean;
};
const seeds: Seed[] = [
  {
    name: "Soft Start Gel Cleanser",
    tagline: "A fresh start, without the tight feeling.",
    description:
      "A gel cleanser with glycerin and panthenol for your daily wash. One pump, a gentle massage and a lukewarm rinse make a simple first step before your leave-on layers.",
    subtype: "gel-foam-cleanser",
    price: 18,
    size: "150 ml",
    shape: "pump",
    color: "lilac",
    targets: ["oiliness", "pore"],
    active: "glycerin",
    inci: "Aqua, Glycerin, Cocamidopropyl Betaine, Decyl Glucoside, Panthenol, Sodium Chloride, Citric Acid, Sodium Benzoate.",
    how: "Massage one pump onto damp skin, then rinse with lukewarm water.",
    bestseller: true,
  },
  {
    name: "Cloud Milk Cleanser",
    tagline: "A soft, creamy cleanse for quieter mornings.",
    description:
      "A milk-textured cleanser with glycerin and panthenol. Choose this creamy starting point when a foaming wash is not the texture you want, then follow with the rest of your routine.",
    subtype: "cream-milk-cleanser",
    price: 20,
    size: "150 ml",
    shape: "bottle",
    color: "surface",
    targets: ["moisture", "redness"],
    active: "panthenol",
    inci: "Aqua, Glycerin, Caprylic/Capric Triglyceride, Cetearyl Alcohol, Panthenol, Glyceryl Stearate, Phenoxyethanol.",
    how: "Smooth onto damp skin, massage gently and rinse.",
  },
  {
    name: "Melt Away Cleansing Balm",
    tagline: "The first step to taking the day off.",
    description:
      "A scoopable evening cleanser with squalane. Start on dry skin, add water to turn the balm milky, then rinse. Its richer texture is worth considering alongside your skin-type match.",
    subtype: "oil-balm-cleanser",
    price: 24,
    size: "80 g",
    shape: "jar",
    color: "lilac",
    targets: ["moisture"],
    active: "squalane",
    inci: "Ethylhexyl Palmitate, Caprylic/Capric Triglyceride, PEG-20 Glyceryl Triisostearate, Squalane, Tocopherol.",
    how: "Massage a small scoop onto dry skin. Add water to emulsify, then rinse.",
    when: "pm",
    rich: true,
  },
  {
    name: "Fresh Slate Micellar Water",
    tagline: "A light first cleanse, made simple.",
    description:
      "A water-light first cleanse with glycerin and panthenol. Sweep it over skin with a soft pad and rinse afterwards. A straightforward option when you prefer a liquid cleanser to a balm.",
    subtype: "micellar-water",
    price: 16,
    size: "200 ml",
    shape: "bottle",
    color: "surface",
    targets: ["redness"],
    active: "glycerin",
    inci: "Aqua, Glycerin, Poloxamer 184, Panthenol, Disodium EDTA, Sodium Benzoate.",
    how: "Sweep over skin with a soft pad, avoiding rubbing. Rinse afterwards.",
  },
  {
    name: "Clear Step BHA Wash",
    tagline: "A targeted cleanse for congested days.",
    description:
      "A rinse-off cleanser with 2% salicylic acid for a targeted evening wash. Give this step its own place in your routine and introduce it gradually rather than adding several actives at once.",
    subtype: "medicated-cleanser",
    price: 22,
    size: "120 ml",
    shape: "tube",
    color: "brand",
    targets: ["acne", "pore", "oiliness"],
    active: "salicylic-acid",
    percent: 2,
    inci: "Aqua, Cocamidopropyl Betaine, Glycerin, Salicylic Acid, Sodium Lauroyl Sarcosinate, Sodium Hydroxide, Phenoxyethanol.",
    how: "Massage onto wet skin, avoiding eyes, and rinse thoroughly.",
    frequency: "Start two evenings a week. Increase only as tolerated.",
    when: "pm",
    strong: true,
  },
  {
    name: "Water Notes Toner",
    tagline: "An easy layer of lightweight hydration.",
    description:
      "A watery layer with beta-glucan, glycerin and panthenol. Press a few drops into skin after cleansing, then continue with serum or moisturizer. No cotton pad needed.",
    subtype: "hydrating-toner",
    price: 20,
    size: "150 ml",
    shape: "bottle",
    color: "lilac",
    targets: ["moisture", "texture"],
    active: "beta-glucan",
    inci: "Aqua, Glycerin, Beta-Glucan, Sodium Hyaluronate, Panthenol, Phenoxyethanol.",
    how: "Press a few drops into clean skin with your palms.",
  },
  {
    name: "Slow Polish PHA Toner",
    tagline: "A measured approach to smoother texture.",
    description:
      "A leave-on toner with 5% gluconolactone. This is an occasional evening treatment, not a second cleanser. Start with one night a week and keep the rest of that routine simple.",
    subtype: "exfoliating-toner",
    price: 25,
    size: "100 ml",
    shape: "bottle",
    color: "brand",
    targets: ["texture", "radiance", "pore"],
    active: "gluconolactone",
    percent: 5,
    inci: "Aqua, Gluconolactone, Glycerin, Panthenol, Sodium Hydroxide, Phenoxyethanol.",
    how: "Pat a few drops onto dry skin after cleansing. Avoid the eye area.",
    frequency: "Begin once a week; build to twice a week if comfortable.",
    when: "pm",
    strong: true,
  },
  {
    name: "Balance Notes Serum",
    tagline: "A light layer for oil balance and visible pores.",
    description:
      "A water-based serum with 5% niacinamide and zinc PCA, focused on oil balance and visible pores. Apply a few drops between cleansing and moisturizer rather than building a complicated routine around it.",
    subtype: "serum",
    price: 26,
    size: "30 ml",
    shape: "dropper",
    color: "brand",
    targets: ["oiliness", "pore", "acne"],
    active: "niacinamide",
    percent: 5,
    inci: "Aqua, Niacinamide, Glycerin, Propanediol, Zinc PCA, Xanthan Gum, Phenoxyethanol.",
    how: "Apply two or three drops after cleansing and before moisturizer.",
    bestseller: true,
  },
  {
    name: "Water Reserve Serum",
    tagline: "Hydration that slips into any routine.",
    description:
      "A water-based layer with sodium hyaluronate, glycerin and panthenol. Press it into slightly damp skin before moisturizer. A simple choice when hydration is the focus of your routine.",
    subtype: "serum",
    price: 24,
    size: "30 ml",
    shape: "dropper",
    color: "lilac",
    targets: ["moisture", "texture"],
    active: "hyaluronic-acid",
    inci: "Aqua, Glycerin, Propanediol, Sodium Hyaluronate, Panthenol, Hydroxyethylcellulose, Phenoxyethanol.",
    how: "Press two drops into slightly damp skin. Follow with moisturizer.",
    bestseller: true,
  },
  {
    name: "Even Day Azelaic Serum",
    tagline: "A considered step for uneven-looking tone.",
    description:
      "A 10% azelaic-acid formula for an evening routine focused on uneven-looking tone and visible redness. Use a thin layer before moisturizer and adjust the frequency to how your skin feels.",
    subtype: "serum",
    price: 28,
    size: "30 ml",
    shape: "tube",
    color: "surface",
    targets: ["age_spot", "radiance", "acne", "redness"],
    active: "azelaic-acid",
    percent: 10,
    inci: "Aqua, Azelaic Acid, Dimethicone, Glycerin, Propanediol, Polysorbate 80, Phenoxyethanol.",
    how: "Spread a thin layer over dry skin before moisturizer. Avoid eyes.",
    frequency: "Start every other evening and adjust to comfort.",
    when: "pm",
  },
  {
    name: "Quiet Spot Patches",
    tagline: "A simple cover for a single spot.",
    description:
      "Hydrocolloid patches for covering an individual spot. Apply to clean, dry skin before the rest of your routine, keeping creams and serums away from the patch so it can sit in place.",
    subtype: "spot-treatment",
    price: 9,
    size: "24 patches",
    shape: "sachet",
    color: "lilac",
    targets: ["acne"],
    active: "hydrocolloid",
    inci: "Cellulose Gum, Polyisobutene, Hydrogenated Poly(C6-20 Olefin).",
    how: "Place one patch over a clean, dry spot. Remove when opaque or after eight hours.",
    frequency: "Use as needed.",
    when: "pm",
  },
  {
    name: "Sunday Clay Mask",
    tagline: "A rinse-off reset for an oily T-zone.",
    description:
      "A kaolin and bentonite mask for an occasional rinse-off step. Apply a thin layer to the areas you want to focus on, then rinse before it dries completely. Follow with moisturizer.",
    subtype: "mask",
    price: 22,
    size: "60 g",
    shape: "jar",
    color: "brand",
    targets: ["oiliness", "pore"],
    active: "kaolin",
    inci: "Aqua, Kaolin, Glycerin, Bentonite, Panthenol, Xanthan Gum, Phenoxyethanol.",
    how: "Apply a thin layer, avoiding eyes. Rinse after five minutes before fully dry.",
    frequency: "Use once a week.",
    when: "pm",
  },
  {
    name: "Soft Focus Eye Gel",
    tagline: "A cooling layer for the under-eye routine.",
    description:
      "A lightweight under-eye layer with 1% caffeine, glycerin and panthenol. Tap a small amount around the orbital bone. Keep the gel away from the lash line and the eye itself.",
    subtype: "eye-care",
    price: 24,
    size: "15 ml",
    shape: "tube",
    color: "lilac",
    targets: ["eye_bag", "dark_circle_v2", "tear_trough"],
    active: "caffeine",
    percent: 1,
    inci: "Aqua, Glycerin, Caffeine, Panthenol, Sodium Hyaluronate, Carbomer, Phenoxyethanol.",
    how: "Tap a rice-grain amount around the orbital bone. Keep away from the lash line.",
  },
  {
    name: "Night Shift Retinal Serum",
    tagline: "A gradual evening step for fine lines.",
    description:
      "An evening serum with 0.05% retinal, squalane and glycerin. Begin with one night a week and follow with moisturizer. Keep it separate from exfoliating acids and read the safety notes before use.",
    subtype: "serum",
    price: 34,
    size: "30 ml",
    shape: "pump",
    color: "ink",
    targets: [
      "wrinkle",
      "firmness",
      "texture",
      "droopy_upper_eyelid",
      "droopy_lower_eyelid",
    ],
    active: "retinal",
    percent: 0.05,
    inci: "Aqua, Glycerin, Squalane, Caprylic/Capric Triglyceride, Retinal, Tocopherol, Lecithin, Phenoxyethanol.",
    how: "Apply a pea-sized amount to dry skin, avoiding eyelids. Follow with moisturizer.",
    frequency:
      "Start one evening a week. Do not combine with exfoliating acids that evening.",
    when: "pm",
    strong: true,
    retinoid: true,
  },
  {
    name: "Daily Air Gel Cream",
    tagline: "Light moisture. A comfortable finish.",
    description:
      "A gel-cream moisturizer with glycerin and panthenol. A lightweight finishing texture for your water-based layers, morning or evening. In the morning, follow with your sun-protection step.",
    subtype: "gel-moisturizer",
    price: 25,
    size: "50 ml",
    shape: "jar",
    color: "lilac",
    targets: ["moisture", "oiliness"],
    active: "glycerin",
    inci: "Aqua, Glycerin, Dimethicone, Panthenol, Sodium Hyaluronate, Carbomer, Phenoxyethanol.",
    how: "Smooth a small amount over face and neck after serum.",
    bestseller: true,
  },
  {
    name: "Soft Landing Moisturizer",
    tagline: "A cream for the everyday in-between.",
    description:
      "A cream with ceramide NP, cholesterol and glycerin. Smooth it over face and neck after water-based layers. An everyday cream texture for the space between a light gel and a richer balm.",
    subtype: "cream-moisturizer",
    price: 28,
    size: "50 ml",
    shape: "jar",
    color: "surface",
    targets: ["moisture", "texture"],
    active: "ceramides",
    inci: "Aqua, Glycerin, Caprylic/Capric Triglyceride, Cetearyl Alcohol, Ceramide NP, Cholesterol, Sodium Hyaluronate, Phenoxyethanol.",
    how: "Apply to face and neck after any water-based layers.",
  },
  {
    name: "Comfort Zone Barrier Balm",
    tagline: "A richer last layer for dry-feeling patches.",
    description:
      "A richer finishing layer with 5% panthenol, petrolatum and shea butter. Press a small amount over moisturizer on dry-feeling patches, rather than treating it as another all-over serum.",
    subtype: "barrier-balm",
    price: 26,
    size: "40 ml",
    shape: "tube",
    color: "surface",
    targets: ["redness", "moisture"],
    active: "panthenol",
    percent: 5,
    inci: "Aqua, Panthenol, Glycerin, Petrolatum, Shea Butter, Cetearyl Alcohol, Madecassoside, Phenoxyethanol.",
    how: "Press a thin layer onto dry-feeling patches after moisturizer.",
    rich: true,
  },
  {
    name: "After Hours Night Cream",
    tagline: "A soft finish to your evening ritual.",
    description:
      "An evening cream with squalane, panthenol and a peptide. Massage a small amount over face and neck as your final layer, keeping your nighttime routine as simple as you like.",
    subtype: "night-cream",
    price: 32,
    size: "50 ml",
    shape: "jar",
    color: "ink",
    targets: ["wrinkle", "firmness", "moisture"],
    active: "peptides",
    inci: "Aqua, Glycerin, Squalane, Cetearyl Alcohol, Palmitoyl Tripeptide-1, Panthenol, Phenoxyethanol.",
    how: "Massage a small amount over face and neck as your final evening layer.",
    when: "pm",
  },
  {
    name: "Still Life Face Oil",
    tagline: "A fragrant, rich finish for dry-feeling skin.",
    description:
      "A fragrant blend of rosehip oil, sweet almond oil and squalane. Press one or two drops over moisturizer in the evening. Its fragrance and rich texture may not suit every skin profile.",
    subtype: "face-oil",
    price: 30,
    size: "30 ml",
    shape: "dropper",
    color: "tangerine",
    targets: ["moisture", "radiance"],
    active: "rosehip-oil",
    inci: "Rosa Canina Seed Oil, Prunus Amygdalus Dulcis Oil, Squalane, Tocopherol, Parfum, Limonene, Linalool.",
    how: "Warm one or two drops between palms. Press over moisturizer.",
    when: "pm",
    rich: true,
    fragrance: true,
  },
  {
    name: "Everyday Shade SPF 50",
    tagline: "Make sun protection your last morning step.",
    description:
      "A fluid sunscreen for the last step of your morning routine. Use a generous layer after moisturizer and keep reapplication in mind when outdoors. This demo formula is illustrative, not a tested retail sunscreen.",
    subtype: "sunscreen",
    price: 28,
    size: "50 ml",
    shape: "tube",
    color: "tangerine",
    targets: ["age_spot", "radiance"],
    active: "uv-filters",
    inci: "Aqua, Diethylamino Hydroxybenzoyl Hexyl Benzoate, Ethylhexyl Triazone, Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine, Glycerin, C12-15 Alkyl Benzoate, Phenoxyethanol.",
    how: "Apply generously as the last morning step. Reapply every two hours outdoors and after swimming or sweating.",
    when: "am",
    spf: 50,
    bestseller: true,
  },
  {
    name: "Sheer Veil Tinted SPF 50",
    tagline: "A sheer tint for your daily sun step.",
    description:
      "A tinted sunscreen concept with zinc oxide and iron oxides. The tint is not a universal shade and may not suit every skin tone. This demo formula is illustrative, not a tested retail sunscreen.",
    subtype: "tinted-spf",
    price: 32,
    size: "50 ml",
    shape: "pump",
    color: "tangerine",
    targets: ["age_spot", "radiance"],
    active: "zinc-oxide",
    inci: "Aqua, Zinc Oxide, Caprylic/Capric Triglyceride, Glycerin, Silica, Polyhydroxystearic Acid, Iron Oxides, Phenoxyethanol.",
    how: "Apply generously after moisturizer. Reapply every two hours outdoors. The tint may not suit every skin tone.",
    when: "am",
    spf: 50,
    tinted: true,
  },
  {
    name: "Pocket Shade SPF 50 Stick",
    tagline: "A portable companion to your morning SPF.",
    description:
      "A portable sunscreen-stick concept to accompany your usual generous morning layer. Apply overlapping passes and blend when reapplying. This demo formula is illustrative, not a tested retail sunscreen.",
    subtype: "sunscreen",
    price: 20,
    size: "18 g",
    shape: "stick",
    color: "tangerine",
    targets: ["age_spot"],
    active: "uv-filters",
    inci: "Dibutyl Adipate, Synthetic Wax, Diethylamino Hydroxybenzoyl Hexyl Benzoate, Ethylhexyl Triazone, Silica, Tocopherol.",
    how: "Apply multiple overlapping passes over exposed skin and blend. Reapply regularly outdoors; use your usual generous SPF layer first.",
    when: "am",
    spf: 50,
  },
  {
    name: "Quiet Hours Recovery Mask",
    tagline: "A soft overnight layer for thirsty skin.",
    description:
      "A leave-on evening mask with beta-glucan, squalane and panthenol. Spread a thin layer over moisturizer on the nights you want an extra finishing step, then rinse in the morning.",
    subtype: "mask",
    price: 27,
    size: "60 ml",
    shape: "jar",
    color: "lilac",
    targets: ["moisture", "redness", "texture"],
    active: "beta-glucan",
    inci: "Aqua, Glycerin, Squalane, Beta-Glucan, Panthenol, Ceramide NP, Cetearyl Alcohol, Phenoxyethanol.",
    how: "Spread a thin layer over moisturizer. Rinse in the morning.",
    frequency: "Use two evenings a week or as needed.",
    when: "pm",
  },
  {
    name: "Bright Notes Vitamin C Serum",
    tagline: "A morning layer for a more even-looking tone.",
    description:
      "A water-based morning serum with 10% ascorbyl glucoside, a vitamin C derivative. Apply two drops before moisturizer and finish with sunscreen. An uncomplicated addition to a routine focused on even-looking tone.",
    subtype: "serum",
    price: 30,
    size: "30 ml",
    shape: "dropper",
    color: "tangerine",
    targets: ["radiance", "age_spot", "firmness"],
    active: "ascorbyl-glucoside",
    percent: 10,
    inci: "Aqua, Ascorbyl Glucoside, Glycerin, Propanediol, Sodium Hydroxide, Xanthan Gum, Phenoxyethanol.",
    how: "Apply two drops to dry skin before moisturizer. Finish with sunscreen.",
    when: "am",
  },
];
const stepFor = (subtype: Subtype): Step => {
  if (
    [
      "gel-foam-cleanser",
      "cream-milk-cleanser",
      "oil-balm-cleanser",
      "micellar-water",
      "medicated-cleanser",
    ].includes(subtype)
  )
    return "cleanse";
  if (
    [
      "gel-moisturizer",
      "cream-moisturizer",
      "barrier-balm",
      "night-cream",
      "face-oil",
    ].includes(subtype)
  )
    return "moisturize";
  if (["sunscreen", "tinted-spf"].includes(subtype)) return "protect";
  return "treat";
};
export const products: Product[] = seeds.map((seed, index) => ({
  id: `product-${String(index + 1).padStart(2, "0")}`,
  slug: seed.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-$/, ""),
  name: seed.name,
  tagline: seed.tagline,
  description: seed.description,
  step: stepFor(seed.subtype),
  subtype: seed.subtype,
  price: seed.price,
  currency: "USD",
  size: seed.size,
  image: { kind: "svg", shape: seed.shape, color: seed.color },
  skinTypes: {
    normal: "suitable",
    oily: seed.rich ? "avoid" : "suitable",
    dry: seed.subtype === "medicated-cleanser" ? "neutral" : "suitable",
    combination: "suitable",
  },
  targets: seed.targets.map((concern) => ({
    concern,
    strength: seed.strong ? 3 : 2,
  })),
  actives: [
    { id: seed.active, ...(seed.percent ? { percent: seed.percent } : {}) },
  ],
  flags: {
    fragranceFree: !seed.fragrance,
    nonComedogenic: !seed.rich,
    alcoholFree: true,
    ...(seed.tinted ? { mineralSpf: true, tinted: true } : {}),
  },
  ...(seed.spf ? { spf: seed.spf } : {}),
  safety: [
    ...(seed.strong ? ["strongActives" as const] : []),
    ...(seed.retinoid ? ["pregnancy" as const] : []),
  ],
  usage: {
    when: seed.when ?? "both",
    howTo: seed.how,
    frequency: seed.frequency ?? "Use daily, as comfortable.",
  },
  ingredientsInci: seed.inci,
  bestseller: seed.bestseller,
  new: index === 23,
}));
