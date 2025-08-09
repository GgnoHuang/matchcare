/**
 * localStorage 儲存提供者
 * 
 * 📝 拆除說明：
 * 此檔案實作localStorage版本的資料儲存
 * 使用 {userId}_{dataType} 格式作為storage key
 * 拆除時刪除整個 lib/storage/ 資料夾即可
 */

import { 
  MedicalRecord, 
  InsurancePolicy,
  DiagnosisCertificate,
  AnalysisResult, 
  UserSettings, 
  StorageStats 
} from './types'

export class LocalStorageProvider {
  private getStorageKey(userId: string, dataType: string): string {
    return `matchcare_${userId}_${dataType}`
  }

  private safeJSONParse<T>(data: string | null, fallback: T): T {
    if (!data) return fallback
    try {
      return JSON.parse(data) as T
    } catch (error) {
      console.warn('JSON parse error:', error)
      return fallback
    }
  }

  private safeLocalStorageOperation<T>(operation: () => T, fallback: T): T {
    try {
      if (typeof window === 'undefined') return fallback
      return operation()
    } catch (error) {
      console.warn('localStorage operation failed:', error)
      return fallback
    }
  }

  // 病歷記錄管理
  async saveMedicalRecord(userId: string, record: MedicalRecord): Promise<void> {
    return this.safeLocalStorageOperation(() => {
      const key = this.getStorageKey(userId, 'medical_records')
      const existingRecords = this.safeJSONParse<MedicalRecord[]>(
        localStorage.getItem(key), 
        []
      )
      
      // 更新或新增記錄
      const index = existingRecords.findIndex(r => r.id === record.id)
      if (index >= 0) {
        existingRecords[index] = record
      } else {
        existingRecords.push(record)
      }
      
      localStorage.setItem(key, JSON.stringify(existingRecords))
    }, Promise.resolve())
  }

  async getMedicalRecords(userId: string): Promise<MedicalRecord[]> {
    return this.safeLocalStorageOperation(() => {
      const key = this.getStorageKey(userId, 'medical_records')
      return this.safeJSONParse<MedicalRecord[]>(
        localStorage.getItem(key), 
        []
      )
    }, [])
  }

  async deleteMedicalRecord(userId: string, recordId: string): Promise<void> {
    return this.safeLocalStorageOperation(() => {
      const key = this.getStorageKey(userId, 'medical_records')
      const existingRecords = this.safeJSONParse<MedicalRecord[]>(
        localStorage.getItem(key), 
        []
      )
      
      const filteredRecords = existingRecords.filter(r => r.id !== recordId)
      localStorage.setItem(key, JSON.stringify(filteredRecords))
    }, Promise.resolve())
  }

  // 保險保單管理
  async saveInsurancePolicy(userId: string, policy: InsurancePolicy): Promise<void> {
    return this.safeLocalStorageOperation(() => {
      const key = this.getStorageKey(userId, 'insurance_policies')
      const existingPolicies = this.safeJSONParse<InsurancePolicy[]>(
        localStorage.getItem(key), 
        []
      )
      
      // 更新或新增保單
      const index = existingPolicies.findIndex(p => p.id === policy.id)
      if (index >= 0) {
        existingPolicies[index] = policy
      } else {
        existingPolicies.push(policy)
      }
      
      localStorage.setItem(key, JSON.stringify(existingPolicies))
    }, Promise.resolve())
  }

  async getInsurancePolicies(userId: string): Promise<InsurancePolicy[]> {
    return this.safeLocalStorageOperation(() => {
      const key = this.getStorageKey(userId, 'insurance_policies')
      return this.safeJSONParse<InsurancePolicy[]>(
        localStorage.getItem(key), 
        []
      )
    }, [])
  }

  async deleteInsurancePolicy(userId: string, policyId: string): Promise<void> {
    return this.safeLocalStorageOperation(() => {
      const key = this.getStorageKey(userId, 'insurance_policies')
      const existingPolicies = this.safeJSONParse<InsurancePolicy[]>(
        localStorage.getItem(key), 
        []
      )
      
      const filteredPolicies = existingPolicies.filter(p => p.id !== policyId)
      localStorage.setItem(key, JSON.stringify(filteredPolicies))
    }, Promise.resolve())
  }

  // 診斷證明管理
  async saveDiagnosisCertificate(userId: string, certificate: DiagnosisCertificate): Promise<void> {
    return this.safeLocalStorageOperation(() => {
      const key = this.getStorageKey(userId, 'diagnosis_certificates')
      const existingCertificates = this.safeJSONParse<DiagnosisCertificate[]>(
        localStorage.getItem(key), 
        []
      )
      
      // 更新或新增診斷證明
      const index = existingCertificates.findIndex(c => c.id === certificate.id)
      if (index >= 0) {
        existingCertificates[index] = certificate
      } else {
        existingCertificates.push(certificate)
      }
      
      localStorage.setItem(key, JSON.stringify(existingCertificates))
    }, Promise.resolve())
  }

  async getDiagnosisCertificates(userId: string): Promise<DiagnosisCertificate[]> {
    return this.safeLocalStorageOperation(() => {
      const key = this.getStorageKey(userId, 'diagnosis_certificates')
      return this.safeJSONParse<DiagnosisCertificate[]>(
        localStorage.getItem(key), 
        []
      )
    }, [])
  }

  async deleteDiagnosisCertificate(userId: string, certificateId: string): Promise<void> {
    return this.safeLocalStorageOperation(() => {
      const key = this.getStorageKey(userId, 'diagnosis_certificates')
      const existingCertificates = this.safeJSONParse<DiagnosisCertificate[]>(
        localStorage.getItem(key), 
        []
      )
      
      const filteredCertificates = existingCertificates.filter(c => c.id !== certificateId)
      localStorage.setItem(key, JSON.stringify(filteredCertificates))
    }, Promise.resolve())
  }

  // AI分析結果管理
  async saveAnalysisResult(userId: string, result: AnalysisResult): Promise<void> {
    return this.safeLocalStorageOperation(() => {
      const key = this.getStorageKey(userId, 'analysis_results')
      const existingResults = this.safeJSONParse<AnalysisResult[]>(
        localStorage.getItem(key), 
        []
      )
      
      // 更新或新增結果
      const index = existingResults.findIndex(r => r.id === result.id)
      if (index >= 0) {
        existingResults[index] = result
      } else {
        existingResults.push(result)
      }
      
      // 只保留最近50筆記錄
      const sortedResults = existingResults
        .sort((a, b) => new Date(b.analysisDate).getTime() - new Date(a.analysisDate).getTime())
        .slice(0, 50)
      
      localStorage.setItem(key, JSON.stringify(sortedResults))
    }, Promise.resolve())
  }

  async getAnalysisResults(userId: string): Promise<AnalysisResult[]> {
    return this.safeLocalStorageOperation(() => {
      const key = this.getStorageKey(userId, 'analysis_results')
      const results = this.safeJSONParse<AnalysisResult[]>(
        localStorage.getItem(key), 
        []
      )
      
      // 按日期降序排列
      return results.sort((a, b) => 
        new Date(b.analysisDate).getTime() - new Date(a.analysisDate).getTime()
      )
    }, [])
  }

  async deleteAnalysisResult(userId: string, resultId: string): Promise<void> {
    return this.safeLocalStorageOperation(() => {
      const key = this.getStorageKey(userId, 'analysis_results')
      const existingResults = this.safeJSONParse<AnalysisResult[]>(
        localStorage.getItem(key), 
        []
      )
      
      const filteredResults = existingResults.filter(r => r.id !== resultId)
      localStorage.setItem(key, JSON.stringify(filteredResults))
    }, Promise.resolve())
  }

  // 用戶設定管理
  async saveUserSettings(userId: string, settings: UserSettings): Promise<void> {
    return this.safeLocalStorageOperation(() => {
      const key = this.getStorageKey(userId, 'settings')
      localStorage.setItem(key, JSON.stringify(settings))
    }, Promise.resolve())
  }

  async getUserSettings(userId: string): Promise<UserSettings | null> {
    return this.safeLocalStorageOperation(() => {
      const key = this.getStorageKey(userId, 'settings')
      const data = localStorage.getItem(key)
      return data ? this.safeJSONParse<UserSettings>(data, null as any) : null
    }, null)
  }

  // 統計資訊
  async getStorageStats(userId: string): Promise<StorageStats> {
    return this.safeLocalStorageOperation(async () => {
      const medicalRecords = await this.getMedicalRecords(userId)
      const insurancePolicies = await this.getInsurancePolicies(userId)
      const diagnosisCertificates = await this.getDiagnosisCertificates(userId)
      const analysisResults = await this.getAnalysisResults(userId)
      
      // 估算儲存大小（簡單計算）
      const totalStorageUsed = 
        JSON.stringify(medicalRecords).length +
        JSON.stringify(insurancePolicies).length +
        JSON.stringify(diagnosisCertificates).length +
        JSON.stringify(analysisResults).length
      
      return {
        medicalRecords: medicalRecords.length,
        insurancePolicies: insurancePolicies.length,
        diagnosisCertificates: diagnosisCertificates.length,
        analysisResults: analysisResults.length,
        totalStorageUsed,
        lastSyncDate: new Date().toISOString()
      }
    }, {
      medicalRecords: 0,
      insurancePolicies: 0,
      diagnosisCertificates: 0,
      analysisResults: 0,
      totalStorageUsed: 0
    })
  }

  // 清除用戶所有資料
  async clearUserData(userId: string): Promise<void> {
    return this.safeLocalStorageOperation(() => {
      const dataTypes = ['medical_records', 'insurance_policies', 'diagnosis_certificates', 'analysis_results', 'settings']
      dataTypes.forEach(dataType => {
        const key = this.getStorageKey(userId, dataType)
        localStorage.removeItem(key)
      })
    }, Promise.resolve())
  }
}