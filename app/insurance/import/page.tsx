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
import { ArrowLeft, Upload, FileText, CheckCircle2, Info, Calendar, Plus, Trash2 } from 'lucide-react'
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
      const openaiService = new OpenAIService()
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
      
      const openaiService = new OpenAIService()
      console.log('開始 AI 分析（三階段）...')
      
      // 第一階段：簡單測試 prompt
      const testResult = await openaiService.testPromptStage(
         fileData.text || ''
      )
      console.log('第一階段測試完成:', testResult)
      
      // 第二階段：結構化萃取摘要（policyInfo + flatFields）
      const summary = await openaiService.summarizeInsurancePolicy(
        fileData.text || '',
        fileData.base64
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
          policy_basic_policy_terms: coverageItems
            .filter(item => item.name && item.amount)
            .map(item => `${item.name} ${item.amount}${item.unit}`)
            .join(', '),
          policy_basic_insurance_period: formData.startDate && formData.endDate 
            ? `${formData.startDate} 至 ${formData.endDate}` 
            : '',
          
          // 要保人資訊 (手動輸入時通常留空)
          holder_name: '',
          holder_birth_date: null,
          holder_id_number: '',
          holder_occupation: '',
          holder_contact_address: '',
          
          // 被保險人資訊
          insured_name: formData.insuredName,
          insured_birth_date: null,
          insured_gender: '',
          insured_id_number: '',
          insured_occupation: '',
          insured_contact_address: '',
          
          // 受益人資訊
          beneficiary_name: formData.beneficiary,
          beneficiary_relationship: '',
          beneficiary_benefit_ratio: '',
          
          // 保險內容與費用 (手動輸入時通常留空)
          fees_insurance_amount: '',
          fees_payment_method: '',
          fees_payment_period: '',
          fees_dividend_distribution: '',
          
          // 其他事項 (手動輸入時通常留空)
          other_automatic_premium_loan: '',
          other_additional_clauses: '',
          
          // 保險服務資訊 (手動輸入時通常留空)
          service_customer_service_hotline: '',
          service_claims_process_intro: '',
          
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
    if (!analysisResult || !user?.phoneNumber) {
      console.error('handleAutoNext 失敗:', { analysisResult, user })
      setError('請先登入或重新分析')
      return
    }
    
    try {
      // 首先取得用戶ID
      const { baseUrl, apiKey } = supabaseConfig
      
      // 查詢用戶ID
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
          file_type: 'image',
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
          policy_basic_policy_terms: analysisResult.policyInfo?.policyBasicInfo?.policyTerms || '',
          policy_basic_insurance_period: (() => {
            const startDate = analysisResult.flatFields?.startDate || analysisResult.policyInfo?.policyBasicInfo?.effectiveDate || ''
            const endDate = analysisResult.flatFields?.endDate || analysisResult.policyInfo?.policyBasicInfo?.expiryDate || ''
            return startDate && endDate ? `${startDate} 至 ${endDate}` : ''
          })(),
          
          // 要保人資訊 (AI通常不會分析這些)
          holder_name: '',
          holder_birth_date: null,
          holder_id_number: '',
          holder_occupation: '',
          holder_contact_address: '',
          
          // 被保險人資訊
          insured_name: analysisResult.flatFields?.insuredName || analysisResult.policyInfo?.insuredPersonInfo?.name || '',
          insured_birth_date: analysisResult.policyInfo?.insuredPersonInfo?.birthDate ? analysisResult.policyInfo?.insuredPersonInfo?.birthDate : null,
          insured_gender: analysisResult.policyInfo?.insuredPersonInfo?.gender || '',
          insured_id_number: analysisResult.policyInfo?.insuredPersonInfo?.idNumber || '',
          insured_occupation: analysisResult.policyInfo?.insuredPersonInfo?.occupation || '',
          insured_contact_address: analysisResult.policyInfo?.insuredPersonInfo?.contactAddress || '',
          
          // 受益人資訊
          beneficiary_name: analysisResult.flatFields?.beneficiary || analysisResult.policyInfo?.beneficiaryInfo?.name || '',
          beneficiary_relationship: analysisResult.policyInfo?.beneficiaryInfo?.relationshipToInsured || '',
          beneficiary_benefit_ratio: analysisResult.policyInfo?.beneficiaryInfo?.benefitRatio || '',
          
          // 保險內容與費用 (AI通常不會分析這些)
          fees_insurance_amount: analysisResult.policyInfo?.insuranceContentAndFees?.insuranceAmount || '',
          fees_payment_method: analysisResult.policyInfo?.insuranceContentAndFees?.paymentMethod || '',
          fees_payment_period: analysisResult.policyInfo?.insuranceContentAndFees?.paymentPeriod || '',
          fees_dividend_distribution: analysisResult.policyInfo?.insuranceContentAndFees?.dividendDistribution || '',
          
          // 其他事項 (AI通常不會分析這些)
          other_automatic_premium_loan: analysisResult.policyInfo?.otherMatters?.automaticPremiumLoan || '',
          other_additional_clauses: analysisResult.policyInfo?.otherMatters?.additionalClauses || '',
          
          // 保險服務資訊 (AI通常不會分析這些)
          service_customer_service_hotline: analysisResult.policyInfo?.insuranceServiceInfo?.customerServiceHotline || '',
          service_claims_process_intro: analysisResult.policyInfo?.insuranceServiceInfo?.claimsProcessIntro || '',
          
          created_at: new Date().toISOString()
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`保存失敗 (${response.status}): ${errorText}`)
      }

      const result = await response.json()
      console.log('AI分析保單保存成功:', result)
      
      // 成功保存後重定向到保單頁面
      router.push('/insurance')
    } catch (error) {
      console.error('Error saving analysis result:', error)
      const errorMessage = error instanceof Error ? error.message : '保存失敗，請稍後再試'
      setError(errorMessage)
    }
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

                {isComplete && analysisResult && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-medium text-green-900 mb-2">辨識完成</h4>
                        <p className="text-sm text-green-800 mb-3">
                          系統已成功辨識您的保單資料：
                        </p>
                        <ul className="text-sm text-green-800 space-y-1 mb-4">
                          <li>• 保險公司：{analysisResult.flatFields?.company || analysisResult.policyInfo?.policyBasicInfo?.insuranceCompany || '未識別'}</li>
                          <li>• 保單名稱：{analysisResult.flatFields?.name || analysisResult.policyInfo?.policyBasicInfo?.policyName || '未識別'}</li>
                          <li>• 保單號碼：{analysisResult.flatFields?.number || analysisResult.policyInfo?.policyBasicInfo?.policyNumber || '未識別'}</li>
                          <li>• 保障期間：{analysisResult.flatFields?.startDate || analysisResult.policyInfo?.policyBasicInfo?.effectiveDate || '未識別'} 至 {analysisResult.flatFields?.endDate || analysisResult.policyInfo?.policyBasicInfo?.expiryDate || '未識別'}</li>
                        </ul>
                        <p className="text-sm text-green-700">
                          辨識結果「不一定」是百分百正確。
                        </p>
                      </div>
                    </div>
                    
                    {/* 測試按鈕 */}
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
                  </div>
                )}

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => {
                    setIsComplete(false)
                    setIsProcessing(false)
                    setAnalysisResult(null)
                    setError(null)
                  }}>
                    取消
                  </Button>
                  {isComplete && (
                    <Button onClick={handleAutoNext} className="bg-teal-600 hover:bg-teal-700">
                      確定儲存
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