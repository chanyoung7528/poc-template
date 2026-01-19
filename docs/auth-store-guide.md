# Auth Store 사용 가이드

## 개요

Zustand를 이용한 중앙화된 인증 상태 관리 시스템입니다. 사용자의 인증 상태, 회원가입 진행 단계, Provider 정보를 관리합니다.

## 주요 기능

### 1. 인증 상태 관리

- 로그인/로그아웃 상태
- 사용자 정보 (ID, 이메일, 닉네임, 프로필 이미지)
- Provider 타입 (kakao, naver, apple, wellness)

### 2. 회원가입 진행 상태

- 단계별 상태 관리 (약관 동의, 본인인증, ID/PW 입력)
- 임시 세션 관리
- 본인인증 데이터 임시 저장

### 3. 세션 동기화

- 서버 세션과 클라이언트 Store 자동 동기화
- 새로고침 시에도 상태 유지 (localStorage persist)

## 사용 방법

### 기본 사용

```typescript
import { useAuthStore } from '@/store/authStore';

function MyComponent() {
  // 전체 상태 가져오기
  const { userId, provider, isAuthenticated } = useAuthStore();

  // 특정 액션만 가져오기
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);

  // ...
}
```

### 성능 최적화된 Selector 사용

```typescript
import { useAuthUser, useAuthStatus, useSignupProgress } from "@/store/authStore";

function ProfileComponent() {
  // 사용자 정보만 구독 (다른 상태 변경 시 리렌더링 안 됨)
  const { userId, email, nickname, profileImage } = useAuthUser();

  return <div>{nickname}</div>;
}

function StatusComponent() {
  // 인증 상태만 구독
  const { isAuthenticated, isTemp, provider } = useAuthStatus();

  return <div>{provider}로 로그인됨</div>;
}

function SignupProgressComponent() {
  // 회원가입 진행 상태만 구독
  const { signupStep, termsAgreed, verified } = useSignupProgress();

  return <div>현재 단계: {signupStep}</div>;
}
```

## 주요 액션

### 1. 회원가입 시작

```typescript
const startSignup = useAuthStore((state) => state.startSignup);

// 소셜 로그인 회원가입
startSignup('kakao'); // 또는 "naver", "apple"

// 일반 회원가입
startSignup('wellness');
```

### 2. 약관 동의

```typescript
const agreeToTerms = useAuthStore((state) => state.agreeToTerms);

// 약관 동의 완료
agreeToTerms();
// 자동으로 signupStep이 "verification"으로 변경됨
```

### 3. 본인인증 완료

```typescript
const completeVerification = useAuthStore(
  (state) => state.completeVerification
);

// 본인인증 완료
completeVerification({
  name: '홍길동',
  phone: '01012345678',
  birth: '19900101',
  gender: 'M',
});
// 자동으로 verified = true, signupStep이 변경됨
```

### 4. 회원가입 완료

```typescript
const completeSignup = useAuthStore((state) => state.completeSignup);

// 회원가입 완료 (DB 저장 후)
completeSignup('user-id-from-db');
// 자동으로 isTemp = false, isAuthenticated = true로 변경됨
```

### 5. 로그인

```typescript
const login = useAuthStore((state) => state.login);

// 로그인
login({
  userId: 'user-id',
  provider: 'kakao',
  email: 'user@example.com',
  nickname: '홍길동',
  profileImage: 'https://example.com/image.jpg',
});
```

### 6. 로그아웃

```typescript
const logout = useAuthStore((state) => state.logout);

// 로그아웃 (모든 상태 초기화)
logout();
```

## 회원가입 플로우 예시

### 소셜 로그인 회원가입

```typescript
// 1. 회원가입 페이지
const startSignup = useAuthStore((state) => state.startSignup);
startSignup('kakao');

// 2. 약관 동의 페이지
const agreeToTerms = useAuthStore((state) => state.agreeToTerms);
agreeToTerms();

// 3. 본인인증 페이지
const completeVerification = useAuthStore(
  (state) => state.completeVerification
);
completeVerification(certificationData);

// 4. API 호출 후 회원가입 완료
const completeSignup = useAuthStore((state) => state.completeSignup);
completeSignup(userId);
```

### Wellness ID 회원가입

```typescript
// 1. 회원가입 페이지
const startSignup = useAuthStore((state) => state.startSignup);
startSignup('wellness');

// 2. 약관 동의
agreeToTerms();

// 3. 본인인증
completeVerification(certificationData);
// signupStep이 자동으로 "credentials"로 변경됨

// 4. ID/PW 입력 페이지에서 회원가입 완료
completeSignup(userId);
```

## 조건부 렌더링 예시

```typescript
function MyPage() {
  const { isAuthenticated, isTemp, signupStep } = useAuthStore();

  // 로그인 안 된 경우
  if (!isAuthenticated && !isTemp) {
    return <LoginPrompt />;
  }

  // 회원가입 진행 중인 경우
  if (isTemp) {
    switch (signupStep) {
      case "terms":
        return <TermsAgreementPage />;
      case "verification":
        return <VerificationPage />;
      case "credentials":
        return <CredentialsPage />;
      default:
        return <SignupPage />;
    }
  }

  // 로그인 완료된 경우
  return <MainContent />;
}
```

## Provider별 분기 처리

```typescript
function ProfileImage() {
  const { provider, profileImage } = useAuthStore();

  // Provider에 따라 다른 UI 표시
  if (provider === "wellness") {
    return <DefaultAvatar />;
  }

  return <img src={profileImage} alt="Profile" />;
}
```

## 세션 동기화

Root Layout에 `AuthProvider`가 추가되어 있어 자동으로 세션 동기화가 이루어집니다.

```typescript
// src/app/layout.tsx
<QueryProvider>
  <AuthProvider>{children}</AuthProvider>
</QueryProvider>
```

페이지 로드 시 서버 세션을 확인하고 Store를 자동으로 업데이트합니다.

## 주의사항

1. **보안**: `verificationData`는 localStorage에 저장되지 않습니다 (persist partialize).
2. **동기화**: Store는 클라이언트 상태이므로, 중요한 인증 결정은 항상 서버 세션을 기준으로 해야 합니다.
3. **초기화**: 로그아웃 시 `logout()` 액션을 호출하여 모든 상태를 초기화해야 합니다.

## 디버깅

Store의 모든 액션에는 콘솔 로그가 포함되어 있어 디버깅이 쉽습니다.

```
🔄 [Auth Store] 세션 초기화: {...}
✅ [Auth Store] 로그인: {...}
🆕 [Auth Store] 회원가입 시작: kakao
📋 [Auth Store] 약관 동의 완료
✅ [Auth Store] 본인인증 완료: {...}
🎉 [Auth Store] 회원가입 완료: user-id
🚪 [Auth Store] 로그아웃
```
