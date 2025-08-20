"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, FileSearch, Users, Stethoscope, Download, Building, Shield, CreditCard, Sparkles, Loader2, Search, RefreshCw, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { checkAuth } from "@/app/actions/auth-service"
// import { userDataService.*} from "@/lib/storage" // 已移除，改用 API
import { OpenAIService } from "@/lib/openaiService"

export default function ResourcesPage() {
  // AI搜尋狀態管理
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("government")
  const [isSearching, setIsSearching] = useState(false)
  const [searchProgress, setSearchProgress] = useState(0)
  const [lastUpdateTime, setLastUpdateTime] = useState(null)
  
  // 各類別資源狀態
  const [governmentResources, setGovernmentResources] = useState([])
  const [corporateResources, setCorporateResources] = useState([])
  const [financialResources, setFinancialResources] = useState([])
  const [specialClaimResources, setSpecialClaimResources] = useState([])
  const [allResources, setAllResources] = useState([])

  // 初始化和用戶認證
  useEffect(() => {
    const initializePage = async () => {
      try {
        const { isLoggedIn, user: authUser } = await checkAuth()
        if (!isLoggedIn || !authUser) {
          setError('請先登入以查看個人化資源推薦')
          return
        }
        
        setUser(authUser)
        
        // 開始AI搜尋各類資源
        await searchAllResourceCategories(authUser)
        
      } catch (error) {
        console.error('初始化頁面失敗:', error)
        setError('載入資源失敗')
      } finally {
        setIsLoading(false)
      }
    }
    
    initializePage()
  }, [])

  // AI搜尋所有資源類別
  const searchAllResourceCategories = async (user) => {
    try {
      setIsSearching(true)
      setSearchProgress(0)
      console.log('🔍 開始AI搜尋所有資源類別')
      
      const apiKey = localStorage.getItem('openai_api_key') || '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'

      // 獲取用戶背景資料
      const [userPolicies, medicalRecords] = await Promise.all([
        userDataService.getInsurancePolicies(user.id),
        userDataService.getMedicalRecords(user.id)
      ])

      const aiService = new OpenAIService(apiKey)
      
      // **執行5次API呼叫**，每個類別一次，確保資料豐富且最新
      console.log('📡 開始執行5個AI搜尋請求...')

      // 1. 搜尋政府補助資源
      setSearchProgress(20)
      const govResults = await searchGovernmentResources(aiService, userPolicies, medicalRecords)
      setGovernmentResources(govResults)
      console.log('✅ 政府資源搜尋完成:', govResults.length, '項')

      // 2. 搜尋企業福利資源
      setSearchProgress(40)
      const corpResults = await searchCorporateResources(aiService, userPolicies, medicalRecords)
      setCorporateResources(corpResults)
      console.log('✅ 企業資源搜尋完成:', corpResults.length, '項')

      // 3. 搜尋特殊金融產品
      setSearchProgress(60)
      const finResults = await searchFinancialResources(aiService, userPolicies, medicalRecords)
      setFinancialResources(finResults)
      console.log('✅ 金融產品搜尋完成:', finResults.length, '項')

      // 4. 搜尋特殊理賠項目
      setSearchProgress(80)
      const claimResults = await searchSpecialClaimResources(aiService, userPolicies, medicalRecords)
      setSpecialClaimResources(claimResults)
      console.log('✅ 特殊理賠搜尋完成:', claimResults.length, '項')

      // 5. 合併所有資源並進行個人化推薦
      setSearchProgress(100)
      const combinedResources = [
        ...govResults,
        ...corpResults,
        ...finResults,
        ...claimResults
      ]
      setAllResources(combinedResources)
      setLastUpdateTime(new Date())
      
      console.log('✅ AI搜尋完成，總共找到', combinedResources.length, '項資源')
      
    } catch (error) {
      console.error('AI搜尋失敗:', error)
      setError(`搜尋失敗: ${error.message}`)
    } finally {
      setIsSearching(false)
      setSearchProgress(0)
    }
  }

  // 1. AI搜尋政府補助資源
  const searchGovernmentResources = async (aiService, userPolicies, medicalRecords) => {
    const prompt = `
你是台灣政府福利專家，請搜尋2024年最新的政府補助資源，特別是醫療相關補助。

## 用戶背景資料：
- 保單數量：${userPolicies.length}
- 病歷記錄數量：${medicalRecords.length}
- 醫療需求：${medicalRecords.map(r => r.documentType || '一般醫療').join('、') || '一般醫療'}

## 請搜尋以下台灣政府資源（2024年最新資訊）：

### 中央政府補助：
- 衛生福利部：重大傷病補助、罕見疾病補助、長照2.0服務補助
- 勞動部：勞保給付、職業傷病補助、身心障礙者就業補助
- 內政部：急難救助、社會救助、身心障礙者生活補助

### 地方政府補助：
- 各縣市醫療補助、老人健檢補助、癌症篩檢補助
- 中低收入戶醫療補助、身心障礙者醫療補助

### 特殊醫療補助：
- 癌症病患營養品補助、洗腎交通費補助、精神疾病復健補助

請以JSON格式回傳8-12個最新且實用的政府補助資源：
{
  "resources": [
    {
      "id": "gov-2024-001",
      "category": "醫療補助",
      "subcategory": "中央政府",
      "title": "具體補助項目名稱",
      "organization": "主辦機關全名",
      "eligibility": "詳細申請資格說明",
      "amount": "補助金額或比例",
      "deadline": "申請期限",
      "applicationMethod": "申請方式和流程",
      "details": "詳細說明和注意事項",
      "contactInfo": "聯絡電話或官方網址",
      "priority": "high",
      "matchedConditions": ["適用的醫療狀況"]
    }
  ]
}

**重要：請提供2024年實際存在的台灣政府補助項目，資訊要準確且最新。**`

    const response = await aiService.analyzePolicyEvaluation(prompt)
    const result = parseAIResponse(response)
    return result.resources?.map(r => ({...r, resourceType: 'government'})) || []
  }

  // 2. AI搜尋企業福利資源
  const searchCorporateResources = async (aiService, userPolicies, medicalRecords) => {
    const prompt = `
你是台灣企業福利專家，請搜尋2024年最新的企業員工福利和醫療保障資源。

## 用戶背景資料：
- 保單數量：${userPolicies.length}
- 醫療記錄：${medicalRecords.length}筆

## 請搜尋以下台灣企業福利資源：

### 大型企業員工福利：
- 台積電、鴻海、聯發科、中華電信等知名企業醫療補助
- 金融業（富邦、國泰、中信等）員工醫療保障
- 科技業（聯電、日月光等）團體保險和健康補助

### 產業工會互助：
- 各產業工會提供的醫療互助金
- 職業工會的緊急救助金

### 企業CSR醫療專案：
- 企業基金會提供的醫療補助
- 大型企業的社會公益醫療專案

請以JSON格式回傳6-10個實用的企業福利資源：
{
  "resources": [
    {
      "id": "corp-2024-001",
      "category": "員工福利",
      "subcategory": "醫療補助",
      "title": "具體福利項目名稱",
      "organization": "企業或組織全名",
      "eligibility": "申請資格（如員工身份、工作年資等）",
      "amount": "補助金額",
      "deadline": "申請期限",
      "applicationMethod": "申請流程",
      "details": "詳細說明",
      "contactInfo": "聯絡方式",
      "priority": "medium",
      "matchedConditions": ["適用情況"]
    }
  ]
}

**重要：請提供真實存在的台灣企業福利項目。**`

    const response = await aiService.analyzePolicyEvaluation(prompt)
    const result = parseAIResponse(response)
    return result.resources?.map(r => ({...r, resourceType: 'corporate'})) || []
  }

  // 3. AI搜尋特殊金融產品
  const searchFinancialResources = async (aiService, userPolicies, medicalRecords) => {
    const prompt = `
你是台灣金融產品專家，請搜尋2024年最新的特殊金融產品醫療保障。

## 請搜尋以下台灣金融產品醫療保障：

### 信用卡醫療保障：
- 各大銀行白金卡、無限卡的醫療保險
- 信用卡意外險、住院日額給付

### 銀行醫療貸款：
- 各大銀行的醫療專用貸款方案
- 整型美容貸款、牙科治療貸款

### 保險相關金融產品：
- 銀行代銷的微型保險
- 網路投保的醫療險方案

請以JSON格式回傳6-8個金融產品醫療保障：
{
  "resources": [
    {
      "id": "fin-2024-001",
      "category": "金融產品",
      "subcategory": "醫療保障",
      "title": "產品名稱",
      "organization": "銀行或金融機構",
      "eligibility": "申請條件",
      "amount": "保障額度或貸款額度",
      "deadline": "申請期限",
      "applicationMethod": "申請方式",
      "details": "產品詳細說明",
      "contactInfo": "聯絡資訊",
      "priority": "medium",
      "matchedConditions": ["適用情況"]
    }
  ]
}

**重要：請提供2024年實際的台灣金融機構產品。**`

    const response = await aiService.analyzePolicyEvaluation(prompt)
    const result = parseAIResponse(response)
    return result.resources?.map(r => ({...r, resourceType: 'financial'})) || []
  }

  // 4. AI搜尋特殊理賠項目
  const searchSpecialClaimResources = async (aiService, userPolicies, medicalRecords) => {
    const userPolicyInfo = userPolicies.map(p => ({
      company: p.policyInfo?.policyBasicInfo?.insuranceCompany || '未知',
      type: p.policyInfo?.policyBasicInfo?.policyType || '未知',
      name: p.policyInfo?.policyBasicInfo?.policyName || '未知'
    }))

    const prompt = `
你是台灣保險理賠專家，請根據用戶的保單情況搜尋特殊理賠項目和優惠。

## 用戶保單資訊：
${userPolicyInfo.map((p, i) => `${i+1}. ${p.company} - ${p.type} - ${p.name}`).join('\n')}

## 請搜尋以下特殊理賠項目：

### 首次罹病給付：
- 初次診斷癌症關懷金
- 首次重大疾病給付
- 特定疾病初次診斷金

### 特殊情況給付：
- 住院日額加倍給付條件
- 手術費用特別給付
- 特定治療方式加給

### 預防保健給付：
- 健檢費用給付
- 疫苗接種費用補助
- 預防性檢查給付

請以JSON格式回傳6-8個特殊理賠項目：
{
  "resources": [
    {
      "id": "claim-2024-001",
      "category": "特殊理賠",
      "subcategory": "初次給付",
      "title": "理賠項目名稱",
      "organization": "保險公司名稱",
      "eligibility": "理賠條件",
      "amount": "給付金額",
      "deadline": "申請期限",
      "applicationMethod": "申請流程",
      "details": "詳細說明",
      "contactInfo": "理賠部門聯絡方式",
      "priority": "high",
      "matchedConditions": ["適用的醫療情況"]
    }
  ]
}

**重要：請提供真實的台灣保險理賠項目資訊。**`

    const response = await aiService.analyzePolicyEvaluation(prompt)
    const result = parseAIResponse(response)
    return result.resources?.map(r => ({...r, resourceType: 'claim'})) || []
  }

  // 解析AI回應的JSON
  const parseAIResponse = (response) => {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      return { resources: [] }
    } catch (error) {
      console.error('JSON解析失敗:', error)
      return { resources: [] }
    }
  }

  // 手動重新搜尋
  const handleRefreshResources = () => {
    if (user && !isSearching) {
      searchAllResourceCategories(user)
    }
  }

  // 獲取類別圖標
  const getCategoryIcon = (resourceType) => {
    switch (resourceType) {
      case 'government':
        return <Shield className="h-5 w-5 text-blue-600" />
      case 'corporate':
        return <Building className="h-5 w-5 text-green-600" />
      case 'financial':
        return <CreditCard className="h-5 w-5 text-purple-600" />
      case 'claim':
        return <FileText className="h-5 w-5 text-orange-600" />
      default:
        return <FileText className="h-5 w-5 text-gray-500" />
    }
  }

  // Loading狀態
  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-500">載入資源中...</p>
          </div>
        </div>
      </div>
    )
  }

  // 錯誤狀態
  if (error) {
    return (
      <div className="container py-8">
        <div className="max-w-2xl mx-auto text-center">
          <Alert variant="destructive">
            <FileSearch className="h-4 w-4" />
            <AlertTitle>載入失敗</AlertTitle>
            <AlertDescription>
              {error}
              <div className="mt-4">
                <Button onClick={() => window.location.reload()}>
                  重新載入
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">其他福利資源</h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">
            AI搜尋最新的政府補助、企業福利及特殊理賠項目
          </p>
          {lastUpdateTime && (
            <p className="text-xs text-gray-400 mt-1">
              最後更新：{lastUpdateTime.toLocaleString('zh-TW')}
            </p>
          )}
        </div>
        <Button 
          onClick={handleRefreshResources} 
          disabled={isSearching}
          className="gap-2"
        >
          {isSearching ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              AI搜尋中...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              重新搜尋
            </>
          )}
        </Button>
      </div>

      {/* AI搜尋進度 */}
      {isSearching && (
        <div className="mb-8">
          <div className="bg-gradient-to-r from-teal-500 to-blue-500 rounded-xl p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="h-6 w-6 animate-pulse" />
              <h2 className="text-xl font-bold">AI正在搜尋最新資源</h2>
            </div>
            <p className="text-blue-100 mb-4">
              正在搜尋政府補助、企業福利、金融產品和特殊理賠項目...
            </p>
            <div className="w-full bg-blue-400 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-300" 
                style={{ width: `${searchProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-blue-100 mt-2">{searchProgress}% 完成</p>
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4 w-full overflow-x-auto flex-nowrap">
          <TabsTrigger value="government">
            政府補助資源 ({governmentResources.length})
          </TabsTrigger>
          <TabsTrigger value="corporate">
            企業福利資源 ({corporateResources.length})
          </TabsTrigger>
          <TabsTrigger value="financial">
            特殊金融產品 ({financialResources.length})
          </TabsTrigger>
          <TabsTrigger value="special">
            特殊理賠項目 ({specialClaimResources.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            全部資源 ({allResources.length})
          </TabsTrigger>
        </TabsList>

        {/* 政府補助資源 */}
        <TabsContent value="government" className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-bold">政府補助資源</h2>
          </div>
          <ResourceGrid resources={governmentResources} />
        </TabsContent>

        {/* 企業福利資源 */}
        <TabsContent value="corporate" className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Building className="h-5 w-5 text-green-600" />
            <h2 className="text-xl font-bold">企業福利資源</h2>
          </div>
          <ResourceGrid resources={corporateResources} />
        </TabsContent>

        {/* 特殊金融產品 */}
        <TabsContent value="financial" className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="h-5 w-5 text-purple-600" />
            <h2 className="text-xl font-bold">特殊金融產品</h2>
          </div>
          <ResourceGrid resources={financialResources} />
        </TabsContent>

        {/* 特殊理賠項目 */}
        <TabsContent value="special" className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-orange-600" />
            <h2 className="text-xl font-bold">特殊理賠項目</h2>
          </div>
          <ResourceGrid resources={specialClaimResources} />
        </TabsContent>

        {/* 全部資源 */}
        <TabsContent value="all" className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Search className="h-5 w-5 text-gray-600" />
            <h2 className="text-xl font-bold">全部資源</h2>
          </div>
          <ResourceGrid resources={allResources} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// 資源網格組件
function ResourceGrid({ resources }) {
  if (resources.length === 0) {
    return (
      <div className="text-center py-12">
        <FileSearch className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">暫無資源</h3>
        <p className="text-gray-500">AI正在搜尋最新資源，請稍候...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {resources.map((resource) => (
        <Card key={resource.id} className="overflow-hidden hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={`
                    ${resource.priority === 'high' ? 'bg-red-600' : 
                      resource.priority === 'medium' ? 'bg-yellow-600' : 'bg-green-600'}
                  `}>
                    {resource.category}
                  </Badge>
                  <CardTitle className="text-lg md:text-xl">{resource.title}</CardTitle>
                </div>
                <CardDescription>
                  主辦單位: {resource.organization}
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="w-full md:w-auto">
                <FileSearch className="h-4 w-4 mr-2" />
                查看詳情
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-start gap-2">
                <Users className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">申請資格</p>
                  <p className="text-sm text-gray-500">{resource.eligibility}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <FileText className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">補助金額</p>
                  <p className="text-sm text-gray-500">{resource.amount}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">申請期限</p>
                  <p className="text-sm text-gray-500">{resource.deadline}</p>
                </div>
              </div>
            </div>
            <Separator className="my-4" />
            <p className="text-sm text-gray-600">{resource.details}</p>
            {resource.contactInfo && (
              <p className="text-sm text-blue-600 mt-2">📞 {resource.contactInfo}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}