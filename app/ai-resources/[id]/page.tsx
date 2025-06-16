import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  FileText,
  Users,
  Clock,
  Download,
  ChevronLeft,
  CheckCircle2,
  Shield,
  Building,
  CreditCard,
  Scale,
  AlertCircle,
  HelpCircle,
  FileCheck,
  Stethoscope,
} from "lucide-react"

export default function ResourceDetailPage({ params }) {
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
    website: "https://www.mohw.gov.tw",
    phone: "1957",
    email: "service@mohw.gov.tw",
    address: "台北市南港區忠孝東路517號",
    applicationProcess: [
      "準備身分證明文件",
      "準備重大傷病證明",
      "準備醫療費用收據正本",
      "填寫申請表",
      "郵寄或親自送件至衛生福利部",
    ],
    requiredDocuments: ["身分證正反面影本", "重大傷病證明正本或影本", "醫療費用收據正本", "存摺封面影本", "申請表"],
    processingTime: "約2-4週",
    matchedMedicalRecords: [
      {
        id: 1,
        hospital: "台大醫院",
        department: "腫瘤科",
        date: "2023-12-15",
        diagnosis: "乳癌第二期",
      },
      {
        id: 12,
        hospital: "台北榮民總醫院",
        department: "神經外科",
        date: "2022-11-15",
        diagnosis: "腦瘤",
      },
    ],
    faqs: [
      {
        question: "如何申請重大傷病證明？",
        answer: "請攜帶身分證明文件及相關醫療診斷證明，至健保署各分區業務組或聯絡辦公室申請，或請主治醫師協助申請。",
      },
      {
        question: "重大傷病證明有效期限是多久？",
        answer: "依疾病類型不同，有些是永久有效，有些則需定期重新評估。請參考證明上的有效期限。",
      },
      {
        question: "已經支付的醫療費用可以追溯申請補助嗎？",
        answer: "可以，但需在費用發生後六個月內申請，並保留原始收據正本。",
      },
    ],
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case "政府補助":
        return "bg-blue-50 border-blue-200"
      case "企業福利":
        return "bg-green-50 border-green-200"
      case "保單理賠":
        return "bg-teal-50 border-teal-200"
      case "金融產品":
        return "bg-purple-50 border-purple-200"
      case "法律救助":
        return "bg-red-50 border-red-200"
      default:
        return ""
    }
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

  const getStatusBadge = (status) => {
    switch (status) {
      case "eligible":
        return <Badge className="bg-green-600">符合條件</Badge>
      case "conditional":
        return <Badge className="bg-amber-600">條件性符合</Badge>
      case "ineligible":
        return <Badge variant="destructive">不符合條件</Badge>
      default:
        return null
    }
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Link href="/ai-resources">
          <Button variant="ghost" size="sm" className="gap-1">
            <ChevronLeft className="h-4 w-4" />
            返回資源列表
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className={`${getCategoryColor(resource.category)}`}>
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {getCategoryIcon(resource.category)}
                <Badge variant="outline" className="bg-white">
                  {resource.category} - {resource.subcategory}
                </Badge>
                {getStatusBadge(resource.status)}
              </div>
              <CardTitle className="text-2xl">{resource.title}</CardTitle>
              <CardDescription className="text-base">{resource.organization}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="flex items-start gap-2">
                  <Users className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium">申請資格</p>
                    <p className="text-gray-600">{resource.eligibility}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium">補助金額</p>
                    <p className="text-gray-600">{resource.amount}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium">申請期限</p>
                    <p className="text-gray-600">{resource.deadline}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-lg">詳細說明</h3>
                <p className="text-gray-700">{resource.details}</p>

                <h3 className="font-medium text-lg pt-4">申請流程</h3>
                <ol className="space-y-2 pl-5 list-decimal text-gray-700">
                  {resource.applicationProcess.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>

                <h3 className="font-medium text-lg pt-4">所需文件</h3>
                <ul className="space-y-2 text-gray-700">
                  {resource.requiredDocuments.map((doc, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      {doc}
                    </li>
                  ))}
                </ul>

                <div className="pt-4">
                  <h3 className="font-medium text-lg">處理時間</h3>
                  <p className="text-gray-700">{resource.processingTime}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-white bg-opacity-50 border-t flex-col items-start gap-4">
              <div className="w-full">
                <h3 className="font-medium mb-2">匹配的病歷記錄</h3>
                <div className="space-y-2">
                  {resource.matchedMedicalRecords.map((record) => (
                    <div key={record.id} className="flex items-start gap-2 p-3 bg-white rounded-md border">
                      <Stethoscope className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">
                          {record.hospital} - {record.department}
                        </p>
                        <p className="text-sm text-gray-500">
                          診斷: {record.diagnosis} ({record.date})
                        </p>
                      </div>
                      <Link href={`/medical-records/${record.id}`} className="ml-auto">
                        <Button variant="ghost" size="sm" className="h-8">
                          查看
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <Button variant="outline" className="gap-2 flex-1">
                  <Download className="h-4 w-4" />
                  下載申請表
                </Button>
                <Link href={`/ai-resources/apply/${resource.id}`} className="flex-1">
                  <Button className="w-full gap-2 bg-blue-600 hover:bg-blue-700">
                    <FileCheck className="h-4 w-4" />
                    開始申請
                  </Button>
                </Link>
              </div>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>常見問題</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {resource.faqs.map((faq, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start gap-2 mb-2">
                      <HelpCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="font-medium">{faq.question}</p>
                    </div>
                    <p className="text-gray-700 pl-7">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>聯絡資訊</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-2">
                  <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium">官方網站</p>
                    <a
                      href={resource.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {resource.website}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium">服務電話</p>
                    <p className="text-gray-600">{resource.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium">電子郵件</p>
                    <p className="text-gray-600">{resource.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium">地址</p>
                    <p className="text-gray-600">{resource.address}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>申請小提示</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className="bg-amber-50 border-amber-200">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-600">注意事項</AlertTitle>
                <AlertDescription>
                  申請前請確認您的重大傷病證明是否在有效期內，並準備好所有必要文件的正本及影本。
                </AlertDescription>
              </Alert>

              <div className="mt-4 space-y-2">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">最佳申請時間：</span>週一至週五 9:00-12:00，人潮較少
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">文件準備技巧：</span>
                  建議將所有文件依照申請表順序排列，並使用迴紋針或資料夾整理，以加速審核流程
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">申請追蹤：</span>
                  提交申請後，可使用申請案號在官網查詢進度，或撥打服務專線1957查詢
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>相關資源</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href="/ai-resources/gov-3" className="block p-3 border rounded-md hover:bg-gray-50">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <p className="font-medium">癌症病患家庭照顧服務補助</p>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">衛生福利部</p>
                </Link>
                <Link href="/ai-resources/gov-4" className="block p-3 border rounded-md hover:bg-gray-50">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-blue-600" />
                    <p className="font-medium">台北市重大傷病市民醫療補助</p>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">台北市政府</p>
                </Link>
                <Link href="/ai-resources/ins-2" className="block p-3 border rounded-md hover:bg-gray-50">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-teal-600" />
                    <p className="font-medium">重大疾病保險理賠</p>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">新光人壽</p>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
