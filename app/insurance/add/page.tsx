"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, FileUp, FileText, Camera, CheckCircle2, AlertCircle, Loader2, Calendar } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"

export default function AddInsurancePage() {
  const [activeTab, setActiveTab] = useState("auto")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [showCamera, setShowCamera] = useState(false)
  const [coverageItems, setCoverageItems] = useState([{ type: "", amount: "", unit: "元" }])

  // 表單欄位
  const [formData, setFormData] = useState({
    company: "",
    policyType: "",
    policyName: "",
    policyNumber: "",
    startDate: "",
    endDate: "",
    insured: "",
    beneficiary: "",
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

  const handleCoverageChange = (index: number, field: string, value: string) => {
    const newCoverageItems = [...coverageItems]
    newCoverageItems[index] = { ...newCoverageItems[index], [field]: value }
    setCoverageItems(newCoverageItems)
  }

  const addCoverageItem = () => {
    setCoverageItems([...coverageItems, { type: "", amount: "", unit: "元" }])
  }

  const removeCoverageItem = (index: number) => {
    setCoverageItems(coverageItems.filter((_, i) => i !== index))
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
        <Link href="/insurance">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            返回保單管理
          </Button>
        </Link>
      </div>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-2">添加保單</h1>
        <p className="text-gray-500 mb-8">手動添加或上傳您的保險保單資訊</p>

        <Tabs defaultValue="auto" className="w-full" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 grid grid-cols-2 w-full max-w-md">
            <TabsTrigger value="auto">自動辨識</TabsTrigger>
            <TabsTrigger value="manual">手動輸入</TabsTrigger>
          </TabsList>

          {/* 自動辨識標籤內容 */}
          <TabsContent value="auto">
            <Card>
              <CardHeader>
                <CardTitle>自動辨識保單</CardTitle>
                <CardDescription>上傳保單文件或拍攝保單照片，系統將自動識別內容</CardDescription>
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
                      <li>上傳前請遮蓋敏感個人資料如身分證號等</li>
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
                        <p className="text-xs text-gray-500">正在辨識您的保單資訊，請稍候...</p>
                      </div>
                    )}

                    {isComplete && (
                      <Alert className="bg-green-50 text-green-800 border-green-200">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertTitle>辨識完成</AlertTitle>
                        <AlertDescription>
                          <p>系統已成功辨識您的保單資訊：</p>
                          <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>保險公司：國泰人壽</li>
                            <li>保單名稱：安心醫療保險</li>
                            <li>保單號碼：CT-MED-123456</li>
                            <li>保障期間：2020-01-15 至 2030-01-14</li>
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
                  <Link href="/insurance">取消</Link>
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
                <CardTitle>手動添加保單</CardTitle>
                <CardDescription>填寫您的保險保單資訊</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleFormSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-md font-medium">基本資訊</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="company">保險公司</Label>
                        <Select
                          value={formData.company}
                          onValueChange={(value) => handleSelectChange("company", value)}
                          disabled={isSubmitting || isComplete}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="選擇保險公司" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="國泰人壽">國泰人壽</SelectItem>
                            <SelectItem value="新光人壽">新光人壽</SelectItem>
                            <SelectItem value="富邦人壽">富邦人壽</SelectItem>
                            <SelectItem value="南山人壽">南山人壽</SelectItem>
                            <SelectItem value="全球人壽">全球人壽</SelectItem>
                            <SelectItem value="中國人壽">中國人壽</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="policyType">保單類型</Label>
                        <Select
                          value={formData.policyType}
                          onValueChange={(value) => handleSelectChange("policyType", value)}
                          disabled={isSubmitting || isComplete}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="選擇保單類型" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="醫療險">醫療險</SelectItem>
                            <SelectItem value="重疾險">重疾險</SelectItem>
                            <SelectItem value="意外險">意外險</SelectItem>
                            <SelectItem value="壽險">壽險</SelectItem>
                            <SelectItem value="癌症險">癌症險</SelectItem>
                            <SelectItem value="住院險">住院險</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="policyName">保單名稱</Label>
                        <Input
                          id="policyName"
                          name="policyName"
                          value={formData.policyName}
                          onChange={handleFormChange}
                          placeholder="例：安心醫療保險"
                          required
                          disabled={isSubmitting || isComplete}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="policyNumber">保單號碼</Label>
                        <Input
                          id="policyNumber"
                          name="policyNumber"
                          value={formData.policyNumber}
                          onChange={handleFormChange}
                          placeholder="例：CT-MED-123456"
                          required
                          disabled={isSubmitting || isComplete}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startDate">保障開始日期</Label>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <Input
                            id="startDate"
                            name="startDate"
                            type="date"
                            value={formData.startDate}
                            onChange={handleFormChange}
                            required
                            disabled={isSubmitting || isComplete}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endDate">保障結束日期</Label>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <Input
                            id="endDate"
                            name="endDate"
                            type="date"
                            value={formData.endDate}
                            onChange={handleFormChange}
                            required
                            disabled={isSubmitting || isComplete}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-md font-medium">保障範圍</h3>

                    {coverageItems.map((item, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 items-end">
                        <div className="col-span-5 space-y-2">
                          <Label htmlFor={`coverage-type-${index}`}>項目名稱</Label>
                          <Input
                            id={`coverage-type-${index}`}
                            value={item.type}
                            onChange={(e) => handleCoverageChange(index, "type", e.target.value)}
                            placeholder="例：住院醫療"
                            disabled={isSubmitting || isComplete}
                          />
                        </div>
                        <div className="col-span-3 space-y-2">
                          <Label htmlFor={`coverage-amount-${index}`}>金額</Label>
                          <Input
                            id={`coverage-amount-${index}`}
                            value={item.amount}
                            onChange={(e) => handleCoverageChange(index, "amount", e.target.value)}
                            placeholder="例：3000"
                            type="number"
                            disabled={isSubmitting || isComplete}
                          />
                        </div>
                        <div className="col-span-3 space-y-2">
                          <Label htmlFor={`coverage-unit-${index}`}>單位</Label>
                          <Select
                            value={item.unit}
                            onValueChange={(value) => handleCoverageChange(index, "unit", value)}
                            disabled={isSubmitting || isComplete}
                          >
                            <SelectTrigger id={`coverage-unit-${index}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="元">元</SelectItem>
                              <SelectItem value="元/日">元/日</SelectItem>
                              <SelectItem value="元/次">元/次</SelectItem>
                              <SelectItem value="元/年">元/年</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-1">
                          {coverageItems.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeCoverageItem(index)}
                              disabled={isSubmitting || isComplete}
                            >
                              <span className="sr-only">移除</span>
                              <span className="text-xl">×</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addCoverageItem}
                      className="mt-2"
                      disabled={isSubmitting || isComplete}
                    >
                      + 新增保障項目
                    </Button>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-md font-medium">其他資訊</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="insured">被保險人</Label>
                        <Input
                          id="insured"
                          name="insured"
                          value={formData.insured}
                          onChange={handleFormChange}
                          placeholder="例：王小明"
                          disabled={isSubmitting || isComplete}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="beneficiary">受益人</Label>
                        <Input
                          id="beneficiary"
                          name="beneficiary"
                          value={formData.beneficiary}
                          onChange={handleFormChange}
                          placeholder="例：王大明"
                          disabled={isSubmitting || isComplete}
                        />
                      </div>
                    </div>
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
                          <p className="text-xs text-gray-500">正在儲存您的保單資訊，請稍候...</p>
                        </div>
                      )}

                      {isComplete && (
                        <Alert className="bg-green-50 text-green-800 border-green-200">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <AlertTitle>儲存成功</AlertTitle>
                          <AlertDescription>
                            <p>您的保單資訊已成功儲存至系統</p>
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}
                </form>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" asChild>
                  <Link href="/insurance">取消</Link>
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
                    <Link href="/insurance">返回保單管理</Link>
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
