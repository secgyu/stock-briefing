import type { Disclosure } from "../../src/types";

export interface DartEnv {
  DART_API_KEY: string;
}

const BASE = "https://opendart.fss.or.kr/api";

export interface KrStock {
  corp: string; // DART 고유번호(corp_code, 8자리)
  name: string; // 한글 종목명
}

/**
 * 국내 유니버스(전부 코스피): 종목코드(6자리) → DART 고유번호 + 종목명.
 * DART 공시검색은 corp_code로만 회사를 좁힐 수 있어(종목코드로는 불가) 미리 매핑해 둔다.
 * corpCode.xml(고유번호 전체 파일)에서 추출한 값. 공시(DART)·실적(Yahoo)의 공통 유니버스.
 * 종목 추가 시 여기에 한 줄씩.
 */
export const KR_CORP: Record<string, KrStock> = {
  "005930": { corp: "00126380", name: "삼성전자" },
  "000660": { corp: "00164779", name: "SK하이닉스" },
  "373220": { corp: "01515323", name: "LG에너지솔루션" },
  "207940": { corp: "00877059", name: "삼성바이오로직스" },
  "005380": { corp: "00164742", name: "현대차" },
  "000270": { corp: "00106641", name: "기아" },
  "005490": { corp: "00155319", name: "POSCO홀딩스" },
  "035420": { corp: "00266961", name: "NAVER" },
  "035720": { corp: "00258801", name: "카카오" },
  "051910": { corp: "00356361", name: "LG화학" },
  "006400": { corp: "00126362", name: "삼성SDI" },
  "105560": { corp: "00688996", name: "KB금융" },
  "055550": { corp: "00382199", name: "신한지주" },
  "068270": { corp: "00413046", name: "셀트리온" },
  "028260": { corp: "00149655", name: "삼성물산" },
  "012330": { corp: "00164788", name: "현대모비스" },
  "066570": { corp: "00401731", name: "LG전자" },
  "323410": { corp: "01133217", name: "카카오뱅크" },
  "000810": { corp: "00139214", name: "삼성화재" },
  "015760": { corp: "00159193", name: "한국전력" },
};

const pad = (n: number) => String(n).padStart(2, "0");
const ymd = (d: Date) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;

interface DartListItem {
  report_nm: string;
  flr_nm: string;
  rcept_dt: string; // YYYYMMDD
  rcept_no: string;
}

interface DartListResponse {
  status: string; // "000" 정상, "013" 데이터 없음
  message: string;
  list?: DartListItem[];
}

/**
 * 특정 국내 종목의 최근 공시(접수일 기준, 최신순). 최근 90일·상위 15건.
 * 유니버스 밖이면 빈 배열. status가 정상/무데이터가 아니면 throw → 상위에서 폴백.
 */
export async function fetchKrDisclosures(stockCode: string, env: DartEnv): Promise<Disclosure[]> {
  const entry = KR_CORP[stockCode];
  if (!entry) return [];

  const now = new Date();
  const bgn = ymd(new Date(now.getTime() - 90 * 86400000));
  const url =
    `${BASE}/list.json?crtfc_key=${env.DART_API_KEY}&corp_code=${entry.corp}` +
    `&bgn_de=${bgn}&end_de=${ymd(now)}&page_count=15&sort=date&sort_mth=desc`;

  // opendart는 User-Agent가 비면 error1.html로 302 리다이렉트한다.
  // Workers fetch는 기본 UA가 비어 있어 반드시 명시해야 한다.
  const res = await fetch(url, { headers: { "User-Agent": "stock-briefing/1.0" } });
  if (!res.ok) throw new Error(`dart ${res.status}`);
  const body = (await res.json()) as DartListResponse;
  if (body.status === "013") return []; // 조회된 데이터 없음
  if (body.status !== "000") throw new Error(`dart status ${body.status}`);

  return (body.list ?? []).map((it) => {
    const dt = it.rcept_dt;
    return {
      title: it.report_nm.trim(),
      filer: it.flr_nm.trim(),
      date: `${dt.slice(0, 4)}-${dt.slice(4, 6)}-${dt.slice(6, 8)}`,
      url: `https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${it.rcept_no}`,
    };
  });
}
