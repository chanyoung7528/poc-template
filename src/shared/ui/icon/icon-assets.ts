/**
 * 아이콘 데이터 정의
 * - viewBox: SVG 뷰박스 (기본 24x24)
 * - paths: path 요소 배열
 * - 기본 stroke 속성은 CSS에 정의 (strokeWidth: 2, strokeLinecap: round, strokeLinejoin: round)
 */
export interface IconData {
  viewBox?: string;
  paths: Array<{
    d: string;
    strokeWidth?: number;
    strokeLinecap?: "round" | "butt" | "square";
    strokeLinejoin?: "round" | "miter" | "bevel";
    fill?: string;
  }>;
}

/**
 * 아이콘 에셋 정의
 *
 * 새 아이콘 추가 방법: pnpm add-icon ~/Downloads/new-icon.svg NewIcon
 * 1. 아이콘 이름을 PascalCase로 정의
 * 2. paths 배열에 path data 추가
 * 3. 특별한 속성이 필요한 경우에만 strokeWidth 등 명시
 */
export const iconAssets = {
  ArrowLeft: {
    paths: [{ d: "M15.5 20.5L7 12L15.5 3.5" }],
  },
  ArrowRight: {
    paths: [{ d: "M8.5 3.5L17 12L8.5 20.5" }],
  },
  Home: {
    paths: [
      { d: "M1.53125 11.4319L12.0003 2.00977L22.4693 11.4319" },
      {
        d: "M18.8051 8.17969V18.8652C18.8051 20.2529 17.5864 21.3778 16.0831 21.3778H7.91726C6.41397 21.3778 5.19531 20.2529 5.19531 18.8652V8.17969",
      },
    ],
  },
  SignMulti: {
    paths: [
      { d: "M5.17072 18.8289L18.8287 5.17094" },
      { d: "M5.17107 5.17072L18.829 18.8287" },
    ],
  },
} as const satisfies Record<string, IconData>;
