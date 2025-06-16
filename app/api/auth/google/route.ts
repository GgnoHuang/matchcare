import { NextResponse } from "next/server"
import { cookies } from "next/headers"

// 這是模擬的 Google OAuth 流程
// 在實際應用中，應該使用 NextAuth.js 或其他 OAuth 庫

export async function GET() {
  // 在實際應用中，這裡會重定向到 Google 的 OAuth 頁面
  // 這裡僅模擬 OAuth 流程

  // 模擬成功登入
  cookies().set(
    "auth",
    JSON.stringify({
      provider: "google",
      email: "user@gmail.com",
      name: "Google 用戶",
    }),
    {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      httpOnly: true,
      path: "/",
    },
  )

  // 重定向到首頁
  return NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"))
}
