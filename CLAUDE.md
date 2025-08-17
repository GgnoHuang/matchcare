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

## 🎨 UI/UX 改造計劃 - 轉換至 Zoe 視覺樣式

### 📋 改造概述
**目標**: 將 MatchCare 的 UI/UX 調整為 Zoe 專案的視覺樣式，但保持所有現有功能不變

**核心原則**:
- ✅ **保持功能完整**: 所有 OpenAI API 串接功能必須維持運作
- ✅ **保持數據流程**: localStorage 儲存邏輯和數據結構不變
- ✅ **保持頁面結構**: 主要頁面路由和功能邏輯保持不變
- 🎨 **僅改變視覺**: 調整 UI 組件、樣式、布局和視覺設計

### 🏗️ 改造策略
**階段性執行**: 逐步進行，不一次性全部改造
- 用戶會逐階段指示需要調整的內容
- 每次只調整特定頁面或組件
- 確保每個階段完成後功能依然正常運作

### 📁 專案狀態
- **MatchCare** (當前專案): 功能完整，有實際 AI 串接
- **Zoe 專案** (`zoe-project/`): UI 空殼，作為視覺樣式參考來源

### 🚨 重要約束
1. **絕對不可更動的部分**:
   - `/lib/openaiService.ts` - AI 分析核心邏輯
   - localStorage 數據儲存邏輯
   - API 調用和數據處理流程
   - 核心功能邏輯

2. **可以調整的部分**:
   - UI 組件樣式 (Tailwind CSS classes)
   - 布局和排版
   - 顏色、字體、間距
   - 組件結構 (保持功能邏輯)
   - 視覺元素和圖標

### 🔄 數據格式與UX流程適配

#### 數據欄位智能轉換
**目標**: 當 Zoe 專案的數據欄位與 MatchCare 不同時，進行智能適配

**範例場景**:
- **評分系統**: Zoe 使用 5 星評分 ↔ MatchCare 使用 20 分制
  - **轉換邏輯**: `星數 = Math.round(分數 / 4)` 或 `分數 = 星數 * 4`
  - **顯示**: 採用 Zoe 的 5 星顯示，但後端儲存維持原本格式

**處理原則**:
- 🔄 **雙向轉換**: 確保數據在顯示和儲存時正確轉換
- 📊 **保持精度**: 轉換時避免數據精度遺失
- 🎯 **用戶體驗**: 採用 Zoe 的顯示格式，但保持數據完整性

#### UX 操作流程統一
**目標**: 當 Zoe 專案的操作流程與 MatchCare 不同時，調整為 Zoe 的 UX 模式

**流程對比分析**:
- **簡化操作**: 如果 Zoe 的某功能只需 1 步，MatchCare 需要多步
  - ✅ **採用**: 簡化為 Zoe 的 1 步操作
  - ⚠️ **風險評估**: 分析是否會影響功能完整性
  
- **複雜操作**: 如果 Zoe 的某功能需要多步，MatchCare 只需 1 步
  - 🤔 **評估**: 分析 Zoe 多步驟的必要性
  - ⚖️ **利弊分析**: 提供操作複雜度 vs 功能完整性的權衡建議

**衝突處理機制**:
1. **功能衝突**: 當 UX 調整可能影響核心功能時
   - 📋 **分析報告**: 詳細說明可能的影響範圍
   - 🔍 **替代方案**: 提供保持功能的替代 UX 設計
   - ⚠️ **風險提醒**: 明確指出潛在問題

2. **數據衝突**: 當欄位轉換可能造成數據遺失時
   - 💾 **備用方案**: 設計數據回退機制
   - 🔄 **轉換測試**: 確保雙向轉換的準確性
   - 📝 **記錄追蹤**: 記錄所有轉換邏輯供後續維護

#### 功能精簡與對齊
**背景**: MatchCare 開發過程中 AI 可能創造了額外功能和欄位，需要與 Zoe 專案功能對齊

**功能審查機制**:
1. **額外功能識別**
   - 🔍 **對比分析**: 比較 MatchCare vs Zoe 的功能清單
   - 📋 **功能分類**: 區分核心功能 vs 額外創意功能
   - 🎯 **必要性評估**: 評估額外功能對核心業務的價值

2. **功能刪減建議**
   - 📊 **影響分析**: 分析移除特定功能對整體系統的影響
   - 🔄 **替代方案**: 提供功能整合或簡化的替代方式
   - ⚠️ **風險提醒**: 說明功能刪減可能的負面影響

3. **決策支援**
   - 📝 **清單提供**: 明確列出建議刪減的功能與欄位
   - 💡 **保留價值**: 說明某些額外功能是否值得保留的理由
   - 🎨 **UI適配**: 評估功能調整對 Zoe UI 適配的幫助程度

**範例場景**:
- **多餘欄位**: 如果 MatchCare 有 10 個資料欄位，但 Zoe 只有 6 個
  - 📋 **建議**: 列出可能刪減的 4 個欄位
  - ⚖️ **評估**: 分析這些欄位的使用頻率和重要性
  - 🎯 **方案**: 提供整合或隱藏非必要欄位的方案

- **複雜功能**: 如果 MatchCare 有多步驟的進階功能，但 Zoe 採用簡化版本
  - 🔍 **分析**: 評估複雜功能的實際使用價值
  - 💡 **建議**: 提供簡化為 Zoe 版本的可行性
  - ⚠️ **警告**: 說明簡化可能失去的功能價值

**執行策略**:
- 📋 **需求確認**: 用戶提出需求時，先分析 Zoe vs MatchCare 的差異
- 🔍 **功能審查**: 識別並列出可能需要刪減的額外功能
- ⚖️ **利弊評估**: 提供詳細的利弊分析和潛在風險
- 📝 **刪減建議**: 明確建議哪些功能可以刪減以利於 UI 適配
- 🎯 **方案建議**: 基於分析結果提供最佳調整方案
- ✅ **用戶確認**: 獲得用戶確認後才執行調整

### 📝 執行記錄
**狀態**: 計劃階段 - 等待用戶指示具體調整內容

**下一步**: 
- 等待用戶指定第一個要調整的頁面或組件
- 參考 `zoe-project/` 目錄中的 UI 樣式
- 實施 UI 調整但保持功能邏輯

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