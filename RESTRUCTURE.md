# 프로젝트 구조 개선 완료

## 🎯 변경 사항

### 1. 폴더 구조 재구성 (Feature-Sliced Design 기반)

프로젝트가 다음과 같은 계층 구조로 재구성되었습니다:

```
src/
┣ 📂 app/ (Presentation Layer)
┃ ┣ 📂 (auth)/
┃ ┃ ┣ 📂 login/              # 로그인 페이지
┃ ┃ ┣ 📂 signup/             # 회원가입 페이지
┃ ┃ ┣ 📂 verify/             # PASS 인증 페이지
┃ ┃ ┗ 📂 reset-password/     # 비밀번호 재설정 페이지
┃ ┗ 📂 api/auth/             # API 라우트
┃
┣ 📂 domains/ (Business Entities) - 재사용 가능한 도메인 자산
┃ ┗ 📂 auth/
┃   ┣ 📂 model/
┃   ┃ ┣ 📜 auth.api.ts       # Axios 기반 인증 API
┃   ┃ ┣ 📜 auth.queries.ts   # React Query (Mutations/Queries)
┃   ┃ ┣ 📜 auth.store.ts     # Zustand Store (tempToken, 유저 정보)
┃   ┃ ┣ 📜 auth.types.ts     # 타입 정의
┃   ┃ ┗ 📜 auth.utils.ts     # 순수 함수 (maskId, validatePassword 등)
┃   ┗ 📂 ui/
┃     ┣ 📜 LoginForm.tsx            # 기본 ID/PW 입력 UI
┃     ┣ 📜 PassAuthButton.tsx       # PASS SDK 호출 버튼
┃     ┣ 📜 TermsAgreement.tsx       # 약관 목록 및 체크박스
┃     ┗ 📜 MaskedAccountView.tsx    # 마스킹 아이디 노출 UI
┃
┣ 📂 features/ (Use Cases) - 도메인 자산을 조립한 실제 기능
┃ ┗ 📂 auth/
┃   ┣ 📂 hooks/
┃   ┃ ┣ 📜 useSignupFlow.ts         # 가입 절차 분기
┃   ┃ ┣ 📜 useLoginFlow.ts          # 로그인 및 아이디 찾기 흐름
┃   ┃ ┗ 📜 useResetPasswordFlow.ts  # 비밀번호 재설정 프로세스
┃   ┣ 📂 components/
┃   ┃ ┣ 📜 SocialLoginSection.tsx   # 카카오/네이버/애플 버튼 모음
┃   ┃ ┗ 📜 SignupStepper.tsx        # 단계별 가입 레이아웃
┃   ┗ 📂 ui/
┃     ┣ 📜 SignupFlow.tsx           # 회원가입 전체 플로우
┃     ┗ 📜 LoginFlow.tsx            # 로그인 전체 플로우
┃
┣ 📂 shared/ (Common)
┃ ┣ 📂 ui/                  # Button, Input, Modal (디자인 시스템)
┃ ┗ 📂 api/                 # Axios Instance & Interceptor
┃
┗ 📂 lib/                   # React Query, 유틸리티, 설정 등
```

### 2. Tailwind CSS → SCSS Module 전환

모든 컴포넌트의 스타일이 Tailwind CSS `className`에서 SCSS Module 방식으로 변경되었습니다.

**Before:**

```tsx
<div className="flex min-h-screen items-center justify-center bg-gray-50">
```

**After:**

```tsx
import styles from './LoginFlow.module.scss';

<div className={styles.container}>
```

**장점:**

- 더 명확한 스타일 범위 (스타일 충돌 방지)
- 재사용 가능한 스타일 변수 및 믹스인
- 더 나은 IDE 지원 및 자동완성
- 컴포넌트별 독립적인 스타일 관리

### 3. 상태 관리 및 데이터 페칭

- **React Query**: 서버 상태 관리
- **Zustand**: 클라이언트 전역 상태 (인증 상태, 임시 토큰)
- **Axios**: HTTP 클라이언트 (인터셉터 포함)

### 4. 설치된 주요 패키지

```json
{
  "dependencies": {
    "zustand": "^5.0.10",
    "axios": "^1.13.2",
    "@tanstack/react-query": "^5.90.16"
  },
  "devDependencies": {
    "sass": "^1.97.2"
  }
}
```

## 🚀 시작하기

### 1. 의존성 설치

```bash
pnpm install
```

### 2. Prisma 클라이언트 생성

```bash
pnpm db:generate
```

### 3. 개발 서버 실행

```bash
pnpm dev
```

### 4. 프로덕션 빌드

```bash
pnpm build
pnpm start
```

## 📝 주요 개선 사항

### 계층 분리 (Layered Architecture)

1. **Domains**: 순수한 비즈니스 로직과 UI 컴포넌트
   - 다른 레이어에 의존하지 않음
   - 재사용성 극대화

2. **Features**: 도메인을 조합한 실제 기능
   - 비즈니스 유스케이스 구현
   - 플로우 제어

3. **App**: 페이지 조립 및 라우팅
   - Features를 조합하여 페이지 구성
   - 최소한의 로직

4. **Shared**: 공통 컴포넌트 및 유틸리티
   - 프로젝트 전체에서 사용되는 공통 자산

### 타입 안정성 강화

- TypeScript strict 모드
- 명확한 인터페이스 정의
- 타입 추론 최대 활용

### 코드 품질

- ESLint 설정
- Prettier 적용
- 일관된 파일 명명 규칙

## 🔧 환경 변수

`.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# 카카오
NEXT_PUBLIC_KAKAO_CLIENT_ID=
KAKAO_CLIENT_SECRET=
NEXT_PUBLIC_KAKAO_REDIRECT_URI=http://localhost:3000/api/auth/kakao/callback

# 네이버
NEXT_PUBLIC_NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=
NEXT_PUBLIC_NAVER_REDIRECT_URI=http://localhost:3000/api/auth/naver/callback

# JWT
JWT_SECRET=your-secret-key-min-32-chars

# Database
DATABASE_URL=
```

## 📚 추가 개발 가이드

### 새로운 도메인 추가하기

1. `src/domains/[domain-name]/` 폴더 생성
2. `model/` 폴더에 비즈니스 로직 작성
3. `ui/` 폴더에 도메인 특화 UI 컴포넌트 작성

### 새로운 기능 추가하기

1. `src/features/[feature-name]/` 폴더 생성
2. `hooks/`에 비즈니스 로직 훅 작성
3. `components/`에 기능별 컴포넌트 작성
4. `ui/`에 통합 플로우 컴포넌트 작성

### SCSS Module 사용법

```scss
// Component.module.scss
.container {
  display: flex;

  .title {
    font-size: 1.5rem;
    color: #333;
  }
}
```

```tsx
// Component.tsx
import styles from './Component.module.scss';

export function Component() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Title</h1>
    </div>
  );
}
```

## 🎉 완료!

프로젝트가 성공적으로 재구성되었습니다. 이제 더 확장 가능하고 유지보수하기 쉬운 구조를 갖추게 되었습니다.
