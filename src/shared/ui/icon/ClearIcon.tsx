interface ClearIconProps {
  size?: number;
  className?: string;
  onClick?: () => void;
}

export function ClearIcon({ size = 20, className, onClick }: ClearIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      <mask
        id="mask0_1852_46437"
        style={{ maskType: "alpha" }}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="20"
        height="20"
      >
        <rect width="20" height="20" fill="#D9D9D9" />
      </mask>
      <g mask="url(#mask0_1852_46437)">
        <ellipse cx="10" cy="10.0033" rx="8" ry="8.0023" fill="#CCCFD3" />
        <path
          d="M7.5 7.50293L12.5 12.5044"
          stroke="white"
          strokeLinecap="round"
        />
        <path
          d="M12.5 7.50293L7.5 12.5044"
          stroke="white"
          stroke-linecap="round"
        />
      </g>
    </svg>
  );
}
