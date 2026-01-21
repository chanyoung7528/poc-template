"use client";

import { useRouter } from "next/navigation";
import { useVerifyCertification } from "@/domains/auth/model/auth.queries";
import type { IamportCertificationResponse } from "@/domains/auth/model/auth.types";

// 아임포트 V1 설정 (KG이니시스) - 환경변수 필수
const IMP_CODE = process.env.NEXT_PUBLIC_IMP_CODE;
const CHANNEL_KEY = process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY;

// 환경변수 검증
if (!IMP_CODE) {
  console.error("❌ NEXT_PUBLIC_IMP_CODE 환경변수가 설정되지 않았습니다.");
}
if (!CHANNEL_KEY) {
  console.error(
    "❌ NEXT_PUBLIC_PORTONE_CHANNEL_KEY 환경변수가 설정되지 않았습니다."
  );
}

// 웹뷰 환경 감지
const isWebView = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  // Flutter WebView, Android WebView, iOS WebView 감지
  return (
    userAgent.includes("wv") || // Android WebView
    userAgent.includes("flutter") || // Flutter
    ((userAgent.includes("iphone") || userAgent.includes("ipad")) &&
      !userAgent.includes("safari")) // iOS WebView (Safari 아님)
  );
};

export function usePortOnePass() {
  const router = useRouter();
  const verifyCertificationMutation = useVerifyCertification();

  const handleAuth = () => {
    // 환경변수 체크
    if (!IMP_CODE) {
      alert(
        "아임포트 설정 오류: NEXT_PUBLIC_IMP_CODE가 설정되지 않았습니다.\n.env.local 파일을 확인해주세요."
      );
      console.error("환경변수 누락: NEXT_PUBLIC_IMP_CODE");
      return;
    }

    if (!CHANNEL_KEY) {
      alert(
        "아임포트 설정 오류: NEXT_PUBLIC_PORTONE_CHANNEL_KEY가 설정되지 않았습니다.\n.env.local 파일을 확인해주세요."
      );
      console.error("환경변수 누락: NEXT_PUBLIC_PORTONE_CHANNEL_KEY");
      return;
    }

    const { IMP } = window;

    if (!IMP) {
      alert("아임포트 모듈이 로드되지 않았습니다. 페이지를 새로고침해주세요.");
      return;
    }

    // V1: 아임포트 초기화 (환경변수 사용)
    IMP.init(IMP_CODE);
    console.log("🔧 아임포트 V1 초기화:", IMP_CODE);

    // 웹뷰 환경 확인
    const isInWebView = isWebView();
    console.log("🔍 환경 감지:", {
      isWebView: isInWebView,
      userAgent: navigator.userAgent,
    });

    // 리다이렉트 URL 설정 (본인인증 완료 후 돌아올 URL)
    const redirectUrl = `${window.location.origin}/signup/credentials`;

    // V1 본인인증 요청 데이터
    const data = {
      channelKey: CHANNEL_KEY, // 포트원 본인인증 채널키
      merchant_uid: `mid_${Date.now()}`, // 주문번호 (타임스탬프로 생성)
      popup: false, // 리다이렉트 방식 사용 (웹뷰 호환)
      m_redirect_url: redirectUrl, // 리다이렉트 URL (모바일/웹뷰)
    };

    console.log("📤 아임포트 V1 본인인증 요청:", {
      ...data,
      channelKey: CHANNEL_KEY.substring(0, 20) + "...", // 채널키 일부만 로그
      isWebView: isInWebView,
    });

    // 웹뷰 환경이면 리다이렉트만 하고 콜백은 처리하지 않음
    if (isInWebView) {
      console.log("📱 웹뷰 환경: 리다이렉트 방식으로 본인인증 시작");
      console.log("📱 리다이렉트 URL:", redirectUrl);

      // 본인인증 창 열기 (리다이렉트됨)
      IMP.certification(data, (rsp: IamportCertificationResponse) => {
        // 웹뷰에서는 이 콜백이 실행되지 않아야 함
        // 만약 실행된다면 무시
        console.log("⚠️ 웹뷰 환경에서 콜백 실행됨 (무시):", rsp);
        console.log("⚠️ 이 콜백은 무시됩니다. 리다이렉트 결과를 기다려주세요.");
      });

      console.log("📱 본인인증 페이지로 이동 중... 리다이렉트 대기");
      return; // 콜백 처리하지 않고 리다이렉트 대기
    }

    // 일반 브라우저 환경: 콜백으로 처리
    console.log("🌐 일반 브라우저 환경: 콜백 방식으로 본인인증 시작");
    IMP.certification(data, async (rsp: IamportCertificationResponse) => {
      console.log("아임포트 응답:", rsp);

      if (rsp.success && rsp.imp_uid) {
        // 인증 성공 - 서버에 imp_uid 전달하여 검증
        console.log("rsp.imp_uid", rsp.imp_uid);
        verifyCertificationMutation.mutate(rsp.imp_uid, {
          onSuccess: async (result) => {
            console.log("서버 검증 결과:", result);

            // 서버 응답에 따른 분기 처리
            switch (result.status) {
              case "EXISTING":
                // 이미 가입된 회원 - 마스킹된 ID 표시
                router.push(
                  `/auth/result?maskedId=${result.user?.maskedId}&provider=${result.user?.provider}`
                );
                break;

              case "UNDER_14":
                // 만 14세 미만 - 안내 페이지
                router.push("/auth/guide/minor");
                break;

              case "NEW":
                // 신규 회원 - 본인인증 완료 API 호출
                console.log("✅ 본인인증 성공, 세션 업데이트 중...");

                try {
                  // 1. 본인인증 완료 상태를 세션에 저장
                  const verifyResponse = await fetch(
                    "/api/auth/verify-complete",
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        verificationData: result.certificationData,
                      }),
                      redirect: "follow", // 리다이렉트 자동 따라가기
                    }
                  );

                  // 서버 리다이렉트 응답인 경우 (status 307, 308 등)
                  if (verifyResponse.redirected) {
                    console.log("✅ 서버 리다이렉트 감지:", verifyResponse.url);
                    // 서버에서 리다이렉트한 URL로 이동 (브라우저가 자동 처리)
                    window.location.href = verifyResponse.url;
                    return;
                  }

                  // JSON 응답인 경우 (소셜 회원가입)
                  if (!verifyResponse.ok) {
                    const verifyData = await verifyResponse.json();
                    console.error(
                      "본인인증 세션 업데이트 실패:",
                      verifyData.error
                    );

                    if (verifyData.error === "unauthorized") {
                      alert("세션이 만료되었습니다. 다시 로그인해주세요.");
                      router.push("/login?error=session_expired");
                    } else if (verifyData.error === "terms_required") {
                      alert("약관 동의가 필요합니다.");
                      router.push("/terms-agreement");
                    } else {
                      alert("본인인증 처리 중 오류가 발생했습니다.");
                    }
                    return;
                  }

                  const verifyData = await verifyResponse.json();
                  console.log("✅ 본인인증 세션 업데이트 완료");

                  // 소셜 회원가입인 경우만 여기서 처리 (일반 회원가입은 서버 리다이렉트로 처리됨)
                  if (verifyData.signupType !== "wellness") {
                    console.log("→ 소셜 회원가입: 최종 완료 처리");

                    const completeResponse = await fetch(
                      "/api/auth/complete-signup",
                      {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({}),
                      }
                    );

                    const completeData = await completeResponse.json();

                    if (!completeResponse.ok) {
                      console.error("회원가입 완료 실패:", completeData.error);
                      alert("회원가입 처리 중 오류가 발생했습니다.");
                      return;
                    }

                    console.log("✅ 회원가입 완료:", completeData.userId);

                    // 회원가입 완료 페이지로 이동
                    router.push(completeData.redirectUrl || "/signup/complete");
                  }
                } catch (error) {
                  console.error("본인인증 후 처리 중 오류:", error);
                  alert(
                    "본인인증 처리 중 오류가 발생했습니다. 다시 시도해주세요."
                  );
                }
                break;

              default:
                alert("알 수 없는 인증 상태입니다.");
            }
          },
          onError: (error) => {
            console.error("본인인증 검증 실패:", error);
            alert("본인인증 검증에 실패했습니다. 다시 시도해주세요.");
          },
        });
      } else {
        // 인증 실패
        const errorMsg = rsp.error_msg || "본인인증에 실패하였습니다.";
        console.error("인증 실패:", rsp);
        alert(`인증 실패: ${errorMsg}`);
      }
    });
  };

  return {
    handleAuth,
    isLoading: verifyCertificationMutation.isPending,
    handleRedirectResult: (result: {
      success: boolean;
      imp_uid?: string;
      error_msg?: string;
    }) => {
      console.log("📱 리다이렉트 결과 처리:", result);

      if (result.success && result.imp_uid) {
        // 인증 성공 - 기존 로직과 동일하게 처리
        verifyCertificationMutation.mutate(result.imp_uid, {
          onSuccess: async (certResult) => {
            console.log("서버 검증 결과:", certResult);

            // 서버 응답에 따른 분기 처리
            switch (certResult.status) {
              case "EXISTING":
                router.push(
                  `/auth/result?maskedId=${certResult.user?.maskedId}&provider=${certResult.user?.provider}`
                );
                break;

              case "UNDER_14":
                router.push("/auth/guide/minor");
                break;

              case "NEW":
                console.log("✅ 본인인증 성공, 세션 업데이트 중...");

                try {
                  const verifyResponse = await fetch(
                    "/api/auth/verify-complete",
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        verificationData: certResult.certificationData,
                      }),
                      redirect: "follow",
                    }
                  );

                  if (verifyResponse.redirected) {
                    console.log("✅ 서버 리다이렉트 감지:", verifyResponse.url);
                    window.location.href = verifyResponse.url;
                    return;
                  }

                  if (!verifyResponse.ok) {
                    const verifyData = await verifyResponse.json();
                    console.error(
                      "본인인증 세션 업데이트 실패:",
                      verifyData.error
                    );

                    if (verifyData.error === "unauthorized") {
                      alert("세션이 만료되었습니다. 다시 로그인해주세요.");
                      router.push("/login?error=session_expired");
                    } else if (verifyData.error === "terms_required") {
                      alert("약관 동의가 필요합니다.");
                      router.push("/terms-agreement");
                    } else {
                      alert("본인인증 처리 중 오류가 발생했습니다.");
                    }
                    return;
                  }

                  const verifyData = await verifyResponse.json();
                  console.log("✅ 본인인증 세션 업데이트 완료");

                  if (verifyData.signupType !== "wellness") {
                    console.log("→ 소셜 회원가입: 최종 완료 처리");

                    const completeResponse = await fetch(
                      "/api/auth/complete-signup",
                      {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({}),
                      }
                    );

                    const completeData = await completeResponse.json();

                    if (!completeResponse.ok) {
                      console.error("회원가입 완료 실패:", completeData.error);
                      alert("회원가입 처리 중 오류가 발생했습니다.");
                      return;
                    }

                    console.log("✅ 회원가입 완료:", completeData.userId);
                    router.push(completeData.redirectUrl || "/signup/complete");
                  }
                } catch (error) {
                  console.error("본인인증 후 처리 중 오류:", error);
                  alert(
                    "본인인증 처리 중 오류가 발생했습니다. 다시 시도해주세요."
                  );
                }
                break;

              default:
                alert("알 수 없는 인증 상태입니다.");
            }
          },
          onError: (error) => {
            console.error("본인인증 검증 실패:", error);
            alert("본인인증 검증에 실패했습니다. 다시 시도해주세요.");
          },
        });
      } else {
        // 인증 실패
        const errorMsg = result.error_msg || "본인인증에 실패하였습니다.";
        console.error("인증 실패:", result);
        alert(`인증 실패: ${errorMsg}`);
      }
    },
  };
}
