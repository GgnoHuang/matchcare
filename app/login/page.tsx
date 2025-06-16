"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Loader2, AlertCircle } from "lucide-react"
import { quickLogin } from "@/app/actions/auth-service"

export default function LoginPage() {
  const router = useRouter()
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // 簡單的台灣手機號碼驗證
    if (!phoneNumber.match(/^09\d{8}$/)) {
      setError("請輸入有效的台灣手機號碼")
      return
    }

    try {
      setIsLoading(true)

      // 演示模式：直接登入，不需要驗證碼
      const result = await quickLogin(phoneNumber)

      if (result.success) {
        // 使用 window.location 而不是 router.push 確保頁面完全重新加載
        window.location.href = "/"
      } else {
        setError("登入失敗，請稍後再試")
      }
    } catch (err) {
      setError("登入失敗，請稍後再試")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    try {
      setIsLoading(true)
      const result = await quickLogin()
      if (result.success) {
        // 使用 window.location 而不是 router.push 確保頁面完全重新加載
        window.location.href = "/"
      }
    } catch (error) {
      console.error("登入失敗:", error)
      setError("登入失敗，請稍後再試")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-teal-600" />
            <h1 className="text-3xl font-bold">醫保快線</h1>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">登入您的帳號</h2>
          <p className="text-sm text-gray-500">歡迎回來！請登入您的帳號以繼續使用醫保快線服務</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>手機號碼登入</CardTitle>
            <CardDescription>請輸入您的手機號碼登入系統</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full bg-teal-600 hover:bg-teal-700" onClick={handleDemoLogin} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  登入中...
                </>
              ) : (
                "快速體驗登入"
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">或者</span>
              </div>
            </div>

            <form onSubmit={handlePhoneLogin}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="phone">手機號碼</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="0912345678"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      登入中...
                    </>
                  ) : (
                    "登入"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col items-center gap-2">
            <div className="text-sm text-gray-500">
              還沒有帳號？
              <Link href="/register" className="ml-1 text-teal-600 hover:underline">
                立即註冊
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
