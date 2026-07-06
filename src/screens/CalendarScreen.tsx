import { adaptive } from "@toss/tds-colors";
import { Tab, Text, Top } from "@toss/tds-mobile";
import { useMemo, useState } from "react";
import { formatDateKo } from "../lib/format";
import { useAsyncMock } from "../lib/useAsyncMock";
import type { UseWatchlist } from "../lib/watchlist";
import { MOCK_EARNINGS, MOCK_IPOS } from "../mock/dummy";
import { SectionCard, Screen } from "../components/layout";
import { EarningsRow, IpoRow } from "../components/rows";
import { AsyncSection, EmptyState } from "../components/states";
import type { EarningsEvent, IpoEvent, Market } from "../types";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const MARKET_BY_INDEX: Array<Market | "all"> = ["all", "KR", "US"];

function toKey(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function startOfWeek(d: Date): Date {
  const s = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  s.setDate(s.getDate() - s.getDay()); // 일요일 시작
  return s;
}

interface CalendarData {
  earnings: EarningsEvent[];
  ipos: IpoEvent[];
}

export function CalendarScreen({
  watchlist,
  onOpenStock,
}: {
  watchlist: UseWatchlist;
  onOpenStock: (symbol: string) => void;
}) {
  const today = useMemo(() => new Date(), []);
  const [weekStart, setWeekStart] = useState(() => startOfWeek(today));
  const [selectedKey, setSelectedKey] = useState(() => toKey(today));
  const [filterIndex, setFilterIndex] = useState(0);
  const market = MARKET_BY_INDEX[filterIndex];

  const { status, data, retry } = useAsyncMock<CalendarData>(() => ({
    earnings: MOCK_EARNINGS,
    ipos: MOCK_IPOS,
  }));

  const weekDays = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + i);
        return d;
      }),
    [weekStart],
  );

  const marketMatch = <T extends { market: Market }>(x: T) => (market === "all" ? true : x.market === market);

  const dayEarnings = (data?.earnings ?? []).filter((e) => e.date === selectedKey && marketMatch(e));
  const dayIpos = (data?.ipos ?? []).filter((i) => i.date === selectedKey && marketMatch(i));
  const hasAny = dayEarnings.length + dayIpos.length > 0;

  const eventKeys = useMemo(() => {
    const set = new Set<string>();
    (data?.earnings ?? []).forEach((e) => marketMatch(e) && set.add(e.date));
    (data?.ipos ?? []).forEach((i) => marketMatch(i) && set.add(i.date));
    return set;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, market]);

  const shiftWeek = (dir: -1 | 1) => {
    const next = new Date(weekStart);
    next.setDate(next.getDate() + dir * 7);
    setWeekStart(next);
  };

  return (
    <Screen>
      <Top title={<Top.TitleParagraph size={22}>캘린더</Top.TitleParagraph>} />

      <div style={{ padding: "4px 16px 12px" }}>
        <Tab onChange={setFilterIndex}>
          <Tab.Item selected={filterIndex === 0}>전체</Tab.Item>
          <Tab.Item selected={filterIndex === 1}>국내</Tab.Item>
          <Tab.Item selected={filterIndex === 2}>해외</Tab.Item>
        </Tab>
      </div>

      <SectionCard style={{ padding: "12px 8px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 8px 8px" }}>
          <button type="button" onClick={() => shiftWeek(-1)} style={arrowBtn} aria-label="이전 주">
            <Text typography="t5" color={adaptive.grey600}>
              ‹
            </Text>
          </button>
          <Text typography="t6" fontWeight="bold" color={adaptive.grey800}>
            {weekStart.getFullYear()}년 {weekStart.getMonth() + 1}월
          </Text>
          <button type="button" onClick={() => shiftWeek(1)} style={arrowBtn} aria-label="다음 주">
            <Text typography="t5" color={adaptive.grey600}>
              ›
            </Text>
          </button>
        </div>
        <div style={{ display: "flex" }}>
          {weekDays.map((d) => {
            const key = toKey(d);
            const selected = key === selectedKey;
            const isToday = key === toKey(today);
            const dot = eventKeys.has(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedKey(key)}
                style={{ flex: 1, background: "none", border: "none", padding: "4px 0", cursor: "pointer" }}
              >
                <Text typography="st13" color={adaptive.grey500}>
                  {WEEKDAYS[d.getDay()]}
                </Text>
                <div
                  style={{
                    margin: "4px auto 0",
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: selected ? adaptive.blue500 : "transparent",
                  }}
                >
                  <Text
                    typography="t6"
                    fontWeight={selected || isToday ? "bold" : "regular"}
                    color={selected ? "#fff" : isToday ? adaptive.blue500 : adaptive.grey800}
                  >
                    {d.getDate()}
                  </Text>
                </div>
                <div
                  style={{
                    margin: "3px auto 0",
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    background: dot && !selected ? adaptive.blue400 : "transparent",
                  }}
                />
              </button>
            );
          })}
        </div>
      </SectionCard>

      <div style={{ padding: "4px 20px 8px" }}>
        <Text typography="t5" fontWeight="bold" color={adaptive.grey900}>
          {formatDateKo(selectedKey)}
        </Text>
      </div>

      <SectionCard>
        <AsyncSection
          status={status}
          data={hasAny ? [1] : []}
          onRetry={retry}
          empty={<EmptyState title="이 날은 일정이 없어요" description="다른 날짜를 선택해 보세요." />}
        >
          {() => (
            <>
              {dayEarnings.map((e) => (
                <EarningsRow
                  key={`${e.symbol}-${e.date}`}
                  event={e}
                  watched={watchlist.isWatched(e.symbol)}
                  onToggle={() => watchlist.toggle(e)}
                  onClick={() => onOpenStock(e.symbol)}
                />
              ))}
              {dayIpos.map((i) => (
                <IpoRow key={`${i.name}-${i.date}`} ipo={i} />
              ))}
            </>
          )}
        </AsyncSection>
      </SectionCard>
    </Screen>
  );
}

const arrowBtn = {
  background: "none",
  border: "none",
  padding: "4px 12px",
  cursor: "pointer",
} as const;
