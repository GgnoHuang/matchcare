"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { 
  FileText, 
  FileImage, 
  Upload, 
  Check, 
  Calendar,
  Database,
  RotateCcw,
  AlertCircle
} from "lucide-react"
import UploadZone, { UploadedFile } from "./upload-zone"
import { 
  userDataService, 
  formatFileSize, 
  formatDate,
  MedicalRecord, 
  InsurancePolicy,
  DiagnosisCertificate,
  DocumentType
} from "@/lib/storage"

interface FileSelectorProps {
  label: string
  description?: string
  fileType: DocumentType
  userId: string | null
  onFileSelected: (fileData: SelectedFileData | null) => void
  onError?: (error: string) => void
}

export interface SelectedFileData {
  source: 'existing' | 'upload'
  filename: string
  fileType: 'pdf' | 'image'
  size: number
  textContent?: string
  imageBase64?: string
  // 如果是已存在的檔案，包含完整記錄
  record?: MedicalRecord | InsurancePolicy | DiagnosisCertificate
}

export default function FileSelector({ 
  label, 
  description, 
  fileType, 
  userId, 
  onFileSelected, 
  onError 
}: FileSelectorProps) {
  // 狀態管理
  const [activeTab, setActiveTab] = useState<'existing' | 'upload'>('existing')
  const [existingFiles, setExistingFiles] = useState<(MedicalRecord | InsurancePolicy | DiagnosisCertificate)[]>([])
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null)

  // 載入已上傳的檔案
  useEffect(() => {
    if (userId) {
      loadExistingFiles()
    }
  }, [userId, fileType])

  const loadExistingFiles = async () => {
    if (!userId) return

    try {
      setIsLoading(true)
      let files: (MedicalRecord | InsurancePolicy | DiagnosisCertificate)[] = []
      
      if (fileType === 'medical') {
        files = await userDataService.getMedicalRecords(userId)
      } else if (fileType === 'insurance') {
        files = await userDataService.getInsurancePolicies(userId)
      } else if (fileType === 'diagnosis') {
        files = await userDataService.getDiagnosisCertificates(userId)
      }
      
      // 按上傳日期降序排列
      files.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
      
      setExistingFiles(files)
    } catch (error) {
      console.error('載入已上傳檔案失敗:', error)
      onError?.('載入已上傳檔案失敗')
    } finally {
      setIsLoading(false)
    }
  }

  // 選擇已存在的檔案
  const handleExistingFileSelect = (fileId: string) => {
    const file = existingFiles.find(f => f.id === fileId)
    if (!file) return

    setSelectedFileId(fileId)
    
    const fileData: SelectedFileData = {
      source: 'existing',
      filename: file.fileName,
      fileType: file.fileType,
      size: file.fileSize,
      textContent: file.textContent,
      imageBase64: file.imageBase64,
      record: file
    }
    
    onFileSelected(fileData)
  }

  // 處理新上傳的檔案
  const handleUploadedFile = (fileData: UploadedFile | null) => {
    setUploadedFile(fileData)
    
    if (fileData) {
      const selectedData: SelectedFileData = {
        source: 'upload',
        filename: fileData.filename,
        fileType: fileData.type,
        size: fileData.size,
        textContent: fileData.text,
        imageBase64: fileData.base64
      }
      onFileSelected(selectedData)
    } else {
      onFileSelected(null)
    }
  }

  const handleFileError = (errorMessage: string) => {
    onError?.(errorMessage)
  }

  // 重置選擇
  const handleReset = () => {
    setSelectedFileId(null)
    setUploadedFile(null)
    onFileSelected(null)
  }

  // 切換標籤時重置選擇
  const handleTabChange = (value: string) => {
    setActiveTab(value as 'existing' | 'upload')
    handleReset()
  }

  // 獲取當前選中的檔案
  const getSelectedFile = () => {
    if (activeTab === 'existing' && selectedFileId) {
      return existingFiles.find(f => f.id === selectedFileId)
    }
    if (activeTab === 'upload' && uploadedFile) {
      return uploadedFile
    }
    return null
  }

  const selectedFile = getSelectedFile()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{label}</CardTitle>
            {description && (
              <CardDescription>{description}</CardDescription>
            )}
          </div>
          {selectedFile && (
            <Button onClick={handleReset} variant="outline" size="sm" className="gap-1">
              <RotateCcw className="h-3 w-3" />
              重新選擇
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!selectedFile ? (
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="existing" className="gap-2">
                <Database className="h-4 w-4" />
                選擇已上傳 ({existingFiles.length})
              </TabsTrigger>
              <TabsTrigger value="upload" className="gap-2">
                <Upload className="h-4 w-4" />
                重新上傳
              </TabsTrigger>
            </TabsList>

            <TabsContent value="existing">
              {isLoading ? (
                <div className="text-center py-8 text-gray-500">
                  載入中...
                </div>
              ) : existingFiles.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-medium text-gray-900 mb-2">
                    尚未上傳{fileType === 'medical' ? '病歷' : fileType === 'insurance' ? '保單' : '診斷證明'}檔案
                  </h3>
                  <p className="text-gray-500 mb-4">
                    請先到「我的資料」頁面上傳檔案，或使用右側的「重新上傳」功能
                  </p>
                  <Button onClick={() => setActiveTab('upload')} variant="outline" className="gap-2">
                    <Upload className="h-4 w-4" />
                    立即上傳
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700">
                    選擇要用於分析的{fileType === 'medical' ? '病歷' : fileType === 'insurance' ? '保單' : '診斷證明'}檔案：
                  </Label>
                  {existingFiles.map((file) => (
                    <Card 
                      key={file.id}
                      className={`cursor-pointer transition-colors ${
                        selectedFileId === file.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'hover:border-gray-300'
                      }`}
                      onClick={() => handleExistingFileSelect(file.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-white">
                              {file.fileType === 'pdf' ? (
                                <FileText className="h-5 w-5 text-red-500" />
                              ) : (
                                <FileImage className="h-5 w-5 text-blue-500" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium text-sm">{file.fileName}</h4>
                              <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(file.uploadDate)}
                                </span>
                                <span>{formatFileSize(file.fileSize)}</span>
                                <Badge variant="outline" className="text-xs">
                                  {file.fileType.toUpperCase()}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          {selectedFileId === file.id && (
                            <div className="bg-blue-600 rounded-full p-1">
                              <Check className="h-4 w-4 text-white" />
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="upload">
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">
                  上傳新的{fileType === 'medical' ? '病歷' : fileType === 'insurance' ? '保單' : '診斷證明'}檔案：
                </Label>
                <UploadZone 
                  onFileProcessed={handleUploadedFile}
                  onError={handleFileError}
                />
                <div className="text-xs text-gray-500 bg-amber-50 p-3 rounded-md border border-amber-200">
                  <AlertCircle className="h-4 w-4 inline-block mr-1" />
                  注意：此處上傳的檔案僅用於本次分析，不會自動儲存到「我的資料」中。
                  如需長期保存，請到「我的資料」頁面上傳。
                </div>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          // 顯示已選中的檔案
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-green-600 rounded-full p-2">
                  <Check className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-green-800">已選中檔案</h4>
                  <p className="text-sm text-green-700">{selectedFile.filename || selectedFile.fileName}</p>
                  <div className="flex items-center gap-3 text-xs text-green-600 mt-1">
                    <span>{formatFileSize(selectedFile.size || selectedFile.fileSize)}</span>
                    <Badge variant="outline" className="text-xs border-green-300 text-green-700">
                      {activeTab === 'existing' ? '已儲存檔案' : '臨時上傳'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}