"use client"

import type React from "react"

interface SubscriptionRequiredProps {
  children: React.ReactNode
  requiredPlan?: "basic" | "premium" | "family"
  feature?: string
}

// 修改 SubscriptionRequired 組件，使其暫時不阻止用戶訪問任何功能
export default function SubscriptionRequired({ children, requiredPlan = "basic", feature }: SubscriptionRequiredProps) {
  // 暫時直接返回子組件，不進行訂閱檢查
  return <>{children}</>

  // 以下是原始代碼，已註釋掉
  /*
  const router = useRouter()
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const [subscription, setSubscription] = useState<any>(null)

  useEffect(() => {
    // 檢查用戶訂閱狀態
    const checkSubscription = () => {
      try {
        const cookies = document.cookie.split(";").reduce(
          (acc, cookie) => {
            const [key, value] = cookie.trim().split("=")
            acc[key] = value
            return acc
          },
          {} as Record<string, string>,
        )

        if (!cookies.subscription) {
          setHasAccess(false)
          return
        }

        try {
          const subscriptionData = JSON.parse(decodeURIComponent(cookies.subscription))
          setSubscription(subscriptionData)

          // 檢查訂閱是否有效
          if (!subscriptionData.active) {
            setHasAccess(false)
            return
          }

          // 檢查訂閱計劃是否符合要求
          const planHierarchy = {
            basic: 1,
            premium: 2,
            family: 3,
          }

          const requiredLevel = planHierarchy[requiredPlan]
          const userLevel = planHierarchy[subscriptionData.planId] || 0

          setHasAccess(userLevel >= requiredLevel)
        } catch (e) {
          console.error("解析訂閱數據錯誤:", e)
          setHasAccess(false)
        }
      } catch (error) {
        console.error("檢查訂閱狀態錯誤:", error)
        setHasAccess(false)
      }
    }

    checkSubscription()
  }, [requiredPlan])

  // 如果還在檢查訂閱狀態，顯示載入中
  if (hasAccess === null) {
    return <div className="p-8 text-center">檢查訂閱狀態中...</div>
  }

  // 如果用戶有權限，顯示內容
  if (hasAccess) {
    return <>{children}</>
  }

  // 如果用戶沒有權限，顯示訂閱提示
  return (
    <div className="container py-12">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto bg-amber-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-amber-600" />
          </div>
          <CardTitle className="text-2xl">需要升級訂閱</CardTitle>
          <CardDescription>
            {feature ? `「${feature}」功能` : "此功能"}需要
            {requiredPlan === "premium" ? "進階" : requiredPlan === "family" ? "家庭" : "基本"}
            方案或更高級別的訂閱
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-md">
            {subscription?.active ? (
              <p>
                您目前的訂閱方案是
                <span className="font-medium">
                  {subscription.planId === "basic"
                    ? "基本方案"
                    : subscription.planId === "premium"
                      ? "進階方案"
                      : "家庭方案"}
                </span>
                ，需要升級才能使用此功能。
              </p>
            ) : (
              <p>您目前沒有活躍的訂閱，請訂閱以使用完整功能。</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild className="bg-teal-600 hover:bg-teal-700">
            <Link href="/subscription">
              {subscription?.active ? "升級訂閱" : "查看訂閱方案"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
  */
}
