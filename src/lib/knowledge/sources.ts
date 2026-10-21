/**
 * References behind every knowledge rule. Rules cite these ids; /how-we-recommend lists them.
 * Public guidance (AAD, DermNet, FDA) first, peer-reviewed reviews where guidance is thin.
 */
export const SOURCES = {
  "aad-acne-tips": {
    title: "Acne: Tips for managing",
    publisher: "American Academy of Dermatology",
    url: "https://www.aad.org/public/diseases/acne/skin-care/tips",
  },
  "aad-dry-skin": {
    title: "Dermatologists' tips for relieving dry skin",
    publisher: "American Academy of Dermatology",
    url: "https://www.aad.org/public/everyday-care/skin-care-basics/dry/dermatologists-tips-relieve-dry-skin",
  },
  "aad-exfoliate": {
    title: "How to safely exfoliate at home",
    publisher: "American Academy of Dermatology",
    url: "https://www.aad.org/public/everyday-care/skin-care-secrets/routine/safely-exfoliate-at-home",
  },
  "aad-sunscreen-faq": {
    title: "Sunscreen FAQs",
    publisher: "American Academy of Dermatology",
    url: "https://www.aad.org/public/everyday-care/sun-protection/sunscreen-patients/sunscreen-faqs",
  },
  "fda-aha": {
    title: "Alpha Hydroxy Acids",
    publisher: "U.S. Food and Drug Administration",
    url: "https://www.fda.gov/cosmetics/cosmetic-ingredients/alpha-hydroxy-acids",
  },
  "dermnet-salicylic": {
    title: "Salicylic acid",
    publisher: "DermNet",
    url: "https://dermnetnz.org/topics/salicylic-acid",
  },
  "dermnet-benzoyl-peroxide": {
    title: "Benzoyl peroxide",
    publisher: "DermNet",
    url: "https://dermnetnz.org/topics/benzoyl-peroxide",
  },
  "dermnet-azelaic": {
    title: "Azelaic acid",
    publisher: "DermNet",
    url: "https://dermnetnz.org/topics/azelaic-acid",
  },
  "dermnet-pih": {
    title: "Postinflammatory hyperpigmentation",
    publisher: "DermNet",
    url: "https://dermnetnz.org/topics/postinflammatory-hyperpigmentation",
  },
  "dermnet-melasma": {
    title: "Melasma",
    publisher: "DermNet",
    url: "https://dermnetnz.org/topics/melasma",
  },
  "dermnet-rosacea": {
    title: "Rosacea",
    publisher: "DermNet",
    url: "https://dermnetnz.org/topics/rosacea",
  },
  "dermnet-fragrance": {
    title: "Fragrance allergy",
    publisher: "DermNet",
    url: "https://dermnetnz.org/topics/fragrance-allergy",
  },
  "dermnet-moisturisers": {
    title: "Emollients and moisturisers",
    publisher: "DermNet",
    url: "https://dermnetnz.org/topics/emollients-and-moisturisers",
  },
  "bissett-2005": {
    title: "Niacinamide: a B vitamin that improves aging facial skin appearance (Dermatol Surg 2005)",
    publisher: "Bissett et al.",
    url: "https://doi.org/10.1111/j.1524-4725.2005.31732",
  },
  "mukherjee-2006": {
    title: "Retinoids in the treatment of skin aging (Clin Interv Aging 2006)",
    publisher: "Mukherjee et al.",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC2699641/",
  },
  "pullar-2017": {
    title: "The roles of vitamin C in skin health (Nutrients 2017)",
    publisher: "Pullar et al.",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5579659/",
  },
  "papakonstantinou-2012": {
    title: "Hyaluronic acid: a key molecule in skin aging (Dermatoendocrinol 2012)",
    publisher: "Papakonstantinou et al.",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3583886/",
  },
  "bylka-2013": {
    title: "Centella asiatica in cosmetology (Postepy Dermatol Alergol 2013)",
    publisher: "Bylka et al.",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3834700/",
  },
  "schagen-2017": {
    title: "Topical peptide treatments with effective anti-aging results (Cosmetics 2017)",
    publisher: "Schagen",
    url: "https://doi.org/10.3390/cosmetics4020016",
  },
  "dhaliwal-2019": {
    title: "Prospective, randomized, double-blind assessment of topical bakuchiol and retinol (Br J Dermatol 2019)",
    publisher: "Dhaliwal et al.",
    url: "https://doi.org/10.1111/bjd.16918",
  },
  "vrcek-2016": {
    title: "Infraorbital dark circles: a review of the pathogenesis, evaluation and treatment (J Cutan Aesthet Surg 2016)",
    publisher: "Vrcek et al.",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4924417/",
  },
  "davis-2010": {
    title: "Postinflammatory hyperpigmentation: a review of the epidemiology, clinical features, and treatment options in skin of color (J Clin Aesthet Dermatol 2010)",
    publisher: "Davis & Callender",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC2921758/",
  },
  "hughes-2013": {
    title: "Sunscreen and prevention of skin aging: a randomized trial (Ann Intern Med 2013)",
    publisher: "Hughes et al.",
    url: "https://doi.org/10.7326/0003-4819-158-11-201306040-00002",
  },
  "lyons-2021": {
    title: "Photoprotection beyond ultraviolet radiation: visible light (J Am Acad Dermatol 2021)",
    publisher: "Lyons et al.",
    url: "https://doi.org/10.1016/j.jaad.2020.04.079",
  },
} as const satisfies Record<string, { title: string; publisher: string; url: string }>;

export type SourceId = keyof typeof SOURCES;
