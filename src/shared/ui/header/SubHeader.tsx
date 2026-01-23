"use client";

import IconArrowLeft from "@/shared/assets/icons/ArrowLeft.svg";
import { useHistory } from "@/shared/hooks/useHistory";

import { BaseHeader, type BaseHeaderProps } from "./BaseHeader";

interface SubHeaderProps extends Omit<BaseHeaderProps, "left"> {
  /**
   * 뒤로가기 버튼 클릭 핸들러
   * - 미지정 시 useHistory() 사용
   */
  onBack?: () => void;
  /**
   * 커스텀 좌측 요소 (지정 시 뒤로가기 버튼 대체)
   */
  left?: React.ReactNode;
}

export function SubHeader({ onBack, left, ...props }: SubHeaderProps) {
  const goBack = useHistory();
  const handleBack = onBack || goBack;

  const leftContent = left || (
    <button type="button" onClick={handleBack} aria-label="뒤로가기">
      <IconArrowLeft className="icon" />
    </button>
  );

  return <BaseHeader left={leftContent} {...props} />;
}
