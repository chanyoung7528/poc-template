import clsx from 'clsx';
import { type CSSProperties, type SVGProps } from 'react';

import styles from './Icon.module.scss';
import { iconAssets, type IconData } from './icon-assets';

export type IconName = keyof typeof iconAssets;

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name' | 'color'> {
  /** 아이콘 이름 */
  name: IconName;
  /**
   * 아이콘 크기
   * - number: 사용자 지정 px
   */
  size?: 'sm' | 'md' | 'lg' | number;
  /**
   * 아이콘 색상 (CSS color 값)
   * - 미지정 시 currentColor 사용 (부모 요소의 color 상속)
   */
  color?: string;
  /** 아이콘 스타일 variant */
  variant?: 'outlined' | 'filled' | 'duotone';
  /** 아이콘 회전 (deg) */
  rotation?: number;
  /** 접근성 라벨 (없을 경우 aria-hidden 처리) */
  label?: string;
}

/**
 * 공용 아이콘 컴포넌트
 * @example
 * <Icon name="ArrowLeft" size="lg" color="var(--color-primary)" />
 * <Icon name="Home" size={40} variant="filled" rotation={90} />
 */
export function Icon({ name, size = 'md', color, variant = 'outlined', rotation, label, className, style, ...props }: IconProps) {
  const iconData: IconData = iconAssets[name];

  const mergedStyle: CSSProperties = {
    ...(typeof size === 'number' && { width: size, height: size }),
    ...(color && { color }),
    ...(rotation && { transform: `rotate(${rotation}deg)` }),
    ...style,
  };

  const sizeClassName = typeof size === 'string' ? styles[`size-${size}`] : undefined;
  const variantClassName = styles[`${variant}`];

  return (
    <svg
      viewBox={iconData.viewBox ?? '0 0 24 24'}
      className={clsx(styles.icon, sizeClassName, variantClassName, className)}
      style={mergedStyle}
      aria-label={label}
      aria-hidden={!label}
      {...props}
    >
      {iconData.paths.map((pathData, index) => (
        <path key={index} {...pathData} />
      ))}
    </svg>
  );
}
