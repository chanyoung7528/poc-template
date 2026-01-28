/**
 * API Route: checkUserStatus
 * 
 * Mock: 회원 상태 조회 (NICE 본인인증 후)
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transactionId } = body;

    // Mock: transactionId로 상태 판단
    if (transactionId.includes("new")) {
      // 신규 회원
      return NextResponse.json({
        status: "NEW_USER",
        verificationToken: `verify_${Date.now()}`,
      });
    }

    if (transactionId.includes("link")) {
      // 계정 연동 필요
      return NextResponse.json({
        status: "LINK_REQUIRED",
        linkToken: `link_${Date.now()}`,
        existingMember: {
          mbrUlid: "ulid_123",
          maskedId: "wel****",
          loginType: "SNS",
          snsType: "KAKAO",
        },
      });
    }

    // 기존 회원
    return NextResponse.json({
      status: "EXISTING_USER",
      member: {
        mbrUlid: "ulid_123",
        wellnessId: "wellness123",
        nickname: "테스트사용자",
        email: "test@example.com",
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { code: "MEMBER_041", message: "본인인증 정보가 유효하지 않습니다" },
      { status: 400 }
    );
  }
}
