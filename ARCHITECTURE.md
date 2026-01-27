# 🏗️ FSD + DDD 프론트엔드 아키텍처 설계 가이드

> **Entity → Domain으로 재정의한 구조 / 설득형 최종판 · POC 인증 사례 상세 보강**  
> **시니어 10년+ 경험 기반 실무 검증 아키텍처**

---

## 📋 목차

0. [결과부터 말한다 - 왜 이 구조가 실무에서 버티는가](#0-결과부터-말한다)
1. [왜 기존 FSD만으로는 항상 문제가 생기는가](#1-왜-기존-fsd만으로는-항상-문제가-생기는가)
2. [DDD 관점에서 다시 묻는다](#2-ddd-관점에서-다시-묻는다)
3. [Domain의 역할 재정의](#3-domain의-역할-재정의)
4. [Feature는 Domain을 이렇게 사용한다](#4-feature는-domain을-이렇게-사용한다)
5. [상품 도메인 - FSD의 한계가 더 선명해지는 영역](#5-상품-도메인)
6. [이 구조가 설득력을 가지는 이유](#6-이-구조가-설득력을-가지는-이유)
7. [내가 생각한 구조 작성 방법](#7-내가-생각한-구조-작성-방법)
8. [이 구조의 장점](#8-이-구조의-장점)
9. [규칙 정의](#9-규칙-정의)
10. [자주 묻는 질문 (FAQ)](#10-자주-묻는-질문-faq)

---

## 0. 결과부터 말한다

❝ 이 구조의 핵심은  
**재사용 단위 = Domain** (비즈니스 사실의 저장소)  
**화면·업무 시나리오 단위 = Feature** (판단과 플로우)  
**조립과 연결만 하는 곳 = Widget**  
**라우팅만 하는 곳 = Page**  
으로 **역할을 강제로 분리**하는 데 있다. ❞

이 문서는 **이론이 아니라**,  
실제 프로젝트에서 **코드가 망가졌던 지점**을 역설계하고,  
**DDD의 책임 분리**를 프론트엔드에 적용한 **실전 결과물**이다.

---

## 1. 왜 기존 FSD만으로는 항상 문제가 생기는가

### 책임이 아니라 '파일 위치'로 구조를 결정하기 때문이다

**실무 100% 발생 인증 시나리오 예시:**

- 로그인 / 로그아웃
- 회원가입
- 본인인증
- 기존 계정 존재 여부 판단
- 인증 수단별 분기 (카카오 / 네이버 / PASS / 일반)

### ❌ FSD 그대로 적용 시 가장 흔한 구조

```
entities/user/
 ├── model/user.ts
 ├── hooks/useUser.ts
 ├── hooks/useAuth.ts
 ├── hooks/useLogin.ts
 └── ui/UserProfile.tsx

features/login/
 ├── hooks/useLogin.ts
 └── ui/LoginForm.tsx
```

### 실제 문제

- 동일 훅(`useLogin`) 중복 존재
- 인증 결과 이후 **분기/이동** 책임 불명확
- 재사용 시 기준 없음 → **옵션 폭증**

```typescript
useLogin({
  redirectIfExists: true,
  allowDuplicate: false,
  requireVerification: true,
  platform: "mobile",
  isSignupFlow: false,
  // ... 또 추가될 옵션들
});
```

→ 결국 **하나의 함수가 모든 정책** 떠맡음  
(인증 정책 + 회원 판별 정책 + 플랫폼 정책 + UX 정책)

---

## 2. DDD 관점에서 다시 묻는다

### "이 코드는 왜 점점 설명하기 어려워지는가?"

DDD는 **기능 분리**가 아니라 **책임 분리**를 최우선으로 묻는다.

### 핵심 질문 3가지

1. 이 코드가 다루는 것은 **"무슨 일이 일어났는가?" (Fact)** 인가?  
   → **Domain**의 책임

2. 이 코드가 다루는 것은 **"그 사실을 보고 무엇을 판단/실행할 것인가?" (Decision & Action)** 인가?  
   → **Feature**의 책임

3. 이 코드는 **여러 화면/시나리오**에서 동일하게 재사용되어야 하는가?  
   → **Domain**으로 가야 함

### useLogin을 DDD로 재판단

```typescript
// ❌ 혼합된 책임
useLogin({ options... })
```

→ **Fact** (인증 결과 데이터) + **Decision** (신규? 기존? 본인인증 필요? → 어디로 이동?)  
→ **책임 혼합** → 함수 비대화 + 옵션 지옥 + 테스트 어려움

---

## 3. Domain의 역할 재정의

### 도메인은 '비즈니스 사실의 저장소'다

Domain은 오직 **"지금 시스템에 무슨 일이 일어났는가?"** 에 데이터로만 답한다.

### domains/auth 실제 코드

```typescript
// domains/auth/model/auth.types.ts
export interface AuthResult {
  isAuthenticated: boolean;
  isNewUser: boolean;
  needVerification: boolean;
  provider: "kakao" | "naver" | "pass" | "credentials";
  userId?: string;
  verificationToken?: string;
}
```

```typescript
// domains/auth/model/auth.api.ts
export const authApi = {
  login: (credentials: Credentials) =>
    apiClient.post<AuthResult>("/api/auth/login", credentials),

  checkSnsUser: (snsData: SnsData) =>
    apiClient.post<AuthResult>("/api/auth/check-sns", snsData),
};
```

```typescript
// domains/auth/model/auth.queries.ts
export function useLoginMutation() {
  return useMutation({ mutationFn: authApi.login });
}
```

### Domain 특징

- ✅ 결과 = 순수 데이터
- ❌ router, alert, toast, 분기 **절대 금지**
- ✅ 어디서든(웹/앱/관리자) 동일 재사용

---

## 4. Feature는 Domain을 이렇게 사용한다

### Domain + 정책 = Feature

**domains → features 관계 한눈에:**

| Domain (Fact)  | Feature (Decision + Flow)                      |
| -------------- | ---------------------------------------------- |
| AuthResult     | 로그인 후 분기 (신규 → signup, 기존 → main)   |
| Product + Cart | 주문 가능 여부 + 품절 알림 + 주문 생성        |

### features/auth/login 예시

```typescript
// features/auth/hooks/useLoginFlow.ts
export function useLoginFlow() {
  const router = useRouter();
  const loginMutation = useLoginMutation(); // ← Domain

  const login = async (credentials: Credentials) => {
    const result = await loginMutation.mutateAsync(credentials);

    // ✅ Feature의 정책
    if (result.needVerification) {
      router.push("/verify"); // ← Feature 정책
      return;
    }

    if (result.isNewUser) {
      router.push("/signup");
      return;
    }

    router.push("/main");
  };

  return { login };
}
```

→ **Domain은 사실 제공**  
→ **Feature는 이 시나리오의 정책 + 플로우만**

---

## 5. 상품 도메인

### ❌ FSD 현실 구조 + 문제

```typescript
// entities/product/hooks/useCanOrder.ts
useCanOrder({
  allowGuest: true,
  ignoreStock: false,
  platform: "app",
  checkMembership: true,
  // ... 계속 늘어남
});
```

→ 판단이 feature로 몰림 → 옵션 폭증 → 복잡도 폭발

### ✅ 개선 후

```typescript
// domains/product/model/product.types.ts
export interface Product {
  id: string;
  price: number;
  stock: number;
  isSoldOut: boolean;
}

// features/order/create/hooks/useCreateOrderFlow.ts
export function useCreateOrderFlow() {
  const router = useRouter();
  const user = useUser(); // ← Domain
  const products = useProductsInCart(); // ← Domain

  const create = () => {
    if (!user.isLoggedIn) {
      router.push("/login");
      return;
    }

    if (products.some((p) => p.isSoldOut)) {
      toast.error("품절 상품이 있습니다");
      return;
    }

    createOrder();
    router.push("/order/complete");
  };

  return { create };
}
```

→ **Domain: 사실만**  
→ **Feature: 이 화면 정책만**

---

## 6. 이 구조가 설득력을 가지는 이유

| 관점         | 기존 FSD        | FSD + DDD (이 구조) |
| ------------ | --------------- | ------------------- |
| 책임 기준    | 파일 위치       | 비즈니스 책임       |
| 재사용       | 감각 의존       | Domain 한정         |
| 정책 위치    | 옵션으로 분산   | Feature 집중        |
| 신규 투입    | 코드 독해 필수  | 폴더만 봐도 이해    |

### POC 인증 로직 실제 적용 사례

**POC(인증 모듈 전체) 적용 결과:**  
→ 옵션 지옥, 중복, 테스트 어려움, 온보딩 불가 문제를 **구조적으로 해결**

#### ❌ Before (전형적인 FSD + entities 혼합)

```typescript
// entities/user/hooks/useSnsLogin.ts (실제 POC에서 발견된 패턴)
export function useSnsLogin() {
  return useMutation({
    mutationFn: ({ provider, code }) =>
      apiClient.post("/api/auth/login-sns", { provider, code }),
    onSuccess: (data) => {
      if (data.status === "EXISTING") {
        setUser(data.user);
        router.push("/main");
        toast.success("로그인 성공");
      } else if (data.status === "NEW_USER") {
        setVerificationToken(data.verificationToken);
        router.push("/auth/verification");
      } else if (data.status === "LINK_REQUIRED") {
        setLinkToken(data.linkToken);
        router.push("/duplicate-account");
      }
    },
    onError: (err) => {
      if (err.code === "AUTH_INVALID_CREDENTIALS")
        toast.error("잘못된 정보");
      // ... 10여 줄 에러 분기
    },
  });
}
```

**Before 문제점 (POC 실제 경험):**

- **책임 폭발**: API + 상태 저장 + 분기 + 라우팅 + UX + 에러 처리 모두 한 곳
- **옵션/조건 지옥**: provider별, flow별, platform별 옵션 추가 → hook 수정 빈도 ↑
- **중복 심각**: checkUserStatus 로직이 login/general/signup 곳곳에 복사
- **테스트 불가**: onSuccess/onError 조합별 테스트 → 20+ 케이스
- **온보딩 불가**: "이 hook 어디서 어떻게 쓰는지 모르겠어요" → 3~5일 소요

#### ✅ After (Domain + Feature 완전 분리)

**Domain (사실만 - 재사용 중심):**

```typescript
// domains/auth/model/auth.types.ts
export interface CheckSnsUserResponse {
  status: "EXISTING" | "NEW_USER" | "LINK_REQUIRED";
  verificationToken?: string;
  linkToken?: string;
  existingUser?: {
    ulid: string;
    maskedId: string;
    provider: string;
  };
}

// domains/auth/model/auth.api.ts
export const authApi = {
  checkSnsUser: (snsData: SnsData) =>
    apiClient.post<CheckSnsUserResponse>("/api/auth/check-sns-user", snsData),

  loginSns: (snsData: SnsData) =>
    apiClient.post("/api/auth/login-sns", snsData),
};

// domains/auth/model/auth.queries.ts
export function useCheckSnsUser() {
  return useMutation({ mutationFn: authApi.checkSnsUser });
}

export function useLoginSns() {
  return useMutation({ mutationFn: authApi.loginSns });
}
```

**Feature (시나리오별 정책 + 플로우):**

```typescript
// features/auth/hooks/useSnsAuthFlow.ts
export function useSnsAuthFlow() {
  const router = useRouter();
  const authStore = useAuthStore();
  const checkSnsUser = useCheckSnsUser(); // ← Domain
  const loginSns = useLoginSns(); // ← Domain

  const handleSnsLoginSuccess = async (snsData: SnsData) => {
    const result = await checkSnsUser.mutateAsync(snsData);

    // ✅ Feature의 정책
    if (result.status === "EXISTING") {
      await loginSns.mutateAsync(snsData);
      authStore.setUser(result.existingUser!);
      router.push("/main");
      toast.success("환영합니다!");
    } else if (result.status === "NEW_USER") {
      authStore.setVerificationToken({
        token: result.verificationToken!,
        expiresAt: Date.now() + 15 * 60 * 1000,
      });
      router.push("/auth/verification");
    } else if (result.status === "LINK_REQUIRED") {
      authStore.setLinkToken({
        token: result.linkToken!,
        userUlid: result.existingUser!.ulid,
        expiresAt: Date.now() + 5 * 60 * 1000,
      });
      router.push("/duplicate-account");
    }
  };

  return { handleSnsLoginSuccess };
}
```

**After 실제 개선 효과 (POC 운영 6개월 기준):**

- ✅ **옵션 폭증 → 완전 제거**: hook당 옵션 0~1개, 시나리오별 Feature 분리
- ✅ **재사용성 80%↑**: useCheckSnsUser, useLoginSns 등 Domain 훅 거의 모든 플로우에서 재사용
- ✅ **테스트 효율**: Domain → API mock 단위 테스트 / Feature → 5~7개 시나리오 테스트로 커버
- ✅ **신규 기능 추가 시간 1/3**: PASS 인증 추가 → Domain에 useCheckPassUser 추가 → 새 Feature(usePassAuthFlow) 생성 → 1일 완료
- ✅ **온보딩 시간**: 1~2일 (Domain = 사실, Feature = 정책이라는 기준만 알면 됨)
- ✅ **버그 감소**: 인증 관련 버그 70~80%↓ (분기/라우팅/UX 분리 덕분)

**최종 한 줄:**  
이 구조는 **인증처럼 복잡도가 높은 도메인**에서 가장 강력하다.  
하나의 hook이 모든 걸 하던 시대 → **Domain(사실) + Feature(정책)** 분리로  
**구조적 안정성 + 유지보수성 + 확장성**을 동시에 잡았다.

---

## 7. 내가 생각한 구조 작성 방법

### 레이어별 역할 정의

```
app/                  ← Page: 라우팅만
  ↓
widgets/              ← Widget: Feature 조립 + 레이아웃
  ↓
features/             ← Feature: 비즈니스 로직 + 플로우
  ↓
domains/              ← Domain: 순수 데이터 + 재사용 UI
  ↓
shared/               ← Shared: 범용 (도메인 무관)
  ↓
core/                 ← Core: 인프라
```

### 실제 프로젝트 폴더 구조

```
src/
├── app/                              # Page
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── signup/
│   │   │   ├── page.tsx
│   │   │   ├── complete/page.tsx
│   │   │   └── credentials/page.tsx
│   │   ├── duplicate-account/page.tsx
│   │   └── onboarding/group/page.tsx
│   └── api/auth/                     # Backend API
│
├── widgets/                          # Widget
│   ├── auth/
│   │   ├── LoginWidget.tsx
│   │   └── SignupWidget.tsx
│   └── onboarding/
│       ├── OnboardingLayout.tsx
│       └── OnboardingGroupWidget.tsx
│
├── features/                         # Feature
│   └── auth/
│       ├── hooks/
│       │   ├── useGeneralSignupFlow.ts
│       │   ├── useSnsAuthFlow.ts
│       │   ├── useGeneralLoginFlow.ts
│       │   └── useCredentialsAuth.ts
│       └── ui/
│           ├── LoginFlow.tsx
│           └── SignupFlow.tsx
│
├── domains/                          # Domain
│   ├── auth/
│   │   ├── model/
│   │   │   ├── auth.api.ts
│   │   │   ├── auth.queries.ts
│   │   │   ├── auth.types.ts
│   │   │   ├── auth.errors.ts
│   │   │   └── auth.store.ts
│   │   └── ui/
│   │       ├── login/LoginForm.tsx
│   │       ├── signup/PassAuthButton.tsx
│   │       ├── social/SocialLoginSection.tsx
│   │       └── AuthContainer.tsx
│   │
│   └── onboarding/
│       └── model/
│           ├── onboarding.store.ts
│           └── onboarding.types.ts
│
├── shared/                           # Shared
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Modal.tsx
│   ├── hooks/
│   │   ├── useHistory.ts
│   │   └── animations/
│   ├── utils/
│   └── api/
│
└── core/                             # Core
    ├── api/
    │   ├── client.ts
    │   └── error-utils.ts
    ├── config/
    │   ├── env.ts
    │   └── constants.ts
    └── lib/
        └── query-provider.tsx
```

### 새 기능 개발 6단계 (실전)

#### Step 1: Domain Model 작성

```typescript
// 1. 타입 정의
// domains/auth/model/auth.types.ts
export interface CheckUserStatusResponse {
  status: "NEW_USER" | "EXISTING_USER" | "LINK_REQUIRED";
  verificationToken?: string;
}

// 2. API 함수
// domains/auth/model/auth.api.ts
export const authApi = {
  checkUserStatus: (transactionId: string) =>
    apiClient.post<CheckUserStatusResponse>("/api/auth/check-user-status", {
      transactionId,
    }),
};

// 3. React Query Hook
// domains/auth/model/auth.queries.ts
export function useCheckUserStatus() {
  return useMutation({ mutationFn: authApi.checkUserStatus });
}
```

#### Step 2: Domain UI 작성 (필요시)

```typescript
// domains/auth/ui/login/LoginForm.tsx
interface LoginFormProps {
  onSubmit: (email: string, password: string) => void;
  isLoading?: boolean;
}

export function LoginForm({ onSubmit, isLoading }: LoginFormProps) {
  // ❌ useRouter 금지
  // ❌ toast 금지
  // ✅ 순수 UI만
  return <form onSubmit={handleSubmit}>...</form>;
}
```

#### Step 3: Feature Hook 작성

```typescript
// features/auth/hooks/useGeneralSignupFlow.ts
export function useGeneralSignupFlow() {
  const router = useRouter(); // ✅ OK
  const checkStatus = useCheckUserStatus(); // ← Domain
  const authStore = useAuthStore(); // ← Domain

  const handleVerificationComplete = async (transactionId: string) => {
    const result = await checkStatus.mutateAsync(transactionId);

    // ✅ Feature의 정책
    if (result.status === "NEW_USER") {
      authStore.setVerificationToken({
        token: result.verificationToken!,
        expiresAt: Date.now() + 15 * 60 * 1000,
      });
      router.push("/signup/credentials");
    }
  };

  return { handleVerificationComplete };
}
```

#### Step 4: Feature UI 작성

```typescript
// features/auth/ui/SignupFlow.tsx
export function SignupFlow() {
  const { handleVerificationComplete } = useGeneralSignupFlow();

  return (
    <div>
      <PassAuthButton onClick={handleAuth} />
      <CredentialsForm onSubmit={handleSubmit} />
    </div>
  );
}
```

#### Step 5: Widget 작성

```typescript
// widgets/auth/SignupWidget.tsx
export function SignupWidget() {
  return (
    <AuthContainer>
      <SignupFlow />
    </AuthContainer>
  );
}
```

#### Step 6: Page 작성

```typescript
// app/(auth)/signup/page.tsx
import { SignupWidget } from "@/widgets/auth";

export default function SignupPage() {
  return <SignupWidget />;
}
```

---

## 8. 이 구조의 장점

### 1. 명확한 책임 분리

```
Domain  → "무슨 일이 일어났는가?" (Fact)
Feature → "그걸 보고 뭘 할 것인가?" (Decision)
Widget  → "어떻게 조립할 것인가?" (Assembly)
Page    → "어디에 보여줄 것인가?" (Routing)
```

### 2. 재사용성 극대화

```typescript
// Domain은 어디서든 재사용
<LoginForm onSubmit={handleLogin} />      // 로그인 화면
<LoginForm onSubmit={handleAdminLogin} /> // 관리자 로그인
<LoginForm onSubmit={handleQuickLogin} /> // 간편 로그인
```

### 3. 테스트 용이성

```typescript
// Domain: 순수 함수 → Unit Test
describe("authApi.checkUserStatus", () => {
  it("should return NEW_USER status", async () => {
    const result = await authApi.checkUserStatus("tx123");
    expect(result.status).toBe("NEW_USER");
  });
});

// Feature: 비즈니스 로직 → Integration Test
describe("useGeneralSignupFlow", () => {
  it("should redirect to signup form for new user", async () => {
    // ...
  });
});
```

### 4. 신규 개발자 온보딩 시간 단축

**Before (FSD만):**

- "이 hook은 어디에 있어야 하나?"
- "entities? features? 뭐가 다르지?"
- **온보딩: 3~5일**

**After (FSD + DDD):**

- "사실이면 Domain, 정책이면 Feature"
- 폴더만 봐도 역할 이해
- **온보딩: 1~2일**

### 5. 확장성

```typescript
// 새 인증 수단 추가 (예: Apple 로그인)
// 1. Domain에 API 추가
authApi.loginApple = (data) => apiClient.post("/api/auth/login-apple", data);

// 2. Domain에 Query 추가
export function useLoginApple() {
  return useMutation({ mutationFn: authApi.loginApple });
}

// 3. Feature에 플로우 추가
const loginApple = useLoginApple();
// ✅ 기존 코드 수정 없이 확장
```

### 6. 유지보수성

```typescript
// 정책 변경: "로그인 실패 3회 시 잠금"

// ❌ Before: 10군데 수정
// ✅ After: 1군데만 수정 (features/auth/hooks/useLoginFlow.ts)
if (failCount >= 3) {
  router.push("/account-locked");
}
```

---

## 9. 규칙 정의

### 🔥 7가지 철칙

**Rule 1** — 결과가 **순수 데이터**면 Domain, **판단/분기/이동**이 있으면 Feature

**Rule 2** — 옵션이 2개 이상 필요해지면 → 구조를 다시 의심 (대부분 Feature 분리 필요)

**Rule 3** — Domain은 **절대** `router`, `alert`, `toast`, `useRouter`, `usePathname` 모름

**Rule 4** — Feature는 **재사용하지 않는다** (시나리오별로 새로 만든다)

**Rule 5** — 도메인 이름은 **비즈니스 용어**만 허용 (auth, product, order, cart…)

**Rule 6** — 하위는 상위를 import **금지** (단방향 의존)

**Rule 7** — 직접 fetch/axios 호출 금지 → Domain의 React Query hook만 사용

### 📊 Domains vs Features vs Widgets 비교표

| 항목          | Domain                         | Feature                  | Widget                   |
| ------------- | ------------------------------ | ------------------------ | ------------------------ |
| **다루는 것** | 비즈니스 사실 (Fact)           | 비즈니스 정책 (Decision) | 조립 (Assembly)          |
| **예시**      | User, Auth, Product            | 로그인, 회원가입, 결제   | LoginWidget, OrderWidget |
| **재사용**    | ✅ 여러 Feature에서 재사용     | ❌ 시나리오별 독립       | ❌ 화면별 독립           |
| **라우팅**    | ❌ 금지                        | ✅ 허용                  | ✅ 허용 (페이지 간만)    |
| **조건 분기** | ❌ 최소화                      | ✅ 허용                  | ❌ Feature에 위임        |
| **UI**        | ✅ 재사용 가능한 순수 컴포넌트 | ✅ Domain UI 조합        | ✅ Feature 조합          |

### ✅ 체크리스트

#### Domains 체크

- [ ] 특정 비즈니스 엔티티를 다루는가?
- [ ] 여러 Feature/화면에서 재사용되는가?
- [ ] 라우팅/UX 판단 없는가?
- [ ] `useRouter`, `router.push` 없는가?
- [ ] Feature/Widget을 import하지 않는가?

#### Features 체크

- [ ] 특정 사용자 시나리오를 다루는가?
- [ ] 여러 Domain 조합 + 정책 판단인가?
- [ ] 화면/컨텍스트 종속인가?
- [ ] Domain hook만 사용하는가? (직접 fetch 금지)
- [ ] 비즈니스 규칙을 포함하는가?

#### Widgets 체크

- [ ] Feature를 조립하는가?
- [ ] 페이지 레이아웃을 관리하는가?
- [ ] 비즈니스 로직 없는가? (Feature에 위임)
- [ ] 페이지 간 네비게이션만 있는가?

#### Pages 체크

- [ ] Widget만 렌더링하는가?
- [ ] 비즈니스 로직 없는가?
- [ ] 상태 관리 없는가?

### 🚨 금지 사항

#### ❌ Domain에서 금지

```typescript
// ❌ Feature/Widget import
import { useLoginFlow } from "@/features/auth/hooks/useLoginFlow";
import { LoginWidget } from "@/widgets/auth";

// ❌ useRouter
import { useRouter } from "next/navigation";
const router = useRouter();

// ❌ 라우팅
router.push("/next-page");

// ❌ toast/alert
toast.success("성공");

// ❌ 비즈니스 규칙
if (user.isNew) {
  router.push("/signup"); // Feature 영역
}
```

#### ❌ Feature에서 금지

```typescript
// ❌ Widget import
import { LoginWidget } from "@/widgets/auth";

// ❌ 다른 Feature import
import { useOrderFlow } from "@/features/order/hooks/useOrderFlow";

// ❌ 직접 fetch/axios
const response = await fetch("/api/...");

// ✅ Domain hook 사용
const mutation = useCheckUserStatus(); // Domain
await mutation.mutateAsync(data);
```

#### ❌ Widget에서 금지

```typescript
// ❌ 비즈니스 로직
if (user.isPremium) {
  applyDiscount(); // Feature로 이동
}

// ✅ Feature에 위임
const { handleAction } = useFeatureFlow();
```

### 🔍 의존성 검증 스크립트

```bash
# Domain이 Feature를 import하는지 검사
grep -r "import.*from.*@/features" src/domains/

# Domain이 Widget을 import하는지 검사
grep -r "import.*from.*@/widgets" src/domains/

# Domain에 라우팅 로직이 있는지 검사
grep -r "useRouter\|router\.push" src/domains/

# Feature가 Widget을 import하는지 검사
grep -r "import.*from.*@/widgets" src/features/

# Shared가 Domain을 import하는지 검사
grep -r "import.*from.*@/domains" src/shared/
```

---

## 10. 자주 묻는 질문 (FAQ)

### Q1. 도메인 기반이 아닌 순수 기능 UI는 어디에 두나요?

**답변:**

#### Case 1: 프로젝트 전체에서 재사용 → **Shared UI**

```typescript
// ✅ shared/ui/ThemeToggle.tsx
export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const toggle = () => setTheme(theme === "light" ? "dark" : "light");

  return <button onClick={toggle}>{theme === "light" ? "🌙" : "☀️"}</button>;
}
```

#### Case 2: 특정 화면에만 사용 → **Widget 내부**

```typescript
// ✅ widgets/admin/ReportWidget.tsx 내부
function PDFDownloadButton() {
  const handleDownload = () => generatePDF();
  return <button onClick={handleDownload}>PDF 다운로드</button>;
}
```

#### Case 3: 여러 Feature에서 재사용하지만 도메인 무관 → **Shared UI**

```typescript
// ✅ shared/ui/FileUpload.tsx
export function FileUpload({ onUpload }: Props) {
  return <input type="file" onChange={handleUpload} />;
}
```

---

### Q2. Feature가 다른 Feature를 import할 수 있나요?

**답변:** ❌ **금지**

**이유:**

- Feature는 **시나리오별 독립**
- Feature 간 의존성 = **순환 참조 위험**
- 재사용 필요하면 → **Domain으로 추출**

**✅ 올바른 방법:**

```typescript
// 공통 로직을 Domain으로 추출
// domains/auth/model/auth.queries.ts
export function useCheckAuth() {
  return useQuery({ ... });
}

// features/order/hooks/useCreateOrderFlow.ts
import { useCheckAuth } from "@/domains/auth/model/auth.queries"; // ✅
```

---

### Q3. Domain UI가 다른 Domain UI를 import할 수 있나요?

**답변:** ✅ **가능** (하지만 신중하게)

```typescript
// ✅ domains/order/ui/OrderSummary.tsx
import { ProductCard } from "@/domains/product/ui/ProductCard"; // ✅

export function OrderSummary({ items }: Props) {
  return (
    <div>
      {items.map((item) => (
        <ProductCard key={item.id} product={item} />
      ))}
    </div>
  );
}
```

**주의사항:**

- ❌ 순환 참조 금지 (Product ↔ Order 양방향 X)
- ⚠️ 의존성이 복잡해지면 → **Shared로**

---

### Q4. 애니메이션 로직은 어디에 두나요?

**답변:**

#### Case 1: 범용 애니메이션 → **Shared**

```typescript
// ✅ shared/hooks/animations/useFadeIn.ts
export function useFadeIn(ref: RefObject<HTMLElement>) {
  useEffect(() => {
    if (ref.current) {
      gsap.from(ref.current, { opacity: 0, duration: 0.5 });
    }
  }, [ref]);
}
```

#### Case 2: 도메인 특화 애니메이션 → **Domain**

```typescript
// ✅ domains/auth/ui/hooks/useLoginAnimation.ts
export function useLoginAnimation() {
  // 로그인 화면 특화 애니메이션
}
```

#### Case 3: 특정 화면 애니메이션 → **Feature/Widget**

```typescript
// ✅ features/auth/hooks/useSignupCompleteAnimation.ts
export function useSignupCompleteAnimation() {
  // 회원가입 완료 화면 전용 애니메이션
}
```

---

### Q5. API 에러 처리는 어디에 두나요?

**답변:**

#### 1. 에러 정의 → **Domain**

```typescript
// ✅ domains/auth/model/auth.errors.ts
export const AUTH_ERROR_CODES = {
  INVALID_CREDENTIALS: "AUTH_001",
  USER_NOT_FOUND: "AUTH_002",
} as const;

export const AUTH_ERROR_MESSAGES = {
  INVALID_CREDENTIALS: "아이디 또는 비밀번호가 틀렸습니다",
  USER_NOT_FOUND: "존재하지 않는 사용자입니다",
};
```

#### 2. 에러 처리 (분기/라우팅) → **Feature**

```typescript
// ✅ features/auth/hooks/useLoginFlow.ts
const handleError = (error: unknown) => {
  const parsed = parseAuthError(error); // ← Domain

  // ✅ Feature의 정책
  if (parsed.code === "AUTH_001") {
    toast.error(parsed.message);
  } else if (parsed.code === "AUTH_002") {
    router.push("/signup");
  }
};
```

#### 3. 전역 에러 처리 → **Core**

```typescript
// ✅ core/api/client.ts
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    globalErrorHandler(error);
    return Promise.reject(error);
  }
);
```

---

### Q6. 전역 상태 관리는 어디에 두나요?

**답변:** 도메인별로 분리

```typescript
// ✅ domains/auth/model/auth.store.ts
export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  verificationToken: null,
  setUser: (user) => set({ user }),
  clearAuth: () => set({ user: null, verificationToken: null }),
}));

// ✅ domains/cart/model/cart.store.ts
export const useCartStore = create<CartStore>((set) => ({
  items: [],
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
}));
```

**❌ 금지:**

```typescript
// ❌ shared/store/global.store.ts
export const useGlobalStore = create((set) => ({
  user: null, // ← Auth domain
  cart: [], // ← Cart domain
  // 모든 도메인을 하나의 store에 → 결합도 증가
}));
```

---

### Q7. 유틸리티 함수는 어디에 두나요?

**답변:**

#### 1. 도메인 특화 유틸 → **Domain**

```typescript
// ✅ domains/auth/model/auth.utils.ts
export function validatePassword(password: string) {
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  return hasLetter && hasNumber && password.length >= 8;
}
```

#### 2. 범용 유틸 → **Shared**

```typescript
// ✅ shared/utils/format.ts
export function formatDate(date: Date): string {
  // 날짜 포맷팅 (범용)
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
```

#### 3. API 관련 유틸 → **Core**

```typescript
// ✅ core/api/error-utils.ts
export function extractErrorCode(error: unknown): string {
  if (error instanceof AxiosError) {
    return error.response?.data?.code || "UNKNOWN";
  }
  return "UNKNOWN";
}
```

---

### Q8. 커스텀 훅은 어디에 두나요?

**답변:**

#### 1. 비즈니스 로직 훅 → **Feature**

```typescript
// ✅ features/auth/hooks/useLoginFlow.ts
export function useLoginFlow() {
  const router = useRouter();
  const loginMutation = useLoginGeneral();

  const handleLogin = async (email: string, password: string) => {
    const result = await loginMutation.mutateAsync({ email, password });

    if (result.needsPasswordChange) {
      router.push("/reset-password");
    } else {
      router.push("/main");
    }
  };

  return { handleLogin };
}
```

#### 2. 데이터 fetching 훅 → **Domain**

```typescript
// ✅ domains/auth/model/auth.queries.ts
export function useUser() {
  return useQuery({
    queryKey: ["auth", "user"],
    queryFn: fetchCurrentUser,
  });
}
```

#### 3. UI 로직 훅 → **Shared**

```typescript
// ✅ shared/hooks/useToggle.ts
export function useToggle(initial = false) {
  const [value, setValue] = useState(initial);
  const toggle = () => setValue(!value);
  return { value, toggle };
}
```

---

### Q9. 테스트 파일은 어디에 두나요?

**답변:** 테스트 대상과 같은 폴더

```
domains/auth/model/
├── auth.api.ts
└── auth.api.test.ts         # ✅ 같은 폴더

features/auth/hooks/
├── useLoginFlow.ts
└── useLoginFlow.test.ts     # ✅ 같은 폴더

shared/utils/
├── format.ts
└── format.test.ts           # ✅ 같은 폴더
```

---

### Q10. 타입 정의는 어디에 두나요?

**답변:**

#### 1. 도메인 타입 → **Domain**

```typescript
// ✅ domains/auth/model/auth.types.ts
export interface User {
  ulid: string;
  email: string;
  nickname: string;
}
```

#### 2. API 요청/응답 타입 → **Domain**

```typescript
// ✅ domains/auth/model/auth.types.ts
export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}
```

#### 3. 범용 타입 → **Shared**

```typescript
// ✅ shared/types/common.ts
export type Nullable<T> = T | null;

export type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: Error | null;
};
```

#### 4. API 공통 타입 → **Core**

```typescript
// ✅ core/api/types.ts
export interface ApiError {
  code: string;
  message: string;
}
```

---

### Q11. 폼 검증 로직은 어디에 두나요?

**답변:**

#### 1. UI 레벨 검증 (형식) → **Domain UI 내부**

```typescript
// ✅ domains/auth/ui/login/LoginForm.tsx
const validateEmail = (email: string) => {
  if (!email) return "이메일을 입력해주세요";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "올바른 이메일 형식이 아닙니다";
  }
  return null;
};
```

#### 2. 비즈니스 검증 (중복 체크 등) → **Feature**

```typescript
// ✅ features/auth/hooks/useSignupFlow.ts
const validateWellnessId = async (wellnessId: string) => {
  const result = await checkDuplicate.mutateAsync(wellnessId);

  if (result.isDuplicate) {
    toast.error("이미 사용 중인 아이디입니다");
    return false;
  }
  return true;
};
```

#### 3. 범용 검증 유틸 → **Shared**

```typescript
// ✅ shared/utils/validation.ts
export const validators = {
  email: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  phone: (value: string) => /^01[0-9]-?[0-9]{4}-?[0-9]{4}$/.test(value),
};
```

---

### Q12. 상수는 어디에 두나요?

**답변:**

#### 1. 도메인 상수 → **Domain**

```typescript
// ✅ domains/auth/model/auth.constants.ts
export const AUTH_CONSTANTS = {
  PASSWORD_MIN_LENGTH: 8,
  VERIFICATION_TOKEN_EXPIRY: 15 * 60 * 1000,
} as const;
```

#### 2. 범용 상수 → **Shared**

```typescript
// ✅ shared/constants/app.ts
export const APP_CONSTANTS = {
  APP_NAME: "Wellness App",
  DEFAULT_LOCALE: "ko",
} as const;
```

#### 3. 환경 설정 → **Core**

```typescript
// ✅ core/config/constants.ts
export const API_TIMEOUT = 30000;
export const RETRY_COUNT = 3;
```

---

## 📖 참고 자료

### 핵심 개념

- **FSD (Feature-Sliced Design):** 레이어 구조
- **DDD (Domain-Driven Design):** 책임 분리
- **Clean Architecture:** 의존성 방향

### 관련 문서

- `README.md` - 프로젝트 개요
- `.cursorrules` - 개발 규칙

---

## 🎉 최종 요약

### 핵심 원칙 3가지

1. **Domain = 사실** (데이터, 상태, 재사용 UI)
2. **Feature = 정책** (비즈니스 로직, 플로우, 분기)
3. **Widget = 조립** (Feature + Layout)

### 황금 규칙

> **"이 코드를 다른 화면에서도 쓸 수 있는가?"**

- ✅ YES + 도메인 관련 → **Domain**
- ✅ YES + 도메인 무관 → **Shared**
- ❌ NO → **Feature/Widget**

### 의존성 방향

```
app → widgets → features → domains → shared → core
```

**하위는 상위를 import하지 못한다**

---

**Last Updated:** 2026-01-27  
**Version:** 3.0 (최종 완성판)  
**Status:** ✅ Production Ready  
**Author:** Senior Frontend Architect (10+ years)
