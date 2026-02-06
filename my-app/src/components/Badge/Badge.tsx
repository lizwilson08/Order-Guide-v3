import { type ReactNode } from "react";
import styles from "./Badge.module.css";

export type BadgeVariant = "default" | "primary" | "success" | "warning" | "error";

export interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

export function Badge({
  variant = "default",
  children,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`${styles.badge} ${styles[variant]} ${className}`.trim()}
    >
      {children}
    </span>
  );
}
