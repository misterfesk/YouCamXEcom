import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { BRAND_NAME } from "@/config/site";
import tokens from "@/styles/tokens.json";

export const alt = `${BRAND_NAME}: skincare with a reason`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function SocialImage() {
  const font = await readFile(join(process.cwd(), "src/styles/fonts/archivo-social.ttf"));
  const space = (key: Exclude<keyof typeof tokens.space, "$type">) => Number.parseFloat(tokens.space[key].$value);
  return new ImageResponse(
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%", height: "100%", padding: space("16"), background: tokens.color.brand.$value, color: tokens.color.bg.$value, fontFamily: "Archivo", fontWeight: 800 }}>
      <div style={{ display: "flex", fontSize: Number.parseFloat(tokens.typography.h3.$value.fontSize) }}>{BRAND_NAME}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: space("4") }}>
        <div style={{ fontSize: Number.parseFloat(tokens.typography.h1.$value.fontSize), lineHeight: 1 }}>Skincare with a reason.</div>
        <div style={{ display: "flex", fontSize: Number.parseFloat(tokens.typography.h3.$value.fontSize) }}>Your skin. Your shelf. The reason behind every match.</div>
      </div>
      <div style={{ display: "flex", fontSize: Number.parseFloat(tokens.typography.h3.$value.fontSize) }}>Explore a sample face · Find your starting point</div>
    </div>,
    { ...size, fonts: [{ name: "Archivo", data: font, style: "normal", weight: 800 }] },
  );
}
