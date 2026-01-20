import { forwardRef } from "react";
import styles from "./AuthWellnessTitle.module.scss";

interface AuthWellnessTitleProps {
  title: string;
  subtitle: string;
}

export const AuthWellnessTitle = forwardRef<
  HTMLDivElement,
  AuthWellnessTitleProps
>(({ title, subtitle }, ref) => {
  return (
    <div ref={ref} className={styles.titleFrame}>
      <h2 className={styles.wellnessTitle}>{title}</h2>
      <p className={styles.wellnessSubtitle}>{subtitle}</p>
    </div>
  );
});

AuthWellnessTitle.displayName = "AuthWellnessTitle";

