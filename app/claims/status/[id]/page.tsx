import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, FileText, Shield, Calendar, CheckCircle2, Clock, AlertCircle, Download } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export default async function ClaimStatusPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: claimId } = await params

  // 假設的理賠資料
  const claim = {
    id: claimId,
    status: "processing", // processing, approved, rejected
    submittedDate: "2024-04-24",
    expectedCompletionDate: "2024-05-01",
    company: "國泰人壽",
    policyNumber: "CT-MED-123456",
    policyName: "安心醫療保險",
    diagnosis: "乳癌第二期",
    hospital: "台大醫院",
    documents: [
      { name: "診斷證明書", status: "verified" },
      { name: "醫療費用收據", status: "verified" },
      { name: "治療明細", status: "pending" },
      { name: "身分證正反面影本", status: "verified" },
      { name: "存摺封面影本", status: "verified" },
    ],
    timeline: [
      { date: "2024-04-24", time: "14:30", event: "提交理賠申請", status: "completed" },
      { date: "2024-04-24", time: "15:45", event: "保險公司收到申請", status: "completed" },
      { date: "2024-04-25", time: "10:20", event: "開始審核文件", status: "completed" },
      { date: "2024-04-26", time: "09:15", event: "文件審核中", status: "current" },
      { date: "預計 2024-04-28", time: "", event: "完成文件審核", status: "upcoming" },
      { date: "預計 2024-04-30", time: "", event: "理賠評估", status: "upcoming" },
      { date: "預計 2024-05-01", time: "", event: "理賠決定", status: "upcoming" },
    ],
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "processing":
        return <Badge className="bg-amber-500">處理中</Badge>
      case "approved":
        return <Badge className="bg-emerald-600">已核准</Badge>
      case "rejected":
        return <Badge variant="destructive">已拒絕</Badge>
      default:
        return null
    }
  }

  const getDocumentStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle2 className="h-4 w-4 text-emerald-600" />
      case "pending":
        return <Clock className="h-4 w-4 text-amber-500" />
      case "rejected":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getProgressValue = () => {
    const completedSteps = claim.timeline.filter((step) => step.status === "completed").length
    return (completedSteps / claim.timeline.length) * 100
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

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">理賠申請狀態</h1>
            <p className="text-gray-500">申請編號: {claimId}</p>
          </div>
          <div>{getStatusBadge(claim.status)}</div>
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle>處理進度</CardTitle>
            <CardDescription>預計完成日期: {claim.expectedCompletionDate}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span>已完成 {getProgressValue().toFixed(0)}%</span>
                <span>預計 5-7 個工作天完成審核</span>
              </div>
              <Progress value={getProgressValue()} className="h-2" />

              <div className="space-y-4 mt-6">
                {claim.timeline.map((step, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div
                      className={`rounded-full p-1 ${
                        step.status === "completed"
                          ? "bg-emerald-100"
                          : step.status === "current"
                            ? "bg-amber-100"
                            : "bg-gray-100"
                      }`}
                    >
                      {step.status === "completed" ? (
                        <CheckCircle2
                          className={`h-4 w-4 ${
                            step.status === "completed"
                              ? "text-emerald-600"
                              : step.status === "current"
                                ? "text-amber-500"
                                : "text-gray-400"
                          }`}
                        />
                      ) : (
                        <Clock
                          className={`h-4 w-4 ${step.status === "current" ? "text-amber-500" : "text-gray-400"}`}
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p
                          className={`text-sm font-medium ${
                            step.status === "completed" || step.status === "current" ? "text-gray-900" : "text-gray-500"
                          }`}
                        >
                          {step.event}
                        </p>
                        <p className="text-xs text-gray-500">
                          {step.date} {step.time && `${step.time}`}
                        </p>
                      </div>
                      {index < claim.timeline.length - 1 && <div className="ml-2 mt-1 mb-1 w-px h-4 bg-gray-200"></div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="details">申請詳情</TabsTrigger>
            <TabsTrigger value="documents">文件狀態</TabsTrigger>
            <TabsTrigger value="communication">溝通記錄</TabsTrigger>
          </TabsList>
          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>申請詳情</CardTitle>
                <CardDescription>理賠申請的詳細資訊</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">保單資訊</h3>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <Shield className="h-5 w-5 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">保險公司</p>
                            <p className="text-sm">{claim.company}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">保單號碼</p>
                            <p className="text-sm">{claim.policyNumber}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Shield className="h-5 w-5 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">保單名稱</p>
                            <p className="text-sm">{claim.policyName}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">醫療資訊</h3>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">診斷結果</p>
                            <p className="text-sm">{claim.diagnosis}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">就醫醫院</p>
                            <p className="text-sm">{claim.hospital}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">申請日期</p>
                            <p className="text-sm">{claim.submittedDate}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>文件狀態</CardTitle>
                <CardDescription>上傳文件的審核狀態</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {claim.documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-gray-500" />
                        <p className="text-sm font-medium">{doc.name}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          {getDocumentStatusIcon(doc.status)}
                          <span className="text-sm">
                            {doc.status === "verified" ? "已驗證" : doc.status === "pending" ? "審核中" : "已拒絕"}
                          </span>
                        </div>
                        <Button size="sm" variant="outline" className="gap-1">
                          <Download className="h-3 w-3" />
                          下載
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="communication">
            <Card>
              <CardHeader>
                <CardTitle>溝通記錄</CardTitle>
                <CardDescription>與保險公司的溝通記錄</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium">系統通知</p>
                      <p className="text-xs text-gray-500">2024-04-24 15:45</p>
                    </div>
                    <p className="text-sm">您的理賠申請已收到，我們將盡快處理。</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium">國泰人壽 - 理賠部</p>
                      <p className="text-xs text-gray-500">2024-04-25 10:20</p>
                    </div>
                    <p className="text-sm">您好，我們已開始審核您的理賠申請。如有任何問題，請隨時與我們聯繫。</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium">國泰人壽 - 理賠部</p>
                      <p className="text-xs text-gray-500">2024-04-26 09:15</p>
                    </div>
                    <p className="text-sm">
                      您好，我們需要您提供更詳細的治療明細資料。請您盡快上傳相關文件，以便我們繼續處理您的理賠申請。
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700">聯繫保險公司</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
