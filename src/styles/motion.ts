import type { Transition } from "motion/react";
import tokens from "./tokens.json";

const seconds = (value: string) => Number.parseFloat(value) / 1000;
export const motionTokens = {
  ui: seconds(tokens.motion["duration-ui"].$value),
  enter: seconds(tokens.motion["duration-enter"].$value),
  ease: tokens.motion.easing.$value as [number, number, number, number],
};
export function uiTransition(reduced: boolean): Transition {
  return { duration: reduced ? 0 : motionTokens.ui, ease: motionTokens.ease };
}
export function enterPreset(reduced: boolean) {
  return {
    initial: reduced
      ? { opacity: 0 }
      : { opacity: 0, y: Number.parseFloat(tokens.space["4"].$value) },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0 },
    transition: { duration: motionTokens.enter, ease: motionTokens.ease },
  };
}
export function resortTransition(reduced: boolean, index = 0): Transition {
  const stagger = motionTokens.ui / 10;
  return {
    duration: reduced ? 0 : motionTokens.enter - stagger * 4,
    delay: reduced ? 0 : Math.min(index, 4) * stagger,
    ease: motionTokens.ease,
  };
}
export const reducedHighlight = { opacity: [0, 0.6, 0] };
