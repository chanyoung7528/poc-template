import { cn } from "@/shared/utils/cn";
import type { ComponentProps, ReactNode } from "react";

import styles from "./Header.module.scss";

export interface BaseHeaderProps extends Omit<
  ComponentProps<"header">,
  "title"
> {
  left?: ReactNode;
  right?: ReactNode;
  title?: ReactNode;
  center?: ReactNode;
}

export function BaseHeader({
  left,
  right,
  title,
  center,
  className,
  ...props
}: BaseHeaderProps) {
  return (
    <header className={cn(styles.header, className)} {...props}>
      <div className={styles.left}>{left}</div>
      <div className={styles.center}>
        {center ? (
          center
        ) : typeof title === "string" ? (
          <h1 className={styles.title}>{title}</h1>
        ) : (
          title
        )}
      </div>
      <div className={styles.right}>{right}</div>
    </header>
  );
}
