/**
 * Feature: Member - Wellness ID 중복 체크
 *
 * 역할: 아이디 중복 체크 비즈니스 로직
 * - 모든 벨리데이션 통과 시 자동으로 중복 체크 실행
 * - true 반환 = 사용 가능, false 반환 = 중복 또는 오류
 */

import { toast } from "sonner";
import { useCheckLoginId } from "@/domains/member/model";

export function useWellnessIdDuplicateCheck() {
  const checkLoginId = useCheckLoginId();

  const checkDuplicate = async (loginId: string): Promise<boolean> => {
    if (!loginId || loginId.trim().length === 0) {
      return false;
    }

    try {
      const result = await checkLoginId.mutateAsync({ loginId });

      if (result.data.available) {
        toast.success(result.data.message || "사용 가능한 아이디입니다");
        return true; // 사용 가능
      } else {
        toast.error(result.data.message || "이미 사용 중인 아이디입니다");
        return false; // 중복
      }
    } catch (error) {
      console.error("아이디 중복 체크 실패:", error);
      toast.error("아이디 중복 체크 중 오류가 발생했습니다");
      return false; // 오류
    }
  };

  return {
    checkDuplicate,
    isLoading: checkLoginId.isPending,
  };
}
