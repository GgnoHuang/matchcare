"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import { registerUser } from "../actions/auth-actions"
import { QuickLoginButton } from "../components/quick-login-button"

export default function RegisterPage() {
  const router = useRouter()
  const [phone, setPhone] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [confirmPassword, setConfirmPassword] = useState<string>("")
  const [name, setName] = useState<string>("")
  const [idNumber, setIdNumber] = useState<string>("")
  const [birthdate, setBirthdate] = useState<string>("")
  const [agreeTerms, setAgreeTerms] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [registerMethod, setRegisterMethod] = useState<string>("phone")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    // 基本驗證
    if (registerMethod === "phone" && !phone) {
      setError("請輸入手機號碼")
      setIsLoading(false)
      return
    }

    if (registerMethod === "email" && !email) {
      setError("請輸入電子郵件")
      setIsLoading(false)
      return
    }

    if (!password) {
      setError("請輸入密碼")
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError("密碼不一致")
      setIsLoading(false)
      return
    }

    if (!name) {
      setError("請輸入姓名")
      setIsLoading(false)
      return
    }

    if (!idNumber) {
      setError("請輸入身分證字號")
      setIsLoading(false)
      return
    }

    if (!birthdate) {
      setError("請輸入出生日期")
      setIsLoading(false)
      return
    }

    if (!agreeTerms) {
      setError("請同意服務條款和隱私政策")
      setIsLoading(false)
      return
    }

    try {
      // 呼叫註冊 API
      const result = await registerUser({
        phone: registerMethod === "phone" ? phone : "",
        email: registerMethod === "email" ? email : "",
        password,
        name,
        idNumber,
        birthdate,
      })

      if (result.success) {
        // 註冊成功，導向驗證頁面
        router.push(`/verify?method=${registerMethod}&contact=${registerMethod === "phone" ? phone : email}`)
      } else {
        setError(result.error || "註冊失敗，請稍後再試")
      }
    } catch (err) {
      console.error("註冊錯誤:", err)
      setError("註冊時發生錯誤，請稍後再試")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container py-8 px-4 md:py-12 md:px-6 flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <QuickLoginButton className="mb-4" />
          <h1 className="text-3xl font-bold">註冊帳號</h1>
          <p className="text-gray-500 mt-2">建立您的醫保快線帳號，開始使用完整功能</p>
        </div>

        <Card>
          <CardHeader>
            <Tabs defaultValue="phone" onValueChange={(value) => setRegisterMethod(value)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="phone">手機註冊</TabsTrigger>
                <TabsTrigger value="email">電子郵件註冊</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-4">
                {registerMethod === "phone" ? (
                  <div className="space-y-2">
                    <Label htmlFor="phone">手機號碼</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="請輸入手機號碼"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="email">電子郵件</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="請輸入電子郵件"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password">密碼</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="請設定密碼"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">確認密碼</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="請再次輸入密碼"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">姓名</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="請輸入姓名"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="idNumber">身分證字號</Label>
                  <Input
                    id="idNumber"
                    type="text"
                    placeholder="請輸入身分證字號"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthdate">出生日期</Label>
                  <Input id="birthdate" type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} />
                </div>

                <div className="flex items-start space-x-2 pt-2">
                  <Checkbox
                    id="terms"
                    checked={agreeTerms}
                    onCheckedChange={(checked: boolean) => setAgreeTerms(checked)}
                    className="mt-1"
                  />
                  <Label htmlFor="terms" className="text-sm">
                    我同意
                    <Link href="/terms" className="text-teal-600 hover:underline mx-1">
                      服務條款
                    </Link>
                    和
                    <Link href="/privacy" className="text-teal-600 hover:underline mx-1">
                      隱私政策
                    </Link>
                  </Label>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    處理中...
                  </>
                ) : (
                  "註冊"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-500">
              已有帳號？
              <Link href="/login" className="text-teal-600 hover:underline ml-1">
                登入
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
