import { useEffect, useState } from "react";

/**
 * 인앱 스플래시(인트로). 앱 진입 시 잠깐 보여준 뒤 페이드아웃하며 사라진다.
 * 토스 앱의 네이티브 실행 스플래시(브랜드 아이콘/색)와 별개로, 웹뷰 안에서의 첫 화면.
 */
export function SplashScreen({ primaryColor, onDone }: { primaryColor: string; onDone: () => void }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const hold = setTimeout(() => setVisible(false), 1000);
    const done = setTimeout(onDone, 1360); // 페이드아웃(360ms) 후 언마운트
    return () => {
      clearTimeout(hold);
      clearTimeout(done);
    };
  }, [onDone]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        background: `linear-gradient(160deg, ${primaryColor}, ${primaryColor}cc)`,
        opacity: visible ? 1 : 0,
        transition: "opacity 360ms ease",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          width: 84,
          height: 84,
          borderRadius: 24,
          background: "rgba(255,255,255,0.18)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 44,
        }}
      >
        📈
      </div>
      <div style={{ color: "#fff", fontSize: 26, fontWeight: 800, letterSpacing: -0.5 }}>주식브리핑</div>
      <div style={{ color: "rgba(255,255,255,0.82)", fontSize: 15, fontWeight: 500 }}>
        내 관심종목 실적발표, 놓치지 않기
      </div>
    </div>
  );
}
