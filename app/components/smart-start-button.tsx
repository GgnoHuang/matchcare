"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowRight, Loader2 } from "lucide-react"

// 檢查用戶是否已登入
async function checkUserLoggedIn() {
  try {
    const response = await fetch("/api/auth/check", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      return { isLoggedIn: false }
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("檢查登入狀態失敗:", error)
    return { isLoggedIn: false }
  }
}

export function SmartStartButton() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const { isLoggedIn } = await checkUserLoggedIn()
      setIsLoggedIn(isLoggedIn)
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const handleClick = () => {
    if (isLoggedIn) {
      // 已登入用戶導向至AI保單健檢頁面
      router.push("/insurance")
    } else {
      // 未登入用戶導向至註冊頁面
      router.push("/register")
    }
  }

  if (isLoading) {
    return (
      <Button disabled className="bg-teal-600 hover:bg-teal-700">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        載入中...
      </Button>
    )
  }

  return (
    <Button onClick={handleClick} className="bg-teal-600 hover:bg-teal-700">
      立即開始
      <ArrowRight className="ml-2 h-4 w-4" />
    </Button>
  )
}
