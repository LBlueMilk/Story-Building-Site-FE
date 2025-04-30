# 🌐 Story Building Site – 前端平台（Next.js + TypeScript）

此專案為**故事創作平台的前端系統**，提供使用者直覺操作的 UI 界面，支援故事建立、角色管理、時間軸紀錄與畫布繪圖等功能。採用 Next.js 建構，搭配 shadcn/ui 元件庫、JWT 驗證與 Google OAuth 登入，並與 ASP.NET Core 後端 API 整合。  

🚀 **線上展示**：https://story-building-site-fe.vercel.app/

---

## 🔧 技術架構

- **前端框架**：Next.js 14（App Router）
- **語言**：TypeScript
- **樣式系統**：Tailwind CSS + shadcn/ui
- **狀態管理**：Context API（AuthContext / StoryContext）
- **驗證機制**：JWT + Google OAuth 2.0
- **API 整合**：Axios + ASP.NET Core 後端 API
- **部署平台**：Vercel

---

## ✅ 功能模組

- 使用者登入 / 註冊 / 登出
- 支援 Google 一鍵登入（OAuth）
- 建立、刪除、還原故事
- 角色管理側邊欄：支援自定屬性、關係圖
- 時間軸管理面板：事件記錄、年號支援、RWD 呈現
- 畫布功能：
  - 自由繪圖（筆畫、橡皮擦、圖片）
  - 便條拖曳、標記特定區域
  - 畫布狀態儲存至 Google Sheets
- 完整響應式設計（RWD），支援桌面與 Mobile Web

---

## 📲 裝置支援

- ✅ **Web Client**（桌面端瀏覽器）
- ✅ **Mobile View**（行動裝置瀏覽器）
- ✅ 手機端選單與互動元件已針對觸控優化

---

## 🙋‍♂️ 開發動機與目標
設計一套完整的創作管理平台，前後端分離部署

強化 Next.js 與 OAuth 流程整合實作能力

練習跨裝置 UI 設計、Context 狀態架構與 API 資料同步

作為實務型個人作品集，模擬企業級產品開發流程

---

## 📄 授權 License
本專案採用 [MIT License](./LICENSE)。  
歡迎自由參考、修改與應用。