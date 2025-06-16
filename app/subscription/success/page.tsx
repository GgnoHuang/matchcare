"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, ArrowRight } from "lucide-react"
import Link from "next/link"
import { getSubscriptionDetails } from "@/app/actions/payment-service"

export default function SubscriptionSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")

  const [subscription, setSubscription] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSubscriptionDetails = async () => {
      if (!orderId) {
        router.push("/subscription")
        return
      }

      try {
        setIsLoading(true)
        const result = await getSubscriptionDetails(orderId)

        if (result.success) {
          setSubscription(result.data)
        } else {
          // 如果無法獲取訂閱詳情，重定向到訂閱頁面
          router.push("/subscription")
        }
      } catch (err) {
        console.error("獲取訂閱詳情錯誤:", err)
        router.push("/subscription")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSubscriptionDetails()
  }, [orderId, router])

  // 模擬訂閱詳情
  const mockSubscription = {
    planName: "進階方案",
    cycle: "annual",
    price: 319,
    nextBillingDate: "2025-04-25",
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

  // 使用模擬資料
  const subscriptionData = mockSubscription

  return (
    <div className="container py-12">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mx-auto">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">訂閱成功！</h1>
          <p className="text-gray-500 max-w-xl mx-auto">感謝您訂閱醫保快線服務，您現在可以使用所有功能</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>訂閱詳情</CardTitle>
            <CardDescription>您的訂閱已成功啟用</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">訂閱方案</p>
                <p className="font-medium">{subscriptionData.planName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">付款週期</p>
                <p className="font-medium">{subscriptionData.cycle === "annual" ? "年約月付" : "月付"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">月費</p>
                <p className="font-medium">${subscriptionData.price} / 月</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">下次扣款日期</p>
                <p className="font-medium">{subscriptionData.nextBillingDate}</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium mb-2">您現在可以使用的功能</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                {subscriptionData.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/settings/subscription">管理訂閱</Link>
            </Button>
            <Button asChild className="bg-teal-600 hover:bg-teal-700">
              <Link href="/">
                開始使用
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <div className="text-center text-sm text-gray-500">
          <p>
            訂閱詳情和收據已發送至您的電子郵件。如有任何問題，請聯繫我們的客服團隊：
            <a href="mailto:support@matchcare.com" className="text-teal-600 hover:underline ml-1">
              support@matchcare.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
