"use client";

import { useEffect, useRef, useState } from "react";

export default function VerifyPage({
  percentage = 60,
}: {
  percentage: number;
}) {
  const pathRef = useRef<SVGPathElement>(null);
  const [totalLength, setTotalLength] = useState(0);
  const [point, setPoint] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!pathRef.current) return;

    const length = pathRef.current.getTotalLength();
    setTotalLength(length);

    // 초기 위치 계산
    const progressLength = (length * percentage) / 100;
    const p = pathRef.current.getPointAtLength(progressLength);
    setPoint({ x: p.x, y: p.y });
  }, []);

  useEffect(() => {
    if (!pathRef.current || totalLength === 0) return;

    const progressLength = (totalLength * percentage) / 100;
    const p = pathRef.current.getPointAtLength(progressLength);
    setPoint({ x: p.x, y: p.y });
  }, [percentage, totalLength]);

  const dashOffset = totalLength - (totalLength * percentage) / 100;

  return (
    <div className="relative inline-block">
      <svg
        width="300"
        height="500"
        viewBox="0 0 188 208"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* background path */}
        <path
          d="M187.505 206.746C161.504 203.768 92.5043 196.961 66.0046 193.984C46.0225 191.739 0.00404199 182.498 0.504042 150.167C1.00404 117.837 68.0648 120.927 97.5044 118.262C121.005 116.135 177 111.881 175.5 80.4008C174 48.921 143.069 34.7291 67 42.9653C20.5 48 9 38.2491 13 26.3745C17 14.5 61.5 0.5 62.5 0.5"
          stroke="#77985A"
          strokeOpacity="0.2"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* progress path */}
        <path
          ref={pathRef}
          d="M187.505 206.746C161.504 203.768 92.5043 196.961 66.0046 193.984C46.0225 191.739 0.00404199 182.498 0.504042 150.167C1.00404 117.837 68.0648 120.927 97.5044 118.262C121.005 116.135 177 111.881 175.5 80.4008C174 48.921 143.069 34.7291 67 42.9653C20.5 48 9 38.2491 13 26.3745C17 14.5 61.5 0.5 62.5 0.5"
          stroke="#77985A"
          strokeWidth="2"
          strokeLinecap="round"
          style={{
            strokeDasharray: totalLength,
            strokeDashoffset: dashOffset,
            transition: "stroke-dashoffset 0.5s ease-in-out",
          }}
        />

        {/* 🔥 게이지 끝 이미지 */}
        {point && (
          <image
            href="/thumb_60x60.png" // 원하는 이미지
            x={point.x - 8}
            y={point.y - 25}
            width={50}
            height={50}
          />
        )}
      </svg>

      <div className="text-center font-bold mt-2">{percentage}%</div>
    </div>
  );
}
