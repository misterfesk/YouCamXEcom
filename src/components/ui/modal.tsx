"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { useRef, type ReactNode } from "react";
import { Icon } from "@/components/icons/icon";
import { IconButton } from "./icon-button";
export type ModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  children: ReactNode;
  trigger?: ReactNode;
  footer?: ReactNode;
  onBack?: () => void;
};
export function DialogSurface({
  open,
  onOpenChange,
  title,
  description,
  children,
  trigger,
  footer,
  onBack,
  sheet = false,
}: ModalProps & { sheet?: boolean }) {
  const opener = useRef<HTMLElement | null>(null);
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content
          className="dialog-panel"
          data-sheet={sheet}
          onOpenAutoFocus={() => {
            opener.current =
              document.activeElement instanceof HTMLElement
                ? document.activeElement
                : null;
          }}
          onCloseAutoFocus={(event) => {
            if (!trigger && opener.current?.isConnected) {
              event.preventDefault();
              opener.current.focus();
            }
          }}
        >
          <div className="dialog-header">
            {onBack && (
              <IconButton label="Go back" onClick={onBack}>
                <Icon name="back" />
              </IconButton>
            )}
            <Dialog.Title className="type-h3 flex-1">{title}</Dialog.Title>
            <Dialog.Close asChild>
              <IconButton label={`Close ${title.toLowerCase()}`}>
                <Icon name="close" />
              </IconButton>
            </Dialog.Close>
          </div>
          <Dialog.Description className="type-small mb-6 text-text-muted">
            {description}
          </Dialog.Description>
          <div className="dialog-body">{children}</div>
          {footer && <div className="dialog-footer">{footer}</div>}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
export function Modal(props: ModalProps) {
  return <DialogSurface {...props} />;
}
