import { forwardRef } from "react";
import styles from "./AuthCurveMask.module.scss";

interface AuthCurveMaskProps {
  maskId?: string;
  fillColor?: string;
  className?: string;
}

/**
 * SVG 곡선 마스크 컴포넌트
 * - 위로 파인 곡선(∪ 모양) 생성
 * - 다른 섹션에서도 재사용 가능
 */
export const AuthCurveMask = forwardRef<SVGSVGElement, AuthCurveMaskProps>(
  ({ maskId = "curveMask", fillColor = "#F7F3ED", className = "" }, ref) => {
    return (
      <svg
        ref={ref}
        className={`${styles.curveMask} ${className}`}
        viewBox="0 0 360 80"
        preserveAspectRatio="none"
      >
        <defs>
          <mask id={maskId}>
            <rect width="100%" height="100%" fill="white" />
            <path d="M0,0 L0,40 Q180,80 360,40 L360,0 Z" fill="black" />
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill={fillColor}
          mask={`url(#${maskId})`}
        />
      </svg>
    );
  }
);

AuthCurveMask.displayName = "AuthCurveMask";

