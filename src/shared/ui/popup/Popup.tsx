/**
 * Shared: Popup 컴포넌트
 *
 * 전역 포탈로 사용되는 전체화면 팝업 UI
 */

"use client";

import { Dialog } from "@base-ui/react/dialog";
import type { PopupDirection } from "@/store/popup.store";
import type { ReactNode } from "react";

import styles from "./Popup.module.scss";
import { ArrowLeftIcon } from "../icon/ArrowLeftIcon";

interface PopupProps {
  isOpen: boolean;
  onClose: () => void;
  direction: PopupDirection;
  title?: ReactNode;
  content: ReactNode;
  showCloseButton: boolean;
}

export function Popup({
  isOpen,
  onClose,
  direction,
  title,
  content,
  showCloseButton,
}: PopupProps) {
  const handleClose = async (open: boolean) => {
    // 열림 상태로 변경되는 경우는 무시
    if (open) return;

    // onClose는 usePopup의 close를 호출하며,
    // 내부적으로 onBeforeClose 실행 후 스토어/URL 업데이트
    // false를 반환하면 닫기가 취소됨
    await onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Backdrop className={styles.backdrop} />
        <Dialog.Popup className={`${styles.popup} ${styles[direction]}`}>
          {/* 헤더 */}
          <div className={styles.header}>
            {showCloseButton && (
              <Dialog.Close className={styles.backButton} aria-label="뒤로가기">
                <ArrowLeftIcon className={styles.backIcon} />
              </Dialog.Close>
            )}
            {title && (
              <Dialog.Title className={styles.title}>{title}</Dialog.Title>
            )}
          </div>

          {/* 본문 */}
          <div className={styles.content}>{content}</div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
