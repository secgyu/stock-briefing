import { useState } from "react";
import { adaptive } from "@toss/tds-colors";
import { Button, Text } from "@toss/tds-mobile";
import { CalendarIcon, ChartIcon, StarIcon } from "./icons";
import { PlainButton } from "./layout";

type IconComp = typeof CalendarIcon;

interface Step {
  Icon: IconComp;
  title: string;
  desc: string;
  note?: string;
}

const STEPS: Step[] = [
  {
    Icon: CalendarIcon,
    title: "실적발표를 한눈에",
    desc: "국내·해외 기업의 실적발표와 상장(IPO) 일정을 캘린더로 모아봐요.",
  },
  {
    Icon: StarIcon,
    title: "관심종목 D-day",
    desc: "관심 종목을 담아두면 다음 실적발표까지 며칠 남았는지 챙겨드려요.",
  },
  {
    Icon: ChartIcon,
    title: "시세·뉴스·공시까지",
    desc: "종목마다 시세와 최신 뉴스, 전자공시(DART)를 함께 확인해요.",
    note: "모든 정보는 투자 참고용이며, 시세는 지연되거나 실제와 다를 수 있어요.",
  },
];

/** 최초 실행 1회만 노출되는 온보딩. 스플래시가 사라진 뒤 전체 화면 오버레이로 뜬다. */
export function OnboardingScreen({ primaryColor, onFinish }: { primaryColor: string; onFinish: () => void }) {
  const [step, setStep] = useState(0);
  const last = step === STEPS.length - 1;
  const s = STEPS[step];

  const next = () => (last ? onFinish() : setStep((v) => v + 1));

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 90,
        display: "flex",
        flexDirection: "column",
        background: adaptive.background,
        padding: "0 24px",
      }}
    >
      <style>{`@keyframes ob-in{0%{opacity:0;transform:translateY(12px)}100%{opacity:1;transform:translateY(0)}}`}</style>

      {/* 건너뛰기 */}
      <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 14, height: 44 }}>
        {!last && (
          <PlainButton onClick={onFinish} style={{ padding: 6 }}>
            <Text typography="t6" fontWeight="medium" color={adaptive.grey500}>
              건너뛰기
            </Text>
          </PlainButton>
        )}
      </div>

      {/* 본문 (스텝마다 페이드) */}
      <div
        key={step}
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          gap: 16,
          animation: "ob-in 320ms ease both",
        }}
      >
        <div
          style={{
            width: 108,
            height: 108,
            borderRadius: 34,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: `${primaryColor}14`,
          }}
        >
          <s.Icon color={primaryColor} size={52} />
        </div>
        <Text typography="t2" fontWeight="bold" color={adaptive.grey900}>
          {s.title}
        </Text>
        <div style={{ maxWidth: 300 }}>
          <Text typography="t5" color={adaptive.grey600}>
            {s.desc}
          </Text>
        </div>
        {s.note && (
          <div style={{ maxWidth: 300, marginTop: 4 }}>
            <Text typography="t7" color={adaptive.grey500}>
              ※ {s.note}
            </Text>
          </div>
        )}
      </div>

      {/* 진행 점 */}
      <div style={{ display: "flex", justifyContent: "center", gap: 7, marginBottom: 18 }}>
        {STEPS.map((_, i) => (
          <span
            key={i}
            style={{
              width: i === step ? 20 : 7,
              height: 7,
              borderRadius: 4,
              background: i === step ? primaryColor : adaptive.grey200,
              transition: "width 200ms ease, background 200ms ease",
            }}
          />
        ))}
      </div>

      {/* CTA */}
      <div style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 20px)" }}>
        <Button size="large" variant="fill" display="block" onClick={next}>
          {last ? "시작하기" : "다음"}
        </Button>
      </div>
    </div>
  );
}
