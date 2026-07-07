import type { Market } from "../types";

const BASE = "https://assets.parqet.com/logos/symbol";

// ponytail: UI 데모용 로고 소스(티커 기반 무료 CDN, parqet). 반환한 후보들을
// 앞에서부터 시도하다 모두 실패하면 화면에서 모노그램(첫 글자)으로 폴백한다.
// 국내는 거래소 접미사(.KS 코스피 / .KQ 코스닥)가 필요한데 목데이터엔 거래소
// 정보가 없어 둘 다 후보로 넣고 되는 쪽을 쓴다.
// [업그레이드 경로] 실데이터 단계에선 미국=Finnhub 프로필 logo, 국내=거래소
// 정보로 정확한 접미사 1개만 사용해 이 헬퍼를 걷어낸다.
export function logoCandidates(symbol?: string, market?: Market): string[] {
  if (!symbol) return [];
  if (market === "US") return [`${BASE}/${symbol}?format=png`];
  if (market === "KR") return [`${BASE}/${symbol}.KS?format=png`, `${BASE}/${symbol}.KQ?format=png`];
  return [];
}
