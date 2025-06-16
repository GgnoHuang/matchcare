"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

// 這個函數會在客戶端調用服務器動作
async function performQuickLogin() {
  try {
    // 使用fetch調用API端點
    const response = await fetch("/api/auth/quick-login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("快速登入失敗")
    }

    return { success: true }
  } catch (error) {
    console.error("快速登入失敗:", error)
    return { success: false, error: "快速登入失敗" }
  }
}

export function QuickLoginButton({ className = "" }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleQuickLogin = async () => {
    try {
      setIsLoading(true)
      const result = await performQuickLogin()
      if (result.success) {
        // 登入成功後導向至AI保單健檢頁面
        router.push("/insurance")
      }
    } catch (error) {
      console.error("快速登入失敗:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button variant="outline" className={className} onClick={handleQuickLogin} disabled={isLoading}>
      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      體驗登入
    </Button>
  )
}
