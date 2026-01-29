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
    if (transactionId.includes("new") || transactionId.startsWith("imp_")) {
      // 신규 회원 (기본값)
      return NextResponse.json({
        code: "0000",
        message: "신규 회원입니다",
        data: {
          status: "new" as const,
          verificationToken: `verify_${Date.now()}`,
          linkToken: null,
          message: "신규 회원입니다",
        },
        succeeded: true,
        total: 0,
        isJackson: true,
      });
    }

    if (transactionId.includes("link")) {
      // 계정 연동 필요
      return NextResponse.json({
        code: "0000",
        message: "계정 연동이 필요합니다",
        data: {
          status: "link_required" as const,
          verificationToken: undefined,
          linkToken: `link_${Date.now()}`,
          message: "계정 연동이 필요합니다",
        },
        succeeded: true,
        total: 0,
        isJackson: true,
      });
    }

    // 기존 회원
    return NextResponse.json({
      code: "0000",
      message: "이미 가입된 회원입니다",
      data: {
        status: "duplicate" as const,
        verificationToken: undefined,
        linkToken: null,
        message: "이미 가입된 회원입니다",
      },
      succeeded: true,
      total: 0,
      isJackson: true,
    });
  } catch (error) {
    return NextResponse.json(
      {
        code: "MEMBER_041",
        message: "본인인증 정보가 유효하지 않습니다",
        data: null,
        succeeded: false,
        total: 0,
        isJackson: true,
      },
      { status: 400 }
    );
  }
}
