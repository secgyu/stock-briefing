import { openURL } from "@apps-in-toss/web-framework";

// theme.ts와 동일한 토스 웹뷰 감지. 브릿지 없는 브라우저에서 openURL을 부르면
// 응답 없이 멈출 수 있어 UA로 선분기한다.
const IS_TOSS = /TossColorPreference\//.test(navigator.userAgent);

/** 뉴스 원문/공시 등 외부 링크 열기. 토스 웹뷰=openURL(기본 브라우저), 그 외=window.open */
export function openExternal(url: string): void {
  if (IS_TOSS) {
    openURL(url).catch(() => {
      window.open(url, "_blank", "noopener,noreferrer");
    });
    return;
  }
  try {
    window.open(url, "_blank", "noopener,noreferrer");
  } catch {
    location.href = url;
  }
}
