import "@/shared/assets/styles/index.scss";
import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { QueryProvider } from "@/lib/query-provider";
import { pretendard, suite } from "@/shared/assets/fonts";
export const metadata: Metadata = {
  title: "소셜 로그인 - Next.js 15",
  description: "Next.js 15와 소셜 OAuth를 이용한 간편 로그인",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>{/* API 호스트로 초기 연결 최적화 */}</head>
      <body className={`${pretendard.variable} ${suite.variable}`}>
        <QueryProvider>{children}</QueryProvider>

        {/* 아임포트 SDK 스크립트 */}
        <Script
          src="https://cdn.iamport.kr/v1/iamport.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
