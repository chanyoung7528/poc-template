/**
 * Feature: Member - 본인인증 플로우
 * 
 * 역할: NICE/PASS 본인인증 처리
 * - PortOne 본인인증
 * - 본인인증 완료 후 콜백 처리
 */

import { useState, useCallback } from "react";
import { toast } from "sonner";

export function useCredentialsAuth() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  /**
   * PortOne PASS 본인인증 시작
   */
  const startPassAuth = useCallback(
    async (onSuccess: (transactionId: string) => void) => {
      setIsAuthenticating(true);

      try {
        // PortOne SDK 호출
        const IMP = window.IMP;
        if (!IMP) {
          throw new Error("PortOne SDK가 로드되지 않았습니다");
        }

        IMP.init(process.env.NEXT_PUBLIC_PORTONE_IMP_CODE!);

        IMP.certification(
          {
            merchant_uid: `mid_${new Date().getTime()}`,
            popup: false,
          },
          async (response: {
            success: boolean;
            imp_uid?: string;
            merchant_uid?: string;
            error_msg?: string;
          }) => {
            if (response.success && response.imp_uid) {
              // ✅ 본인인증 성공 → transactionId (imp_uid) 전달
              onSuccess(response.imp_uid);
            } else {
              toast.error(response.error_msg || "본인인증에 실패했습니다");
            }
            setIsAuthenticating(false);
          }
        );
      } catch (error) {
        toast.error("본인인증 시작에 실패했습니다");
        setIsAuthenticating(false);
      }
    },
    []
  );

  return {
    startPassAuth,
    isAuthenticating,
  };
}
