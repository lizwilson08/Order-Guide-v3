import { type InputHTMLAttributes, forwardRef } from "react";
import styles from "./Input.module.css";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  /** When "inside", label is placed inside the same bordered container as the input (Figma-style). */
  labelPosition?: "outside" | "inside";
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, labelPosition = "outside", ...props }, ref) => {
    const inputId = id ?? `input-${Math.random().toString(36).slice(2, 9)}`;
    const isLabelInside = labelPosition === "inside" && label;

    if (isLabelInside) {
      return (
        <div className={styles.wrapperInside}>
          <label htmlFor={inputId} className={styles.labelInside}>
            {label}
          </label>
          <input
            ref={ref}
            id={inputId}
            className={`${styles.inputInside} ${error ? styles.inputError : ""} ${className}`.trim()}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />
          {error && (
            <span id={`${inputId}-error`} className={styles.error} role="alert">
              {error}
            </span>
          )}
        </div>
      );
    }

    return (
      <div className={styles.wrapper}>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`${styles.input} ${error ? styles.inputError : ""} ${className}`.trim()}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && (
          <span id={`${inputId}-error`} className={styles.error} role="alert">
            {error}
          </span>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";
