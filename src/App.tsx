import { adaptive } from "@toss/tds-colors";
import { useEffect, useState } from "react";
import "./App.css";
import config from "../granite.config";
import { BottomTabBar, type TabKey } from "./components/BottomTabBar";
import { SplashScreen } from "./components/SplashScreen";
import { OnboardingScreen } from "./components/OnboardingScreen";
import { storageGet, storageSet } from "./lib/storage";
import { useWatchlist } from "./lib/watchlist";
import { CalendarScreen } from "./screens/CalendarScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { StockDetailScreen } from "./screens/StockDetailScreen";
import { WatchScreen } from "./screens/WatchScreen";

// 당겨서 새로고침 시 WebView가 페이지를 통째로 reload한다.
// 화면 위치를 세션에 저장해 reload돼도 같은 화면으로 복원하고, 같은 세션이면 스플래시를 건너뛴다.
const ss = {
  get: (k: string): string | null => {
    try {
      return sessionStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set: (k: string, v: string) => {
    try {
      sessionStorage.setItem(k, v);
    } catch {
      /* 저장 불가 환경: 복원 없이 동작 */
    }
  },
  del: (k: string) => {
    try {
      sessionStorage.removeItem(k);
    } catch {
      /* noop */
    }
  },
};

const TABS: TabKey[] = ["home", "calendar", "watch"];

// 온보딩은 설치 후 최초 1회만(세션이 아니라 영구 저장). null=아직 로딩 중.
const ONBOARD_KEY = "stock-briefing:onboarded:v1";

function App() {
  const [booted, setBooted] = useState(() => ss.get("booted") === "1");
  const [onboarded, setOnboarded] = useState<boolean | null>(null);
  const [tab, setTab] = useState<TabKey>(() => {
    const saved = ss.get("tab");
    return saved && (TABS as string[]).includes(saved) ? (saved as TabKey) : "home";
  });
  const [detailSymbol, setDetailSymbol] = useState<string | null>(() => ss.get("detail"));
  const watchlist = useWatchlist();

  // 온보딩 노출 여부를 영구 저장소에서 로드(스플래시 떠 있는 동안 완료됨).
  useEffect(() => {
    let alive = true;
    storageGet(ONBOARD_KEY).then((v) => alive && setOnboarded(v === "1"));
    return () => {
      alive = false;
    };
  }, []);

  const finishOnboarding = () => {
    setOnboarded(true);
    void storageSet(ONBOARD_KEY, "1");
  };

  // 화면 위치를 세션에 동기화(새로고침 복원용).
  useEffect(() => ss.set("tab", tab), [tab]);
  useEffect(() => {
    if (detailSymbol) ss.set("detail", detailSymbol);
    else ss.del("detail");
  }, [detailSymbol]);

  const openStock = (symbol: string) => setDetailSymbol(symbol);
  const closeStock = () => setDetailSymbol(null);

  const inDetail = detailSymbol != null;

  return (
    <>
      {!booted && (
        <SplashScreen
          primaryColor={config.brand.primaryColor}
          onDone={() => {
            setBooted(true);
            ss.set("booted", "1");
          }}
        />
      )}

      {booted && onboarded === false && (
        <OnboardingScreen primaryColor={config.brand.primaryColor} onFinish={finishOnboarding} />
      )}

      <main
        style={{
          flex: 1,
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          background: adaptive.greyBackground,
        }}
      >
        {inDetail ? (
          <StockDetailScreen symbol={detailSymbol} watchlist={watchlist} onBack={closeStock} />
        ) : tab === "home" ? (
          <HomeScreen
            watchlist={watchlist}
            onOpenStock={openStock}
            onGoWatch={() => setTab("watch")}
            onGoCalendar={() => setTab("calendar")}
          />
        ) : tab === "calendar" ? (
          <CalendarScreen watchlist={watchlist} onOpenStock={openStock} />
        ) : (
          <WatchScreen watchlist={watchlist} onOpenStock={openStock} />
        )}
      </main>

      {!inDetail && (
        <BottomTabBar
          active={tab}
          onChange={(next) => {
            setDetailSymbol(null);
            setTab(next);
          }}
        />
      )}
    </>
  );
}

export default App;
