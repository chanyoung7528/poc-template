import { NextRequest } from "next/server";
import { KakaoProvider } from "@/lib/auth/providers/kakao";
import { handleOAuthCallback } from "@/lib/auth/oauth-handler";

/**
 * 카카오 OAuth 콜백 처리
 *
 * 공통 OAuth 핸들러를 사용하여 처리합니다.
 * Provider만 주입하면 나머지는 자동으로 처리됩니다.
 */
export async function GET(request: NextRequest) {
  const provider = new KakaoProvider();
  return await handleOAuthCallback(request, provider);
}
