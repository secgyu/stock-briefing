import { useState } from "react";
import { adaptive } from "@toss/tds-colors";
import { Text, Top } from "@toss/tds-mobile";
import { daysUntil } from "../lib/dday";
import { openExternal } from "../lib/external";
import { WEEKDAYS } from "../lib/format";
import { useIpos, useMarketNews, useUpcomingEarnings } from "../lib/hooks";
import { type AsyncStatus, queryStatus } from "../lib/queryClient";
import { type UseWatchlist, withNextEarnings } from "../lib/watchlist";
import { DisclaimerFooter } from "../components/DisclaimerFooter";
import { SettingsButton } from "../components/SettingsSheet";
import { SectionCard, SectionHeader, Screen } from "../components/layout";
import { EarningsRow, IpoRow, NewsRow, WatchRow } from "../components/rows";
import { AsyncSection, EmptyState, InlineError, ListSkeleton } from "../components/states";
import type { IpoEvent, Market } from "../types";

const withinWeek = (date: string, today: Date) => {
  const d = daysUntil(date, today);
  return d >= 0 && d <= 7;
};

/** 상단 히어로. 브랜드 블루로 화면 시선의 앵커를 만들고 이번 주 요약을 제시한다. */
function HomeHero({ earnings, ipos }: { earnings: number; ipos: number }) {
  const now = new Date();
  const dateLabel = `${now.getMonth() + 1}월 ${now.getDate()}일 ${WEEKDAYS[now.getDay()]}요일`;
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
  // 국내 IPO는 무료 실데이터 소스가 없어 항상 비므로, 기본 탭은 데이터가 있는 해외로.
  const [tab, setTab] = useState<Market>("US");
  const list = ipos.filter((i) => i.market === tab).slice(0, 5);
  return (
    <SectionCard>
      <SectionHeader title="오늘·이번주 상장" moreLabel="더 보기" onMore={onMore} />
      <MarketTabs value={tab} onChange={setTab} />
      <AsyncSection
        status={status}
        data={list}
        onRetry={onRetry}
        empty={
          <EmptyState title={tab === "KR" ? "국내 상장 일정은 아직 제공하지 않아요" : "예정된 상장 일정이 없어요"} />
        }
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
  // Calendar/Watch와 같은 쿼리 키를 써서 캐시를 공유한다(탭 이동 시 재요청 없음).
  const upcoming = useUpcomingEarnings();
  const ipos = useIpos();
  const news = useMarketNews();

  const today = new Date();
  const upcomingList = upcoming.data ?? [];
  const ipoList = ipos.data ?? [];
  const earningsThisWeek = upcomingList.filter((e) => withinWeek(e.date, today)).length;
  const iposThisWeek = ipoList.filter((i) => withinWeek(i.date, today)).length;

  const watched = withNextEarnings(watchlist.items, upcomingList);

  return (
    <Screen>
      <div style={{ position: "relative" }}>
        <Top title={<Top.TitleParagraph size={22}>주식브리핑</Top.TitleParagraph>} />
        {/* Top엔 우측 슬롯이 없어 헤더 우측에 겹쳐 배치한다. */}
        <div style={{ position: "absolute", top: 0, right: 12, height: "100%", display: "flex", alignItems: "center" }}>
          <SettingsButton />
        </div>
      </div>

      <HomeHero earnings={earningsThisWeek} ipos={iposThisWeek} />

      <SectionCard>
        <SectionHeader title="내 관심종목" moreLabel="관심 관리" onMore={onGoWatch} />
        {!watchlist.loaded || upcoming.isPending ? (
          <ListSkeleton rows={2} />
        ) : watched.length === 0 ? (
          <EmptyState
            title="아직 관심종목이 없어요"
            description="종목을 추가하면 실적발표가 가까운 순으로 보여드려요."
            actionLabel="종목 검색해서 추가하기"
            onAction={onGoWatch}
          />
        ) : (
          <>
            {upcoming.isError && (
              <InlineError message="실적 일정을 불러오지 못했어요" onRetry={() => void upcoming.refetch()} />
            )}
            {watched.map(({ item, next }) =>
              next ? (
                <EarningsRow
                  key={item.symbol}
                  event={{ ...next, name: item.name }}
                  watched
                  onToggle={() => watchlist.toggle(item)}
                  onClick={() => onOpenStock(item.symbol)}
                />
              ) : (
                <WatchRow
                  key={item.symbol}
                  item={item}
                  onClick={() => onOpenStock(item.symbol)}
                  onRemove={() => watchlist.remove(item.symbol)}
                />
              ),
            )}
          </>
        )}
      </SectionCard>

      <SectionCard>
        <SectionHeader title="실적발표 임박" moreLabel="더 보기" onMore={onGoCalendar} />
        <AsyncSection
          status={queryStatus(upcoming)}
          data={upcomingList.slice(0, 5)}
          onRetry={() => void upcoming.refetch()}
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

      <IpoSection status={queryStatus(ipos)} ipos={ipoList} onRetry={() => void ipos.refetch()} onMore={onGoCalendar} />

      <SectionCard>
        <SectionHeader title="주요 뉴스" />
        <AsyncSection
          status={queryStatus(news)}
          data={(news.data ?? []).slice(0, 5)}
          onRetry={() => void news.refetch()}
          empty={<EmptyState title="표시할 뉴스가 없어요" />}
        >
          {(list) => list.map((n) => <NewsRow key={n.url} news={n} onClick={() => openExternal(n.url)} />)}
        </AsyncSection>
      </SectionCard>

      <DisclaimerFooter />
    </Screen>
  );
}
