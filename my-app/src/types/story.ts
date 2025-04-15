// 簡易故事資料（用於下拉選單或列表展示）
export interface StoryType {
  id: number;             // 故事 ID
  title: string;          // 故事標題
}

// 被分享對象資訊（顯示使用者名稱與 Email）
export interface SharedUser {
  name: string;           // 使用者名稱
  email: string;          // 使用者 Email
}

// 完整故事資料（對應後端 StoryResponseDto，用於故事詳情頁、管理頁）
export interface StoryResponse {
  id: number;                     // 數據庫內部 ID（主鍵）
  publicId: string;              // 公開用的 UUID（分享連結用）
  title: string;                 // 故事標題
  description: string | null;    // 故事描述（可為空）
  isPublic: boolean;             // 是否為公開故事
  createdAt: string;            // 建立時間（ISO 字串）
  updatedAt?: string;           // 最後更新時間（可選）
  deletedAt?: string;           // 刪除時間（用於延遲刪除）
  creatorId: number;            // 建立者的使用者 ID
  creatorName: string;          // 建立者名稱（顯示用）
  creatorEmail: string;         // 建立者 Email（顯示用）
  sharedUsers?: SharedUser[];   // 被分享對象清單（僅擁有者可見）
}

// --- 時間軸事件資料 ---
export interface TimelineEvent {
  id: string;
  year: number;
  month: string;
  day: string;
  eraName: string;
  title: string;
  content: string;
  tags?: string[];
}

// --- 年號區間資料 ---
export interface TimelineEra {
  name: string;
  start: {
    year: number;
    month: number;
  };
  end: {
    year: number;
    month: number;
  };
}

// --- 整體時間軸資料（後端 json 結構）---
export interface TimelineJson {
  events: TimelineEvent[];
  eras: TimelineEra[];
}