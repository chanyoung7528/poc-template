/**
 * Widget: LoginWidget
 * 
 * 역할: 로그인 페이지의 모든 Feature를 조립
 * - LoginFlow (Feature) 조립
 * - 페이지 레이아웃 관리
 * - 네비게이션 로직
 */

'use client';

import { LoginFlow } from '@/features/auth/ui/LoginFlow';
import { AuthContainer } from '@/domains/auth/ui/AuthContainer';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';

export function LoginWidget() {
  const router = useRouter();

  const handleNavigateToSignup = () => {
    router.push('/signup' as Route);
  };

  return (
    <AuthContainer>
      <LoginFlow onNavigateToSignup={handleNavigateToSignup} />
    </AuthContainer>
  );
}
