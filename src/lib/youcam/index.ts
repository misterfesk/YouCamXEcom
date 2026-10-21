import { createLiveClient } from "./client";
import { getYouCamMode } from "./config";
import { DEFAULT_API_BASE_URL } from "./constants";
import { assertServerOnly } from "./guard";
import { createMockClient } from "./mock";
import type { YouCamClient } from "./types";

assertServerOnly();

export class YouCamConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "YouCamConfigError";
  }
}

/** Live client when YOUCAM_MODE=live (key required), otherwise the fixture-backed mock. */
export function createYouCamClient(env: Record<string, string | undefined> = process.env): YouCamClient {
  if (getYouCamMode(env) === "mock") return createMockClient({ env });
  const apiKey = env.YOUCAM_API_KEY?.trim();
  if (!apiKey) throw new YouCamConfigError("YOUCAM_API_KEY is required when YOUCAM_MODE=live");
  return createLiveClient({ apiKey, baseUrl: env.YOUCAM_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL });
}

export { getYouCamMode, getMockScenario, MOCK_SCENARIOS } from "./config";
export type { MockScenario, YouCamMode } from "./config";
export { YouCamError, failureFromCode } from "./errors";
export type { YouCamFailure } from "./errors";
export { SCAN_COST_UNITS, MAX_UPLOAD_BYTES } from "./constants";
export type { TaskPoll } from "./poll";
export type { FileUpload, YouCamClient } from "./types";
