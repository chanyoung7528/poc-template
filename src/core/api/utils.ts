import { logger } from "@/core/lib";
import { z } from "zod";

/**
 * API 응답 검증 유틸리티
 * Zod 스키마를 사용하여 런타임에 응답 데이터의 타입을 검증합니다.
 */
export function validateResponse<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error("API Response Validation Error:", error.flatten());
    } else {
      logger.error("API Response Validation Error:", error);
    }
    throw error;
  }
}
