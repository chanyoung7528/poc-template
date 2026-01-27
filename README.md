# POC Template - Next.js 실무 프로젝트

> **FSD + DDD 아키텍처 기반 엔터프라이즈급 Next.js 애플리케이션**

---

## 🚀 Quick Start

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev

# 프로덕션 빌드
pnpm build
```

---

## 📁 프로젝트 구조

```
src/
├── app/              # Next.js Pages (라우팅만)
├── domains/          # 비즈니스 엔티티 (무엇: User, Auth)
├── features/         # 사용자 시나리오 (어떻게: 로그인, 회원가입)
├── shared/           # 전역 공통 (Button, Input, useDebounce)
└── core/             # 핵심 인프라 (API 클라이언트, 환경 변수)
```

### 핵심 원칙

**Domains = 무엇 (What)**
- 비즈니스 엔티티 중심
- 재사용 가능
- 순수 로직

**Features = 어떻게 (How)**
- 사용자 시나리오
- 비즈니스 규칙
- 여러 Domain 조합

---

## 🎯 주요 기능

### 인증/회원가입
✅ 일반 회원가입 (아이디/비밀번호)  
✅ SNS 간편가입 (카카오/네이버)  
✅ 본인인증 (PASS)  
✅ 계정 연동 (일반 ↔ SNS)  

### 토큰 기반 인증
- **Verification Token** (15분) - 본인인증 후 일반 회원가입
- **Register Token** (5분) - SNS 회원가입
- **Link Token** (5분) - 계정 연동
- **Auth Token** (24시간) - API 인증
- **Refresh Token** (30일) - 토큰 재발급

---

## 📖 문서

### 필독 문서
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - 전체 아키텍처 가이드 ⭐⭐⭐
  - Domains vs Features 구분 기준
  - 전체 폴더 구조 상세 설명
  - 실전 예시
  - 인증 시스템 구조

---

## 🛠️ 기술 스택

### Core
- **Framework:** Next.js 16.1.1 (App Router + Turbopack)
- **Language:** TypeScript
- **Styling:** SCSS Modules
- **Animation:** GSAP

### State Management
- **Server State:** TanStack React Query
- **Client State:** Zustand
- **Form:** React Hook Form + Zod

### Infrastructure
- **Database:** Prisma (PostgreSQL)
- **Auth:** JWT (jose)
- **Validation:** Zod

---

## 🔐 환경 변수 설정

`.env.local` 파일 생성:

```env
# API
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_API_TIMEOUT=30000

# OAuth
NEXT_PUBLIC_KAKAO_CLIENT_ID=your_kakao_client_id
NEXT_PUBLIC_KAKAO_REDIRECT_URI=http://localhost:3000/api/auth/kakao/callback
NEXT_PUBLIC_NAVER_CLIENT_ID=your_naver_client_id
NEXT_PUBLIC_NAVER_REDIRECT_URI=http://localhost:3000/api/auth/naver/callback

# 본인인증
NEXT_PUBLIC_IMP_CODE=your_iamport_code
NEXT_PUBLIC_PORTONE_CHANNEL_KEY=your_portone_channel_key
IAMPORT_API_KEY=your_iamport_api_key
IAMPORT_API_SECRET=your_iamport_api_secret

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# JWT
JWT_SECRET=your-jwt-secret-min-32-characters
```

---

## 📊 폴더 구조 상세

### Domains (비즈니스 엔티티)

```
domains/auth/
├── model/                    # 데이터 레이어
│   ├── auth.api.ts          # API 호출 함수 (순수)
│   ├── auth.queries.ts      # React Query hooks
│   ├── auth.types.ts        # 타입 정의
│   ├── auth.errors.ts       # 에러 코드 & 메시지
│   ├── auth.store.ts        # Zustand 상태
│   └── auth.utils.ts        # 유틸리티
└── ui/                      # 프레젠테이션 레이어
    ├── login/               # 로그인 UI
    ├── signup/              # 회원가입 UI
    └── common/              # 공통 UI
```

### Features (사용자 시나리오)

```
features/auth/
├── hooks/                   # 비즈니스 로직
│   ├── useGeneralSignupFlow.ts    # 일반 회원가입
│   ├── useSnsAuthFlow.ts          # SNS 로그인/회원가입
│   └── useGeneralLoginFlow.ts     # 일반 로그인
└── ui/                      # 플로우 조합 UI
    ├── LoginFlow.tsx        # 로그인 전체 화면
    └── SignupFlow.tsx       # 회원가입 전체 화면
```

---

## 🎯 개발 가이드

### 새 기능 개발 시

1. **Domain Model 작성** (`domains/[entity]/model/`)
   ```typescript
   // API 함수
   export const authApi = {
     getData: () => apiClient.get('/api/...'),
   }
   
   // React Query Hook
   export function useGetData() {
     return useQuery({ queryFn: authApi.getData })
   }
   ```

2. **Domain UI 작성** (`domains/[entity]/ui/`)
   ```typescript
   // 재사용 가능한 UI
   export function DataCard({ data }: Props) {
     return <div>{data.name}</div>
   }
   ```

3. **Feature Hook 작성** (`features/[scenario]/hooks/`)
   ```typescript
   // 비즈니스 로직 + 플로우
   export function useDataFlow() {
     const router = useRouter();
     const getData = useGetData(); // ← Domain hook 사용
     
     const handleAction = async () => {
       const result = await getData.refetch();
       if (result.needsAction) {
         router.push('/next-step'); // ← 라우팅
       }
     }
     
     return { handleAction }
   }
   ```

4. **Feature UI 작성** (`features/[scenario]/ui/`)
   ```typescript
   // 여러 Domain UI 조합
   export function DataFlow() {
     const { handleAction } = useDataFlow();
     return (
       <>
         <DataCard /> {/* ← Domain UI */}
         <Button onClick={handleAction} />
       </>
     )
   }
   ```

5. **Page 작성** (`app/[route]/page.tsx`)
   ```typescript
   export default function DataPage() {
     return <DataFlow />
   }
   ```

---

## 🚨 금지 사항

### ❌ Component에서 직접 fetch
```typescript
const response = await fetch('/api/...'); // ❌
```

### ❌ Feature에서 axios 직접 호출
```typescript
await axios.post('/api/...'); // ❌
```

### ❌ process.env 직접 접근
```typescript
const apiUrl = process.env.NEXT_PUBLIC_API_URL; // ❌

// ✅ 올바른 방법
import { env } from '@/core/config/env';
const apiUrl = env.API_URL;
```

---

## 📋 코드 리뷰 체크리스트

### Domain 체크
- [ ] 특정 엔티티에 대한 것인가?
- [ ] 재사용 가능한가?
- [ ] 비즈니스 로직이 없는가?
- [ ] 라우팅이 없는가?

### Feature 체크
- [ ] 특정 시나리오를 다루는가?
- [ ] Domain hook을 사용하는가?
- [ ] 비즈니스 규칙을 포함하는가?
- [ ] 여러 Domain을 조합하는가?

---

## 🔍 주요 API 엔드포인트

### 인증
```
POST /api/auth/check-user-status      # 사용자 상태 확인
POST /api/auth/check-sns-user         # SNS 사용자 확인
POST /api/auth/register-general       # 일반 회원가입
POST /api/auth/register-sns           # SNS 회원가입
POST /api/auth/login-general          # 일반 로그인
POST /api/auth/login-sns              # SNS 로그인
POST /api/auth/link-general           # 일반 계정 연동
POST /api/auth/link-sns               # SNS 계정 연동
```

---

## 📞 문의

프로젝트 구조나 개발 방식에 대한 질문은 [ARCHITECTURE.md](./ARCHITECTURE.md)를 참고하세요.

---

**Version:** 1.0.0  
**Status:** ✅ Production Ready  
**Last Updated:** 2026-01-27
