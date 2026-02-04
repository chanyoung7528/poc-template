/**
 * Shared: Popup Provider
 *
 * 전역 팝업 제공
 */

"use client";

import { usePopup } from "@/shared/hooks/usePopup";
import { usePopupStore } from "@/store/popup.store";
import { Popup } from "@/shared/ui/popup/Popup";

export function PopupProvider() {
  const { isOpen, direction, title, content, showCloseButton } =
    usePopupStore();
  const { close } = usePopup();

  const handleClose = async () => {
    await close();
  };

  return (
    <Popup
      isOpen={isOpen}
      onClose={handleClose}
      direction={direction ?? "right"}
      title={title}
      content={content}
      showCloseButton={showCloseButton ?? true}
    />
  );
}
