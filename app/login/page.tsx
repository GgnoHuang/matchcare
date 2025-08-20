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
import { loginUser } from "@/app/actions/auth-service"

export default function LoginPage() {
  const router = useRouter()
  const [phoneNumber, setPhoneNumber] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)

    // 簡單驗證
    if (!phoneNumber || !password) {
      setError("請輸入電話號碼和密碼")
      return
    }

    try {
      setIsLoading(true)

      // 使用新的 Supabase 登入邏輯
      const result = await loginUser(phoneNumber, password)

      if (result.success) {
        if (result.isNewUser) {
          setSuccessMessage("註冊成功並已自動登入！")
        } else {
          setSuccessMessage("登入成功！")
        }
        
        // 延遲跳轉讓用戶看到成功訊息
        setTimeout(() => {
          window.location.href = "/"
        }, 1000)
      } else {
        setError(result.error || "登入失敗")
      }
    } catch (err) {
      setError("登入失敗，請稍後再試")
      console.error(err)
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
          <p className="text-sm text-gray-500">歡迎使用醫保快線！請輸入電話和密碼登入</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>登入/註冊</CardTitle>
            <CardDescription>
              輸入電話和密碼，如果是新用戶將自動註冊
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleLogin}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="phone">電話號碼</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="0912345678"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="password">密碼</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="請輸入密碼"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {successMessage && (
                  <Alert className="border-green-200 bg-green-50">
                    <AlertDescription className="text-green-700">
                      {successMessage}
                    </AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      處理中...
                    </>
                  ) : (
                    "登入/註冊"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col items-center gap-2">
            <div className="text-xs text-gray-500 text-center">
              <p>• 如果電話號碼已存在，將驗證密碼後登入</p>
              <p>• 如果是新的電話號碼，將自動註冊並登入</p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}