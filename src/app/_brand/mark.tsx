import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import tokens from "@/styles/tokens.json";

/** The site icon: the wordmark's first letter in brackets, white on cobalt. */
export async function brandMark(side: number) {
  const font = await readFile(join(process.cwd(), "src/styles/fonts/archivo-social.ttf"));
  return new ImageResponse(
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", background: tokens.color.brand.$value, color: tokens.color.bg.$value, fontFamily: "Archivo", fontWeight: 800, fontSize: Math.round(side * 0.44), letterSpacing: -Math.round(side * 0.02) }}>
      [B]
    </div>,
    { width: side, height: side, fonts: [{ name: "Archivo", data: font, style: "normal", weight: 800 }] },
  );
}
