"use server"

import { cookies } from "next/headers"
import { loginOrRegisterUser } from "@/lib/supabase"

// 登入/註冊功能 - 使用 Supabase
export async function loginUser(phoneNumber: string, password: string) {
  try {
    const result = await loginOrRegisterUser(phoneNumber, password)
    
    if (!result.success) {
      return { success: false, error: result.error }
    }

    // 設置身份驗證 cookie (24 小時有效)
    const cookieStore = await cookies()
    cookieStore.set("auth", JSON.stringify(result.user), {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      path: "/",
    })

    return { 
      success: true, 
      user: result.user,
      isNewUser: !result.isLogin // 如果是註冊則為新用戶
    }
  } catch (error) {
    console.error("登入失敗:", error)
    return { success: false, error: "登入過程中發生錯誤" }
  }
}

// 檢查用戶是否已登入 - 保持現有邏輯
export async function checkAuth() {
  try {
    const cookieStore = await cookies()
    const authCookie = cookieStore.get("auth")

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
      const cookieStoreForDelete = await cookies()
      cookieStoreForDelete.delete("auth")
      return { isLoggedIn: false }
    }
  } catch (error) {
    console.error("檢查身份驗證失敗:", error)
    return { isLoggedIn: false }
  }
}

// 登出 - 保持現有邏輯
export async function logout() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete("auth")
    return { success: true }
  } catch (error) {
    console.error("登出失敗:", error)
    return { success: false, error: "登出過程中發生錯誤" }
  }
}

// 廢除的功能 - 保持兼容性但不再使用
export async function quickLogin(phoneNumber = "0912345678") {
  console.warn("quickLogin 已廢除，請使用 loginUser")
  return { success: false, error: "此功能已廢除" }
}

export async function sendOTP(phoneNumber: string) {
  console.warn("sendOTP 已廢除")
  return { success: false, error: "此功能已廢除" }
}

export async function verifyOTP(phoneNumber: string, otp: string, action: string) {
  console.warn("verifyOTP 已廢除")
  return { success: false, error: "此功能已廢除" }
}