import { forwardRef, ReactNode } from "react";
import styles from "./AuthCurveSection.module.scss";

interface AuthCurveSectionProps {
  children: ReactNode;
}

export const AuthCurveSection = forwardRef<
  HTMLElement,
  AuthCurveSectionProps
>(({ children }, ref) => {
  return (
    <section ref={ref} className={styles.section}>
      {/* SVG 곡선 배경 - 위로 파인 곡선 (∪ 모양) */}
      <svg
        className={styles.curveMask}
        viewBox="0 0 360 80"
        preserveAspectRatio="none"
      >
        <defs>
          <mask id="curveMask">
            <rect width="100%" height="100%" fill="white" />
            <path d="M0,0 L0,40 Q180,80 360,40 L360,0 Z" fill="black" />
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="#F7F3ED"
          mask="url(#curveMask)"
        />
      </svg>

      <div className={styles.content}>{children}</div>
    </section>
  );
});

AuthCurveSection.displayName = "AuthCurveSection";

