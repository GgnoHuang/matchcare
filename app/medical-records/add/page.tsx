"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, FileUp, FileText, Camera, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AddMedicalRecordPage() {
  const [activeTab, setActiveTab] = useState("manual")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [showCamera, setShowCamera] = useState(false)

  // 表單欄位
  const [formData, setFormData] = useState({
    hospital: "",
    department: "",
    date: "",
    diagnosis: "",
    doctor: "",
    treatments: "",
    medications: "",
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setUploadError(null)
    }
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setProgress(0)

    // 模擬表單提交過程
    const submitInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(submitInterval)
          setIsSubmitting(false)
          setIsComplete(true)
          return 100
        }
        return prev + 5
      })
    }, 100)
  }

  const handleUpload = () => {
    if (!file) {
      setUploadError("請選擇檔案")
      return
    }

    setIsSubmitting(true)
    setProgress(0)

    // 模擬上傳過程
    const uploadInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(uploadInterval)
          setIsSubmitting(false)
          setIsComplete(true)
          return 100
        }
        return prev + 5
      })
    }, 100)
  }

  return (
    <div className="container py-8">
      <div className="flex items-center mb-8">
        <Link href="/medical-records">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            返回病歷管理
          </Button>
        </Link>
      </div>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-2">添加醫療記錄</h1>
        <p className="text-gray-500 mb-8">手動添加或上傳您的醫療記錄</p>

        <Tabs defaultValue="auto" className="w-full" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 grid grid-cols-2 w-full max-w-md">
            <TabsTrigger value="auto">自動辨識</TabsTrigger>
            <TabsTrigger value="manual">手動輸入</TabsTrigger>
          </TabsList>

          {/* 自動辨識標籤內容 */}
          <TabsContent value="auto">
            <Card>
              <CardHeader>
                <CardTitle>自動辨識病歷</CardTitle>
                <CardDescription>上傳病歷文件或拍攝病歷照片，系統將自動識別內容</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>注意事項</AlertTitle>
                  <AlertDescription>
                    <p>上傳文件時，請注意以下事項：</p>
                    <ul className="list-disc list-inside space-y-1 mt-2">
                      <li>檔案格式支援 PDF、JPG、PNG</li>
                      <li>確保文件內容清晰可辨識</li>
                      <li>系統將保護您的個人隱私，所有資料皆經加密處理</li>
                      <li>自動辨識結果可能存在誤差，請確認後再提交</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                {!showCamera ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor="dropzone-file"
                        className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <FileUp className="w-10 h-10 mb-3 text-gray-400" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">點擊上傳</span> 或拖放檔案
                          </p>
                          <p className="text-xs text-gray-500">支援 PDF、JPG 或 PNG 格式</p>
                          {file && (
                            <div className="mt-4 flex items-center gap-2 text-sm font-medium text-teal-600">
                              <FileText className="h-4 w-4" />
                              {file.name}
                            </div>
                          )}
                        </div>
                        <Input
                          id="dropzone-file"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="hidden"
                          onChange={handleFileChange}
                          disabled={isSubmitting || isComplete}
                        />
                      </label>
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-gray-500 mb-2">或者</p>
                      <Button type="button" variant="outline" onClick={() => setShowCamera(true)} className="gap-2">
                        <Camera className="h-4 w-4" />
                        拍攝照片
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-gray-200 rounded-lg w-full aspect-video flex items-center justify-center">
                      <p className="text-gray-500">相機預覽（此為示範）</p>
                    </div>
                    <div className="flex justify-between">
                      <Button variant="outline" onClick={() => setShowCamera(false)}>
                        取消
                      </Button>
                      <Button>拍攝</Button>
                    </div>
                  </div>
                )}

                {uploadError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>錯誤</AlertTitle>
                    <AlertDescription>{uploadError}</AlertDescription>
                  </Alert>
                )}

                {(isSubmitting || isComplete) && (
                  <div>
                    {isSubmitting && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">處理中...</p>
                          <p className="text-sm text-gray-500">{progress}%</p>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <p className="text-xs text-gray-500">正在辨識您的病歷資訊，請稍候...</p>
                      </div>
                    )}

                    {isComplete && (
                      <Alert className="bg-green-50 text-green-800 border-green-200">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertTitle>辨識完成</AlertTitle>
                        <AlertDescription>
                          <p>系統已成功辨識您的病歷資訊：</p>
                          <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>醫院：台大醫院</li>
                            <li>科別：腫瘤科</li>
                            <li>診斷：乳癌第二期</li>
                            <li>日期：2023-12-15</li>
                          </ul>
                          <p className="mt-2">請點擊「下一步」進行確認。</p>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" asChild>
                  <Link href="/medical-records">取消</Link>
                </Button>
                {!isComplete ? (
                  <Button
                    onClick={handleUpload}
                    disabled={(!file && !showCamera) || isSubmitting}
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        處理中...
                      </>
                    ) : (
                      "上傳並辨識"
                    )}
                  </Button>
                ) : (
                  <Button onClick={() => setActiveTab("manual")} className="bg-teal-600 hover:bg-teal-700">
                    下一步
                  </Button>
                )}
              </CardFooter>
            </Card>
          </TabsContent>

          {/* 手動輸入標籤內容 */}
          <TabsContent value="manual">
            <Card>
              <CardHeader>
                <CardTitle>手動添加病歷</CardTitle>
                <CardDescription>手動填寫您的醫療記錄信息</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="hospital">醫院名稱</Label>
                      <Input
                        id="hospital"
                        name="hospital"
                        value={formData.hospital}
                        onChange={handleFormChange}
                        placeholder="例：台大醫院"
                        required
                        disabled={isSubmitting || isComplete}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">科別</Label>
                      <Select
                        value={formData.department}
                        onValueChange={(value) => handleSelectChange("department", value)}
                        disabled={isSubmitting || isComplete}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="選擇科別" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="腫瘤科">腫瘤科</SelectItem>
                          <SelectItem value="心臟內科">心臟內科</SelectItem>
                          <SelectItem value="神經內科">神經內科</SelectItem>
                          <SelectItem value="骨科">骨科</SelectItem>
                          <SelectItem value="家醫科">家醫科</SelectItem>
                          <SelectItem value="小兒科">小兒科</SelectItem>
                          <SelectItem value="婦產科">婦產科</SelectItem>
                          <SelectItem value="耳鼻喉科">耳鼻喉科</SelectItem>
                          <SelectItem value="眼科">眼科</SelectItem>
                          <SelectItem value="皮膚科">皮膚科</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">就診日期</Label>
                      <Input
                        id="date"
                        name="date"
                        type="date"
                        value={formData.date}
                        onChange={handleFormChange}
                        required
                        disabled={isSubmitting || isComplete}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="doctor">主治醫師</Label>
                      <Input
                        id="doctor"
                        name="doctor"
                        value={formData.doctor}
                        onChange={handleFormChange}
                        placeholder="例：王醫師"
                        disabled={isSubmitting || isComplete}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="diagnosis">診斷結果</Label>
                    <Textarea
                      id="diagnosis"
                      name="diagnosis"
                      value={formData.diagnosis}
                      onChange={handleFormChange}
                      placeholder="例：乳癌第二期"
                      required
                      disabled={isSubmitting || isComplete}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="treatments">治療方案</Label>
                    <Textarea
                      id="treatments"
                      name="treatments"
                      value={formData.treatments}
                      onChange={handleFormChange}
                      placeholder="例：手術切除、化療"
                      disabled={isSubmitting || isComplete}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="medications">用藥記錄</Label>
                    <Textarea
                      id="medications"
                      name="medications"
                      value={formData.medications}
                      onChange={handleFormChange}
                      placeholder="例：紫杉醇、環磷醯胺"
                      disabled={isSubmitting || isComplete}
                    />
                  </div>

                  {(isSubmitting || isComplete) && (
                    <div>
                      {isSubmitting && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">處理中...</p>
                            <p className="text-sm text-gray-500">{progress}%</p>
                          </div>
                          <Progress value={progress} className="h-2" />
                          <p className="text-xs text-gray-500">正在儲存您的病歷資訊，請稍候...</p>
                        </div>
                      )}

                      {isComplete && (
                        <Alert className="bg-green-50 text-green-800 border-green-200">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <AlertTitle>儲存成功</AlertTitle>
                          <AlertDescription>
                            <p>您的病歷資訊已成功儲存至系統</p>
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}
                </form>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" asChild>
                  <Link href="/medical-records">取消</Link>
                </Button>
                {!isComplete ? (
                  <Button
                    type="submit"
                    onClick={handleFormSubmit}
                    disabled={isSubmitting}
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        處理中...
                      </>
                    ) : (
                      "儲存"
                    )}
                  </Button>
                ) : (
                  <Button asChild className="bg-teal-600 hover:bg-teal-700">
                    <Link href="/medical-records">返回病歷管理</Link>
                  </Button>
                )}
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
