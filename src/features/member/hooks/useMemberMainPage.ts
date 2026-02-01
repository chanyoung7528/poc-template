/**
 * Hook: useMemberMainPage
 *
 * 역할: 회원 메인 페이지 로직
 * - 회원가입/로그인 라우팅
 */

import { useRouter } from "next/navigation";
import { useAuthAnimation } from "@/shared/hooks/animations";

export function useMemberMainPage() {
  const router = useRouter();

  // auth 페이지와 동일한 애니메이션
  const animationRefs = useAuthAnimation();

  const handleSignup = () => {
    router.push("/member/signup");
  };

  const handleLogin = () => {
    router.push("/member/login");
  };

  return {
    ...animationRefs,
    handleSignup,
    handleLogin,
  };
}
