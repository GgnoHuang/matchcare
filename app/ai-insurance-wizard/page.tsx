"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Upload, Zap, CheckCircle2, Info, Loader2, AlertCircle, Sparkles } from 'lucide-react'
import { OpenAIService } from '@/lib/openaiService'
import UploadZone, { UploadedFile } from "@/components/ui/upload-zone"
import { checkAuth } from "@/app/actions/auth-service"

export default function AIInsuranceWizardPage() {
  const router = useRouter()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadedFileData, setUploadedFileData] = useState<UploadedFile | null>(null) // 保存 UploadZone 處理的結果
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<{ id: string, username: string, phoneNumber: string, email: string } | null>(null)

  // 檢查用戶登入狀態
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { isLoggedIn, user: authUser } = await checkAuth()
        if (isLoggedIn && authUser) {
          setUser(authUser)
        } else {
          console.log('用戶未登入')
          setUser({ id: "guest", username: "訪客用戶", phoneNumber: "0000000000", email: "guest@example.com" })
        }
      } catch (error) {
        console.error('獲取用戶資訊失敗:', error)
        setUser({ id: "user1", username: "王小明", phoneNumber: "0912345678", email: "user1@example.com" })
      }
    }
    fetchUser()
  }, [])

  // 處理文件上傳（符合 UploadZone 的 API）
  const handleFileProcessed = (fileData: UploadedFile | null) => {
    if (fileData) {
      setUploadedFileData(fileData)
      // 創建一個 File 對象用於顯示
      const file = new File([], fileData.filename, { 
        type: fileData.type === 'pdf' ? 'application/pdf' : 'image/*'
      })
      // 使用 Object.defineProperty 來設定 size 屬性
      Object.defineProperty(file, 'size', {
        value: fileData.size,
        writable: false
      })
      setSelectedFile(file)
      setError(null)
    }
  }

  const handleUploadError = (errorMessage: string) => {
    setError(errorMessage)
  }

  // 移除文件
  const handleRemoveFile = () => {
    setSelectedFile(null)
    setUploadedFileData(null)
    setAnalysisResult(null)
    setError(null)
  }

  // 開始AI保險精靈分析
  const handleStartAnalysis = async () => {
    if (!uploadedFileData || !user) {
      setError('請先上傳保單文件')
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      // 使用OpenAI分析保單
      const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY
      const openaiService = new OpenAIService(apiKey)
      
      console.log('🤖 開始AI保險精靈分析...')
      
      let result;
      if (uploadedFileData.type === 'pdf' && uploadedFileData.text) {
        // PDF 文件優先使用文字模式，避免 base64 token 超限
        console.log('使用PDF文字模式分析，文字長度:', uploadedFileData.text.length)
        
        // 檢查文字長度，避免超過 token 限制
        if (uploadedFileData.text.length > 50000) { // 約 12500 tokens
          setError('PDF文件內容過多，請使用較小的文件或圖片格式')
          return
        }
        
        result = await openaiService.analyzeInsurancePolicy(uploadedFileData.text, null)
      } else if (uploadedFileData.base64) {
        // 圖片文件使用圖像模式
        console.log('使用圖像模式分析')
        result = await openaiService.analyzeInsurancePolicy('', uploadedFileData.base64)
      } else {
        setError('文件處理失敗，請重新上傳')
        return
      }
      
      console.log('✅ AI分析完成:', result)
      setAnalysisResult(result)
      
      // 直接跳轉到保險精靈分析頁面，傳遞分析結果
      const wizardData = {
        id: `temp_${Date.now()}`, // 臨時ID
        policyInfo: result,
        fileName: uploadedFileData.filename,
        uploadDate: new Date().toISOString(),
        isTemporary: true // 標記為臨時資料
      }
      
      // 將臨時資料存到 sessionStorage (不存資料庫)
      sessionStorage.setItem('tempPolicyData', JSON.stringify(wizardData))
      
      // 跳轉到AI保險精靈分析頁面
      router.push(`/ai-insurance-wizard/analysis`)
      
    } catch (error) {
      console.error('AI分析失敗:', error)
      setError('分析失敗：' + (error as Error).message)
    } finally {
      setIsAnalyzing(false)
    }
  }


  return (
    <div className="container py-6 md:py-8">
      {/* 頁面標頭 */}
      <div className="flex items-center gap-4 mb-6">
      
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
            <Zap className="h-8 w-8 text-yellow-500" />
            AI保險精靈
          </h1>
          <p className="text-gray-500 mt-1">上傳保單，立即獲得專業AI分析</p>
        </div>
      </div>

      {/* 功能介紹卡片 */}
      <Card className="mb-8 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-800">
            <Sparkles className="h-5 w-5" />
            AI保險精靈功能
          </CardTitle>
      
        </CardHeader>
        <CardContent className="text-yellow-800">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm">智能OCR識別保單內容</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm">專業保險知識分析</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm">單次分析不留痕跡</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 上傳區域 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            上傳保單文件
          </CardTitle>
          <CardDescription>
            支援 PDF、JPG、PNG 格式，建議 PDF 文件小於 5MB，圖片文件小於 10MB
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!selectedFile ? (
            <UploadZone
              onFileProcessed={handleFileProcessed}
              onError={handleUploadError}
              title="上傳保單文件"
              description="支援 PDF、JPG、PNG 格式，建議 PDF 文件小於 5MB，圖片文件小於 10MB，AI將智能分析您的保單內容"
            />
          ) : (
            <div className="p-6 border-2 border-dashed border-green-200 rounded-lg bg-green-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">{selectedFile.name}</p>
                    <p className="text-sm text-green-600">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveFile}
                  className="text-red-600 hover:bg-red-50"
                >
                  重新上傳
                </Button>
              </div>
            </div>
          )}

          {/* 錯誤訊息 */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-red-800">{error}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 開始分析按鈕 */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <Button
              onClick={handleStartAnalysis}
              disabled={!selectedFile || isAnalyzing}
              size="lg"
              className="w-full md:w-auto bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white gap-2 py-6 px-8"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  AI正在分析保單中...
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5" />
                  啟動AI保險精靈
                </>
              )}
            </Button>
            
            {selectedFile && !isAnalyzing && (
              <p className="text-gray-500 text-sm mt-4">
                點擊後將立即開始分析，分析完成後自動跳轉至結果頁面
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 注意事項 */}
      <Card className="mt-6 bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-blue-800">
              <h4 className="font-medium mb-2">使用說明</h4>
              <ul className="text-sm space-y-1">
                <li>• 此功能僅用於單次分析，不會將您的保單資料儲存到資料庫</li>
                <li>• 分析結果僅在當前瀏覽器會話中保存，關閉網頁後自動清除</li>
                <li>• 若需要長期保存保單資料，請使用「保單總覽」功能上傳</li>
                <li>• 建議上傳清晰的保單圖片或PDF以獲得最佳分析效果</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}