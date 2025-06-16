import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    // 設置一個模擬的身份驗證cookie (24小時有效)
    cookies().set("auth", JSON.stringify({ phoneNumber: "0912345678" }), {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      httpOnly: true,
      path: "/",
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("快速登入失敗:", error)
    return NextResponse.json({ success: false, error: "快速登入失敗" }, { status: 500 })
  }
}
