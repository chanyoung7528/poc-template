"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface TokenVerificationData {
  success: boolean;
  provider?: string;
  apiEndpoint?: string;
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
    <div className="min-h-screen bg-gray-50 py-6 px-4 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">
                소셜 로그인 토큰 검증 결과
              </h1>
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  data.success
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {data.success ? "✅ 검증 성공" : "❌ 검증 실패"}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => window.location.href = '/api/auth/verify-token'}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-sm font-medium"
              >
                다시 검증
              </button>
              <button
                onClick={() => router.push("/")}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition text-sm font-medium"
              >
                홈으로
              </button>
            </div>
          </div>
        </div>

        {/* 테이블 형태의 데이터 표시 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-1/4">
                    항목
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    값
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Provider 정보 */}
                {data.provider && (
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Provider
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">
                          {data.provider === "kakao" ? "🟡" : "🟢"}
                        </span>
                        <span className="font-medium">
                          {data.provider === "kakao" ? "카카오" : "네이버"}
                        </span>
                      </div>
                    </td>
                  </tr>
                )}

                {/* API 엔드포인트 정보 */}
                {data.apiEndpoint && (
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      API 엔드포인트
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <span className="text-blue-600 font-mono break-all">
                          {data.apiEndpoint}
                        </span>
                        <a
                          href={data.apiEndpoint}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-700 text-xs"
                          title="API 문서 보기"
                        >
                          🔗
                        </a>
                      </div>
                    </td>
                  </tr>
                )}

                {/* 사용자 정보 */}
                {data.user && (
                  <>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        사용자 ID
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 font-mono break-all">
                        {data.user.id}
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        이메일
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {data.user.email || <span className="text-gray-400">없음</span>}
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        닉네임
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {data.user.nickname || <span className="text-gray-400">없음</span>}
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        가입일
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {new Date(data.user.createdAt).toLocaleString("ko-KR")}
                      </td>
                    </tr>
                  </>
                )}

                {/* 저장된 토큰 정보 */}
                {data.storedToken && (
                  <>
                    <tr className="bg-blue-50">
                      <td colSpan={2} className="px-6 py-3 text-sm font-bold text-blue-900">
                        DB에 저장된 토큰 정보
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Access Token
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 font-mono break-all">
                        {data.storedToken.accessToken || <span className="text-gray-400">없음</span>}
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Refresh Token
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 font-mono break-all">
                        {data.storedToken.refreshToken || <span className="text-gray-400">없음</span>}
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Token Type
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {data.storedToken.tokenType || <span className="text-gray-400">없음</span>}
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Expires At
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {data.storedToken.expiresAt
                          ? new Date(data.storedToken.expiresAt).toLocaleString("ko-KR")
                          : <span className="text-gray-400">없음</span>}
                      </td>
                    </tr>
                  </>
                )}

                {/* API 검증 결과 */}
                {data.verification && (
                  <>
                    <tr className="bg-green-50">
                      <td colSpan={2} className="px-6 py-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-green-900">
                            {data.provider === "kakao" ? "카카오" : "네이버"} API 검증 결과
                          </span>
                          {data.apiEndpoint && (
                            <span className="text-xs text-green-700 font-mono">
                              {data.apiEndpoint}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                    {Object.entries(data.verification).map(([key, value]) => (
                      <tr key={key} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                          {key.replace(/_/g, " ")}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 break-all">
                          {typeof value === "object" ? (
                            <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                              {JSON.stringify(value, null, 2)}
                            </pre>
                          ) : (
                            String(value)
                          )}
                        </td>
                      </tr>
                    ))}
                  </>
                )}

                {/* 에러 정보 */}
                {data.error && (
                  <>
                    <tr className="bg-red-50">
                      <td colSpan={2} className="px-6 py-3 text-sm font-bold text-red-900">
                        에러 정보
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-900">
                        에러 코드
                      </td>
                      <td className="px-6 py-4 text-sm text-red-700 font-medium">
                        {data.error}
                      </td>
                    </tr>
                    {data.message && (
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-900">
                          에러 메시지
                        </td>
                        <td className="px-6 py-4 text-sm text-red-700">
                          {data.message}
                        </td>
                      </tr>
                    )}
                    {data.errorData && (
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-900">
                          에러 상세
                        </td>
                        <td className="px-6 py-4 text-sm text-red-700">
                          <pre className="text-xs bg-red-50 p-3 rounded border border-red-200 overflow-x-auto max-h-64 overflow-y-auto">
                            {JSON.stringify(data.errorData, null, 2)}
                          </pre>
                        </td>
                      </tr>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 전체 응답 데이터 (접을 수 있게) */}
        <div className="mt-6 bg-white rounded-lg shadow-md overflow-hidden">
          <details className="group">
            <summary className="px-6 py-4 cursor-pointer bg-gray-50 hover:bg-gray-100 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                전체 응답 데이터 (Raw JSON)
              </h2>
              <span className="text-gray-500 group-open:rotate-180 transition-transform">
                ▼
              </span>
            </summary>
            <div className="p-4 bg-gray-900">
              <pre className="text-xs text-green-400 overflow-x-auto max-h-96 overflow-y-auto">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          </details>
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
