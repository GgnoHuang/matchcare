"use client"

import type React from "react"

import { useState, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Info, FileUp, FileText, CheckCircle2, AlertCircle, Loader2, Smartphone, Camera } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ImportInsurancePassbookPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
        <Link href="/insurance">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            返回AI保單健檢
          </Button>
        </Link>
      </div>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-2">從保險存摺批量導入保單</h1>
        <p className="text-gray-500 mb-8">透過台灣人壽保險業聯合會的保險存摺App，快速匯入您的所有保單資訊</p>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">保險存摺簡介</CardTitle>
            <CardDescription>
              保險存摺是由台灣人壽保險業聯合會所提供的服務，讓您能夠在一個App中查看您在各家保險公司的所有保單
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 bg-blue-50 p-4 rounded-lg">
              <Smartphone className="h-12 w-12 text-blue-700" />
              <div>
                <p className="font-medium text-blue-900 mb-1">尚未安裝保險存摺？</p>
                <div className="flex flex-wrap items-center gap-3">
                  <Button asChild variant="outline" className="gap-2">
                    <a
                      href="https://apps.apple.com/tw/app/%E4%BF%9D%E9%9A%AA%E5%AD%98%E6%91%BA/id1602613149"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      iOS下載
                    </a>
                  </Button>
                  <Button asChild variant="outline" className="gap-2">
                    <a
                      href="https://play.google.com/store/apps/details?id=tw.org.lia.roc.passbook&hl=zh_TW&pli=1"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Android下載
                    </a>
                  </Button>
                  <Button asChild variant="outline" className="gap-2">
                    <a href="https://insurtech.lia-roc.org.tw/" target="_blank" rel="noopener noreferrer">
                      網頁版
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-8 mb-8">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center text-blue-700 font-medium">
                  1
                </div>
                <CardTitle>登入保險存摺並驗證身分</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-700 mb-4">
                    首先，開啟您的保險存摺App，使用自然人憑證或健保卡進行登入，並依照App指示完成身份驗證。
                  </p>
                  <Alert className="mb-2">
                    <Info className="h-4 w-4" />
                    <AlertTitle>首次使用須知</AlertTitle>
                    <AlertDescription>
                      若您是首次使用保險存摺，需先完成身份驗證流程，可能需要等待1-3個工作天才能顯示完整的保單資料。
                    </AlertDescription>
                  </Alert>
                </div>
                <div className="rounded-lg overflow-hidden border bg-gray-50 flex items-center justify-center h-64">
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-04-27%20153411.jpg-iTU9tg13SVpoUJJ2mPaj1il2eWGYXV.jpeg"
                    alt="保險存摺登入畫面"
                    className="w-auto h-full object-contain"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center text-blue-700 font-medium">
                  2
                </div>
                <CardTitle>查看您的保單總覽</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-700 mb-4">
                    登入後，您將看到保單總覽頁面，顯示您目前擁有的保單數量及分類。點擊「查看詳情」按鈕進入保單列表。
                  </p>
                  <Alert variant="outline" className="mb-2">
                    <Info className="h-4 w-4" />
                    <AlertTitle>保單資料更新頻率</AlertTitle>
                    <AlertDescription>
                      保險存摺的資料通常每月更新一次，若您最近剛購買的保單可能尚未顯示在保險存摺中。
                    </AlertDescription>
                  </Alert>
                </div>
                <div className="rounded-lg overflow-hidden border bg-gray-50 flex items-center justify-center h-64">
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-04-27%20155218.jpg-0FPKCEACmej5IXgdVr9Rix9xzPbGXq.jpeg"
                    alt="保險存摺保單總覽畫面"
                    className="w-auto h-full object-contain"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center text-blue-700 font-medium">
                  3
                </div>
                <CardTitle>查看保單詳細資訊</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-700 mb-4">
                    在保單列表中，您可以看到所有保單的基本資訊，包括保險公司、保單名稱、保單號碼等。點擊任一保單可查看更詳細的資訊。
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700">
                    <li>查看保單列表頁面</li>
                    <li>確認保單資訊是否正確</li>
                    <li>點擊保單查看詳細內容</li>
                  </ol>
                </div>
                <div className="rounded-lg overflow-hidden border bg-gray-50 flex items-center justify-center h-64">
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-04-27%20153754.jpg-xheHfvsH3jxn5EmMKN0svAMIvZ5LB4.jpeg"
                    alt="保險存摺保單列表畫面"
                    className="w-auto h-full object-contain"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center text-blue-700 font-medium">
                  4
                </div>
                <CardTitle>截圖保存保單資訊</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-700 mb-4">
                    由於保險存摺不提供直接匯出功能，請您對保單列表頁面進行截圖，確保截圖中包含保單的重要資訊。
                  </p>
                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-medium text-gray-700">截圖時請確保包含以下資訊：</p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                      <li>保險公司名稱</li>
                      <li>保單號碼</li>
                      <li>保險類型</li>
                      <li>保障內容</li>
                      <li>保險金額（若顯示）</li>
                    </ul>
                  </div>
                  <Alert className="mt-4">
                    <Camera className="h-4 w-4" />
                    <AlertTitle>截圖小技巧</AlertTitle>
                    <AlertDescription>
                      <p>iOS設備：同時按下電源鍵和音量上鍵</p>
                      <p>Android設備：同時按下電源鍵和音量下鍵（各品牌可能略有不同）</p>
                      <p>電腦：使用截圖工具或按下PrintScreen鍵</p>
                    </AlertDescription>
                  </Alert>
                </div>
                <div className="rounded-lg overflow-hidden border bg-gray-50 flex items-center justify-center h-64 p-4">
                  <div className="flex flex-col items-center justify-center text-center space-y-2">
                    <Camera className="h-16 w-16 text-blue-500" />
                    <p className="text-gray-700">請對保單列表頁面進行截圖</p>
                    <p className="text-sm text-gray-500">確保截圖清晰可讀，包含所有重要資訊</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center text-blue-700 font-medium">
                  5
                </div>
                <CardTitle>上傳保單截圖到醫保快線</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 mb-4">
                現在，您可以將剛才保存的保單截圖上傳至醫保快線平台，我們的OCR技術將自動識別並匯入您的保單資訊。
              </p>

              <div className="grid w-full gap-1.5">
                <Label htmlFor="insurance-file">上傳保單截圖</Label>
                <div className="mt-2">
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="insurance-file"
                      className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <FileUp className="w-10 h-10 mb-3 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">點擊上傳</span> 或拖放截圖
                        </p>
                        <p className="text-xs text-gray-500">支援 JPG, PNG 或 HEIC 格式</p>
                        {file && (
                          <div className="mt-4 flex items-center gap-2 text-sm font-medium text-blue-600">
                            <FileText className="h-4 w-4" />
                            {file.name}
                          </div>
                        )}
                      </div>
                      <Input
                        id="insurance-file"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
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
                    <p className="text-sm font-medium">{isUploading ? "上傳中..." : "OCR處理中..."}</p>
                    <p className="text-sm text-gray-500">{progress}%</p>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-gray-500">
                    {isUploading
                      ? "正在上傳您的截圖，請稍候..."
                      : "正在使用OCR技術識別保單資訊，這可能需要幾分鐘時間..."}
                  </p>
                </div>
              )}

              {isComplete && (
                <Alert className="bg-green-50 text-green-800 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle>識別成功</AlertTitle>
                  <AlertDescription>
                    <p>您的保單資訊已成功識別並匯入，共識別 4 份保單：</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>新光人壽: 2 份</li>
                      <li>宏泰人壽: 1 份</li>
                      <li>富邦人壽: 1 份</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" asChild>
                <Link href="/insurance">取消</Link>
              </Button>
              {!isComplete ? (
                <Button
                  onClick={handleUpload}
                  disabled={!file || isUploading || isProcessing || isComplete}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isUploading || isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isUploading ? "上傳中..." : "OCR處理中..."}
                    </>
                  ) : (
                    "上傳並識別"
                  )}
                </Button>
              ) : (
                <Button asChild className="bg-teal-600 hover:bg-teal-700">
                  <Link href="/insurance">查看保單列表</Link>
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">常見問題</h2>
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">OCR識別準確率如何？</h3>
              <p className="text-gray-700">
                我們的OCR技術能夠識別大多數標準格式的保單資訊，但識別準確率會受到截圖清晰度、光線條件等因素影響。識別後，您可以在系統中檢查並修正任何不準確的資訊。
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">如果保險存摺中看不到我的某些保單怎麼辦？</h3>
              <p className="text-gray-700">
                保險存摺資料通常每月更新一次。如果您最近才購買的保單，可能尚未顯示。此外，部分舊保單資料可能不完整，建議您直接聯繫保險公司或使用手動添加功能。
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">識別失敗怎麼辦？</h3>
              <p className="text-gray-700">
                若識別失敗，請確保您的截圖清晰、完整，並包含所有必要的保單資訊。您也可以嘗試在光線充足的環境下重新截圖，或使用我們的手動添加功能。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
