import { adaptive } from "@toss/tds-colors";
import { Text } from "@toss/tds-mobile";
import { CalendarIcon, HomeIcon, StarIcon } from "./icons";

export type TabKey = "home" | "calendar" | "watch";

const TABS: Array<{ key: TabKey; label: string; Icon: typeof HomeIcon }> = [
  { key: "home", label: "홈", Icon: HomeIcon },
  { key: "calendar", label: "캘린더", Icon: CalendarIcon },
  { key: "watch", label: "관심", Icon: StarIcon },
];

export function BottomTabBar({ active, onChange }: { active: TabKey; onChange: (key: TabKey) => void }) {
  return (
    <nav
      style={{
        display: "flex",
        borderTop: `1px solid ${adaptive.hairlineBorder}`,
        background: adaptive.background,
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        flexShrink: 0,
      }}
    >
      {TABS.map(({ key, label, Icon }) => {
        const on = key === active;
        const color = on ? adaptive.blue500 : adaptive.grey500;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            aria-label={label}
            aria-current={on}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              padding: "8px 0 10px",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            <Icon color={color} filled={on} />
            <Text typography="st13" fontWeight={on ? "bold" : "medium"} color={color}>
              {label}
            </Text>
          </button>
        );
      })}
    </nav>
  );
}
