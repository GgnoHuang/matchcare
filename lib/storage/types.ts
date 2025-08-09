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
  
  // AI分析結果
  aiAnalysis?: {
    disease: string
    severity: string
    treatmentStage: string
    estimatedCost: string
    careNeeds: string
    familyImpact: string
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
  
  // 診斷證明特有資訊
  diagnosisInfo?: {
    diagnosisDate: string
    doctorName: string
    hospitalName: string
    diagnosis: string
    diseaseCode?: string // ICD-10 代碼
    treatmentPeriod?: string
    workCapacity?: string // 工作能力評估
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