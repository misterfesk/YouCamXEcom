export type YouCamMode = "live" | "mock";

export const MOCK_SCENARIOS = ["success", "face_too_small", "too_dark", "unavailable", "slow"] as const;
export type MockScenario = (typeof MOCK_SCENARIOS)[number];

type Env = Record<string, string | undefined>;

/** Anything other than an explicit "live" is mock, so a missing variable can never spend credits. */
export function getYouCamMode(env: Env = process.env): YouCamMode {
  return env.YOUCAM_MODE === "live" ? "live" : "mock";
}

export function getMockScenario(env: Env = process.env): MockScenario {
  const value = env.YOUCAM_MOCK_SCENARIO;
  return (MOCK_SCENARIOS as readonly string[]).includes(value ?? "") ? (value as MockScenario) : "success";
}
