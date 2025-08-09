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

// 病歷記錄
export interface MedicalRecord extends BaseDocument {
  documentType: 'medical'
  
  // 病例記錄 AI 分析資訊
  medicalInfo?: {
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
  }
}

// 保險保單
export interface InsurancePolicy extends BaseDocument {
  documentType: 'insurance'
  
  // 保單基本資訊
  policyInfo?: {
    insuranceCompany: string
    policyNumber: string
    policyType: string
    coverage: string
    premium: string
    startDate: string
    endDate: string
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