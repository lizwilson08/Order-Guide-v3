import { type ReactNode } from "react";
import styles from "./Typography.module.css";

export type HeadingLevel = "h1" | "h2" | "h3";

export interface HeadingProps {
  as?: HeadingLevel;
  children: ReactNode;
  className?: string;
}

const headingClassMap = {
  h1: styles.h1,
  h2: styles.h2,
  h3: styles.h3,
};

export function Heading({ as = "h2", children, className = "" }: HeadingProps) {
  const Component = as;
  return (
    <Component className={`${headingClassMap[as]} ${className}`.trim()}>
      {children}
    </Component>
  );
}

export interface TextProps {
  children: ReactNode;
  className?: string;
}

export function Text({ children, className = "" }: TextProps) {
  return <p className={`${styles.body} ${className}`.trim()}>{children}</p>;
}

export function TextSm({ children, className = "" }: TextProps) {
  return <p className={`${styles.bodySm} ${className}`.trim()}>{children}</p>;
}

export function TextXs({ children, className = "" }: TextProps) {
  return <p className={`${styles.bodyXs} ${className}`.trim()}>{children}</p>;
}

export interface CaptionProps {
  children: ReactNode;
  className?: string;
}

export function Caption({ children, className = "" }: CaptionProps) {
  return (
    <span className={`${styles.caption} ${className}`.trim()}>{children}</span>
  );
}

export interface SmallProps {
  children: ReactNode;
  className?: string;
}

export function Small({ children, className = "" }: SmallProps) {
  return (
    <span className={`${styles.small} ${className}`.trim()}>{children}</span>
  );
}

export interface LabelProps {
  children: ReactNode;
  className?: string;
}

export function Label({ children, className = "" }: LabelProps) {
  return (
    <span className={`${styles.label} ${className}`.trim()}>{children}</span>
  );
}
