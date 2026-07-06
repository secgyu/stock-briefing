/** 뉴스 원문/공시 등 외부 링크 열기. 웹뷰/브라우저 모두 동작하도록 window.open 사용 */
export function openExternal(url: string): void {
  try {
    window.open(url, "_blank", "noopener,noreferrer");
  } catch {
    location.href = url;
  }
}
