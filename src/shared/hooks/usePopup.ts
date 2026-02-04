/**
 * Shared: Popup 훅
 *
 * 스토어 기반 팝업 관리 + nuqs URL 히스토리 연동
 * React Compiler가 자동으로 메모이제이션 처리
 */

"use client";

import { type PopupOptions, usePopupStore } from "@/store/popup.store";
import { useQueryState } from "nuqs";
import { useEffect } from "react";

export function usePopup() {
  const store = usePopupStore();
  const [popupParam, setPopupParam] = useQueryState("popup", {
    defaultValue: "",
    shallow: true,
  });

  // URL 쿼리와 스토어 상태 동기화
  useEffect(() => {
    if (popupParam === "1" && !store.isOpen) {
      // URL에 popup=1이 있는데 스토어는 닫혀있으면 무시 (직접 URL 조작 방지)
      setPopupParam(null);
    } else if (popupParam !== "1" && store.isOpen) {
      // 스토어는 열려있는데 URL에 popup=1이 없으면 닫기 (뒤로가기)
      store.close();
    }
  }, [popupParam, store, setPopupParam]);

  const open = (options: PopupOptions) => {
    store.open(options);
    // 팝업 열 때 URL에 popup=1 추가 (히스토리 추가)
    setPopupParam("1");
  };

  const close = async () => {
    // onBeforeClose 콜백 실행 (앱 인터페이스 통신)
    if (store.onBeforeClose) {
      try {
        const result = await store.onBeforeClose();
        // false를 반환하면 닫기 취소
        if (result === false) {
          return false;
        }
      } catch (error) {
        console.error("Popup onBeforeClose error:", error);
        // 에러 발생 시에도 닫기 취소
        return false;
      }
    }

    // URL에서 popup 파라미터 제거 (히스토리 백)
    await setPopupParam(null);
    // 스토어 상태 업데이트
    store.close();
    return true;
  };

  return {
    open,
    close,
  };
}
