# 用戶資料管理系統 - 拆除指南

## 📝 系統概述

此用戶資料管理系統是一個**完全可拆除**的 localStorage 解決方案，專為臨時使用而設計，可在未來輕鬆升級到 Firebase 或其他後端服務。

### 🗂️ 系統檔案結構

```
lib/storage/
├── index.ts              # 統一API入口點
├── types.ts              # TypeScript類型定義  
├── localStorage.provider.ts  # localStorage實作
└── REMOVAL_GUIDE.md      # 拆除指南（此檔案）

app/my-data/
└── page.tsx              # 用戶資料管理頁面

components/main-nav.tsx    # 已修改：新增"我的資料"選項
```

### 💾 資料儲存格式

localStorage 中的資料以下列格式儲存：
- `matchcare_{userId}_medical_records` - 病歷記錄
- `matchcare_{userId}_insurance_policies` - 保險保單  
- `matchcare_{userId}_analysis_results` - AI分析結果
- `matchcare_{userId}_settings` - 用戶設定

目前用戶ID: `user1` (王小明帳號)

## 🧹 完整拆除步驟

### 步驟 1: 刪除儲存系統檔案

```bash
# 刪除整個儲存系統資料夾
rm -rf lib/storage/
```

### 步驟 2: 刪除用戶資料管理頁面

```bash
# 刪除我的資料頁面
rm -rf app/my-data/
```

### 步驟 3: 恢復導航選單

在 `components/main-nav.tsx` 中：

```typescript
// 移除這一行：
{ href: "/my-data", label: "我的資料" },

// 恢復原有的navItems結構
const navItems = [
  { href: "/", label: "首頁" },
  { href: "/medical-records", label: "病歷管理" },
  { href: "/ai-resources", label: "一鍵AI找保障" },
  { href: "/insurance", label: "保單健檢" },
  { href: "/claims", label: "理賠申請" },
  { href: "/resources", label: "其他福利資源" },
]
```

### 步驟 4: 移除相關引用（如果有的話）

搜尋並移除任何 `@/lib/storage` 的 import 語句：

```bash
# 搜尋所有引用
grep -r "from '@/lib/storage'" app/ components/ lib/
```

### 步驟 5: 清理localStorage資料（可選）

如果需要清理測試資料，在瀏覽器Console執行：

```javascript
// 清理王小明的所有資料
['medical_records', 'insurance_policies', 'analysis_results', 'settings'].forEach(type => {
  localStorage.removeItem(`matchcare_user1_${type}`)
})
```

## 🔄 升級到Firebase指南

如果要升級到Firebase而非拆除：

### 1. 保留現有結構

```
lib/storage/
├── index.ts              # 保留：統一API  
├── types.ts              # 保留：類型定義
├── localStorage.provider.ts  # 保留：備用方案
└── firebase.provider.ts      # 新增：Firebase實作
```

### 2. 修改入口點

在 `lib/storage/index.ts` 中：

```typescript
// 從這個：
const storageProvider = new LocalStorageProvider()

// 改成這個：
const storageProvider = new FirebaseProvider()
```

### 3. 資料遷移

實作遷移腳本將localStorage資料上傳到Firebase。

## ⚠️ 重要提醒

1. **資料備份**：拆除前請確認用戶不需要保留測試資料
2. **功能依賴**：檢查是否有其他功能依賴此儲存系統
3. **用戶通知**：如果是正式環境，需通知用戶資料將被清除

## 🕐 設計時間記錄

**建立日期**：2025-01-09  
**設計對話**：Claude Code 對話記錄  
**設計理念**：臨時localStorage方案，完全可拆除，可升級到Firebase  
**架構決策**：  
- 使用Provider模式實現儲存抽象
- 以 `user1` (王小明) 作為測試用戶ID
- 統一的API接口設計便於切換後端
- 獨立的資料夾結構便於完整移除

---

📌 **拆除確認清單**
- [ ] 已備份重要資料
- [ ] 刪除 `lib/storage/` 資料夾
- [ ] 刪除 `app/my-data/` 頁面
- [ ] 恢復 `main-nav.tsx` 導航選單
- [ ] 移除所有相關import語句
- [ ] 清理localStorage測試資料
- [ ] 測試應用程式正常運作