import { adaptiveDictionary } from "@toss/tds-colors";

// tds-mobile-ait 프로바이더가 colorPreference를 "light"로 하드코딩해 두어서
// 다크모드를 직접 처리한다: 토스 UA(TossColorPreference/dark) 또는 시스템 설정을 감지해
// TDS가 참조하는 --adaptive* CSS 변수를 다크 팔레트로 덮어쓴다(root 인라인 스타일이 항상 이김).
const TOSS_PREF = /TossColorPreference\/(\w+)/;

export function detectDark(): boolean {
  const m = TOSS_PREF.exec(navigator.userAgent);
  if (m) return m[1].toLowerCase() === "dark";
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}

export function applyTheme(dark: boolean): void {
  const root = document.documentElement;
  for (const [key, pair] of Object.entries(adaptiveDictionary) as Array<[string, [string, string]]>) {
    const cssVar = `--adaptive${key.charAt(0).toUpperCase()}${key.slice(1)}`;
    root.style.setProperty(cssVar, dark ? pair[1] : pair[0]);
  }
  root.style.colorScheme = dark ? "dark" : "light"; // 스크롤바·입력요소도 다크로
}

/** 앱 시작 시 1회 호출. 토스 밖(브라우저)에서는 시스템 다크모드 변경도 실시간 반영. */
export function initTheme(): void {
  applyTheme(detectDark());
  // ponytail: 토스 UA의 colorPreference는 세션 중 바뀌면 웹뷰가 재로드되므로 감시 불필요.
  // 브라우저 프리뷰에서만 미디어쿼리 변경을 따라간다.
  if (!TOSS_PREF.test(navigator.userAgent)) {
    window.matchMedia?.("(prefers-color-scheme: dark)").addEventListener("change", (e) => applyTheme(e.matches));
  }
}
