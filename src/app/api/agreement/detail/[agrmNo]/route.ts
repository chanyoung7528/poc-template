/**
 * API Route: agreement/detail/[agrmNo]
 * 
 * Mock: 약관 상세 조회
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { agrmNo: string } }
) {
  const { agrmNo } = params;

  // Mock 약관 데이터
  const agreements: Record<string, any> = {
    AGRM20250101001: {
      agrmNo: "AGRM20250101001",
      agrmTit: "서비스 이용약관",
      agrmCont:
        "제1조 (목적)\n이 약관은 AIWellness(이하 \"회사\")가 제공하는 웰니스 서비스(이하 \"서비스\")의 이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.\n\n제2조 (정의)\n1. \"서비스\"란 회사가 제공하는 건강관리, 운동 프로그램, 영양 상담 등 웰니스 관련 모든 서비스를 의미합니다.\n2. \"회원\"이란 회사와 서비스 이용계약을 체결하고 회사가 제공하는 서비스를 이용하는 자를 말합니다.\n\n제3조 (약관의 효력 및 변경)\n1. 본 약관은 서비스 화면에 게시하거나 기타의 방법으로 회원에게 공지함으로써 효력이 발생합니다.\n2. 회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 본 약관을 변경할 수 있습니다.\n\n제4조 (서비스의 제공)\n1. 회사는 회원에게 건강 및 웰니스 관련 서비스를 제공합니다.\n2. 서비스는 연중무휴, 1일 24시간 제공함을 원칙으로 합니다.\n\n제5조 (회원의 의무)\n회원은 다음 행위를 하여서는 안 됩니다.\n1. 타인의 정보 도용\n2. 회사가 게시한 정보의 변경\n3. 회사가 정한 정보 이외의 정보 등의 송신 또는 게시\n4. 기타 법령에 위반되는 행위",
      langCd: "ko",
      agrmSctDtlCd: "10",
      agrmChocSctCd: "10",
      isRequired: true,
    },
    // 필요 시 다른 약관 추가
  };

  const agreement = agreements[agrmNo];

  if (!agreement) {
    return NextResponse.json(
      {
        code: "9999",
        message: "약관을 찾을 수 없습니다",
        succeeded: false,
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    code: "0001",
    message: "약관 상세를 조회했습니다",
    data: agreement,
    succeeded: true,
    total: 0,
    isJackson: true,
  });
}
