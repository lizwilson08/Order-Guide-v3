import { type ButtonHTMLAttributes, type ReactNode } from "react";
import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "small" | "medium" | "large";
export type ButtonShape = "pill" | "circle";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  loading?: boolean;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "medium",
  shape = "pill",
  loading = false,
  className = "",
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={`${styles.button} ${styles[variant]} ${styles[size]} ${shape === "circle" ? styles.circle : ""} ${loading ? styles.loading : ""} ${className}`.trim()}
      disabled={disabled ?? loading}
      aria-busy={loading}
      {...props}
    >
      {loading ? <span className={styles.spinner} aria-hidden /> : children}
    </button>
  );
}
