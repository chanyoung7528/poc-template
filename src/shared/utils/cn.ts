import { type ClassValue, clsx } from 'clsx';

/**
 * 클래스 이름 병합 유틸리티 (clsx 래퍼)
 * - 조건부 클래스 적용
 * - 배열, 객체 지원
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Base UI 상태 기반 클래스 병합 헬퍼
 * @param baseClass 기본 클래스
 * @param userClass 사용자 정의 클래스 (문자열 또는 상태 함수)
 */
export function mergeCN<State>(baseClass: string | undefined, userClass: string | ((state: State) => string | undefined) | undefined) {
  return (state: State) => {
    const userClassName = typeof userClass === 'function' ? userClass(state) : userClass;
    return cn(baseClass, userClassName);
  };
}
