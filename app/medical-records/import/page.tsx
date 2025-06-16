"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { FileUp, FileText, ArrowLeft, CheckCircle2, Info, AlertCircle, Loader2 } from "lucide-react"

export default function ImportMedicalRecordsPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setUploadError(null)
    }
  }

  const handleUpload = () => {
    if (!file) {
      setUploadError("請選擇檔案")
      return
    }

    setIsUploading(true)
    setProgress(0)

    // 模擬上傳過程
    const uploadInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(uploadInterval)
          setIsUploading(false)
          setIsProcessing(true)

          // 模擬處理過程
          setTimeout(() => {
            setIsProcessing(false)
            setIsComplete(true)
          }, 2000)

          return 100
        }
        return prev + 10
      })
    }, 300)
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
        <h1 className="text-3xl font-bold tracking-tight mb-2">導入醫療記錄</h1>
        <p className="text-gray-500 mb-8">從衛服部健康存摺或醫院系統導入您的醫療記錄</p>

        <Tabs defaultValue="health-passport" className="w-full">
          <TabsList className="mb-4 grid grid-cols-2 w-full max-w-md">
            <TabsTrigger value="health-passport">衛服部健康存摺</TabsTrigger>
            <TabsTrigger value="hospital">醫院系統</TabsTrigger>
          </TabsList>

          <TabsContent value="health-passport">
            <Card>
              <CardHeader>
                <CardTitle>從衛服部健康存摺導入</CardTitle>
                <CardDescription>請先從衛服部健康存摺網站下載您的醫療記錄，然後上傳至本平台</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>如何從衛服部健康存摺下載醫療記錄？</AlertTitle>
                  <AlertDescription>
                    <ol className="list-decimal list-inside space-y-1 mt-2">
                      <li>
                        前往
                        <a
                          href="https://eecapply.mohw.gov.tw/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-teal-600 hover:underline mx-1"
                        >
                          衛服部健康存摺網站
                        </a>
                      </li>
                      <li>使用健保卡或自然人憑證登入</li>
                      <li>選擇「下載健康資料」</li>
                      <li>選擇要下載的資料類型（如：門診紀錄、住院紀錄等）</li>
                      <li>下載XML或PDF格式的檔案</li>
                    </ol>
                  </AlertDescription>
                </Alert>

                <div className="grid w-full gap-1.5">
                  <Label htmlFor="health-passport-file">上傳健康存摺檔案</Label>
                  <div className="mt-2">
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor="health-passport-file"
                        className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <FileUp className="w-10 h-10 mb-3 text-gray-400" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">點擊上傳</span> 或拖放檔案
                          </p>
                          <p className="text-xs text-gray-500">支援 XML 或 PDF 格式</p>
                          {file && (
                            <div className="mt-4 flex items-center gap-2 text-sm font-medium text-teal-600">
                              <FileText className="h-4 w-4" />
                              {file.name}
                            </div>
                          )}
                        </div>
                        <Input
                          id="health-passport-file"
                          type="file"
                          accept=".xml,.pdf"
                          className="hidden"
                          onChange={handleFileChange}
                          disabled={isUploading || isProcessing || isComplete}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {uploadError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>錯誤</AlertTitle>
                    <AlertDescription>{uploadError}</AlertDescription>
                  </Alert>
                )}

                {(isUploading || isProcessing) && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{isUploading ? "上傳中..." : "處理中..."}</p>
                      <p className="text-sm text-gray-500">{progress}%</p>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-gray-500">
                      {isUploading ? "正在上傳您的檔案，請稍候..." : "正在分析您的醫療記錄，這可能需要幾分鐘時間..."}
                    </p>
                  </div>
                )}

                {isComplete && (
                  <Alert className="bg-green-50 text-green-800 border-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertTitle>處理完成</AlertTitle>
                    <AlertDescription>
                      <p>您的醫療記錄已成功導入，共導入 4 筆記錄：</p>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>台大醫院 - 腫瘤科 (2023-12-15)</li>
                        <li>榮總 - 心臟內科 (2023-10-05)</li>
                        <li>三軍總醫院 - 骨科 (2023-08-22)</li>
                        <li>長庚醫院 - 神經內科 (2023-07-10)</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" asChild disabled={isUploading || isProcessing}>
                  <Link href="/medical-records">取消</Link>
                </Button>
                {!isComplete ? (
                  <Button
                    onClick={handleUpload}
                    disabled={!file || isUploading || isProcessing || isComplete}
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    {isUploading || isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isUploading ? "上傳中..." : "處理中..."}
                      </>
                    ) : (
                      "上傳檔案"
                    )}
                  </Button>
                ) : (
                  <Button asChild className="bg-teal-600 hover:bg-teal-700">
                    <Link href="/medical-records">查看病歷</Link>
                  </Button>
                )}
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="hospital">
            <Card>
              <CardHeader>
                <CardTitle>從醫院系統導入</CardTitle>
                <CardDescription>直接從合作醫院系統導入您的醫療記錄</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {["台大醫院", "榮總", "三軍總醫院", "長庚醫院", "馬偕醫院", "新光醫院"].map((hospital) => (
                    <Card key={hospital} className="cursor-pointer hover:bg-gray-50">
                      <CardHeader className="p-4">
                        <CardTitle className="text-base">{hospital}</CardTitle>
                      </CardHeader>
                      <CardFooter className="p-4 pt-0">
                        <Button variant="outline" size="sm" className="w-full">
                          連結帳號
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
