/**
 * Domain: Agreement - React Query Hooks
 * 
 * 역할: React Query hooks (데이터만)
 */

import { useQuery } from "@tanstack/react-query";
import { agreementApi } from "./agreement.api";

/**
 * 약관 목록 조회
 */
export function useAgreementList() {
  return useQuery({
    queryKey: ["agreement", "list"],
    queryFn: () => agreementApi.getList(),
  });
}

/**
 * 약관 상세 조회
 */
export function useAgreementDetail(agrmNo: string) {
  return useQuery({
    queryKey: ["agreement", "detail", agrmNo],
    queryFn: () => agreementApi.getDetail(agrmNo),
    enabled: !!agrmNo,
  });
}
