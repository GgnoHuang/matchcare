import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, Upload, Plus, Calendar, Banknote, AlertCircle, Sparkles, BookOpen } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function InsurancePage() {
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
    },
  ]

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">保單健檢</h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">智能分析您的保險保單並匹配最佳理賠方案</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/insurance/import-passbook" className="w-full sm:w-auto">
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
              <BookOpen className="h-4 w-4" />
              從保險存摺導入
            </Button>
          </Link>
          <Link href="/insurance/import" className="w-full sm:w-auto">
            <Button className="gap-2 bg-teal-600 hover:bg-teal-700 w-full sm:w-auto">
              <Upload className="h-4 w-4" />
              導入保單
            </Button>
          </Link>
          <Link href="/insurance/add" className="w-full sm:w-auto">
            <Button variant="outline" className="gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              手動添加
            </Button>
          </Link>
        </div>
      </div>

      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>AI健檢提示</AlertTitle>
        <AlertDescription>
          我們的AI系統將自動分析您的保單內容，評估保障範圍，並匹配可理賠的醫療記錄，幫助您獲得最大理賠效益。
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="all" className="w-full">
        <div className="overflow-x-auto">
          <TabsList className="mb-4">
            <TabsTrigger value="all">全部保單</TabsTrigger>
            <TabsTrigger value="medical">醫療險</TabsTrigger>
            <TabsTrigger value="critical">重疾險</TabsTrigger>
            <TabsTrigger value="accident">意外險</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="all" className="space-y-4">
          {insurancePolicies.map((policy) => (
            <Card key={policy.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                  <div>
                    <CardTitle className="flex flex-wrap items-center gap-2 text-lg md:text-xl">
                      {policy.company} - {policy.name}
                      <Badge variant="outline" className="bg-white">
                        {policy.type}
                      </Badge>
                    </CardTitle>
                    <CardDescription>保單號碼: {policy.policyNumber}</CardDescription>
                  </div>
                  <Link
                    href={`/insurance/${policy.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto"
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 text-teal-600 hover:text-teal-700 hover:bg-teal-50 w-full sm:w-auto"
                    >
                      <Sparkles className="h-4 w-4" />
                      啟動AI保險精靈
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-start gap-2">
                    <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">保障期間</p>
                      <p className="text-sm text-gray-500">
                        {policy.startDate} 至 {policy.endDate}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Shield className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">主要保障</p>
                      <p className="text-sm text-gray-500">
                        {policy.coverage
                          .slice(0, 2)
                          .map((c) => `${c.type} ${c.amount.toLocaleString()}${c.unit}`)
                          .join(", ")}
                        {policy.coverage.length > 2 ? "..." : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Banknote className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">最高理賠金額</p>
                      <p className="text-sm text-gray-500">
                        {Math.max(...policy.coverage.map((c) => c.amount)).toLocaleString()} 元
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 border-t">
                <div className="flex flex-col sm:flex-row sm:justify-between w-full gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm text-gray-500">上次更新: 2024-04-01</p>
                    {policy.matchedRecords > 0 && (
                      <Badge className="bg-teal-600 hover:bg-teal-700">匹配病歷: {policy.matchedRecords}</Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <Link href={`/claims/check?policy=${policy.id}`} className="w-full sm:w-auto">
                      <Button size="sm" variant="outline" className="w-full sm:w-auto">
                        檢查理賠資格
                      </Button>
                    </Link>
                    {policy.matchedRecords > 0 && (
                      <Link href={`/claims/new?policy=${policy.id}`} className="w-full sm:w-auto">
                        <Button size="sm" className="bg-teal-600 hover:bg-teal-700 w-full sm:w-auto">
                          申請理賠
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))}
        </TabsContent>
        <TabsContent value="medical" className="space-y-4">
          {insurancePolicies
            .filter((p) => p.type === "醫療險")
            .map((policy) => (
              <Card key={policy.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div>
                      <CardTitle className="flex flex-wrap items-center gap-2 text-lg md:text-xl">
                        {policy.company} - {policy.name}
                        <Badge variant="outline" className="bg-white">
                          {policy.type}
                        </Badge>
                      </CardTitle>
                      <CardDescription>保單號碼: {policy.policyNumber}</CardDescription>
                    </div>
                    <Link
                      href={`/insurance/${policy.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto"
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2 text-teal-600 hover:text-teal-700 hover:bg-teal-50 w-full sm:w-auto"
                      >
                        <Sparkles className="h-4 w-4" />
                        啟動AI保險精靈
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-start gap-2">
                      <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">保障期間</p>
                        <p className="text-sm text-gray-500">
                          {policy.startDate} 至 {policy.endDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Shield className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">主要保障</p>
                        <p className="text-sm text-gray-500">
                          {policy.coverage
                            .slice(0, 2)
                            .map((c) => `${c.type} ${c.amount.toLocaleString()}${c.unit}`)
                            .join(", ")}
                          {policy.coverage.length > 2 ? "..." : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Banknote className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">最高理賠金額</p>
                        <p className="text-sm text-gray-500">
                          {Math.max(...policy.coverage.map((c) => c.amount)).toLocaleString()} 元
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 border-t">
                  <div className="flex flex-col sm:flex-row sm:justify-between w-full gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm text-gray-500">上次更新: 2024-04-01</p>
                      {policy.matchedRecords > 0 && (
                        <Badge className="bg-teal-600 hover:bg-teal-700">匹配病歷: {policy.matchedRecords}</Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                      <Link href={`/claims/check?policy=${policy.id}`} className="w-full sm:w-auto">
                        <Button size="sm" variant="outline" className="w-full sm:w-auto">
                          檢查理賠資格
                        </Button>
                      </Link>
                      {policy.matchedRecords > 0 && (
                        <Link href={`/claims/new?policy=${policy.id}`} className="w-full sm:w-auto">
                          <Button size="sm" className="bg-teal-600 hover:bg-teal-700 w-full sm:w-auto">
                            申請理賠
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardFooter>
              </Card>
            ))}
        </TabsContent>
        <TabsContent value="critical" className="space-y-4">
          {insurancePolicies
            .filter((p) => p.type === "重疾險")
            .map((policy) => (
              <Card key={policy.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div>
                      <CardTitle className="flex flex-wrap items-center gap-2 text-lg md:text-xl">
                        {policy.company} - {policy.name}
                        <Badge variant="outline" className="bg-white">
                          {policy.type}
                        </Badge>
                      </CardTitle>
                      <CardDescription>保單號碼: {policy.policyNumber}</CardDescription>
                    </div>
                    <Link
                      href={`/insurance/${policy.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto"
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2 text-teal-600 hover:text-teal-700 hover:bg-teal-50 w-full sm:w-auto"
                      >
                        <Sparkles className="h-4 w-4" />
                        啟動AI保險精靈
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-start gap-2">
                      <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">保障期間</p>
                        <p className="text-sm text-gray-500">
                          {policy.startDate} 至 {policy.endDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Shield className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">主要保障</p>
                        <p className="text-sm text-gray-500">
                          {policy.coverage
                            .slice(0, 2)
                            .map((c) => `${c.type} ${c.amount.toLocaleString()}${c.unit}`)
                            .join(", ")}
                          {policy.coverage.length > 2 ? "..." : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Banknote className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">最高理賠金額</p>
                        <p className="text-sm text-gray-500">
                          {Math.max(...policy.coverage.map((c) => c.amount)).toLocaleString()} 元
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 border-t">
                  <div className="flex flex-col sm:flex-row sm:justify-between w-full gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm text-gray-500">上次更新: 2024-04-01</p>
                      {policy.matchedRecords > 0 && (
                        <Badge className="bg-teal-600 hover:bg-teal-700">匹配病歷: {policy.matchedRecords}</Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                      <Link href={`/claims/check?policy=${policy.id}`} className="w-full sm:w-auto">
                        <Button size="sm" variant="outline" className="w-full sm:w-auto">
                          檢查理賠資格
                        </Button>
                      </Link>
                      {policy.matchedRecords > 0 && (
                        <Link href={`/claims/new?policy=${policy.id}`} className="w-full sm:w-auto">
                          <Button size="sm" className="bg-teal-600 hover:bg-teal-700 w-full sm:w-auto">
                            申請理賠
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardFooter>
              </Card>
            ))}
        </TabsContent>
        <TabsContent value="accident" className="space-y-4">
          {insurancePolicies
            .filter((p) => p.type === "意外險")
            .map((policy) => (
              <Card key={policy.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div>
                      <CardTitle className="flex flex-wrap items-center gap-2 text-lg md:text-xl">
                        {policy.company} - {policy.name}
                        <Badge variant="outline" className="bg-white">
                          {policy.type}
                        </Badge>
                      </CardTitle>
                      <CardDescription>保單號碼: {policy.policyNumber}</CardDescription>
                    </div>
                    <Link
                      href={`/insurance/${policy.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto"
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2 text-teal-600 hover:text-teal-700 hover:bg-teal-50 w-full sm:w-auto"
                      >
                        <Sparkles className="h-4 w-4" />
                        啟動AI保險精靈
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-start gap-2">
                      <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">保障期間</p>
                        <p className="text-sm text-gray-500">
                          {policy.startDate} 至 {policy.endDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Shield className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">主要保障</p>
                        <p className="text-sm text-gray-500">
                          {policy.coverage
                            .slice(0, 2)
                            .map((c) => `${c.type} ${c.amount.toLocaleString()}${c.unit}`)
                            .join(", ")}
                          {policy.coverage.length > 2 ? "..." : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Banknote className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">最高理賠金額</p>
                        <p className="text-sm text-gray-500">
                          {Math.max(...policy.coverage.map((c) => c.amount)).toLocaleString()} 元
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 border-t">
                  <div className="flex flex-col sm:flex-row sm:justify-between w-full gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm text-gray-500">上次更新: 2024-04-01</p>
                      {policy.matchedRecords > 0 && (
                        <Badge className="bg-teal-600 hover:bg-teal-700">匹配病歷: {policy.matchedRecords}</Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                      <Link href={`/claims/check?policy=${policy.id}`} className="w-full sm:w-auto">
                        <Button size="sm" variant="outline" className="w-full sm:w-auto">
                          檢查理賠資格
                        </Button>
                      </Link>
                      {policy.matchedRecords > 0 && (
                        <Link href={`/claims/new?policy=${policy.id}`} className="w-full sm:w-auto">
                          <Button size="sm" className="bg-teal-600 hover:bg-teal-700 w-full sm:w-auto">
                            申請理賠
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardFooter>
              </Card>
            ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
