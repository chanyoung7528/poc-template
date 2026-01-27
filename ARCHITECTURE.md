# 📘 프로젝트 아키텍처 가이드

> **Next.js + FSD(Feature-Sliced Design) + DDD(Domain-Driven Design) 기반 엔터프라이즈 아키텍처**

---

## 📋 목차

1. [핵심 원칙](#-핵심-원칙)
2. [Domains vs Features 구분 기준](#-domains-vs-features-구분-기준)
3. [전체 폴더 구조](#-전체-폴더-구조)
4. [레이어별 상세 설명](#-레이어별-상세-설명)
5. [실전 예시](#-실전-예시)
6. [개발 가이드](#-개발-가이드)
7. [인증 시스템 구조](#-인증-시스템-구조)

---

## 🎯 핵심 원칙

### 1. **Domains = 무엇 (What)**
- **비즈니스 엔티티 중심** (User, Auth, Product, Order)
- **서버 데이터와 1:1 매핑**
- **재사용 가능한 순수 로직**
- **여러 Feature에서 사용**

### 2. **Features = 어떻게 (How)**
- **사용자 행동/시나리오 중심** (로그인, 회원가입, 결제)
- **여러 Domain을 조합**
- **화면/플로우 종속**
- **비즈니스 규칙 포함**

### 3. **Shared = 범용**
- **프로젝트 전역 공통**
- **도메인에 종속되지 않음**
- **Button, Input 등 UI 컴포넌트**
- **useDebounce 등 범용 Hook**

### 4. **Core = 인프라**
- **핵심 기반 시설**
- **API 클라이언트, 환경 변수, 상수**
- **React Query 설정**

---

## 🔍 Domains vs Features 구분 기준

### ✅ Domains에 속하는 경우

```typescript
// ✓ 특정 엔티티의 데이터 정의
domains/auth/model/auth.types.ts
export interface User { ... }

// ✓ API 호출 함수 (순수)
domains/auth/model/auth.api.ts
export const authApi = {
  checkUserStatus: (id) => apiClient.post('/api/auth/check-user-status', { id })
}

// ✓ React Query Hook (데이터만)
domains/auth/model/auth.queries.ts
export function useCheckUserStatus() {
  return useMutation({ mutationFn: authApi.checkUserStatus })
}

// ✓ 재사용 가능한 UI
domains/auth/ui/LoginForm.tsx
export function LoginForm({ onSubmit }) { ... }
```

**판단 기준:**
- [ ] 특정 비즈니스 엔티티를 다루는가?
- [ ] 다른 화면에서도 재사용 가능한가?
- [ ] 비즈니스 규칙이 없는가?
- [ ] 라우팅을 포함하지 않는가?

### ✅ Features에 속하는 경우

```typescript
// ✓ 비즈니스 로직 + 플로우
features/auth/hooks/useGeneralSignupFlow.ts
export function useGeneralSignupFlow() {
  const router = useRouter(); // 라우팅
  const checkStatus = useCheckUserStatus(); // ← Domain hook 사용
  
  const handleVerificationComplete = async (id) => {
    const result = await checkStatus.mutateAsync(id);
    
    // ✓ 비즈니스 규칙
    if (result.status === 'NEW_USER') {
      router.push('/signup/form');
    } else if (result.status === 'LINK_REQUIRED') {
      router.push('/duplicate-account');
    }
  }
}

// ✓ 여러 Domain UI 조합
features/auth/ui/LoginFlow.tsx
export function LoginFlow() {
  const { handleLogin } = useLoginFlow(); // ← Feature hook
  return (
    <>
      <LoginForm onSubmit={handleLogin} /> {/* ← Domain UI */}
      <SocialLoginButtons /> {/* ← Domain UI */}
    </>
  )
}
```

**판단 기준:**
- [ ] 특정 사용자 시나리오를 다루는가?
- [ ] 여러 Domain을 조합하는가?
- [ ] 비즈니스 규칙을 포함하는가?
- [ ] 라우팅을 포함하는가?

---

## 🗂️ 전체 폴더 구조

```
src/
├── app/                           # Next.js App Router (Pages)
│   ├── (auth)/                    # 인증 그룹
│   │   ├── login/
│   │   ├── signup/
│   │   ├── duplicate-account/
│   │   └── ...
│   ├── api/                       # Backend API Routes
│   │   └── auth/
│   │       ├── check-user-status/
│   │       ├── check-sns-user/
│   │       ├── register-general/
│   │       ├── register-sns/
│   │       ├── login-general/
│   │       ├── login-sns/
│   │       ├── link-general/
│   │       └── link-sns/
│   └── main/
│
├── domains/                       # 비즈니스 엔티티 (무엇)
│   ├── auth/
│   │   ├── model/                 # 데이터 레이어
│   │   │   ├── auth.api.ts        # API 호출 함수
│   │   │   ├── auth.queries.ts    # React Query hooks
│   │   │   ├── auth.types.ts      # 타입 정의
│   │   │   ├── auth.errors.ts     # 에러 정의
│   │   │   ├── auth.store.ts      # Zustand 상태
│   │   │   └── auth.utils.ts      # 유틸리티
│   │   └── ui/                    # 프레젠테이션 레이어
│   │       ├── login/
│   │       │   └── LoginForm.tsx  # 로그인 폼 (재사용)
│   │       ├── signup/
│   │       │   ├── PassAuthButton.tsx
│   │       │   ├── CredentialsForm.tsx
│   │       │   └── SocialLoginButton.tsx
│   │       ├── common/
│   │       │   ├── LoadingOverlay.tsx
│   │       │   └── FormInput.tsx
│   │       └── terms-agreement/
│   │           └── TermsAgreement.tsx
│   │
│   └── onboarding/
│       ├── model/
│       │   ├── onboarding.types.ts
│       │   └── onboarding.store.ts
│       └── ui/
│           ├── OnBoardingLayout.tsx
│           └── OnBoardingGroupView.tsx
│
├── features/                      # 사용자 시나리오 (어떻게)
│   └── auth/
│       ├── hooks/                 # 비즈니스 로직
│       │   ├── useGeneralSignupFlow.ts    # 일반 회원가입 플로우
│       │   ├── useSnsAuthFlow.ts          # SNS 로그인/회원가입 플로우
│       │   ├── useGeneralLoginFlow.ts     # 일반 로그인 플로우
│       │   ├── useLoginFlow.ts            # SNS 로그인 플로우 (레거시)
│       │   ├── useCredentialsAuth.ts      # 본인인증 플로우
│       │   ├── useWellnessSignup.ts       # Wellness ID 회원가입
│       │   ├── useGroupMatching.ts        # 그룹 매칭
│       │   └── useSignupCompleteFlow.ts   # 회원가입 완료
│       ├── ui/                    # 플로우 조합 UI
│       │   ├── LoginFlow.tsx      # 로그인 전체 화면
│       │   ├── SignupFlow.tsx     # 회원가입 전체 화면
│       │   └── SignupCompleteView.tsx
│       └── components/            # Feature 전용 컴포넌트
│           ├── SocialLoginSection.tsx
│           └── SignupStepper.tsx
│
├── shared/                        # 전역 공통
│   ├── ui/                        # 범용 UI
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── icon/
│   │   │   ├── ArrowLeftIcon.tsx
│   │   │   └── ClearIcon.tsx
│   │   ├── header/
│   │   │   ├── BaseHeader.tsx
│   │   │   ├── MainHeader.tsx
│   │   │   └── SubHeader.tsx
│   │   └── lottie/
│   │       └── SuccessCheckLottie.tsx
│   ├── hooks/                     # 범용 Hook
│   │   ├── useHistory.ts
│   │   └── animations/            # ✅ 애니메이션 전용
│   │       ├── useAuthAnimation.ts
│   │       ├── useSignupCompleteAnimation.ts
│   │       └── useGroupPageAnimation.ts
│   ├── utils/                     # 범용 유틸리티
│   │   └── cn.ts
│   ├── api/                       # Axios 인스턴스
│   │   └── axios.instance.ts
│   └── assets/                    # 정적 자산
│       └── fonts/
│
└── core/                          # 핵심 인프라
    ├── api/                       # API 클라이언트
    │   ├── client.ts              # HTTP 클라이언트
    │   ├── types.ts               # 공통 API 타입
    │   ├── error-utils.ts         # 에러 유틸리티
    │   └── auth-events.ts         # 인증 이벤트
    ├── config/                    # 설정
    │   ├── env.ts                 # 환경 변수 (Zod 검증)
    │   └── constants.ts           # 상수
    └── lib/                       # 라이브러리 설정
        ├── query-factory.ts       # React Query Factory
        ├── mutation-factory.ts
        └── logger.ts
```

---

## 📦 레이어별 상세 설명

### 1. **Domains** - 비즈니스 엔티티

#### `domains/[entity]/model/` - 데이터 레이어

```typescript
// ✅ auth.types.ts - 타입 정의
export interface User {
  id: string;
  ulid: string;
  nickname?: string;
}

export interface VerificationToken {
  token: string;
  expiresAt: number;
}

// ✅ auth.api.ts - API 호출 함수 (순수)
export const authApi = {
  checkUserStatus: (transactionId: string) =>
    apiClient.post('/api/auth/check-user-status', { transactionId }),
  
  registerGeneral: (data: RegisterGeneralRequest) =>
    apiClient.post('/api/auth/register-general', data),
}

// ✅ auth.queries.ts - React Query hooks
export function useCheckUserStatus() {
  return useMutation({
    mutationFn: authApi.checkUserStatus,
    // ❌ 비즈니스 로직 금지
    // ❌ 라우팅 금지
  })
}

// ✅ auth.store.ts - Zustand 상태 관리
export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  verificationToken: null,
  setUser: (user) => set({ user }),
}))

// ✅ auth.errors.ts - 에러 정의
export const AUTH_ERROR_CODES = {
  INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  USER_NOT_FOUND: 'AUTH_USER_NOT_FOUND',
} as const
```

#### `domains/[entity]/ui/` - 프레젠테이션 레이어

```typescript
// ✅ LoginForm.tsx - 재사용 가능한 UI
interface LoginFormProps {
  onSubmit: (data: LoginData) => void;
  isLoading?: boolean;
}

export function LoginForm({ onSubmit, isLoading }: LoginFormProps) {
  // ❌ useRouter 금지
  // ❌ 비즈니스 로직 금지
  // ✅ 순수 UI만
  
  return <form onSubmit={handleSubmit}>...</form>
}
```

---

### 2. **Features** - 사용자 시나리오

#### `features/[scenario]/hooks/` - 비즈니스 로직

```typescript
// ✅ useGeneralSignupFlow.ts - 일반 회원가입 플로우
export function useGeneralSignupFlow() {
  const router = useRouter(); // ✅ 라우팅 OK
  const authStore = useAuthStore();
  const checkStatus = useCheckUserStatus(); // ✅ Domain hook 사용
  const registerGeneral = useRegisterGeneral(); // ✅ Domain hook 사용
  
  // ✅ 비즈니스 로직 OK
  const handleVerificationComplete = async (transactionId: string) => {
    const result = await checkStatus.mutateAsync(transactionId);
    
    // ✅ 비즈니스 규칙
    if (result.status === 'NEW_USER') {
      authStore.setVerificationToken({
        token: result.verificationToken,
        expiresAt: Date.now() + 15 * 60 * 1000,
      });
      router.push('/signup/form');
    } else if (result.status === 'LINK_REQUIRED') {
      router.push('/duplicate-account');
    }
  }
  
  return { handleVerificationComplete }
}
```

#### `features/[scenario]/ui/` - 플로우 조합 UI

```typescript
// ✅ LoginFlow.tsx - 여러 Domain UI 조합
export function LoginFlow() {
  const { handleLogin } = useLoginFlow(); // ✅ Feature hook
  
  return (
    <AuthContainer> {/* ← Domain UI */}
      <LoginForm onSubmit={handleLogin} /> {/* ← Domain UI */}
      <SocialLoginButtons /> {/* ← Domain UI */}
    </AuthContainer>
  )
}
```

---

### 3. **Shared** - 전역 공통

```typescript
// ✅ Button.tsx - 범용 UI
export function Button({ children, onClick }: ButtonProps) {
  return <button onClick={onClick}>{children}</button>
}

// ✅ useDebounce.ts - 범용 Hook
export function useDebounce<T>(value: T, delay: number) {
  // 도메인 무관
}

// ✅ animations/ - 애니메이션 전용
// 이유: 애니메이션은 Feature가 아닌 UI 로직
shared/hooks/animations/useAuthAnimation.ts
shared/hooks/animations/useSignupCompleteAnimation.ts
```

---

### 4. **Core** - 핵심 인프라

```typescript
// ✅ env.ts - 환경 변수 (Zod 검증)
export const env = {
  API_URL: parsed.NEXT_PUBLIC_API_URL,
  KAKAO_CLIENT_ID: parsed.NEXT_PUBLIC_KAKAO_CLIENT_ID,
  // Server-only
  JWT_SECRET: isServer ? parsed.JWT_SECRET : undefined,
} as const

// ✅ client.ts - HTTP 클라이언트
export const apiClient = axios.create({
  baseURL: env.API_URL,
  timeout: env.API_TIMEOUT,
})
```

---

## 💡 실전 예시

### 예시 1: 일반 회원가입 개발

**요구사항:** 본인인증 → 아이디/비밀번호 입력 → 회원가입

#### Step 1: Domain Model 작성

```typescript
// domains/auth/model/auth.api.ts
export const authApi = {
  checkUserStatus: (transactionId: string) =>
    apiClient.post('/api/auth/check-user-status', { transactionId }),
  
  registerGeneral: (data: RegisterGeneralRequest) =>
    apiClient.post('/api/auth/register-general', data),
}

// domains/auth/model/auth.queries.ts
export function useCheckUserStatus() {
  return useMutation({ mutationFn: authApi.checkUserStatus })
}

export function useRegisterGeneral() {
  return useMutation({ mutationFn: authApi.registerGeneral })
}
```

#### Step 2: Domain UI 작성

```typescript
// domains/auth/ui/signup/CredentialsForm.tsx
export function CredentialsForm({ onSubmit }: Props) {
  return (
    <form onSubmit={handleSubmit}>
      <Input name="wellnessId" />
      <Input name="password" type="password" />
      <Button type="submit">회원가입</Button>
    </form>
  )
}
```

#### Step 3: Feature Hook 작성

```typescript
// features/auth/hooks/useGeneralSignupFlow.ts
export function useGeneralSignupFlow() {
  const router = useRouter();
  const checkStatus = useCheckUserStatus();
  const registerGeneral = useRegisterGeneral();
  
  const handleVerificationComplete = async (id: string) => {
    const result = await checkStatus.mutateAsync(id);
    if (result.status === 'NEW_USER') {
      router.push('/signup/form');
    }
  }
  
  const handleFormSubmit = async (data: FormData) => {
    await registerGeneral.mutateAsync({
      verificationToken: authStore.verificationToken.token,
      wellnessId: data.wellnessId,
      password: data.password,
    });
    router.push('/signup/complete');
  }
  
  return { handleVerificationComplete, handleFormSubmit }
}
```

#### Step 4: Feature UI 작성

```typescript
// features/auth/ui/SignupFlow.tsx
export function SignupFlow() {
  const { handleFormSubmit } = useGeneralSignupFlow();
  
  return (
    <AuthContainer>
      <CredentialsForm onSubmit={handleFormSubmit} />
    </AuthContainer>
  )
}
```

#### Step 5: Page 작성

```typescript
// app/(auth)/signup/page.tsx
export default function SignupPage() {
  return <SignupFlow />
}
```

---

### 예시 2: SNS 로그인/회원가입

**요구사항:** 카카오 로그인 → 신규 회원이면 본인인증 → 회원가입

#### Domain (데이터 처리)

```typescript
// domains/auth/model/auth.api.ts
export const authApi = {
  checkSnsUser: (snsType, snsId, snsEmail?) =>
    apiClient.post('/api/auth/check-sns-user', { snsType, snsId, snsEmail }),
  
  registerSnsUser: (data) =>
    apiClient.post('/api/auth/register-sns', data),
  
  loginSns: (snsType, snsId) =>
    apiClient.post('/api/auth/login-sns', { snsType, snsId }),
}
```

#### Feature (비즈니스 로직)

```typescript
// features/auth/hooks/useSnsAuthFlow.ts
export function useSnsAuthFlow() {
  const router = useRouter();
  const checkSnsUser = useCheckSnsUser();
  const loginSns = useLoginSns();
  const registerSnsUser = useRegisterSnsUser();
  
  const handleSnsLoginSuccess = async (data: SnsData) => {
    const result = await checkSnsUser.mutateAsync({
      snsType: 'KAKAO',
      snsId: data.id,
      snsEmail: data.email,
    });
    
    if (result.status === 'EXISTING') {
      // 기존 회원 → 로그인
      await loginSns.mutateAsync({ snsType: 'KAKAO', snsId: data.id });
      router.push('/main');
    } else if (result.status === 'NEW_USER') {
      // 신규 회원 → 본인인증 필요
      authStore.setRegisterToken({ token: result.registerToken, ... });
      router.push('/auth/verification');
    }
  }
  
  return { handleSnsLoginSuccess }
}
```

---

## 🎓 개발 가이드

### 🚀 새 기능 개발 시

#### 1. 질문하기
**Q: 이 코드가 다루는 것은?**
- 데이터/엔티티 (User, Product) → `domains/`
- 사용자 행동 (로그인, 결제) → `features/`

#### 2. 파일 배치하기
```typescript
// Domain: API 호출
domains/[entity]/model/[entity].api.ts

// Domain: React Query
domains/[entity]/model/[entity].queries.ts

// Domain: 재사용 UI
domains/[entity]/ui/[Component].tsx

// Feature: 비즈니스 로직
features/[scenario]/hooks/use[Scenario]Flow.ts

// Feature: 플로우 UI
features/[scenario]/ui/[Scenario]Flow.tsx
```

### 🔍 코드 리뷰 체크리스트

#### Domains
- [ ] 특정 엔티티를 다루는가?
- [ ] 재사용 가능한가?
- [ ] 비즈니스 로직이 없는가?
- [ ] 라우팅이 없는가?
- [ ] Domain hook만 export하는가?

#### Features
- [ ] 특정 시나리오를 다루는가?
- [ ] 여러 Domain을 조합하는가?
- [ ] Domain hook을 사용하는가? (직접 fetch 금지)
- [ ] 비즈니스 규칙을 포함하는가?
- [ ] 라우팅을 포함하는가?

### 🚨 금지 사항

```typescript
// ❌ Component에서 직접 fetch
const response = await fetch('/api/...');

// ❌ Feature에서 axios 직접 호출
await axios.post('/api/...');

// ❌ process.env 직접 접근
const url = process.env.NEXT_PUBLIC_API_URL;

// ✅ 올바른 방법
import { env } from '@/core/config/env';
const url = env.API_URL;
```

---

## 🔐 인증 시스템 구조

### 토큰 종류

| 토큰 | 유효기간 | 발급 시점 | 저장 위치 |
|------|---------|----------|----------|
| **Verification Token** | 15분 | 본인인증 후 (신규) | Zustand Store |
| **Register Token** | 5분 | SNS 로그인 (신규) | Zustand Store |
| **Link Token** | 5분 | 중복 계정 발견 | Zustand Store |
| **Auth Token** | 24시간 | 로그인/회원가입 완료 | HTTP-Only Cookie |
| **Refresh Token** | 30일 | 로그인/회원가입 완료 | HTTP-Only Cookie |

### 인증 플로우

#### 1. 일반 회원가입
```
본인인증 → checkUserStatus
  ├─ 신규: verificationToken → 아이디/비밀번호 → registerGeneral
  └─ 기존: linkToken → 계정 연동 → linkGeneralAccount
```

#### 2. SNS 회원가입
```
SNS 로그인 → checkSnsUser
  ├─ 신규: registerToken → 본인인증 → 약관 → registerSnsUser
  ├─ 기존: 로그인 성공
  └─ 연동: linkToken → linkSnsAccount
```

#### 3. 일반 로그인
```
아이디/비밀번호 → loginGeneral → 완료
```

#### 4. SNS 로그인
```
SNS 로그인 → checkSnsUser
  ├─ 기존: loginSns → 완료
  └─ 신규: 회원가입 플로우
```

### 관련 파일

```
domains/auth/model/
├── auth.types.ts          # 토큰, 요청/응답 타입
├── auth.api.ts            # 8개 인증 API 함수
├── auth.queries.ts        # 8개 React Query hooks
├── auth.store.ts          # 토큰 관리 Store
└── auth.errors.ts         # 에러 코드 & 메시지

features/auth/hooks/
├── useGeneralSignupFlow.ts  # 일반 회원가입
├── useSnsAuthFlow.ts        # SNS 로그인/회원가입
└── useGeneralLoginFlow.ts   # 일반 로그인
```

---

## 📚 참고 자료

### 주요 개념
- **FSD (Feature-Sliced Design):** 기능 단위 아키텍처
- **DDD (Domain-Driven Design):** 도메인 중심 설계
- **React Query:** 서버 상태 관리
- **Zustand:** 클라이언트 상태 관리

### 핵심 규칙
1. **Domains는 Features를 import하지 않는다**
2. **Features는 Domains를 사용한다**
3. **직접 fetch/axios 호출 금지 (Domain hook 사용)**
4. **process.env 직접 접근 금지 (env 객체 사용)**

---

**Last Updated:** 2026-01-27  
**Version:** 1.0  
**Status:** ✅ Production Ready
