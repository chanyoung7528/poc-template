import { NextRequest, NextResponse } from 'next/server';

type TestScenario = 'NEW' | 'EXISTING' | 'UNDER_14';

// 환경변수에서 아임포트 인증 정보 가져오기
// KG이니시스 설정:
// - REST API Key: 1022516262368276
// - REST API Secret: ac2VXFVNRLMci0SkVFf7oZY2kDo1AS7aWXX4Y4QoOZnL18H0qUrn60lzS6qRmlPei1nbobYxCQXt7AnF
// - PG상점아이디: MIIiasTest
// - API Key: ZUhPSzQzQUpCN1dLa1I0RFd3Y1VuQT09
const IAMPORT_API_KEY = process.env.IAMPORT_API_KEY;
const IAMPORT_API_SECRET = process.env.IAMPORT_API_SECRET;

// 실제 운영 환경인지 확인 (환경변수가 설정되어 있으면 실제 API 사용)
const USE_REAL_API = IAMPORT_API_KEY && IAMPORT_API_SECRET;

interface IamportCertificationData {
  name: string;
  phone: string;
  birthday: string; // YYYYMMDD
  gender: string; // "male" | "female"
  unique_key: string;
  unique_in_site: string;
  certified: boolean;
  certified_at: number;
}

/**
 * 아임포트 Access Token 발급
 */
async function getIamportAccessToken(): Promise<string> {
  const response = await fetch('https://api.iamport.kr/users/getToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      imp_key: IAMPORT_API_KEY,
      imp_secret: IAMPORT_API_SECRET,
    }),
  });

  const data = await response.json();

  if (data.code !== 0) {
    throw new Error(`아임포트 토큰 발급 실패: ${data.message}`);
  }

  return data.response.access_token;
}

/**
 * 본인인증 정보 조회
 * API: GET /certifications/{imp_uid}
 */
async function getCertificationData(
  imp_uid: string,
  accessToken: string
): Promise<IamportCertificationData> {
  const response = await fetch(
    `https://api.iamport.kr/certifications/${imp_uid}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const data = await response.json();

  if (data.code !== 0) {
    throw new Error(`본인인증 정보 조회 실패: ${data.message}`);
  }

  return data.response;
}

/**
 * 본인인증 정보 삭제 (개인정보 보호)
 * API: DELETE /certifications/{imp_uid}
 */
async function deleteCertificationData(
  imp_uid: string,
  accessToken: string
): Promise<void> {
  const response = await fetch(
    `https://api.iamport.kr/certifications/${imp_uid}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const data = await response.json();

  if (data.code !== 0) {
    console.warn(`본인인증 정보 삭제 실패: ${data.message}`);
    // 삭제 실패는 warning으로만 처리 (주요 로직에 영향 X)
  }
}

/**
 * 나이 계산 (만 나이)
 */
function calculateAge(birthday: string): number {
  // birthday format: YYYYMMDD
  const birthYear = parseInt(birthday.substring(0, 4));
  const birthMonth = parseInt(birthday.substring(4, 6));
  const birthDay = parseInt(birthday.substring(6, 8));

  const today = new Date();
  const birthDate = new Date(birthYear, birthMonth - 1, birthDay);

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}

/**
 * 아임포트 본인인증 검증 API
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imp_uid } = body;

    console.log('아임포트 imp_uid:', imp_uid);

    if (!imp_uid) {
      return NextResponse.json(
        { error: 'imp_uid is required' },
        { status: 400 }
      );
    }

    // ============================================
    // 실제 아임포트 API 호출 (환경변수 설정 시)
    // ============================================
    if (USE_REAL_API) {
      console.log('🔄 실제 아임포트 API 호출');

      try {
        // 1. Access Token 발급
        const accessToken = await getIamportAccessToken();
        console.log('✅ 아임포트 토큰 발급 성공');

        // 2. 본인인증 정보 조회
        const certData = await getCertificationData(imp_uid, accessToken);
        console.log('✅ 본인인증 정보 조회 성공:', {
          name: certData.name,
          phone: certData.phone,
          birthday: certData.birthday,
        });

        // 4. 나이 확인 (만 14세 미만 체크) - 삭제 전에 체크
        const age = calculateAge(certData.birthday);
        console.log(`📅 계산된 나이: 만 ${age}세`);

        // 5. 개인정보 보호를 위해 아임포트 서버에서 인증 정보 삭제
        // (본인인증 정보를 로컬에 저장했으므로 아임포트 서버에서는 삭제)
        await deleteCertificationData(imp_uid, accessToken);
        console.log('🗑️  아임포트 서버에서 본인인증 정보 삭제 완료');

        // 6. 만 14세 미만 체크
        if (age < 14) {
          return NextResponse.json({
            status: 'UNDER_14' as const,
            certificationData: {
              name: certData.name,
              phone: certData.phone,
              birth: certData.birthday,
              gender:
                certData.gender === 'male' ? ('M' as const) : ('F' as const),
            },
          });
        }

        // 7. 기존 회원 확인 (DB 조회)
        // TODO: 실제 DB 조회 로직 구현
        // const existingUser = await prisma.user.findFirst({
        //   where: {
        //     OR: [
        //       {
        //         name: certData.name,
        //         birth: certData.birthday,
        //       },
        //       {
        //         phone: certData.phone,
        //       }
        //     ]
        //   }
        // });

        // if (existingUser) {
        //   return NextResponse.json({
        //     status: "EXISTING",
        //     user: {
        //       id: existingUser.id,
        //       maskedId: maskEmail(existingUser.email),
        //       provider: existingUser.provider,
        //     },
        //   });
        // }

        // 8. 신규 회원 (기존 회원이 없으면)
        return NextResponse.json({
          status: 'NEW' as const,
          certificationData: {
            name: certData.name,
            phone: certData.phone,
            birth: certData.birthday,
            gender:
              certData.gender === 'male' ? ('M' as const) : ('F' as const),
          },
        });
      } catch (error) {
        console.error('❌ 아임포트 API 호출 :', error);
        return NextResponse.json(
          {
            error: '본인인증 정보 조회 중 오류가 발생했습니다.',
            details: error instanceof Error ? error.message : 'Unknown error',
          },
          { status: 500 }
        );
      }
    }

    // ============================================
    // 테스트용 Mock 응답 (환경변수 미설정 시)
    // ============================================
    console.log('🧪 테스트 모드 - Mock 응답 반환');

    const getTestScenario = (): TestScenario => {
      return 'NEW'; // 'NEW' | 'EXISTING' | 'UNDER_14' 중 선택
    };

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const scenario = getTestScenario();

    if (scenario === 'EXISTING') {
      return NextResponse.json({
        status: 'EXISTING' as const,
        user: {
          id: 'user123',
          maskedId: 'te**@example.com',
          provider: 'kakao',
        },
      });
    }

    if (scenario === 'UNDER_14') {
      return NextResponse.json({
        status: 'UNDER_14' as const,
        certificationData: {
          name: '홍길동',
          phone: '010-1234-5678',
          birth: '20150101',
          gender: 'M' as const,
        },
      });
    }

    return NextResponse.json({
      status: 'NEW' as const,
      certificationData: {
        name: '홍길동',
        phone: '010-1234-5678',
        birth: '19900101',
        gender: 'M' as const,
      },
    });
  } catch (error) {
    console.error('본인인증 검증 중 오류:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
