import { z } from "zod";
import { FITZPATRICK_TYPES } from "@/types/skin";

const envelope = <T extends z.ZodType>(data: T) => z.object({ data });

export const fileCreateSchema = envelope(
  z.object({
    files: z
      .array(
        z.object({
          file_id: z.string().min(1),
          requests: z
            .array(
              z.object({
                method: z.string(),
                url: z.string().min(1),
                headers: z.record(z.string(), z.string()).nullish(),
              }),
            )
            .min(1),
        }),
      )
      .min(1),
  }),
);

export const taskCreateSchema = envelope(z.object({ task_id: z.string().min(1) }));

const maskUrls = z.array(z.string()).nullish();

export const skinOutputItemSchema = z.object({
  type: z.string(),
  raw_score: z.number().nullish(),
  ui_score: z.number().nullish(),
  score: z.number().nullish(),
  region: z.string().nullish(),
  skin_type: z.string().nullish(),
  mask_urls: maskUrls,
});

export const skinResultsSchema = z
  .object({ output: z.array(skinOutputItemSchema) })
  .transform(({ output }) =>
    output.map((item) => ({
      type: item.type,
      ...(item.raw_score != null ? { raw_score: item.raw_score } : {}),
      ...(item.ui_score != null ? { ui_score: item.ui_score } : {}),
      ...(item.score != null ? { score: item.score } : {}),
      ...(item.region ? { region: item.region } : {}),
      ...(item.skin_type ? { skin_type: item.skin_type } : {}),
      ...(item.mask_urls ? { mask_urls: item.mask_urls } : {}),
    })),
  );

export const fitzpatrickResultsSchema = z
  .object({ fitzpatrick_scale: z.enum(FITZPATRICK_TYPES) })
  .transform((r) => r.fitzpatrick_scale);

export const pollEnvelopeSchema = envelope(
  z.object({
    task_status: z.string(),
    error: z.string().nullish(),
    results: z.unknown().nullish(),
  }),
);

export const creditSchema = z.object({
  results: z.array(z.object({ amount_dec: z.coerce.number() })),
});

/** Loose shape of a non-2xx body; only the code is ever read. */
export const errorBodySchema = z
  .object({
    error: z.string().nullish(),
    error_code: z.string().nullish(),
    code: z.string().nullish(),
  })
  .partial();
