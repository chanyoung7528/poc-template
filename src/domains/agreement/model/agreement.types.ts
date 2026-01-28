/**
 * Domain: Agreement - Types
 * 
 * 역할: 약관 도메인 타입 정의
 */

// ============================================
// 약관 정보
// ============================================

export interface Agreement {
  agrmNo: string; // 약관 번호
  agrmTit: string; // 약관 제목
  agrmCont: string; // 약관 내용
  agrmSctDtlCd: string; // 약관 구분 코드
  agrmSctDtlNm: string; // 약관 구분명
  agrmChocSctCd: string; // 필수/선택 코드
  agrmChocSctNm: string; // 필수/선택명
  isRequired: boolean; // 필수 여부
  sortSeq: number; // 정렬 순서
  langCd?: string; // 언어 코드
}

// ============================================
// API 응답 타입
// ============================================

export interface AgreementListResponse {
  code: string;
  message: string;
  data: Agreement[];
  succeeded: boolean;
  total: number;
  isJackson: boolean;
}

export interface AgreementDetailResponse {
  code: string;
  message: string;
  data: Agreement;
  succeeded: boolean;
  total: number;
  isJackson: boolean;
}
