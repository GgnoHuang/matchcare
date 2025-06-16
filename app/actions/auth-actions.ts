"use server"

// 這是模擬的 OTP 發送和驗證功能
// 在實際應用中，這些功能應該連接到真實的簡訊服務和資料庫

import { cookies } from "next/headers"

// 模擬的 OTP 儲存
const otpStore: Record<string, { otp: string; expires: number }> = {}

// 模擬的用戶資料庫
const users: Record<string, { name: string; email?: string }> = {
  "0912345678": { name: "測試用戶", email: "test@example.com" },
}

// 生成 6 位數的隨機 OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// 發送 OTP
export async function sendOTP(phoneNumber: string) {
  try {
    // 驗證手機號碼格式
    if (!phoneNumber.match(/^09\d{8}$/)) {
      return { success: false, error: "無效的手機號碼格式" }
    }

    // 生成 OTP
    const otp = generateOTP()

    // 在實際應用中，這裡會調用簡訊服務發送 OTP
    console.log(`向 ${phoneNumber} 發送 OTP: ${otp}`)

    // 儲存 OTP (5 分鐘有效)
    otpStore[phoneNumber] = {
      otp,
      expires: Date.now() + 5 * 60 * 1000,
    }

    return { success: true }
  } catch (error) {
    console.error("發送 OTP 失敗:", error)
    return { success: false, error: "發送驗證碼失敗" }
  }
}

// 驗證 OTP
export async function verifyOTP(phoneNumber: string, otp: string, action: string) {
  try {
    // 檢查 OTP 是否存在且有效
    const storedData = otpStore[phoneNumber]

    if (!storedData) {
      return { success: false, error: "驗證碼不存在或已過期，請重新發送" }
    }

    if (Date.now() > storedData.expires) {
      delete otpStore[phoneNumber]
      return { success: false, error: "驗證碼已過期，請重新發送" }
    }

    if (storedData.otp !== otp) {
      return { success: false, error: "驗證碼錯誤，請重新輸入" }
    }

    // 驗證成功，清除 OTP
    delete otpStore[phoneNumber]

    // 如果是註冊操作，創建新用戶
    if (action === "register") {
      // 在實際應用中，這裡會將用戶資料儲存到資料庫
      // 這裡僅模擬註冊成功
      if (!users[phoneNumber]) {
        users[phoneNumber] = { name: "新用戶" }
      }
    }

    // 設置身份驗證 cookie (24 小時有效)
    cookies().set("auth", JSON.stringify({ phoneNumber }), {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      httpOnly: true,
      path: "/",
    })

    return { success: true }
  } catch (error) {
    console.error("驗證 OTP 失敗:", error)
    return { success: false, error: "驗證過程中發生錯誤" }
  }
}

// 檢查用戶是否已登入
export async function checkAuth() {
  try {
    const authCookie = cookies().get("auth")

    if (!authCookie?.value) {
      return { isLoggedIn: false }
    }

    const { phoneNumber } = JSON.parse(authCookie.value)
    const user = users[phoneNumber]

    if (!user) {
      return { isLoggedIn: false }
    }

    return {
      isLoggedIn: true,
      user: {
        phoneNumber,
        name: user.name,
        email: user.email,
      },
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

// 模擬註冊用戶
export async function registerUser(data: {
  phone: string
  email: string
  password: string
  name: string
  idNumber: string
  birthdate: string
}) {
  try {
    // 驗證手機號碼格式
    if (data.phone && !data.phone.match(/^09\d{8}$/)) {
      return { success: false, error: "無效的手機號碼格式" }
    }

    // 驗證電子郵件格式
    if (data.email && !data.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return { success: false, error: "無效的電子郵件格式" }
    }

    // 儲存註冊資料到 sessionStorage，以便在驗證後使用
    // 在實際應用中，這裡會將用戶資料儲存到資料庫
    // 這裡僅模擬註冊成功
    return { success: true }
  } catch (error) {
    console.error("註冊用戶失敗:", error)
    return { success: false, error: "註冊失敗" }
  }
}

async function quickLogin() {
  return { success: false, error: "Quick login not implemented" }
}

export { quickLogin }
