import type { ReactNode } from "react";
import type {
  ScanStep,
  ScanErrorCode,
  ScanUnavailableReason,
  SampleFaceId,
} from "./scan";
import type { SkinProfile } from "./skin";
import type { ProfileSummary } from "./storefront";
export type CameraChecks = {
  hasFace: boolean;
  position: boolean;
  frontal: boolean;
  lighting: boolean;
};
export type ScanSample = { id: SampleFaceId; label: string; detail: string };
export type ScanFlowProps = {
  step: ScanStep;
  consent: boolean;
  samples: ScanSample[];
  photo?: string;
  photoAlt?: string;
  result?: SkinProfile;
  summary?: ProfileSummary;
  checks: CameraChecks;
  countdown?: number;
  cameraSlot?: ReactNode;
  cameraReady?: boolean;
  analysisStage: number;
  error: ScanErrorCode;
  unavailableReason: ScanUnavailableReason;
  livePreview?: boolean;
  revisiting?: boolean;
  onConsentChange: (value: boolean) => void;
  onStepChange: (step: ScanStep) => void;
  onSelectSample: (id: SampleFaceId) => void;
  onUpload: (file: File) => void;
  onCapture: () => void;
  onUsePhoto: () => void;
  onContinue: (recommendations: boolean) => void;
  onClose: () => void;
};
