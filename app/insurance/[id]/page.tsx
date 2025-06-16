"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, FileText, Shield, Calendar, Banknote, CheckCircle, AlertCircle, Star, Sparkles } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

// 模擬的保單資料庫
const insurancePolicies = [
  {
    id: 1,
    company: "國泰人壽",
    name: "安心醫療保險",
    type: "醫療險",
    policyNumber: "CT-MED-123456",
    startDate: "2020-01-15",
    endDate: "2030-01-14",
    coverage: [
      { type: "住院醫療", amount: 3000, unit: "元/日", maxDays: 180 },
      { type: "手術費用", amount: 100000, unit: "元/次" },
      { type: "癌症治療", amount: 500000, unit: "元/年" },
    ],
    matchedRecords: 2,
    insured: "王小明",
    beneficiary: "王大明",
    paymentMethod: "年繳",
    premium: 12000,
    nextPaymentDate: "2025-01-15",
    status: "有效",
    notes: "此保單包含實支實付與定額給付兩種理賠方式",
    documents: [
      { name: "保單條款", type: "pdf", url: "#" },
      { name: "保險證明", type: "pdf", url: "#" },
    ],
    claimHistory: [
      { date: "2023-12-20", diagnosis: "乳癌第二期", hospital: "台大醫院", amount: 150000, status: "已理賠" },
      { date: "2022-05-10", diagnosis: "闌尾炎", hospital: "榮總", amount: 35000, status: "已理賠" },
    ],
    aiAnalysis: {
      overallRating: 4.5,
      coverageRating: 4,
      priceRating: 5,
      companyRating: 4.5,
      strengths: ["癌症治療保障高", "手術費用涵蓋範圍廣", "理賠速度快"],
      weaknesses: ["住院日額較低", "未涵蓋特殊疾病"],
      recommendations: ["考慮增加住院日額保障", "可搭配重大疾病險提高保障"],
    },
  },
  {
    id: 2,
    company: "新光人壽",
    name: "重大疾病保險",
    type: "重疾險",
    policyNumber: "SK-CI-789012",
    startDate: "2021-05-20",
    endDate: "2041-05-19",
    coverage: [
      { type: "癌症", amount: 1000000, unit: "元" },
      { type: "心臟病", amount: 1000000, unit: "元" },
      { type: "腦中風", amount: 1000000, unit: "元" },
    ],
    matchedRecords: 3,
    insured: "王小明",
    beneficiary: "王大明",
    paymentMethod: "年繳",
    premium: 25000,
    nextPaymentDate: "2025-05-20",
    status: "有效",
    notes: "此保單涵蓋30種重大疾病，首次診斷確定即可獲得理賠",
    documents: [
      { name: "保單條款", type: "pdf", url: "#" },
      { name: "保險證明", type: "pdf", url: "#" },
    ],
    claimHistory: [
      { date: "2023-12-20", diagnosis: "乳癌第二期", hospital: "台大醫院", amount: 1000000, status: "已理賠" },
    ],
    aiAnalysis: {
      overallRating: 5,
      coverageRating: 5,
      priceRating: 4,
      companyRating: 5,
      strengths: ["保障金額高", "涵蓋疾病種類多", "無等待期"],
      weaknesses: ["保費較高"],
      recommendations: ["建議持續維持此保單", "可考慮增加醫療險作為輔助"],
    },
  },
  {
    id: 3,
    company: "富邦人壽",
    name: "意外傷害保險",
    type: "意外險",
    policyNumber: "FB-PA-345678",
    startDate: "2022-03-10",
    endDate: "2032-03-09",
    coverage: [
      { type: "意外身故", amount: 2000000, unit: "元" },
      { type: "意外醫療", amount: 50000, unit: "元/次" },
      { type: "骨折", amount: 20000, unit: "元/次" },
    ],
    matchedRecords: 1,
    insured: "王小明",
    beneficiary: "王大明",
    paymentMethod: "年繳",
    premium: 8000,
    nextPaymentDate: "2025-03-10",
    status: "有效",
    notes: "此保單提供24小時全球保障，包含海外旅遊期間",
    documents: [
      { name: "保單條款", type: "pdf", url: "#" },
      { name: "保險證明", type: "pdf", url: "#" },
    ],
    claimHistory: [{ date: "2023-08-22", diagnosis: "骨折", hospital: "三軍總醫院", amount: 20000, status: "已理賠" }],
    aiAnalysis: {
      overallRating: 3.5,
      coverageRating: 3,
      priceRating: 4,
      companyRating: 4,
      strengths: ["意外身故保障高", "全球保障範圍", "理賠程序簡便"],
      weaknesses: ["意外醫療保障較低", "骨折保障不足"],
      recommendations: ["考慮提高意外醫療保障", "可搭配醫療險增加保障完整性"],
    },
  },
  {
    id: 4,
    company: "南山人壽",
    name: "住院醫療保險",
    type: "醫療險",
    policyNumber: "NS-MED-567890",
    startDate: "2019-08-15",
    endDate: "2029-08-14",
    coverage: [
      { type: "住院醫療", amount: 5000, unit: "元/日", maxDays: 365 },
      { type: "加護病房", amount: 10000, unit: "元/日", maxDays: 30 },
      { type: "手術費用", amount: 150000, unit: "元/次" },
    ],
    matchedRecords: 0,
    insured: "王小明",
    beneficiary: "王大明",
    paymentMethod: "年繳",
    premium: 15000,
    nextPaymentDate: "2025-08-15",
    status: "有效",
    notes: "此保單提供住院日額給付，無等待期",
    documents: [
      { name: "保單條款", type: "pdf", url: "#" },
      { name: "保險證明", type: "pdf", url: "#" },
    ],
    claimHistory: [],
    aiAnalysis: {
      overallRating: 4,
      coverageRating: 4.5,
      priceRating: 3.5,
      companyRating: 4,
      strengths: ["住院日額給付高", "加護病房額外保障", "無等待期"],
      weaknesses: ["保費較高", "未涵蓋門診手術"],
      recommendations: ["可考慮增加門診手術保障", "建議持續維持此保單"],
    },
  },
]

// 星級評分組件
const StarRating = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 !== 0
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

  return (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
      ))}
      {hasHalfStar && (
        <div className="relative">
          <Star className="h-5 w-5 text-gray-300" />
          <div className="absolute top-0 left-0 w-1/2 overflow-hidden">
            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
          </div>
        </div>
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className="h-5 w-5 text-gray-300" />
      ))}
    </div>
  )
}

export default function InsurancePolicyDetailPage({ params }: { params: { id: string } }) {
  const [policy, setPolicy] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("details")

  useEffect(() => {
    // 模擬從API獲取保單詳情
    const fetchPolicy = () => {
      setIsLoading(true)
      const policyId = Number.parseInt(params.id)
      const foundPolicy = insurancePolicies.find((p) => p.id === policyId)

      if (foundPolicy) {
        setPolicy(foundPolicy)
      }

      setIsLoading(false)
    }

    fetchPolicy()
  }, [params.id])

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
        </div>
      </div>
    )
  }

  if (!policy) {
    return (
      <div className="container py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center mb-8">
            <Link href="/insurance">
              <Button variant="ghost" size="sm" className="gap-1">
                <ArrowLeft className="h-4 w-4" />
                返回AI保單健檢
              </Button>
            </Link>
          </div>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>找不到保單</AlertTitle>
            <AlertDescription>無法找到指定的保單資訊，請返回保單列表重新選擇。</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <Link href="/insurance">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              返回AI保單健檢
            </Button>
          </Link>
        </div>

        {/* AI保險精靈重點分析 */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-teal-500 to-emerald-500 rounded-t-xl p-4">
            <div className="flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-white" />
              <h2 className="text-xl font-bold text-white">保險精靈重點分析</h2>
            </div>
          </div>
          <div className="border border-t-0 rounded-b-xl p-6 bg-white shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-lg">綜合評價</h3>
                  <div className="flex items-center gap-2">
                    <StarRating rating={policy.aiAnalysis.overallRating} />
                    <span className="font-bold text-lg">{policy.aiAnalysis.overallRating}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">保障涵蓋範圍</span>
                      <span className="text-sm font-medium">{policy.aiAnalysis.coverageRating}/5</span>
                    </div>
                    <Progress value={policy.aiAnalysis.coverageRating * 20} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">保單價格</span>
                      <span className="text-sm font-medium">{policy.aiAnalysis.priceRating}/5</span>
                    </div>
                    <Progress value={policy.aiAnalysis.priceRating * 20} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">保險公司評級</span>
                      <span className="text-sm font-medium">{policy.aiAnalysis.companyRating}/5</span>
                    </div>
                    <Progress value={policy.aiAnalysis.companyRating * 20} className="h-2" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    優勢
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-sm pl-1">
                    {policy.aiAnalysis.strengths.map((strength: string, index: number) => (
                      <li key={index} className="text-gray-700">
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    不足之處
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-sm pl-1">
                    {policy.aiAnalysis.weaknesses.map((weakness: string, index: number) => (
                      <li key={index} className="text-gray-700">
                        {weakness}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t">
              <h3 className="font-medium mb-2">AI建議</h3>
              <ul className="list-disc list-inside space-y-1 text-sm pl-1">
                {policy.aiAnalysis.recommendations.map((recommendation: string, index: number) => (
                  <li key={index} className="text-gray-700">
                    {recommendation}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {policy.company} - {policy.name}
            </h1>
            <p className="text-gray-500 mt-1">保單號碼: {policy.policyNumber}</p>
          </div>
          <Badge className={`${policy.status === "有效" ? "bg-green-600" : "bg-amber-500"}`}>{policy.status}</Badge>
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle>保單概要</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">保單資訊</h3>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Shield className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">保險類型</p>
                        <p className="text-sm">{policy.type}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">保障期間</p>
                        <p className="text-sm">
                          {policy.startDate} 至 {policy.endDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Banknote className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">保費</p>
                        <p className="text-sm">
                          {policy.premium.toLocaleString()} 元/{policy.paymentMethod}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">被保險人資訊</h3>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">被保險人</p>
                        <p className="text-sm">{policy.insured}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">受益人</p>
                        <p className="text-sm">{policy.beneficiary}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">付款資訊</h3>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">下次繳費日期</p>
                        <p className="text-sm">{policy.nextPaymentDate}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Banknote className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">付款方式</p>
                        <p className="text-sm">{policy.paymentMethod}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="details">保障內容</TabsTrigger>
            <TabsTrigger value="claims">理賠紀錄</TabsTrigger>
            <TabsTrigger value="documents">保單文件</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>保障內容</CardTitle>
                <CardDescription>此保單提供的保障項目與金額</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg overflow-hidden">
                    <div className="grid grid-cols-3 bg-gray-50 p-3 border-b">
                      <div className="font-medium">保障項目</div>
                      <div className="font-medium">保障金額</div>
                      <div className="font-medium">備註</div>
                    </div>
                    <div className="divide-y">
                      {policy.coverage.map((item: any, index: number) => (
                        <div key={index} className="grid grid-cols-3 p-3">
                          <div>{item.type}</div>
                          <div>
                            {item.amount.toLocaleString()} {item.unit}
                          </div>
                          <div>{item.maxDays && `最多 ${item.maxDays} 天`}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {policy.notes && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>保單備註</AlertTitle>
                      <AlertDescription>{policy.notes}</AlertDescription>
                    </Alert>
                  )}

                  {policy.matchedRecords > 0 && (
                    <div className="bg-teal-50 p-4 rounded-lg border border-teal-100">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-teal-600" />
                        <h3 className="font-medium text-teal-800">已匹配病歷</h3>
                      </div>
                      <p className="text-sm text-teal-700">
                        系統已找到 {policy.matchedRecords} 筆符合此保單理賠條件的病歷記錄。
                      </p>
                      <div className="mt-3">
                        <Link href={`/claims/check?policy=${policy.id}`}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-teal-700 border-teal-200 hover:bg-teal-50"
                          >
                            查看匹配病歷
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="claims" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>理賠紀錄</CardTitle>
                <CardDescription>此保單的歷史理賠記錄</CardDescription>
              </CardHeader>
              <CardContent>
                {policy.claimHistory.length > 0 ? (
                  <div className="space-y-4">
                    {policy.claimHistory.map((claim: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{claim.diagnosis}</h3>
                            <p className="text-sm text-gray-500">
                              {claim.hospital} - {claim.date}
                            </p>
                          </div>
                          <Badge className={claim.status === "已理賠" ? "bg-green-600" : "bg-amber-500"}>
                            {claim.status}
                          </Badge>
                        </div>
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">理賠金額</span>
                            <span className="font-medium">{claim.amount.toLocaleString()} 元</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>尚無理賠紀錄</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>保單文件</CardTitle>
                <CardDescription>與此保單相關的文件</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {policy.documents.map((doc: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-gray-500" />
                        <span>{doc.name}</span>
                      </div>
                      <Button variant="outline" size="sm">
                        下載
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-8 flex justify-between">
          <Link href="/insurance">
            <Button variant="outline">返回保單列表</Button>
          </Link>
          <div className="flex gap-2">
            {policy.matchedRecords > 0 && (
              <Link href={`/claims/new?policy=${policy.id}`}>
                <Button className="bg-teal-600 hover:bg-teal-700">申請理賠</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
