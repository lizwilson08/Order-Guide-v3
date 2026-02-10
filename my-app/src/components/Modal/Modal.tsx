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
}

export function Modal({
  open,
  onClose,
  children,
  variant = "partialTop",
  "aria-label": ariaLabel,
}: ModalProps) {
  if (!open) return null;

  return (
    <div
      className={styles.backdrop}
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
        <div className={styles.panelContent}>
          {children}
        </div>
      </div>
    </div>
  );
}
