import { useEffect, useState } from "react";
import { adaptiveDictionary } from "@toss/tds-colors";
import { storageGet, storageSet } from "./storage";

// tds-mobile-ait 프로바이더가 colorPreference를 "light"로 하드코딩해 두어서
// 다크모드를 직접 처리한다: 토스 UA(TossColorPreference/dark) 또는 시스템 설정을 감지해
// TDS가 참조하는 --adaptive* CSS 변수를 다크 팔레트로 덮어쓴다(root 인라인 스타일이 항상 이김).
const TOSS_PREF = /TossColorPreference\/(\w+)/;

/** 사용자가 고른 테마. system = 토스/기기 설정을 따름(기본값). */
export type ThemePref = "system" | "light" | "dark";

const PREF_KEY = "stock-briefing:theme:v1";
let currentPref: ThemePref = "system";

export function detectDark(): boolean {
  const m = TOSS_PREF.exec(navigator.userAgent);
  if (m) return m[1].toLowerCase() === "dark";
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}

function applyTheme(dark: boolean): void {
  const root = document.documentElement;
  for (const [key, pair] of Object.entries(adaptiveDictionary) as Array<[string, [string, string]]>) {
    const cssVar = `--adaptive${key.charAt(0).toUpperCase()}${key.slice(1)}`;
    root.style.setProperty(cssVar, dark ? pair[1] : pair[0]);
  }
  root.style.colorScheme = dark ? "dark" : "light"; // 스크롤바·입력요소도 다크로
}

function applyPref(pref: ThemePref): void {
  currentPref = pref;
  applyTheme(pref === "system" ? detectDark() : pref === "dark");
}

/** 저장된 테마 설정을 바꾸고 즉시 화면에 반영한다. */
export function setThemePref(pref: ThemePref): void {
  applyPref(pref);
  void storageSet(PREF_KEY, pref);
}

const isPref = (v: unknown): v is ThemePref => v === "system" || v === "light" || v === "dark";

/** 앱 시작 시 1회 호출. 우선 감지값으로 그리고, 저장된 설정이 있으면 덮어쓴다. */
export function initTheme(): void {
  applyPref("system");
  void storageGet(PREF_KEY).then((v) => {
    if (isPref(v) && v !== "system") applyPref(v);
  });
  // ponytail: 토스 UA의 colorPreference는 세션 중 바뀌면 웹뷰가 재로드되므로 감시 불필요.
  // 브라우저 프리뷰에서만, '시스템' 설정일 때 미디어쿼리 변경을 따라간다.
  if (!TOSS_PREF.test(navigator.userAgent)) {
    window.matchMedia?.("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
      if (currentPref === "system") applyTheme(e.matches);
    });
  }
}

/** 테마 토글 UI용 훅. 저장소에서 초기값을 읽고, 변경 시 저장+적용까지 한다. */
export function useThemePref(): [ThemePref, (pref: ThemePref) => void] {
  const [pref, setPref] = useState<ThemePref>(currentPref);

  useEffect(() => {
    let alive = true;
    void storageGet(PREF_KEY).then((v) => {
      if (alive && isPref(v)) setPref(v);
    });
    return () => {
      alive = false;
    };
  }, []);

  const update = (next: ThemePref) => {
    setPref(next);
    setThemePref(next);
  };

  return [pref, update];
}
