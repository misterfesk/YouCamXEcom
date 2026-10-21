"use client";
import { DialogSurface, type ModalProps } from "./modal";
export function BottomSheet(props: ModalProps) {
  return <DialogSurface {...props} sheet />;
}
