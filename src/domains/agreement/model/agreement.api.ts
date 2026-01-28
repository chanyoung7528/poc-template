/**
 * Domain: Agreement - API
 * 
 * 역할: 약관 API 함수 정의 (순수 API 호출)
 */

import { apiClient } from "@/core/api/client";
import type {
  AgreementListResponse,
  AgreementDetailResponse,
} from "./agreement.types";

/**
 * Agreement API
 */
export const agreementApi = {
  /**
   * 약관 목록 조회
   */
  getList: () => apiClient.get<AgreementListResponse>("/api/agreement/list"),

  /**
   * 약관 상세 조회
   */
  getDetail: (agrmNo: string) =>
    apiClient.get<AgreementDetailResponse>(`/api/agreement/detail/${agrmNo}`),
};
