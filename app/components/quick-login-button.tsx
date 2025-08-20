"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

// 體驗登入功能已廢除，改為導向正式登入頁面
export function QuickLoginButton({ className = "" }) {
  return (
    <Link href="/login">
      <Button variant="outline" className={className}>
        前往登入
      </Button>
    </Link>
  )
}