"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { ScanButton } from "@/components/ui/scan-button";
import type {
  ScanFlowProps,
  CameraChecks,
  ScanSample,
} from "@/types/scan-view";
import type { SampleFaceId } from "@/types/scan";
import {
  SCAN_TITLES,
  SCAN_ERRORS,
  UNAVAILABLE_COPY,
  ANALYSIS_STEPS,
} from "./scan-copy";
import { FaceMap } from "./face-map";
import { ScanReveal } from "./scan-reveal";
import { uiTransition } from "@/styles/motion";
export function SampleFaces({
  samples,
  onSelectSample,
}: {
  samples: ScanSample[];
  onSelectSample: (id: SampleFaceId) => void;
}) {
  return (
    <div className="scan-samples">
      {samples.map((sample) => (
        <div className="scan-sample" key={sample.id}>
          <Image
            src={`/samples/${sample.id}.jpg`}
            alt={`AI-generated sample face for ${sample.label.toLowerCase()}`}
            width={160}
            height={160}
          />
          <div>
            <h2 className="type-h3">{sample.label}</h2>
            <p className="type-small text-text-muted mb-3">{sample.detail}</p>
            <ScanButton
              aria-label={`Try ${sample.label.toLowerCase()} sample`}
              onClick={() => onSelectSample(sample.id)}
            >
              ✦ Try this face
            </ScanButton>
          </div>
        </div>
      ))}
      <p className="type-small text-text-muted">
        AI-generated faces with recorded YouCam results. They are not customers.
        No personal photo or live scan credits are used.
      </p>
    </div>
  );
}
export function CameraFrame({
  checks,
  countdown,
  cameraSlot,
  cameraReady,
  onCapture,
}: Pick<
  ScanFlowProps,
  "checks" | "countdown" | "cameraSlot" | "cameraReady" | "onCapture"
>) {
  const labels: Record<keyof CameraChecks, string> = {
    hasFace: "Face in frame",
    position: "Close enough",
    frontal: "Facing forward",
    lighting: "Even lighting",
  };
  return (
    <div className="scan-stack">
      <div className="camera-frame" aria-label="Camera capture area">
        {cameraSlot ?? (
          <div className="camera-placeholder">
            <FaceMap />
            <p className="type-small">
              Camera preview is not available in this demo.
            </p>
          </div>
        )}
        <div className="camera-guide" aria-hidden="true" />
        {countdown !== undefined && (
          <span
            className="camera-countdown type-h1"
            role="status"
            aria-label={`Capture in ${countdown}`}
          >
            {countdown}
          </span>
        )}
      </div>
      <ul className="camera-checks" aria-label="Live photo checks">
        {(Object.keys(labels) as (keyof CameraChecks)[]).map((key) => (
          <li key={key} data-ready={checks[key]}>
            <span aria-hidden="true">{checks[key] ? "✓" : "○"}</span>
            {labels[key]}
            <span className="sr-only">
              {checks[key] ? ", ready" : ", waiting"}
            </span>
          </li>
        ))}
      </ul>
      <p role="status" className="type-small text-text-muted">
        {cameraReady
          ? "Hold still for the countdown, or capture when you are ready."
          : "The camera is not available in this demo. Try a sample face to explore the complete result."}
      </p>
      <ScanButton fullWidth disabled={!cameraReady} onClick={onCapture}>
        ✦ Capture photo
      </ScanButton>
    </div>
  );
}
export function ScanFlow(props: ScanFlowProps) {
  const {
    step,
    consent,
    samples,
    photo,
    photoAlt,
    photoSource,
    result,
    summary,
    analysisStage,
    error,
    unavailableReason,
    livePreview,
    revisiting,
    onConsentChange,
    onStepChange,
    onSelectSample,
    onUpload,
    onUsePhoto,
    onContinue,
    onClose,
  } = props;
  const reduced = useReducedMotion();
  const heading = useRef<HTMLHeadingElement>(null);
  const lastStep = useRef(step);
  useEffect(() => {
    if (lastStep.current !== step) {
      lastStep.current = step;
      heading.current?.focus();
    }
  }, [step]);
  return (
    <div className="scan-stack">
      <h2 className="sr-only" ref={heading} tabIndex={-1}>
        {SCAN_TITLES[step]}
      </h2>
      {step === "intro" && (
        <>
          <div className="scan-intro-art">
            <FaceMap />
            <span className="type-label">Your skin. Your starting point.</span>
          </div>
          <p className="type-body-lg">
            A clearer picture of what your skin might need.
          </p>
          <p>
            Use a front-facing photo in soft, even light. Keep your face relaxed
            and remove anything covering it.
          </p>
          <p className="demo-banner type-small">
            Try the complete journey with a recorded sample. Live camera and
            photo analysis are not connected in this preview.
          </p>
          <label className="check-control">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => onConsentChange(e.target.checked)}
            />
            <span>I consent to photo analysis for skincare guidance.</span>
          </label>
          <p className="type-small text-text-muted">
            About 30 seconds for a live scan. Photos are held only during the
            scan, never saved. Guidance, not a medical diagnosis.
          </p>
          <div className="scan-actions">
            <ScanButton
              disabled={!consent}
              onClick={() => onStepChange("camera")}
            >
              ✦ Use camera
            </ScanButton>
            <ScanButton
              disabled={!consent}
              onClick={() => onStepChange("upload")}
            >
              ✦ Upload photo
            </ScanButton>
          </div>
          <Button variant="secondary" onClick={() => onStepChange("samples")}>
            Try with a sample face
          </Button>
          <Link
            href="/how-we-recommend"
            onClick={onClose}
            className="scan-method-link text-brand underline"
          >
            How we recommend
          </Link>
        </>
      )}
      {step === "camera" && (
        <>
          <CameraFrame {...props} />
          <Button variant="secondary" onClick={() => onStepChange("upload")}>
            Upload a photo instead
          </Button>
          <Button variant="ghost" onClick={() => onStepChange("samples")}>
            Try a sample face
          </Button>
        </>
      )}
      {step === "upload" && (
        <>
          <div className="scan-intro-art">
            <FaceMap />
          </div>
          <p>
            Choose a clear photo of one face, straight on, without a beauty
            filter. Even daylight helps.
          </p>
          <label className="upload-label">
            Choose a photo
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onUpload(file);
                e.target.value = "";
              }}
            />
          </label>
          <p className="type-small text-text-muted">
            JPEG, PNG or WebP · under 2.5 MB · at least 1080 × 1080. Your photo
            stays in browser memory and is cleared when you close this preview.
          </p>
          <Button variant="secondary" onClick={() => onStepChange("samples")}>
            Use a sample face instead
          </Button>
        </>
      )}
      {step === "samples" && (
        <SampleFaces samples={samples} onSelectSample={onSelectSample} />
      )}
      {step === "preview" && (
        <>
          {photo && (
            <div className="scan-photo">
              <Image
                unoptimized
                src={photo}
                alt={
                  photoAlt ?? "Your chosen photo, held only for this preview"
                }
                width={1254}
                height={1254}
              />
            </div>
          )}
          <p>
            Whole face in frame? Even light? This is the moment to choose
            another photo if you need to.
          </p>
          <p className="type-small text-text-muted">
            Live analysis is not connected. Your photo is never sent from this
            preview.
          </p>
          <ScanButton fullWidth onClick={onUsePhoto}>
            ✦ Use this photo
          </ScanButton>
          <Button
            variant="secondary"
            onClick={() =>
              onStepChange(photoSource === "camera" ? "camera" : "upload")
            }
          >
            {photoSource === "camera" ? "Retake photo" : "Choose another photo"}
          </Button>
        </>
      )}
      {step === "analyzing" && (
        <>
          <div className="scan-photo analyzing-photo">
            {photo && (
              <Image
                src={photo}
                alt={
                  photoAlt ??
                  "Sample face while its recorded analysis is revealed"
                }
                width={1254}
                height={1254}
              />
            )}
            <motion.span
              aria-hidden="true"
              className="scan-line"
              initial={{ opacity: 0 }}
              animate={
                reduced
                  ? { opacity: [0.3, 0.8, 0.3], y: 0 }
                  : { opacity: 1, y: ["0%", "8000%", "0%"] }
              }
              transition={{
                duration: 2.4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
          <p className="type-label text-brand">Replaying a recorded sample</p>
          <p role="status" aria-live="polite" className="type-h3">
            {ANALYSIS_STEPS[Math.min(analysisStage, 3)]}
          </p>
          <ol className="analysis-steps">
            {ANALYSIS_STEPS.map((label, i) => (
              <li key={label} data-current={i === analysisStage}>
                <span aria-hidden="true">
                  {i < analysisStage ? "✓" : String(i + 1).padStart(2, "0")}
                </span>
                {label}
              </li>
            ))}
          </ol>
          <p className="type-small text-text-muted">
            No live request is made. Your sample’s real YouCam results are
            already recorded.
          </p>
        </>
      )}
      {step === "reveal" && result && summary && (
        <motion.div
          className="scan-stack"
          initial={{ opacity: 0, y: reduced ? 0 : "var(--spacing-3)" }}
          animate={{ opacity: 1, y: 0 }}
          transition={uiTransition(!!reduced)}
        >
          <ScanReveal
            result={result}
            summary={summary}
            photo={photo}
            photoAlt={photoAlt}
            onNavigate={onClose}
          />
          <ScanButton fullWidth onClick={() => onContinue(true)}>
            ✦ Continue with recommendations
          </ScanButton>
          <Button variant="secondary" onClick={() => onContinue(false)}>
            Continue without recommendations
          </Button>
          {revisiting && (
            <ScanButton fullWidth onClick={() => onStepChange("intro")}>
              ✦ Rescan my skin
            </ScanButton>
          )}
        </motion.div>
      )}
      {step === "error" && (
        <>
          <div className="scan-intro-art">
            <FaceMap />
          </div>
          <h2 className="type-h2">{SCAN_ERRORS[error].title}</h2>
          <p>{SCAN_ERRORS[error].fix}</p>
          <div className="scan-actions">
            <ScanButton onClick={() => onStepChange("camera")}>
              ✦ Retake photo
            </ScanButton>
            <ScanButton onClick={() => onStepChange("upload")}>
              ✦ Upload another
            </ScanButton>
          </div>
          <Button variant="secondary" onClick={() => onStepChange("samples")}>
            Try a sample face
          </Button>
        </>
      )}
      {step === "unavailable" && (
        <>
          <div className="scan-intro-art">
            <FaceMap />
          </div>
          <h2 className="type-h2">Good care can start here.</h2>
          <p>
            {livePreview
              ? "Live analysis is not connected in this preview. You can explore the whole experience with a sample face and its recorded results."
              : UNAVAILABLE_COPY[unavailableReason]}
          </p>
          <ScanButton fullWidth onClick={() => onStepChange("samples")}>
            ✦ Try a sample face
          </ScanButton>
          <Button variant="secondary" onClick={onClose}>
            Come back later
          </Button>
          <p className="type-small text-text-muted">
            You can keep shopping without a scan. A sample uses no personal
            photo.
          </p>
        </>
      )}
    </div>
  );
}
export function ScanModal({
  open,
  onOpenChange,
  ...props
}: ScanFlowProps & { open: boolean; onOpenChange: (open: boolean) => void }) {
  const back =
    props.step === "intro" ||
    props.step === "analyzing" ||
    props.step === "reveal"
      ? undefined
      : () => props.onStepChange("intro");
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={SCAN_TITLES[props.step]}
      description={
        props.step === "reveal"
          ? "Everyday skincare guidance. Your routine stays your choice."
          : "A scan is optional. Close at any time to return to your page."
      }
      onBack={back}
    >
      <ScanFlow {...props} />
    </Modal>
  );
}
