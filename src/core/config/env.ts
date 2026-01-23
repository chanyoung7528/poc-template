import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z
    .string()
    .min(1, "API_URL은 필수입니다")
    .refine(
      (val) =>
        val.startsWith("/") ||
        val.startsWith("http://") ||
        val.startsWith("https://"),
      {
        message: "유효한 URL 또는 절대 경로 형식이 아닙니다",
      }
    ),

  NEXT_PUBLIC_API_TIMEOUT: z.coerce
    .number()
    .min(1000, "타임아웃은 최소 1000ms 이상이어야 합니다")
    .default(30000),

  NEXT_PUBLIC_FEATURE_DEBUG: z
    .string()
    .optional()
    .default("false")
    .transform((val) => val === "true"),

  NEXT_PUBLIC_API_ACCEPT_LANGUAGE: z.string().optional(),

  API_TARGET_URL: z.string().url().optional(),

  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  ANALYZE: z
    .string()
    .optional()
    .default("false")
    .transform((val) => val === "true"),
});

type EnvSchema = z.infer<typeof envSchema>;

function validateEnv(): EnvSchema {
  try {
    return envSchema.parse({
      NEXT_PUBLIC_API_URL:
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
      NEXT_PUBLIC_API_TIMEOUT: process.env.NEXT_PUBLIC_API_TIMEOUT || 30000,
      NEXT_PUBLIC_FEATURE_DEBUG:
        process.env.NEXT_PUBLIC_FEATURE_DEBUG || "false",
      NEXT_PUBLIC_API_ACCEPT_LANGUAGE:
        process.env.NEXT_PUBLIC_API_ACCEPT_LANGUAGE || "ko-KR",
      API_TARGET_URL: process.env.API_TARGET_URL || "http://localhost:3000",
      NODE_ENV: process.env.NODE_ENV || "development",
      ANALYZE: process.env.ANALYZE || "false",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues
        .map((issue) => `  ${issue.path.join(".")}: ${issue.message}`)
        .join("\n");
      throw new Error(`❌ 환경변수 검증 실패:\n\n${errorMessages}\n`);
    }
    throw error;
  }
}

const parsed = validateEnv();

const isServer = typeof window === "undefined";

export const env = {
  // API 설정
  API_URL: parsed.NEXT_PUBLIC_API_URL,
  API_TIMEOUT: parsed.NEXT_PUBLIC_API_TIMEOUT,
  API_ACCEPT_LANGUAGE: parsed.NEXT_PUBLIC_API_ACCEPT_LANGUAGE,

  // Feature Flags
  FEATURE_DEBUG: parsed.NEXT_PUBLIC_FEATURE_DEBUG,

  // Server-only
  API_TARGET_URL: isServer ? parsed.API_TARGET_URL : undefined,

  // Runtime
  NODE_ENV: parsed.NODE_ENV,
  ANALYZE: parsed.ANALYZE,
} as const;
