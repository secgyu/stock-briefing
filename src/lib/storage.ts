import { Storage } from "@apps-in-toss/web-framework";

// ponytail: 브라우저(토스 브릿지 없음)에서는 SDK Storage 호출이 멈춰있을 수 있어
// 500ms 안에 응답 없으면 localStorage로 폴백한다. 실기기에선 즉시 응답하므로 무해.
function withTimeout<T>(p: Promise<T>, ms = 500): Promise<T> {
  return Promise.race([p, new Promise<T>((_, reject) => setTimeout(() => reject(new Error("storage timeout")), ms))]);
}

/** 영구 저장소 읽기(설치 유지). SDK Storage 우선, 실패 시 localStorage 폴백. */
export async function storageGet(key: string): Promise<string | null> {
  try {
    return await withTimeout(Storage.getItem(key));
  } catch {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }
}

/** 영구 저장소 쓰기(설치 유지). */
export async function storageSet(key: string, value: string): Promise<void> {
  try {
    await withTimeout(Storage.setItem(key, value));
  } catch {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* 저장 불가 환경: 이번 세션 메모리로만 유지 */
    }
  }
}
