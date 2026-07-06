import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "stock-briefing",
  brand: {
    displayName: "주식브리핑", // 화면에 노출될 앱의 한글 이름
    primaryColor: "#3182F6", // 토스 시그니처 블루
    icon: "", // 배포(P6) 단계에서 앱 아이콘 URL 지정
  },
  web: {
    host: "localhost",
    port: 5173,
    commands: {
      dev: "vite dev",
      build: "vite build",
    },
  },
  permissions: [],
  outdir: "dist",
});
