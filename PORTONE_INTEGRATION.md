# 포트원 PASS 본인인증 통합 가이드

## 📋 개요

포트원(PortOne)의 다날 본인인증을 사용하여 회원가입 시 본인인증 로직을 구현했습니다.
DDD 구조를 유지하면서 실제 테스트 가능한 형태로 구현되었습니다.

## 🏗️ 아키텍처

### 계층별 구조

```
📂 domains/auth/
  ├── model/
  │   ├── auth.types.ts        # PortOneResponse, CertificationResult 타입 정의
  │   ├── auth.api.ts          # verifyCertification API 함수
  │   └── auth.queries.ts      # useVerifyCertification React Query Mutation
  └── ui/
      └── PassAuthButton.tsx   # PASS 인증 버튼 컴포넌트

📂 features/auth/
  └── hooks/
      └── usePortOnePass.ts    # 포트원 인증 비즈니스 로직 훅

📂 app/(auth)/
  ├── verify/                  # PASS 인증 페이지
  ├── result/                  # 기존 회원 확인 결과 페이지
  └── guide/minor/             # 만 14세 미만 안내 페이지

📂 app/api/auth/
  └── verify-certification/    # 서버 검증 API (Mock 포함)
```

## 🔑 포트원 설정 정보

```bash
# .env.local에 추가
NEXT_PUBLIC_PORTONE_IMP_CODE=imp10391932

# 포트원 콘솔 설정 정보
채널키: channel-key-88b6256e-4e02-4177-95cf-353a986c43e6
PG상점아이디(CPID): A010002002
CPPWD: bbbbb
상품코드: 1111111111
```

## 📝 구현 플로우

### 1. 사용자 인증 요청

```typescript
// /verify 페이지에서 PassAuthButton 클릭
<PassAuthButton />
```

### 2. 포트원 SDK 초기화 및 인증창 열기

```typescript
// usePortOnePass.ts
const { IMP } = window;
IMP.init('imp10391932');
IMP.certification(data, callback);
```

### 3. 인증 성공 시 서버 검증

```typescript
// imp_uid를 서버로 전송
verifyCertificationMutation.mutate(rsp.imp_uid);
```

### 4. 서버 응답에 따른 분기 처리

#### Case 1: 신규 회원 (NEW)

```typescript
{
  status: 'NEW',
  certificationData: {
    name: '홍길동',
    phone: '010-1234-5678',
    birth: '19900101',
    gender: 'M'
  }
}
```

→ **회원가입 폼으로 이동** (`/signup`)

- certificationData를 sessionStorage에 저장하여 회원가입 폼에서 사용

#### Case 2: 기존 회원 (EXISTING)

```typescript
{
  status: 'EXISTING',
  user: {
    id: 'user123',
    maskedId: 'te**@example.com',
    provider: 'kakao'
  }
}
```

→ **기존 계정 안내 페이지로 이동** (`/auth/result`)

- 마스킹된 이메일과 가입 플랫폼 표시
- 로그인 페이지로 이동 유도

#### Case 3: 만 14세 미만 (UNDER_14)

```typescript
{
  status: 'UNDER_14',
  certificationData: { ... }
}
```

→ **가입 제한 안내 페이지로 이동** (`/auth/guide/minor`)

- 법적 제한 사항 안내
- 홈으로 이동

## 🧪 테스트 방법

### Mock API 시나리오 변경

`src/app/api/auth/verify-certification/route.ts` 파일에서 테스트 시나리오를 변경할 수 있습니다:

```typescript
const testScenario = 'NEW'; // 'NEW' | 'EXISTING' | 'UNDER_14'
```

### 각 시나리오별 테스트 순서

1. **신규 회원 테스트 (NEW)**

   ```typescript
   const testScenario = 'NEW';
   ```

   1. `/verify` 페이지 접속
   2. "PASS 인증으로 시작하기" 버튼 클릭
   3. 포트원 인증창에서 테스트 진행
   4. 인증 성공 후 `/signup` 페이지로 자동 이동 확인

2. **기존 회원 테스트 (EXISTING)**

   ```typescript
   const testScenario = 'EXISTING';
   ```

   1. `/verify` 페이지 접속
   2. PASS 인증 진행
   3. `/auth/result` 페이지로 이동
   4. 마스킹된 이메일 표시 확인

3. **만 14세 미만 테스트 (UNDER_14)**

   ```typescript
   const testScenario = 'UNDER_14';
   ```

   1. `/verify` 페이지 접속
   2. PASS 인증 진행
   3. `/auth/guide/minor` 페이지로 이동
   4. 안내 메시지 확인

## 🚀 실제 운영 환경 구현 가이드

### 1. 포트원 서버 API 연동

```typescript
// src/app/api/auth/verify-certification/route.ts

// 1. Access Token 발급
const getAccessToken = async () => {
  const response = await fetch('https://api.iamport.kr/users/getToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      imp_key: process.env.PORTONE_API_KEY,
      imp_secret: process.env.PORTONE_API_SECRET,
    }),
  });
  const data = await response.json();
  return data.response.access_token;
};

// 2. 본인인증 정보 조회
const getCertificationData = async (imp_uid: string, accessToken: string) => {
  const response = await fetch(
    `https://api.iamport.kr/certifications/${imp_uid}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  const data = await response.json();
  return data.response;
};
```

### 2. 나이 계산 로직

```typescript
function calculateAge(birth: string): number {
  // birth format: YYYYMMDD
  const birthYear = parseInt(birth.substring(0, 4));
  const birthMonth = parseInt(birth.substring(4, 6));
  const birthDay = parseInt(birth.substring(6, 8));

  const today = new Date();
  const birthDate = new Date(birthYear, birthMonth - 1, birthDay);

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}
```

### 3. 기존 회원 확인 로직

```typescript
// Prisma를 사용한 예시
const existingUser = await prisma.user.findFirst({
  where: {
    OR: [
      {
        name: certData.name,
        birth: certData.birth,
      },
      {
        phone: certData.phone,
      },
    ],
  },
  select: {
    id: true,
    email: true,
    provider: true,
  },
});

if (existingUser) {
  return NextResponse.json({
    status: 'EXISTING',
    user: {
      id: existingUser.id,
      maskedId: maskEmail(existingUser.email),
      provider: existingUser.provider,
    },
  });
}
```

### 4. 이메일 마스킹 유틸리티

```typescript
function maskEmail(email: string): string {
  const [localPart, domain] = email.split('@');
  const visibleLength = Math.max(1, Math.floor(localPart.length / 3));
  const masked =
    localPart.slice(0, visibleLength) +
    '*'.repeat(localPart.length - visibleLength);
  return `${masked}@${domain}`;
}
```

## 📱 소셜 로그인 연동

소셜 로그인(카카오/네이버)으로 최초 가입 시에도 PASS 인증을 거치도록 하려면:

### 1. 콜백 라우트 수정

```typescript
// src/app/api/auth/kakao/callback/route.ts

if (!user) {
  // 신규 회원인 경우
  const email = kakaoUser.kakao_account?.email;

  if (email) {
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return NextResponse.redirect(
        new URL(`/login?error=already_registered`, request.url)
      );
    }
  }

  // ✅ PASS 인증으로 리다이렉트 (소셜 정보는 세션에 임시 저장)
  sessionStorage.setItem(
    'pendingSocialAuth',
    JSON.stringify({
      provider: 'kakao',
      kakaoId,
      email,
      nickname: kakaoUser.kakao_account?.profile?.nickname,
      profileImage: kakaoUser.kakao_account?.profile?.profile_image_url,
    })
  );

  return NextResponse.redirect(new URL('/verify', request.url));
}
```

### 2. PASS 인증 후 소셜 정보 병합

```typescript
// src/features/auth/hooks/useSignupFlow.ts

const handleSignup = async (data: SignupData) => {
  // 세션에 저장된 소셜 정보 확인
  const pendingSocialAuth = sessionStorage.getItem('pendingSocialAuth');

  if (pendingSocialAuth) {
    const socialData = JSON.parse(pendingSocialAuth);

    // 소셜 정보 + 본인인증 정보 병합하여 회원가입
    await signupWithSocial({
      ...socialData,
      ...data,
      certificationVerified: true,
    });

    sessionStorage.removeItem('pendingSocialAuth');
  } else {
    await signup(data);
  }
};
```

## 🔒 보안 고려사항

1. **imp_uid 재사용 방지**
   - 사용된 imp_uid는 DB에 저장하여 중복 사용 차단
   - 유효기간 설정 (예: 10분)

2. **세션 보안**
   - sessionStorage 대신 암호화된 쿠키 사용 권장
   - 민감 정보는 서버 세션에만 저장

3. **API 인증**
   - 서버 API에 적절한 인증 미들웨어 적용
   - Rate Limiting 설정

## 🎯 다음 단계

- [ ] 포트원 관리자 콘솔에서 실제 채널 연동
- [ ] 운영 환경용 API 구현
- [ ] DB 스키마에 본인인증 정보 추가
- [ ] 소셜 로그인과 PASS 인증 통합
- [ ] 본인인증 이력 로깅
- [ ] 에러 핸들링 강화

## 📞 문의

포트원 관련 문의: https://portone.io/korea/ko/support
