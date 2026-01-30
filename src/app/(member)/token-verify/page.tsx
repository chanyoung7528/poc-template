"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface TokenVerificationData {
  success: boolean;
  provider?: string;
  verification?: any;
  storedToken?: {
    accessToken?: string;
    refreshToken?: string | null;
    tokenType?: string | null;
    expiresAt?: string | null;
  };
  user?: {
    id: string;
    email?: string | null;
    nickname?: string | null;
    provider: string;
    createdAt: string;
  };
  error?: string;
  message?: string;
  errorData?: any;
}

function TokenVerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<TokenVerificationData | null>(null);

  useEffect(() => {
    // URL 쿼리 파라미터에서 데이터 읽기
    const dataParam = searchParams.get("data");
    const errorParam = searchParams.get("error");
    const messageParam = searchParams.get("message");
    const providerParam = searchParams.get("provider");

    if (dataParam) {
      try {
        const decodedData = JSON.parse(decodeURIComponent(dataParam));
        setData(decodedData);
      } catch (error) {
        console.error("데이터 파싱 오류:", error);
        setData({
          success: false,
          error: "parse_error",
          message: "데이터를 읽을 수 없습니다.",
        });
      }
    } else if (errorParam) {
      setData({
        success: false,
        error: errorParam,
        message: messageParam || undefined,
        provider: providerParam || undefined,
      });
    } else {
      setData({
        success: false,
        error: "no_data",
        message: "검증 데이터가 없습니다. /api/auth/verify-token을 먼저 호출하세요.",
      });
    }
  }, [searchParams]);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">데이터 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              소셜 로그인 토큰 검증 결과
            </h1>
            <div className="flex gap-2">
              <button
                onClick={() => window.location.href = '/api/auth/verify-token'}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                다시 검증
              </button>
              <button
                onClick={() => router.push("/")}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
              >
                홈으로
              </button>
            </div>
          </div>

          {/* 성공/실패 상태 */}
          <div className="mb-6">
            <div
              className={`p-4 rounded-lg ${
                data.success
                  ? "bg-green-50 border border-green-200"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">
                  {data.success ? "✅" : "❌"}
                </span>
                <span
                  className={`font-semibold ${
                    data.success ? "text-green-800" : "text-red-800"
                  }`}
                >
                  {data.success ? "검증 성공" : "검증 실패"}
                </span>
              </div>
            </div>
          </div>

          {/* Provider 정보 */}
          {data.provider && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3 text-gray-900">
                Provider
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <span className="text-2xl">
                  {data.provider === "kakao" ? "🟡" : "🟢"}
                </span>
                <span className="ml-2 font-medium">
                  {data.provider === "kakao" ? "카카오" : "네이버"}
                </span>
              </div>
            </div>
          )}

          {/* 저장된 토큰 정보 */}
          {data.storedToken && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3 text-gray-900">
                DB에 저장된 토큰 정보
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="grid grid-cols-1 gap-2 font-mono text-sm">
                  <div>
                    <span className="text-gray-600">Access Token:</span>
                    <p className="text-gray-900 break-all">
                      {data.storedToken.accessToken || "없음"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Refresh Token:</span>
                    <p className="text-gray-900 break-all">
                      {data.storedToken.refreshToken || "없음"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Token Type:</span>
                    <p className="text-gray-900">
                      {data.storedToken.tokenType || "없음"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Expires At:</span>
                    <p className="text-gray-900">
                      {data.storedToken.expiresAt
                        ? new Date(data.storedToken.expiresAt).toLocaleString(
                            "ko-KR"
                          )
                        : "없음"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 사용자 정보 */}
          {data.user && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3 text-gray-900">
                사용자 정보
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div>
                  <span className="text-gray-600">ID:</span>
                  <p className="text-gray-900 font-mono">{data.user.id}</p>
                </div>
                <div>
                  <span className="text-gray-600">이메일:</span>
                  <p className="text-gray-900">{data.user.email || "없음"}</p>
                </div>
                <div>
                  <span className="text-gray-600">닉네임:</span>
                  <p className="text-gray-900">
                    {data.user.nickname || "없음"}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">가입일:</span>
                  <p className="text-gray-900">
                    {new Date(data.user.createdAt).toLocaleString("ko-KR")}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* API 검증 결과 */}
          {data.verification && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3 text-gray-900">
                {data.provider === "kakao" ? "카카오" : "네이버"} API 검증 결과
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(data.verification, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* 에러 정보 */}
          {data.error && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3 text-red-900">
                에러 정보
              </h2>
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <p className="text-red-800 font-medium mb-2">{data.error}</p>
                {data.message && (
                  <p className="text-red-700 text-sm">{data.message}</p>
                )}
                {data.errorData && (
                  <pre className="mt-3 text-sm text-red-900 overflow-auto">
                    {JSON.stringify(data.errorData, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          )}

          {/* 전체 응답 데이터 */}
          <div>
            <h2 className="text-lg font-semibold mb-3 text-gray-900">
              전체 응답 데이터 (Raw)
            </h2>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto">
              <pre className="text-xs">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TokenVerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">로딩 중...</p>
          </div>
        </div>
      }
    >
      <TokenVerifyContent />
    </Suspense>
  );
}
