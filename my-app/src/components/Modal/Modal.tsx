import { type ReactNode } from "react";
import styles from "./Modal.module.css";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** "partialTop" = center-top, 664px width; "fullPage" = fills viewport */
  variant?: "partialTop" | "center" | "fullPage";
  /** Optional aria label for the dialog */
  "aria-label"?: string;
  /** Optional z-index for stacking (e.g. 1100 for modal above another modal) */
  zIndex?: number;
}

export function Modal({
  open,
  onClose,
  children,
  variant = "partialTop",
  "aria-label": ariaLabel,
  zIndex,
}: ModalProps) {
  if (!open) return null;

  const layerStyle = zIndex != null ? { zIndex } : undefined;

  return (
    <div
      className={`${styles.backdrop} ${variant === "fullPage" ? styles.backdropFullPage : ""}`}
      style={layerStyle}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="presentation"
    >
      <div
        className={`${styles.panel} ${variant === "partialTop" ? styles.partialTop : ""} ${variant === "fullPage" ? styles.fullPage : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`${styles.panelContent} ${variant === "fullPage" ? styles.panelContentFullPage : ""}`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
