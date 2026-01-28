/**
 * API Route: registerGeneral
 * 
 * Mock: 일반 회원가입
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { verificationToken, wellnessId, password, nickname } = body;

    // Mock: 회원가입 성공
    const member = {
      mbrUlid: `ulid_${Date.now()}`,
      wellnessId,
      nickname,
      email: `${wellnessId}@example.com`,
      createdAt: new Date().toISOString(),
    };

    const accessToken = `access_${Date.now()}`;
    const refreshToken = `refresh_${Date.now()}`;

    // HTTP-Only 쿠키 설정
    const response = NextResponse.json({
      member,
      accessToken,
      refreshToken,
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
      { code: "MEMBER_011", message: "회원가입에 실패했습니다" },
      { status: 400 }
    );
  }
}
