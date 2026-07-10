import { useEffect, useState } from "react";

/** 상승 막대 + 추세선 브랜드 마크 (이모지 대신 깔끔한 벡터). */
function BriefingMark() {
  return (
    <svg width="48" height="48" viewBox="0 0 46 46" fill="none" aria-hidden>
      <rect x="6" y="26" width="8" height="14" rx="2.5" fill="#fff" opacity="0.5" />
      <rect x="19" y="19" width="8" height="21" rx="2.5" fill="#fff" opacity="0.75" />
      <rect x="32" y="10" width="8" height="30" rx="2.5" fill="#fff" />
      <path d="M6 23 L19 15 L29 19 L41 6" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="41" cy="6" r="3.6" fill="#fff" />
    </svg>
  );
}

/**
 * 인앱 스플래시(인트로). 앱 진입 시 잠깐 보여준 뒤 페이드아웃하며 사라진다.
 * 토스 앱의 네이티브 실행 스플래시와 별개로, 웹뷰 안에서의 첫 화면.
 */
export function SplashScreen({ primaryColor, onDone }: { primaryColor: string; onDone: () => void }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const hold = setTimeout(() => setVisible(false), 1100);
    const done = setTimeout(onDone, 1480); // 페이드아웃(380ms) 후 언마운트
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
        gap: 16,
        overflow: "hidden",
        // 브랜드 블루 + 상단 글로우로 밋밋함 제거
        background: `radial-gradient(120% 90% at 50% 22%, ${primaryColor} 0%, ${primaryColor} 42%, #1B3A6B 100%)`,
        opacity: visible ? 1 : 0,
        transition: "opacity 380ms ease",
        pointerEvents: "none",
      }}
    >
      <style>{`
        @keyframes sb-pop { 0%{opacity:0;transform:scale(.82) translateY(6px)} 100%{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes sb-rise { 0%{opacity:0;transform:translateY(10px)} 100%{opacity:1;transform:translateY(0)} }
        @keyframes sb-ring { 0%{transform:scale(.9);opacity:.5} 70%{opacity:0} 100%{transform:scale(1.6);opacity:0} }
      `}</style>

      {/* 로고 카드 + 확산 링 */}
      <div style={{ position: "relative", animation: "sb-pop 520ms cubic-bezier(.2,.8,.2,1) both" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 30,
            border: "2px solid rgba(255,255,255,0.35)",
            animation: "sb-ring 1600ms ease-out infinite",
          }}
        />
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: 30,
            background: "rgba(255,255,255,0.16)",
            boxShadow: "0 12px 40px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <BriefingMark />
        </div>
      </div>

      <div
        style={{
          color: "#fff",
          fontSize: 27,
          fontWeight: 800,
          letterSpacing: -0.6,
          animation: "sb-rise 560ms ease 140ms both",
        }}
      >
        주식브리핑
      </div>
      <div
        style={{
          color: "rgba(255,255,255,0.82)",
          fontSize: 15,
          fontWeight: 500,
          animation: "sb-rise 560ms ease 240ms both",
        }}
      >
        관심종목 실적발표, 놓치지 않기
      </div>
    </div>
  );
}
