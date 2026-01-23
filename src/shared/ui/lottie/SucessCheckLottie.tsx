'use client';

import lottie, { type AnimationItem } from 'lottie-web';
import { useEffect, useRef } from 'react';

import successCheckJson from '@/shared/assets/lotties/success-check.json';

interface SucessCheckLottieProps {
  width?: number; // 사용자가 눈으로 보고 싶은 실제 그림의 크기
  height?: number;
  loop?: boolean;
  className?: string;
}

export default function SucessCheckLottie({ width = 68, height = 68, loop = false, className }: SucessCheckLottieProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<AnimationItem | null>(null);

  /**
   * 비율 계산 로직
   * 원본 JSON 기준: 전체 68px 중 그림이 42.61px (약 62.6%)
   * 따라서, 사용자가 원하는 크기(width)가 100%가 되도록 전체 캔버스를 키워야 함
   */
  const ratio = 68 / 51;
  const canvasWidth = width * ratio;
  const canvasHeight = height * ratio;

  useEffect(() => {
    if (!containerRef.current) return;

    animationRef.current = lottie.loadAnimation({
      container: containerRef.current,
      renderer: 'svg',
      loop,
      autoplay: true,
      animationData: successCheckJson,
      rendererSettings: {
        preserveAspectRatio: 'xMidYMid meet',
      },
    });

    return () => {
      animationRef.current?.destroy();
    };
  }, [loop]);

  return (
    <div
      className={className}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        display: 'inline-flex', // 주변 레이아웃에 영향 주지 않도록 설정
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'visible', // 확장된 캔버스가 보일 수 있게 설정
      }}
    >
      <div
        ref={containerRef}
        aria-label="success-check-lottie"
        style={{
          width: `${canvasWidth}px`,
          height: `${canvasHeight}px`,
          flexShrink: 0, // 부모 크기에 의해 줄어들지 않도록 고정
        }}
      />
    </div>
  );
}
