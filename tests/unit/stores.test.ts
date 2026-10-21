import { beforeEach, describe, expect, it } from "vitest";
import { bagCount, useBagStore } from "@/stores/bag";
import { useSkinStore } from "@/stores/skin";
import { sampleProfile } from "@/lib/skin/samples";

describe("bag store", () => {
  beforeEach(() => useBagStore.getState().clear());
  it("adds, sets quantity (min 1), removes and counts", () => {
    const bag = useBagStore.getState();
    bag.add("a");
    bag.add("a");
    bag.add("b", 3);
    expect(useBagStore.getState().lines).toEqual({ a: 2, b: 3 });
    bag.setQuantity("a", 0);
    expect(useBagStore.getState().lines.a).toBe(1);
    bag.remove("b");
    expect(bagCount(useBagStore.getState().lines)).toBe(1);
  });
});

describe("skin store", () => {
  beforeEach(() => useSkinStore.getState().clear());
  it("a new profile resets the chosen focus; clear forgets everything", () => {
    const skin = useSkinStore.getState();
    skin.setFocus(["calm", "hydrate", "breakouts"]);
    skin.setProfile(sampleProfile("oily"), "oily");
    expect(useSkinStore.getState()).toMatchObject({ sampleId: "oily", focus: undefined });
    skin.setRecommendations(false);
    skin.clear();
    expect(useSkinStore.getState()).toMatchObject({ profile: undefined, recommendations: true });
  });
});
