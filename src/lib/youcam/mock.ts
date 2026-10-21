import { SAMPLE_FACES, type SampleFaceId } from "@/types/scan";
import dryFitz from "../../../fixtures/youcam/fitzpatrick.dry.json";
import matureFitz from "../../../fixtures/youcam/fitzpatrick.mature.json";
import oilyFitz from "../../../fixtures/youcam/fitzpatrick.oily.json";
import dryScan from "../../../fixtures/youcam/skin-analysis.dry.json";
import tooSmall from "../../../fixtures/youcam/skin-analysis.error.face-too-small.json";
import tooDark from "../../../fixtures/youcam/skin-analysis.error.lighting-dark.json";
import matureScan from "../../../fixtures/youcam/skin-analysis.mature.json";
import oilyScan from "../../../fixtures/youcam/skin-analysis.oily.json";
import { getMockScenario, MOCK_SCENARIOS, type MockScenario } from "./config";
import { YouCamError, scanFailure } from "./errors";
import { interpretPoll } from "./poll";
import { fitzpatrickResultsSchema, skinResultsSchema } from "./schemas";
import type { YouCamClient } from "./types";

const SKIN: Record<SampleFaceId, unknown> = { oily: oilyScan, dry: dryScan, mature: matureScan };
const FITZ: Record<SampleFaceId, unknown> = { oily: oilyFitz, dry: dryFitz, mature: matureFitz };

/** How long the "slow" scenario stays pending. */
const SLOW_MS = 6_000;
const MOCK_BALANCE = 800;

type Env = Record<string, string | undefined>;

export interface MockClientOptions {
  now?: () => number;
  env?: Env;
}

const isFace = (value: string | undefined): value is SampleFaceId =>
  (SAMPLE_FACES as readonly string[]).includes(value ?? "");

/** Deterministic face per file id unless YOUCAM_MOCK_FACE pins one. */
function faceFor(fileId: string, env: Env): SampleFaceId {
  if (isFace(env.YOUCAM_MOCK_FACE)) return env.YOUCAM_MOCK_FACE;
  let hash = 0;
  for (const ch of fileId) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return SAMPLE_FACES[hash % SAMPLE_FACES.length];
}

/** Task ids carry everything the stateless poll needs: kind, face, scenario, start time. */
function parseTaskId(taskId: string) {
  const [prefix, kind, face, scenario, started] = taskId.split(".");
  if (
    prefix !== "mock" ||
    (kind !== "skin" && kind !== "fitz") ||
    !isFace(face) ||
    !(MOCK_SCENARIOS as readonly string[]).includes(scenario) ||
    !Number.isFinite(Number(started))
  ) {
    throw new YouCamError(scanFailure("unknown"), "Unknown mock task");
  }
  return { kind, face, scenario: scenario as MockScenario, started: Number(started) };
}

/** Serves the recorded fixtures through the same parsing path as live responses; needs no key. */
export function createMockClient({ now = Date.now, env = process.env }: MockClientOptions = {}): YouCamClient {
  const start = (kind: "skin" | "fitz", fileId: string) => {
    const scenario = getMockScenario(env);
    if (scenario === "unavailable") {
      throw new YouCamError({ kind: "out_of_credits" }, "Mock provider out of credits");
    }
    return `mock.${kind}.${faceFor(fileId, env)}.${scenario}.${now()}`;
  };

  const pending = (task: { scenario: MockScenario; started: number }) =>
    task.scenario === "slow" && now() - task.started < SLOW_MS;

  return {
    async createFile() {
      const fileId = `mock-${crypto.randomUUID()}`;
      return { fileId, upload: { url: "/api/scan/mock-upload", method: "PUT", headers: { "Content-Type": "image/jpeg" } } };
    },

    async startSkinAnalysis(fileId) {
      return start("skin", fileId);
    },

    async startFitzpatrick(fileId) {
      return start("fitz", fileId);
    },

    async pollSkinAnalysis(taskId) {
      const task = parseTaskId(taskId);
      if (pending(task)) return { status: "pending" };
      if (task.scenario === "face_too_small") return interpretPoll(tooSmall, skinResultsSchema);
      if (task.scenario === "too_dark") return interpretPoll(tooDark, skinResultsSchema);
      return interpretPoll(SKIN[task.face], skinResultsSchema);
    },

    async pollFitzpatrick(taskId) {
      const task = parseTaskId(taskId);
      if (pending(task)) return { status: "pending" };
      return interpretPoll(FITZ[task.face], fitzpatrickResultsSchema);
    },

    async getCreditBalance() {
      return MOCK_BALANCE;
    },
  };
}
