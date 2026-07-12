import type { Market } from "../types";

const BASE = "https://assets.parqet.com/logos/symbol";

// ponytail: 티커 기반 무료 로고 CDN(parqet). 후보를 앞에서부터 시도하다 모두 실패하면
// 화면에서 모노그램(첫 글자)으로 폴백. 국내는 거래소 접미사(.KS/.KQ)가 필요한데
// 거래소 정보가 없어 둘 다 후보로 넣고 되는 쪽을 쓴다.
// 업그레이드 경로: 미국=Finnhub 프로필 logo, 국내=거래소 정보로 접미사 1개만.
export function logoCandidates(symbol?: string, market?: Market): string[] {
  if (!symbol) return [];
  if (market === "US") return [`${BASE}/${symbol}?format=png`];
  if (market === "KR") return [`${BASE}/${symbol}.KS?format=png`, `${BASE}/${symbol}.KQ?format=png`];
  return [];
}

// ponytail: 언론사 아이콘은 구글 파비콘 서비스. 없는 도메인이면 지구본 기본 아이콘이 오는데(404가 아님)
// 그 정도면 모노그램보다 낫다. 업그레이드 경로: 언론사별 로고 매핑.
export const faviconUrl = (domain: string): string =>
  `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
