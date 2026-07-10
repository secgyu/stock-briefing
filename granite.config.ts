import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "stock-briefing",
  brand: {
    displayName: "주식브리핑", // 화면에 노출될 앱의 한글 이름
    primaryColor: "#3182F6", // 토스 시그니처 블루
    icon: "https://static.toss.im/appsintoss/45211/f0f8f31e-5763-4038-8488-d6dc8e825651.png", // 콘솔 '앱 로고'와 동일 URL
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
