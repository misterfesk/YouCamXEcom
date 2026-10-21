import type {
  ScanErrorCode,
  ScanUnavailableReason,
  ScanStep,
} from "@/types/scan";
import type { FitzpatrickType } from "@/types/skin";
export const SCAN_TITLES: Record<ScanStep, string> = {
  intro: "Find care for your skin",
  camera: "A little light. A clear view.",
  upload: "Choose your photo",
  samples: "Try a sample face",
  preview: "A moment to check",
  analyzing: "Getting to know this skin",
  reveal: "Your skin, a little clearer",
  error: "Let’s try that again",
  unavailable: "A little pause for the scanner",
};
export const SCAN_ERRORS: Record<
  ScanErrorCode,
  { title: string; fix: string }
> = {
  face_too_small: {
    title: "A little closer",
    fix: "Bring your face closer so it fills the frame. Keep your whole face visible.",
  },
  face_out_of_frame: {
    title: "Back in the frame",
    fix: "Center your whole face in the guide, including your forehead and chin.",
  },
  too_dark: {
    title: "Let a little daylight in",
    fix: "Face a window or a soft light. Avoid a bright light behind you.",
  },
  face_angle: {
    title: "Face forward",
    fix: "Look straight at the camera, with your head upright and your face relaxed.",
  },
  image_too_small: {
    title: "A clearer photo will help",
    fix: "Choose a photo at least 1080 pixels wide and high. Avoid cropped screenshots.",
  },
  image_too_large: {
    title: "A slightly smaller file",
    fix: "Choose a JPEG, PNG or WebP photo under 2.5 MB.",
  },
  no_face: {
    title: "We couldn’t find a face",
    fix: "Use a clear photo of one face, without a mask or anything covering it.",
  },
  camera_denied: {
    title: "Your camera is still private",
    fix: "Allow camera access in your browser to try again, or choose a photo instead.",
  },
  camera_unavailable: {
    title: "The camera couldn’t start",
    fix: "Close other apps using your camera and try again. You can also upload a photo.",
  },
  timeout: {
    title: "That took a little too long",
    fix: "The analysis did not finish. Try again with a clear photo, or explore a sample face.",
  },
  network: {
    title: "A small connection hiccup",
    fix: "Check your connection and try again. Your photo has not been saved.",
  },
  unknown: {
    title: "We couldn’t read this photo",
    fix: "Try another clear, front-facing photo in even light, or explore a sample face.",
  },
};
export const UNAVAILABLE_COPY: Record<ScanUnavailableReason, string> = {
  daily_cap:
    "Today’s live scans have reached their daily limit. A fresh set will be available later.",
  reserve_reached:
    "We’ve paused live scans to keep the scanner available for another day.",
  provider_out_of_credits:
    "Our scan service is taking a breather. Live analysis will return when it is available again.",
};
export const SUN_NOTES: Record<FitzpatrickType, string> = {
  I: "This estimate suggests very burn-prone skin. Keep sun protection a daily priority.",
  II: "This estimate suggests skin that burns easily. Keep sun protection a daily priority.",
  III: "This estimate suggests skin that can burn and gradually tan. A tan does not replace sun protection.",
  IV: "This estimate suggests skin that tans more readily but can still be affected by UV. Keep daily sun protection in your routine.",
  V: "This estimate suggests deeply pigmented skin. UV can still affect your skin; keep sun protection in your routine.",
  VI: "This estimate suggests very deeply pigmented skin. Natural pigmentation does not replace sun protection.",
};
export const ANALYSIS_STEPS = [
  "Reading skin type",
  "Looking at visible concerns",
  "Considering sun sensitivity",
  "Arranging the collection",
];
