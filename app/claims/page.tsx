"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Plus, FileSearch, Clock, CheckCircle2, XCircle, AlertCircle, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useState, useEffect } from "react"
import { checkAuth } from "@/app/actions/auth-service"

interface Claim {
  id: string
  company: string
  policyNumber: string
  diagnosis: string
  hospital: string
  date: string
  status: 'pending' | 'approved' | 'rejected'
  amount: number | null
  reason?: string
}

interface User {
  id: string
  name: string
}

export default function ClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 檢查用戶登入狀態
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { isLoggedIn, user: authUser } = await checkAuth()
        if (isLoggedIn && authUser) {
          setUser(authUser)
          console.log('用戶已登入:', authUser)
        } else {
          console.log('用戶未登入')
        }
      } catch (error) {
        console.error('獲取用戶資訊失敗:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchUser()
  }, [])

  // 當用戶登入後載入理賠申請資料
  useEffect(() => {
    if (user?.id) {
      loadUserClaims()
    }
  }, [user])

  // 監聽頁面可見性變化，重新載入資料
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user?.id) {
        console.log('頁面重新可見，重新載入理賠申請資料')
        loadUserClaims()
      }
    }

    const handleFocus = () => {
      if (user?.id) {
        console.log('頁面獲得焦點，重新載入理賠申請資料')
        loadUserClaims()
      }
    }

    // 監聽頁面可見性和焦點事件
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [user])

  const loadUserClaims = async () => {
    if (!user?.id) return
    
    try {
      console.log('載入用戶理賠申請資料，用戶ID:', user.id)
      
      // 從 localStorage 讀取理賠申請資料
      const storageKey = `matchcare_${user.id}_claims`
      const claimsData = localStorage.getItem(storageKey)
      console.log('理賠申請資料 localStorage key:', storageKey, claimsData)
      
      if (claimsData) {
        const parsedClaims = JSON.parse(claimsData)
        setClaims(parsedClaims)
        console.log('載入的理賠申請資料:', parsedClaims)
      } else {
        console.log('未找到理賠申請資料，設為空陣列')
        setClaims([])
      }
    } catch (error) {
      console.error('載入理賠申請資料失敗:', error)
      setClaims([])
    }
  }

  const getStatusBadge = (status: Claim['status']) => {
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

  const getStatusIcon = (status: Claim['status']) => {
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

  // Loading狀態
  if (isLoading) {
    return (
      <div className="container py-6 md:py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-500">載入中...</p>
          </div>
        </div>
      </div>
    )
  }

  // 未登入狀態
  if (!user) {
    return (
      <div className="container py-6 md:py-8">
        <div className="max-w-md mx-auto text-center">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>需要登入</AlertTitle>
            <AlertDescription>
              請先登入以查看您的理賠申請記錄。
              <div className="mt-4">
                <Link href="/login">
                  <Button>前往登入</Button>
                </Link>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">理賠管理</h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">管理您的理賠申請並追蹤處理進度</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button 
            variant="outline" 
            onClick={loadUserClaims}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            重新載入
          </Button>
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
          {claims.length > 0 ? claims.map((claim) => (
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
                      {claim.status === "approved" && `已核准，理賠金額: ${claim.amount?.toLocaleString()} 元`}
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
          )) : (
            <Card>
              <CardContent className="py-8 text-center">
                <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">尚未建立任何理賠申請</h3>
                <p className="text-gray-500 mb-4">
                  您目前沒有任何理賠申請記錄，點擊下方按鈕開始您的第一個理賠申請
                </p>
                <Link href="/claims/new">
                  <Button>建立理賠申請</Button>
                </Link>
              </CardContent>
            </Card>
          )}
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
                      <p className="text-sm">已核准，理賠金額: {claim.amount?.toLocaleString()} 元</p>
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
