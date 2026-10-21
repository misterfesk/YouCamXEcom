import { Archivo, Bodoni_Moda } from "next/font/google";

export const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
  variable: "--font-archivo",
  fallback: ["Helvetica Neue", "Arial", "sans-serif"],
});
export const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  display: "swap",
  variable: "--font-bodoni",
  adjustFontFallback: false,
});
