"use client";

import IconSignMulti from "@/shared/assets/icons/SignMulti.svg";
import { useHistory } from "@/shared/hooks/useHistory";

import { BaseHeader, type BaseHeaderProps } from "./BaseHeader";

interface PopupHeaderProps extends Omit<BaseHeaderProps, "right"> {
  /**
   * 닫기 버튼 클릭 핸들러
   * - 미지정 시 useHistory() 사용
   */
  onClose?: () => void;
  /**
   * 커스텀 우측 요소 (지정 시 닫기 버튼 대체)
   */
  right?: React.ReactNode;
}

export function PopupHeader({ onClose, right, ...props }: PopupHeaderProps) {
  const goBack = useHistory();
  const handleClose = onClose || goBack;

  const rightContent = right || (
    <button type="button" onClick={handleClose} aria-label="닫기">
      <IconSignMulti className="icon" />
    </button>
  );

  return <BaseHeader right={rightContent} {...props} />;
}
