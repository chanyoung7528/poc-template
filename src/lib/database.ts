import { prisma } from "./prisma";
import type { User } from "@prisma/client";

/**
 * 카카오 ID로 사용자 조회
 */
export async function findUserByKakaoId(kakaoId: string): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { kakaoId },
  });

  return user;
}

/**
 * 네이버 ID로 사용자 조회
 */
export async function findUserByNaverId(naverId: string): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { naverId },
  });

  return user;
}

/**
 * 이메일로 사용자 조회 (중복 가입 방지)
 */
export async function findUserByEmail(email: string): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  return user;
}

/**
 * 전화번호로 사용자 조회 (중복 가입 방지)
 */
export async function findUserByPhone(phone: string): Promise<User | null> {
  const user = await prisma.user.findFirst({
    where: { phone },
  });

  return user;
}

/**
 * 우리 서비스의 사용자 ID로 조회
 */
export async function findUserById(id: string): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  return user;
}

/**
 * 신규 사용자 생성 (카카오 회원가입)
 */
export async function createKakaoUser(data: {
  kakaoId: string;
  email: string | null;
  nickname: string | null;
  profileImage: string | null;
  marketingAgreed?: boolean;
}): Promise<User> {
  const user = await prisma.user.create({
    data: {
      kakaoId: data.kakaoId,
      email: data.email,
      nickname: data.nickname,
      profileImage: data.profileImage,
      provider: "kakao",
      // marketingAgreed는 필요시 스키마에 추가
    },
  });

  console.log("✅ [DB] 신규 카카오 사용자 생성:", user.id, user.nickname);

  return user;
}

/**
 * 신규 사용자 생성 (네이버 회원가입)
 */
export async function createNaverUser(data: {
  naverId: string;
  email: string | null;
  nickname: string | null;
  profileImage: string | null;
  marketingAgreed?: boolean;
}): Promise<User> {
  const user = await prisma.user.create({
    data: {
      naverId: data.naverId,
      email: data.email,
      nickname: data.nickname,
      profileImage: data.profileImage,
      provider: "naver",
      // marketingAgreed는 필요시 스키마에 추가
    },
  });

  console.log("✅ [DB] 신규 네이버 사용자 생성:", user.id, user.nickname);

  return user;
}

/**
 * 사용자 정보 업데이트 (프로필, 마지막 로그인 시간 등)
 */
export async function updateUser(
  id: string,
  data: {
    email?: string | null;
    nickname?: string | null;
    profileImage?: string | null;
    lastLoginAt?: Date;
  }
): Promise<User | null> {
  const user = await prisma.user.update({
    where: { id },
    data: {
      ...data,
      updatedAt: new Date(),
    },
  });

  console.log("✅ [DB] 사용자 정보 업데이트:", id);

  return user;
}

/**
 * 신규 사용자 생성 (일반 회원가입 - Wellness ID)
 */
export async function createWellnessUser(data: {
  wellnessId: string;
  passwordHash: string;
  email?: string | null;
  nickname?: string | null;
  name: string;
  phone: string;
  birth: string;
  gender: "M" | "F";
}): Promise<User> {
  const user = await prisma.user.create({
    data: {
      wellnessId: data.wellnessId,
      passwordHash: data.passwordHash,
      email: data.email,
      nickname: data.nickname || data.name,
      name: data.name,
      phone: data.phone,
      birth: data.birth,
      gender: data.gender,
      provider: "wellness",
    },
  });

  console.log("✅ [DB] 신규 일반 사용자 생성:", user.id, user.wellnessId);

  return user;
}

/**
 * Wellness ID로 사용자 조회
 */
export async function findUserByWellnessId(
  wellnessId: string
): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { wellnessId },
  });

  return user;
}

/**
 * 마지막 로그인 시간 업데이트
 */
export async function updateLastLogin(id: string): Promise<void> {
  await prisma.user.update({
    where: { id },
    data: { lastLoginAt: new Date() },
  });

  console.log("✅ [DB] 마지막 로그인 시간 업데이트:", id);
}
