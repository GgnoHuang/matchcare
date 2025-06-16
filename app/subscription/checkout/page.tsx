"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ArrowLeft, CreditCard, Building, Store, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { createPayment } from "@/app/actions/payment-service"

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planId = searchParams.get("plan")
  const cycle = searchParams.get("cycle") as "monthly" | "annual"

  const [paymentMethod, setPaymentMethod] = useState<"credit-card" | "atm" | "cvs">("credit-card")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 計劃資訊
  const plans = {
    basic: {
      name: "基本方案",
      monthlyPrice: 199,
      annualPrice: 159,
    },
    premium: {
      name: "進階方案",
      monthlyPrice: 399,
      annualPrice: 319,
    },
    family: {
      name: "家庭方案",
      monthlyPrice: 699,
      annualPrice: 559,
    },
  }

  // 獲取選擇的計劃
  const selectedPlan = planId ? plans[planId as keyof typeof plans] : null

  // 如果沒有選擇計劃，重定向到訂閱頁面
  useEffect(() => {
    if (!selectedPlan) {
      router.push("/subscription")
    }
  }, [selectedPlan, router])

  if (!selectedPlan) {
    return null
  }

  // 計算價格
  const price = cycle === "annual" ? selectedPlan.annualPrice : selectedPlan.monthlyPrice
  const totalPrice = cycle === "annual" ? price * 12 : price

  // 處理付款
  const handlePayment = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // 創建支付訂單
      const result = await createPayment({
        planId: planId as string,
        cycle,
        paymentMethod,
        amount: totalPrice,
      })

      if (result.success) {
        // 如果是信用卡付款，直接提交表單到綠界
        if (paymentMethod === "credit-card") {
          // 在實際應用中，這裡會提交表單到綠界支付頁面
          // 這裡模擬成功付款
          setTimeout(() => {
            router.push("/subscription/success?orderId=" + result.orderId)
          }, 1500)
        } else {
          // 其他付款方式，顯示付款資訊
          router.push(`/subscription/payment-info?orderId=${result.orderId}&method=${paymentMethod}`)
        }
      } else {
        setError(result.error || "付款處理失敗，請稍後再試")
      }
    } catch (err) {
      console.error("付款處理錯誤:", err)
      setError("付款處理時發生錯誤，請稍後再試")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center mb-8">
          <Link href="/subscription">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              返回方案選擇
            </Button>
          </Link>
        </div>

        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">完成訂閱</h1>
          <p className="text-gray-500 max-w-xl mx-auto">請選擇您偏好的付款方式，完成訂閱流程</p>
        </div>

        <div className="grid gap-8 md:grid-cols-5">
          <div className="md:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>選擇付款方式</CardTitle>
                <CardDescription>所有交易均通過綠界支付處理，確保您的付款安全</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as any)}>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 border rounded-md p-4">
                      <RadioGroupItem value="credit-card" id="credit-card" />
                      <Label htmlFor="credit-card" className="flex items-center gap-2 cursor-pointer flex-1">
                        <CreditCard className="h-5 w-5 text-gray-500" />
                        <div>
                          <div className="font-medium">信用卡付款</div>
                          <div className="text-sm text-gray-500">支援 VISA、MasterCard、JCB</div>
                        </div>
                      </Label>
                      <div className="flex gap-2">
                        <div className="w-10 h-6 bg-gray-100 rounded flex items-center justify-center text-xs font-bold">
                          VISA
                        </div>
                        <div className="w-10 h-6 bg-gray-100 rounded flex items-center justify-center text-xs font-bold">
                          MC
                        </div>
                        <div className="w-10 h-6 bg-gray-100 rounded flex items-center justify-center text-xs font-bold">
                          JCB
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 border rounded-md p-4">
                      <RadioGroupItem value="atm" id="atm" />
                      <Label htmlFor="atm" className="flex items-center gap-2 cursor-pointer flex-1">
                        <Building className="h-5 w-5 text-gray-500" />
                        <div>
                          <div className="font-medium">ATM 轉帳</div>
                          <div className="text-sm text-gray-500">取得專屬虛擬帳號，可使用網路銀行或 ATM 轉帳</div>
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2 border rounded-md p-4">
                      <RadioGroupItem value="cvs" id="cvs" />
                      <Label htmlFor="cvs" className="flex items-center gap-2 cursor-pointer flex-1">
                        <Store className="h-5 w-5 text-gray-500" />
                        <div>
                          <div className="font-medium">超商代碼繳費</div>
                          <div className="text-sm text-gray-500">
                            取得繳費代碼，可至 7-11、全家、萊爾富、OK 超商繳費
                          </div>
                        </div>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>

                {paymentMethod === "credit-card" && (
                  <div className="mt-6 space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="card-number">卡號</Label>
                      <Input id="card-number" placeholder="0000 0000 0000 0000" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="expiry">到期日</Label>
                        <Input id="expiry" placeholder="MM/YY" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="cvc">安全碼</Label>
                        <Input id="cvc" placeholder="CVC" />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="name">持卡人姓名</Label>
                      <Input id="name" placeholder="請輸入持卡人姓名" />
                    </div>
                  </div>
                )}

                {error && (
                  <Alert variant="destructive" className="mt-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>付款錯誤</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>訂單摘要</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="font-medium">{selectedPlan.name}</span>
                  <span>${price} / 月</span>
                </div>

                <div className="flex justify-between text-sm text-gray-500">
                  <span>付款週期</span>
                  <span>{cycle === "annual" ? "年約月付" : "月付"}</span>
                </div>

                {cycle === "annual" && (
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>合約期限</span>
                    <span>12 個月</span>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between font-medium">
                  <span>小計</span>
                  <span>${totalPrice}</span>
                </div>

                <div className="flex justify-between text-sm text-gray-500">
                  <span>付款金額</span>
                  <span>{cycle === "annual" ? "一次性付款" : "每月付款"}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-teal-600 hover:bg-teal-700" onClick={handlePayment} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      處理中...
                    </>
                  ) : (
                    `確認付款 $${totalPrice}`
                  )}
                </Button>
              </CardFooter>
            </Card>

            <div className="mt-4 text-xs text-gray-500 space-y-2">
              <p>
                點擊「確認付款」，即表示您同意我們的
                <Link href="/terms" className="text-teal-600 hover:underline mx-1">
                  服務條款
                </Link>
                和
                <Link href="/privacy" className="text-teal-600 hover:underline mx-1">
                  隱私政策
                </Link>
              </p>
              <p>您可以隨時在帳號設定中管理或取消您的訂閱。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
