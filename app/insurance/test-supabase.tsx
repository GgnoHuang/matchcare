"use client"

import { useState, useEffect } from "react"
import { checkAuth } from "@/app/actions/auth-service"
import { getUserPolicies } from "@/lib/supabaseDataService"

interface User {
  id: string
  username: string
  phoneNumber: string
  email?: string
}

export default function TestSupabasePage() {
  const [user, setUser] = useState<User | null>(null)
  const [policies, setPolicies] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 檢查用戶登入狀態
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { isLoggedIn, user: authUser } = await checkAuth()
        if (isLoggedIn && authUser) {
          setUser(authUser)
          console.log('用戶已登入:', authUser)
        } else {
          console.log('用戶未登入')
          setUser(null)
        }
      } catch (error) {
        console.error('獲取用戶資訊失敗:', error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }
    fetchUser()
  }, [])

  // 載入用戶保單資料
  useEffect(() => {
    if (user?.phoneNumber) {
      loadPolicies()
    }
  }, [user])

  const loadPolicies = async () => {
    if (!user?.phoneNumber) return
    
    try {
      console.log('載入用戶保單資料，電話號碼:', user.phoneNumber)
      const result = await getUserPolicies(user.phoneNumber)
      
      if (result.success) {
        console.log('從 Supabase 載入的保單資料:', result.policies)
        setPolicies(result.policies)
      } else {
        console.error('載入保單失敗:', result.error)
        setError(result.error)
        setPolicies([])
      }
    } catch (error: any) {
      console.error('載入保單資料失敗:', error)
      setError(error.message)
      setPolicies([])
    }
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">載入中...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <p className="text-xl font-semibold mb-2">請先登入</p>
          <p className="text-gray-500 mb-4">您需要登入才能查看保單資訊</p>
          <a href="/login" className="text-blue-600 hover:underline">前往登入</a>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Supabase 保單測試</h1>
      
      <div className="mb-6 p-4 bg-gray-100 rounded">
        <h2 className="text-lg font-semibold mb-2">用戶資訊</h2>
        <p>用戶名: {user.username}</p>
        <p>電話: {user.phoneNumber}</p>
        <p>ID: {user.id}</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded">
          <h3 className="text-red-700 font-semibold">錯誤</h3>
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">保單資料 ({policies.length} 筆)</h2>
        
        {policies.length === 0 ? (
          <p className="text-gray-500">沒有找到保單資料</p>
        ) : (
          <div className="space-y-4">
            {policies.map((policy, index) => (
              <div key={policy.id || index} className="p-4 border border-gray-300 rounded">
                <h3 className="font-semibold text-lg mb-2">
                  {policy.fileName || `保單 ${index + 1}`}
                </h3>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>保險公司:</strong> {policy.policyInfo?.policyBasicInfo?.insuranceCompany || '未知'}</p>
                    <p><strong>保單號碼:</strong> {policy.policyInfo?.policyBasicInfo?.policyNumber || '未知'}</p>
                    <p><strong>生效日期:</strong> {policy.policyInfo?.policyBasicInfo?.effectiveDate || '未知'}</p>
                  </div>
                  <div>
                    <p><strong>保險期間:</strong> {policy.policyInfo?.policyBasicInfo?.insurancePeriod || '未知'}</p>
                    <p><strong>文件類型:</strong> {policy.fileType || '未知'}</p>
                    <p><strong>文件大小:</strong> {policy.fileSize ? `${policy.fileSize} bytes` : '未知'}</p>
                  </div>
                </div>
                
                {policy.policyInfo?.policyBasicInfo?.policyTerms && (
                  <div className="mt-3">
                    <p><strong>保單條款:</strong></p>
                    <p className="text-sm text-gray-600 mt-1">
                      {policy.policyInfo.policyBasicInfo.policyTerms}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <button 
        onClick={loadPolicies}
        className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
      >
        重新載入保單
      </button>
    </div>
  )
}