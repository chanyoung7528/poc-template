/**
 * Widget: SignupWidget
 * 
 * 역할: 회원가입 페이지의 모든 Feature를 조립
 * - SignupFlow (Feature) 조립
 * - 페이지 레이아웃 관리
 */

'use client';

import { SignupFlow } from '@/features/auth/ui/SignupFlow';
import { AuthContainer } from '@/domains/auth/ui/AuthContainer';

export function SignupWidget() {
  return (
    <AuthContainer>
      <SignupFlow />
    </AuthContainer>
  );
}
