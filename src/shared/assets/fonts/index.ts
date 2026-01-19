import localFont from 'next/font/local';

/**
 * Pretendard Variable 폰트
 * @see https://github.com/orioncactus/pretendard
 */
export const pretendard = localFont({
  src: './PretendardVariable.woff2',
  variable: '--font-pretendard',
  weight: '100 900',
  display: 'swap',
  preload: true,
  fallback: [
    '-apple-system',
    'BlinkMacSystemFont',
    'system-ui',
    'Apple SD Gothic Neo',
    'Noto Sans KR',
    'Malgun Gothic',
    'sans-serif',
  ],
});

/**
 * SUITE Variable 폰트
 * - 사용 예: className={suite.className}
 * @see https://sunn.us/suite
 */
export const suite = localFont({
  src: './SUITE-Variable.woff2',
  variable: '--font-suite',
  weight: '300 900',
  display: 'swap',
  preload: false,
  fallback: [
    '-apple-system',
    'BlinkMacSystemFont',
    'system-ui',
    'Apple SD Gothic Neo',
    'Noto Sans KR',
    'Malgun Gothic',
    'sans-serif',
  ],
});
