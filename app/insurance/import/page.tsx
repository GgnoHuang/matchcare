"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Upload, FileText, CheckCircle2, Info, Calendar, Plus, Trash2, Check, Loader2, AlertCircle } from 'lucide-react'
import { OpenAIService } from '@/lib/openaiService'
import UploadZone, { UploadedFile } from "@/components/ui/upload-zone"
import { checkAuth } from "@/app/actions/auth-service"
import { supabaseConfig } from "@/lib/supabase"

// 生成唯一ID的輔助函數
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export default function InsuranceImportPage() {
  const router = useRouter()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<{ id: string, username: string, phoneNumber: string, email: string } | null>(null)
  const [pdfText, setPdfText] = useState<string>('')
  const [isTestingStage1, setIsTestingStage1] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // 批次上傳狀態
  const [allAnalysisResults, setAllAnalysisResults] = useState<any[]>([])
  
  // Manual input form state
  const [formData, setFormData] = useState({
    company: "",
    type: "",
    name: "",
    number: "",
    startDate: "",
    endDate: "",
    insuredName: "",
    beneficiary: ""
  })

  const [coverageItems, setCoverageItems] = useState([
    { name: "", amount: "", unit: "元" }
  ])

  // 檢查用戶登入狀態
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { isLoggedIn, user: authUser } = await checkAuth()
        if (isLoggedIn && authUser) {
          setUser(authUser)
        } else {
          console.log('用戶未登入')
          // 設置預設用戶以防止錯誤
          setUser({ id: "guest", username: "訪客用戶", phoneNumber: "0000000000", email: "guest@example.com" })
        }
      } catch (error) {
        console.error('獲取用戶資訊失敗:', error)
        // 設置預設用戶以防止錯誤
        setUser({ id: "user1", username: "王小明", phoneNumber: "0912345678", email: "user1@example.com" })
      }
    }
    fetchUser()
  }, [])

  // 測試第一階段 prompt 的獨立函數
  const testStage1Only = async () => {
    if (!pdfText) {
      console.log('沒有可用的PDF文字資料')
      return
    }

    setIsTestingStage1(true)
    try {
      const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY
      const openaiService = new OpenAIService(apiKey)
      console.log('🧪 獨立測試第一階段 prompt...')
      console.log('🧪 使用的PDF文字長度:', pdfText.length)
      const testResult = await openaiService.testPromptStage(pdfText)
      console.log('🧪 獨立測試結果:', testResult)
    } catch (error) {
      console.error('🧪 獨立測試失敗:', error)
    } finally {
      setIsTestingStage1(false)
    }
  }


  const handleFileUpload = async (fileData: UploadedFile | null) => {
    if (!fileData) return
    
    setIsProcessing(true)
    setError(null)
    setPdfText(fileData.text || '')
    
    try {
      console.log('開始分析保單文件:', fileData.filename)
      
      const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY
      const openaiService = new OpenAIService(apiKey)
      console.log('開始 AI 分析（三階段）...')
      
      // 第一階段：簡單測試 prompt
      const testResult = await openaiService.testPromptStage(
         fileData.text || ''
      )
      console.log('第一階段測試完成:', testResult)
      
      // 第二階段：結構化萃取摘要（policyInfo + flatFields）
      // 只有圖片檔案才傳遞 base64，PDF 檔案不傳遞以避免格式錯誤
      const summary = await openaiService.summarizeInsurancePolicy(
        fileData.text || '',
        fileData.type === 'image' ? fileData.base64 : null
      )
      console.log('AI 摘要結果:', summary)

      // 第三階段：基於摘要推理（最高理賠等）
      const analysis = await openaiService.analyzePolicyFromSummary({
        policyInfo: summary?.policyInfo || {},
        flatFields: summary?.flatFields || {}
      })
      console.log('AI 推理結果:', analysis)

      const result = { 
        ...summary, 
        analysisResult: analysis,
        claimConditions: testResult // 保存第一階段的理賠條件列點
      }
      console.log('AI 分析整合結果:', result)
      
      setAnalysisResult(result)
      // 添加到批次列表
      setAllAnalysisResults(prev => [...prev, result])
      setIsComplete(true)
    } catch (error) {
      console.error('Error analyzing policy:', error)
      const errorMessage = error instanceof Error ? error.message : 'AI 分析失敗，請稍後再試或使用手動輸入'
      setError(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleFileError = (errorMessage: string) => {
    setError(errorMessage)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCoverageChange = (index: number, field: string, value: string) => {
    setCoverageItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ))
  }

  const addCoverageItem = () => {
    setCoverageItems(prev => [...prev, { name: "", amount: "", unit: "元" }])
  }

  const removeCoverageItem = (index: number) => {
    setCoverageItems(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!user?.phoneNumber) {
      setError('請先登入')
      return
    }

    try {
      // 首先取得用戶ID  
      const { baseUrl, apiKey } = supabaseConfig
      
      // 查詢用戶ID
      console.log('🔍 手動輸入-查詢用戶電話:', user.phoneNumber)
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
        const errorText = await userResponse.text()
        console.error('❌ 手動輸入-查詢用戶API失敗:', userResponse.status, errorText)
        throw new Error(`查詢用戶失敗: ${userResponse.status}`)
      }
      
      const userData = await userResponse.json()
      console.log('📋 手動輸入-查詢到的用戶資料:', userData)
      
      let userId
      if (userData.length === 0) {
        console.warn('⚠️ 手動輸入-用戶資料庫中找不到電話號碼:', user.phoneNumber)
        // 對於測試用戶，使用固定ID或跳過檢查
        if (user.phoneNumber === "0000000000" || user.phoneNumber === "0912345678") {
          console.log('🧪 手動輸入-使用測試用戶，使用固定ID')
          userId = "test-user-id"
        } else {
          throw new Error(`找不到電話號碼為 ${user.phoneNumber} 的用戶記錄，請確認登入狀態`)
        }
      } else {
        userId = userData[0].id
        console.log('✅ 手動輸入-取得用戶ID:', userId)
      }
      
      const response = await fetch(`${baseUrl}/insurance_policies`, {
        method: 'POST',
        headers: {
          'apikey': apiKey,
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          user_id: userId,
          file_name: 'manual_input.pdf',
          file_type: 'manual',
          document_type: 'insurance',
          upload_date: new Date().toISOString(),
          file_size: 0,
          text_content: '',
          image_base64: '',
          notes: '手動輸入',
          
          // 基本保單資訊
          policy_basic_insurance_company: formData.company,
          policy_basic_policy_number: formData.number,
          policy_basic_effective_date: formData.startDate || null,
          // 保障範圍 - 同時儲存 JSONB 和字串格式
          coverage_items: coverageItems
            .filter(item => item.name && item.amount)
            .map(item => ({
              name: item.name,
              amount: item.amount,
              unit: item.unit
            })),
          policy_basic_policy_terms: coverageItems
            .filter(item => item.name && item.amount)
            .map(item => `${item.name} ${item.amount}${item.unit}`)
            .join(', '),
          policy_basic_insurance_period: formData.startDate && formData.endDate 
            ? `${formData.startDate} 至 ${formData.endDate}` 
            : '',
          
          // 被保險人資訊
          insured_name: formData.insuredName,
          
          // 受益人資訊
          beneficiary_name: formData.beneficiary,
          
          created_at: new Date().toISOString()
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`保存失敗 (${response.status}): ${errorText}`)
      }

      const result = await response.json()
      console.log('手動保單保存成功:', result)
      
      // 成功保存後重定向到保單頁面
      router.push('/insurance')
    } catch (error) {
      console.error('Error saving policy:', error)
      const errorMessage = error instanceof Error ? error.message : '保存失敗，請稍後再試'
      setError(errorMessage)
    }
  }
  
  const handleAutoNext = async () => {
    if (allAnalysisResults.length === 0 || !user?.phoneNumber) {
      console.error('handleAutoNext 失敗:', { allAnalysisResults, user })
      setError('請先登入或重新分析')
      return
    }
    
    setIsSaving(true)
    try {
      // 批次儲存所有保單記錄到 Supabase
      for (let i = 0; i < allAnalysisResults.length; i++) {
        await saveInsurancePolicyToSupabase(allAnalysisResults[i])
      }
      setIsSaved(true)
    } catch (error) {
      console.error('Error saving insurance policies:', error)
      const errorMessage = error instanceof Error ? error.message : '保存失敗，請稍後再試'
      setError(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }
  
  // 保存單個保單到 Supabase 的函數
  const saveInsurancePolicyToSupabase = async (analysisResult: any) => {
    if (!user?.phoneNumber) throw new Error('用戶未登入')
    
    try {
      // 首先取得用戶ID
      const { baseUrl, apiKey } = supabaseConfig
      
      // 查詢用戶ID
      console.log('🔍 查詢用戶電話:', user.phoneNumber)
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
        const errorText = await userResponse.text()
        console.error('❌ 查詢用戶API失敗:', userResponse.status, errorText)
        throw new Error(`查詢用戶失敗: ${userResponse.status}`)
      }
      
      const userData = await userResponse.json()
      console.log('📋 查詢到的用戶資料:', userData)
      
      let userId
      if (userData.length === 0) {
        console.warn('⚠️ 用戶資料庫中找不到電話號碼:', user.phoneNumber)
        // 對於測試用戶，使用固定ID或跳過檢查
        if (user.phoneNumber === "0000000000" || user.phoneNumber === "0912345678") {
          console.log('🧪 使用測試用戶，使用固定ID')
          userId = "test-user-id"
        } else {
          throw new Error(`找不到電話號碼為 ${user.phoneNumber} 的用戶記錄，請確認登入狀態`)
        }
      } else {
        userId = userData[0].id
        console.log('✅ 取得用戶ID:', userId)
      }
      
      const response = await fetch(`${baseUrl}/insurance_policies`, {
        method: 'POST',
        headers: {
          'apikey': apiKey,
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          user_id: userId,
          file_name: 'ai_analyzed_policy.pdf',
          file_type: 'pdf',
          document_type: 'insurance',
          upload_date: new Date().toISOString(),
          file_size: 0,
          text_content: analysisResult.claimConditions || '', // 第一階段的理賠條件列點
          image_base64: '',
          notes: 'AI自動分析上傳',
          
          // 提取AI分析結果
          policy_basic_insurance_company: analysisResult.flatFields?.company || analysisResult.policyInfo?.policyBasicInfo?.insuranceCompany || '',
          policy_basic_policy_number: analysisResult.flatFields?.number || analysisResult.policyInfo?.policyBasicInfo?.policyNumber || '',
          policy_basic_effective_date: (analysisResult.flatFields?.startDate || analysisResult.policyInfo?.policyBasicInfo?.effectiveDate) || null,
          
          // 處理保障範圍 - 同時儲存 JSONB 和字串格式
          coverage_items: (() => {
            const coverage = analysisResult.flatFields?.coverage || analysisResult.policyInfo?.coverageDetails?.coverage || []
            return Array.isArray(coverage) ? coverage : []
          })(),
          policy_basic_policy_terms: (() => {
            const coverage = analysisResult.flatFields?.coverage || analysisResult.policyInfo?.coverageDetails?.coverage || []
            if (Array.isArray(coverage) && coverage.length > 0) {
              // 轉換為字串格式：項目名稱 金額單位
              return coverage
                .filter(item => item.name && item.amount)
                .map(item => `${item.name} ${item.amount}${item.unit || ''}`)
                .join(', ')
            }
            // 如果沒有 coverage 陣列，使用原本的 policyTerms
            return analysisResult.policyInfo?.policyBasicInfo?.policyTerms || ''
          })(),
          policy_basic_insurance_period: (() => {
            const startDate = analysisResult.flatFields?.startDate || analysisResult.policyInfo?.policyBasicInfo?.effectiveDate || ''
            const endDate = analysisResult.flatFields?.endDate || analysisResult.policyInfo?.policyBasicInfo?.expiryDate || ''
            return startDate && endDate ? `${startDate} 至 ${endDate}` : ''
          })(),
          
          // 被保險人資訊
          insured_name: analysisResult.flatFields?.insuredName || analysisResult.policyInfo?.insuredPersonInfo?.name || '',
          // 受益人資訊
          beneficiary_name: analysisResult.flatFields?.beneficiary || analysisResult.policyInfo?.beneficiaryInfo?.name || '',
          created_at: new Date().toISOString()
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`保存失敗 (${response.status}): ${errorText}`)
      }

      const result = await response.json()
      console.log('AI分析保單保存成功:', result)
      
      return result
    } catch (error) {
      console.error('Error saving analysis result:', error)
      throw error
    }
  }

  // 成功保存頁面
  if (isSaved) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              返回保單總覽
            </Button>
          </div>

          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-600">儲存成功</CardTitle>
              <CardDescription>已成功儲存 {allAnalysisResults.length} 筆保險保單至系統</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-3">已儲存的保險保單</h3>
                <div className="space-y-2 text-sm">
                  {allAnalysisResults.map((result, index) => (
                    <div key={index} className="mb-4 last:mb-0">
                      <div className="font-medium text-gray-700 mb-2">第 {index + 1} 筆保單：</div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">保險公司：</span>
                        <span>{result.flatFields?.company || result.policyInfo?.policyBasicInfo?.insuranceCompany || '未識別'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">保單名稱：</span>
                        <span>{result.flatFields?.name || result.policyInfo?.policyBasicInfo?.policyName || '未識別'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">保單號碼：</span>
                        <span>{result.flatFields?.number || result.policyInfo?.policyBasicInfo?.policyNumber || '未識別'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">保障期間：</span>
                        <span>{result.flatFields?.startDate || result.policyInfo?.policyBasicInfo?.effectiveDate || '未識別'} 至 {result.flatFields?.endDate || result.policyInfo?.policyBasicInfo?.expiryDate || '未識別'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => router.back()} className="flex-1 bg-transparent">
                  取消
                </Button>
                <Button onClick={() => router.push('/insurance')} className="flex-1 bg-teal-600 hover:bg-teal-700">
                  返回保單總覽
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex items-center mb-8">
        <Link href="/insurance">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            返回保單總覽
          </Button>
        </Link>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">添加保單</h1>
          <p className="text-gray-500">手動添加或上傳您的保險保單資料</p>
        </div>

        <Tabs defaultValue="auto" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="auto">自動辨識</TabsTrigger>
            <TabsTrigger value="manual">手動輸入</TabsTrigger>
          </TabsList>

          <TabsContent value="auto" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">自動辨識保單</CardTitle>
                <CardDescription>
                  上傳保單文件進行自動辨識解析，系統將自動提取保單資訊內容
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Notice Section */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-blue-900 mb-2">注意事項</h4>
                      <p className="text-sm text-blue-800 mb-2">上傳文件時，請注意以下事項：</p>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• 檔案格式支援 JPG、PNG、GIF、WebP</li>
                        <li>• 檔案大小請勿超過10MB</li>
                        <li>• 上傳檔案請確保內容清晰，文字部分可辨識</li>
                        <li>• 系統將根據您上傳的文件，自動分析保單內容</li>
                        <li>• 自動辨識結果可能不完全準確，請檢查後再提交</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-red-900 mb-2">錯誤</h4>
                        <p className="text-sm text-red-800">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {!isComplete && (
                  <div>
                    {isProcessing ? (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
                        <p className="text-gray-500 mt-2">AI 分析處理中...</p>
                      </div>
                    ) : (
                      <UploadZone 
                        onFileProcessed={handleFileUpload}
                        onError={handleFileError}
                      />
                    )}
                  </div>
                )}

                {/* 顯示所有已分析的保單 */}
                {allAnalysisResults.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="font-medium">已解讀 {allAnalysisResults.length} 筆保單</span>
                    </div>

                    {/* 顯示每一筆分析結果 */}
                    <div className="space-y-3">
                      {allAnalysisResults.map((result, index) => (
                        <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <h4 className="font-medium text-green-900 mb-2">第 {index + 1} 筆保單：</h4>
                              <ul className="text-sm text-green-800 space-y-1 mb-4">
                                <li>• 保險公司：{result.flatFields?.company || result.policyInfo?.policyBasicInfo?.insuranceCompany || '未識別'}</li>
                                <li>• 保單名稱：{result.flatFields?.name || result.policyInfo?.policyBasicInfo?.policyName || '未識別'}</li>
                                <li>• 保單號碼：{result.flatFields?.number || result.policyInfo?.policyBasicInfo?.policyNumber || '未識別'}</li>
                                <li>• 保障期間：{result.flatFields?.startDate || result.policyInfo?.policyBasicInfo?.effectiveDate || '未識別'} 至 {result.flatFields?.endDate || result.policyInfo?.policyBasicInfo?.expiryDate || '未識別'}</li>
                              </ul>
                              {index === allAnalysisResults.length - 1 && (
                                <p className="text-sm text-green-700">
                                  辨識結果「不一定」是百分百正確。
                                </p>
                              )}
                            </div>
                          </div>
                          
                          {/* 測試按鈕只在最新的保單顯示 */}
                          {index === allAnalysisResults.length - 1 && (
                            <div className="mt-4 pt-4 border-t border-green-200">
                              <Button
                                onClick={testStage1Only}
                                disabled={isTestingStage1 || !pdfText}
                                variant="outline"
                                className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                              >
                                {isTestingStage1 ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                                    測試中...
                                  </>
                                ) : (
                                  '🧪 測試第一階段 Prompt'
                                )}
                              </Button>
                              <p className="text-xs text-blue-600 mt-1">
                                點擊測試第一階段 AI prompt，結果會在 Console 顯示
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* 繼續上傳提示 */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800 mb-2">
                        💡 您可以繼續上傳更多保單，完成後一次性儲存
                      </p>
                      <Button
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setIsComplete(false)
                          setAnalysisResult(null)
                          setIsProcessing(false)
                          setError(null)
                        }}
                        className="text-blue-600 border-blue-300 hover:bg-blue-100"
                      >
                        繼續上傳
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => {
                    setIsComplete(false)
                    setIsProcessing(false)
                    setAnalysisResult(null)
                    setAllAnalysisResults([])
                    setError(null)
                  }}>
                    取消
                  </Button>
                  {allAnalysisResults.length > 0 && (
                    <Button 
                      onClick={handleAutoNext} 
                      disabled={isSaving}
                      className="bg-teal-600 hover:bg-teal-700"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          儲存中...
                        </>
                      ) : (
                        `儲存 (${allAnalysisResults.length}筆保單)`
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manual" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">手動添加保單</CardTitle>
                <CardDescription>
                  請填寫您的保險保單資訊
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">基本資訊</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="company" className="text-sm font-medium mb-2 block">
                        保險公司
                      </Label>
                      <Select value={formData.company} onValueChange={(value) => handleInputChange("company", value)}>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="選擇保險公司" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cathay">國泰人壽</SelectItem>
                          <SelectItem value="fubon">富邦人壽</SelectItem>
                          <SelectItem value="shin-kong">新光人壽</SelectItem>
                          <SelectItem value="nan-shan">南山人壽</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="type" className="text-sm font-medium mb-2 block">
                        保單類型
                      </Label>
                      <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="選擇保單類型" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="medical">醫療險</SelectItem>
                          <SelectItem value="life">壽險</SelectItem>
                          <SelectItem value="accident">意外險</SelectItem>
                          <SelectItem value="cancer">癌症險</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="name" className="text-sm font-medium mb-2 block">
                        保單名稱
                      </Label>
                      <Input
                        id="name"
                        placeholder="例：安心醫療保險"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        className="h-11"
                      />
                    </div>

                    <div>
                      <Label htmlFor="number" className="text-sm font-medium mb-2 block">
                        保單號碼
                      </Label>
                      <Input
                        id="number"
                        placeholder="例：CT-MED-123456"
                        value={formData.number}
                        onChange={(e) => handleInputChange("number", e.target.value)}
                        className="h-11"
                      />
                    </div>

                    <div>
                      <Label htmlFor="startDate" className="text-sm font-medium mb-2 block">
                        保障開始日期
                      </Label>
                      <div className="relative">
                        <Input
                          id="startDate"
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => handleInputChange("startDate", e.target.value)}
                          className="h-11"
                        />
                        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="endDate" className="text-sm font-medium mb-2 block">
                        保障結束日期
                      </Label>
                      <div className="relative">
                        <Input
                          id="endDate"
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => handleInputChange("endDate", e.target.value)}
                          className="h-11"
                        />
                        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Coverage Range */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">保障範圍</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-12 gap-4 p-3 bg-gray-50 rounded-lg font-medium text-sm">
                      <div className="col-span-5">項目名稱</div>
                      <div className="col-span-4">金額</div>
                      <div className="col-span-2">單位</div>
                      <div className="col-span-1"></div>
                    </div>
                    {coverageItems.map((item, index) => (
                      <div key={index} className="grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-5">
                          <Input
                            placeholder="例：住院醫療"
                            value={item.name}
                            onChange={(e) => handleCoverageChange(index, "name", e.target.value)}
                            className="h-11"
                          />
                        </div>
                        <div className="col-span-4">
                          <Input
                            placeholder="例：3000"
                            value={item.amount}
                            onChange={(e) => handleCoverageChange(index, "amount", e.target.value)}
                            className="h-11"
                          />
                        </div>
                        <div className="col-span-2">
                          <Select value={item.unit} onValueChange={(value) => handleCoverageChange(index, "unit", value)}>
                            <SelectTrigger className="h-11">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="元">元</SelectItem>
                              <SelectItem value="萬元">萬元</SelectItem>
                              <SelectItem value="次">次</SelectItem>
                              <SelectItem value="日">日</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-1">
                          {coverageItems.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeCoverageItem(index)}
                              className="h-11 w-11 p-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      onClick={addCoverageItem}
                      className="w-full h-11 border-dashed border-2 text-teal-600 border-teal-300 hover:bg-teal-50"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      新增保障項目
                    </Button>
                  </div>
                </div>

                {/* Other Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">其他資訊</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="insuredName" className="text-sm font-medium mb-2 block">
                        被保險人
                      </Label>
                      <Input
                        id="insuredName"
                        placeholder="例：王小明"
                        value={formData.insuredName}
                        onChange={(e) => handleInputChange("insuredName", e.target.value)}
                        className="h-11"
                      />
                    </div>

                    <div>
                      <Label htmlFor="beneficiary" className="text-sm font-medium mb-2 block">
                        受益人
                      </Label>
                      <Input
                        id="beneficiary"
                        placeholder="例：王太太"
                        value={formData.beneficiary}
                        onChange={(e) => handleInputChange("beneficiary", e.target.value)}
                        className="h-11"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-6">
                  <Button variant="outline">
                    取消
                  </Button>
                  <Button onClick={handleSubmit} className="bg-teal-600 hover:bg-teal-700">
                    儲存
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}