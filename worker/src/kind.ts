import type { IpoEvent } from "../../src/types";

// KIND(KRX 상장공시시스템) 공모기업현황. 공식 API가 없어 화면용 HTML 조각을 파싱한다.
// ponytail: 스크래핑이라 KIND 마크업이 바뀌면 깨진다 — 파서가 0건을 내면 상위에서 빈 배열 처리되고,
// 업그레이드 경로는 유료 API 또는 마크업 재적응. 행 구조는 kind.test.ts 픽스처로 고정해 둔다.
const KIND_URL = "https://kind.krx.co.kr/listinvstg/pubofrprogcom.do";

/** "84,000"(백만원) → "840억원". 숫자가 아니면 undefined. */
function toEokwon(millionWon: string): string | undefined {
  const n = Number(millionWon.replace(/,/g, ""));
  if (!Number.isFinite(n) || n <= 0) return undefined;
  return `${Math.round(n / 100).toLocaleString("ko-KR")}억원`;
}

/** "2026-06-18  ~ 2026-06-19" 같은 셀을 한 칸 공백으로 정리. 날짜가 없으면 undefined. */
const period = (cell: string): string | undefined =>
  /\d{4}-\d{2}-\d{2}/.test(cell) ? cell.replace(/\s+/g, " ").trim() : undefined;

/**
 * 공모기업현황 HTML에서 IPO 목록 추출.
 * 각 행: <tr onclick="fnDetailView('..')"> + td 9개(회사명, 신고서제출일, 수요예측, 청약, 납입일,
 * 확정공모가, 공모금액, 상장예정일, 주선인). 회사명은 첫 td의 title 속성.
 */
export function parseKindIpos(html: string): IpoEvent[] {
  const out: IpoEvent[] = [];
  for (const row of html.split(/<tr[\s>]/).slice(1)) {
    const name = /title="([^"]+)"/.exec(row)?.[1];
    const cells = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((m) =>
      m[1].replace(/<[^>]+>|&nbsp;/g, " ").trim(),
    );
    if (!name || cells.length !== 9) continue;
    const date = /^\d{4}-\d{2}-\d{2}/.exec(cells[7])?.[0];
    if (!date) continue; // 상장예정일 미정 행은 제외
    const priced = /\d/.test(cells[5]);
    out.push({
      name,
      market: "KR",
      date,
      // 확정공모가가 비어 있으면 아직 수요예측 전 → 일정이 밀릴 수 있어 "예상" 표기
      isEstimated: !priced,
      subscription: period(cells[3]),
      price: priced ? `${cells[5]}원` : undefined,
      amount: toEokwon(cells[6]),
      underwriter: cells[8] || undefined,
    });
  }
  return out;
}

/** 다가오는 국내 공모주. 최근 100건을 받아 상장예정일이 있는 행만 반환(과거 필터는 호출부 upcoming). */
export async function fetchKrIpos(): Promise<IpoEvent[]> {
  const res = await fetch(KIND_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "Mozilla/5.0 (stock-briefing)",
      Referer: `${KIND_URL}?method=searchPubofrProgComMain`,
    },
    body: "method=searchPubofrProgComSub&forward=pubofrprogcom_sub&currentPageSize=100&pageIndex=1&orderMode=1&orderStat=D",
  });
  if (!res.ok) throw new Error(`kind ${res.status}`);
  return parseKindIpos(await res.text());
}
