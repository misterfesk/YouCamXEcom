import type {
  ScanErrorCode,
  ScanUnavailableReason,
  ScanStep,
} from "@/types/scan";
import type { FitzpatrickType, SkinType } from "@/types/skin";
import type { GoalId } from "@/types/goal";
export const SCAN_TITLES: Record<ScanStep, string> = {
  intro: "See what your skin needs",
  camera: "Find soft, even light",
  upload: "Choose a photo",
  samples: "Try a sample face",
  preview: "Check your photo",
  analyzing: "Reading your skin",
  reveal: "Your skin results",
  error: "Let’s try that again",
  unavailable: "Live scans are paused",
};
export const SCAN_ERRORS: Record<
  ScanErrorCode,
  { title: string; fix: string }
> = {
  face_too_small: {
    title: "Come a bit closer",
    fix: "Bring your face closer so it fills the frame. Keep your whole face visible.",
  },
  face_out_of_frame: {
    title: "Back in the frame",
    fix: "Center your whole face in the guide, including your forehead and chin.",
  },
  too_dark: {
    title: "It’s a bit dark",
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
    title: "That file is too big",
    fix: "Choose a JPEG, PNG or WebP photo under 15 MB.",
  },
  no_face: {
    title: "We couldn’t find a face",
    fix: "Use a clear photo of one face, without a mask or anything covering it.",
  },
  camera_denied: {
    title: "Camera access is off",
    fix: "Allow camera access in your browser to try again, or choose a photo instead.",
  },
  camera_unavailable: {
    title: "The camera couldn’t start",
    fix: "Close other apps using your camera and try again. You can also upload a photo.",
  },
  timeout: {
    title: "That took too long",
    fix: "The analysis did not finish. Try again with a clear photo, or explore a sample face.",
  },
  network: {
    title: "Connection lost",
    fix: "Check your connection and try again. Your photo has not been saved.",
  },
  unknown: {
    title: "We couldn’t read this photo",
    fix: "Try another clear, front-facing photo in even light, or explore a sample face.",
  },
};
export const UNAVAILABLE_COPY: Record<ScanUnavailableReason, string> = {
  daily_cap:
    "Today’s live scans are used up. New ones open tomorrow.",
  reserve_reached:
    "We’ve paused live scans for today so the scanner stays available on other days.",
  provider_out_of_credits:
    "Our scan service is unavailable right now. Live scans will be back soon.",
};
/** One quiet line under the results: what the sun estimate changes on the shelf. */
export const SUN_NOTES: Record<FitzpatrickType, string> = {
  I: "Your skin tone likely burns very easily, so we bring high-SPF sunscreens forward too.",
  II: "Your skin tone likely burns easily, so we bring high-SPF sunscreens forward too.",
  III: "Your skin tone can burn before it tans, so daily sunscreens move forward too.",
  IV: "Sun can leave dark marks that linger on your skin tone, so daily sunscreens move forward too.",
  V: "Sun can leave dark marks that linger on your skin tone, so daily and tinted sunscreens move forward too.",
  VI: "Sun can leave dark marks that linger on your skin tone, so daily and tinted sunscreens move forward too.",
};

/** What a skin type means day to day, and what it changes in your picks. */
export const SKIN_TYPE_NOTES: Record<SkinType, string> = {
  oily: "Your skin makes extra oil, so lightweight, non-clogging textures come first.",
  dry: "Your skin holds less moisture, so richer, cushioning textures come first.",
  combination:
    "Oilier through the forehead and nose, drier on the cheeks, so balanced textures come first.",
  normal: "Neither very oily nor very dry, so most textures will feel comfortable.",
};

/** How each goal reads as a result: what stood out, in plain words. */
export const GOAL_FINDING: Record<GoalId, { name: string; seen: string }> = {
  breakouts: { name: "Breakouts", seen: "Spots and blemishes showed up in your photo." },
  "oil-pores": { name: "Oil & pores", seen: "Shine and enlarged-looking pores showed up." },
  calm: { name: "Redness", seen: "Areas of redness showed up across your skin." },
  hydrate: { name: "Dryness & texture", seen: "Skin looks dry or a little rough in places." },
  "even-tone": { name: "Uneven tone", seen: "Dark spots or a dull-looking tone showed up." },
  "under-eyes": { name: "Under-eyes", seen: "Shadows or puffiness showed up under your eyes." },
  "smooth-firm": { name: "Fine lines", seen: "Fine lines or softening skin showed up." },
};
export const ANALYSIS_STEPS = [
  "Reading skin type",
  "Looking at visible concerns",
  "Considering sun sensitivity",
  "Arranging the collection",
];
