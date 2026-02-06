import { type InputHTMLAttributes, forwardRef } from "react";
import styles from "./Checkbox.module.css";

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, id, className = "", ...props }, ref) => {
    const inputId =
      id ?? `checkbox-${Math.random().toString(36).slice(2, 9)}`;
    return (
      <label className={`${styles.wrapper} ${className}`.trim()}>
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          className={styles.input}
          {...props}
        />
        {label && <span className={styles.label}>{label}</span>}
      </label>
    );
  }
);
Checkbox.displayName = "Checkbox";
