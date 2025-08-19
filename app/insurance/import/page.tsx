"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Upload, FileText, CheckCircle2, Info, Calendar, Plus, Trash2 } from 'lucide-react'
import { OpenAIService } from '@/lib/openaiService'
import UploadZone, { UploadedFile } from "@/components/ui/upload-zone"
import { userDataService, generateId } from "@/lib/storage"
import { checkAuth } from "@/app/actions/auth-service"

export default function InsuranceImportPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<{ id: string, name: string } | null>(null)
  
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
        }
      } catch (error) {
        console.error('獲取用戶資訊失敗:', error)
      }
    }
    fetchUser()
  }, [])


  const handleFileUpload = async (fileData: UploadedFile | null) => {
    if (!fileData) return
    
    setIsProcessing(true)
    setError(null)
    
    try {
      console.log('開始分析保單文件:', fileData.filename)
      
      const openaiService = new OpenAIService()
      console.log('開始 AI 分析...')
      const result = await openaiService.analyzeInsurancePolicy(
        fileData.text || '', 
        fileData.base64
      )
      console.log('AI 分析結果:', result)
      
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
    if (!user?.id) {
      setError('請先登入')
      return
    }

    try {
      // Prepare policy data
      const policyData = {
        id: generateId(),
        fileName: 'manual_input',
        fileType: 'manual',
        documentType: 'insurance' as const,
        uploadDate: new Date().toISOString(),
        fileSize: 0,
        textContent: '',
        imageBase64: null,
        policyInfo: {
          policyBasicInfo: {
            insuranceCompany: formData.company,
            policyType: formData.type,
            policyName: formData.name,
            policyNumber: formData.number,
            effectiveDate: formData.startDate,
            expirationDate: formData.endDate,
            insuredName: formData.insuredName,
            beneficiary: formData.beneficiary
          },
          coverageDetails: {
            coverage: coverageItems.filter(item => item.name && item.amount)
          }
        }
      }
      
      // Save using userDataService
      await userDataService.saveInsurancePolicy(user.id, policyData)
      
      // Redirect to insurance page
      window.location.href = '/insurance'
    } catch (error) {
      console.error('Error saving policy:', error)
      setError('保存失敗，請稍後再試')
    }
  }
  
  const handleAutoNext = async () => {
    if (!analysisResult || !user?.id) {
      setError('請先登入或重新分析')
      return
    }
    
    try {
      // Prepare policy data from AI analysis
      const policyData = {
        id: generateId(),
        fileName: 'ai_analyzed',
        fileType: 'auto',
        documentType: 'insurance' as const,
        uploadDate: new Date().toISOString(),
        fileSize: 0,
        textContent: '',
        imageBase64: null,
        policyInfo: {
          policyBasicInfo: {
            insuranceCompany: analysisResult.company || '',
            policyType: analysisResult.type || '',
            policyName: analysisResult.name || '',
            policyNumber: analysisResult.number || '',
            effectiveDate: analysisResult.startDate || '',
            expirationDate: analysisResult.endDate || '',
            insuredName: analysisResult.insuredName || '',
            beneficiary: analysisResult.beneficiary || ''
          },
          coverageDetails: {
            coverage: analysisResult.coverage || []
          }
        }
      }
      
      // Save using userDataService
      await userDataService.saveInsurancePolicy(user.id, policyData)
      
      // Redirect to insurance page
      window.location.href = '/insurance'
    } catch (error) {
      console.error('Error saving analysis result:', error)
      setError('保存失敗，請稍後再試')
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
                          <li>• 保險公司：{analysisResult.company || '未識別'}</li>
                          <li>• 保單名稱：{analysisResult.name || '未識別'}</li>
                          <li>• 保單號碼：{analysisResult.number || '未識別'}</li>
                          <li>• 保障期間：{analysisResult.startDate || '未識別'} 至 {analysisResult.endDate || '未識別'}</li>
                        </ul>
                        <p className="text-sm text-green-700">
                          辨識結果「不一定」是百分百正確。
                        </p>
                      </div>
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
                      下一步
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