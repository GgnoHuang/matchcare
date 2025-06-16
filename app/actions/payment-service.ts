"use server"

// 這是模擬的綠界支付整合服務
// 在實際應用中，這些功能應該連接到綠界支付 API

import { cookies } from "next/headers"

// 模擬創建支付訂單
export async function createPayment(data: {
  planId: string
  cycle: "monthly" | "annual"
  paymentMethod: "credit-card" | "atm" | "cvs"
  amount: number
}) {
  try {
    console.log("創建支付訂單:", data)

    // 在實際應用中，這裡會調用綠界支付 API 創建訂單
    // 這裡僅模擬成功創建訂單

    // 生成訂單 ID
    const orderId = `ORDER-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    // 模擬儲存訂單資訊
    const orderInfo = {
      orderId,
      ...data,
      status: "pending",
      createdAt: new Date().toISOString(),
    }

    console.log("訂單已創建:", orderInfo)

    return { success: true, orderId }
  } catch (error) {
    console.error("創建支付訂單失敗:", error)
    return { success: false, error: "創建支付訂單失敗" }
  }
}

// 模擬獲取付款資訊
export async function getPaymentInfo(orderId: string) {
  try {
    console.log("獲取付款資訊:", orderId)

    // 在實際應用中，這裡會從資料庫或綠界 API 獲取付款資訊
    // 這裡僅模擬返回付款資訊

    // 模擬付款資訊
    const paymentInfo = {
      orderId,
      atm: {
        bankCode: "812",
        bankName: "台新銀行",
        accountNumber: "12345678901234",
        amount: "3828",
        expireDate: "2024-05-01 23:59:59",
      },
      cvs: {
        paymentCode: "GW12345678",
        amount: "3828",
        expireDate: "2024-05-01 23:59:59",
      },
    }

    return { success: true, data: paymentInfo }
  } catch (error) {
    console.error("獲取付款資訊失敗:", error)
    return { success: false, error: "獲取付款資訊失敗" }
  }
}

// 模擬獲取訂閱詳情
export async function getSubscriptionDetails(orderId: string) {
  try {
    console.log("獲取訂閱詳情:", orderId)

    // 在實際應用中，這裡會從資料庫獲取訂閱詳情
    // 這裡僅模擬返回訂閱詳情

    // 模擬訂閱詳情
    const subscriptionDetails = {
      orderId,
      planName: "進階方案",
      cycle: "annual",
      price: 319,
      nextBillingDate: "2025-04-25",
      features: [
        "病歷管理 (無限制)",
        "保單管理 (無限制)",
        "理賠申請 (無限制)",
        "優先資源匹配",
        "優先客服支援",
        "理賠成功率分析",
        "專業理賠建議",
      ],
    }

    // 設置訂閱 cookie
    cookies().set(
      "subscription",
      JSON.stringify({
        active: true,
        planId: "premium",
        cycle: "annual",
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // One year from now
      }),
    )

    return { success: true, data: subscriptionDetails }
  } catch (error) {
    console.error("獲取訂閱詳情失敗:", error)
    return { success: false, error: "獲取訂閱詳情失敗" }
  }
}

// 模擬取消訂閱
export async function cancelSubscription() {
  try {
    console.log("取消訂閱")

    // 在實際應用中，這裡會調用支付服務 API 取消訂閱
    // 這裡僅模擬成功取消訂閱

    // 清除訂閱 cookie
    cookies().delete("subscription")

    return { success: true }
  } catch (error) {
    console.error("取消訂閱失敗:", error)
    return { success: false, error: "取消訂閱失敗" }
  }
}

// 模擬更新付款方式
export async function updatePaymentMethod() {
  try {
    console.log("更新付款方式")

    // 在實際應用中，這裡會調用支付服務 API 更新付款方式
    // 這裡僅模擬成功更新付款方式

    return { success: true }
  } catch (error) {
    console.error("更新付款方式失敗:", error)
    return { success: false, error: "更新付款方式失敗" }
  }
}
