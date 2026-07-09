import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adaptive } from "@toss/tds-colors";
import { Text, Top } from "@toss/tds-mobile";
import { api } from "../api/client";
import { daysUntil } from "../lib/dday";
import { openExternal } from "../lib/external";
import { type AsyncStatus, queryStatus } from "../lib/queryClient";
import type { UseWatchlist } from "../lib/watchlist";
import { DisclaimerFooter } from "../components/DisclaimerFooter";
import { SectionCard, SectionHeader, Screen } from "../components/layout";
import { EarningsRow, IpoRow, NewsRow } from "../components/rows";
import { AsyncSection, EmptyState, ListSkeleton } from "../components/states";
import type { EarningsEvent, IpoEvent, Market, NewsItem } from "../types";

interface HomeData {
  upcoming: EarningsEvent[];
  ipos: IpoEvent[];
  news: NewsItem[];
  earningsThisWeek: number;
  iposThisWeek: number;
  allUpcoming: EarningsEvent[]; // 관심종목의 다음 실적을 파생하는 원본(미래 실적 전체)
}

const withinWeek = (date: string, today: Date) => {
  const d = daysUntil(date, today);
  return d >= 0 && d <= 7;
};

/** upcoming은 미래·오름차순 정렬이므로 심볼의 첫 매치가 곧 다음 실적. */
const nextEarningsFrom = (list: EarningsEvent[], symbol: string) => list.find((e) => e.symbol === symbol);

async function loadHome(): Promise<HomeData> {
  const [upcoming, ipos, news] = await Promise.all([api.upcomingEarnings(), api.ipos(), api.news()]);
  const today = new Date();
  return {
    upcoming: upcoming.slice(0, 5),
    ipos, // 국내/해외 탭에서 각각 임박 순으로 뽑으므로 전체를 넘긴다
    news: news.slice(0, 5),
    earningsThisWeek: upcoming.filter((e) => withinWeek(e.date, today)).length,
    iposThisWeek: ipos.filter((i) => withinWeek(i.date, today)).length,
    allUpcoming: upcoming,
  };
}

const WEEKDAY = ["일", "월", "화", "수", "목", "금", "토"];

/** 상단 히어로. 브랜드 블루로 화면 시선의 앵커를 만들고 이번 주 요약을 제시한다. */
function HomeHero({ earnings, ipos }: { earnings: number; ipos: number }) {
  const now = new Date();
  const dateLabel = `${now.getMonth() + 1}월 ${now.getDate()}일 ${WEEKDAY[now.getDay()]}요일`;
  return (
    <div style={{ margin: "4px 16px 16px", borderRadius: 20, padding: "20px 22px", background: "#3182F6" }}>
      <Text typography="t7" fontWeight="medium" color="rgba(255,255,255,0.75)">
        {dateLabel}
      </Text>
      <div style={{ marginTop: 6 }}>
        <Text typography="t3" fontWeight="bold" color="#FFFFFF">
          이번 주 실적 {earnings}건 · 상장 {ipos}건
        </Text>
      </div>
    </div>
  );
}

/** 국내/해외 토글. 활성 탭은 브랜드 블루 알약. */
function MarketTabs({ value, onChange }: { value: Market; onChange: (m: Market) => void }) {
  const tabs: { id: Market; label: string }[] = [
    { id: "KR", label: "국내" },
    { id: "US", label: "해외" },
  ];
  return (
    <div style={{ display: "flex", gap: 6, padding: "2px 20px 8px" }}>
      {tabs.map((t) => {
        const active = value === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            style={{
              border: "none",
              cursor: "pointer",
              borderRadius: 999,
              padding: "6px 16px",
              fontSize: 13,
              fontWeight: 700,
              background: active ? "#3182F6" : adaptive.grey100,
              color: active ? "#FFFFFF" : adaptive.grey600,
            }}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

/** "오늘·이번주 상장": 국내/해외 탭으로 분리, 탭별 임박 5건. */
function IpoSection({
  status,
  ipos,
  onRetry,
  onMore,
}: {
  status: AsyncStatus;
  ipos: IpoEvent[];
  onRetry: () => void;
  onMore: () => void;
}) {
  const [tab, setTab] = useState<Market>("KR");
  const list = ipos.filter((i) => i.market === tab).slice(0, 5);
  return (
    <SectionCard>
      <SectionHeader title="오늘·이번주 상장" moreLabel="더 보기" onMore={onMore} />
      <MarketTabs value={tab} onChange={setTab} />
      <AsyncSection
        status={status}
        data={list}
        onRetry={onRetry}
        empty={<EmptyState title="예정된 상장 일정이 없어요" />}
      >
        {(rows) => rows.map((i) => <IpoRow key={`${i.name}-${i.date}`} ipo={i} />)}
      </AsyncSection>
    </SectionCard>
  );
}

export function HomeScreen({
  watchlist,
  onOpenStock,
  onGoWatch,
  onGoCalendar,
}: {
  watchlist: UseWatchlist;
  onOpenStock: (symbol: string) => void;
  onGoWatch: () => void;
  onGoCalendar: () => void;
}) {
  const home = useQuery({ queryKey: ["home"], queryFn: loadHome });
  const status = queryStatus(home);
  const data = home.data;
  const retry = () => void home.refetch();

  const watched = watchlist.items
    .map((w) => ({ item: w, next: nextEarningsFrom(data?.allUpcoming ?? [], w.symbol) }))
    .sort((a, b) => {
      if (!a.next) return 1;
      if (!b.next) return -1;
      return a.next.date.localeCompare(b.next.date);
    });

  return (
    <Screen>
      <Top title={<Top.TitleParagraph size={22}>주식브리핑</Top.TitleParagraph>} />

      <HomeHero earnings={data?.earningsThisWeek ?? 0} ipos={data?.iposThisWeek ?? 0} />

      <SectionCard>
        <SectionHeader title="내 관심종목" moreLabel="관심 관리" onMore={onGoWatch} />
        {!watchlist.loaded || status === "loading" ? (
          <ListSkeleton rows={2} />
        ) : watched.length === 0 ? (
          <EmptyState
            title="아직 관심종목이 없어요"
            description="종목을 추가하면 실적발표가 가까운 순으로 보여드려요."
            actionLabel="종목 검색해서 추가하기"
            onAction={onGoWatch}
          />
        ) : (
          watched.map(({ item, next }) =>
            next ? (
              <EarningsRow
                key={item.symbol}
                event={{ ...next, name: item.name }}
                watched
                onToggle={() => watchlist.toggle(item)}
                onClick={() => onOpenStock(item.symbol)}
              />
            ) : null,
          )
        )}
      </SectionCard>

      <SectionCard>
        <SectionHeader title="실적발표 임박" moreLabel="더 보기" onMore={onGoCalendar} />
        <AsyncSection
          status={status}
          data={data?.upcoming ?? []}
          onRetry={retry}
          empty={<EmptyState title="예정된 실적발표가 없어요" />}
        >
          {(list) =>
            list.map((e) => (
              <EarningsRow
                key={`${e.symbol}-${e.date}`}
                event={e}
                watched={watchlist.isWatched(e.symbol)}
                onToggle={() => watchlist.toggle(e)}
                onClick={() => onOpenStock(e.symbol)}
              />
            ))
          }
        </AsyncSection>
      </SectionCard>

      <IpoSection status={status} ipos={data?.ipos ?? []} onRetry={retry} onMore={onGoCalendar} />

      <SectionCard>
        <SectionHeader title="주요 뉴스" />
        <AsyncSection
          status={status}
          data={data?.news ?? []}
          onRetry={retry}
          empty={<EmptyState title="표시할 뉴스가 없어요" />}
        >
          {(list) => list.map((n) => <NewsRow key={n.url} news={n} onClick={() => openExternal(n.url)} />)}
        </AsyncSection>
      </SectionCard>

      <DisclaimerFooter />
    </Screen>
  );
}
