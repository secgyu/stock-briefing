interface IconProps {
  color: string;
  filled?: boolean;
  size?: number;
}

/** 하단 탭/토글에 쓰는 최소 인라인 SVG. 네트워크 의존 없이 항상 선명하게 렌더된다. */

export function HomeIcon({ color, filled, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4v-5h-6v5H5a1 1 0 0 1-1-1z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
        fill={filled ? color : "none"}
      />
    </svg>
  );
}

export function CalendarIcon({ color, filled, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x={3.5}
        y={5}
        width={17}
        height={15}
        rx={3}
        stroke={color}
        strokeWidth={1.8}
        fill={filled ? color : "none"}
      />
      <path d="M8 3v4M16 3v4M3.5 9.5h17" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </svg>
  );
}

export function StarIcon({ color, filled, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3.5l2.6 5.27 5.82.85-4.21 4.1.99 5.79L12 16.77l-5.2 2.73.99-5.79-4.21-4.1 5.82-.85z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
        fill={filled ? color : "none"}
      />
    </svg>
  );
}

export function ChartIcon({ color, filled, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x={4}
        y={13}
        width={4}
        height={6}
        rx={1.2}
        stroke={color}
        strokeWidth={1.8}
        fill={filled ? color : "none"}
      />
      <rect
        x={10}
        y={9}
        width={4}
        height={10}
        rx={1.2}
        stroke={color}
        strokeWidth={1.8}
        fill={filled ? color : "none"}
      />
      <rect
        x={16}
        y={5}
        width={4}
        height={14}
        rx={1.2}
        stroke={color}
        strokeWidth={1.8}
        fill={filled ? color : "none"}
      />
    </svg>
  );
}

export function SearchIcon({ color, size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx={11} cy={11} r={6.5} stroke={color} strokeWidth={1.8} />
      <path d="m16 16 4 4" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </svg>
  );
}

/** Material Design 'settings' 글리프(Apache-2.0) — 검증된 패스라 어느 크기에서도 형태가 안정적. */
export function GearIcon({ color, size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path
        fill={color}
        d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.484.484 0 0 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.49.49 0 0 0-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2z"
      />
    </svg>
  );
}

export function CheckIcon({ color, size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="m5 12.5 4.5 4.5L19 7.5" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronRightIcon({ color, size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="m9 6 6 6-6 6" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
