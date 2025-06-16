"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Loader2, AlertCircle, ArrowLeft } from "lucide-react"
import { verifyOTP, sendOTP } from "@/app/actions/auth-actions"

export default function VerifyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const phone = searchParams.get("phone")
  const action = searchParams.get("action") || "login"

  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    // 倒數計時器
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [countdown])

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(0, 1)
    }

    if (value && !/^\d+$/.test(value)) {
      return
    }

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // 自動跳到下一個輸入框
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // 按下刪除鍵且當前輸入框為空時，跳到上一個輸入框
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text/plain").trim()

    if (!/^\d+$/.test(pastedData)) {
      return
    }

    const digits = pastedData.slice(0, 6).split("")
    const newOtp = [...otp]

    digits.forEach((digit, index) => {
      if (index < 6) {
        newOtp[index] = digit
      }
    })

    setOtp(newOtp)

    // 如果貼上的數字填滿了所有輸入框，則聚焦到最後一個
    if (digits.length >= 6) {
      inputRefs.current[5]?.focus()
    } else if (digits.length > 0) {
      // 否則聚焦到下一個空輸入框
      inputRefs.current[digits.length]?.focus()
    }
  }

  const handleVerify = async () => {
    const otpValue = otp.join("")

    if (otpValue.length !== 6) {
      setError("請輸入完整的6位驗證碼")
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const result = await verifyOTP(phone || "", otpValue, action)

      if (result.success) {
        if (action === "register") {
          // 註冊成功，獲取註冊資料
          const registerData = sessionStorage.getItem("registerData")
          if (registerData) {
            // 在實際應用中，這裡會將用戶資料發送到後端進行註冊
            // 這裡僅模擬註冊成功
            sessionStorage.removeItem("registerData")
          }
        }

        // 登入或註冊成功，導向到首頁
        router.push("/")
      } else {
        setError(result.error || "驗證碼錯誤，請重新輸入")
      }
    } catch (err) {
      setError("驗證過程中發生錯誤，請稍後再試")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (!canResend) return

    try {
      setIsLoading(true)
      setError(null)

      const result = await sendOTP(phone || "")

      if (result.success) {
        setCountdown(60)
        setCanResend(false)
      } else {
        setError(result.error || "發送驗證碼失敗，請稍後再試")
      }
    } catch (err) {
      setError("發送驗證碼時發生錯誤，請稍後再試")
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
          <h2 className="text-2xl font-semibold tracking-tight">驗證手機號碼</h2>
          <p className="text-sm text-gray-500">我們已發送驗證碼至 {phone}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>輸入驗證碼</CardTitle>
            <CardDescription>請輸入您收到的6位數驗證碼</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="flex justify-center gap-2">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="w-12 h-12 text-center text-lg"
                    autoFocus={index === 0}
                  />
                ))}
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleVerify}
                className="w-full bg-teal-600 hover:bg-teal-700"
                disabled={isLoading || otp.join("").length !== 6}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    驗證中...
                  </>
                ) : (
                  "驗證"
                )}
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-center gap-2">
            <div className="text-sm text-gray-500">
              {canResend ? (
                <button onClick={handleResendOTP} className="text-teal-600 hover:underline" disabled={isLoading}>
                  重新發送驗證碼
                </button>
              ) : (
                <span>{countdown} 秒後可重新發送驗證碼</span>
              )}
            </div>
            <Button variant="ghost" className="mt-2" onClick={() => router.back()} disabled={isLoading}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
