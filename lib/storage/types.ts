/**
 * 用戶資料管理 - 資料類型定義
 * 
 * 📝 拆除說明：
 * 此檔案定義了用戶資料的TypeScript類型
 * 拆除時可以直接刪除整個 lib/storage/ 資料夾
 */

// 文件類型列舉
export type DocumentType = 'medical' | 'insurance' | 'diagnosis'

// 基礎文件介面
export interface BaseDocument {
  id: string
  fileName: string
  fileType: 'pdf' | 'image'
  documentType: DocumentType
  uploadDate: string
  fileSize: number
  
  // 文字內容（PDF提取或OCR結果）
  textContent?: string
  
  // 圖片內容（base64格式）
  imageBase64?: string
  
  // 用戶備註
  notes?: string
}

// 病歷記錄（合併診斷證明功能）
export interface MedicalRecord extends BaseDocument {
  documentType: 'medical' | 'diagnosis' | 'report' | string
  
  // 病例記錄 AI 分析資訊（擴展支援診斷證明）
  medicalInfo?: {
    // === 原病歷欄位 ===
    // 門診/急診/住院紀錄
    clinicalRecord?: string
    
    // 入院病歷
    admissionRecord?: string
    
    // 手術紀錄
    surgeryRecord?: string
    
    // 檢查報告影本
    examinationReport?: string
    
    // 用藥紀錄
    medicationRecord?: string
    
    // 出院病摘
    dischargeSummary?: string
    
    // 醫療院所章戳與簽名
    hospitalStamp?: string
    
    // === 新增診斷證明欄位 ===
    // 文件標題
    documentTitle?: string
    
    // 證明書類型
    certificateType?: string
    
    // 主要診斷疾病或醫療主題
    medicalSubject?: string
    
    // 病患基本資料
    patientName?: string
    birthDate?: string
    idNumber?: string
    
    // 醫療日期資訊
    firstVisitDate?: string
    certificateDate?: string
    
    // 診斷資訊
    icdCode?: string
    diseaseName?: string
    treatmentSummary?: string
    
    // 休養建議
    restPeriod?: string
    
    // 是否意外傷害
    isAccident?: string
  }
}

// 保險保單
export interface InsurancePolicy extends BaseDocument {
  documentType: 'insurance'
  
  // 保單 AI 分析資訊
  policyInfo?: {
    // 保單基本資料
    policyBasicInfo?: {
      insuranceCompany?: string // 保險公司名稱
      policyNumber?: string // 保單號碼
      effectiveDate?: string // 保單生效日期
      policyTerms?: string // 保單條款（保險責任、除外責任、理賠條件等）
      insurancePeriod?: string // 保險期間（保險契約有效期限）
    }
    
    // 要保人資料
    policyHolderInfo?: {
      name?: string // 姓名
      birthDate?: string // 出生年月日
      idNumber?: string // 身分證字號
      occupation?: string // 職業
      contactAddress?: string // 聯絡地址
    }
    
    // 被保險人資料
    insuredPersonInfo?: {
      name?: string // 姓名
      birthDate?: string // 出生年月日
      gender?: string // 性別
      idNumber?: string // 身分證字號
      occupation?: string // 職業
      contactAddress?: string // 聯絡地址
    }
    
    // 受益人資料
    beneficiaryInfo?: {
      name?: string // 姓名
      relationshipToInsured?: string // 與被保人關係
      benefitRatio?: string // 受益比例
    }
    
    // 保險內容與費用資料
    insuranceContentAndFees?: {
      insuranceAmount?: string // 保險金額（保險事故發生時的給付金額）
      paymentMethod?: string // 繳費方式（月繳、季繳、年繳）
      paymentPeriod?: string // 繳費期間（非必要標示）
      dividendDistribution?: string // 紅利分配方式（非必要標示）
    }
    
    // 其他事項
    otherMatters?: {
      automaticPremiumLoan?: string // 自動墊繳條款（若保費未繳，是否自動墊繳）
      additionalClauses?: string // 附加條款與附約（醫療險、意外險等）
    }
    
    // 保險公司服務資訊
    insuranceServiceInfo?: {
      customerServiceHotline?: string // 客服專線
      claimsProcessIntro?: string // 理賠流程簡介
    }
  }
}

// 診斷證明
export interface DiagnosisCertificate extends BaseDocument {
  documentType: 'diagnosis'
  
  // 診斷證明 AI 分析資訊
  diagnosisInfo?: {
    // 病人基本資料
    patientName?: string
    birthDate?: string
    idNumber?: string
    
    // 診斷日期
    firstVisitDate?: string
    certificateDate?: string
    
    // 疾病名稱
    icdCode?: string
    diseaseName?: string
    
    // 醫療處置摘要
    treatmentSummary?: string
    
    // 建議休養時間
    restPeriod?: string
    
    // 是否因意外
    isAccident?: string
  }
}

// AI分析結果記錄
export interface AnalysisResult {
  id: string
  analysisDate: string
  analysisType: 'resource_matching' | 'policy_claim' | 'government_subsidy'
  
  // 輸入資料
  inputData: {
    medicalRecordIds: string[]
    policyIds: string[]
    caseData?: any
  }
  
  // AI分析結果
  result: {
    analysisReport: string
    resources: any[]
    recommendations: string[]
  }
  
  // 元數據
  metadata: {
    modelUsed: string
    tokensUsed?: number
    costEstimate?: string
  }
}

// 用戶設定
export interface UserSettings {
  userId: string
  preferences: {
    defaultAnalysisMode: 'demo' | 'real'
    openaiApiKey?: string // 加密儲存
    notificationSettings: {
      analysisComplete: boolean
      newResourcesFound: boolean
    }
  }
  lastUpdated: string
}

// 儲存服務統計
export interface StorageStats {
  medicalRecords: number
  insurancePolicies: number
  diagnosisCertificates: number
  analysisResults: number
  totalStorageUsed: number // bytes
  lastSyncDate?: string
}