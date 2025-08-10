import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Plus, FileSearch, Clock, CheckCircle2, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function ClaimsPage() {
  const claims = [
    {
      id: "CL-20240424-001",
      company: "國泰人壽",
      policyNumber: "CT-MED-123456",
      diagnosis: "乳癌第二期",
      hospital: "台大醫院",
      date: "2024-04-24",
      status: "pending",
      amount: null,
    },
    {
      id: "CL-20240315-002",
      company: "新光人壽",
      policyNumber: "SK-CI-789012",
      diagnosis: "心臟病",
      hospital: "榮總",
      date: "2024-03-15",
      status: "approved",
      amount: 1000000,
    },
    {
      id: "CL-20240210-003",
      company: "富邦人壽",
      policyNumber: "FB-PA-345678",
      diagnosis: "骨折",
      hospital: "三軍總醫院",
      date: "2024-02-10",
      status: "rejected",
      amount: null,
      reason: "不符合保單條款規定的骨折類型",
    },
  ]

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            處理中
          </Badge>
        )
      case "approved":
        return <Badge className="bg-emerald-600 hover:bg-emerald-700">已核准</Badge>
      case "rejected":
        return <Badge variant="destructive">已拒絕</Badge>
      default:
        return null
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />
      case "approved":
        return <CheckCircle2 className="h-5 w-5 text-emerald-600" />
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return null
    }
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">理賠管理</h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">管理您的理賠申請並追蹤處理進度</p>
        </div>
        <div className="w-full md:w-auto">
          <Link href="/claims/new">
            <Button className="gap-2 w-full md:w-auto">
              <Plus className="h-4 w-4" />
              新增理賠申請
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4 w-full overflow-x-auto flex-nowrap">
          <TabsTrigger value="all">全部申請</TabsTrigger>
          <TabsTrigger value="pending">處理中</TabsTrigger>
          <TabsTrigger value="approved">已核准</TabsTrigger>
          <TabsTrigger value="rejected">已拒絕</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4">
          {claims.map((claim) => (
            <Card key={claim.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                  <div>
                    <CardTitle className="flex items-center gap-2 flex-wrap text-lg md:text-xl">
                      申請編號: {claim.id}
                      {getStatusBadge(claim.status)}
                    </CardTitle>
                    <CardDescription>申請日期: {claim.date}</CardDescription>
                  </div>
                  <Link href={`/claims/status/${claim.id}`}>
                    <Button variant="ghost" size="sm" className="w-full md:w-auto">
                      <FileSearch className="h-4 w-4 mr-2" />
                      查看詳情
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-start gap-2">
                    <FileText className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">保單資訊</p>
                      <p className="text-sm text-gray-500">
                        {claim.company} - {claim.policyNumber}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <FileText className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">診斷結果</p>
                      <p className="text-sm text-gray-500">{claim.diagnosis}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <FileText className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">就醫醫院</p>
                      <p className="text-sm text-gray-500">{claim.hospital}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 border-t">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center w-full gap-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(claim.status)}
                    <p className="text-sm">
                      {claim.status === "pending" && "處理中，預計 5-7 個工作天完成審核"}
                      {claim.status === "approved" && `已核准，理賠金額: ${claim.amount.toLocaleString()} 元`}
                      {claim.status === "rejected" && `已拒絕，原因: ${claim.reason}`}
                    </p>
                  </div>
                  {claim.status === "approved" && (
                    <Button size="sm" variant="outline" className="w-full md:w-auto">
                      查看理賠明細
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </TabsContent>
        <TabsContent value="pending" className="space-y-4">
          {claims.filter((c) => c.status === "pending").length > 0 ? (
            claims
              .filter((c) => c.status === "pending")
              .map((claim) => (
              <Card key={claim.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                    <div>
                      <CardTitle className="flex items-center gap-2 flex-wrap text-lg md:text-xl">
                        申請編號: {claim.id}
                        {getStatusBadge(claim.status)}
                      </CardTitle>
                      <CardDescription>申請日期: {claim.date}</CardDescription>
                    </div>
                    <Link href={`/claims/status/${claim.id}`}>
                      <Button variant="ghost" size="sm" className="w-full md:w-auto">
                        <FileSearch className="h-4 w-4 mr-2" />
                        查看詳情
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-start gap-2">
                      <FileText className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">保單資訊</p>
                        <p className="text-sm text-gray-500">
                          {claim.company} - {claim.policyNumber}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <FileText className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">診斷結果</p>
                        <p className="text-sm text-gray-500">{claim.diagnosis}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <FileText className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">就醫醫院</p>
                        <p className="text-sm text-gray-500">{claim.hospital}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 border-t">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center w-full gap-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(claim.status)}
                      <p className="text-sm">處理中，預計 5-7 個工作天完成審核</p>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Clock className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">暫無處理中的申請</h3>
              <p className="text-gray-500">目前沒有正在處理中的理賠申請</p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="approved" className="space-y-4">
          {claims.filter((c) => c.status === "approved").length > 0 ? (
            claims
              .filter((c) => c.status === "approved")
              .map((claim) => (
              <Card key={claim.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                    <div>
                      <CardTitle className="flex items-center gap-2 flex-wrap text-lg md:text-xl">
                        申請編號: {claim.id}
                        {getStatusBadge(claim.status)}
                      </CardTitle>
                      <CardDescription>申請日期: {claim.date}</CardDescription>
                    </div>
                    <Link href={`/claims/status/${claim.id}`}>
                      <Button variant="ghost" size="sm" className="w-full md:w-auto">
                        <FileSearch className="h-4 w-4 mr-2" />
                        查看詳情
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-start gap-2">
                      <FileText className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">保單資訊</p>
                        <p className="text-sm text-gray-500">
                          {claim.company} - {claim.policyNumber}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <FileText className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">診斷結果</p>
                        <p className="text-sm text-gray-500">{claim.diagnosis}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <FileText className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">就醫醫院</p>
                        <p className="text-sm text-gray-500">{claim.hospital}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 border-t">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center w-full gap-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(claim.status)}
                      <p className="text-sm">已核准，理賠金額: {claim.amount.toLocaleString()} 元</p>
                    </div>
                    <Button size="sm" variant="outline" className="w-full md:w-auto">
                      查看理賠明細
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">暫無已核准的申請</h3>
              <p className="text-gray-500">目前沒有已核准的理賠申請</p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="rejected" className="space-y-4">
          {claims.filter((c) => c.status === "rejected").length > 0 ? (
            claims
              .filter((c) => c.status === "rejected")
              .map((claim) => (
              <Card key={claim.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                    <div>
                      <CardTitle className="flex items-center gap-2 flex-wrap text-lg md:text-xl">
                        申請編號: {claim.id}
                        {getStatusBadge(claim.status)}
                      </CardTitle>
                      <CardDescription>申請日期: {claim.date}</CardDescription>
                    </div>
                    <Link href={`/claims/status/${claim.id}`}>
                      <Button variant="ghost" size="sm" className="w-full md:w-auto">
                        <FileSearch className="h-4 w-4 mr-2" />
                        查看詳情
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-start gap-2">
                      <FileText className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">保單資訊</p>
                        <p className="text-sm text-gray-500">
                          {claim.company} - {claim.policyNumber}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <FileText className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">診斷結果</p>
                        <p className="text-sm text-gray-500">{claim.diagnosis}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <FileText className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">就醫醫院</p>
                        <p className="text-sm text-gray-500">{claim.hospital}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 border-t">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center w-full gap-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(claim.status)}
                      <p className="text-sm">已拒絕，原因: {claim.reason}</p>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <XCircle className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">暫無被拒絕的申請</h3>
              <p className="text-gray-500">目前沒有被拒絕的理賠申請</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
