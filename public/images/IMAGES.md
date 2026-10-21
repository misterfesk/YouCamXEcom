# Image sources

## Sample faces

Generated on 2026-10-20 using OpenAI's built-in GPT image generation tool (`image_gen`). The tool does not return a specific model version; no version is inferred. These are synthetic people for scan testing, not customers, testimonials, or treatment outcomes. Source: generated for this project; no third-party source photograph. Use subject to the applicable OpenAI output terms, not a stock-photo license.

Each passed visual inspection on the first attempt. Original square outputs converted to JPEG at quality 95 with 4:4:4 chroma, without retouching or resampling.

Shared prompt (used verbatim for each):

> Passport-style head-and-shoulders photo, plain light-grey background, soft even front lighting, face straight to camera, neutral expression, mouth closed, eyes open. No makeup, no glasses, no jewelry, hair pulled back off forehead and ears. Face fills most of the frame. Sharp focus, unretouched natural skin texture with visible pores. Square, high resolution. Output a 1536 by 1536 square image, minimum 1080 pixels on each side.

Subject lines:

- `public/samples/oily.jpg`: Woman, 22, South Asian, deep-medium brown skin (Fitzpatrick V). Oily skin with shine on forehead and nose, enlarged T-zone pores, several active red pimples on cheeks and chin, a few dark post-acne marks.
- `public/samples/dry.jpg`: Woman, 31, East Asian, light skin (Fitzpatrick II–III). Dry, slightly flaky skin, diffuse redness on cheeks and around the nose, no shine.
- `public/samples/mature.jpg`: Woman, 54, Latina, medium tan skin (Fitzpatrick IV). Dull, uneven tone, a few sun spots on cheekbones, fine lines at eyes and forehead, mild under-eye bags and dark circles, softer jawline.

Review: all frontal, eyes open, mouths closed, even front light, forehead exposed, no glasses/jewelry/makeup, face fills frame. Oily: visible specular T-zone, pores, active cheek/chin spots and dark marks. Dry: matte textured cheeks, visible flaking and cheek/nose redness. Mature: uneven tone, cheekbone sun spots, forehead/eye lines, mild bags/dark circles and softer jawline. Fitzpatrick categories describe prompt intent; visual inspection cannot establish sun-response type. Actual API scores remain to be validated by the spike.

## Storefront campaign and concern studies · 2026-10-21

Source: OpenAI built-in `image_gen` (specific model version not returned, none inferred). Generated for this project, no third-party photographs. Use subject to applicable OpenAI output terms. These are editorial images, not customers or treatment outcomes. Each accepted on first attempt after visual inspection. Converted to WebP, quality 86, no retouching: campaign 1440×960, texture studies 960×640. Served with `next/image` and responsive sizes.

- `public/images/skin-campaign.webp` — 129,176 bytes. Prompt: “Use case: photorealistic-natural. Asset type: skincare brand website editorial campaign photograph, landscape 3:2. Two adult women standing shoulder to shoulder, framed close from shoulders to above the head, both given equal space and visual prominence: on the left a woman with deep dark brown skin and short natural textured hair, on the right a woman with very fair lightly freckled skin and brown hair pulled back. Relaxed, thoughtful expressions looking toward camera, faces slightly angled inward, no makeup, unretouched pores, real natural skin texture, small ordinary blemishes and fine lines. Both wear simple white cotton tops. Clean cool light-grey daylight studio, soft directional window light with gentle clear shadows. Quiet, bold, modern Swiss editorial photography for a skincare campaign. Close enough to see skin texture, both faces fully inside frame and comfortably separated. No product, no text, no logos, no border, no watermark, no before and after, no beauty airbrushing, no glossy plastic skin, no medical objects. Save image as a local file and return its path.”
- `public/images/water-study.webp` — 52,870 bytes. Prompt: “Photorealistic skincare editorial still life for a website concern tile, landscape 3:2. An extreme close-up of a shallow clear water pool on a cool white surface, one gentle concentric ripple catching daylight, a single solid cobalt curved ceramic edge in the top corner. Simple, tactile, crisp, airy asymmetric composition, large quiet spaces, soft hard-edged daylight shadow. Cool neutral white and a small cobalt accent only. No text, no logo, no bottles, no people, no plants, no gradients, no medical claims.”
- `public/images/gel-study.webp` — 31,744 bytes. Prompt: “Photorealistic skincare editorial still life for a website concern tile, landscape 3:2. Macro view of a thick translucent clear skincare gel swatch curving across a cool white ceramic tile, with a flat solid lilac tile slightly offset under it. Visible small natural bubbles, luminous clear gel and clean sharp reflections, natural daylight, generous space, a modern Swiss editorial composition. White and lilac, cool tones, no beige, no pink, no text, no logos, no bottles, no plants, no medical objects.”
- `public/images/cream-study.webp` — 52,756 bytes. Prompt: “Photorealistic skincare editorial still life for a website concern tile, landscape 3:2. One rich opaque white skincare cream swoosh with an expressive curved palette-knife ridge on a pale cool grey matte slab. A small flat cobalt rectangle is partly visible at the side. Beautiful tactile texture, clean daylight and deliberate soft shadows, asymmetric calm modern composition. No text, no logos, no packaging, no people, no plants, no beige, no pink, no gradients.”

Review: campaign includes equally prominent deep and fair skin, natural pores/freckles and ordinary skin variation. Studies preserve tangible gel, water and cream texture in cool daylight with restrained cobalt/lilac props. No labels or external brands, no medical imagery or outcome comparisons.
