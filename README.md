# POC Template - 엔터프라이즈급 Next.js 프로젝트

> **FSD + DDD 아키텍처 | 시니어 10년+ 경험 기반 실무 검증 구조**

---

## 🚀 Quick Start

```bash
pnpm install
pnpm dev
```

---

## 📁 핵심 구조 (5초 이해)

```
app/ ────────── Page (라우팅만)
  ↓
widgets/ ────── Widget (Feature 조립)
  ↓
features/ ───── Feature (비즈니스 로직 + 플로우)
  ↓
domains/ ────── Domain (순수 데이터 + 재사용 UI)
  ↓
shared/ ─────── Shared (범용)
  ↓
core/ ───────── Core (인프라)
```

### 의존성 방향 (철칙)

```
✅ 상위 → 하위 참조 가능
❌ 하위 → 상위 참조 금지

❌ domains → features 금지
❌ domains → widgets 금지
❌ features → widgets 금지
❌ shared → domains 금지
```

---

## 🎯 Domains vs Features (명확한 구분)

### Domain = "무엇" (What)

```typescript
// ✅ 비즈니스 사실 (Fact)
const result = await checkUserStatus(id);
// { status: 'NEW_USER', verificationToken: '...' }

// ❌ 판단/분기 금지
if (result.isNewUser) router.push('/signup') // Feature 영역
```

**특징:**
- 비즈니스 엔티티 (User, Auth, Product)
- 재사용 가능
- 라우팅 금지
- 순수 데이터

### Feature = "어떻게" (How)

```typescript
// ✅ 비즈니스 정책 (Decision)
const result = await checkStatus.mutateAsync(id);

if (result.status === 'NEW_USER') {
  router.push('/signup'); // ✅ 정책
} else {
  router.push('/main'); // ✅ 정책
}
```

**특징:**
- 사용자 시나리오 (로그인, 회원가입)
- 비즈니스 규칙
- 라우팅 포함
- Domain 조합

---

## 📂 상세 폴더 구조

```
src/
├── app/                     # Page
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx     # <LoginWidget />
│   │   └── signup/
│   │       └── page.tsx     # <SignupWidget />
│   └── api/                 # Backend API
│       └── auth/
│
├── widgets/                 # Widget (조립)
│   └── auth/
│       ├── LoginWidget.tsx  # LoginFlow + Layout
│       └── SignupWidget.tsx
│
├── features/                # Feature (비즈니스 로직)
│   └── auth/
│       ├── hooks/           # 플로우 로직
│       │   ├── useGeneralSignupFlow.ts
│       │   ├── useSnsAuthFlow.ts
│       │   └── useGeneralLoginFlow.ts
│       └── ui/              # Feature UI
│           ├── LoginFlow.tsx
│           └── SignupFlow.tsx
│
├── domains/                 # Domain (순수 데이터)
│   └── auth/
│       ├── model/           # 데이터 레이어
│       │   ├── auth.api.ts         # ✅ API 함수
│       │   ├── auth.queries.ts     # ✅ React Query
│       │   ├── auth.types.ts       # ✅ 타입
│       │   ├── auth.errors.ts      # ✅ 에러
│       │   └── auth.store.ts       # ✅ 상태
│       └── ui/              # 재사용 UI
│           ├── login/
│           │   └── LoginForm.tsx   # ✅ 순수 UI
│           ├── signup/
│           │   ├── PassAuthButton.tsx
│           │   ├── CredentialsForm.tsx
│           │   └── SignupStepper.tsx
│           ├── social/
│           │   └── SocialLoginSection.tsx
│           └── common/
│               └── LoadingOverlay.tsx
│
├── shared/                  # Shared (범용)
│   ├── ui/
│   │   ├── Button.tsx
│   │   └── Input.tsx
│   ├── hooks/
│   │   ├── useHistory.ts
│   │   └── animations/
│   └── utils/
│
└── core/                    # Core (인프라)
    ├── api/
    │   └── client.ts
    ├── config/
    │   └── env.ts
    └── lib/
```

---

## 💡 실전 예시

### 일반 회원가입 플로우

```typescript
// 1. Domain: 데이터 처리
domains/auth/model/auth.api.ts
→ checkUserStatus(), registerGeneral()

domains/auth/model/auth.queries.ts
→ useCheckUserStatus(), useRegisterGeneral()

// 2. Domain: 재사용 UI
domains/auth/ui/signup/CredentialsForm.tsx
→ 순수 폼 컴포넌트

// 3. Feature: 비즈니스 로직
features/auth/hooks/useGeneralSignupFlow.ts
→ 본인인증 → 상태 확인 → 분기 → 회원가입

// 4. Feature: UI 조합
features/auth/ui/SignupFlow.tsx
→ CredentialsForm + PassAuthButton 조합

// 5. Widget: 조립
widgets/auth/SignupWidget.tsx
→ SignupFlow + AuthContainer

// 6. Page: 라우팅
app/(auth)/signup/page.tsx
→ <SignupWidget />
```

---

## 🛠️ 기술 스택

- **Framework:** Next.js 16.1.1 (App Router)
- **Language:** TypeScript
- **Styling:** SCSS Modules
- **Animation:** GSAP
- **Server State:** TanStack React Query
- **Client State:** Zustand
- **Validation:** Zod

---

## 🔐 환경 변수

`.env.local` 파일:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_KAKAO_CLIENT_ID=your_id
NEXT_PUBLIC_NAVER_CLIENT_ID=your_id
NEXT_PUBLIC_IMP_CODE=your_code
DATABASE_URL=postgresql://...
JWT_SECRET=your_secret
```

---

## 📖 주요 문서

### 필독
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - 완전한 아키텍처 가이드 ⭐⭐⭐
  - Domains vs Features 구분 기준
  - 7가지 철칙
  - 실전 예시 (Before/After)
  - 의존성 검증 방법

---

## 🚨 개발 규칙

### Domain
```typescript
✅ 순수 데이터, API 호출, React Query
✅ 재사용 가능한 UI
❌ useRouter 금지
❌ Feature import 금지
❌ 비즈니스 규칙 금지
```

### Feature
```typescript
✅ 비즈니스 로직, 플로우
✅ 라우팅, 분기
✅ Domain hook 사용
❌ 직접 fetch 금지
❌ Widget import 금지
```

### Widget
```typescript
✅ Feature 조립
✅ 레이아웃 관리
❌ 비즈니스 로직 금지
```

### Page
```typescript
✅ Widget 렌더링만
❌ 모든 로직 금지
```

---

## 🎓 학습 순서

1. **ARCHITECTURE.md** 읽기 (30분)
2. 기존 코드 분석 (30분)
   - `domains/auth/` 구조
   - `features/auth/` 플로우
3. 실습: 간단한 기능 추가 (1시간)

---

**Version:** 2.0  
**Status:** ✅ Production Ready  
**Architecture:** FSD + DDD + Widget Layer  
**Last Updated:** 2026-01-27



/* ==========================================
   FOUNDATION COLORS
========================================== */

:root {
  /* Neutral */
  --neutral-140: #1f2329;
  --neutral-100: #3d434c;
  --neutral-80: #606874;
  --neutral-60: #8d96a2;
  --neutral-40: #c4c9d1;
  --neutral-20: #e8ebef;
  --neutral-10: #f5f7fa;

  /* Basic Button */
  --button-140: #20252b;
  --button-100: #37404a;
  --button-80: #55606e;
  --button-60: #7f8997;
  --button-40: #bcc2ca;
  --button-20: #e4e7eb;
  --button-10: #f7f8fa;

  /* Primary */
  --primary-140: #0b5b32;
  --primary-120: #0d7741;
  --primary-100: #12a053; /* base */
  --primary-80: #35bc72;
  --primary-60: #6ad49b;
  --primary-40: #a9ebc7;
  --primary-20: #ddf8e9;
  --primary-10: #f2fcf6;

  /* Success */
  --success-140: #205ca8;
  --success-120: #2c73d8;
  --success-100: #4a90ff;
  --success-80: #72acff;
  --success-60: #a0c8ff;
  --success-40: #cfe2ff;
  --success-20: #eaf2ff;
  --success-10: #f6f9ff;

  /* Warning */
  --warning-140: #b74b1d;
  --warning-120: #d96126;
  --warning-100: #ff813c;
  --warning-80: #ff9c69;
  --warning-60: #ffbe9e;
  --warning-40: #ffdcca;
  --warning-20: #fff0e7;
  --warning-10: #fff8f4;

  /* Error */
  --error-140: #bf1c4a;
  --error-120: #e12b5d;
  --error-100: #ff4775;
  --error-80: #ff6e92;
  --error-60: #ff9eb4;
  --error-40: #ffc9d5;
  --error-20: #ffe8ee;
  --error-10: #fff5f8;

  /* Secondary */
  --pink-100: #ff4e85;
  --orange-100: #ff8d3f;
  --yellow-100: #ffc93c;
  --green-100: #1dcf71;
  --skyblue-100: #4ab8ff;
  --blue-100: #4f67ff;
  --opium-100: #8a839d;
  --black-100: #222222;
}


/* ==========================================
   SEMANTIC TOKENS
========================================== */

:root {
  /* Text */
  --text-primary: var(--neutral-140);
  --text-secondary: var(--neutral-80);
  --text-disabled: var(--neutral-40);

  /* Background */
  --bg-primary: #fff;
  --bg-secondary: var(--neutral-10);

  /* Border */
  --border-default: var(--neutral-20);
  --border-focus: var(--primary-100);

  /* Status */
  --status-success: var(--success-100);
  --status-warning: var(--warning-100);
  --status-error: var(--error-100);

  /* Button */
  --button-primary-bg: var(--primary-100);
  --button-primary-hover: var(--primary-120);
  --button-disabled: var(--neutral-20);
}
