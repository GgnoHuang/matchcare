// Supabase 資料服務
import { supabaseConfig } from './supabase'

// 取得用戶所有保單
export async function getUserPolicies(phoneNumber: string) {
  const { baseUrl, apiKey } = supabaseConfig
  
  try {
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

    if (!response.ok) {
      throw new Error(`API 請求失敗: ${response.status}`)
    }

    const data = await response.json()
    
    if (data.length === 0) {
      return { success: true, policies: [] }
    }

    // 轉換 Supabase 格式到 MatchCare 格式
    const policies = data[0].insurance_policies.map((policy: any) => ({
      id: policy.id,
      fileName: policy.file_name,
      fileType: policy.file_type,
      documentType: policy.document_type,
      uploadDate: policy.upload_date,
      fileSize: policy.file_size,
      textContent: policy.text_content,
      imageBase64: policy.image_base64,
      notes: policy.notes,
      policyInfo: {
        policyBasicInfo: {
          insuranceCompany: policy.policy_basic_insurance_company,
          policyNumber: policy.policy_basic_policy_number,
          effectiveDate: policy.policy_basic_effective_date,
          policyTerms: policy.policy_basic_policy_terms,
          insurancePeriod: policy.policy_basic_insurance_period
        },
        policyHolderInfo: {
          name: policy.holder_name,
          birthDate: policy.holder_birth_date,
          idNumber: policy.holder_id_number,
          occupation: policy.holder_occupation,
          contactAddress: policy.holder_contact_address
        },
        insuredPersonInfo: {
          name: policy.insured_name,
          birthDate: policy.insured_birth_date,
          gender: policy.insured_gender,
          idNumber: policy.insured_id_number,
          occupation: policy.insured_occupation,
          contactAddress: policy.insured_contact_address
        },
        beneficiaryInfo: {
          name: policy.beneficiary_name,
          relationshipToInsured: policy.beneficiary_relationship,
          benefitRatio: policy.beneficiary_benefit_ratio
        },
        insuranceContentAndFees: {
          insuranceAmount: policy.fees_insurance_amount,
          paymentMethod: policy.fees_payment_method,
          paymentPeriod: policy.fees_payment_period,
          dividendDistribution: policy.fees_dividend_distribution
        },
        otherMatters: {
          automaticPremiumLoan: policy.other_automatic_premium_loan,
          additionalClauses: policy.other_additional_clauses
        },
        insuranceServiceInfo: {
          customerServiceHotline: policy.service_customer_service_hotline,
          claimsProcessIntro: policy.service_claims_process_intro
        }
      }
    }))

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
      throw new Error(`更新保單失敗: ${response.status}`)
    }

    const updatedPolicy = await response.json()
    return { success: true, policy: updatedPolicy }
  } catch (error: any) {
    console.error('更新保單失敗:', error)
    return { success: false, error: error.message }
  }
}