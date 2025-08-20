"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Loader2 } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()

  useEffect(() => {
    // 註冊頁面已廢除，自動重新導向到登入頁面
    const timer = setTimeout(() => {
      router.push("/login")
    }, 2000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-teal-600" />
            <h1 className="text-3xl font-bold">醫保快線</h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>頁面重新導向</CardTitle>
            <CardDescription>
              註冊功能已整合至登入頁面，正在為您跳轉...
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 py-8">
            <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
            <p className="text-sm text-gray-500">
              現在註冊和登入已合併為同一個流程
            </p>
            <p className="text-xs text-gray-400">
              2 秒後自動跳轉到登入頁面...
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}