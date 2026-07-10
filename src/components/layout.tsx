import { adaptive } from "@toss/tds-colors";
import { Text } from "@toss/tds-mobile";
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";

export const PAGE_BACKGROUND = adaptive.greyBackground;

/** 배경·테두리 없는 투명 버튼 (아이콘·텍스트 버튼 공용) */
export function PlainButton({ style, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      style={{ background: "none", border: "none", padding: 4, cursor: "pointer", ...style }}
    />
  );
}

/** 화면 스크롤 영역. 하단 탭바에 가리지 않도록 아래 여백을 준다. */
export function Screen({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        minHeight: "100%",
        background: PAGE_BACKGROUND,
        paddingBottom: 32,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** 흰(다크: 레이어드) 카드 표면으로 섹션을 감싼다. */
export function SectionCard({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <section
      style={{
        background: adaptive.backgroundLevel01,
        borderRadius: 20,
        margin: "0 16px 12px",
        padding: "8px 4px",
        ...style,
      }}
    >
      {children}
    </section>
  );
}

interface SectionHeaderProps {
  title: string;
  caption?: string;
  moreLabel?: string;
  onMore?: () => void;
}

export function SectionHeader({ title, caption, moreLabel, onMore }: SectionHeaderProps) {
  return (
    <div style={{ padding: "12px 20px 4px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Text typography="t4" fontWeight="bold" color={adaptive.grey900}>
          {title}
        </Text>
        {moreLabel != null && (
          <PlainButton onClick={onMore}>
            <Text typography="t7" fontWeight="medium" color={adaptive.grey500}>
              {moreLabel}
            </Text>
          </PlainButton>
        )}
      </div>
      {caption != null && (
        <div style={{ marginTop: 2 }}>
          <Text typography="t7" color={adaptive.grey500}>
            {caption}
          </Text>
        </div>
      )}
    </div>
  );
}
