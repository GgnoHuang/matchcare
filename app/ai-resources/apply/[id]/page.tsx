"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ChevronLeft,
  ChevronRight,
  Shield,
  Building,
  CreditCard,
  Scale,
  FileCheck,
  Upload,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Loader2,
  FileText,
} from "lucide-react"

export default function ResourceApplyPage({ params }) {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  // 模擬資源數據
  const resource = {
    id: params.id,
    category: "政府補助",
    subcategory: "國家級",
    title: "重大傷病醫療補助",
    organization: "衛生福利部",
    eligibility: "符合全民健康保險重大傷病範圍者",
    amount: "醫療費用全額補助",
    deadline: "常年受理",
    matchedConditions: ["乳癌第二期", "腦瘤"],
    details:
      "凡是符合健保重大傷病範圍，且領有重大傷病證明的民眾，可享有醫療費用全額補助。包括門診、住院、手術、藥物等相關醫療費用，不需負擔部分負擔費用。",
    status: "eligible",
    priority: "high",
    icon: <Shield className="h-5 w-5 text-blue-600" />,
    requiredDocuments: ["身分證正反面影本", "重大傷病證明正本或影本", "醫療費用收據正本", "存摺封面影本", "申請表"],
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case "政府補助":
        return <Shield className="h-5 w-5 text-blue-600" />
      case "企業福利":
        return <Building className="h-5 w-5 text-green-600" />
      case "保單理賠":
        return <Shield className="h-5 w-5 text-teal-600" />
      case "金融產品":
        return <CreditCard className="h-5 w-5 text-purple-600" />
      case "法律救助":
        return <Scale className="h-5 w-5 text-red-600" />
      default:
        return null
    }
  }

  const nextStep = () => {
    setStep(step + 1)
    window.scrollTo(0, 0)
  }

  const prevStep = () => {
    setStep(step - 1)
    window.scrollTo(0, 0)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    // 模擬提交過程
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
      setStep(5)
    }, 2000)
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Link href={`/ai-resources/${params.id}`}>
          <Button variant="ghost" size="sm" className="gap-1">
            <ChevronLeft className="h-4 w-4" />
            返回資源詳情
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          {getCategoryIcon(resource.category)}
          <Badge variant="outline" className="bg-white">
            {resource.category} - {resource.subcategory}
          </Badge>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          申請 {resource.title} - {resource.organization}
        </h1>
        <p className="text-gray-500 mt-1">請依照步驟填寫申請資料，並上傳必要文件</p>
      </div>

      <div className="mb-8">
        <div className="relative">
          <Progress value={(step / 5) * 100} className="h-2" />
          <div className="mt-2 grid grid-cols-5 text-xs md:text-sm">
            <div
              className={`text-center ${
                step >= 1 ? "text-blue-600 font-medium" : "text-gray-400"
              } flex flex-col items-center`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 ${
                  step >= 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-400"
                }`}
              >
                1
              </div>
              <span className="hidden md:inline">基本資料</span>
            </div>
            <div
              className={`text-center ${
                step >= 2 ? "text-blue-600 font-medium" : "text-gray-400"
              } flex flex-col items-center`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 ${
                  step >= 2 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-400"
                }`}
              >
                2
              </div>
              <span className="hidden md:inline">申請資格</span>
            </div>
            <div
              className={`text-center ${
                step >= 3 ? "text-blue-600 font-medium" : "text-gray-400"
              } flex flex-col items-center`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 ${
                  step >= 3 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-400"
                }`}
              >
                3
              </div>
              <span className="hidden md:inline">上傳文件</span>
            </div>
            <div
              className={`text-center ${
                step >= 4 ? "text-blue-600 font-medium" : "text-gray-400"
              } flex flex-col items-center`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 ${
                  step >= 4 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-400"
                }`}
              >
                4
              </div>
              <span className="hidden md:inline">確認資料</span>
            </div>
            <div
              className={`text-center ${
                step >= 5 ? "text-blue-600 font-medium" : "text-gray-400"
              } flex flex-col items-center`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 ${
                  step >= 5 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-400"
                }`}
              >
                5
              </div>
              <span className="hidden md:inline">完成申請</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                {step === 1 && "基本資料"}
                {step === 2 && "申請資格確認"}
                {step === 3 && "上傳必要文件"}
                {step === 4 && "確認申請資料"}
                {step === 5 && "申請完成"}
              </CardTitle>
              <CardDescription>
                {step === 1 && "請填寫您的個人基本資料"}
                {step === 2 && "請確認您符合申請資格"}
                {step === 3 && "請上傳申請所需的文件"}
                {step === 4 && "請確認所有申請資料無誤"}
                {step === 5 && "您的申請已成功提交"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {step === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">姓名</Label>
                      <Input id="name" placeholder="請輸入姓名" defaultValue="王小明" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="id">身分證字號</Label>
                      <Input id="id" placeholder="請輸入身分證字號" defaultValue="A123456789" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="birthdate">出生日期</Label>
                      <Input id="birthdate" type="date" defaultValue="1980-01-01" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">性別</Label>
                      <RadioGroup defaultValue="male" className="flex gap-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="male" id="male" />
                          <Label htmlFor="male">男</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="female" id="female" />
                          <Label htmlFor="female">女</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">聯絡電話</Label>
                      <Input id="phone" placeholder="請輸入聯絡電話" defaultValue="0912345678" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">電子郵件</Label>
                      <Input id="email" type="email" placeholder="請輸入電子郵件" defaultValue="example@gmail.com" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">聯絡地址</Label>
                    <Input id="address" placeholder="請輸入聯絡地址" defaultValue="台北市信義區市府路1號" />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <Alert className="bg-amber-50 border-amber-200">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <AlertTitle className="text-amber-600">申請資格確認</AlertTitle>
                    <AlertDescription>
                      請確認您符合以下申請資格，若不符合可能導致申請被拒絕。若有疑問，請參考常見問題或聯繫客服。
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium mb-2">申請資格</h3>
                      <p className="text-gray-700 mb-4">{resource.eligibility}</p>
                      <div className="space-y-2">
                        <div className="flex items-start space-x-2">
                          <Checkbox id="eligibility1" defaultChecked />
                          <div className="grid gap-1.5 leading-none">
                            <Label htmlFor="eligibility1" className="text-sm font-normal">
                              我已領有健保重大傷病證明
                            </Label>
                          </div>
                        </div>
                        <div className="flex items-start space-x-2">
                          <Checkbox id="eligibility2" defaultChecked />
                          <div className="grid gap-1.5 leading-none">
                            <Label htmlFor="eligibility2" className="text-sm font-normal">
                              我的醫療費用是因重大傷病所產生
                            </Label>
                          </div>
                        </div>
                        <div className="flex items-start space-x-2">
                          <Checkbox id="eligibility3" defaultChecked />
                          <div className="grid gap-1.5 leading-none">
                            <Label htmlFor="eligibility3" className="text-sm font-normal">
                              我有保留相關醫療費用收據正本
                            </Label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium mb-2">匹配的病歷記錄</h3>
                      <p className="text-gray-700 mb-4">系統已自動匹配以下病歷記錄，請確認是否正確</p>
                      <div className="space-y-2">
                        <div className="flex items-start space-x-2">
                          <Checkbox id="record1" defaultChecked />
                          <div className="grid gap-1.5 leading-none">
                            <Label htmlFor="record1" className="text-sm font-normal">
                              台大醫院 - 腫瘤科 - 乳癌第二期 (2023-12-15)
                            </Label>
                          </div>
                        </div>
                        <div className="flex items-start space-x-2">
                          <Checkbox id="record2" defaultChecked />
                          <div className="grid gap-1.5 leading-none">
                            <Label htmlFor="record2" className="text-sm font-normal">
                              台北榮民總醫院 - 神經外科 - 腦瘤 (2022-11-15)
                            </Label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium mb-2">申請項目</h3>
                      <p className="text-gray-700 mb-4">請選擇您要申請的項目</p>
                      <RadioGroup defaultValue="all" className="space-y-2">
                        <div className="flex items-start space-x-2">
                          <RadioGroupItem value="all" id="all" />
                          <div className="grid gap-1.5 leading-none">
                            <Label htmlFor="all" className="text-sm font-normal">
                              全部醫療費用 (門診、住院、手術、藥物等)
                            </Label>
                          </div>
                        </div>
                        <div className="flex items-start space-x-2">
                          <RadioGroupItem value="hospital" id="hospital" />
                          <div className="grid gap-1.5 leading-none">
                            <Label htmlFor="hospital" className="text-sm font-normal">
                              僅住院醫療費用
                            </Label>
                          </div>
                        </div>
                        <div className="flex items-start space-x-2">
                          <RadioGroupItem value="surgery" id="surgery" />
                          <div className="grid gap-1.5 leading-none">
                            <Label htmlFor="surgery" className="text-sm font-normal">
                              僅手術費用
                            </Label>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <Alert className="bg-blue-50 border-blue-200">
                    <FileCheck className="h-4 w-4 text-blue-600" />
                    <AlertTitle className="text-blue-600">文件上傳說明</AlertTitle>
                    <AlertDescription>
                      請上傳以下必要文件，所有文件必須清晰可見，且檔案大小不超過5MB。支援的檔案格式：JPG、PNG、PDF。
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    {resource.requiredDocuments.map((doc, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <h3 className="font-medium mb-2">{doc}</h3>
                        <div className="flex items-center justify-center border-2 border-dashed rounded-lg p-6 bg-gray-50">
                          <div className="text-center">
                            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500 mb-2">點擊或拖曳檔案至此處上傳</p>
                            <p className="text-xs text-gray-400">支援 JPG、PNG、PDF，最大 5MB</p>
                            <Button size="sm" className="mt-4 gap-1">
                              <Upload className="h-4 w-4" />
                              選擇檔案
                            </Button>
                          </div>
                        </div>
                        {index === 0 && (
                          <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                            <CheckCircle2 className="h-4 w-4" />
                            已上傳：身分證正反面.jpg
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <Alert className="bg-blue-50 border-blue-200">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <AlertTitle className="text-blue-600">申請前確認</AlertTitle>
                    <AlertDescription>
                      請仔細檢查以下資料是否正確，提交後將無法修改。若有問題，可點擊「上一步」返回修改。
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium mb-2">基本資料</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">姓名</p>
                          <p>王小明</p>
                        </div>
                        <div>
                          <p className="text-gray-500">身分證字號</p>
                          <p>A123456789</p>
                        </div>
                        <div>
                          <p className="text-gray-500">出生日期</p>
                          <p>1980-01-01</p>
                        </div>
                        <div>
                          <p className="text-gray-500">性別</p>
                          <p>男</p>
                        </div>
                        <div>
                          <p className="text-gray-500">聯絡電話</p>
                          <p>0912345678</p>
                        </div>
                        <div>
                          <p className="text-gray-500">電子郵件</p>
                          <p>example@gmail.com</p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-gray-500">聯絡地址</p>
                          <p>台北市信義區市府路1號</p>
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium mb-2">申請資格</h3>
                      <ul className="space-y-1 text-sm">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                          已領有健保重大傷病證明
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                          醫療費用是因重大傷病所產生
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                          有保留相關醫療費用收據正本
                        </li>
                      </ul>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium mb-2">匹配的病歷記錄</h3>
                      <ul className="space-y-1 text-sm">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                          台大醫院 - 腫瘤科 - 乳癌第二期 (2023-12-15)
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                          台北榮民總醫院 - 神經外科 - 腦瘤 (2022-11-15)
                        </li>
                      </ul>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium mb-2">申請項目</h3>
                      <p className="text-sm">全部醫療費用 (門診、住院、手術、藥物等)</p>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium mb-2">上傳文件</h3>
                      <ul className="space-y-1 text-sm">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                          身分證正反面影本 - 已上傳
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                          重大傷病證明正本或影本 - 已上傳
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                          醫療費用收據正本 - 已上傳
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                          存摺封面影本 - 已上傳
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                          申請表 - 已上傳
                        </li>
                      </ul>
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex items-start space-x-2">
                        <Checkbox id="agreement" defaultChecked />
                        <div className="grid gap-1.5 leading-none">
                          <Label htmlFor="agreement" className="text-sm font-normal">
                            我已閱讀並同意《個人資料使用授權書》，所有填寫及上傳的資料均真實無誤，若有不實，願負法律責任。
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-6 text-center">
                  <div className="flex justify-center">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  <h2 className="text-xl font-bold">申請已成功提交</h2>
                  <p className="text-gray-500">
                    您的申請已成功提交，申請編號為 <span className="font-medium">GR-20240501-001</span>
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">後續流程</h3>
                    <ol className="text-sm text-left space-y-2 pl-5 list-decimal">
                      <li>衛生福利部將在 5-7 個工作天內審核您的申請</li>
                      <li>審核結果將透過簡訊及電子郵件通知</li>
                      <li>若申請通過，補助金將在 14 個工作天內匯入您提供的銀行帳戶</li>
                      <li>若有任何問題，可撥打服務專線 1957 查詢</li>
                    </ol>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/ai-resources">
                      <Button variant="outline" className="gap-2">
                        返回資源列表
                      </Button>
                    </Link>
                    <Link href="/ai-resources/application-status">
                      <Button className="gap-2 bg-blue-600 hover:bg-blue-700">查看申請進度</Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              {step > 1 && step < 5 && (
                <Button variant="outline" onClick={prevStep}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  上一步
                </Button>
              )}
              {step < 4 && (
                <Button className="ml-auto" onClick={nextStep}>
                  下一步
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
              {step === 4 && (
                <Button
                  className="ml-auto bg-blue-600 hover:bg-blue-700"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      提交中...
                    </>
                  ) : (
                    <>
                      提交申請
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
              {step === 5 && <div></div>}
            </CardFooter>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>申請資訊</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-2">
                  <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium">資源名稱</p>
                    <p className="text-gray-600">{resource.title}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium">主辦單位</p>
                    <p className="text-gray-600">{resource.organization}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium">補助金額</p>
                    <p className="text-gray-600">{resource.amount}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>申請小幫手</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="faq">
                <TabsList className="w-full">
                  <TabsTrigger value="faq" className="flex-1">
                    常見問題
                  </TabsTrigger>
                  <TabsTrigger value="tips" className="flex-1">
                    申請技巧
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="faq" className="space-y-4 mt-4">
                  <div className="border rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <HelpCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm">如何申請重大傷病證明？</p>
                        <p className="text-xs text-gray-600 mt-1">
                          請攜帶身分證明文件及相關醫療診斷證明，至健保署各分區業務組或聯絡辦公室申請，或請主治醫師協助申請。
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="border rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <HelpCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm">已經支付的醫療費用可以追溯申請補助嗎？</p>
                        <p className="text-xs text-gray-600 mt-1">
                          可以，但需在費用發生後六個月內申請，並保留原始收據正本。
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="border rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <HelpCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm">申請後多久會收到補助？</p>
                        <p className="text-xs text-gray-600 mt-1">
                          一般而言，審核時間約為5-7個工作天，若申請通過，補助金將在14個工作天內匯入您提供的銀行帳戶。
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="tips" className="space-y-4 mt-4">
                  <div className="border rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm">文件準備技巧</p>
                        <p className="text-xs text-gray-600 mt-1">
                          建議將所有文件依照申請表順序排列，並使用迴紋針或資料夾整理，以加速審核流程。
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="border rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm">最佳申請時間</p>
                        <p className="text-xs text-gray-600 mt-1">週一至週五 9:00-12:00，人潮較少，處理速度較快。</p>
                      </div>
                    </div>
                  </div>
                  <div className="border rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm">申請追蹤</p>
                        <p className="text-xs text-gray-600 mt-1">
                          提交申請後，可使用申請案號在官網查詢進度，或撥打服務專線1957查詢。
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>需要協助？</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button variant="outline" className="w-full gap-2">
                  <HelpCircle className="h-4 w-4" />
                  聯繫客服
                </Button>
                <p className="text-xs text-gray-500 text-center">
                  服務時間：週一至週五 9:00-18:00
                  <br />
                  服務專線：1957
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
