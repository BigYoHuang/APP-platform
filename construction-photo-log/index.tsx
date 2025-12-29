/**
 * 應用程式進入點 (Entry Point)
 * 負責將 React 應用程式掛載到 HTML DOM 中的 root 元素上
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// 取得 HTML 中的掛載點
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// 建立 React Root 並渲染 App 元件
// React.StrictMode 會在開發模式下檢查潛在問題（例如不安全的生命週期）
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);