"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { SkinProfile } from "@/types/skin";
import { SKIN_TYPE_LABEL, BAND_LABEL, BANDS } from "@/types/skin";
import type { ProfileSummary } from "@/types/storefront";
import { GOAL_DEFS, type GoalId } from "@/types/goal";
import { FaceMap } from "./face-map";
import { GOAL_FINDING, SKIN_TYPE_NOTES, SUN_NOTES } from "./scan-copy";
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
  const top = summary.goals.slice(0, 3);
  const balanced = top.every((g) => g.band === "mild");
  const skinType = result.skinType.whole.type;
  return (
    <div className="reveal-content">
      <div>
        <p className="type-label text-text-muted">Your skin type</p>
        <h2 className="type-h2 mt-2">{SKIN_TYPE_LABEL[skinType]} skin</h2>
        <p className="mt-2">{SKIN_TYPE_NOTES[skinType]}</p>
      </div>
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
            ? `Highlighted: ${GOAL_FINDING[activeGoal].name.toLowerCase()}`
            : "General area · your photo is no longer kept"}
        </span>
      </div>
      <div>
        <h3 className="type-h3">
          {balanced ? "Nothing stood out strongly" : "What stood out"}
        </h3>
        <p className="type-small text-text-muted mt-1">
          {balanced
            ? "Your skin looks balanced. These were the most visible, and only slightly."
            : photo
              ? "Most visible first. Tap one to see where it showed up."
              : "Most visible first."}
        </p>
      </div>
      <div className="goal-results" aria-label="What stood out in your scan">
        {top.map((g) => (
          <button
            type="button"
            className="goal-result"
            key={g.goal}
            aria-pressed={g.goal === activeGoal}
            onClick={() => setActiveGoal(g.goal)}
          >
            <span className="goal-result-head">
              <strong>{GOAL_FINDING[g.goal].name}</strong>
              <span className="goal-result-level type-small">
                <span className="level-dots" aria-hidden="true">
                  {BANDS.map((band, i) => (
                    <span
                      key={band}
                      data-on={i <= BANDS.indexOf(g.band)}
                    />
                  ))}
                </span>
                {BAND_LABEL[g.band]}
              </span>
            </span>
            <span className="type-small text-text-muted">
              {GOAL_FINDING[g.goal].seen}
            </span>
          </button>
        ))}
      </div>
      <p className="reveal-next">
        {balanced
          ? "Your shop now opens with easy everyday basics, and flags anything that may not suit your skin."
          : "Your shop now opens with products for these, and flags anything that may not suit your skin."}
      </p>
      <p className="type-small text-text-muted">
        <strong>Sun tip:</strong> {SUN_NOTES[result.fitzpatrick]}
      </p>
      {summary.dermatologist && (
        <p className="type-small text-text-muted">
          If breakouts or redness keep coming back or feel sore, a
          dermatologist can help alongside your routine.
        </p>
      )}
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
