import { adaptive } from "@toss/tds-colors";
import { useState } from "react";

const PALETTE: Array<{ bg: string; fg: string }> = [
  { bg: adaptive.blue100, fg: adaptive.blue600 },
  { bg: adaptive.teal100, fg: adaptive.teal600 },
  { bg: adaptive.green100, fg: adaptive.green600 },
  { bg: adaptive.purple100, fg: adaptive.purple600 },
  { bg: adaptive.orange100, fg: adaptive.orange600 },
  { bg: adaptive.red100, fg: adaptive.red600 },
];

function pick(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}

interface Props {
  name: string;
  seed?: string;
  size?: number;
  /** 우선순위 로고 URL 후보들. 앞에서부터 시도하고 전부 실패하면 모노그램으로 폴백한다. */
  logoUrls?: string[];
}

/** 로고가 있으면 로고 이미지를, 없거나 모두 깨지면 이름 첫 글자 모노그램을 보여준다. */
export function StockAvatar({ name, seed, size = 40, logoUrls }: Props) {
  const [idx, setIdx] = useState(0);
  const src = logoUrls?.[idx];

  if (src != null) {
    return (
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        onError={() => setIdx((i) => i + 1)}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          background: adaptive.grey100,
          flexShrink: 0,
        }}
        aria-hidden
      />
    );
  }

  const { bg, fg } = pick(seed ?? name);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: bg,
        color: fg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.42,
        fontWeight: 700,
        flexShrink: 0,
      }}
      aria-hidden
    >
      {name.trim().charAt(0)}
    </div>
  );
}
