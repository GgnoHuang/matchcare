"use server"

// 這是模擬的用戶資料更新功能
// 在實際應用中，這些功能應該連接到真實的資料庫

// 模擬的用戶資料庫
const users: Record<string, any> = {
  "0912345678": {
    name: "測試用戶",
    idNumber: "A123456789",
    birthdate: new Date("1990-01-01"),
    gender: "male",
    phone: "0912345678",
    email: "test@example.com",
    address: "台北市信義區信義路五段7號",
    emergencyContact: "",
    emergencyPhone: "",
    occupation: "",
    company: "",
    healthCardNumber: "",
    bankName: "",
    bankBranch: "",
    bankAccount: "",
    medicalNotes: "",
  },
}

// 更新用戶資料
export async function updateUserProfile(data: any) {
  try {
    // 在實際應用中，這裡會更新資料庫中的用戶資料
    console.log("更新用戶資料:", data)

    // 模擬 API 延遲
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // 模擬更新成功
    return { success: true }
  } catch (error) {
    console.error("更新用戶資料失敗:", error)
    return { success: false, error: "更新用戶資料失敗" }
  }
}

// 獲取用戶資料
export async function getUserProfile(phoneNumber: string) {
  try {
    // 在實際應用中，這裡會從資料庫中獲取用戶資料
    const user = users[phoneNumber]

    if (!user) {
      return { success: false, error: "找不到用戶資料" }
    }

    return { success: true, user }
  } catch (error) {
    console.error("獲取用戶資料失敗:", error)
    return { success: false, error: "獲取用戶資料失敗" }
  }
}
