import type { z } from "zod";
import { YouCamError, failureFromCode, scanFailure, type YouCamFailure } from "./errors";
import { pollEnvelopeSchema } from "./schemas";

export type TaskPoll<T> =
  | { status: "pending" }
  | { status: "success"; result: T }
  | { status: "error"; failure: YouCamFailure };

/** Turns a raw task-poll body into pending / success / error. Task errors arrive as HTTP 200. */
export function interpretPoll<T>(raw: unknown, results: z.ZodType<T>): TaskPoll<T> {
  const envelope = pollEnvelopeSchema.safeParse(raw);
  if (!envelope.success) {
    throw new YouCamError(scanFailure("unknown"), "Unexpected task response");
  }
  const { task_status, error, results: payload } = envelope.data.data;
  if (task_status === "success") {
    const parsed = results.safeParse(payload);
    if (!parsed.success) throw new YouCamError(scanFailure("unknown"), "Unexpected task results");
    return { status: "success", result: parsed.data };
  }
  if (task_status === "error") return { status: "error", failure: failureFromCode(error) };
  return { status: "pending" };
}
