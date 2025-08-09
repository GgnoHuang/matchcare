"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
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
  RefreshCw
} from "lucide-react"
import UploadZone, { UploadedFile } from "@/components/ui/upload-zone"
import { checkAuth } from "@/app/actions/auth-service"
import { 
  userDataService, 
  generateId, 
  formatFileSize, 
  formatDate,
  MedicalRecord, 
  InsurancePolicy, 
  StorageStats 
} from "@/lib/storage"

export default function MyDataPage() {
  // 用戶狀態
  const [user, setUser] = useState<{ id: string, name: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // 資料狀態
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([])
  const [insurancePolicies, setInsurancePolicies] = useState<InsurancePolicy[]>([])
  const [stats, setStats] = useState<StorageStats | null>(null)
  
  // UI 狀態
  const [activeTab, setActiveTab] = useState("overview")
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)

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
    if (user?.id) {
      loadUserData()
    }
  }, [user])

  const loadUserData = async () => {
    if (!user?.id) return

    try {
      const [records, policies, statistics] = await Promise.all([
        userDataService.getMedicalRecords(user.id),
        userDataService.getInsurancePolicies(user.id),
        userDataService.getStorageStats(user.id)
      ])

      setMedicalRecords(records)
      setInsurancePolicies(policies)
      setStats(statistics)
    } catch (error) {
      console.error('載入用戶資料失敗:', error)
    }
  }

  // 處理病歷檔案上傳
  const handleMedicalFileUpload = async (fileData: UploadedFile | null) => {
    if (!fileData || !user?.id) return

    try {
      const record: MedicalRecord = {
        id: generateId(),
        fileName: fileData.filename,
        fileType: fileData.type,
        uploadDate: new Date().toISOString(),
        fileSize: fileData.size,
        textContent: fileData.text,
        imageBase64: fileData.base64
      }

      await userDataService.saveMedicalRecord(user.id, record)
      await loadUserData()
      
      setUploadSuccess(`病歷檔案 "${fileData.filename}" 上傳成功！`)
      setTimeout(() => setUploadSuccess(null), 3000)
    } catch (error) {
      console.error('上傳病歷檔案失敗:', error)
      setUploadError('上傳病歷檔案失敗，請稍後再試')
    }
  }

  // 處理保單檔案上傳
  const handlePolicyFileUpload = async (fileData: UploadedFile | null) => {
    if (!fileData || !user?.id) return

    try {
      const policy: InsurancePolicy = {
        id: generateId(),
        fileName: fileData.filename,
        fileType: fileData.type,
        uploadDate: new Date().toISOString(),
        fileSize: fileData.size,
        textContent: fileData.text,
        imageBase64: fileData.base64
      }

      await userDataService.saveInsurancePolicy(user.id, policy)
      await loadUserData()
      
      setUploadSuccess(`保單檔案 "${fileData.filename}" 上傳成功！`)
      setTimeout(() => setUploadSuccess(null), 3000)
    } catch (error) {
      console.error('上傳保單檔案失敗:', error)
      setUploadError('上傳保單檔案失敗，請稍後再試')
    }
  }

  // 刪除病歷記錄
  const handleDeleteMedicalRecord = async (recordId: string) => {
    if (!user?.id || !confirm('確定要刪除這筆病歷記錄嗎？')) return

    try {
      await userDataService.deleteMedicalRecord(user.id, recordId)
      await loadUserData()
    } catch (error) {
      console.error('刪除病歷記錄失敗:', error)
    }
  }

  // 刪除保單記錄
  const handleDeleteInsurancePolicy = async (policyId: string) => {
    if (!user?.id || !confirm('確定要刪除這筆保單記錄嗎？')) return

    try {
      await userDataService.deleteInsurancePolicy(user.id, policyId)
      await loadUserData()
    } catch (error) {
      console.error('刪除保單記錄失敗:', error)
    }
  }

  const handleFileError = (errorMessage: string) => {
    setUploadError(errorMessage)
    setTimeout(() => setUploadError(null), 5000)
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
            <Badge variant="outline">{user.name}</Badge>
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
            病歷記錄 ({medicalRecords.length})
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
                        <p className="font-medium text-sm">{record.fileName}</p>
                        <p className="text-xs text-gray-500">{formatDate(record.uploadDate)}</p>
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
                        <p className="font-medium text-sm">{policy.fileName}</p>
                        <p className="text-xs text-gray-500">{formatDate(policy.uploadDate)}</p>
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
        </TabsContent>

        <TabsContent value="medical" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">病歷記錄</h2>
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
                      <h3 className="font-semibold">{record.fileName}</h3>
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
                    </div>
                  </div>
                  <div className="flex gap-2">
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
                <h3 className="font-semibold text-gray-900 mb-2">尚未上傳病歷記錄</h3>
                <p className="text-gray-500 mb-4">上傳您的病歷檔案，讓 AI 幫您分析可申請的資源</p>
                <Button onClick={() => setActiveTab("upload")} className="gap-2">
                  <Upload className="h-4 w-4" />
                  上傳第一筆病歷
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
                      <h3 className="font-semibold">{policy.fileName}</h3>
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
                          <div>
                            <span className="text-gray-500">保險公司: </span>
                            <span className="font-medium">{policy.policyInfo.insuranceCompany}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">保單號碼: </span>
                            <span className="font-medium">{policy.policyInfo.policyNumber}</span>
                          </div>
                        </div>
                      )}
                      {policy.notes && (
                        <p className="text-sm text-gray-600 mt-2">{policy.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  上傳病歷記錄
                </CardTitle>
                <CardDescription>
                  上傳您的病歷、檢查報告、診斷書等醫療文件
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UploadZone 
                  onFileProcessed={handleMedicalFileUpload}
                  onError={handleFileError}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  上傳保險保單
                </CardTitle>
                <CardDescription>
                  上傳您的保險保單、保障條款等相關文件
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UploadZone 
                  onFileProcessed={handlePolicyFileUpload}
                  onError={handleFileError}
                />
              </CardContent>
            </Card>
          </div>

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
    </div>
  )
}