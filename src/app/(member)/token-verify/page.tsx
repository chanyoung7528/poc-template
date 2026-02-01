"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./page.module.scss";

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
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>데이터 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        {/* 헤더 */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.headerLeft}>
              <h1 className={styles.title}>
                소셜 로그인 토큰 검증 결과
              </h1>
              <div
                className={`${styles.statusBadge} ${
                  data.success ? styles.statusSuccess : styles.statusError
                }`}
              >
                {data.success ? "✅ 검증 성공" : "❌ 검증 실패"}
              </div>
            </div>
            <div className={styles.headerButtons}>
              <button
                onClick={() => window.location.href = '/api/auth/verify-token'}
                className={`${styles.button} ${styles.buttonPrimary}`}
              >
                다시 검증
              </button>
              <button
                onClick={() => router.push("/")}
                className={`${styles.button} ${styles.buttonSecondary}`}
              >
                홈으로
              </button>
            </div>
          </div>
        </div>

        {/* 테이블 형태의 데이터 표시 */}
        <div className={styles.tableContainer}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead className={styles.tableHead}>
                <tr>
                  <th className={styles.tableHeader}>
                    항목
                  </th>
                  <th className={styles.tableHeader}>
                    값
                  </th>
                </tr>
              </thead>
              <tbody className={styles.tableBody}>
                {/* Provider 정보 */}
                {data.provider && (
                  <tr className={styles.tableRow}>
                    <td className={`${styles.tableCell} ${styles.tableCellLabel}`}>
                      Provider
                    </td>
                    <td className={`${styles.tableCell} ${styles.tableCellValue}`}>
                      <div className={styles.providerContainer}>
                        <span className={styles.providerIcon}>
                          {data.provider === "kakao" ? "🟡" : "🟢"}
                        </span>
                        <span className={styles.providerName}>
                          {data.provider === "kakao" ? "카카오" : "네이버"}
                        </span>
                      </div>
                    </td>
                  </tr>
                )}

                {/* API 엔드포인트 정보 */}
                {data.apiEndpoint && (
                  <tr className={styles.tableRow}>
                    <td className={`${styles.tableCell} ${styles.tableCellLabel}`}>
                      API 엔드포인트
                    </td>
                    <td className={`${styles.tableCell} ${styles.tableCellValue}`}>
                      <div className={styles.apiEndpointContainer}>
                        <span className={styles.apiEndpoint}>
                          {data.apiEndpoint}
                        </span>
                        <a
                          href={data.apiEndpoint}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.apiLink}
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
                    <tr className={styles.tableRow}>
                      <td className={`${styles.tableCell} ${styles.tableCellLabel}`}>
                        사용자 ID
                      </td>
                      <td className={`${styles.tableCell} ${styles.tableCellValue} ${styles.tableCellMono}`}>
                        {data.user.id}
                      </td>
                    </tr>
                    <tr className={styles.tableRow}>
                      <td className={`${styles.tableCell} ${styles.tableCellLabel}`}>
                        이메일
                      </td>
                      <td className={`${styles.tableCell} ${styles.tableCellValue}`}>
                        {data.user.email || <span className={styles.tableCellEmpty}>없음</span>}
                      </td>
                    </tr>
                    <tr className={styles.tableRow}>
                      <td className={`${styles.tableCell} ${styles.tableCellLabel}`}>
                        닉네임
                      </td>
                      <td className={`${styles.tableCell} ${styles.tableCellValue}`}>
                        {data.user.nickname || <span className={styles.tableCellEmpty}>없음</span>}
                      </td>
                    </tr>
                    <tr className={styles.tableRow}>
                      <td className={`${styles.tableCell} ${styles.tableCellLabel}`}>
                        가입일
                      </td>
                      <td className={`${styles.tableCell} ${styles.tableCellValue}`}>
                        {new Date(data.user.createdAt).toLocaleString("ko-KR")}
                      </td>
                    </tr>
                  </>
                )}

                {/* 저장된 토큰 정보 */}
                {data.storedToken && (
                  <>
                    <tr className={styles.sectionHeaderBlue}>
                      <td colSpan={2} className={styles.sectionHeader}>
                        DB에 저장된 토큰 정보
                      </td>
                    </tr>
                    <tr className={styles.tableRow}>
                      <td className={`${styles.tableCell} ${styles.tableCellLabel}`}>
                        Access Token
                      </td>
                      <td className={`${styles.tableCell} ${styles.tableCellValue} ${styles.tableCellMono}`}>
                        {data.storedToken.accessToken || <span className={styles.tableCellEmpty}>없음</span>}
                      </td>
                    </tr>
                    <tr className={styles.tableRow}>
                      <td className={`${styles.tableCell} ${styles.tableCellLabel}`}>
                        Refresh Token
                      </td>
                      <td className={`${styles.tableCell} ${styles.tableCellValue} ${styles.tableCellMono}`}>
                        {data.storedToken.refreshToken || <span className={styles.tableCellEmpty}>없음</span>}
                      </td>
                    </tr>
                    <tr className={styles.tableRow}>
                      <td className={`${styles.tableCell} ${styles.tableCellLabel}`}>
                        Token Type
                      </td>
                      <td className={`${styles.tableCell} ${styles.tableCellValue}`}>
                        {data.storedToken.tokenType || <span className={styles.tableCellEmpty}>없음</span>}
                      </td>
                    </tr>
                    <tr className={styles.tableRow}>
                      <td className={`${styles.tableCell} ${styles.tableCellLabel}`}>
                        Expires At
                      </td>
                      <td className={`${styles.tableCell} ${styles.tableCellValue}`}>
                        {data.storedToken.expiresAt
                          ? new Date(data.storedToken.expiresAt).toLocaleString("ko-KR")
                          : <span className={styles.tableCellEmpty}>없음</span>}
                      </td>
                    </tr>
                  </>
                )}

                {/* API 검증 결과 */}
                {data.verification && (
                  <>
                    <tr className={styles.sectionHeaderGreen}>
                      <td colSpan={2} className={styles.sectionHeader}>
                        <div className={styles.sectionHeaderContent}>
                          <span className={`${styles.sectionHeaderTitle} ${styles.sectionHeaderTitleGreen}`}>
                            {data.provider === "kakao" ? "카카오" : "네이버"} API 검증 결과
                          </span>
                          {data.apiEndpoint && (
                            <span className={styles.sectionHeaderEndpoint}>
                              {data.apiEndpoint}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                    {Object.entries(data.verification).map(([key, value]) => (
                      <tr key={key} className={styles.tableRow}>
                        <td className={`${styles.tableCell} ${styles.tableCellLabel} ${styles.tableCellCapitalize}`}>
                          {key.replace(/_/g, " ")}
                        </td>
                        <td className={`${styles.tableCell} ${styles.tableCellValue}`}>
                          {typeof value === "object" ? (
                            <pre className={styles.jsonPre}>
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
                    <tr className={styles.sectionHeaderRed}>
                      <td colSpan={2} className={styles.sectionHeader}>
                        에러 정보
                      </td>
                    </tr>
                    <tr className={styles.tableRow}>
                      <td className={`${styles.tableCell} ${styles.tableCellLabel} ${styles.errorLabel}`}>
                        에러 코드
                      </td>
                      <td className={`${styles.tableCell} ${styles.errorValueBold}`}>
                        {data.error}
                      </td>
                    </tr>
                    {data.message && (
                      <tr className={styles.tableRow}>
                        <td className={`${styles.tableCell} ${styles.tableCellLabel} ${styles.errorLabel}`}>
                          에러 메시지
                        </td>
                        <td className={`${styles.tableCell} ${styles.errorValue}`}>
                          {data.message}
                        </td>
                      </tr>
                    )}
                    {data.errorData && (
                      <tr className={styles.tableRow}>
                        <td className={`${styles.tableCell} ${styles.tableCellLabel} ${styles.errorLabel}`}>
                          에러 상세
                        </td>
                        <td className={`${styles.tableCell} ${styles.errorValue}`}>
                          <pre className={styles.jsonPreError}>
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
        <div className={styles.rawDataContainer}>
          <details className="group">
            <summary className={styles.rawDataSummary}>
              <h2 className={styles.rawDataTitle}>
                전체 응답 데이터 (Raw JSON)
              </h2>
              <span className={styles.rawDataArrow}>
                ▼
              </span>
            </summary>
            <div className={styles.rawDataContent}>
              <pre className={styles.rawDataPre}>
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
        <div className={styles.loadingContainer}>
          <div className={styles.loadingContent}>
            <div className={styles.spinner}></div>
            <p className={styles.loadingText}>로딩 중...</p>
          </div>
        </div>
      }
    >
      <TokenVerifyContent />
    </Suspense>
  );
}
