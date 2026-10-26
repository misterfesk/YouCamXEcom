"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useSkinStore } from "@/stores/skin";
import { useUiStore } from "@/stores/ui";
import { summarizeProfile } from "@/lib/skin/goals";
import { CAMERA_KIT_MOUNT_ID, type CameraSession } from "@/lib/scan/camera-kit";
import type { PreparedImage } from "@/lib/scan/prepare-image";
import type { CameraChecks, ScanSample } from "@/types/scan-view";
import type {
  SampleFaceId,
  ScanApiError,
  ScanErrorCode,
  ScanStep,
  ScanUnavailableReason,
} from "@/types/scan";
import type { SkinProfile } from "@/types/skin";

// The scan flow is the heaviest client module; load it off the critical path.
const loadScanFlow = () => import("@/components/scan/scan-flow");
const ScanModal = dynamic(() => loadScanFlow().then((m) => m.ScanModal), { ssr: false });

export const SAMPLES: ScanSample[] = [
  { id: "oily", label: "Breakouts & oil", detail: "Stood out: breakouts, oil & pores, dryness & texture" },
  { id: "dry", label: "Redness & dryness", detail: "Stood out: redness, dryness & texture, oil & pores" },
  { id: "mature", label: "Under-eyes & fine lines", detail: "Stood out: under-eyes, fine lines, oil & pores" },
];

const NO_CHECKS: CameraChecks = { hasFace: false, position: false, frontal: false, lighting: false };
/** Pace of the narrated steps while a sample "analyses" (its result is already recorded). */
const SAMPLE_STAGE_MS = 650;

type Photo = { url: string; source: "camera" | "upload" | "sample"; blob?: boolean };

export function ScanController({ demoMode }: { demoMode: boolean }) {
  const scan = useUiStore((s) => s.scan);
  useEffect(() => {
    const idle = window.requestIdleCallback ?? ((fn: () => void) => setTimeout(fn, 1500));
    idle(() => void loadScanFlow());
  }, []);
  // Every openScan() bumps the key: a fresh session, with state starting at its entry step.
  if (!scan.open) return null;
  return <ScanSession key={scan.key} demoMode={demoMode} />;
}

function ScanSession({ demoMode }: { demoMode: boolean }) {
  const router = useRouter();
  const scan = useUiStore((s) => s.scan);
  const closeScanUi = useUiStore((s) => s.closeScan);
  const notify = useUiStore((s) => s.notify);
  const setProfile = useSkinStore((s) => s.setProfile);
  const setRecommendations = useSkinStore((s) => s.setRecommendations);

  // Read once at open: "View my results" reopens the saved reveal.
  const [saved] = useState(() => {
    const { profile, sampleId } = useSkinStore.getState();
    return scan.entry === "reveal" && profile ? { profile, sampleId } : undefined;
  });
  const [revisiting, setRevisiting] = useState(!!saved);
  const [step, setStep] = useState<ScanStep>(
    saved ? "reveal" : scan.entry === "samples" ? "samples" : "intro",
  );
  const [consent, setConsent] = useState(false);
  const [photo, setPhoto] = useState<Photo | undefined>(
    saved?.sampleId ? { url: `/samples/${saved.sampleId}.jpg`, source: "sample" } : undefined,
  );
  const [prepared, setPrepared] = useState<PreparedImage>();
  const [result, setResult] = useState<{ profile: SkinProfile; sampleId?: SampleFaceId } | undefined>(saved);
  const [stage, setStage] = useState(0);
  const [error, setError] = useState<ScanErrorCode>("unknown");
  const [unavailable, setUnavailable] = useState<ScanUnavailableReason>("daily_cap");
  const [checks, setChecks] = useState<CameraChecks>(NO_CHECKS);
  const [cameraReady, setCameraReady] = useState(false);

  const job = useRef<AbortController | undefined>(undefined);
  const camera = useRef<CameraSession | undefined>(undefined);
  const blobUrl = useRef<string | undefined>(undefined);
  const imageOperation = useRef(0);

  const stopCamera = useCallback(() => {
    camera.current?.close();
    camera.current = undefined;
    setCameraReady(false);
    setChecks(NO_CHECKS);
  }, []);

  /** Cancels running work and forgets the photo (object URLs are revoked right away). */
  const reset = useCallback(() => {
    imageOperation.current++;
    job.current?.abort();
    job.current = undefined;
    stopCamera();
    if (blobUrl.current) URL.revokeObjectURL(blobUrl.current);
    blobUrl.current = undefined;
    setPhoto(undefined);
    setPrepared(undefined);
  }, [stopCamera]);

  useEffect(
    () => () => {
      imageOperation.current++;
      job.current?.abort();
      camera.current?.close();
      if (blobUrl.current) URL.revokeObjectURL(blobUrl.current);
    },
    [],
  );

  const fail = (failure: ScanApiError) => {
    if (failure.kind === "scan_unavailable") {
      setUnavailable(failure.reason);
      setStep("unavailable");
    } else {
      setError(failure.code);
      setStep("error");
    }
  };

  const showPhoto = (blob: Blob, source: "camera" | "upload") => {
    if (blobUrl.current) URL.revokeObjectURL(blobUrl.current);
    blobUrl.current = URL.createObjectURL(blob);
    setPhoto({ url: blobUrl.current, source, blob: true });
  };

  const acceptImage = async (input: Blob, source: "camera" | "upload") => {
    const operation = ++imageOperation.current;
    const { prepareImage, ImageCheckError } = await import("@/lib/scan/prepare-image");
    try {
      const image = await prepareImage(input, source);
      if (operation !== imageOperation.current) return;
      setPrepared(image);
      showPhoto(image.blob, source);
      setStep("preview");
    } catch (failure) {
      if (operation !== imageOperation.current) return;
      fail({
        kind: "scan_error",
        code: failure instanceof ImageCheckError ? failure.code : "unknown",
      });
    }
  };

  const startCamera = async (signal: AbortSignal) => {
    camera.current?.close();
    const mount = document.getElementById(CAMERA_KIT_MOUNT_ID);
    if (!mount) return;
    const { openCameraSession } = await import("@/lib/scan/camera-kit");
    try {
      const frame = mount.parentElement ?? mount;
      const session = await openCameraSession({
        signal,
        width: frame.clientWidth,
        height: frame.clientHeight || frame.clientWidth,
        onChecks: (value) => { if (!signal.aborted) setChecks(value); },
        onReady: () => { if (!signal.aborted) setCameraReady(true); },
        onCaptured: async (image) => {
          if (signal.aborted) return;
          const { toBlob } = await import("@/lib/scan/prepare-image");
          const blob = await toBlob(image);
          if (signal.aborted) return;
          stopCamera();
          await acceptImage(blob, "camera");
        },
        onError: (code) => {
          if (signal.aborted) return;
          stopCamera();
          fail({ kind: "scan_error", code });
        },
      });
      // The step may have changed while the kit was loading.
      if (!signal.aborted) camera.current = session;
      else session.close();
    } catch {
      if (!signal.aborted) fail({ kind: "scan_error", code: "camera_unavailable" });
    }
  };

  // The Camera Kit mounts into the camera step's slot once it is on screen.
  useEffect(() => {
    if (!scan.open || step !== "camera") return;
    const controller = new AbortController();
    // Subscribes to an external system (the Camera Kit); state only changes in its callbacks.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void startCamera(controller.signal);
    return () => {
      controller.abort();
      camera.current?.close();
      camera.current = undefined;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scan.open, step]);

  const analyzeSample = async (id: SampleFaceId) => {
    reset();
    setPhoto({ url: `/samples/${id}.jpg`, source: "sample" });
    setStage(0);
    setStep("analyzing");
    const controller = new AbortController();
    job.current = controller;
    const { sampleProfile } = await import("@/lib/skin/samples");
    for (const next of [1, 2, 3]) {
      await new Promise((resolve) => setTimeout(resolve, SAMPLE_STAGE_MS));
      if (controller.signal.aborted) return;
      setStage(next);
    }
    await new Promise((resolve) => setTimeout(resolve, SAMPLE_STAGE_MS));
    if (controller.signal.aborted) return;
    setResult({ profile: sampleProfile(id), sampleId: id });
    setStep("reveal");
  };

  const analyzePhoto = async () => {
    if (!prepared || !photo || photo.source === "sample") return;
    const controller = new AbortController();
    job.current = controller;
    setStage(0);
    setStep("analyzing");
    const { runLiveScan, ScanFailure } = await import("@/lib/scan/api");
    try {
      const live = await runLiveScan(prepared, photo.source, {
        signal: controller.signal,
        onStage: (s) => setStage(s === 0 ? 0 : 2),
      });
      if (controller.signal.aborted) return;
      setStage(3);
      setResult({ profile: live });
      setStep("reveal");
    } catch (failure) {
      if (controller.signal.aborted) return;
      fail(failure instanceof ScanFailure ? failure.error : { kind: "scan_error", code: "unknown" });
    }
  };

  const close = () => {
    reset();
    closeScanUi();
  };

  const onContinue = (enabled: boolean) => {
    if (result && !revisiting) setProfile(result.profile, result.sampleId);
    setRecommendations(enabled);
    if (!revisiting && result) notify(enabled ? "Your matches come first" : "Results saved. Matches are hidden");
    close();
    // A first scan from a landing page leads to For you; otherwise stay put.
    const from = scan.returnPath;
    if (enabled && !revisiting && (from === "/" || from.startsWith("/shop") || from.startsWith("/concerns")))
      router.push("/shop");
  };

  const summary = result ? summarizeProfile(result.profile) : undefined;
  const sampleLabel = SAMPLES.find((s) => photo?.url.includes(`/${s.id}.jpg`))?.label;
  return (
    <ScanModal
      open={scan.open}
      onOpenChange={(open) => {
        if (!open) close();
      }}
      step={step}
      consent={consent}
      samples={SAMPLES}
      photo={photo?.url}
      photoSource={photo?.source}
      photoAlt={
        photo?.source === "sample"
          ? `AI-generated sample face: ${sampleLabel}`
          : "Your photo, held only in this browser tab until you close the scan"
      }
      result={result?.profile}
      summary={summary}
      checks={checks}
      cameraSlot={<div id={CAMERA_KIT_MOUNT_ID} className="camera-kit-mount" />}
      cameraReady={cameraReady}
      analysisStage={stage}
      error={error}
      unavailableReason={unavailable}
      livePreview={demoMode}
      revisiting={revisiting}
      onConsentChange={setConsent}
      onStepChange={(next) => {
        if (next === "intro") {
          reset();
          setResult(undefined);
          setRevisiting(false);
          setConsent(false);
        }
        if (next === "upload" || next === "samples" || next === "camera") reset();
        setStep(next);
      }}
      onSelectSample={(id) => void analyzeSample(id)}
      onUpload={(file) => void acceptImage(file, "upload")}
      onCapture={async () => {
        const operation = imageOperation.current;
        const blob = await camera.current?.capture();
        if (operation !== imageOperation.current) return;
        if (!blob) return fail({ kind: "scan_error", code: "camera_unavailable" });
        stopCamera();
        await acceptImage(blob, "camera");
      }}
      onUsePhoto={() => void analyzePhoto()}
      onContinue={onContinue}
      onClose={close}
    />
  );
}
