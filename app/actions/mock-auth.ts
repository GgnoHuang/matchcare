"use server"

import { cookies } from "next/headers"

// 假用戶資料
const mockUsers = [
  {
    id: "user1",
    name: "測試用戶",
    phoneNumber: "0912345678",
    email: "test@example.com",
  },
  {
    id: "user2",
    name: "管理員",
    phoneNumber: "0987654321",
    email: "admin@example.com",
    isAdmin: true,
  },
]

// 假登入功能
export async function mockLogin(userId = "user1") {
  const user = mockUsers.find((u) => u.id === userId) || mockUsers[0]

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
