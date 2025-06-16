"use client"

import { useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, CheckCircle2, FileText, Shield, Upload, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function NewClaimPage() {
  const searchParams = useSearchParams()
  const recordId = searchParams.get("record")
  const policyId = searchParams.get("policy")

  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [progress, setProgress] = useState(0)

  // 假設的病歷資料
  const medicalRecord = recordId
    ? {
        id: Number.parseInt(recordId),
        hospital: "台大醫院",
        department: "腫瘤科",
        date: "2023-12-15",
        diagnosis: "乳癌第二期",
        doctor: "林醫師",
        treatments: ["手術切除", "化療"],
        medications: ["紫杉醇", "環磷醯胺"],
        claimSuccessRate: 95,
      }
    : null

  // 假設的匹配保單
  const matchedPolicies = [
    {
      id: 1,
      company: "國泰人壽",
      name: "安心醫療保險",
      type: "醫療險",
      policyNumber: "CT-MED-123456",
      coverage: [
        { type: "住院醫療", amount: 3000, unit: "元/日", maxDays: 180, eligible: true, estimatedAmount: 36000 },
        { type: "手術費用", amount: 100000, unit: "元/次", eligible: true, estimatedAmount: 100000 },
        { type: "癌症治療", amount: 500000, unit: "元/年", eligible: true, estimatedAmount: 500000 },
      ],
      selected: true,
      totalEstimatedAmount: 636000,
    },
    {
      id: 2,
      company: "新光人壽",
      name: "重大疾病保險",
      type: "重疾險",
      policyNumber: "SK-CI-789012",
      coverage: [{ type: "癌症", amount: 1000000, unit: "元", eligible: true, estimatedAmount: 1000000 }],
      selected: false,
      totalEstimatedAmount: 1000000,
    },
  ]

  // 所需文件清單
  const requiredDocuments = [
    { id: "diagnosis", name: "診斷證明書", required: true, uploaded: false },
    { id: "receipt", name: "醫療費用收據", required: true, uploaded: false },
    { id: "treatment", name: "治療明細", required: true, uploaded: false },
    { id: "id", name: "身分證正反面影本", required: true, uploaded: false },
    { id: "bankbook", name: "存摺封面影本", required: true, uploaded: false },
  ]

  const handleSubmit = () => {
    setIsSubmitting(true)
    setProgress(0)

    // 模擬提交過程
    const submitInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(submitInterval)
          setIsSubmitting(false)
          setIsSubmitted(true)
          setStep(4)
          return 100
        }
        return prev + 5
      })
    }, 100)
  }

  return (
    <div className="container py-8">
      <div className="flex items-center mb-8">
        <Link href="/claims">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            返回理賠管理
          </Button>
        </Link>
      </div>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-2">申請理賠</h1>
        <p className="text-gray-500 mb-8">依照步驟完成理賠申請</p>

        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-gray-200 z-0"></div>
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`relative z-10 flex items-center justify-center rounded-full w-10 h-10 ${
                  s < step
                    ? "bg-teal-600 text-white"
                    : s === step
                      ? "bg-teal-600 text-white"
                      : "bg-gray-200 text-gray-500"
                }`}
              >
                {s < step ? <CheckCircle2 className="h-5 w-5" /> : s}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm font-medium">選擇病歷</span>
            <span className="text-sm font-medium">選擇保單</span>
            <span className="text-sm font-medium">上傳文件</span>
            <span className="text-sm font-medium">確認送出</span>
          </div>
        </div>

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>選擇病歷</CardTitle>
              <CardDescription>請選擇您要申請理賠的病歷記錄</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    <Checkbox id="record-1" checked={!!medicalRecord} />
                    <div className="grid gap-1.5">
                      <Label htmlFor="record-1" className="font-medium">
                        台大醫院 - 腫瘤科 (2023-12-15)
                      </Label>
                      <p className="text-sm text-gray-500">診斷結果: 乳癌第二期</p>
                      <p className="text-sm text-gray-500">主治醫師: 林醫師</p>
                      <p className="text-sm text-gray-500">治療方案: 手術切除, 化療</p>
                    </div>
                  </div>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    <Checkbox id="record-2" />
                    <div className="grid gap-1.5">
                      <Label htmlFor="record-2" className="font-medium">
                        榮總 - 心臟內科 (2023-10-05)
                      </Label>
                      <p className="text-sm text-gray-500">診斷結果: 心肌梗塞</p>
                      <p className="text-sm text-gray-500">主治醫師: 王醫師</p>
                      <p className="text-sm text-gray-500">治療方案: 心導管手術, 藥物治療</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" asChild>
                <Link href="/claims">取消</Link>
              </Button>
              <Button onClick={() => setStep(2)} className="bg-teal-600 hover:bg-teal-700">
                下一步
              </Button>
            </CardFooter>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>選擇保單</CardTitle>
              <CardDescription>請選擇符合理賠條件的保單</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {matchedPolicies.map((policy) => (
                  <div key={policy.id} className="border rounded-lg overflow-hidden">
                    <div className="p-4">
                      <div className="flex items-start gap-4">
                        <Checkbox id={`policy-${policy.id}`} checked={policy.selected} />
                        <div className="grid gap-1.5">
                          <Label htmlFor={`policy-${policy.id}`} className="font-medium">
                            {policy.company} - {policy.name}
                          </Label>
                          <p className="text-sm text-gray-500">保單號碼: {policy.policyNumber}</p>
                          <p className="text-sm text-gray-500">保單類型: {policy.type}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 border-t">
                      <h4 className="text-sm font-medium mb-2">符合理賠項目</h4>
                      <div className="space-y-2">
                        {policy.coverage.map((item, index) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <span>
                              {item.type} ({item.amount.toLocaleString()} {item.unit})
                            </span>
                            <span className="font-medium">{item.estimatedAmount.toLocaleString()} 元</span>
                          </div>
                        ))}
                        <div className="flex justify-between items-center pt-2 border-t text-sm font-medium">
                          <span>預估理賠金額</span>
                          <span className="text-teal-600">{policy.totalEstimatedAmount.toLocaleString()} 元</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                上一步
              </Button>
              <Button onClick={() => setStep(3)} className="bg-teal-600 hover:bg-teal-700">
                下一步
              </Button>
            </CardFooter>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>上傳文件</CardTitle>
              <CardDescription>請上傳理賠所需的文件</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertTitle>所需文件</AlertTitle>
                  <AlertDescription>請準備以下文件的電子檔案（PDF、JPG 或 PNG 格式），並上傳至系統。</AlertDescription>
                </Alert>

                <div className="space-y-4">
                  {requiredDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium">{doc.name}</p>
                          <p className="text-xs text-gray-500">{doc.required ? "必要文件" : "選填文件"}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="gap-1">
                        <Upload className="h-3 w-3" />
                        上傳
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                上一步
              </Button>
              <Button onClick={() => setStep(4)} className="bg-teal-600 hover:bg-teal-700">
                下一步
              </Button>
            </CardFooter>
          </Card>
        )}

        {step === 4 && !isSubmitted && (
          <Card>
            <CardHeader>
              <CardTitle>確認送出</CardTitle>
              <CardDescription>請確認以下資訊無誤，再送出理賠申請</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-500">病歷資訊</h3>
                    <div className="border rounded-lg p-4">
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">診斷結果</p>
                            <p className="text-sm text-gray-500">乳癌第二期</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">就醫醫院</p>
                            <p className="text-sm text-gray-500">台大醫院 - 腫瘤科</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">就醫日期</p>
                            <p className="text-sm text-gray-500">2023-12-15</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-500">保單資訊</h3>
                    <div className="border rounded-lg p-4">
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <Shield className="h-5 w-5 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">保險公司</p>
                            <p className="text-sm text-gray-500">國泰人壽</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Shield className="h-5 w-5 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">保單名稱</p>
                            <p className="text-sm text-gray-500">安心醫療保險</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Shield className="h-5 w-5 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">保單號碼</p>
                            <p className="text-sm text-gray-500">CT-MED-123456</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-500">理賠項目</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <div className="grid grid-cols-3 p-4 text-sm font-medium bg-gray-50">
                      <div>項目</div>
                      <div>保障內容</div>
                      <div className="text-right">預估理賠金額</div>
                    </div>
                    <div className="divide-y">
                      {matchedPolicies[0].coverage.map((item, index) => (
                        <div key={index} className="grid grid-cols-3 p-4 text-sm">
                          <div>{item.type}</div>
                          <div>
                            {item.amount.toLocaleString()} {item.unit}
                          </div>
                          <div className="text-right">{item.estimatedAmount.toLocaleString()} 元</div>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 p-4 text-sm font-medium bg-gray-50 border-t">
                      <div className="col-span-2">預估總理賠金額</div>
                      <div className="text-right text-teal-600">
                        {matchedPolicies[0].totalEstimatedAmount.toLocaleString()} 元
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2 pt-2">
                  <Checkbox id="confirm" />
                  <div className="grid gap-1.5">
                    <Label htmlFor="confirm" className="text-sm">
                      我確認以上資訊正確，並同意授權醫保通代為申請理賠
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(3)}>
                上一步
              </Button>
              <Button onClick={handleSubmit} className="bg-teal-600 hover:bg-teal-700">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    處理中...
                  </>
                ) : (
                  "送出申請"
                )}
              </Button>
            </CardFooter>
          </Card>
        )}

        {isSubmitted && (
          <Card>
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4 rounded-full bg-green-100 p-3 w-16 h-16 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">申請已送出</CardTitle>
              <CardDescription>您的理賠申請已成功送出</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">申請編號</p>
                      <p className="font-medium">CL-20240424-001</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">申請日期</p>
                      <p className="font-medium">2024-04-24</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">保險公司</p>
                      <p className="font-medium">國泰人壽</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">預估處理時間</p>
                      <p className="font-medium">5-7 個工作天</p>
                    </div>
                  </div>
                </div>
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertTitle>後續流程</AlertTitle>
                  <AlertDescription>
                    <p>您的理賠申請已送至保險公司，我們將持續追蹤處理進度，並在有更新時通知您。</p>
                    <p className="mt-1">您可以隨時在「理賠管理」頁面查看申請進度。</p>
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center gap-4">
              <Button variant="outline" asChild>
                <Link href="/claims">返回理賠管理</Link>
              </Button>
              <Button asChild className="bg-teal-600 hover:bg-teal-700">
                <Link href="/claims/status/CL-20240424-001">查看申請進度</Link>
              </Button>
            </CardFooter>
          </Card>
        )}

        {isSubmitting && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">處理中...</p>
              <p className="text-sm text-gray-500">{progress}%</p>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-gray-500">正在處理您的理賠申請，請稍候...</p>
          </div>
        )}
      </div>
    </div>
  )
}
