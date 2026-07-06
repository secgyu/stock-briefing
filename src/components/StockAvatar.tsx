import { adaptive } from "@toss/tds-colors";

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
}

/** 종목 로고 대신 이름 첫 글자를 색상 원형에 넣은 모노그램 아바타 */
export function StockAvatar({ name, seed, size = 40 }: Props) {
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
