import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // 시뮬레이터 WebView는 localhost를 IPv4(127.0.0.1)로 접속함. 기본값은 [::1]만 바인딩돼 흰 화면.
  server: { host: true, strictPort: true },
});
