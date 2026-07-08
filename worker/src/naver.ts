import type { NewsItem } from "../../src/types";

export interface NaverEnv {
  NAVER_CLIENT_ID: string;
  NAVER_CLIENT_SECRET: string;
}

interface NaverNewsItem {
  title: string;
  originallink: string;
  link: string;
  description: string;
  pubDate: string; // RFC1123 (예: "Mon, 06 Jul 2026 12:00:00 +0900")
}

/** 네이버가 title/description에 넣는 <b> 태그와 HTML 엔티티를 제거해 순수 텍스트로. */
function stripHtml(s: string): string {
  return s
    .replace(/<[^>]+>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ");
}

/** 언론사명이 따로 없으므로 원문 링크의 호스트를 출처로 쓴다(예: chosun.com). */
function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "news";
  }
}

/**
 * 네이버 검색 API(뉴스). 최신순 15건. 브라우저 직접 호출은 CORS로 막혀 Worker에서만 부른다.
 * 실패 시 throw → 상위에서 mock 폴백.
 */
export async function fetchNaverNews(query: string, env: NaverEnv, symbol?: string): Promise<NewsItem[]> {
  // 종목 뉴스는 관련도순(sim)이 정확, 시장 뉴스는 최신순(date)이 자연스럽다.
  const sort = symbol ? "sim" : "date";
  const url = `https://openapi.naver.com/v1/search/news.json?query=${encodeURIComponent(query)}&display=15&sort=${sort}`;
  const res = await fetch(url, {
    headers: {
      "X-Naver-Client-Id": env.NAVER_CLIENT_ID,
      "X-Naver-Client-Secret": env.NAVER_CLIENT_SECRET,
    },
  });
  if (!res.ok) throw new Error(`naver ${res.status}`);
  const body = (await res.json()) as { items?: NaverNewsItem[] };
  return (body.items ?? []).map((it) => {
    const link = it.link || it.originallink;
    return {
      title: stripHtml(it.title),
      source: hostOf(it.originallink || it.link),
      publishedAt: new Date(it.pubDate).toISOString(),
      url: link,
      symbol,
    };
  });
}
