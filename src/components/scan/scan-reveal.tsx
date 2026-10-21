"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { SkinProfile } from "@/types/skin";
import { SKIN_TYPE_LABEL, BAND_LABEL } from "@/types/skin";
import type { ProfileSummary } from "@/types/storefront";
import { GOAL_DEFS, type GoalId } from "@/types/goal";
import { FaceMap } from "./face-map";
import { SUN_NOTES } from "./scan-copy";
export function ScanReveal({
  result,
  summary,
  photo,
  photoAlt,
  onNavigate,
}: {
  result: SkinProfile;
  summary: ProfileSummary;
  photo?: string;
  photoAlt?: string;
  onNavigate?: () => void;
}) {
  const [activeGoal, setActiveGoal] = useState<GoalId>(summary.goals[0].goal);
  const masks = result.concerns.filter(
    (c) => GOAL_DEFS[activeGoal].concerns.includes(c.concern) && c.maskUrl,
  );
  const balanced = summary.goals.slice(0, 3).every((g) => g.band === "mild");
  return (
    <div className="reveal-content">
      <div className="scan-photo reveal-photo">
        {photo ? (
          <>
            <Image
              unoptimized
              src={photo}
              alt={photoAlt ?? "Sample face with a concern overlay"}
              width={1254}
              height={1254}
            />
            {masks.map((c) => (
              <span
                key={c.concern}
                aria-hidden="true"
                className="concern-overlay"
                style={{ maskImage: `url("${c.maskUrl}")` }}
              />
            ))}
          </>
        ) : (
          <FaceMap
            goal={activeGoal}
            label="Illustrated face map; your photo is no longer kept"
          />
        )}
        <span className="photo-caption type-small">
          {photo
            ? `Area guide · ${GOAL_DEFS[activeGoal].title}`
            : "Illustrated guide · your photo is no longer kept"}
        </span>
      </div>
      <p className="type-small text-text-muted">
        {photo
          ? "Recorded YouCam masks highlight the selected goal. Tap a goal below to change the area."
          : "This illustration shows the general area for each goal, not a measured map of your face."}
      </p>
      <div>
        <p className="type-label text-brand">
          {SKIN_TYPE_LABEL[result.skinType.whole.type]} skin
        </p>
        <h2 className="type-h2 mt-2">
          {balanced
            ? "Your skin looks balanced"
            : "A little focus goes a long way."}
        </h2>
        <p className="type-small text-text-muted mt-3">
          {balanced
            ? "Keep it that way with a comfortable everyday routine."
            : "Your three most pronounced goals lead the shelf. Higher scores mean a more visible concern."}
        </p>
      </div>
      <div className="goal-results" aria-label="Your top skin goals">
        {summary.goals.slice(0, 3).map((g) => (
          <button
            type="button"
            className="goal-result"
            key={g.goal}
            aria-pressed={g.goal === activeGoal}
            onClick={() => setActiveGoal(g.goal)}
          >
            <span>
              <strong>{GOAL_DEFS[g.goal].title}</strong>
              <span className="type-small">
                {BAND_LABEL[g.band]} · {Math.round(g.severity)}/100
              </span>
            </span>
            <span
              className="severity-track"
              data-band={g.band}
              aria-hidden="true"
            >
              <span style={{ width: `${g.severity}%` }} />
            </span>
          </button>
        ))}
      </div>
      <aside className="sun-note">
        <h3 className="type-h3">A note for sunny days</h3>
        <p>
          Fitzpatrick {result.fitzpatrick} · {SUN_NOTES[result.fitzpatrick]}
        </p>
        <p className="type-small">
          An image-based estimate, not a test of how your skin responds to sun.
          Shade and protective clothing matter too.
        </p>
      </aside>
      {result.concerns.some(
        (c) =>
          (c.concern === "acne" || c.concern === "redness") && c.severity >= 75,
      ) && (
        <p className="safety-note">
          If breakouts or redness persist or feel uncomfortable, a qualified
          clinician can help you choose your next steps.
        </p>
      )}
      <p className="type-small text-text-muted">
        Everyday guidance, not a diagnosis. Recorded sample scores; product
        matches are illustrative.
      </p>
      <Link
        className="scan-method-link text-brand underline"
        href="/how-we-recommend"
        onClick={onNavigate}
      >
        How we recommend
      </Link>
    </div>
  );
}
