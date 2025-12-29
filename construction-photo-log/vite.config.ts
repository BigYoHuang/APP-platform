import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      // 告訴 Vite (Rollup) 這些模組是外部依賴，不要嘗試將它們打包進去
      // 這樣可以解決 "failed to resolve import" 的錯誤
      // 瀏覽器會在執行時透過 index.html 的 importmap 從 CDN 載入它們
      external: [
        'react',
        'react-dom',
        'react-dom/client',
        'react/jsx-runtime', // 這是 JSX 自動轉換需要的
        'lucide-react',
        'xlsx',
        'jszip'
      ]
    }
  },
  esbuild: {
    // 確保 esbuild 使用自動 JSX 轉換模式
    jsx: 'automatic'
  }
});