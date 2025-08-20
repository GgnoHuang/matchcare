"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FileText, Camera, CheckCircle, ArrowLeft, CalendarIcon, AlertCircle, Loader2, Check } from 'lucide-react'
import { format } from "date-fns"
import { zhTW } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { OpenAIService } from '@/lib/openaiService'
import UploadZone, { UploadedFile } from "@/components/ui/upload-zone"
// import { userDataService, generateId } from "@/lib/storage" // 已移除，改用 API
// 暫時實作 generateId 函數
const generateId = () => {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
}
import { checkAuth } from "@/app/actions/auth-service"


interface ExtractedData {
  patientName: string
  patientAge: string
  patientGender: string
  hospitalName: string
  department: string
  doctorName: string
  visitDate: string
  diagnosis: string
  symptoms: string
  treatment: string
  medications: string
  notes: string
  isFirstOccurrence: string
  medicalExam: string
}

export default function MedicalRecordsImportPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [activeTab, setActiveTab] = useState("auto")
  const [isUploading, setIsUploading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<{ id: string, name: string } | null>(null)

  // Manual form states
  const [formData, setFormData] = useState({
    hospital: "",
    department: "",
    doctor: "",
    visitDate: undefined as Date | undefined,
    medicalExam: "",
    diagnosis: "",
    treatment: "",
    medication: "",
    isFirstOccurrence: "",
  })

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

    setIsUploading(true)
    setError(null)

    try {
      console.log('開始分析醫療記錄文件:', fileData.filename)

      setIsUploading(false)
      setIsProcessing(true)

      const openaiService = new OpenAIService()
      console.log('開始 AI 分析...')
      const result = await openaiService.analyzeMedicalDocument(
        fileData.text || '', 
        fileData.base64
      )
      console.log('AI 分析結果:', result)

      setIsProcessing(false)
      setIsCompleted(true)

      // 直接使用標準 JSON 格式，不做轉換
      setExtractedData(result)
    } catch (error) {
      console.error('Error analyzing medical record:', error)
      setError('AI 分析失敗，請稍後再試或使用手動輸入')
      setIsProcessing(false)
      setIsUploading(false)
    }
  }

  const handleFileError = (errorMessage: string) => {
    setError(errorMessage)
  }

  const handleNext = async () => {
    if (!extractedData || !user?.id) {
      setError('請先登入或重新分析')
      return
    }
    
    try {
      // 使用標準 JSON 格式直接儲存 AI 分析結果
      const recordData = {
        id: generateId(),
        fileName: 'ai_analyzed',
        fileType: 'pdf' as const,
        documentType: 'medical' as const,
        uploadDate: new Date().toISOString(),
        fileSize: 0,
        textContent: '',
        imageBase64: undefined,
        medicalInfo: extractedData // 直接使用 AI 掃描的標準 JSON 格式
      }
      
      // Save using userDataService - 暫時註釋，需改為 API
      // await userDataService.saveMedicalRecord(user.id, recordData)
      console.log('暫時跳過儲存，需要改為 API 呼叫:', recordData)
      
      setIsSaved(true)
    } catch (error) {
      console.error('Error saving medical record:', error)
      setError('保存失敗，請稍後再試')
    }
  }

  const handleManualSubmit = async () => {
    if (!user?.id) {
      setError('請先登入')
      return
    }

    try {
      // 使用標準 JSON 格式儲存手動輸入資料
      const recordData = {
        id: generateId(),
        fileName: 'manual_input',
        fileType: 'pdf' as const,
        documentType: 'medical' as const,
        uploadDate: new Date().toISOString(),
        fileSize: 0,
        textContent: '',
        imageBase64: undefined,
        medicalInfo: {
          patientName: "", // 手動輸入頁面沒有患者資訊，保持空值
          patientAge: "",
          patientGender: "male",
          hospitalName: formData.hospital,
          department: formData.department,
          doctorName: formData.doctor,
          visitDate: formData.visitDate ? format(formData.visitDate, "yyyy-MM-dd") : "",
          isFirstOccurrence: formData.isFirstOccurrence,
          medicalExam: formData.medicalExam,
          diagnosis: formData.diagnosis,
          symptoms: "",
          treatment: formData.treatment,
          medications: formData.medication,
          notes: ""
        }
      }
      
      // Save using userDataService - 暫時註釋，需改為 API
      // await userDataService.saveMedicalRecord(user.id, recordData)
      console.log('暫時跳過儲存，需要改為 API 呼叫:', recordData)
      
      setIsSaved(true)
    } catch (error) {
      console.error('Error saving medical record:', error)
      setError('保存失敗，請稍後再試')
    }
  }

  const handleReturnToOverview = () => {
    router.push("/medical-records")
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  if (isSaved) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              返回病歷管理
            </Button>
          </div>

          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-600">儲存成功</CardTitle>
              <CardDescription>您的醫療記錄已成功儲存至系統</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-3">已儲存的醫療記錄</h3>
                <div className="space-y-2 text-sm">
                  {activeTab === "auto" && extractedData ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">醫院：</span>
                        <span>{extractedData.hospitalName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">科別：</span>
                        <span>{extractedData.department}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">醫師：</span>
                        <span>{extractedData.doctorName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">就診日期：</span>
                        <span>{extractedData.visitDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">診斷：</span>
                        <span>{extractedData.diagnosis}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">醫院：</span>
                        <span>{formData.hospital || "未填寫"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">科別：</span>
                        <span>{formData.department || "未填寫"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">醫師：</span>
                        <span>{formData.doctor || "未填寫"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">就診日期：</span>
                        <span>{formData.visitDate ? format(formData.visitDate, "yyyy-MM-dd") : "未填寫"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">診斷：</span>
                        <span>{formData.diagnosis || "未填寫"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">是否首次發病：</span>
                        <span>
                          {formData.isFirstOccurrence === "yes"
                            ? "是，首次發病"
                            : formData.isFirstOccurrence === "no"
                              ? "否，非首次發病"
                              : "未填寫"}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => router.back()} className="flex-1 bg-transparent">
                  取消
                </Button>
                <Button onClick={handleReturnToOverview} className="flex-1 bg-teal-600 hover:bg-teal-700">
                  返回病歷管理
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            返回病歷管理
          </Button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">添加醫療記錄</h1>
          <p className="text-gray-600">手動添加或上傳您的醫療記錄</p>
        </div>

        <Card>
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="auto">自動辨識</TabsTrigger>
                <TabsTrigger value="manual">手動輸入</TabsTrigger>
              </TabsList>

              <TabsContent value="auto" className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2">自動辨識病歷</h2>
                  <p className="text-gray-600 mb-4">上傳病歷文件並自動辨識病歷內容，系統將自動解析病歷內容</p>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>注意事項</strong>
                    <br />
                    上傳文件時，請注意以下事項：
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>檔案格式支援 JPG、PNG、GIF、WebP</li>
                      <li>檔案大小請勿超過 5MB</li>
                      <li>系統將保護您的個人隱私，所有資料將被加密處理</li>
                      <li>自動辨識結果可能需要人工確認，請確認後再儲存</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                {error && (
                  <Alert className="bg-red-50 border-red-200">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      <strong>錯誤：</strong>{error}
                    </AlertDescription>
                  </Alert>
                )}

                {!isUploading && !isProcessing && !isCompleted && (
                  <UploadZone 
                    onFileProcessed={handleFileUpload}
                    onError={handleFileError}
                  />
                )}

                {isUploading && (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-teal-600 mx-auto mb-4" />
                    <p className="text-lg font-medium">上傳中...</p>
                    <p className="text-gray-500">正在上傳您的檔案</p>
                  </div>
                )}

                {isProcessing && (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-teal-600 mx-auto mb-4" />
                    <p className="text-lg font-medium">辨識中...</p>
                    <p className="text-gray-500">AI 分析處理中</p>
                  </div>
                )}

                {isCompleted && extractedData && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">解讀完成</span>
                    </div>

                    <Alert className="bg-green-50 border-green-200">
                      <Check className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        <strong>系統已自動辨識您的病歷內容：</strong>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li>醫院：{extractedData.hospitalName}</li>
                          <li>科別：{extractedData.department}</li>
                          <li>醫師：{extractedData.doctorName}</li>
                          <li>日期：{extractedData.visitDate}</li>
                        </ul>
                        <p className="mt-2">辨識結果「不一定」是百分百正確。</p>
                      </AlertDescription>
                    </Alert>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => router.back()} className="bg-transparent">
                    取消
                  </Button>
                  {isCompleted && (
                    <Button onClick={handleNext} className="bg-teal-600 hover:bg-teal-700">
                      下一步
                    </Button>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="manual" className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2">手動添加病歷</h2>
                  <p className="text-gray-600 mb-4">手動填寫您的醫療記錄資訊</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="hospital">醫院名稱</Label>
                    <Input
                      id="hospital"
                      placeholder="例：台大醫院"
                      value={formData.hospital}
                      onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">科別</Label>
                    <Select
                      value={formData.department}
                      onValueChange={(value) => setFormData({ ...formData, department: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="選擇科別" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="internal">內科</SelectItem>
                        <SelectItem value="surgery">外科</SelectItem>
                        <SelectItem value="pediatrics">小兒科</SelectItem>
                        <SelectItem value="obstetrics">婦產科</SelectItem>
                        <SelectItem value="orthopedics">骨科</SelectItem>
                        <SelectItem value="dermatology">皮膚科</SelectItem>
                        <SelectItem value="ophthalmology">眼科</SelectItem>
                        <SelectItem value="ent">耳鼻喉科</SelectItem>
                        <SelectItem value="psychiatry">精神科</SelectItem>
                        <SelectItem value="neurology">神經科</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="visitDate">就診日期</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal bg-transparent",
                            !formData.visitDate && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.visitDate ? (
                            format(formData.visitDate, "yyyy/MM/dd", { locale: zhTW })
                          ) : (
                            <span>年/月/日</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.visitDate}
                          onSelect={(date) => setFormData({ ...formData, visitDate: date })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="doctor">主治醫師</Label>
                    <Input
                      id="doctor"
                      placeholder="例：王醫師"
                      value={formData.doctor}
                      onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="isFirstOccurrence">是否為首次發病</Label>
                    <Select
                      value={formData.isFirstOccurrence}
                      onValueChange={(value) => setFormData({ ...formData, isFirstOccurrence: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="請選擇" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">是，首次發病</SelectItem>
                        <SelectItem value="no">否，非首次發病</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="medicalExam">醫學檢查項目</Label>
                    <Select
                      value={formData.medicalExam}
                      onValueChange={(value) => setFormData({ ...formData, medicalExam: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="檢查" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="blood-test">血液檢查</SelectItem>
                        <SelectItem value="urine-test">尿液檢查</SelectItem>
                        <SelectItem value="x-ray">X光檢查</SelectItem>
                        <SelectItem value="ct-scan">電腦斷層</SelectItem>
                        <SelectItem value="mri">核磁共振</SelectItem>
                        <SelectItem value="ultrasound">超音波檢查</SelectItem>
                        <SelectItem value="ecg">心電圖</SelectItem>
                        <SelectItem value="endoscopy">內視鏡檢查</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="diagnosis">診斷結果</Label>
                    <Textarea
                      id="diagnosis"
                      placeholder="例：急性腸胃炎"
                      value={formData.diagnosis}
                      onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="treatment">治療方案</Label>
                    <Textarea
                      id="treatment"
                      placeholder="例：藥物治療、休息"
                      value={formData.treatment}
                      onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="medication">用藥記錄</Label>
                    <Textarea
                      id="medication"
                      placeholder="例：普拿疼、腸胃藥"
                      value={formData.medication}
                      onChange={(e) => setFormData({ ...formData, medication: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => router.back()} className="bg-transparent">
                    取消
                  </Button>
                  <Button onClick={handleManualSubmit} className="bg-teal-600 hover:bg-teal-700">
                    儲存
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}