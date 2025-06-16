"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Shield } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

export default function SubscriptionPage() {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual")

  const plans = [
    {
      id: "basic",
      name: "基本方案",
      description: "適合個人基本醫療保險理賠需求",
      monthlyPrice: 149,
      annualPrice: 129,
      features: ["病歷管理 (最多10筆)", "保單管理 (最多5份)", "理賠申請 (每月3次)", "基本資源匹配"],
      recommended: false,
    },
    {
      id: "premium",
      name: "進階方案",
      description: "適合有多項保單和頻繁理賠需求的用戶",
      monthlyPrice: 599,
      annualPrice: 499,
      features: [
        "病歷管理 (無限制)",
        "保單管理 (無限制)",
        "理賠申請 (無限制)",
        "優先資源匹配",
        "優先客服支援",
        "理賠成功率分析",
      ],
      recommended: true,
    },
    {
      id: "professional",
      name: "專業方案",
      description: "適用於保險從業人員，提供客戶管理與專業分析功能",
      monthlyPrice: null,
      annualPrice: null,
      features: ["可管理人數 n 人", "病歷管理 (無限制)", "保單管理 (無限制)", "理賠申請 (無限制)", "專業分析報表"],
      recommended: false,
    },
  ]

  const handleSubscribe = () => {
    if (!selectedPlan) return

    // 導向到結帳頁面，帶上選擇的方案和付款週期
    router.push(`/subscription/checkout?plan=${selectedPlan}&cycle=${billingCycle}`)
  }

  // 計算年付節省金額
  const calculateSavings = (monthlyPrice: number, annualPrice: number) => {
    return Math.round((monthlyPrice - annualPrice) * 12)
  }

  return (
    <div className="container py-8 md:py-12">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">選擇您的訂閱方案</h1>
          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto">
            選擇最適合您需求的方案，開始使用醫保快線的完整功能，簡化您的醫療保險理賠流程
          </p>
        </div>

        <div className="flex justify-center">
          <Tabs
            defaultValue="annual"
            className="w-full"
            onValueChange={(value) => setBillingCycle(value as "monthly" | "annual")}
          >
            <div className="flex justify-center mb-8">
              <TabsList className="grid w-full max-w-[400px] grid-cols-2">
                <TabsTrigger value="monthly">月付方案</TabsTrigger>
                <TabsTrigger value="annual">年約月付 (享優惠)</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="monthly" className="space-y-8">
              <div className="grid gap-6 md:grid-cols-3">
                {plans.map((plan) => (
                  <Card
                    key={plan.id}
                    className={`relative overflow-hidden ${plan.recommended ? "border-teal-500 shadow-lg" : ""}`}
                  >
                    {plan.recommended && (
                      <div className="absolute top-0 right-0">
                        <Badge className="rounded-tl-none rounded-br-none bg-teal-500 text-white">推薦方案</Badge>
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle>{plan.name}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                      <div className="mt-4">
                        <span className="text-3xl font-bold">
                          ${plan.id === "professional" ? "-" : plan.monthlyPrice}
                        </span>
                        <span className="text-gray-500"> / 月</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <RadioGroup value={selectedPlan || ""} onValueChange={setSelectedPlan}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value={plan.id} id={`${plan.id}-monthly`} />
                          <Label htmlFor={`${plan.id}-monthly`}>選擇此方案</Label>
                        </div>
                      </RadioGroup>
                      <div className="mt-6 space-y-2">
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-teal-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        className={`w-full ${plan.recommended ? "bg-teal-600 hover:bg-teal-700" : ""}`}
                        onClick={() => {
                          if (plan.id === "professional") {
                            router.push("/contact")
                          } else {
                            setSelectedPlan(plan.id)
                            handleSubscribe()
                          }
                        }}
                      >
                        {plan.id === "professional" ? "聯繫醫保" : "選擇方案"}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="annual" className="space-y-8">
              <Alert className="bg-blue-50 border-blue-200 mb-6">
                <Shield className="h-4 w-4 text-blue-600" />
                <AlertTitle>年約優惠</AlertTitle>
                <AlertDescription>
                  選擇年約月付方案，每月最高可省下{" "}
                  {Math.max(
                    ...plans.map((p) =>
                      p.monthlyPrice && p.annualPrice ? calculateSavings(p.monthlyPrice, p.annualPrice) / 12 : 0,
                    ),
                  )}{" "}
                  元！
                </AlertDescription>
              </Alert>

              <div className="grid gap-6 md:grid-cols-3">
                {plans.map((plan) => (
                  <Card
                    key={plan.id}
                    className={`relative overflow-hidden ${plan.recommended ? "border-teal-500 shadow-lg" : ""}`}
                  >
                    {plan.recommended && (
                      <div className="absolute top-0 right-0">
                        <Badge className="rounded-tl-none rounded-br-none bg-teal-500 text-white">推薦方案</Badge>
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle>{plan.name}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                      <div className="mt-4">
                        <div className="flex items-center flex-wrap gap-2">
                          <span className="text-3xl font-bold">
                            ${plan.id === "professional" ? "-" : plan.annualPrice}
                          </span>
                          <span className="text-gray-500"> / 月</span>
                          {plan.id !== "professional" && plan.monthlyPrice && plan.annualPrice && (
                            <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
                              省 ${calculateSavings(plan.monthlyPrice, plan.annualPrice)} 元/年
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {plan.id === "professional" ? "年繳 $-" : `年繳 $${plan.annualPrice * 12} 元`}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <RadioGroup value={selectedPlan || ""} onValueChange={setSelectedPlan}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value={plan.id} id={`${plan.id}-annual`} />
                          <Label htmlFor={`${plan.id}-annual`}>選擇此方案</Label>
                        </div>
                      </RadioGroup>
                      <div className="mt-6 space-y-2">
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-teal-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        className={`w-full ${plan.recommended ? "bg-teal-600 hover:bg-teal-700" : ""}`}
                        onClick={() => {
                          if (plan.id === "professional") {
                            router.push("/contact")
                          } else {
                            setSelectedPlan(plan.id)
                            handleSubscribe()
                          }
                        }}
                      >
                        {plan.id === "professional" ? "聯繫醫保" : "選擇方案"}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex justify-center mt-8">
          <Button
            size="lg"
            className="bg-teal-600 hover:bg-teal-700"
            disabled={!selectedPlan}
            onClick={handleSubscribe}
          >
            繼續訂閱
          </Button>
        </div>

        <div className="mt-12 border-t pt-8">
          <h2 className="text-2xl font-bold mb-4 text-center">常見問題</h2>
          <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
            <div>
              <h3 className="font-bold mb-2">如何選擇適合我的方案？</h3>
              <p className="text-gray-600">
                基本方案適合偶爾需要處理理賠的個人用戶；進階方案適合有多份保單和頻繁理賠需求的用戶；
                家庭方案則適合需要為多位家庭成員管理醫療和保險資訊的用戶。
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-2">我可以隨時更改或取消訂閱嗎？</h3>
              <p className="text-gray-600">
                是的，您可以隨時在帳號設定中更改或取消訂閱。月付方案可在當月結束後取消，年約方案則會在年度期限結束後取消。
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-2">付款方式有哪些？</h3>
              <p className="text-gray-600">
                我們支援信用卡、ATM轉帳和超商代碼等多種付款方式，所有交易均通過綠界支付進行，確保您的付款安全。
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-2">如果我需要更多支援，該怎麼辦？</h3>
              <p className="text-gray-600">
                所有訂閱方案都包含客戶支援服務。進階和家庭方案的用戶可享有優先支援和更快的回應時間。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
