/**
 * 定義應用程式中使用的所有 TypeScript 介面與型別
 */

// 專案類型定義
export type ProjectType = 'GENERAL' | 'FIRESTOP';

// 施工位置資料結構
export interface LocationData {
  building: string;   // 棟 (例如: A)
  floorStart: string; // 起始樓層 (例如: 1)
  floorEnd: string;   // 結束樓層 (例如: 5，可選)
  details: string;    // 詳細位置說明
}

// 單筆施工紀錄項目
export interface RecordItem {
  id: string;             // 唯一識別碼 (通常使用 timestamp 字串)
  displayId?: string;     // 顯示用的編號 (例如: "001")，用於防火填塞繼承編號
  timestamp: number;      // 建立時間戳記
  originalImage: string;  // 原始照片的 Base64 字串
  watermarkedImage?: string; // (選填) 加浮水印後的 Base64，通常在匯出時產生
  location: LocationData; // 施工位置物件
  workItem: string;       // 施工項目名稱 (從下拉選單選擇)
  workItemCustom?: string;// (選填) 若施工項目選「其他」，此欄位儲存自定義輸入
  date: string;           // 施工日期 (格式: YYYY-MM-DD)
  note: string;           // 備註內容
}

// 整個專案的資料結構
export interface ProjectData {
  name: string;        // 案場名稱
  month: string;       // 請款月份 (格式: YYYYMM)
  type: ProjectType;   // 專案類型 (一般/防火填塞)
  records: RecordItem[]; // 包含的所有紀錄列表
  lastModified: number;  // 最後修改時間
}

// 應用程式的視圖狀態 (控制目前顯示哪個畫面)
export enum ViewState {
  HOME = 'HOME',                 // 首頁 (建立/開啟專案)
  PROJECT_LIST = 'PROJECT_LIST', // 專案列表頁 (顯示照片清單)
  EDIT_RECORD = 'EDIT_RECORD'    // 編輯/新增紀錄頁 (拍照與填寫資料)
}

// 預設的施工項目選單 (一般專案)
export const WORK_ITEMS = [
  "RC套管放樣",
  "消防電配管",
  "火警、廣播平面穿線",
  "消防廣播幹線完成",
  "授信、廣播主機安裝",
  "感知器、喇叭安裝完成",
  "消防燈具裝置完成",
  "器具安裝",
  "消防栓箱組立完成",
  "消防、泡沫泵浦安裝",
  "撒水平面配管",
  "幹(立)管配管",
  "泡沫、撒水管試壓完成",
  "排煙設備完成",
  "其他"
];

// 防火填塞專用項目選單
export const FIRESTOP_WORK_ITEMS = [
  "施工前",
  "施工後"
];