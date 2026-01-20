import { forwardRef, ReactNode } from "react";
import styles from "./AuthButtonFrame.module.scss";

interface AuthButtonFrameProps {
  children: ReactNode;
}

export const AuthButtonFrame = forwardRef<HTMLDivElement, AuthButtonFrameProps>(
  ({ children }, ref) => {
    return (
      <div ref={ref} className={styles.buttonFrame}>
        {children}
      </div>
    );
  }
);

AuthButtonFrame.displayName = "AuthButtonFrame";

