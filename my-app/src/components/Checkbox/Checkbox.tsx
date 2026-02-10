import { type InputHTMLAttributes, forwardRef } from "react";
import styles from "./Checkbox.module.css";

const CHECKBOX_EMPTY_SRC = "/images/icons/checkbox-empty.png?v=2";
const CHECKBOX_FILLED_SRC = "/images/icons/Checkbox-filled.png?v=2";

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
        <span className={styles.iconWrap} aria-hidden>
          <img src={CHECKBOX_EMPTY_SRC} alt="" className={styles.iconEmpty} />
          <img src={CHECKBOX_FILLED_SRC} alt="" className={styles.iconFilled} />
        </span>
        {label && <span className={styles.label}>{label}</span>}
      </label>
    );
  }
);
Checkbox.displayName = "Checkbox";
