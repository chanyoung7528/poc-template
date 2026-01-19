import { z } from 'zod';

// 환경 변수 원시값
const rawEnv = {
  // 클라이언트 공개 변수
  kakaoClientId: process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID || '',
  kakaoRedirectUri: process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI || '',
  naverClientId: process.env.NEXT_PUBLIC_NAVER_CLIENT_ID || '',
  naverRedirectUri: process.env.NEXT_PUBLIC_NAVER_REDIRECT_URI || '',

  // 서버 전용 변수
  kakaoClientSecret: process.env.KAKAO_CLIENT_SECRET || '',
  naverClientSecret: process.env.NAVER_CLIENT_SECRET || '',
  jwtSecret: process.env.JWT_SECRET || '',
};

// 환경 변수 스키마 정의
const envSchema = z.object({
  kakaoClientId: z
    .string()
    .min(1, { message: 'NEXT_PUBLIC_KAKAO_CLIENT_ID가 설정되지 않았습니다.' }),
  kakaoRedirectUri: z
    .string()
    .url({
      message: 'NEXT_PUBLIC_KAKAO_REDIRECT_URI는 유효한 URL이어야 합니다.',
    }),
  kakaoClientSecret: z
    .string()
    .min(1, { message: 'KAKAO_CLIENT_SECRET이 설정되지 않았습니다.' }),
  naverClientId: z
    .string()
    .min(1, { message: 'NEXT_PUBLIC_NAVER_CLIENT_ID가 설정되지 않았습니다.' }),
  naverRedirectUri: z
    .string()
    .url({
      message: 'NEXT_PUBLIC_NAVER_REDIRECT_URI는 유효한 URL이어야 합니다.',
    }),
  naverClientSecret: z
    .string()
    .min(1, { message: 'NAVER_CLIENT_SECRET이 설정되지 않았습니다.' }),
  jwtSecret: z
    .string()
    .min(32, { message: 'JWT_SECRET은 최소 32자 이상이어야 합니다.' }),
});

// 환경 변수 검증
const parsed = envSchema.safeParse(rawEnv);

if (!parsed.success) {
  console.error('[환경변수 검증 실패]', parsed.error.flatten().fieldErrors);
  throw new Error(
    `환경변수가 올바르지 않습니다.\n${JSON.stringify(parsed.error.flatten().fieldErrors, null, 2)}`
  );
}

const validatedEnv = parsed.data;

// 검증된 환경 변수 export
export const env = {
  // 카카오 설정
  kakao: {
    clientId: validatedEnv.kakaoClientId,
    clientSecret: validatedEnv.kakaoClientSecret,
    redirectUri: validatedEnv.kakaoRedirectUri,
  },

  // 네이버 설정
  naver: {
    clientId: validatedEnv.naverClientId,
    clientSecret: validatedEnv.naverClientSecret,
    redirectUri: validatedEnv.naverRedirectUri,
  },

  // JWT 설정
  jwt: {
    secret: validatedEnv.jwtSecret,
  },
} as const;

// 타입 export
export type Env = typeof env;

// 환경 변수 검증 함수 (선택적 사용)
export function validateEnv(): void {
  const requiredEnvVars = [
    'NEXT_PUBLIC_KAKAO_CLIENT_ID',
    'KAKAO_CLIENT_SECRET',
    'NEXT_PUBLIC_KAKAO_REDIRECT_URI',
    'NEXT_PUBLIC_NAVER_CLIENT_ID',
    'NAVER_CLIENT_SECRET',
    'NEXT_PUBLIC_NAVER_REDIRECT_URI',
    'JWT_SECRET',
  ];

  const missingEnvVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingEnvVars.length > 0) {
    throw new Error(
      `다음 환경 변수가 설정되지 않았습니다: ${missingEnvVars.join(', ')}`
    );
  }
}
