"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ArrowLeft, Copy, CheckCircle, Building, Store, Clock } from "lucide-react"
import Link from "next/link"
import { getPaymentInfo } from "@/app/actions/payment-service"

export default function PaymentInfoPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")
  const method = searchParams.get("method")

  const [paymentInfo, setPaymentInfo] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    const fetchPaymentInfo = async () => {
      if (!orderId || !method) {
        router.push("/subscription")
        return
      }

      try {
        setIsLoading(true)
        const result = await getPaymentInfo(orderId)

        if (result.success) {
          setPaymentInfo(result.data)
        } else {
          setError(result.error || "無法獲取付款資訊")
        }
      } catch (err) {
        console.error("獲取付款資訊錯誤:", err)
        setError("獲取付款資訊時發生錯誤")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPaymentInfo()
  }, [orderId, method, router])

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(field)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  // 模擬付款資訊
  const mockPaymentInfo = {
    atm: {
      bankCode: "812",
      bankName: "台新銀行",
      accountNumber: "12345678901234",
      amount: "3828",
      expireDate: "2024-05-01 23:59:59",
    },
    cvs: {
      paymentCode: "GW12345678",
      amount: "3828",
      expireDate: "2024-05-01 23:59:59",
    },
  }

  // 使用模擬資料
  const info = method === "atm" ? mockPaymentInfo.atm : mockPaymentInfo.cvs

  return (
    <div className="container py-12">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center mb-8">
          <Link href="/subscription/checkout">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              返回結帳頁面
            </Button>
          </Link>
        </div>

        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">付款資訊</h1>
          <p className="text-gray-500 max-w-xl mx-auto">請使用以下資訊完成付款，付款完成後系統將自動啟用您的訂閱</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {method === "atm" ? (
                <>
                  <Building className="h-5 w-5 text-teal-600" />
                  ATM 轉帳資訊
                </>
              ) : (
                <>
                  <Store className="h-5 w-5 text-teal-600" />
                  超商代碼繳費資訊
                </>
              )}
            </CardTitle>
            <CardDescription>請在到期時間前完成付款，逾期訂單將自動取消</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertTitle>付款期限</AlertTitle>
              <AlertDescription>請於 {info.expireDate} 前完成付款</AlertDescription>
            </Alert>

            <div className="space-y-4">
              {method === "atm" ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">銀行代碼</p>
                      <div className="flex items-center justify-between border rounded-md p-3">
                        <span className="font-medium">{info.bankCode}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2"
                          onClick={() => copyToClipboard(info.bankCode, "bankCode")}
                        >
                          {copied === "bankCode" ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{info.bankName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">金額</p>
                      <div className="border rounded-md p-3">
                        <span className="font-medium">${info.amount}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">轉帳帳號</p>
                    <div className="flex items-center justify-between border rounded-md p-3">
                      <span className="font-medium">{info.accountNumber}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => copyToClipboard(info.accountNumber, "accountNumber")}
                      >
                        {copied === "accountNumber" ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">繳費代碼</p>
                      <div className="flex items-center justify-between border rounded-md p-3">
                        <span className="font-medium">{info.paymentCode}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2"
                          onClick={() => copyToClipboard(info.paymentCode, "paymentCode")}
                        >
                          {copied === "paymentCode" ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">金額</p>
                      <div className="border rounded-md p-3">
                        <span className="font-medium">${info.amount}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-md space-y-2">
              <h3 className="font-medium">付款說明</h3>
              {method === "atm" ? (
                <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                  <li>請使用網路銀行或 ATM 轉帳</li>
                  <li>輸入銀行代碼 {info.bankCode}</li>
                  <li>輸入轉帳帳號 {info.accountNumber}</li>
                  <li>輸入轉帳金額 ${info.amount}</li>
                  <li>完成轉帳後，系統將自動確認付款</li>
                </ol>
              ) : (
                <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                  <li>請至 7-11、全家、萊爾富或 OK 超商的多媒體機台</li>
                  <li>選擇「繳費」功能</li>
                  <li>選擇「綠界科技」</li>
                  <li>輸入繳費代碼 {info.paymentCode}</li>
                  <li>確認金額 ${info.amount} 並完成繳費</li>
                  <li>繳費完成後，系統將自動確認付款</li>
                </ol>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/subscription/checkout">返回修改付款方式</Link>
            </Button>
            <Button asChild className="bg-teal-600 hover:bg-teal-700">
              <Link href="/">返回首頁</Link>
            </Button>
          </CardFooter>
        </Card>

        <div className="text-center text-sm text-gray-500">
          <p>
            如有任何問題，請聯繫我們的客服團隊：
            <a href="mailto:support@matchcare.com" className="text-teal-600 hover:underline ml-1">
              support@matchcare.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
