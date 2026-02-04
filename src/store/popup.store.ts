/**
 * Shared: Popup 스토어
 */

import type { ReactNode } from "react";
import { create } from "zustand";

export type PopupDirection = "right" | "left";

export interface PopupOptions {
  /** 팝업 방향 */
  direction?: PopupDirection;
  /** 헤더 제목 */
  title?: ReactNode;
  /** 본문 컨텐츠 */
  content: ReactNode;
  /** 닫기 버튼 표시 여부 */
  showCloseButton?: boolean;
  /** 팝업 닫기 전 실행할 콜백 (앱 인터페이스 통신 등)
   * @returns false를 반환하면 닫기를 취소함
   */
  onBeforeClose?: () => boolean | void | Promise<boolean | void>;
}

interface PopupState extends PopupOptions {
  isOpen: boolean;
}

interface PopupActions {
  open: (options: PopupOptions) => void;
  close: () => void;
}

export const usePopupStore = create<PopupState & PopupActions>((set) => ({
  isOpen: false,
  direction: "right",
  content: null,
  showCloseButton: true,

  open: (options) =>
    set({
      isOpen: true,
      direction: options.direction ?? "right",
      title: options.title,
      content: options.content,
      showCloseButton: options.showCloseButton ?? true,
      onBeforeClose: options.onBeforeClose,
    }),

  close: () => set({ isOpen: false }),
}));
