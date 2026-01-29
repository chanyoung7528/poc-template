/**
 * API Route: checkLoginId
 * 
 * Mock: 로그인 ID 중복 체크
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { loginId } = body;

    if (!loginId || typeof loginId !== "string") {
      return NextResponse.json(
        {
          code: "MEMBER_042",
          message: "로그인 ID가 필요합니다",
          data: null,
          succeeded: false,
          total: 0,
          isJackson: true,
        },
        { status: 400 }
      );
    }

    // Mock: 특정 아이디는 중복으로 처리 (테스트용)
    const duplicateIds = ["admin", "test", "user", "existing"];
    const isDuplicate = duplicateIds.includes(loginId.toLowerCase());

    if (isDuplicate) {
      return NextResponse.json({
        code: "0001",
        message: "이미 사용 중인 아이디입니다",
        data: {
          available: false,
          message: "이미 사용 중인 아이디입니다",
        },
        succeeded: true,
        total: 0,
        isJackson: true,
      });
    }

    // 사용 가능한 아이디
    return NextResponse.json({
      code: "0001",
      message: "사용 가능한 아이디입니다",
      data: {
        available: true,
        message: "사용 가능한 아이디입니다",
      },
      succeeded: true,
      total: 0,
      isJackson: true,
    });
  } catch (error) {
    return NextResponse.json(
      {
        code: "MEMBER_043",
        message: "아이디 중복 체크 중 오류가 발생했습니다",
        data: null,
        succeeded: false,
        total: 0,
        isJackson: true,
      },
      { status: 500 }
    );
  }
}
