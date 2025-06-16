"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CheckCircle, AlertCircle, CreditCard, Calendar, ArrowRight, Shield } from "lucide-react"
import { cancelSubscription, updatePaymentMethod } from "@/app/actions/payment-service"

export default function SubscriptionSettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  // 模擬訂閱資料
  const subscription = {
    active: true,
    planName: "進階方案",
    planId: "premium",
    cycle: "annual",
    price: 319,
    startDate: "2024-04-25",
    nextBillingDate: "2025-04-25",
    paymentMethod: {
      type: "credit-card",
      last4: "1234",
      brand: "Visa",
      expiry: "12/25",
    },
    features: [
      "病歷管理 (無限制)",
      "保單管理 (無限制)",
      "理賠申請 (無限制)",
      "優先資源匹配",
      "優先客服支援",
      "理賠成功率分析",
      "專業理賠建議",
    ],
  }

  // 模擬取消訂閱
  const handleCancelSubscription = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const result = await cancelSubscription()

      if (result.success) {
        setSuccess("訂閱已成功取消，您仍可以使用服務至當前訂閱期結束")
        setShowCancelDialog(false)
      } else {
        setError(result.error || "取消訂閱失敗，請稍後再試")
      }
    } catch (err) {
      console.error("取消訂閱錯誤:", err)
      setError("取消訂閱時發生錯誤，請稍後再試")
    } finally {
      setIsLoading(false)
    }
  }

  // 模擬更新付款方式
  const handleUpdatePaymentMethod = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const result = await updatePaymentMethod()

      if (result.success) {
        setSuccess("付款方式已成功更新")
      } else {
        setError(result.error || "更新付款方式失敗，請稍後再試")
      }
    } catch (err) {
      console.error("更新付款方式錯誤:", err)
      setError("更新付款方式時發生錯誤，請稍後再試")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">訂閱管理</h1>
          <p className="text-gray-500 mt-1">管理您的訂閱計劃和付款方式</p>
        </div>

        <Tabs defaultValue="subscription" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="subscription">訂閱計劃</TabsTrigger>
            <TabsTrigger value="payment">付款方式</TabsTrigger>
            <TabsTrigger value="history">帳單歷史</TabsTrigger>
          </TabsList>

          <TabsContent value="subscription">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>當前訂閱</CardTitle>
                    <CardDescription>您的訂閱計劃和狀態</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-teal-600" />
                    <span className="text-sm font-medium text-teal-600">已啟用</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">訂閱方案</p>
                    <p className="font-medium">{subscription.planName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">付款週期</p>
                    <p className="font-medium">{subscription.cycle === "annual" ? "年約月付" : "月付"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">月費</p>
                    <p className="font-medium">${subscription.price} / 月</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">下次扣款日期</p>
                    <p className="font-medium">{subscription.nextBillingDate}</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-medium mb-2">包含的功能</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {subscription.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {success && (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertTitle>成功</AlertTitle>
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>錯誤</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                      取消訂閱
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>確認取消訂閱</DialogTitle>
                      <DialogDescription>
                        您確定要取消訂閱嗎？取消後，您仍可以使用服務至 {subscription.nextBillingDate}。
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>注意</AlertTitle>
                        <AlertDescription>
                          取消訂閱後，您將失去進階功能的使用權限，包括無限制的病歷和保單管理、優先客服支援等。
                        </AlertDescription>
                      </Alert>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                        返回
                      </Button>
                      <Button variant="destructive" onClick={handleCancelSubscription} disabled={isLoading}>
                        確認取消
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button asChild className="bg-teal-600 hover:bg-teal-700">
                  <Link href="/subscription">
                    升級方案
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="payment">
            <Card>
              <CardHeader>
                <CardTitle>付款方式</CardTitle>
                <CardDescription>管理您的付款資訊</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border rounded-md p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium">
                          {subscription.paymentMethod.brand} **** **** **** {subscription.paymentMethod.last4}
                        </p>
                        <p className="text-sm text-gray-500">到期日: {subscription.paymentMethod.expiry}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleUpdatePaymentMethod}>
                      更新
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-md">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">下次扣款</p>
                    <p className="text-sm text-gray-500">
                      ${subscription.price} 將於 {subscription.nextBillingDate} 扣款
                    </p>
                  </div>
                </div>

                {success && (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertTitle>成功</AlertTitle>
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>錯誤</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>帳單歷史</CardTitle>
                <CardDescription>查看您的付款記錄</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[{ date: "2024-04-25", amount: 3828, status: "已付款", invoice: "INV-2024-001" }].map(
                    (bill, index) => (
                      <div key={index} className="flex items-center justify-between border-b pb-4">
                        <div>
                          <p className="font-medium">{bill.date}</p>
                          <p className="text-sm text-gray-500">發票號碼: {bill.invoice}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${bill.amount}</p>
                          <p className="text-sm text-green-600">{bill.status}</p>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  下載所有發票
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
