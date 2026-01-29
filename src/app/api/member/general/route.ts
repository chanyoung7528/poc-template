/**
 * API Route: registerGeneral
 * 
 * Mock: 일반 회원가입
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { verificationToken, loginId, password } = body;

    // Mock: 회원가입 성공
    const mbrUlid = `ulid_${Date.now()}`;
    const oppbId = `oppb_${Date.now()}`;
    const accessToken = `access_${Date.now()}`;
    const refreshToken = `refresh_${Date.now()}`;

    // HTTP-Only 쿠키 설정
    const response = NextResponse.json({
      code: "0000",
      message: "회원가입이 완료되었습니다",
      data: {
        tokens: {
          accessToken,
          refreshToken,
        },
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
        code: "MEMBER_011",
        message: "회원가입에 실패했습니다",
        data: null,
        succeeded: false,
        total: 0,
        isJackson: true,
      },
      { status: 400 }
    );
  }
}
