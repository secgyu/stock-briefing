import { adaptive } from "@toss/tds-colors";
import { useState } from "react";
import "./App.css";
import config from "../granite.config";
import { BottomTabBar, type TabKey } from "./components/BottomTabBar";
import { SplashScreen } from "./components/SplashScreen";
import { useWatchlist } from "./lib/watchlist";
import { CalendarScreen } from "./screens/CalendarScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { StockDetailScreen } from "./screens/StockDetailScreen";
import { WatchScreen } from "./screens/WatchScreen";

function App() {
  const [booted, setBooted] = useState(false);
  const [tab, setTab] = useState<TabKey>("home");
  const [detailSymbol, setDetailSymbol] = useState<string | null>(null);
  const watchlist = useWatchlist();

  const openStock = (symbol: string) => setDetailSymbol(symbol);
  const closeStock = () => setDetailSymbol(null);

  const inDetail = detailSymbol != null;

  return (
    <>
      {!booted && <SplashScreen primaryColor={config.brand.primaryColor} onDone={() => setBooted(true)} />}

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
