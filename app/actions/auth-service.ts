"use server"

import { cookies } from "next/headers"

// 用戶資料
const demoUsers = [
  {
    id: "user1",
    name: "王小明",
    phoneNumber: "0912345678",
    email: "user@example.com",
  },
]

// 快速登入功能
export async function quickLogin(phoneNumber = "0912345678") {
  // 使用預設用戶資料，但允許自定義電話號碼
  const user = {
    ...demoUsers[0],
    phoneNumber,
  }

  // 設置身份驗證 cookie (24 小時有效)
  cookies().set("auth", JSON.stringify(user), {
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    path: "/",
  })

  return { success: true, user }
}

// 檢查用戶是否已登入
export async function checkAuth() {
  try {
    const authCookie = cookies().get("auth")

    if (!authCookie?.value) {
      return { isLoggedIn: false }
    }

    try {
      const user = JSON.parse(authCookie.value)
      return {
        isLoggedIn: true,
        user,
      }
    } catch (e) {
      // JSON 解析錯誤，cookie 可能損壞
      cookies().delete("auth")
      return { isLoggedIn: false }
    }
  } catch (error) {
    console.error("檢查身份驗證失敗:", error)
    return { isLoggedIn: false }
  }
}

// 登出
export async function logout() {
  try {
    cookies().delete("auth")
    return { success: true }
  } catch (error) {
    console.error("登出失敗:", error)
    return { success: false, error: "登出過程中發生錯誤" }
  }
}

// 發送 OTP (模擬)
export async function sendOTP(phoneNumber: string) {
  // 這裡只是模擬發送 OTP，實際上直接返回成功
  console.log(`模擬向 ${phoneNumber} 發送 OTP`)
  return { success: true }
}

// 驗證 OTP (模擬)
export async function verifyOTP(phoneNumber: string, otp: string, action: string) {
  // 這裡只是模擬驗證 OTP，實際上直接返回成功並登入用戶
  console.log(`模擬驗證 ${phoneNumber} 的 OTP: ${otp}`)

  // 直接登入用戶
  await quickLogin(phoneNumber)

  return { success: true }
}
