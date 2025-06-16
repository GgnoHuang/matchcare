import { cookies } from "next/headers"

// 檢查用戶是否有活躍的訂閱
export function checkSubscriptionStatus() {
  const subscriptionCookie = cookies().get("subscription")

  if (!subscriptionCookie?.value) {
    return {
      active: false,
      planId: null,
      cycle: null,
      expiresAt: null,
    }
  }

  try {
    const subscription = JSON.parse(subscriptionCookie.value)

    // 檢查訂閱是否過期
    if (subscription.expiresAt && new Date(subscription.expiresAt) < new Date()) {
      return {
        active: false,
        planId: null,
        cycle: null,
        expiresAt: null,
      }
    }

    return {
      active: subscription.active || false,
      planId: subscription.planId || null,
      cycle: subscription.cycle || null,
      expiresAt: subscription.expiresAt || null,
    }
  } catch (error) {
    console.error("解析訂閱狀態錯誤:", error)
    return {
      active: false,
      planId: null,
      cycle: null,
      expiresAt: null,
    }
  }
}

// 獲取訂閱計劃名稱
export function getPlanName(planId: string | null) {
  if (!planId) return null

  const plans: Record<string, string> = {
    basic: "基本方案",
    premium: "進階方案",
    family: "家庭方案",
  }

  return plans[planId] || null
}

// 獲取訂閱週期名稱
export function getCycleName(cycle: string | null) {
  if (!cycle) return null

  const cycles: Record<string, string> = {
    monthly: "月付",
    annual: "年約月付",
  }

  return cycles[cycle] || null
}

// 檢查用戶是否可以訪問特定功能
export function canAccessFeature(feature: string, planId: string | null) {
  if (!planId) return false

  // 定義各方案可訪問的功能
  const featureAccess: Record<string, string[]> = {
    basic: ["basic_medical_records", "basic_insurance", "basic_claims", "basic_resources"],
    premium: [
      "basic_medical_records",
      "basic_insurance",
      "basic_claims",
      "basic_resources",
      "unlimited_medical_records",
      "unlimited_insurance",
      "unlimited_claims",
      "priority_resources",
      "priority_support",
      "claims_analysis",
    ],
    family: [
      "basic_medical_records",
      "basic_insurance",
      "basic_claims",
      "basic_resources",
      "unlimited_medical_records",
      "unlimited_insurance",
      "unlimited_claims",
      "priority_resources",
      "priority_support",
      "claims_analysis",
      "family_members",
      "family_analysis",
    ],
  }

  return featureAccess[planId]?.includes(feature) || false
}
