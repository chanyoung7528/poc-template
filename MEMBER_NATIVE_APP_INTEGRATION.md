# Member 네이티브 앱 통신 로직 추가 완료

## 📋 작업 개요

**목표**: auth의 네이티브 앱 통신 로직을 member에 적용하여 플러터 앱과 웹뷰 간 브리지 통신 지원

**참고**: `src/features/auth/hooks/useSnsSignupFlow.ts`, `useAuthSignupPage.ts`

---

## 🗂️ 변경된 파일

### 1. 수정된 파일 (2개)

#### 📄 `src/features/member/hooks/useSnsSignupFlow.ts`
**변경 사항**:
- ✅ 네이티브 앱 통신 로직 추가 (플러터 브리지)
- ✅ 웹 OAuth 폴백 로직 추가
- ✅ 카카오/네이버 콜백 함수 등록
- ✅ `handleSnsLogin()` 메서드 추가

**주요 추가 기능**:
```typescript
// 네이티브 앱 로그인 요청
const requestNativeLogin = (provider: "kakao" | "naver"): boolean => {
  const requestFn = window[config.requestFunction];
  if (typeof requestFn === "function") {
    console.log(`📱 ${config.name} 네이티브 로그인 요청`);
    requestFn();
    return true;
  }
  return false;
};

// 웹 OAuth 폴백
const requestWebOAuthLogin = (provider: "kakao" | "naver") => {
  const authUrl = new URL(config.authUrl);
  // ... OAuth 파라미터 설정
  window.location.href = authUrl.toString();
};

// 통합 진입점
const handleSnsLogin = (provider: SnsProvider) => {
  // 네이티브 앱 시도 → 실패 시 웹 OAuth로 폴백
  if (!requestNativeLogin(provider)) {
    requestWebOAuthLogin(provider);
  }
};
```

**콜백 함수 등록**:
```typescript
useEffect(() => {
  window.onKakaoLoginSuccess = handleKakaoLoginSuccess;
  window.onKakaoLoginError = handleKakaoLoginError;
  window.onNaverLoginSuccess = handleNaverLoginSuccess;
  window.onNaverLoginError = handleNaverLoginError;

  return () => {
    // cleanup
  };
}, [dependencies]);
```

#### 📄 `src/features/member/hooks/useMemberSignupPage.ts`
**변경 사항**:
- ✅ Mock 로직 제거
- ✅ `handleSnsLogin()` 호출로 단순화

**Before**:
```typescript
const handleKakaoLogin = async () => {
  // Mock: 카카오 로그인 성공 후
  const mockAccessToken = "kakao_mock_token_12345";
  await snsFlow.handleSnsLoginComplete("KAKAO", mockAccessToken);
};
```

**After**:
```typescript
const handleKakaoLogin = () => {
  snsFlow.handleSnsLogin("kakao");
};
```

### 2. 새로 생성된 파일 (1개)

#### 📄 `src/features/member/hooks/useSnsLoginFlow.ts` (새로 생성)
**역할**: Member SNS 로그인 전용 플로우

**주요 기능**:
- ✅ 네이티브 앱 통신 지원
- ✅ 웹 OAuth 폴백
- ✅ 기존 회원 → 자동 로그인
- ✅ 신규 회원 → 회원가입 플로우로 전환

**사용 예시**:
```typescript
import { useSnsLoginFlow } from "@/features/member/hooks";

const { handleSnsLogin, isLoading } = useSnsLoginFlow();

// 카카오 로그인
handleSnsLogin("kakao");
```

### 3. 업데이트된 파일 (1개)

#### 📄 `src/features/member/hooks/index.ts`
**변경 사항**:
- ✅ `useSnsLoginFlow` export 추가
- ✅ 주석으로 그룹화 (회원가입/로그인/페이지/유틸리티)

---

## 🔧 네이티브 앱 통신 구조

### 플러터 앱 → 웹뷰 통신

#### 1. 로그인 요청 (Flutter → Web)
```dart
// Flutter 앱에서 웹뷰에 함수 주입
webViewController.runJavaScript('''
  window.requestKakaoLogin = function() {
    // Flutter의 카카오 로그인 SDK 호출
  };
''');
```

#### 2. 로그인 시작 (Web)
```typescript
// 웹에서 Flutter 함수 호출
if (typeof window.requestKakaoLogin === "function") {
  window.requestKakaoLogin(); // ← Flutter로 요청
}
```

#### 3. 로그인 결과 수신 (Flutter → Web)
```dart
// Flutter에서 웹뷰로 결과 전달
webViewController.runJavaScript('''
  if (window.onKakaoLoginSuccess) {
    window.onKakaoLoginSuccess({
      id: "$userId",
      accessToken: "$accessToken",
      nickname: "$nickname"
    });
  }
''');
```

#### 4. 결과 처리 (Web)
```typescript
// 웹에서 콜백 함수 등록
window.onKakaoLoginSuccess = async (data) => {
  // SNS 로그인 처리
  await checkSnsUser.mutateAsync({
    snsType: "KAKAO",
    accessToken: data.accessToken,
  });
};
```

### 웹 환경 폴백

네이티브 함수가 없으면 자동으로 웹 OAuth로 전환:

```typescript
const handleSnsLogin = (provider: SnsProvider) => {
  // 1. 네이티브 앱 시도
  if (!requestNativeLogin(provider)) {
    // 2. 실패 시 웹 OAuth로 폴백
    requestWebOAuthLogin(provider);
  }
};
```

---

## 📊 플로우 비교

### Auth vs Member

| 항목 | Auth | Member |
|------|------|--------|
| **네이티브 통신** | ✅ 지원 | ✅ 지원 (추가됨) |
| **웹 OAuth 폴백** | ✅ 지원 | ✅ 지원 (추가됨) |
| **Provider** | 카카오, 네이버 | 카카오, 네이버 |
| **토큰 관리** | auth.store.ts | member.store.ts |
| **API 엔드포인트** | `/api/auth/*` | `/api/member/*` |
| **리다이렉트** | `/signup`, `/login` | `/member/signup`, `/member/terms-agreement` |

---

## 🎯 통신 흐름도

### 회원가입 플로우 (네이티브 앱)

```
1. 사용자: "카카오로 회원가입" 버튼 클릭
   ↓
2. Web: handleSnsLogin("kakao") 호출
   ↓
3. Web: window.requestKakaoLogin() 호출
   ↓
4. Flutter: 카카오 네이티브 SDK로 로그인
   ↓
5. Flutter: 로그인 성공 → window.onKakaoLoginSuccess(data) 호출
   ↓
6. Web: checkSnsUser API 호출
   ↓
7. Web: registerToken 저장
   ↓
8. Web: /member/terms-agreement로 이동
```

### 회원가입 플로우 (웹 환경)

```
1. 사용자: "카카오로 회원가입" 버튼 클릭
   ↓
2. Web: handleSnsLogin("kakao") 호출
   ↓
3. Web: window.requestKakaoLogin 없음 → OAuth로 폴백
   ↓
4. Web: 카카오 OAuth 페이지로 리다이렉트
   ↓
5. 사용자: 카카오 로그인 완료
   ↓
6. 카카오: redirect_uri로 code 전달
   ↓
7. Web: code로 accessToken 요청
   ↓
8. Web: checkSnsUser API 호출
   ↓
9. Web: registerToken 저장
   ↓
10. Web: /member/terms-agreement로 이동
```

---

## 🔍 주요 변경 사항 상세

### 1. 네이티브 앱 통신 지원

#### Provider 설정
```typescript
const PROVIDER_CONFIG = {
  kakao: {
    name: "카카오",
    authUrl: "https://kauth.kakao.com/oauth/authorize",
    requestFunction: "requestKakaoLogin" as const,
  },
  naver: {
    name: "네이버",
    authUrl: "https://nid.naver.com/oauth2.0/authorize",
    requestFunction: "requestNaverLogin" as const,
  },
} as const;
```

#### 전역 타입 정의
```typescript
declare global {
  interface Window {
    requestKakaoLogin?: () => void;
    requestNaverLogin?: () => void;
    onKakaoLoginSuccess?: (data: SocialLoginData) => void;
    onKakaoLoginError?: (error: SocialLoginError) => void;
    onNaverLoginSuccess?: (data: SocialLoginData) => void;
    onNaverLoginError?: (error: SocialLoginError) => void;
  }
}
```

### 2. 로딩 상태 관리

```typescript
const [isSocialLoading, setIsSocialLoading] = useState(false);

// 네이티브 로그인 요청 시
setIsSocialLoading(true);
requestFn();

// 결과 수신 시
finally {
  setIsSocialLoading(false);
}
```

### 3. 에러 처리

```typescript
const createSocialLoginErrorHandler = (provider) => {
  return (error: SocialLoginError) => {
    setIsSocialLoading(false);
    toast.error(error.message || `${providerName} 로그인에 실패했습니다`);
    console.error(`${providerName} 로그인 실패:`, error);
  };
};
```

---

## ✅ 체크리스트

### 완료된 작업
- [x] `useSnsSignupFlow.ts`에 네이티브 앱 통신 로직 추가
- [x] `useMemberSignupPage.ts`에서 Mock 로직 제거
- [x] `useSnsLoginFlow.ts` 새로 생성 (로그인 전용)
- [x] `index.ts` 업데이트
- [x] Linter 에러 확인 (없음)

### 향후 작업 (선택)
- [ ] Apple 로그인 구현
- [ ] 계정 연동 플로우 구현
- [ ] 단위 테스트 추가
- [ ] E2E 테스트 추가

---

## 🎉 결과

**member의 SNS 로그인/회원가입이 auth와 동일하게 네이티브 앱 통신을 지원합니다!**

- ✅ **플러터 앱**: 네이티브 SDK로 로그인
- ✅ **웹 환경**: OAuth로 자동 폴백
- ✅ **일관된 구조**: auth와 동일한 패턴
- ✅ **타입 안정성**: TypeScript 전역 타입 정의
- ✅ **에러 처리**: 성공/실패 콜백 분리
- ✅ **로딩 상태**: UI 피드백 제공

---

## 📝 사용 예시

### 회원가입 페이지
```typescript
import { useMemberSignupPage } from "@/features/member/hooks";

export default function MemberSignupPage() {
  const {
    handleKakaoLogin,
    handleNaverLogin,
    isLoading,
  } = useMemberSignupPage();

  return (
    <div>
      <button onClick={handleKakaoLogin} disabled={isLoading}>
        카카오로 회원가입
      </button>
      <button onClick={handleNaverLogin} disabled={isLoading}>
        네이버로 회원가입
      </button>
    </div>
  );
}
```

### 로그인 페이지 (향후)
```typescript
import { useSnsLoginFlow } from "@/features/member/hooks";

export default function MemberLoginPage() {
  const { handleSnsLogin, isLoading } = useSnsLoginFlow();

  return (
    <div>
      <button onClick={() => handleSnsLogin("kakao")} disabled={isLoading}>
        카카오로 로그인
      </button>
    </div>
  );
}
```
