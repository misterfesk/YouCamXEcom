import { describe, expect, it } from "vitest";
import { failureFromCode } from "@/lib/youcam/errors";

describe("failureFromCode", () => {
  it.each([
    ["error_src_face_too_small", "face_too_small"],
    ["error_src_face_out_of_bound", "face_out_of_frame"],
    ["error_lighting_dark", "too_dark"],
    ["error_face_angle_invalid", "face_angle"],
    ["error_below_min_image_size", "image_too_small"],
    ["error_no_face_detected", "no_face"],
    ["error_src_face_not_found", "no_face"],
    ["error_something_new", "unknown"],
  ])("maps %s to %s", (code, expected) => {
    expect(failureFromCode(code)).toEqual({ kind: "scan_error", code: expected });
  });

  it("falls back to unknown when there is no code", () => {
    expect(failureFromCode(undefined)).toEqual({ kind: "scan_error", code: "unknown" });
    expect(failureFromCode(null)).toEqual({ kind: "scan_error", code: "unknown" });
  });

  it.each(["error_insufficient_units", "insufficient_credit", "error_exceed_max_credit", "unit_exhausted"])(
    "treats %s as out of credits",
    (code) => {
      expect(failureFromCode(code)).toEqual({ kind: "out_of_credits" });
    },
  );

  it("treats HTTP 402 as out of credits", () => {
    expect(failureFromCode(undefined, 402)).toEqual({ kind: "out_of_credits" });
  });
});
