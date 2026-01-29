/**
 * API Route: loginGeneral
 * 
 * Mock: 일반 로그인
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { loginId, password } = body;

    // Mock: 로그인 실패 케이스
    if (loginId === "locked") {
      return NextResponse.json(
        {
          code: "MEMBER_023",
          message: "계정이 잠겼습니다",
          data: null,
          succeeded: false,
          total: 0,
          isJackson: true,
        },
        { status: 400 }
      );
    }

    if (loginId === "expired") {
      return NextResponse.json(
        {
          code: "MEMBER_024",
          message: "비밀번호 변경이 필요합니다",
          data: null,
          succeeded: false,
          total: 0,
          isJackson: true,
        },
        { status: 400 }
      );
    }

    // Mock: 로그인 성공
    const mbrUlid = `ulid_${Date.now()}`;
    const oppbId = `oppb_${Date.now()}`;
    const accessToken = `access_${Date.now()}`;
    const refreshToken = `refresh_${Date.now()}`;

    const response = NextResponse.json({
      code: "0000",
      message: "로그인 성공",
      data: {
        mbrUlid,
        oppbId,
      },
      succeeded: true,
      total: 0,
      isJackson: true,
    });

    response.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24시간
    });

    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30일
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        code: "MEMBER_021",
        message: "로그인에 실패했습니다",
        data: null,
        succeeded: false,
        total: 0,
        isJackson: true,
      },
      { status: 400 }
    );
  }
}
