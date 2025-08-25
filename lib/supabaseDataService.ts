// Supabase 資料服務
import { supabaseConfig } from './supabase'

// 取得用戶所有保單
export async function getUserPolicies(phoneNumber: string) {
  const { baseUrl, apiKey } = supabaseConfig
  
  try {
    console.log('開始載入保單，電話號碼:', phoneNumber)
    console.log('Supabase URL:', `${baseUrl}/users_basic?select=*,insurance_policies(*)&phonenumber=eq.${encodeURIComponent(phoneNumber)}`)
    
    const response = await fetch(
      `${baseUrl}/users_basic?select=*,insurance_policies(*)&phonenumber=eq.${encodeURIComponent(phoneNumber)}`,
      {
        method: "GET",
        headers: {
          "apikey": apiKey,
          "Authorization": `Bearer ${apiKey}`,
          "Accept": "application/json",
        }
      }
    )

    console.log('Response status:', response.status)
    console.log('Response ok:', response.ok)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('API 錯誤響應:', errorText)
      throw new Error(`API 請求失敗: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('保單 API 返回數據:', JSON.stringify(data, null, 2))
    
    if (data.length === 0) {
      console.log('用戶沒有保單資料')
      return { success: true, policies: [] }
    }

    console.log('找到用戶資料，保單數量:', data[0]?.insurance_policies?.length || 0)

    // 轉換 Supabase 格式到 MatchCare 格式 (已移除不必要欄位)
    const policies = data[0].insurance_policies.map((policy: any) => {
      // 優先使用新的 coverage_items JSONB 欄位
      let coverage = []
      
      if (policy.coverage_items && Array.isArray(policy.coverage_items)) {
        // 使用新的 JSONB 格式
        coverage = policy.coverage_items
        console.log('使用 coverage_items JSONB 格式:', coverage.length, '項目')
      } else if (policy.policy_basic_policy_terms) {
        // 向後相容：解析舊的字串格式
        try {
          console.log('向後相容：解析字串格式保障範圍')
          coverage = policy.policy_basic_policy_terms.split(', ').map((item: string) => {
            const match = item.match(/^(.+)\s+(\d+)(.+)$/)
            if (match) {
              return {
                name: match[1].trim(),
                amount: match[2],
                unit: match[3].trim()
              }
            }
            return { name: item.trim(), amount: '', unit: '元' }
          }).filter((item: any) => item.name)
        } catch (e) {
          console.log('解析字串保障範圍失敗:', policy.policy_basic_policy_terms)
        }
      }

      return {
        id: policy.id,
        fileName: policy.file_name,
        policyName: policy.policy_name,  // 新增 policy_name 欄位
        documentType: policy.document_type,
        uploadDate: policy.upload_date,
        textContent: policy.text_content,
        notes: policy.notes,
        policyInfo: {
          policyBasicInfo: {
            insuranceCompany: policy.policy_basic_insurance_company,
            policyNumber: policy.policy_basic_policy_number,
            effectiveDate: policy.policy_basic_effective_date,
            policyTerms: policy.policy_basic_policy_terms,
            insurancePeriod: policy.policy_basic_insurance_period
          },
          insuredPersonInfo: {
            name: policy.insured_name
          },
          beneficiaryInfo: {
            name: policy.beneficiary_name
          },
          coverageDetails: {
            coverage: coverage
          }
        },
        // 為了向後相容，也直接提供 coverage 欄位
        coverage: coverage,
        // 同時保留原始的 coverage_items 欄位供其他地方使用
        coverage_items: coverage
      }
    })

    console.log('返回保單數據，數量:', policies.length)
    return { success: true, policies }
  } catch (error: any) {
    console.error('取得保單失敗:', error)
    return { success: false, error: error.message, policies: [] }
  }
}

// 取得用戶所有病歷
export async function getUserMedicalRecords(phoneNumber: string) {
  const { baseUrl, apiKey } = supabaseConfig
  
  try {
    const response = await fetch(
      `${baseUrl}/users_basic?select=*,medical_records(*)&phonenumber=eq.${encodeURIComponent(phoneNumber)}`,
      {
        method: "GET",
        headers: {
          "apikey": apiKey,
          "Authorization": `Bearer ${apiKey}`,
          "Accept": "application/json",
        }
      }
    )

    if (!response.ok) {
      throw new Error(`API 請求失敗: ${response.status}`)
    }

    const data = await response.json()
    
    if (data.length === 0) {
      return { success: true, records: [] }
    }

    // 如果有 medical_records 表的話，在這裡轉換格式
    const records = data[0].medical_records?.map((record: any) => ({
      id: record.id,
      fileName: record.file_name,
      fileType: record.file_type,
      documentType: record.document_type,
      uploadDate: record.upload_date,
      fileSize: record.file_size,
      textContent: record.text_content,
      imageBase64: record.image_base64,
      notes: record.notes,
      medicalInfo: {
        clinicalRecord: record.clinical_record,
        admissionRecord: record.admission_record,
        surgeryRecord: record.surgery_record,
        examinationReport: record.examination_report,
        medicationRecord: record.medication_record,
        dischargeSummary: record.discharge_summary,
        hospitalStamp: record.hospital_stamp
      }
    })) || []

    return { success: true, records }
  } catch (error: any) {
    console.error('取得病歷失敗:', error)
    return { success: false, error: error.message, records: [] }
  }
}

// 更新保單資料
export async function updatePolicy(policyId: string, updateData: any) {
  const { baseUrl, apiKey } = supabaseConfig
  
  try {
    const response = await fetch(
      `${baseUrl}/insurance_policies?id=eq.${policyId}`,
      {
        method: "PATCH",
        headers: {
          "apikey": apiKey,
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "Prefer": "return=representation",
        },
        body: JSON.stringify(updateData)
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Supabase 更新錯誤詳情:', errorText)
      throw new Error(`更新保單失敗: ${response.status} - ${errorText}`)
    }

    const updatedPolicy = await response.json()
    return { success: true, policy: updatedPolicy }
  } catch (error: any) {
    console.error('更新保單失敗:', error)
    return { success: false, error: error.message }
  }
}

// 刪除保單
export async function deletePolicy(policyId: string) {
  const { baseUrl, apiKey } = supabaseConfig
  
  try {
    const response = await fetch(
      `${baseUrl}/insurance_policies?id=eq.${policyId}`,
      {
        method: "DELETE",
        headers: {
          "apikey": apiKey,
          "Authorization": `Bearer ${apiKey}`,
        }
      }
    )

    if (!response.ok) {
      throw new Error(`刪除保單失敗: ${response.status}`)
    }

    return { success: true }
  } catch (error: any) {
    console.error('刪除保單失敗:', error)
    return { success: false, error: error.message }
  }
}

// 刪除病歷
export async function deleteMedicalRecord(recordId: string) {
  const { baseUrl, apiKey } = supabaseConfig
  
  try {
    const response = await fetch(
      `${baseUrl}/medical_records?id=eq.${recordId}`,
      {
        method: "DELETE",
        headers: {
          "apikey": apiKey,
          "Authorization": `Bearer ${apiKey}`,
        }
      }
    )

    if (!response.ok) {
      throw new Error(`刪除病歷失敗: ${response.status}`)
    }

    return { success: true }
  } catch (error: any) {
    console.error('刪除病歷失敗:', error)
    return { success: false, error: error.message }
  }
}