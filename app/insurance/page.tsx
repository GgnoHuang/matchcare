"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, Upload, Plus, Calendar, Banknote, AlertCircle, Sparkles, BookOpen, FileSearch, Settings } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useState, useEffect } from "react"
import { checkAuth } from "@/app/actions/auth-service"
import { getUserPolicies } from "@/lib/supabaseDataService"

interface InsurancePolicy {
  id: string
  company: string
  name: string
  type: string
  policyNumber: string
  startDate?: string
  endDate?: string
  coverage: Array<{
    type: string
    amount: number
    unit: string
    maxDays?: number
  }>
  maxClaimAmount: number // AI 判斷的最高理賠金額
  maxClaimUnit: string // AI 判斷的最高理賠金額單位
  matchedRecords: number
  fileName?: string
  uploadDate?: string
  originalData?: any
}

interface User {
  id: string
  username: string
  phoneNumber: string
  email?: string
}

export default function InsurancePage() {
  const [insurancePolicies, setInsurancePolicies] = useState<InsurancePolicy[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [medicalRecords, setMedicalRecords] = useState([])

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
        // 設置預設用戶以防止錯誤
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }
    fetchUser()
  }, [])

  // 當用戶登入後載入保單和病歷資料
  useEffect(() => {
    if (user?.id) {
      loadUserData()
    }
  }, [user])

  // 載入用戶保單資料
  const loadUserData = async () => {
    if (!user?.phoneNumber) return
    
    try {
      console.log('載入用戶保單資料，電話號碼:', user.phoneNumber)
      
      // 從 Supabase 載入保單資料
      const result = await getUserPolicies(user.phoneNumber)
      
      if (result.success) {
        console.log('從 Supabase 載入的保單資料:', result.policies)
        
        // 將 Supabase 資料轉換為UI需要的格式
        const formattedPolicies: InsurancePolicy[] = result.policies.map((policy: any, index: number) => {
          console.log('處理保單記錄:', policy.fileName, policy.policyInfo);
          const policyData = policy.policyInfo?.policyBasicInfo || {}
          
          // 提取保單名稱
          let policyName = '保險保單';
          if (policy.fileName) {
            policyName = policy.fileName.replace(/\.(pdf|jpg|jpeg|png)$/i, '');
          }
          
          // 提取保險公司
          let company = '未知保險公司';
          if (policyData.insuranceCompany && policyData.insuranceCompany !== '待輸入') {
            company = policyData.insuranceCompany;
          }
          
          // 從保單條款中解析保險類型
          let policyType = '醫療險'; // 預設類型
          if (policyData.policyTerms) {
            if (policyData.policyTerms.includes('意外')) {
              policyType = '意外險';
            } else if (policyData.policyTerms.includes('重大疾病') || policyData.policyTerms.includes('癌症') || policyData.policyTerms.includes('心臟病')) {
              policyType = '重疾險';
            }
          } 
          
          // 提取保單號碼
          let policyNumber = '待補充';
          if (policyData.policyNumber && policyData.policyNumber !== '待輸入') {
            policyNumber = policyData.policyNumber;
          }
          
          // 從保單條款中解析保障內容
          let coverage: Array<{type: string, amount: number, unit: string}> = [];
          
          if (policyData.policyTerms && policyData.policyTerms !== '待輸入') {
            // 解析保單條款，支援多種格式
            // 例如: "住院醫療 5,000元/日(最多365天), 加護病房 10,000元/日(最多30天), 手術費用 150,000元/次"
            const terms = policyData.policyTerms.split(',');
            coverage = terms.map((term: string) => {
              const cleanTerm = term.trim();
              
              // 匹配格式: "住院醫療 5,000元/日(最多365天)" 或 "手術費用 150,000元/次"
              const match = cleanTerm.match(/(.+?)\s+([\d,]+)\s*(.+?)(?:\(.*?\))?$/);
              if (match) {
                return {
                  type: match[1].trim(),
                  amount: parseInt(match[2].replace(/,/g, '')),
                  unit: match[3].trim()
                };
              }
              
              // 備用匹配: 只有項目名稱，無金額
              return { type: cleanTerm, amount: 0, unit: '元' };
            });
          }
          
          // 如果沒有保障項目，顯示預設訊息
          if (coverage.length === 0) {
            coverage = [{ type: '保障內容處理中', amount: 0, unit: '元' }];
          }
          
          // 計算最高理賠金額//已棄用
          // const maxClaimAmount = Math.max(...coverage.map((c: any) => c.amount));
          // const maxClaimUnit = '元';

          const top = coverage.reduce((max, cur) => (cur.amount > max.amount ? cur : max), coverage[0])
          const maxClaimAmount = top?.amount ?? 0
          const maxClaimUnit = top?.unit ?? '元'

          
          return {
            id: policy.id || `policy_${index + 1}`,
            company: company,
            name: policyName,
            type: policyType,
            policyNumber: policyNumber,
            startDate: policyData.effectiveDate,
            endDate: policyData.insurancePeriod?.split(' 至 ')[1],
            coverage: coverage,
            maxClaimAmount: maxClaimAmount,
            maxClaimUnit: maxClaimUnit,
            matchedRecords: 0, // 暫時設為0
            fileName: policy.fileName,
            uploadDate: policy.uploadDate,
            originalData: policy
          };
        });
        
        setInsurancePolicies(formattedPolicies);
        console.log('格式化後的保單資料:', formattedPolicies);
      } else {
        console.error('載入保單失敗:', result.error);
        setInsurancePolicies([]);
      }
    } catch (error) {
      console.error('載入保單資料失敗:', error)
      setInsurancePolicies([])
    }
  }

  // 計算真實的病歷匹配數量（簡化版本）
  const calculateMatchedRecords = (policy: InsurancePolicy) => {
    // 這裡可以實作更複雜的匹配邏輯
    // 目前暫時返回0，後續可以根據保單類型和病歷內容進行智能匹配
    return 0;
  }

  // 獲取保單顯示標題（與我的資料頁面邏輯一致）
  const getPolicyDisplayTitle = (policy: InsurancePolicy) => {
    // 從原始資料中獲取AI分析的保單資訊
    const policyInfo = policy.originalData?.policyInfo?.policyBasicInfo
    
    // 優先使用AI識別的保單名稱和類型
    if (policyInfo?.policyName && policyInfo.policyName !== '待輸入') {
      if (policyInfo?.policyType && policyInfo.policyType !== '待輸入') {
        return `${policyInfo.policyName} (${policyInfo.policyType})`
      }
      return policyInfo.policyName
    }
    
    // 次選：使用保險公司名稱 + 保險保單
    if (policyInfo?.insuranceCompany && policyInfo.insuranceCompany !== '待輸入') {
      const policyTypeText = policyInfo?.policyType && policyInfo.policyType !== '待輸入' 
        ? policyInfo.policyType 
        : '保險保單'
      return `${policyInfo.insuranceCompany} - ${policyTypeText}`
    }
    
    // 最後選項：使用檔案名稱
    return policy.fileName || '保險保單'
  }

  // Loading狀態
  if (isLoading) {
    return (
      <div className="container py-6 md:py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-500">載入中...</p>
          </div>
        </div>
      </div>
    )
  }

  // 未登入狀態
  if (!user) {
    return (
      <div className="container py-6 md:py-8">
        <div className="max-w-md mx-auto text-center">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>需要登入</AlertTitle>
            <AlertDescription>
              請先登入以查看您的保險保單。
              <div className="mt-4">
                <Link href="/login">
                  <Button>前往登入</Button>
                </Link>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  const fallbackPolicies = [
    {
      id: 1,
      company: "國泰人壽",
      name: "安心醫療保險",
      type: "醫療險",
      policyNumber: "CT-MED-123456",
      startDate: "2020-01-15",
      endDate: "2030-01-14",
      coverage: [
        { type: "住院醫療", amount: 3000, unit: "元/日", maxDays: 180 },
        { type: "手術費用", amount: 100000, unit: "元/次" },
        { type: "癌症治療", amount: 500000, unit: "元/年" },
      ],
      matchedRecords: 2,
    },
    {
      id: 2,
      company: "新光人壽",
      name: "重大疾病保險",
      type: "重疾險",
      policyNumber: "SK-CI-789012",
      startDate: "2021-05-20",
      endDate: "2041-05-19",
      coverage: [
        { type: "癌症", amount: 1000000, unit: "元" },
        { type: "心臟病", amount: 1000000, unit: "元" },
        { type: "腦中風", amount: 1000000, unit: "元" },
      ],
      matchedRecords: 3,
    },
    {
      id: 3,
      company: "富邦人壽",
      name: "意外傷害保險",
      type: "意外險",
      policyNumber: "FB-PA-345678",
      startDate: "2022-03-10",
      endDate: "2032-03-09",
      coverage: [
        { type: "意外身故", amount: 2000000, unit: "元" },
        { type: "意外醫療", amount: 50000, unit: "元/次" },
        { type: "骨折", amount: 20000, unit: "元/次" },
      ],
      matchedRecords: 1,
    },
    {
      id: 4,
      company: "南山人壽",
      name: "住院醫療保險",
      type: "醫療險",
      policyNumber: "NS-MED-567890",
      startDate: "2019-08-15",
      endDate: "2029-08-14",
      coverage: [
        { type: "住院醫療", amount: 5000, unit: "元/日", maxDays: 365 },
        { type: "加護病房", amount: 10000, unit: "元/日", maxDays: 30 },
        { type: "手術費用", amount: 150000, unit: "元/次" },
      ],
      matchedRecords: 0,
    },
  ]

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">保單健檢</h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">智能分析您的保險保單並匹配最佳理賠方案</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* 隱藏從保險存摺導入按鈕 */}
          {/* <Link href="/insurance/import-passbook" className="w-full sm:w-auto">
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
              <BookOpen className="h-4 w-4" />
              從保險存摺導入
            </Button>
          </Link> */}
          <Link href="/insurance/import" className="w-full sm:w-auto">
            <Button className="gap-2 bg-teal-600 hover:bg-teal-700 w-full sm:w-auto">
              <Upload className="h-4 w-4" />
              上傳保單
            </Button>
          </Link>
          {/* 隱藏手動添加按鈕 */}
          {/* <Link href="/insurance/add" className="w-full sm:w-auto">
            <Button variant="outline" className="gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              手動添加
            </Button>
          </Link> */}
        </div>
      </div>

      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>AI健檢提示</AlertTitle>
        <AlertDescription>
          我們的AI系統將自動分析您的保單內容，評估保障範圍，並匹配可理賠的醫療記錄，幫助您獲得最大理賠效益。
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="all" className="w-full">
        <div className="overflow-x-auto">
          <TabsList className="mb-4">
            <TabsTrigger value="all">全部保單</TabsTrigger>
            <TabsTrigger value="medical">醫療險</TabsTrigger>
            <TabsTrigger value="critical">重疾險</TabsTrigger>
            <TabsTrigger value="accident">意外險</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="all" className="space-y-4">
          {insurancePolicies.length > 0 ? insurancePolicies.map((policy) => (
            <Card key={policy.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                  <div>
                    <CardTitle className="flex flex-wrap items-center gap-2 text-lg md:text-xl">
                      {getPolicyDisplayTitle(policy)}
                      <Badge variant="outline" className="bg-white">
                        {policy.type}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      保單號碼: {policy.policyNumber}
                      {policy.fileName && (
                        <span className="ml-2 text-xs text-gray-400">
                          (檔案: {policy.fileName})
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <Link
                    href={`/insurance/${policy.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto"
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 text-teal-600 hover:text-teal-700 hover:bg-teal-50 w-full sm:w-auto"
                    >
                      <Sparkles className="h-4 w-4" />
                      啟動AI保險精靈
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-start gap-2">
                    <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">保障期間</p>
                      <p className="text-sm text-gray-500">
                        {policy.startDate} 至 {policy.endDate}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Shield className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">主要保障</p>
                      <p className="text-sm text-gray-500">
                         {policy.originalData?.policyInfo?.policyBasicInfo?.policyTerms || "未提供"}

                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Banknote className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">最高理賠金額</p>
                      <p className="text-sm text-gray-500">
                        {policy.maxClaimAmount.toLocaleString()}{policy.maxClaimUnit}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 border-t">
                <div className="flex flex-col sm:flex-row sm:justify-between w-full gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm text-gray-500">上次更新: 2024-04-01</p>
                    {policy.matchedRecords > 0 && (
                      <Badge className="bg-teal-600 hover:bg-teal-700">匹配病歷: {policy.matchedRecords}</Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <Link href={`/insurance/edit/${policy.id}`} className="w-full sm:w-auto">
                      <Button size="sm" variant="outline" className="gap-2 w-full sm:w-auto">
                        <Settings className="h-4 w-4" />
                        編輯
                      </Button>
                    </Link>
                    {/* <Link href={`/claims/check?policy=${policy.id}`} className="w-full sm:w-auto">
                      <Button size="sm" variant="outline" className="w-full sm:w-auto">
                        檢查理賠資格
                      </Button>
                    </Link> */}
                    <Link href={`/claims/new?policy=${policy.id}`} className="w-full sm:w-auto">
                      <Button size="sm" className="bg-teal-600 hover:bg-teal-700 w-full sm:w-auto">
                        申請理賠
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardFooter>
            </Card>
          )) : (
            <Card>
              <CardContent className="py-8 text-center">
                <FileSearch className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">尚未上傳任何保險保單</h3>
                <p className="text-gray-500 mb-4">
                  請先上傳您的保險保單文件，上傳後將在這裡顯示並進行AI分析
                </p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                 
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="medical" className="space-y-4">
          {insurancePolicies.filter((p) => p.type === "醫療險").length > 0 ? 
            insurancePolicies
              .filter((p) => p.type === "醫療險")
              .map((policy) => (
              <Card key={policy.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div>
                      <CardTitle className="flex flex-wrap items-center gap-2 text-lg md:text-xl">
                        {getPolicyDisplayTitle(policy)}
                        <Badge variant="outline" className="bg-white">
                          {policy.type}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        保單號碼: {policy.policyNumber}
                        {policy.fileName && (
                          <span className="ml-2 text-xs text-gray-400">
                            (檔案: {policy.fileName})
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    <Link
                      href={`/insurance/${policy.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto"
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2 text-teal-600 hover:text-teal-700 hover:bg-teal-50 w-full sm:w-auto"
                      >
                        <Sparkles className="h-4 w-4" />
                        啟動AI保險精靈
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-start gap-2">
                      <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">保障期間</p>
                        <p className="text-sm text-gray-500">
                          {policy.startDate} 至 {policy.endDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Shield className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">主要保障</p>
                        <p className="text-sm text-gray-500">
                           {policy.originalData?.policyInfo?.policyBasicInfo?.policyTerms || "未提供"}

                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Banknote className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">最高理賠金額</p>
                        <p className="text-sm text-gray-500">
                          {Math.max(...policy.coverage.map((c) => c.amount)).toLocaleString()} 元
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 border-t">
                  <div className="flex flex-col sm:flex-row sm:justify-between w-full gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm text-gray-500">上次更新: 2024-04-01</p>
                      {policy.matchedRecords > 0 && (
                        <Badge className="bg-teal-600 hover:bg-teal-700">匹配病歷: {policy.matchedRecords}</Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                      <Link href={`/my-data?edit=${policy.id}&type=policy`} className="w-full sm:w-auto">
                        <Button size="sm" variant="outline" className="gap-2 w-full sm:w-auto">
                          <Settings className="h-4 w-4" />
                          編輯
                        </Button>
                      </Link>
                      {/* <Link href={`/claims/check?policy=${policy.id}`} className="w-full sm:w-auto">
                        <Button size="sm" variant="outline" className="w-full sm:w-auto">
                          檢查理賠資格
                        </Button>
                      </Link> */}
                      <Link href={`/claims/new?policy=${policy.id}`} className="w-full sm:w-auto">
                        <Button size="sm" className="bg-teal-600 hover:bg-teal-700 w-full sm:w-auto">
                          申請理賠
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            )) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <Shield className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">尚未上傳醫療險保單</h3>
                  <p className="text-gray-500 mb-4">
                    您目前沒有醫療險保單，建議上傳醫療險保單以獲得更好的醫療保障
                  </p>
               
                </CardContent>
              </Card>
            )}
        </TabsContent>
        <TabsContent value="critical" className="space-y-4">
          {insurancePolicies.filter((p) => p.type === "重疾險").length > 0 ? 
            insurancePolicies
              .filter((p) => p.type === "重疾險")
              .map((policy) => (
              <Card key={policy.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div>
                      <CardTitle className="flex flex-wrap items-center gap-2 text-lg md:text-xl">
                        {getPolicyDisplayTitle(policy)}
                        <Badge variant="outline" className="bg-white">
                          {policy.type}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        保單號碼: {policy.policyNumber}
                        {policy.fileName && (
                          <span className="ml-2 text-xs text-gray-400">
                            (檔案: {policy.fileName})
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    <Link
                      href={`/insurance/${policy.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto"
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2 text-teal-600 hover:text-teal-700 hover:bg-teal-50 w-full sm:w-auto"
                      >
                        <Sparkles className="h-4 w-4" />
                        啟動AI保險精靈
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-start gap-2">
                      <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">保障期間</p>
                        <p className="text-sm text-gray-500">
                          {policy.startDate} 至 {policy.endDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Shield className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">主要保障</p>
                        <p className="text-sm text-gray-500">
                           {policy.originalData?.policyInfo?.policyBasicInfo?.policyTerms || "未提供"}

                          
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Banknote className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">最高理賠金額</p>
                        <p className="text-sm text-gray-500">
                          {Math.max(...policy.coverage.map((c) => c.amount)).toLocaleString()} 元
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 border-t">
                  <div className="flex flex-col sm:flex-row sm:justify-between w-full gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm text-gray-500">上次更新: 2024-04-01</p>
                      {policy.matchedRecords > 0 && (
                        <Badge className="bg-teal-600 hover:bg-teal-700">匹配病歷: {policy.matchedRecords}</Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                      <Link href={`/my-data?edit=${policy.id}&type=policy`} className="w-full sm:w-auto">
                        <Button size="sm" variant="outline" className="gap-2 w-full sm:w-auto">
                          <Settings className="h-4 w-4" />
                          編輯
                        </Button>
                      </Link>
                      {/* <Link href={`/claims/check?policy=${policy.id}`} className="w-full sm:w-auto">
                        <Button size="sm" variant="outline" className="w-full sm:w-auto">
                          檢查理賠資格
                        </Button>
                      </Link> */}
                      <Link href={`/claims/new?policy=${policy.id}`} className="w-full sm:w-auto">
                        <Button size="sm" className="bg-teal-600 hover:bg-teal-700 w-full sm:w-auto">
                          申請理賠
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            )) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <Shield className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">尚未上傳重疾險保單</h3>
                  <p className="text-gray-500 mb-4">
                    您目前沒有重大疾病險保單，建議上傳以獲得重大疾病的保障
                  </p>
              
                </CardContent>
              </Card>
            )}
        </TabsContent>
        <TabsContent value="accident" className="space-y-4">
          {insurancePolicies.filter((p) => p.type === "意外險").length > 0 ? 
            insurancePolicies
              .filter((p) => p.type === "意外險")
              .map((policy) => (
              <Card key={policy.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div>
                      <CardTitle className="flex flex-wrap items-center gap-2 text-lg md:text-xl">
                        {getPolicyDisplayTitle(policy)}
                        <Badge variant="outline" className="bg-white">
                          {policy.type}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        保單號碼: {policy.policyNumber}
                        {policy.fileName && (
                          <span className="ml-2 text-xs text-gray-400">
                            (檔案: {policy.fileName})
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    <Link
                      href={`/insurance/${policy.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto"
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2 text-teal-600 hover:text-teal-700 hover:bg-teal-50 w-full sm:w-auto"
                      >
                        <Sparkles className="h-4 w-4" />
                        啟動AI保險精靈
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-start gap-2">
                      <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">保障期間</p>
                        <p className="text-sm text-gray-500">
                          {policy.startDate} 至 {policy.endDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Shield className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">主要保障</p>
                        <p className="text-sm text-gray-500">
                           {policy.originalData?.policyInfo?.policyBasicInfo?.policyTerms || "未提供"}

                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Banknote className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">最高理賠金額</p>
                        <p className="text-sm text-gray-500">
                          {Math.max(...policy.coverage.map((c) => c.amount)).toLocaleString()} 元
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 border-t">
                  <div className="flex flex-col sm:flex-row sm:justify-between w-full gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm text-gray-500">上次更新: 2024-04-01</p>
                      {policy.matchedRecords > 0 && (
                        <Badge className="bg-teal-600 hover:bg-teal-700">匹配病歷: {policy.matchedRecords}</Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                      <Link href={`/my-data?edit=${policy.id}&type=policy`} className="w-full sm:w-auto">
                        <Button size="sm" variant="outline" className="gap-2 w-full sm:w-auto">
                          <Settings className="h-4 w-4" />
                          編輯
                        </Button>
                      </Link>
                      {/* <Link href={`/claims/check?policy=${policy.id}`} className="w-full sm:w-auto">
                        <Button size="sm" variant="outline" className="w-full sm:w-auto">
                          檢查理賠資格
                        </Button>
                      </Link> */}
                      <Link href={`/claims/new?policy=${policy.id}`} className="w-full sm:w-auto">
                        <Button size="sm" className="bg-teal-600 hover:bg-teal-700 w-full sm:w-auto">
                          申請理賠
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            )) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <Shield className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">尚未上傳意外險保單</h3>
                  <p className="text-gray-500 mb-4">
                    您目前沒有意外傷害險保單，建議上傳以獲得意外事故的保障
                  </p>
           
                </CardContent>
              </Card>
            )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
