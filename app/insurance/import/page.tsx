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
import { FileUp, FileText, ArrowLeft, CheckCircle2, Info, AlertCircle, Loader2, Shield } from "lucide-react"

export default function ImportInsurancePage() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null)
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  })
  const [isUploaded, setIsUploaded] = useState(false)

  const insuranceCompanies = [
    { id: "cathay", name: "國泰人壽", logo: "/placeholder.svg?height=60&width=120" },
    { id: "shin-kong", name: "新光人壽", logo: "/placeholder.svg?height=60&width=120" },
    { id: "fubon", name: "富邦人壽", logo: "/placeholder.svg?height=60&width=120" },
    { id: "nanshan", name: "南山人壽", logo: "/placeholder.svg?height=60&width=120" },
    { id: "global", name: "全球人壽", logo: "/placeholder.svg?height=60&width=120" },
    { id: "china", name: "中國人壽", logo: "/placeholder.svg?height=60&width=120" },
  ]

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

  const handleConnect = () => {
    if (!credentials.username || !credentials.password) {
      setUploadError("請輸入帳號密碼")
      return
    }

    setIsUploading(true)
    setProgress(0)

    // 模擬連接過程
    const connectInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(connectInterval)
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
        <Link href="/insurance">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            返回保單管理
          </Button>
        </Link>
      </div>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-2">導入保險保單</h1>
        <p className="text-gray-500 mb-8">從保險公司或手動上傳保單資訊</p>

        <Tabs defaultValue="api" className="w-full">
          <TabsList className="mb-4 grid grid-cols-2 w-full max-w-md">
            <TabsTrigger value="api">保險公司帳號連結</TabsTrigger>
            <TabsTrigger value="manual">手動上傳</TabsTrigger>
          </TabsList>

          <TabsContent value="api">
            <Card>
              <CardHeader>
                <CardTitle>連結保險公司帳號</CardTitle>
                <CardDescription>直接連結您的保險公司帳號，自動導入所有保單資訊</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!selectedCompany ? (
                  <>
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertTitle>選擇保險公司</AlertTitle>
                      <AlertDescription>請選擇您的保險公司，然後輸入您的帳號密碼進行連結</AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {insuranceCompanies.map((company) => (
                        <Card
                          key={company.id}
                          className="cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => setSelectedCompany(company.id)}
                        >
                          <CardHeader className="p-4">
                            <div className="flex flex-col items-center text-center">
                              <Shield className="h-10 w-10 text-teal-600 mb-2" />
                              <CardTitle className="text-base">{company.name}</CardTitle>
                            </div>
                          </CardHeader>
                        </Card>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertTitle>輸入帳號密碼</AlertTitle>
                      <AlertDescription>
                        請輸入您在{insuranceCompanies.find((c) => c.id === selectedCompany)?.name}的帳號密碼
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="username">帳號</Label>
                        <Input
                          id="username"
                          placeholder="請輸入帳號"
                          value={credentials.username}
                          onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                          disabled={isUploading || isProcessing || isComplete}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="password">密碼</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="請輸入密碼"
                          value={credentials.password}
                          onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                          disabled={isUploading || isProcessing || isComplete}
                        />
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
                          <p className="text-sm font-medium">{isUploading ? "連接中..." : "處理中..."}</p>
                          <p className="text-sm text-gray-500">{progress}%</p>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <p className="text-xs text-gray-500">
                          {isUploading
                            ? "正在連接保險公司系統，請稍候..."
                            : "正在分析您的保單資訊，這可能需要幾分鐘時間..."}
                        </p>
                      </div>
                    )}

                    {isComplete && (
                      <Alert className="bg-green-50 text-green-800 border-green-200">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertTitle>連結成功</AlertTitle>
                        <AlertDescription>
                          <p>您的保單資訊已成功導入，共導入 3 份保單：</p>
                          <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>安心醫療保險 (CT-MED-123456)</li>
                            <li>重大疾病保險 (SK-CI-789012)</li>
                            <li>意外傷害保險 (FB-PA-345678)</li>
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}
                  </>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                {selectedCompany ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedCompany(null)
                        setCredentials({ username: "", password: "" })
                        setUploadError(null)
                        setIsUploaded(false)
                        setIsComplete(false)
                        setProgress(0)
                      }}
                      disabled={isUploading || isProcessing}
                    >
                      返回
                    </Button>
                    {!isComplete ? (
                      <Button
                        onClick={handleConnect}
                        disabled={
                          !credentials.username || !credentials.password || isUploading || isProcessing || isComplete
                        }
                        className="bg-teal-600 hover:bg-teal-700"
                      >
                        {isUploading || isProcessing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {isUploading ? "連接中..." : "處理中..."}
                          </>
                        ) : (
                          "連結帳號"
                        )}
                      </Button>
                    ) : (
                      <Button asChild className="bg-teal-600 hover:bg-teal-700">
                        <Link href="/insurance">查看保單</Link>
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    <Button variant="outline" asChild>
                      <Link href="/insurance">取消</Link>
                    </Button>
                    <Button disabled>請選擇保險公司</Button>
                  </>
                )}
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="manual">
            <Card>
              <CardHeader>
                <CardTitle>手動上傳保單</CardTitle>
                <CardDescription>上傳您的保單PDF或圖片檔案</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>支援的檔案格式</AlertTitle>
                  <AlertDescription>您可以上傳 PDF、JPG 或 PNG 格式的保單掃描檔或照片</AlertDescription>
                </Alert>

                <div className="grid w-full gap-1.5">
                  <Label htmlFor="policy-file">上傳保單檔案</Label>
                  <div className="mt-2">
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor="policy-file"
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
                          id="policy-file"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
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
                      {isUploading ? "正在上傳您的檔案，請稍候..." : "正在分析您的保單內容，這可能需要幾分鐘時間..."}
                    </p>
                  </div>
                )}

                {isComplete && (
                  <Alert className="bg-green-50 text-green-800 border-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertTitle>上傳成功</AlertTitle>
                    <AlertDescription>
                      <p>您的保單已成功上傳並分析完成：</p>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>保險公司: 國泰人壽</li>
                        <li>保單名稱: 安心醫療保險</li>
                        <li>保單號碼: CT-MED-123456</li>
                        <li>保障期間: 2020-01-15 至 2030-01-14</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" asChild disabled={isUploading || isProcessing}>
                  <Link href="/insurance">取消</Link>
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
                    <Link href="/insurance">查看保單</Link>
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
