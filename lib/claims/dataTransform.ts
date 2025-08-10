/**
 * 理賠申請資料轉換層
 * 將真實的用戶資料轉換為理賠UI所需的格式
 */

import { MedicalRecord, InsurancePolicy, DiagnosisCertificate } from '@/lib/storage/types'

// UI顯示用的醫療記錄格式
export interface ClaimMedicalRecord {
  id: string
  hospital: string
  department: string
  date: string
  diagnosis: string
  doctor: string
  treatments: string[]
  medications: string[]
  claimSuccessRate: number
  hasDataIssues: boolean
  missingFields: string[]
  sourceData: MedicalRecord
}

// UI顯示用的保單格式
export interface ClaimInsurancePolicy {
  id: string
  company: string
  name: string
  type: string
  policyNumber: string
  coverage: ClaimCoverageItem[]
  selected: boolean
  totalEstimatedAmount: number
  hasDataIssues: boolean
  missingFields: string[]
  sourceData: InsurancePolicy
}

// 保障項目格式
export interface ClaimCoverageItem {
  type: string
  amount: number
  unit: string
  maxDays?: number
  eligible: boolean
  estimatedAmount: number
  confidence: 'high' | 'medium' | 'low'
}

/**
 * 智能提取醫院信息
 */
function extractHospitalInfo(record: MedicalRecord): {
  hospital: string
  department: string
  doctor: string
  confidence: 'high' | 'medium' | 'low'
} {
  const medicalInfo = record.medicalInfo
  let hospital = '未知醫院'
  let department = '未知科別'
  let doctor = '未知醫師'
  let confidence: 'high' | 'medium' | 'low' = 'low'

  // 從醫院印章提取
  if (medicalInfo?.hospitalStamp && medicalInfo.hospitalStamp !== '待輸入') {
    const stamp = medicalInfo.hospitalStamp
    
    // 提取醫院名稱
    const hospitalMatch = stamp.match(/([^,\n]*醫院[^,\n]*|[^,\n]*診所[^,\n]*|[^,\n]*醫療[^,\n]*)/i)
    if (hospitalMatch) {
      hospital = hospitalMatch[1].trim()
      confidence = 'high'
    }
    
    // 提取醫師名稱
    const doctorMatch = stamp.match(/(醫師[：:]\s*([^,\n\s]+)|([^,\n\s]*醫師))/i)
    if (doctorMatch) {
      doctor = (doctorMatch[2] || doctorMatch[3] || '').replace('醫師', '') + '醫師'
    }
  }

  // 從臨床記錄補充提取
  if (medicalInfo?.clinicalRecord && medicalInfo.clinicalRecord !== '待輸入') {
    const clinical = medicalInfo.clinicalRecord
    
    // 如果醫院信息仍然缺失，從臨床記錄提取
    if (hospital === '未知醫院') {
      const hospitalMatch = clinical.match(/([^,\n]*醫院[^,\n]*|[^,\n]*診所[^,\n]*)/i)
      if (hospitalMatch) {
        hospital = hospitalMatch[1].trim()
        confidence = 'medium'
      }
    }
    
    // 提取科別
    const deptMatch = clinical.match(/(內科|外科|骨科|心臟科|腫瘤科|神經科|精神科|皮膚科|眼科|耳鼻喉科|婦產科|泌尿科|小兒科|家醫科|急診科|復健科|放射科|麻醉科|病理科)/i)
    if (deptMatch) {
      department = deptMatch[1]
      if (confidence === 'low') confidence = 'medium'
    }
  }

  return { hospital, department, doctor, confidence }
}

/**
 * 提取診斷信息
 */
function extractDiagnosis(record: MedicalRecord): string {
  const medicalInfo = record.medicalInfo
  
  // 優先級順序：臨床記錄 -> 入院記錄 -> 檢查報告
  if (medicalInfo?.clinicalRecord && medicalInfo.clinicalRecord !== '待輸入') {
    // 嘗試提取具體診斷
    const diagnosisMatch = medicalInfo.clinicalRecord.match(/(診斷[：:]?\s*([^,\n]+)|主要診斷[：:]?\s*([^,\n]+))/i)
    if (diagnosisMatch) {
      return (diagnosisMatch[2] || diagnosisMatch[3] || '').trim()
    }
    
    // 如果沒有明確的診斷標示，返回臨床記錄的摘要
    if (medicalInfo.clinicalRecord.length > 20) {
      return medicalInfo.clinicalRecord.substring(0, 100) + '...'
    }
    
    return medicalInfo.clinicalRecord
  }
  
  if (medicalInfo?.admissionRecord && medicalInfo.admissionRecord !== '待輸入') {
    return medicalInfo.admissionRecord.substring(0, 100) + '...'
  }
  
  if (medicalInfo?.examinationReport && medicalInfo.examinationReport !== '待輸入') {
    return medicalInfo.examinationReport.substring(0, 100) + '...'
  }
  
  return '診斷資訊待補充'
}

/**
 * 提取治療信息
 */
function extractTreatments(record: MedicalRecord): string[] {
  const medicalInfo = record.medicalInfo
  const treatments: string[] = []
  
  if (medicalInfo?.surgeryRecord && medicalInfo.surgeryRecord !== '待輸入') {
    treatments.push(medicalInfo.surgeryRecord)
  }
  
  if (medicalInfo?.clinicalRecord && medicalInfo.clinicalRecord !== '待輸入') {
    const clinical = medicalInfo.clinicalRecord
    const treatmentMatch = clinical.match(/(治療[：:]?\s*([^,\n]+)|處置[：:]?\s*([^,\n]+))/i)
    if (treatmentMatch) {
      treatments.push(treatmentMatch[2] || treatmentMatch[3] || '')
    }
  }
  
  if (treatments.length === 0) {
    treatments.push('治療記錄待補充')
  }
  
  return treatments.filter(t => t && t.trim())
}

/**
 * 提取用藥信息
 */
function extractMedications(record: MedicalRecord): string[] {
  const medicalInfo = record.medicalInfo
  const medications: string[] = []
  
  if (medicalInfo?.medicationRecord && medicalInfo.medicationRecord !== '待輸入') {
    // 嘗試分割藥物名稱
    const meds = medicalInfo.medicationRecord.split(/[,，\n]/).filter(med => med.trim())
    medications.push(...meds)
  }
  
  if (medications.length === 0) {
    medications.push('用藥記錄待補充')
  }
  
  return medications
}

/**
 * 轉換醫療記錄為理賠格式
 */
export function transformMedicalRecord(record: MedicalRecord): ClaimMedicalRecord {
  const hospitalInfo = extractHospitalInfo(record)
  const diagnosis = extractDiagnosis(record)
  const treatments = extractTreatments(record)
  const medications = extractMedications(record)
  
  // 檢查缺失的關鍵資料
  const missingFields: string[] = []
  let hasDataIssues = false
  
  if (hospitalInfo.hospital === '未知醫院') {
    missingFields.push('醫院名稱')
    hasDataIssues = true
  }
  
  if (hospitalInfo.department === '未知科別') {
    missingFields.push('就診科別')
    hasDataIssues = true
  }
  
  if (hospitalInfo.doctor === '未知醫師') {
    missingFields.push('主治醫師')
    hasDataIssues = true
  }
  
  if (diagnosis === '診斷資訊待補充') {
    missingFields.push('診斷結果')
    hasDataIssues = true
  }
  
  if (treatments.includes('治療記錄待補充')) {
    missingFields.push('治療方案')
    hasDataIssues = true
  }
  
  if (medications.includes('用藥記錄待補充')) {
    missingFields.push('用藥記錄')
    hasDataIssues = true
  }
  
  // 計算理賠成功率（基於資料完整性）
  const totalFields = 6
  const missingCount = missingFields.length
  const completeness = Math.max(0, (totalFields - missingCount) / totalFields)
  const baseSuccessRate = 70 + (completeness * 25) // 70-95%
  const claimSuccessRate = Math.round(baseSuccessRate)

  return {
    id: record.id,
    hospital: hospitalInfo.hospital,
    department: hospitalInfo.department,
    date: new Date(record.uploadDate).toLocaleDateString('zh-TW'),
    diagnosis: diagnosis,
    doctor: hospitalInfo.doctor,
    treatments: treatments,
    medications: medications,
    claimSuccessRate: claimSuccessRate,
    hasDataIssues: hasDataIssues,
    missingFields: missingFields,
    sourceData: record
  }
}

/**
 * 從保單資訊提取保障項目
 */
function extractCoverage(policy: InsurancePolicy): ClaimCoverageItem[] {
  const policyInfo = policy.policyInfo
  const coverage: ClaimCoverageItem[] = []
  
  if (!policyInfo?.insuranceCoverageInfo) {
    return [{
      type: '保障內容待分析',
      amount: 0,
      unit: '元',
      eligible: false,
      estimatedAmount: 0,
      confidence: 'low'
    }]
  }
  
  const coverageInfo = policyInfo.insuranceCoverageInfo
  
  // 住院給付
  if (coverageInfo.hospitalizationCoverage && coverageInfo.hospitalizationCoverage !== '待輸入') {
    const amountMatch = coverageInfo.hospitalizationCoverage.match(/(\d+(?:,\d+)*)/g)
    if (amountMatch) {
      const amount = parseInt(amountMatch[0].replace(/,/g, ''))
      coverage.push({
        type: '住院醫療',
        amount: amount,
        unit: '元/日',
        maxDays: 365, // 預設最大天數
        eligible: true,
        estimatedAmount: amount * 30, // 預估30天
        confidence: 'medium'
      })
    }
  }
  
  // 手術給付
  if (coverageInfo.surgeryCoverage && coverageInfo.surgeryCoverage !== '待輸入') {
    const amountMatch = coverageInfo.surgeryCoverage.match(/(\d+(?:,\d+)*)/g)
    if (amountMatch) {
      const amount = parseInt(amountMatch[0].replace(/,/g, ''))
      coverage.push({
        type: '手術費用',
        amount: amount,
        unit: '元/次',
        eligible: true,
        estimatedAmount: amount,
        confidence: 'medium'
      })
    }
  }
  
  // 醫療費用給付
  if (coverageInfo.medicalExpenseCoverage && coverageInfo.medicalExpenseCoverage !== '待輸入') {
    const amountMatch = coverageInfo.medicalExpenseCoverage.match(/(\d+(?:,\d+)*)/g)
    if (amountMatch) {
      const amount = parseInt(amountMatch[0].replace(/,/g, ''))
      coverage.push({
        type: '醫療費用',
        amount: amount,
        unit: '元/年',
        eligible: true,
        estimatedAmount: Math.min(amount, 100000), // 預估10萬
        confidence: 'medium'
      })
    }
  }
  
  // 癌症給付
  if (coverageInfo.cancerCoverage && coverageInfo.cancerCoverage !== '待輸入') {
    const amountMatch = coverageInfo.cancerCoverage.match(/(\d+(?:,\d+)*)/g)
    if (amountMatch) {
      const amount = parseInt(amountMatch[0].replace(/,/g, ''))
      coverage.push({
        type: '癌症治療',
        amount: amount,
        unit: '元',
        eligible: true,
        estimatedAmount: amount,
        confidence: 'high'
      })
    }
  }
  
  return coverage.length > 0 ? coverage : [{
    type: '保障內容待分析',
    amount: 0,
    unit: '元',
    eligible: false,
    estimatedAmount: 0,
    confidence: 'low'
  }]
}

/**
 * 轉換保單為理賠格式
 */
export function transformInsurancePolicy(policy: InsurancePolicy): ClaimInsurancePolicy {
  const basicInfo = policy.policyInfo?.policyBasicInfo
  const coverage = extractCoverage(policy)
  
  // 檢查缺失的關鍵資料
  const missingFields: string[] = []
  let hasDataIssues = false
  
  const company = basicInfo?.insuranceCompany || '未知保險公司'
  const name = basicInfo?.policyName || '保單名稱待補充'
  const type = basicInfo?.policyType || '保險類型待補充'
  const policyNumber = basicInfo?.policyNumber || '保單號碼待補充'
  
  if (company === '未知保險公司' || !basicInfo?.insuranceCompany || basicInfo.insuranceCompany === '待輸入') {
    missingFields.push('保險公司')
    hasDataIssues = true
  }
  
  if (name === '保單名稱待補充' || !basicInfo?.policyName || basicInfo.policyName === '待輸入') {
    missingFields.push('保單名稱')
    hasDataIssues = true
  }
  
  if (type === '保險類型待補充' || !basicInfo?.policyType || basicInfo.policyType === '待輸入') {
    missingFields.push('保險類型')
    hasDataIssues = true
  }
  
  if (policyNumber === '保單號碼待補充' || !basicInfo?.policyNumber || basicInfo.policyNumber === '待輸入') {
    missingFields.push('保單號碼')
    hasDataIssues = true
  }
  
  if (coverage.length === 1 && coverage[0].type === '保障內容待分析') {
    missingFields.push('保障內容')
    hasDataIssues = true
  }
  
  const totalEstimatedAmount = coverage.reduce((sum, item) => sum + item.estimatedAmount, 0)
  
  return {
    id: policy.id,
    company: company,
    name: name,
    type: type,
    policyNumber: policyNumber,
    coverage: coverage,
    selected: false, // 預設不選中
    totalEstimatedAmount: totalEstimatedAmount,
    hasDataIssues: hasDataIssues,
    missingFields: missingFields,
    sourceData: policy
  }
}

/**
 * 檢查已上傳文件，生成所需文件清單
 */
export interface RequiredDocument {
  id: string
  name: string
  required: boolean
  uploaded: boolean
  existingFile?: DiagnosisCertificate
  description: string
}

export function generateRequiredDocuments(
  userId: string, 
  diagnosisCertificates: DiagnosisCertificate[]
): RequiredDocument[] {
  const baseDocuments = [
    {
      id: 'diagnosis',
      name: '診斷證明書',
      required: true,
      description: '醫師開立的正式診斷證明'
    },
    {
      id: 'receipt',
      name: '醫療費用收據',
      required: true,
      description: '醫院開立的醫療費用收據正本'
    },
    {
      id: 'treatment',
      name: '治療明細',
      required: true,
      description: '詳細的治療過程和用藥記錄'
    },
    {
      id: 'id',
      name: '身分證正反面影本',
      required: true,
      description: '要保人身分證明文件'
    },
    {
      id: 'bankbook',
      name: '存摺封面影本',
      required: true,
      description: '理賠金匯款帳戶資訊'
    }
  ]
  
  return baseDocuments.map(doc => {
    // 檢查是否已有診斷證明
    let uploaded = false
    let existingFile = undefined
    
    if (doc.id === 'diagnosis') {
      existingFile = diagnosisCertificates.find(cert => cert.diagnosisInfo)
      uploaded = !!existingFile
    }
    
    return {
      ...doc,
      uploaded,
      existingFile
    }
  })
}