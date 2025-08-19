"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Calendar, Plus, Trash2 } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { checkAuth } from "@/app/actions/auth-service"
import { userDataService } from "@/lib/storage"

interface CoverageItem {
  id: string
  name: string
  amount: string
  unit: string
}

export default function EditInsurancePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [policy, setPolicy] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<{ id: string, name: string } | null>(null)

  // Form data state
  const [formData, setFormData] = useState({
    company: "",
    policyType: "",
    policyName: "",
    policyNumber: "",
    startDate: "",
    endDate: "",
    insuredPerson: "",
    beneficiary: "",
  })

  const [coverageItems, setCoverageItems] = useState<CoverageItem[]>([])

  useEffect(() => {
    const initializePage = async () => {
      try {
        setIsLoading(true)
        
        // 檢查用戶登入狀態
        const { isLoggedIn, user: authUser } = await checkAuth()
        let currentUser = authUser
        
        if (isLoggedIn && authUser) {
          setUser(authUser)
          currentUser = authUser
        } else {
          console.log('用戶未登入，嘗試自動登入')
          // 如果未登入，使用快速登入功能
          const mockAuth = await import("@/app/actions/auth-service")
          const result = await mockAuth.quickLogin()
          if (result.success) {
            setUser(result.user)
            currentUser = result.user
            console.log('自動登入成功:', result.user)
          } else {
            setError('登入失敗，請重新整理頁面')
            return
          }
        }
        
        // 載入保單資料
        if (currentUser) {
          await loadPolicyData(currentUser.id, params.id)
        }
        
      } catch (error) {
        console.error('初始化頁面失敗:', error)
        setError('載入保單資料失敗')
      } finally {
        setIsLoading(false)
      }
    }
    
    initializePage()
  }, [params.id])

  const loadPolicyData = async (userId: string, policyId: string) => {
    try {
      // 從localStorage讀取用戶保單
      const policies = await userDataService.getInsurancePolicies(userId)
      const foundPolicy = policies.find(p => p.id === policyId)
      
      if (!foundPolicy) {
        setError('找不到指定的保單')
        return
      }
      
      setPolicy(foundPolicy)
      console.log('載入的保單資料:', foundPolicy)
      
      // 填入表單資料
      const policyInfo = foundPolicy.policyInfo?.policyBasicInfo || {}
      setFormData({
        company: policyInfo.insuranceCompany || "",
        policyType: policyInfo.policyType || "",
        policyName: policyInfo.policyName || "",
        policyNumber: policyInfo.policyNumber || "",
        startDate: policyInfo.effectiveDate || "",
        endDate: policyInfo.expirationDate || "",
        insuredPerson: policyInfo.insuredName || "",
        beneficiary: policyInfo.beneficiary || "",
      })

      // 填入保障項目
      const coverage = foundPolicy.policyInfo?.coverageDetails?.coverage || []
      const coverageData = coverage.map((item: any, index: number) => ({
        id: (index + 1).toString(),
        name: item.name || "",
        amount: item.amount || "",
        unit: item.unit || "元",
      }))
      
      // 確保至少有一個空項目
      if (coverageData.length === 0) {
        coverageData.push({ id: "1", name: "", amount: "", unit: "元" })
      }
      
      setCoverageItems(coverageData)
      
    } catch (error) {
      console.error('載入保單資料失敗:', error)
      setError('無法載入保單資料')
    }
  }

  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleCoverageChange = (id: string, field: string, value: string) => {
    setCoverageItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const addCoverageItem = () => {
    const newId = (coverageItems.length + 1).toString()
    setCoverageItems((prev) => [...prev, { id: newId, name: "", amount: "", unit: "元" }])
  }

  const removeCoverageItem = (id: string) => {
    setCoverageItems((prev) => prev.filter((item) => item.id !== id))
  }

  const handleSave = async () => {
    if (!user?.id || !policy) {
      setError('請先登入或重新載入頁面')
      return
    }

    try {
      // 準備更新的保單資料
      const updatedPolicy = {
        ...policy,
        policyInfo: {
          ...policy.policyInfo,
          policyBasicInfo: {
            insuranceCompany: formData.company,
            policyType: formData.policyType,
            policyName: formData.policyName,
            policyNumber: formData.policyNumber,
            effectiveDate: formData.startDate,
            expirationDate: formData.endDate,
            insuredName: formData.insuredPerson,
            beneficiary: formData.beneficiary
          },
          coverageDetails: {
            coverage: coverageItems.filter(item => item.name && item.amount).map(item => ({
              name: item.name,
              amount: item.amount,
              unit: item.unit
            }))
          }
        }
      }

      // 保存更新的保單
      await userDataService.saveInsurancePolicy(user.id, updatedPolicy)
      
      console.log("保存保單資料:", updatedPolicy)
      
      // 返回保單總覽頁面
      router.push("/insurance")
      
    } catch (error) {
      console.error('保存失敗:', error)
      setError('保存失敗，請稍後再試')
    }
  }

  const handleDelete = async () => {
    if (!user?.id || !policy) {
      setError('請先登入或重新載入頁面')
      return
    }

    if (confirm("確定要刪除此保單嗎？此操作無法復原。")) {
      try {
        await userDataService.deleteInsurancePolicy(user.id, params.id)
        console.log("刪除保單:", params.id)
        router.push("/insurance")
      } catch (error) {
        console.error('刪除失敗:', error)
        setError('刪除失敗，請稍後再試')
      }
    }
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center mb-8">
            <Link href="/insurance">
              <Button variant="ghost" size="sm" className="gap-1">
                <ArrowLeft className="h-4 w-4" />
                返回保單總覽
              </Button>
            </Link>
          </div>
          <div className="text-center py-8">
            <p className="text-red-500">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!policy) {
    return (
      <div className="container py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center mb-8">
            <Link href="/insurance">
              <Button variant="ghost" size="sm" className="gap-1">
                <ArrowLeft className="h-4 w-4" />
                返回保單總覽
              </Button>
            </Link>
          </div>
          <div className="text-center py-8">
            <p className="text-gray-500">找不到指定的保單</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex items-center mb-8">
        <Link href="/insurance">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            返回保單總覽
          </Button>
        </Link>
      </div>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-2">編輯保單</h1>
        <p className="text-gray-500 mb-8">修改您的保險保單資訊</p>

        <Card>
          <CardHeader>
            <CardTitle>保單資訊</CardTitle>
            <CardDescription>編輯您的保險保單詳細資訊</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 基本資訊 */}
            <div>
              <h3 className="text-lg font-semibold mb-4">基本資訊</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company">保險公司</Label>
                  <Select value={formData.company} onValueChange={(value) => handleFormChange("company", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="選擇保險公司" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="國泰人壽">國泰人壽</SelectItem>
                      <SelectItem value="富邦人壽">富邦人壽</SelectItem>
                      <SelectItem value="新光人壽">新光人壽</SelectItem>
                      <SelectItem value="南山人壽">南山人壽</SelectItem>
                      <SelectItem value="中國人壽">中國人壽</SelectItem>
                      <SelectItem value="台灣人壽">台灣人壽</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="policyType">保單類型</Label>
                  <Select
                    value={formData.policyType}
                    onValueChange={(value) => handleFormChange("policyType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="選擇保單類型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="醫療險">醫療保險</SelectItem>
                      <SelectItem value="壽險">壽險</SelectItem>
                      <SelectItem value="意外險">意外險</SelectItem>
                      <SelectItem value="癌症險">癌症險</SelectItem>
                      <SelectItem value="失能險">失能險</SelectItem>
                      <SelectItem value="重疾險">重大疾病險</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="policyName">保單名稱</Label>
                  <Input
                    id="policyName"
                    placeholder="例：安心醫療保險"
                    value={formData.policyName}
                    onChange={(e) => handleFormChange("policyName", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="policyNumber">保單號碼</Label>
                  <Input
                    id="policyNumber"
                    placeholder="例：CT-MED-123456"
                    value={formData.policyNumber}
                    onChange={(e) => handleFormChange("policyNumber", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate">保障開始日期</Label>
                  <div className="relative">
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleFormChange("startDate", e.target.value)}
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">保障結束日期</Label>
                  <div className="relative">
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleFormChange("endDate", e.target.value)}
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* 保障範圍 */}
            <div>
              <h3 className="text-lg font-semibold mb-4">保障範圍</h3>
              <div className="space-y-4">
                {coverageItems.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor={`coverage-name-${item.id}`}>項目名稱</Label>
                      <Input
                        id={`coverage-name-${item.id}`}
                        placeholder="例：住院醫療"
                        value={item.name}
                        onChange={(e) => handleCoverageChange(item.id, "name", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`coverage-amount-${item.id}`}>金額</Label>
                      <Input
                        id={`coverage-amount-${item.id}`}
                        placeholder="例：3000"
                        value={item.amount}
                        onChange={(e) => handleCoverageChange(item.id, "amount", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`coverage-unit-${item.id}`}>單位</Label>
                      <Select
                        value={item.unit}
                        onValueChange={(value) => handleCoverageChange(item.id, "unit", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="元">元</SelectItem>
                          <SelectItem value="元/日">元/日</SelectItem>
                          <SelectItem value="元/次">元/次</SelectItem>
                          <SelectItem value="元/年">元/年</SelectItem>
                          <SelectItem value="萬元">萬元</SelectItem>
                          <SelectItem value="倍">倍</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-end">
                      {coverageItems.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeCoverageItem(item.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 bg-transparent"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={addCoverageItem}
                  className="w-full gap-2 bg-transparent"
                >
                  <Plus className="h-4 w-4" />
                  新增保障項目
                </Button>
              </div>
            </div>

            {/* 其他資訊 */}
            <div>
              <h3 className="text-lg font-semibold mb-4">其他資訊</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="insuredPerson">被保險人</Label>
                  <Input
                    id="insuredPerson"
                    placeholder="例：王小明"
                    value={formData.insuredPerson}
                    onChange={(e) => handleFormChange("insuredPerson", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="beneficiary">受益人</Label>
                  <Input
                    id="beneficiary"
                    placeholder="例：王太明"
                    value={formData.beneficiary}
                    onChange={(e) => handleFormChange("beneficiary", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              刪除保單
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" asChild className="bg-transparent">
                <Link href="/insurance">取消</Link>
              </Button>
              <Button onClick={handleSave} className="bg-teal-600 hover:bg-teal-700">
                保存編輯
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}