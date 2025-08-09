/**
 * 用戶資料管理 - 統一儲存服務
 * 
 * 📝 拆除說明：
 * 這是整個儲存系統的統一入口點
 * 提供統一的API，可以輕鬆切換不同的儲存提供者（localStorage <-> Firebase）
 * 
 * 拆除步驟：
 * 1. 刪除整個 lib/storage/ 資料夾
 * 2. 移除所有 import {...} from '@/lib/storage' 的引用
 * 3. 恢復使用原有的假資料或新的API調用
 */

import { LocalStorageProvider } from './localStorage.provider'
import { 
  DocumentType,
  BaseDocument,
  MedicalRecord, 
  InsurancePolicy,
  DiagnosisCertificate,
  AnalysisResult, 
  UserSettings, 
  StorageStats 
} from './types'

// 儲存服務接口定義
export interface UserDataService {
  // 病歷記錄
  saveMedicalRecord(userId: string, record: MedicalRecord): Promise<void>
  getMedicalRecords(userId: string): Promise<MedicalRecord[]>
  deleteMedicalRecord(userId: string, recordId: string): Promise<void>
  
  // 保險保單
  saveInsurancePolicy(userId: string, policy: InsurancePolicy): Promise<void>
  getInsurancePolicies(userId: string): Promise<InsurancePolicy[]>
  deleteInsurancePolicy(userId: string, policyId: string): Promise<void>
  
  // 診斷證明
  saveDiagnosisCertificate(userId: string, certificate: DiagnosisCertificate): Promise<void>
  getDiagnosisCertificates(userId: string): Promise<DiagnosisCertificate[]>
  deleteDiagnosisCertificate(userId: string, certificateId: string): Promise<void>
  
  // AI分析結果
  saveAnalysisResult(userId: string, result: AnalysisResult): Promise<void>
  getAnalysisResults(userId: string): Promise<AnalysisResult[]>
  deleteAnalysisResult(userId: string, resultId: string): Promise<void>
  
  // 用戶設定
  saveUserSettings(userId: string, settings: UserSettings): Promise<void>
  getUserSettings(userId: string): Promise<UserSettings | null>
  
  // 統計與管理
  getStorageStats(userId: string): Promise<StorageStats>
  clearUserData(userId: string): Promise<void>
}

// 當前使用的儲存提供者
// 🔄 未來升級到Firebase時，只需要改這裡：
// const storageProvider = new FirebaseProvider()
const storageProvider = new LocalStorageProvider()

// 統一的儲存服務實例
export const userDataService: UserDataService = storageProvider

// 工具函數：生成唯一ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// 工具函數：格式化檔案大小
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 工具函數：格式化日期
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 導出類型，方便其他模組使用
export type { 
  MedicalRecord, 
  InsurancePolicy,
  DiagnosisCertificate,
  DocumentType,
  BaseDocument,
  AnalysisResult, 
  UserSettings, 
  StorageStats 
}

// 導出Provider類別（僅用於類型檢查）
export { LocalStorageProvider }

// 🎯 主要使用方式：
//
// import { userDataService, generateId, MedicalRecord } from '@/lib/storage'
// 
// const saveUserRecord = async (userId: string, fileData: any) => {
//   const record: MedicalRecord = {
//     id: generateId(),
//     fileName: fileData.fileName,
//     // ... 其他欄位
//   }
//   await userDataService.saveMedicalRecord(userId, record)
// }