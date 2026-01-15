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

    // V1 본인인증 요청 데이터
    // channelKey 방식 사용 (pg 대신)
    const data = {
      channelKey: CHANNEL_KEY, // 포트원 본인인증 채널키
      merchant_uid: `mid_${Date.now()}`, // 주문번호 (타임스탬프로 생성)
      popup: true, // 팝업 형태로 열기 (모바일 대응)
    };

    console.log("📤 아임포트 V1 본인인증 요청:", {
      ...data,
      channelKey: CHANNEL_KEY.substring(0, 20) + "...", // 채널키 일부만 로그
    });

    // 본인인증 창 열기
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
                  const verifyResponse = await fetch("/api/auth/verify-complete", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      verificationData: result.certificationData,
                    }),
                  });

                  const verifyData = await verifyResponse.json();

                  if (!verifyResponse.ok) {
                    console.error("본인인증 세션 업데이트 실패:", verifyData.error);
                    
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

                  console.log("✅ 본인인증 세션 업데이트 완료");

                  // 2. 회원가입 최종 완료 (DB 저장)
                  const completeResponse = await fetch("/api/auth/complete-signup", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({}),
                  });

                  const completeData = await completeResponse.json();

                  if (!completeResponse.ok) {
                    console.error("회원가입 완료 실패:", completeData.error);
                    alert("회원가입 처리 중 오류가 발생했습니다.");
                    return;
                  }

                  console.log("✅ 회원가입 완료:", completeData.userId);
                  
                  // 3. 메인 페이지로 이동
                  router.push(completeData.redirectUrl || "/main");
                  
                } catch (error) {
                  console.error("본인인증 후 처리 중 오류:", error);
                  alert("본인인증 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
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
  };
}
