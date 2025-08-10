# MatchCare AI 保險匹配平台 - 開發指南

## 📋 專案概述

MatchCare 是一個AI驅動的保險匹配平台，幫助用戶：
- 上傳醫療記錄、診斷證明、保險保單
- AI分析文件內容並結構化儲存
- 智能搜尋個人保單理賠項目
- 匹配政府補助和醫療資源

## 🏗️ 核心架構

### 主要頁面
- `/ai-resources` - AI資源搜尋（一鍵AI找保障）
- `/medical-records` - 病歷管理
- `/my-data` - 我的資料（文件上傳）
- `/insurance` - 保險管理

### 關鍵技術棧
- Next.js + TypeScript + React
- localStorage 數據儲存
- OpenAI API (gpt-4o, gpt-4o-mini) 
- Tailwind CSS + Shadcn/ui

## 🔧 最近完成的重要修改

### ✅ AI資源搜尋功能改造 (已完成)
**檔案**: `/app/ai-resources/page.tsx`
- **問題**: 原本使用假數據，搜尋功能無效
- **解決**: 完全重寫QuickSearchContent組件
  - 移除所有假數據按鈕和分類
  - 整合 `comprehensiveSearch` 方法
  - 修正API key讀取: `localStorage.getItem('openai_api_key')`
  - 實現智能搜尋：個人保單 → AI網路搜尋

### ✅ 病歷管理真實數據顯示 (已完成)
**檔案**: `/app/medical-records/page.tsx`
- **問題**: 顯示假數據，無法讀取上傳的真實病歷
- **解決**: 修改數據讀取邏輯
  - 正確的儲存key: `matchcare_${userId}_medical_records`
  - 實現真實數據格式轉換
  - 保留所有按鈕功能（查看詳情、申請理賠、匹配保單）
  - 空狀態處理：引導用戶到「我的資料」上傳

### ✅ OpenAI圖片分析修復 (已完成)
**檔案**: `/lib/openaiService.ts`

#### 圖片格式支援修復
- **問題**: PNG圖片無法被AI識別（hardcoded JPEG MIME type）
- **解決**: 智能圖片格式檢測
```typescript
private generateImageUrl(imageBase64: string): string {
  const isPNG = imageBase64.startsWith('iVBORw0KGgo');
  const isJPEG = imageBase64.startsWith('/9j/');
  const isWebP = imageBase64.startsWith('UklGR');
  // 返回正確的 data URL
}
```

#### AI分析提示詞優化
**問題**: AI返回大量"待輸入"值，OCR效果差
**解決**: 全面重寫三個分析方法的提示詞

1. **`analyzeMedicalRecord`** - 病歷記錄分析
   - 結構化OCR分析指南（7個區域識別）
   - 具體輸出格式要求
   - 品質檢查標準

2. **`analyzeDiagnosisCertificate`** - 診斷證明分析
   - 標準文件結構識別
   - 特殊識別要點（手寫vs印刷）
   - 精確JSON輸出格式

3. **`analyzeInsurancePolicy`** - 保險保單分析
   - 完整保單結構分析
   - 專業OCR識別要點
   - 詳細品質確認標準

#### 技術優化
- 圖片分析模型升級: `gpt-4o-mini` → `gpt-4o` (更佳OCR能力)
- 結構化提示詞使用markdown格式
- 明確指示只在無法識別時才填"待輸入"
- **修復AI自動比對圖片處理**: `callAPI` 方法現在使用 `generateImageUrl` 而非硬編碼JPEG格式

### ✅ 智能保單搜尋功能 (已完成)
**檔案**: `/lib/openaiService.ts`

#### 核心功能
- `searchPersonalPolicies()` - 搜尋個人保單匹配項目
- `analyzePolicyMatch()` - 專業保險理賠分析
- `comprehensiveSearch()` - 綜合搜尋（保單+網路資源）

#### 專業分析特點
- 醫學知識應用（ICD-10、併發症、治療進程）
- 保險專業判斷（條款解讀、除外責任、等待期）
- 信心度評估（high/medium/low）
- 詳細風險提醒

### ✅ 保單名稱智能識別功能 (已完成)
**檔案**: `/lib/openaiService.ts`, `/app/my-data/page.tsx`

#### 問題解決
- **用戶需求**: 保單列表顯示檔案名稱而非實際保單名稱
- **解決方案**: AI分析識別保單正式名稱和類型

#### 技術實現
1. **增強AI提示詞**: `analyzeInsurancePolicy` 方法
   - 新增 `policyName` 和 `policyType` 欄位
   - 詳細的保單名稱識別指引
   - 常見保單類型參考（壽險、醫療險、意外險等）

2. **顯示邏輯優化**: `getPolicyDisplayTitle()` 函數
   - 優先級: AI識別保單名稱 → 保險公司+類型 → 檔案名稱
   - 格式: `保單名稱 (保險類型)` 或 `保險公司 - 保險類型`

3. **UI改善**:
   - 保單列表標題使用AI識別名稱
   - 顯示原檔案名稱作為參考
   - 增加保單名稱和類型的詳細資訊顯示

## 🚨 已知待處理事項

### Phase 2 - 病歷管理進階功能
**狀態**: 暫緩實作（用戶明確表示暫時不需要）
- 「查看詳情」按鈕功能
- 「申請理賠」流程
- 「匹配保單」詳細頁面

### 資料儲存架構
**檔案**: `/lib/storage/localStorage.provider.ts`
- 完整的localStorage儲存提供者已實作
- 支援所有資料類型的CRUD操作
- 使用 `matchcare_${userId}_${dataType}` 格式

## 🔑 重要技術細節

### OpenAI API 配置
- API Key儲存: `localStorage.getItem('openai_api_key')`
- 圖片分析: gpt-4o (25670 tokens處理能力)
- 文字分析: gpt-4o-mini (成本效益)

### 資料流程
1. 用戶上傳 → `/my-data` 頁面
2. AI分析 → OpenAI API處理
3. 儲存 → localStorage (格式化JSON)
4. 顯示 → 各管理頁面讀取並格式化

### 關鍵localStorage Keys
- 醫療記錄: `matchcare_${userId}_medical_records`
- 保險保單: `matchcare_${userId}_insurance_policies`  
- 診斷證明: `matchcare_${userId}_diagnosis_certificates`
- OpenAI API Key: `openai_api_key`
- 當前用戶: `currentUser`

## 🧪 測試狀況

### 成功案例
- PNG醫療圖片上傳和分析 ✅
- 保單條款智能匹配搜尋 ✅
- 真實數據顯示在病歷管理 ✅

### 已修復問題
- API key不一致問題 ✅
- 圖片MIME type錯誤 ✅
- 假數據覆蓋真實數據 ✅
- OCR分析準確性低 ✅

## 📝 開發注意事項

### 代碼風格
- 使用TypeScript嚴格類型
- 優先編輯現有文件，避免創建新文件
- localStorage操作需要錯誤處理
- 所有AI API調用需要try-catch

### 性能考量
- 圖片分析使用gpt-4o（較expensive但準確）
- 文字搜尋使用gpt-4o-mini（成本效益）
- localStorage有大小限制，大文件需注意

### 用戶體驗
- 空狀態要有明確指引
- 載入狀態要有適當提示
- 錯誤要有友善的中文訊息
- 保持原有的按鈕和功能（即使暫未實作）

## 🔄 下次開發時的快速指令

```bash
# 檢查專案狀態
git status
git log --oneline -10

# 檢查最近修改的關鍵文件
ls -la app/ai-resources/
ls -la app/medical-records/
ls -la lib/openaiService.ts

# 測試AI功能時檢查localStorage
# 在瀏覽器console: localStorage.getItem('openai_api_key')
```

## 🎯 專案目標

最終目標是建立一個完整的AI保險匹配生態系統，讓用戶能夠：
1. 輕鬆上傳和管理各種醫療文件
2. 透過AI獲得專業的保險理賠建議  
3. 發現政府補助和醫療資源
4. 簡化保險理賠申請流程

當前已完成核心AI分析和搜尋功能，具備商用價值。