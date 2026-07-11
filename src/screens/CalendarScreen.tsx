import { adaptive } from "@toss/tds-colors";
import { Tab, Text, Top } from "@toss/tds-mobile";
import { useMemo, useState } from "react";
import { formatDateKo, WEEKDAYS } from "../lib/format";
import { useIpos, useUpcomingEarnings } from "../lib/hooks";
import { queryStatus } from "../lib/queryClient";
import type { UseWatchlist } from "../lib/watchlist";
import { PlainButton, SectionCard, Screen } from "../components/layout";
import { EarningsRow, IpoRow } from "../components/rows";
import { AsyncSection, EmptyState } from "../components/states";
import type { EarningsEvent, IpoEvent, Market } from "../types";

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

/** "YYYY-MM-DD" → 로컬 Date (new Date(str)의 UTC 파싱으로 인한 하루 밀림 방지). */
function fromKey(k: string): Date {
  const [y, m, d] = k.split("-").map(Number);
  return new Date(y, m - 1, d);
}

type ViewMode = "week" | "month";

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
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [monthAnchor, setMonthAnchor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const market = MARKET_BY_INDEX[filterIndex];

  // Home/Watch와 같은 쿼리 키 → 캐시 공유(탭 이동 시 재요청 없음).
  const earningsQ = useUpcomingEarnings();
  const iposQ = useIpos();
  const status = queryStatus({
    isPending: earningsQ.isPending || iposQ.isPending,
    isError: earningsQ.isError || iposQ.isError,
  });
  const data: CalendarData = {
    earnings: earningsQ.data ?? [],
    ipos: iposQ.data ?? [],
  };
  const retry = () => {
    void earningsQ.refetch();
    void iposQ.refetch();
  };

  const weekDays = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + i);
        return d;
      }),
    [weekStart],
  );

  // 월간 그리드: 그 달 1일이 속한 주(일요일)부터, 그 달을 덮는 데 필요한 주 수만큼.
  const monthWeeks = useMemo(() => {
    const first = new Date(monthAnchor.getFullYear(), monthAnchor.getMonth(), 1);
    const gridStart = startOfWeek(first);
    const daysInMonth = new Date(monthAnchor.getFullYear(), monthAnchor.getMonth() + 1, 0).getDate();
    const weeks = Math.ceil((first.getDay() + daysInMonth) / 7);
    return Array.from({ length: weeks }, (_, w) =>
      Array.from({ length: 7 }, (_, i) => {
        const d = new Date(gridStart);
        d.setDate(d.getDate() + w * 7 + i);
        return d;
      }),
    );
  }, [monthAnchor]);

  const marketMatch = <T extends { market: Market }>(x: T) => (market === "all" ? true : x.market === market);

  const dayEarnings = data.earnings.filter((e) => e.date === selectedKey && marketMatch(e));
  const dayIpos = data.ipos.filter((i) => i.date === selectedKey && marketMatch(i));
  const hasAny = dayEarnings.length + dayIpos.length > 0;

  const eventKeys = useMemo(() => {
    const set = new Set<string>();
    data.earnings.forEach((e) => marketMatch(e) && set.add(e.date));
    data.ipos.forEach((i) => marketMatch(i) && set.add(i.date));
    return set;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, market]);

  // 화살표: 주간이면 ±1주, 월간이면 ±1개월.
  const shift = (dir: -1 | 1) => {
    if (viewMode === "week") {
      const next = new Date(weekStart);
      next.setDate(next.getDate() + dir * 7);
      setWeekStart(next);
    } else {
      setMonthAnchor(new Date(monthAnchor.getFullYear(), monthAnchor.getMonth() + dir, 1));
    }
  };

  // 펼치기/접기. 전환 시 현재 맥락(주↔달)을 유지한다.
  const toggleView = () => {
    if (viewMode === "week") {
      setMonthAnchor(new Date(weekStart.getFullYear(), weekStart.getMonth(), 1));
      setViewMode("month");
    } else {
      setWeekStart(startOfWeek(fromKey(selectedKey)));
      setViewMode("week");
    }
  };

  const headerRef = viewMode === "week" ? weekStart : monthAnchor;

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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 8px 8px",
          }}
        >
          <PlainButton onClick={() => shift(-1)} style={{ padding: "4px 12px" }} aria-label="이전">
            <Text typography="t5" color={adaptive.grey600}>
              ‹
            </Text>
          </PlainButton>
          <Text typography="t6" fontWeight="bold" color={adaptive.grey800}>
            {headerRef.getFullYear()}년 {headerRef.getMonth() + 1}월
          </Text>
          <PlainButton onClick={() => shift(1)} style={{ padding: "4px 12px" }} aria-label="다음">
            <Text typography="t5" color={adaptive.grey600}>
              ›
            </Text>
          </PlainButton>
        </div>

        <div style={{ display: "flex", padding: "0 0 2px" }}>
          {WEEKDAYS.map((w) => (
            <div key={w} style={{ flex: 1, textAlign: "center" }}>
              <Text typography="st13" color={adaptive.grey500}>
                {w}
              </Text>
            </div>
          ))}
        </div>

        {viewMode === "week" ? (
          <div style={{ display: "flex" }}>
            {weekDays.map((d) => (
              <DayCell
                key={toKey(d)}
                d={d}
                selectedKey={selectedKey}
                todayKey={toKey(today)}
                dot={eventKeys.has(toKey(d))}
                dimmed={false}
                onSelect={setSelectedKey}
              />
            ))}
          </div>
        ) : (
          monthWeeks.map((week, wi) => (
            <div key={wi} style={{ display: "flex", marginTop: wi ? 2 : 0 }}>
              {week.map((d) => (
                <DayCell
                  key={toKey(d)}
                  d={d}
                  selectedKey={selectedKey}
                  todayKey={toKey(today)}
                  dot={eventKeys.has(toKey(d))}
                  dimmed={d.getMonth() !== monthAnchor.getMonth()}
                  onSelect={setSelectedKey}
                />
              ))}
            </div>
          ))
        )}

        <PlainButton
          onClick={toggleView}
          style={{
            width: "100%",
            padding: "10px 0 2px",
            marginTop: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
          }}
        >
          <Text typography="t7" fontWeight="medium" color={adaptive.blue500}>
            {viewMode === "week" ? "한 달 전체 보기" : "주간으로 접기"}
          </Text>
          <Text typography="t7" color={adaptive.blue500}>
            {viewMode === "week" ? "▾" : "▴"}
          </Text>
        </PlainButton>
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

/** 날짜 한 칸(주간·월간 공용). 선택 시 파란 원, 오늘은 파란 글자, 일정 있으면 점, 다른 달은 흐리게. */
function DayCell({
  d,
  selectedKey,
  todayKey,
  dot,
  dimmed,
  onSelect,
}: {
  d: Date;
  selectedKey: string;
  todayKey: string;
  dot: boolean;
  dimmed: boolean;
  onSelect: (key: string) => void;
}) {
  const key = toKey(d);
  const selected = key === selectedKey;
  const isToday = key === todayKey;
  return (
    <PlainButton onClick={() => onSelect(key)} style={{ flex: 1, padding: "4px 0", opacity: dimmed ? 0.35 : 1 }}>
      <div
        style={{
          margin: "0 auto",
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
    </PlainButton>
  );
}
