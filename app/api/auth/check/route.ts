import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const authCookie = cookies().get("auth")

    if (!authCookie?.value) {
      return NextResponse.json({ isLoggedIn: false })
    }

    // 在實際應用中，這裡會驗證cookie的有效性
    // 這裡僅簡單檢查cookie是否存在
    return NextResponse.json({ isLoggedIn: true })
  } catch (error) {
    console.error("檢查登入狀態失敗:", error)
    return NextResponse.json({ isLoggedIn: false })
  }
}
