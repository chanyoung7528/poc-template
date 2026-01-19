/**
 * 아이디를 마스킹 처리합니다
 * @param id - 마스킹할 아이디
 * @returns 마스킹된 아이디 (예: abc***@example.com)
 */
export function maskId(id: string): string {
  if (!id) return '';

  if (id.includes('@')) {
    const [localPart, domain] = id.split('@');
    const visibleLength = Math.max(1, Math.floor(localPart.length / 3));
    const masked =
      localPart.slice(0, visibleLength) +
      '*'.repeat(localPart.length - visibleLength);
    return `${masked}@${domain}`;
  }

  const visibleLength = Math.max(1, Math.floor(id.length / 3));
  return id.slice(0, visibleLength) + '*'.repeat(id.length - visibleLength);
}

/**
 * 비밀번호 유효성을 검증합니다
 * @param password - 검증할 비밀번호
 * @returns 유효성 검증 결과 객체
 */
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('비밀번호는 최소 8자 이상이어야 합니다');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('대문자를 최소 1개 포함해야 합니다');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('소문자를 최소 1개 포함해야 합니다');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('숫자를 최소 1개 포함해야 합니다');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('특수문자를 최소 1개 포함해야 합니다');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * 이메일 유효성을 검증합니다
 * @param email - 검증할 이메일
 * @returns 유효한 이메일 여부
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 닉네임 유효성을 검증합니다
 * @param nickname - 검증할 닉네임
 * @returns 유효성 검증 결과 객체
 */
export function validateNickname(nickname: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (nickname.length < 2) {
    errors.push('닉네임은 최소 2자 이상이어야 합니다');
  }

  if (nickname.length > 20) {
    errors.push('닉네임은 최대 20자까지 가능합니다');
  }

  if (!/^[가-힣a-zA-Z0-9_]+$/.test(nickname)) {
    errors.push('닉네임은 한글, 영문, 숫자, 언더스코어만 사용 가능합니다');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
