"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { 
  FileText, 
  Shield, 
  Trash2, 
  Download, 
  Upload, 
  BarChart3, 
  Calendar,
  FileImage,
  AlertCircle,
  CheckCircle2,
  Clock,
  Settings,
  RefreshCw,
  X
} from "lucide-react"
import UploadZone, { UploadedFile } from "@/components/ui/upload-zone"
import { checkAuth } from "@/app/actions/auth-service"
import { OpenAIService } from "@/lib/openaiService"
import MedicalDataEditor from "@/components/ui/medical-data-editor"
import { supabaseConfig } from "@/lib/supabase"

// 生成唯一ID的輔助函數
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// 格式化檔案大小
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 格式化日期
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('zh-TW');
}

// 定義類型
interface MedicalRecord {
  id: string
  fileName: string
  fileType: string
  documentType: string
  uploadDate: string
  fileSize: number
  textContent?: string
  imageBase64?: string
  notes?: string
  medicalInfo?: any
}

interface InsurancePolicy {
  id: string
  fileName: string
  fileType: string
  documentType: string
  uploadDate: string
  fileSize: number
  textContent?: string
  imageBase64?: string
  notes?: string
  policyInfo?: any
}

type DocumentType = 'medical' | 'insurance'

interface StorageStats {
  totalSize: number
  fileCount: number
  medicalRecords: number
  insurancePolicies: number
}

export default function MyDataPage() {
  // URL參數
  const searchParams = useSearchParams()
  const editId = searchParams.get('edit')
  const editType = searchParams.get('type')
  
  // 用戶狀態
  const [user, setUser] = useState<{ id: string, username: string, phoneNumber: string, email: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // 資料狀態
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([])
  const [insurancePolicies, setInsurancePolicies] = useState<InsurancePolicy[]>([])
  const [stats, setStats] = useState<StorageStats | null>(null)
  
  // UI 狀態
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedDocumentType, setSelectedDocumentType] = useState<DocumentType | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false)
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null)
  const [editingPolicy, setEditingPolicy] = useState<InsurancePolicy | null>(null)
  const [isClearingData, setIsClearingData] = useState<boolean>(false)
  const [viewingTextContent, setViewingTextContent] = useState<string | null>(null)

  // 輔助函數：生成保單顯示標題
  const getPolicyDisplayTitle = (policy: InsurancePolicy): string => {
    const policyInfo = policy.policyInfo?.policyBasicInfo
    
    // 優先使用AI識別的保單名稱和類型
    if (policyInfo?.policyName && policyInfo.policyName !== '待輸入') {
      if (policyInfo?.policyType && policyInfo.policyType !== '待輸入') {
        return `${policyInfo.policyName} (${policyInfo.policyType})`
      }
      return policyInfo.policyName
    }
    
    // 次選：使用保險公司名稱 + 保險保單
    if (policyInfo?.insuranceCompany && policyInfo.insuranceCompany !== '待輸入') {
      const policyTypeText = policyInfo?.policyType && policyInfo.policyType !== '待輸入' 
        ? policyInfo.policyType 
        : '保險保單'
      return `${policyInfo.insuranceCompany} - ${policyTypeText}`
    }
    
    // 最後選項：使用檔案名稱
    return policy.fileName
  }

  // 輔助函數：生成病歷記錄顯示標題
  const getMedicalRecordDisplayTitle = (record: MedicalRecord): string => {
    const medicalInfo = record.medicalInfo
    
    // 優先使用AI識別的文件標題和醫療主題
    if (medicalInfo?.documentTitle && medicalInfo.documentTitle !== '待輸入') {
      if (medicalInfo?.medicalSubject && medicalInfo.medicalSubject !== '待輸入') {
        return `${medicalInfo.documentTitle} - ${medicalInfo.medicalSubject}`
      }
      return medicalInfo.documentTitle
    }
    
    // 次選：使用文件類型 + 醫療主題
    if (medicalInfo?.documentType && medicalInfo.documentType !== '待輸入') {
      const subjectText = medicalInfo?.medicalSubject && medicalInfo.medicalSubject !== '待輸入' 
        ? ` - ${medicalInfo.medicalSubject}` 
        : ''
      return `${medicalInfo.documentType}${subjectText}`
    }
    
    // 第三選項：使用醫療主題
    if (medicalInfo?.medicalSubject && medicalInfo.medicalSubject !== '待輸入') {
      return `病歷記錄 - ${medicalInfo.medicalSubject}`
    }
    
    // 最後選項：使用檔案名稱
    return record.fileName
  }


  // 檢查用戶登入狀態
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { isLoggedIn, user } = await checkAuth()
        if (isLoggedIn && user) {
          setUser(user)
        }
      } catch (error) {
        console.error('獲取用戶資訊失敗:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchUser()
  }, [])

  // 載入用戶資料
  useEffect(() => {
    if (user?.phoneNumber) {
      loadUserData()
    }
  }, [user])

  const loadUserData = async () => {
    if (!user?.phoneNumber) return

    try {
      // 獲取病歷資料
      const medicalRecordsData = await getUserMedicalRecords(user.phoneNumber)
      if (medicalRecordsData.success) {
        const formattedRecords: MedicalRecord[] = medicalRecordsData.records.map((record: any) => ({
          id: record.id,
          fileName: record.file_name,
          fileType: record.file_type, 
          documentType: record.document_type,
          uploadDate: record.upload_date,
          fileSize: record.file_size,
          textContent: record.text_content,
          imageBase64: record.image_base64,
          notes: record.notes,
          medicalInfo: record.medical_data
        }))
        setMedicalRecords(formattedRecords)
      } else {
        setMedicalRecords([])
      }
      
      // 簡化的統計資訊
      const stats: StorageStats = {
        totalSize: 0,
        fileCount: medicalRecordsData.records?.length || 0,
        medicalRecords: medicalRecordsData.records?.length || 0,
        insurancePolicies: 0
      }
      setStats(stats)
      
      // 暫時留空保單資料，待後續完善
      setInsurancePolicies([])
    } catch (error) {
      console.error('載入用戶資料失敗:', error)
    }
  }
  
  // 獲取用戶病歷資料
  const getUserMedicalRecords = async (phoneNumber: string) => {
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
      
      const records = data[0].medical_records || []
      return { success: true, records }
    } catch (error: any) {
      console.error('取得病歷失敗:', error)
      return { success: false, error: error.message, records: [] }
    }
  }
  
  // 儲存病歷記錄到 Supabase
  const saveMedicalRecordToSupabase = async (record: MedicalRecord) => {
    if (!user?.phoneNumber) throw new Error('用戶未登入')
    
    const { baseUrl, apiKey } = supabaseConfig
    
    // 首先查詢用戶ID
    const userResponse = await fetch(
      `${baseUrl}/users_basic?select=id&phonenumber=eq.${encodeURIComponent(user.phoneNumber)}`,
      {
        method: "GET",
        headers: {
          "apikey": apiKey,
          "Authorization": `Bearer ${apiKey}`,
          "Accept": "application/json",
        }
      }
    )
    
    if (!userResponse.ok) {
      throw new Error('查詢用戶失敗')
    }
    
    const userData = await userResponse.json()
    if (userData.length === 0) {
      throw new Error('找不到用戶記錄')
    }
    
    const userId = userData[0].id
    
    // 插入病歷記錄
    const response = await fetch(`${baseUrl}/medical_records`, {
      method: 'POST',
      headers: {
        'apikey': apiKey,
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        user_id: userId,
        file_name: record.fileName,
        file_type: record.fileType,
        document_type: record.documentType,
        upload_date: record.uploadDate,
        file_size: record.fileSize,
        text_content: record.textContent || '',
        image_base64: record.imageBase64 || '',
        notes: record.notes || 'AI自動分析上傳',
        medical_data: record.medicalInfo || {},
        created_at: new Date().toISOString()
      })
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`保存病歷失敗 (${response.status}): ${errorText}`)
    }
    
    return await response.json()
  }

  // 處理病歷檔案上傳
  const handleMedicalFileUpload = async (fileData: UploadedFile | null) => {
    if (!fileData || !user?.phoneNumber) return

    try {
      setIsAnalyzing(true)
      setUploadSuccess(`正在分析病歷檔案 "${fileData.filename}"...`)
      
      // 使用 OpenAI 分析醫療文件
      let analyzedData = null
      let analysisSucceeded = false
      try {
        const apiKey = localStorage.getItem('openai_api_key') || process.env.NEXT_PUBLIC_OPENAI_API_KEY || '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'
        const openaiService = new OpenAIService(apiKey)
        analyzedData = await openaiService.analyzeMedicalDocument(
          fileData.text || '', 
          fileData.base64
        )
        analysisSucceeded = true
        setUploadSuccess(`正在儲存病歷檔案 "${fileData.filename}"...`)
      } catch (aiError) {
        console.warn('AI 分析失敗，使用預設值:', aiError)
        setUploadSuccess(`AI 分析失敗，正在儲存病歷檔案 "${fileData.filename}"...`)
      }

      // 將 AI 分析結果轉換為擴展的 MedicalRecord 格式
      const record: MedicalRecord = {
        id: generateId(),
        fileName: fileData.filename,
        fileType: fileData.type,
        documentType: analyzedData?.documentType || 'medical',
        uploadDate: new Date().toISOString(),
        fileSize: fileData.size,
        textContent: fileData.text,
        imageBase64: fileData.base64,
        medicalInfo: {
          // 原病歷欄位
          clinicalRecord: analyzedData?.diagnosis || analyzedData?.medicalExam || '',
          admissionRecord: analyzedData?.treatment || '',
          examinationReport: analyzedData?.medicalExam || '',
          medicationRecord: analyzedData?.medication || '',
          hospitalStamp: analyzedData?.hospital || '',
          // 新增診斷證明擴展欄位
          documentTitle: analyzedData?.documentTitle || '',
          certificateType: analyzedData?.certificateType || '',
          medicalSubject: analyzedData?.medicalSubject || '',
          patientName: analyzedData?.patientName || '',
          birthDate: analyzedData?.birthDate || '',
          idNumber: analyzedData?.idNumber || '',
          firstVisitDate: analyzedData?.firstVisitDate || '',
          certificateDate: analyzedData?.certificateDate || '',
          icdCode: analyzedData?.icdCode || '',
          diseaseName: analyzedData?.diseaseName || '',
          treatmentSummary: analyzedData?.treatmentSummary || '',
          restPeriod: analyzedData?.restPeriod || '',
          isAccident: analyzedData?.isAccident || 'unknown'
        }
      }

      // 儲存到 Supabase
      await saveMedicalRecordToSupabase(record)
      await loadUserData()
      
      if (analysisSucceeded) {
        setUploadSuccess(`✅ 病歷檔案 "${fileData.filename}" 上傳並 AI 分析完成！`)
      } else {
        setUploadSuccess(`⚠️ 病歷檔案 "${fileData.filename}" 上傳完成，但 AI 分析失敗`)
      }
      setTimeout(() => setUploadSuccess(null), 5000)
    } catch (error) {
      console.error('上傳病歷檔案失敗:', error)
      const errorMessage = (error as Error).message
      if (errorMessage.includes('API 金鑰')) {
        setUploadError('請先在帳號設定中輸入有效的 OpenAI API 金鑰')
      } else {
        setUploadError('上傳病歷檔案失敗，請稍後再試')
      }
      setTimeout(() => setUploadError(null), 5000)
    } finally {
      setIsAnalyzing(false)
    }
  }

  // 處理保單檔案上傳
  const handlePolicyFileUpload = async (fileData: UploadedFile | null) => {
    if (!fileData || !user?.id) return

    try {
      setIsAnalyzing(true)
      setUploadSuccess(`正在分析保險保單 "${fileData.filename}"...`)
      
      // 使用 OpenAI 分析保單文件
      let analyzedData = null
      let analysisSucceeded = false
      try {
        const apiKey = localStorage.getItem('openai_api_key') || process.env.NEXT_PUBLIC_OPENAI_API_KEY || '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'
        const openaiService = new OpenAIService(apiKey)
        // 兩階段：先摘要，再推理
        const summary = await openaiService.summarizeInsurancePolicy(
          fileData.text || '',
          fileData.base64
        )
        const analysis = await openaiService.analyzePolicyFromSummary({
          policyInfo: summary?.policyInfo || {},
          flatFields: summary?.flatFields || {}
        })
        // 僅將 policyInfo 存入（維持既有結構），其餘結果單獨存放
        analyzedData = summary?.policyInfo || {}
        analysisSucceeded = true
        setUploadSuccess(`正在儲存保險保單 "${fileData.filename}"...`)
      } catch (aiError) {
        console.warn('AI 分析失敗，使用預設值:', aiError)
        setUploadSuccess(`AI 分析失敗，正在儲存保險保單 "${fileData.filename}"...`)
      }

      const policy: InsurancePolicy = {
        id: generateId(),
        fileName: fileData.filename,
        fileType: fileData.type,
        documentType: 'insurance',
        uploadDate: new Date().toISOString(),
        fileSize: fileData.size,
        textContent: fileData.text,
        imageBase64: fileData.base64,
        policyInfo: analyzedData
      }

      // TODO: 實作保單上傳到 Supabase
      console.warn('保單上傳功能待實作')
      await loadUserData()
      
      if (analysisSucceeded) {
        setUploadSuccess(`✅ 保險保單 "${fileData.filename}" 上傳並 AI 分析完成！`)
      } else {
        setUploadSuccess(`⚠️ 保險保單 "${fileData.filename}" 上傳完成，但 AI 分析失敗`)
      }
      setTimeout(() => setUploadSuccess(null), 5000)
    } catch (error) {
      console.error('上傳保單檔案失敗:', error)
      const errorMessage = (error as Error).message
      if (errorMessage.includes('API 金鑰')) {
        setUploadError('請先在帳號設定中輸入有效的 OpenAI API 金鑰')
      } else {
        setUploadError('上傳保單檔案失敗，請稍後再試')
      }
      setTimeout(() => setUploadError(null), 5000)
    } finally {
      setIsAnalyzing(false)
    }
  }


  // 通用檔案上傳處理
  const handleFileUpload = async (fileData: UploadedFile | null, documentType: DocumentType) => {
    if (documentType === 'medical') {
      await handleMedicalFileUpload(fileData)
    } else if (documentType === 'insurance') {
      await handlePolicyFileUpload(fileData)
    }
    setSelectedDocumentType(null) // 上傳完成後重置選擇
  }

  // 刪除病歷記錄
  const handleDeleteMedicalRecord = async (recordId: string) => {
    if (!user?.phoneNumber || !confirm('確定要刪除這筆病歷記錄嗎？')) return

    try {
      // TODO: 實作刪除病歷功能
      console.warn('刪除病歷功能待實作')
      await loadUserData()
    } catch (error) {
      console.error('刪除病歷記錄失敗:', error)
    }
  }

  // 刪除保單記錄
  const handleDeleteInsurancePolicy = async (policyId: string) => {
    if (!user?.phoneNumber || !confirm('確定要刪除這筆保單記錄嗎？')) return

    try {
      // TODO: 實作刪除保單功能
      console.warn('刪除保單功能待實作')
      await loadUserData()
    } catch (error) {
      console.error('刪除保單記錄失敗:', error)
    }
  }


  const handleFileError = (errorMessage: string) => {
    setUploadError(errorMessage)
    setTimeout(() => setUploadError(null), 5000)
  }

  // 清除用戶所有資料
  const handleClearAllData = async () => {
    if (!user?.phoneNumber) return
    
    const confirmed = confirm(
      '⚠️ 危險操作：這將永久刪除您的所有資料，包括：\n\n' +
      `• ${medicalRecords.length} 筆病歷記錄\n` +
      `• ${insurancePolicies.length} 筆保險保單\n` +
      '• 所有 AI 分析結果\n' +
      '• 個人設定\n\n' +
      '此操作無法復原，確定要繼續嗎？'
    )
    
    if (!confirmed) return
    
    const doubleConfirm = confirm('最後確認：真的要刪除所有資料嗎？請輸入確認後點選確定。')
    if (!doubleConfirm) return
    
    try {
      setIsClearingData(true)
      // TODO: 實作清空資料功能
      console.warn('清空資料功能待實作')
      await loadUserData() // 重新載入空的資料
      setUploadSuccess('✅ 所有資料已成功清除')
      setTimeout(() => setUploadSuccess(null), 3000)
    } catch (error) {
      console.error('清除資料失敗:', error)
      setUploadError('清除資料失敗，請稍後再試')
      setTimeout(() => setUploadError(null), 5000)
    } finally {
      setIsClearingData(false)
    }
  }

  // 儲存編輯的病歷資料
  const handleSaveMedicalRecord = async (recordId: string, updatedData: any) => {
    if (!user?.phoneNumber) return
    
    try {
      const record = medicalRecords.find(r => r.id === recordId)
      if (record) {
        const updatedRecord = { ...record, medicalInfo: updatedData }
        // TODO: 實作編輯病歷功能
        console.warn('編輯病歷功能待實作')
        await loadUserData()
        setEditingRecord(null)
      }
    } catch (error) {
      console.error('儲存病歷資料失敗:', error)
    }
  }


  // 儲存編輯的保單資料
  const handleSaveInsurancePolicy = async (policyId: string, updatedData: any) => {
    if (!user?.phoneNumber) return
    
    try {
      const policy = insurancePolicies.find(p => p.id === policyId)
      if (policy) {
        const updatedPolicy = { ...policy, policyInfo: updatedData }
        // TODO: 實作編輯保單功能
        console.warn('編輯保單功能待實作')
        await loadUserData()
        setEditingPolicy(null)
      }
    } catch (error) {
      console.error('儲存保單資料失敗:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">載入中...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container py-8">
        <Alert className="max-w-md mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>需要登入</AlertTitle>
          <AlertDescription>
            請先登入以查看您的資料。
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">我的資料管理</h1>
          <p className="text-gray-500 mt-1">管理您的病歷記錄和保險保單</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">{user.username}</Badge>
            <Badge variant="secondary" className="text-xs">
              儲存空間: {stats ? formatFileSize(stats.totalStorageUsed) : '計算中...'}
            </Badge>
          </div>
        </div>
        <Button onClick={loadUserData} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          重新整理
        </Button>
      </div>

      {/* 成功/錯誤訊息 */}
      {uploadSuccess && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">上傳成功</AlertTitle>
          <AlertDescription className="text-green-700">{uploadSuccess}</AlertDescription>
        </Alert>
      )}

      {uploadError && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-red-800">上傳錯誤</AlertTitle>
          <AlertDescription className="text-red-700">{uploadError}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-8">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            總覽
          </TabsTrigger>
          <TabsTrigger value="medical" className="gap-2">
            <FileText className="h-4 w-4" />
            醫療文件 ({medicalRecords.length})
          </TabsTrigger>
          <TabsTrigger value="insurance" className="gap-2">
            <Shield className="h-4 w-4" />
            保險保單 ({insurancePolicies.length})
          </TabsTrigger>
          <TabsTrigger value="upload" className="gap-2">
            <Upload className="h-4 w-4" />
            上傳檔案
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-medium">病歷記錄</p>
                    <p className="text-2xl font-bold text-blue-900">{stats?.medicalRecords || 0}</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium">保險保單</p>
                    <p className="text-2xl font-bold text-green-900">{stats?.insurancePolicies || 0}</p>
                  </div>
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>


            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 text-sm font-medium">AI分析記錄</p>
                    <p className="text-2xl font-bold text-purple-900">{stats?.analysisResults || 0}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-50 border-gray-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">儲存使用量</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats ? formatFileSize(stats.totalStorageUsed) : '--'}
                    </p>
                  </div>
                  <Settings className="h-8 w-8 text-gray-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  最近的病歷記錄
                </CardTitle>
              </CardHeader>
              <CardContent>
                {medicalRecords.slice(0, 3).map((record) => (
                  <div key={record.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                    <div className="flex items-center gap-3">
                      {record.fileType === 'pdf' ? (
                        <FileText className="h-4 w-4 text-red-500" />
                      ) : (
                        <FileImage className="h-4 w-4 text-blue-500" />
                      )}
                      <div>
                        <p className="font-medium text-sm">{getMedicalRecordDisplayTitle(record)}</p>
                        <p className="text-xs text-gray-500">{formatDate(record.uploadDate)}</p>
                        {record.fileName !== getMedicalRecordDisplayTitle(record) && (
                          <p className="text-xs text-gray-400">檔案：{record.fileName}</p>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {formatFileSize(record.fileSize)}
                    </Badge>
                  </div>
                ))}
                {medicalRecords.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-4">尚未上傳病歷記錄</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  最近的保險保單
                </CardTitle>
              </CardHeader>
              <CardContent>
                {insurancePolicies.slice(0, 3).map((policy) => (
                  <div key={policy.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                    <div className="flex items-center gap-3">
                      {policy.fileType === 'pdf' ? (
                        <FileText className="h-4 w-4 text-red-500" />
                      ) : (
                        <FileImage className="h-4 w-4 text-blue-500" />
                      )}
                      <div>
                        <p className="font-medium text-sm">{getPolicyDisplayTitle(policy)}</p>
                        <p className="text-xs text-gray-500">{formatDate(policy.uploadDate)}</p>
                        {policy.fileName !== getPolicyDisplayTitle(policy) && (
                          <p className="text-xs text-gray-400">檔案：{policy.fileName}</p>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {formatFileSize(policy.fileSize)}
                    </Badge>
                  </div>
                ))}
                {insurancePolicies.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-4">尚未上傳保險保單</p>
                )}
              </CardContent>
            </Card>

          </div>

          {/* 危險區域 */}
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-5 w-5 text-red-600" />
                危險區域
              </CardTitle>
              <CardDescription className="text-red-700">
                以下操作將永久刪除資料，無法復原，請謹慎操作
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                onClick={handleClearAllData}
                disabled={isClearingData}
                className="gap-2"
              >
                {isClearingData ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    清除中...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    清除所有資料
                  </>
                )}
              </Button>
              <p className="text-xs text-red-600 mt-2">
                這將刪除您的所有病歷記錄、保險保單、診斷證明、AI分析結果和個人設定
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medical" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">醫療文件</h2>
            <Button onClick={() => setActiveTab("upload")} className="gap-2">
              <Upload className="h-4 w-4" />
              上傳新檔案
            </Button>
          </div>

          {medicalRecords.map((record) => (
            <Card key={record.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-blue-50">
                      {record.fileType === 'pdf' ? (
                        <FileText className="h-6 w-6 text-red-500" />
                      ) : (
                        <FileImage className="h-6 w-6 text-blue-500" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold">{getMedicalRecordDisplayTitle(record)}</h3>
                      {record.fileName !== getMedicalRecordDisplayTitle(record) && (
                        <p className="text-xs text-gray-400 mt-0.5">檔案：{record.fileName}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(record.uploadDate)}
                        </span>
                        <span>{formatFileSize(record.fileSize)}</span>
                        <Badge variant="outline" className="text-xs">
                          {record.fileType.toUpperCase()}
                        </Badge>
                      </div>
                      {record.notes && (
                        <p className="text-sm text-gray-600 mt-2">{record.notes}</p>
                      )}
                      {record.textContent && (
                        <div className="mt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setViewingTextContent(record.textContent || '')}
                            className="text-xs gap-1"
                          >
                            <FileText className="h-3 w-3" />
                            查看原始掃描內容
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingRecord(record)}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteMedicalRecord(record.id)}
                      className="text-red-600 hover:text-red-700 hover:border-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {medicalRecords.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">尚未上傳醫療文件</h3>
                <p className="text-gray-500 mb-4">上傳您的病歷、診斷證明等醫療文件，讓 AI 幫您分析可申請的資源</p>
                <Button onClick={() => setActiveTab("upload")} className="gap-2">
                  <Upload className="h-4 w-4" />
                  上傳醫療文件
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="insurance" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">保險保單</h2>
            <Button onClick={() => setActiveTab("upload")} className="gap-2">
              <Upload className="h-4 w-4" />
              上傳新檔案
            </Button>
          </div>

          {insurancePolicies.map((policy) => (
            <Card key={policy.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-green-50">
                      {policy.fileType === 'pdf' ? (
                        <FileText className="h-6 w-6 text-red-500" />
                      ) : (
                        <FileImage className="h-6 w-6 text-blue-500" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold">{getPolicyDisplayTitle(policy)}</h3>
                      {policy.fileName !== getPolicyDisplayTitle(policy) && (
                        <p className="text-xs text-gray-400 mt-0.5">檔案：{policy.fileName}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(policy.uploadDate)}
                        </span>
                        <span>{formatFileSize(policy.fileSize)}</span>
                        <Badge variant="outline" className="text-xs">
                          {policy.fileType.toUpperCase()}
                        </Badge>
                      </div>
                      {policy.policyInfo && (
                        <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                          {policy.policyInfo.policyBasicInfo?.policyName && policy.policyInfo.policyBasicInfo.policyName !== '待輸入' && (
                            <div>
                              <span className="text-gray-500">保單名稱: </span>
                              <span className="font-medium">{policy.policyInfo.policyBasicInfo.policyName}</span>
                            </div>
                          )}
                          {policy.policyInfo.policyBasicInfo?.policyType && policy.policyInfo.policyBasicInfo.policyType !== '待輸入' && (
                            <div>
                              <span className="text-gray-500">保險類型: </span>
                              <span className="font-medium">{policy.policyInfo.policyBasicInfo.policyType}</span>
                            </div>
                          )}
                          {policy.policyInfo.policyBasicInfo?.insuranceCompany && policy.policyInfo.policyBasicInfo.insuranceCompany !== '待輸入' && (
                            <div>
                              <span className="text-gray-500">保險公司: </span>
                              <span className="font-medium">{policy.policyInfo.policyBasicInfo.insuranceCompany}</span>
                            </div>
                          )}
                          {policy.policyInfo.policyBasicInfo?.policyNumber && policy.policyInfo.policyBasicInfo.policyNumber !== '待輸入' && (
                            <div>
                              <span className="text-gray-500">保單號碼: </span>
                              <span className="font-medium">{policy.policyInfo.policyBasicInfo.policyNumber}</span>
                            </div>
                          )}
                          {policy.policyInfo.policyBasicInfo?.effectiveDate && policy.policyInfo.policyBasicInfo.effectiveDate !== '待輸入' && (
                            <div>
                              <span className="text-gray-500">生效日期: </span>
                              <span className="font-medium">{policy.policyInfo.policyBasicInfo.effectiveDate}</span>
                            </div>
                          )}
                          {policy.policyInfo.insuranceContentAndFees?.insuranceAmount && policy.policyInfo.insuranceContentAndFees.insuranceAmount !== '待輸入' && (
                            <div>
                              <span className="text-gray-500">保險金額: </span>
                              <span className="font-medium">{policy.policyInfo.insuranceContentAndFees.insuranceAmount}</span>
                            </div>
                          )}
                        </div>
                      )}
                      {policy.notes && (
                        <p className="text-sm text-gray-600 mt-2">{policy.notes}</p>
                      )}
                      {policy.textContent && (
                        <div className="mt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setViewingTextContent(policy.textContent || '')}
                            className="text-xs gap-1"
                          >
                            <FileText className="h-3 w-3" />
                            查看原始掃描內容
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingPolicy(policy)}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteInsurancePolicy(policy.id)}
                      className="text-red-600 hover:text-red-700 hover:border-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {insurancePolicies.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">尚未上傳保險保單</h3>
                <p className="text-gray-500 mb-4">上傳您的保單檔案，獲得更精確的理賠分析</p>
                <Button onClick={() => setActiveTab("upload")} className="gap-2">
                  <Upload className="h-4 w-4" />
                  上傳第一筆保單
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>


        <TabsContent value="upload" className="space-y-6">
          {!selectedDocumentType ? (
            // 第1步：選擇文件類型
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">選擇文件類型</h2>
                <p className="text-gray-500">請選擇您要上傳的文件類型</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                <Card 
                  className="cursor-pointer transition-all hover:border-blue-500 hover:shadow-md"
                  onClick={() => setSelectedDocumentType('medical')}
                >
                  <CardContent className="pt-8 pb-6 text-center">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">醫療文件</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      上傳病歷、診斷證明、檢查報告、醫師診療紀錄等所有醫療文件
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm text-blue-600">
                      <span>選擇上傳</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className="cursor-pointer transition-all hover:border-green-500 hover:shadow-md"
                  onClick={() => setSelectedDocumentType('insurance')}
                >
                  <CardContent className="pt-8 pb-6 text-center">
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Shield className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">保險保單</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      上傳保險保單、保障條款、保險證書等文件
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm text-green-600">
                      <span>選擇上傳</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </CardContent>
                </Card>

              </div>
            </div>
          ) : (
            // 第2步：上傳選定類型的文件
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedDocumentType(null)}
                  className="gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  返回選擇
                </Button>
                <div className="h-4 w-px bg-gray-300" />
                <h2 className="text-xl font-bold">
                  上傳{selectedDocumentType === 'medical' ? '病歷記錄' : 
                       selectedDocumentType === 'insurance' ? '保險保單' : '診斷證明'}
                </h2>
              </div>

              <Card className="max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {selectedDocumentType === 'medical' ? (
                      <><FileText className="h-5 w-5 text-blue-600" />病歷記錄上傳</>
                    ) : selectedDocumentType === 'insurance' ? (
                      <><Shield className="h-5 w-5 text-green-600" />保險保單上傳</>
                    ) : (
                      <><CheckCircle2 className="h-5 w-5 text-orange-600" />診斷證明上傳</>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {selectedDocumentType === 'medical' ? 
                      '請上傳您的病歷、檢查報告、診斷書等醫療文件' :
                     selectedDocumentType === 'insurance' ?
                      '請上傳您的保險保單、保障條款等相關文件' :
                      '請上傳醫師開立的診斷證明書、病假證明等文件'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isAnalyzing ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                      <div className="flex items-center space-x-2">
                        <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
                        <span className="text-lg font-medium text-blue-600">AI 分析處理中...</span>
                      </div>
                      <p className="text-sm text-gray-500 text-center max-w-md">
                        正在使用 OpenAI 分析您的文件內容，這可能需要幾秒鐘時間，請耐心等候。
                      </p>
                    </div>
                  ) : (
                    <UploadZone 
                      onFileProcessed={(fileData) => handleFileUpload(fileData, selectedDocumentType)}
                      onError={handleFileError}
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>資料安全說明</AlertTitle>
            <AlertDescription>
              您的醫療資料將安全地儲存在您的瀏覽器中，我們不會上傳到任何伺服器。
              請定期備份重要資料，清除瀏覽器資料時會一併刪除這些檔案。
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>

      {/* 編輯模態視窗 */}
      {editingRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4">
              <h2 className="text-lg font-semibold">編輯病歷資料</h2>
            </div>
            <div className="p-6">
              <MedicalDataEditor
                record={editingRecord}
                onSave={(data) => handleSaveMedicalRecord(editingRecord.id, data)}
                onCancel={() => setEditingRecord(null)}
              />
            </div>
          </div>
        </div>
      )}


      {editingPolicy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4">
              <h2 className="text-lg font-semibold">編輯保單資料</h2>
            </div>
            <div className="p-6">
              <MedicalDataEditor
                policy={editingPolicy}
                onSave={(data) => handleSaveInsurancePolicy(editingPolicy.id, data)}
                onCancel={() => setEditingPolicy(null)}
              />
            </div>
          </div>
        </div>
      )}

      {/* 查看原始掃描內容模態視窗 */}
      {viewingTextContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">原始掃描內容</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewingTextContent(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-6">
              <div className="bg-gray-50 rounded-lg p-4 max-h-[60vh] overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed text-gray-800">
                  {viewingTextContent}
                </pre>
              </div>
              <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
                <span>共 {viewingTextContent.length} 個字元</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(viewingTextContent)
                    alert('已複製到剪貼簿')
                  }}
                  className="gap-2"
                >
                  <FileText className="h-3 w-3" />
                  複製內容
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}