# 카카오 간편 로그인 with Prisma ORM

Next.js 15 + Prisma + 카카오 OAuth 2.0 완전한 구현

## 🚀 빠른 시작 (SQLite 사용 - 가장 쉬움)

```bash
# 1. 프로젝트 디렉토리로 이동
cd /Users/mz01-chansm/Desktop/side-project/admin/apps/poc

# 2. 패키지 설치
npm install

# 3. .env.local 파일 생성
cp .env.example .env.local
# .env.local 파일을 열어서 카카오 API 키 입력

# 4. Prisma 설정 (SQLite 사용)
# prisma/schema.prisma에서 provider를 "sqlite"로 변경
# datasource db {
#   provider = "sqlite"
#   url      = env("DATABASE_URL")
# }

# .env.local에 DATABASE_URL 추가
# DATABASE_URL="file:./dev.db"

# 5. Prisma Client 생성
npx prisma generate

# 6. 데이터베이스 생성
npx prisma db push

# 7. 개발 서버 실행
npm run dev
```

브라우저에서 `http://localhost:3000` 접속!

## 📦 설치된 패키지

```json
{
  "dependencies": {
    "@prisma/client": "^6.2.1", // Prisma ORM 클라이언트
    "jose": "^6.1.3", // JWT 생성/검증
    "next": "16.1.1", // Next.js 15
    "react": "19.2.3", // React 19
    "react-dom": "19.2.3",
    "zod": "^3.24.1" // 환경 변수 검증
  },
  "devDependencies": {
    "prisma": "^6.2.1" // Prisma CLI
  }
}
```

## 🗄️ Prisma 명령어

```bash
# Prisma Client 생성 (스키마 변경 시마다)
npm run db:generate

# DB 스키마 적용 (개발용 - 빠름)
npm run db:push

# DB GUI 열기
npm run db:studio

# 마이그레이션 (프로덕션용)
npm run db:migrate
```

## 🔐 환경 변수 (.env.local)

```env
# 데이터베이스 (선택: SQLite / PostgreSQL / MySQL)
# SQLite (개발용 - 가장 쉬움)
DATABASE_URL="file:./dev.db"

# PostgreSQL (프로덕션)
# DATABASE_URL="postgresql://username:password@localhost:5432/kakao_auth?schema=public"

# MySQL
# DATABASE_URL="mysql://username:password@localhost:3306/kakao_auth"

# 카카오 API 키
NEXT_PUBLIC_KAKAO_CLIENT_ID=5b4edfa7e746c3f6646db7e24abb118c
NEXT_PUBLIC_KAKAO_REDIRECT_URI=http://localhost:3000/api/auth/kakao/callback
KAKAO_CLIENT_SECRET=your_kakao_client_secret

# JWT Secret (최소 32자)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-required
```

## 📊 데이터베이스 구조

### User 테이블

| 컬럼명       | 타입     | 설명                                |
| ------------ | -------- | ----------------------------------- |
| id           | UUID     | 우리 서비스의 고유 ID (Primary Key) |
| kakaoId      | String   | 카카오 고유 ID (Unique)             |
| email        | String?  | 이메일 (선택)                       |
| nickname     | String?  | 닉네임 (선택)                       |
| profileImage | String?  | 프로필 이미지 URL                   |
| provider     | String   | 소셜 로그인 제공자 ("kakao")        |
| createdAt    | DateTime | 가입일                              |
| updatedAt    | DateTime | 수정일                              |
| lastLoginAt  | DateTime | 마지막 로그인                       |

### Prisma Schema (prisma/schema.prisma)

```prisma
model User {
  id           String   @id @default(uuid())
  kakaoId      String   @unique @map("kakao_id")
  email        String?
  nickname     String?
  profileImage String?  @map("profile_image")
  provider     String   @default("kakao")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")
  lastLoginAt  DateTime @default(now()) @map("last_login_at")

  @@index([kakaoId])
  @@index([email])
  @@map("users")
}
```

## 🔄 인증 흐름

```
1. 사용자가 "카카오로 로그인" 클릭
   ↓
2. 카카오 로그인 페이지로 리다이렉트
   ↓
3. 카카오 로그인 완료 → 인가 코드 발급
   ↓
4. /api/auth/kakao/callback?code=xxxxx 호출
   ↓
5. 서버에서 처리:
   ① 인가 코드 → 카카오 Access Token
   ② Access Token → 카카오 사용자 정보
   ③ Prisma로 DB 조회 (카카오 ID)
      - 없으면: 🆕 신규 회원 가입 (DB INSERT)
      - 있으면: 🔄 기존 회원 로그인 (DB UPDATE)
   ④ JWT 세션 토큰 생성
   ⑤ httpOnly 쿠키 저장
   ↓
6. 메인 페이지로 리다이렉트
```

## 📁 프로젝트 구조

```
poc/
├── prisma/
│   └── schema.prisma              # Prisma 스키마
├── app/
│   ├── api/
│   │   └── auth/
│   │       ├── kakao/callback/route.ts  # 카카오 콜백
│   │       ├── logout/route.ts          # 로그아웃
│   │       └── me/route.ts              # 사용자 정보
│   ├── login/page.tsx                   # 로그인 페이지
│   └── page.tsx                         # 메인 페이지
├── lib/
│   ├── config.ts                 # 환경 변수 (Zod 검증)
│   ├── prisma.ts                 # Prisma Client
│   ├── database.ts               # DB 함수 (Prisma 사용)
│   ├── session.ts                # 세션 관리 (JWT)
│   └── types.ts                  # TypeScript 타입
├── .env.local                    # 환경 변수 (git 무시)
├── .env.example                  # 환경 변수 예시
└── package.json
```

## 💾 데이터베이스 함수 (lib/database.ts)

```typescript
// 카카오 ID로 사용자 조회
const user = await findUserByKakaoId(kakaoId);

// 신규 회원 생성
const newUser = await createUser({
  kakaoId: '123456789',
  email: 'user@example.com',
  nickname: '홍길동',
  profileImage: 'https://...',
});

// 사용자 정보 업데이트
await updateUser(userId, {
  nickname: '새_닉네임',
  profileImage: '새_프로필_이미지',
});

// 마지막 로그인 시간 업데이트
await updateLastLogin(userId);
```

## 🎯 신규 회원 vs 기존 회원

### 신규 회원 (첫 로그인)

```typescript
const user = await findUserByKakaoId(kakaoId);
if (!user) {
  // 🆕 DB에 저장
  user = await createUser({ ... });
  console.log('✅ [DB] 신규 사용자 생성:', user.id);
}
```

### 기존 회원 (재로그인)

```typescript
if (user) {
  // 🔄 프로필 업데이트 (카카오에서 변경했을 수 있음)
  await updateUser(user.id, { ... });
  await updateLastLogin(user.id);
  console.log('✅ [DB] 사용자 정보 업데이트:', user.id);
}
```

## 🔍 Prisma Studio로 DB 확인

```bash
# DB GUI 열기
npm run db:studio
```

브라우저에서 `http://localhost:5555` 자동 오픈

- 테이블 데이터 조회/수정/삭제
- 실시간 반영

## 📚 상세 가이드

- **Prisma 설정**: [PRISMA_SETUP.md](./PRISMA_SETUP.md) 참고
- **데이터베이스 선택**: SQLite / PostgreSQL / MySQL
- **마이그레이션**: 개발용 vs 프로덕션용

## 🚀 배포 (Vercel)

### 1. PostgreSQL 준비 (Vercel Postgres 또는 외부)

```bash
# Vercel Postgres 추천
# https://vercel.com/docs/storage/vercel-postgres
```

### 2. 환경 변수 설정

Vercel Dashboard → Settings → Environment Variables

- `DATABASE_URL`: PostgreSQL 연결 URL
- `KAKAO_CLIENT_SECRET`: 카카오 Client Secret
- `JWT_SECRET`: JWT 시크릿
- `NEXT_PUBLIC_*`: 클라이언트 변수들

### 3. 배포 후 마이그레이션

```bash
# Vercel 빌드 시 자동 실행되도록 package.json 수정
"scripts": {
  "build": "prisma generate && prisma db push && next build"
}
```

## 🔐 보안 체크리스트

- ✅ Client Secret 사용 (서버 인증)
- ✅ JWT httpOnly 쿠키 (XSS 방지)
- ✅ 카카오 API 재검증 (토큰 위조 방지)
- ✅ Prisma parameterized queries (SQL Injection 방지)
- ✅ Zod 환경 변수 검증
- ✅ .env.local git 무시

## 📖 참고 자료

- [Prisma 공식 문서](https://www.prisma.io/docs)
- [Next.js 15 문서](https://nextjs.org/docs)
- [카카오 로그인 API](https://developers.kakao.com/docs/latest/ko/kakaologin/rest-api)

## 📄 라이선스

MIT
