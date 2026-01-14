import type { Metadata } from 'next';
import { QueryProvider } from '@/lib/query-provider';
import './globals.scss';

export const metadata: Metadata = {
  title: '소셜 로그인 - Next.js 15',
  description: 'Next.js 15와 소셜 OAuth를 이용한 간편 로그인',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
