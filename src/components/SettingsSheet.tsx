import { adaptive } from "@toss/tds-colors";
import { ListRow, Text, useBottomSheet } from "@toss/tds-mobile";
import { useThemePref, type ThemePref } from "../lib/theme";
import { CheckIcon, GearIcon } from "./icons";

const THEME_OPTIONS: Array<{ value: ThemePref; label: string; desc: string }> = [
  { value: "system", label: "시스템 설정 따르기", desc: "토스·기기 화면 모드에 맞춰요" },
  { value: "light", label: "라이트 모드", desc: "항상 밝은 화면으로 보여요" },
  { value: "dark", label: "다크 모드", desc: "항상 어두운 화면으로 보여요" },
];

/** 설정 바텀시트 본문. 선택 즉시 테마가 적용된다. */
function ThemeOptions() {
  const [pref, setPref] = useThemePref();
  return (
    <div style={{ paddingBottom: 8 }}>
      {THEME_OPTIONS.map(({ value, label, desc }) => {
        const on = pref === value;
        return (
          <ListRow
            key={value}
            onClick={() => setPref(value)}
            withTouchEffect
            contents={
              <div>
                <Text typography="t6" fontWeight={on ? "bold" : "medium"} color={adaptive.grey900}>
                  {label}
                </Text>
                <div style={{ marginTop: 2 }}>
                  <Text typography="t7" color={adaptive.grey500}>
                    {desc}
                  </Text>
                </div>
              </div>
            }
            right={on ? <CheckIcon color={adaptive.blue500} /> : undefined}
          />
        );
      })}
    </div>
  );
}

/** 홈 헤더 우측 톱니바퀴. 누르면 설정 바텀시트가 열린다. */
export function SettingsButton() {
  const { open, close } = useBottomSheet();
  return (
    <button
      type="button"
      aria-label="설정"
      onClick={() =>
        open({
          header: "화면 테마",
          children: <ThemeOptions />,
          onClose: () => close(),
        })
      }
      style={{ background: "none", border: "none", cursor: "pointer", padding: 8, display: "flex" }}
    >
      <GearIcon color={adaptive.grey500} />
    </button>
  );
}
