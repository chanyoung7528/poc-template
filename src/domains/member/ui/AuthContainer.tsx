import { forwardRef, ReactNode } from "react";
import styles from "./AuthContainer.module.scss";

interface AuthContainerProps {
  children: ReactNode;
  className?: string;
}

/**
 * Auth 페이지의 기본 컨테이너
 * - 배경 이미지 적용
 * - 전체 화면 레이아웃
 */
export const AuthContainer = forwardRef<HTMLDivElement, AuthContainerProps>(
  ({ children, className }, ref) => {
    return (
      <div ref={ref} className={`${styles.container} ${className || ""}`}>
        {children}
      </div>
    );
  }
);

AuthContainer.displayName = "AuthContainer";

