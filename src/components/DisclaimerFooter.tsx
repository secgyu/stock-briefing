import { adaptive } from "@toss/tds-colors";
import { Text } from "@toss/tds-mobile";

/** 하단 고정 표시용 데이터 출처·면책 문구 (검수 필수) */
export function DisclaimerFooter() {
  return (
    <div style={{ padding: "20px 24px 8px" }}>
      <Text
        typography="st12"
        color={adaptive.grey500}
        textAlign="center"
        display="block"
        style={{ whiteSpace: "pre-line", lineHeight: 1.5 }}
      >
        본 서비스는 공개 데이터 기반 정보 제공 목적이며 투자 권유가 아닙니다.
        {"\n"}데이터 출처: DART · Finnhub · Yahoo Finance · 네이버 뉴스 · 금융위원회(공공데이터포털)
        {"\n"}종목 로고: Parqet
      </Text>
    </div>
  );
}
