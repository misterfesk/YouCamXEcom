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
        AI-generated faces with their real, recorded YouCam results. No photo
        of you is needed.
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
      <div
        className="camera-frame"
        role="group"
        aria-label="Camera capture area"
      >
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
  const stack = useRef<HTMLDivElement>(null);
  const lastStep = useRef(step);
  useEffect(() => {
    if (lastStep.current !== step) {
      lastStep.current = step;
      const title = stack.current
        ?.closest('[role="dialog"]')
        ?.querySelector<HTMLElement>("h2");
      title?.setAttribute("tabindex", "-1");
      title?.focus();
    }
  }, [step]);
  return (
    <div className="scan-stack" ref={stack}>
      {step === "intro" && (
        <>
          <div className="scan-intro-art">
            <FaceMap />
            <span className="type-label">One selfie · about 30 seconds</span>
          </div>
          <p className="type-body-lg">
            Find out your skin type and what stands out most, then see the
            products that suit you first.
          </p>
          <p>
            Face the camera in soft, even light, with your hair back and
            nothing covering your face.
          </p>
          {livePreview && (
            <p className="demo-banner type-small">
              Demo mode: live analysis is not connected here, so any photo
              returns a recorded sample’s results.
            </p>
          )}
          <label className="check-control">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => onConsentChange(e.target.checked)}
            />
            <span>I agree to have my photo analyzed for skincare picks.</span>
          </label>
          <p className="type-small text-text-muted">
            Your photo is used for this scan only and never saved. Results are
            skincare guidance, not a medical diagnosis.
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
            Pick a clear, front-facing photo of just you, without a beauty
            filter. Daylight works best.
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
            JPEG, PNG or WebP · under 15 MB · at least 1080 × 1080. Only a
            resized copy is analyzed, and it is never stored.
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
            Is your whole face in view, in even light? If not, choose another
            photo for better results.
          </p>
          <p className="type-small text-text-muted">
            {livePreview
              ? "Demo mode: this photo stays in your browser and gets a recorded sample’s results."
              : "Your photo goes to our analysis partner, YouCam, for this scan only. We keep the results, never the photo."}
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
                  ? { opacity: 0.6, y: 0 }
                  : { opacity: 1, y: ["0%", "8000%", "0%"] }
              }
              transition={
                reduced
                  ? { duration: 0 }
                  : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
              }
            />
          </div>
          <p className="type-label text-brand">
            {photoSource === "sample" ? "Showing a recorded sample" : "Analyzing your photo"}
          </p>
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
            {photoSource === "sample"
              ? "These are the sample’s real YouCam results, recorded earlier."
              : "This takes a few seconds. Keep this window open."}
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
            ✦ See my matches
          </ScanButton>
          <Button variant="secondary" onClick={() => onContinue(false)}>
            Browse the full shop
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
          <h2 className="type-h2">Try a sample in the meantime</h2>
          <p>
            {UNAVAILABLE_COPY[unavailableReason]}
          </p>
          <ScanButton fullWidth onClick={() => onStepChange("samples")}>
            ✦ Try a sample face
          </ScanButton>
          <Button variant="secondary" onClick={onClose}>
            Keep shopping
          </Button>
          <p className="type-small text-text-muted">
            A sample shows the full results and matches, with no photo of you
            needed.
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
          ? "Based on your photo. A guide for choosing skincare, not a diagnosis."
          : "Close at any time to go back to your page."
      }
      onBack={back}
    >
      <ScanFlow {...props} />
    </Modal>
  );
}
