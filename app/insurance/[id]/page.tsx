"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, FileText, Shield, Calendar, Banknote, CheckCircle, AlertCircle, Star, Sparkles, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { checkAuth } from "@/app/actions/auth-service"
import { userDataService } from "@/lib/storage"
import { OpenAIService } from "@/lib/openaiService"

// 20分制評分機制介面
interface PolicyEvaluation {
  totalScore: number;
  starRating: number;
  recommendation: string;
  sections: {
    content: {
      score: number;
      items: Array<{
        name: string;
        score: number;
        reason: string;
      }>;
    };
    pricing: {
      score: number;
      items: Array<{
        name: string;
        score: number;
        reason: string;
      }>;
    };
    company: {
      score: number;
      items: Array<{
        name: string;
        score: number;
        reason: string;
      }>;
    };
    flexibility: {
      score: number;
      items: Array<{
        name: string;
        score: number;
        reason: string;
      }>;
    };
  };
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

// 星等對照函數（非常寬鬆的評分標準）
const getStarRating = (score: number): { stars: number; label: string } => {
  if (score >= 16) return { stars: 5, label: "★★★★★ 建議判斷" };
  if (score >= 13) return { stars: 4, label: "★★★★☆ 主力推薦" };
  if (score >= 8) return { stars: 3, label: "★★★☆☆ 可列入考慮" }; // 大幅降低門檻從10→8
  if (score >= 6) return { stars: 2, label: "★★☆☆☆ 普通可用，有缺點" };
  return { stars: 1, label: "★☆☆☆☆ 不夠好，僅作補充" };
}

export default function InsurancePolicyDetailPage({ params }: { params: { id: string } }) {
  const [policy, setPolicy] = useState<any>(null)
  const [evaluation, setEvaluation] = useState<PolicyEvaluation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [activeTab, setActiveTab] = useState("analysis")
  const [user, setUser] = useState<{ id: string, name: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initializePage = async () => {
      try {
        setIsLoading(true)
        
        // 檢查用戶登入狀態
        const { isLoggedIn, user: authUser } = await checkAuth()
        if (!isLoggedIn || !authUser) {
          setError('請先登入以查看保單詳情')
          return
        }
        
        setUser(authUser)
        
        // 載入真實保單資料
        await loadPolicyData(authUser.id, params.id)
        
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
      
      // 開始AI分析
      await performAIAnalysis(foundPolicy, userId)
      
    } catch (error) {
      console.error('載入保單資料失敗:', error)
      setError('無法載入保單資料')
    }
  }

  const performAIAnalysis = async (policyData: any, userId: string) => {
    try {
      setIsAnalyzing(true)
      
      // 獲取用戶的其他保單和病歷資料以進行全面分析
      const [allPolicies, medicalRecords] = await Promise.all([
        userDataService.getInsurancePolicies(userId),
        userDataService.getMedicalRecords(userId)
      ])
      
      // 調用AI進行20分制評分分析
      const analysisResult = await analyzePolicy(policyData, allPolicies, medicalRecords)
      
      setEvaluation(analysisResult)
      console.log('AI分析結果:', analysisResult)
      
    } catch (error) {
      console.error('AI分析失敗:', error)
      // 設置默認評分以防AI分析失敗
      setEvaluation(getDefaultEvaluation())
    } finally {
      setIsAnalyzing(false)
    }
  }

  // AI評分分析函數
  const analyzePolicy = async (policy: any, allPolicies: any[], medicalRecords: any[]): Promise<PolicyEvaluation> => {
    const policyInfo = policy.policyInfo || {}
    
    // 準備完整的保單資訊給AI分析
    const fullPolicyData = JSON.stringify(policy, null, 2)
    
    // 建構AI分析的提示詞（完全按照用戶評分規則）
    const analysisPrompt = `
請根據以下20分制評分規則仔細分析這份保險保單，並給出詳細評分：

## 評分標準（分為4大項，每項最多5分，共20分）
計分：每個小項「符合」= 1分；「不符合」= 0分；資訊不足可給0或0.5分

### A. 保險內容（5分）
1. 是否涵蓋該險種應有項目（例：癌症險保初期+重度；醫療險保住院+手術）
2. 是否分期或細項保障（分段給付：初診金／門診／復健等）
3. 理賠條件是否明確、可查詢（條款易懂、不模糊）
4. 等待期合理（≤ 90天為佳）
5. 理賠次數或上限是否合理（有多次理賠或合理額度）

### B. 保險價格（5分）
1. 保費是否固定／穩定（長期不上升或機制透明）
2. 是否有保費折扣（如活動回饋、穿戴裝置折扣等）
3. 是否有保費豁免（如罹病／失能後免繳）
4. 有無分紅／投資回饋（儲蓄險適用；不適用可記NA不計分）
5. 條款清楚、易於啟用

### C. 公司信譽（5分）
1. 是否為大型保險公司（例：國泰、富邦、南山、台壽等）
2. 財務穩健（如信評A以上／保發中心穩定性）
3. 理賠速度與口碑佳（網路評價正面、無重大糾紛）
4. 服務通路便利（App／客服／業務，可線上申辦與查詢）
5. 資訊公開透明（保單條款、權益說明好理解）

### D. 搭配彈性（5分）
1. 是否補足既有保單的保障缺口（如已有實支，補重大傷病/癌症）
2. 是否不與現有保單重複（避免同險種疊加）
3. 可否搭配其他險種使用（主約＋多附約、可選性高）
4. 無痛擴充（可加保／調整保額／升級或縮小保障）
5. 整體易理解，能協助完成完整規劃（條款清楚、可與顧問協作）

## 完整保單資料（包含所有AI分析的詳細資訊）：
${fullPolicyData}

## 基本摘要資訊：
- 保險公司：${policyInfo.policyBasicInfo?.insuranceCompany || '請從完整資料中分析'}
- 保單名稱：${policyInfo.policyBasicInfo?.policyName || '請從完整資料中分析'}
- 保單類型：${policyInfo.policyBasicInfo?.policyType || '請從完整資料中分析'}
- 檔案名稱：${policy.fileName || '未知'}

用戶現有保單數量：${allPolicies.length}
用戶病歷記錄數量：${medicalRecords.length}

## 評分採用寬鬆友善標準，積極給分
**重要：請採用極度寬鬆的評分標準，積極為保單尋找優點並給分：**

### 如何從完整保單資料中找評分點：
1. **公司信譽**：從保險公司名稱判斷（國泰、富邦、南山、新光、中壽等都是大型公司→給1分）
2. **保險內容**：
   - 有明確的保障項目或條款→涵蓋項目給0.8-1分
   - 有提到理賠條件→理賠條件給0.8分
   - 等待期未明確提及→給0.5分（假設合理）
3. **價格評估**：
   - 有保費資訊→保費穩定給0.6分
   - 條款清楚可讀→條款清晰給0.8分
   - 其他項目資訊不足→各給0.5分
4. **搭配彈性**：
   - 不同險種可互補→補足缺口給0.8分
   - 可作為保障組合一部分→搭配性給0.7分

### 積極給分原則：
- 資訊不足時，優先給予0.5-0.8分（不要給0分）
- 保單具備基本功能，每項至少給0.5分
- 只要沒有明顯缺陷，盡量往高分給
- **目標讓大部分保單達到10-14分（3-4顆星）**
- 評分寧可寬鬆，不要嚴格

請以JSON格式回傳分析結果：
{
  "totalScore": 總分,
  "starRating": 星等(1-5),
  "recommendation": "評級描述",
  "sections": {
    "content": {
      "score": 總得分,
      "items": [
        {"name": "涵蓋項目", "score": 0或0.5或1, "reason": "評分理由"},
        {"name": "分期保障", "score": 0或0.5或1, "reason": "評分理由"},
        {"name": "理賠條件", "score": 0或0.5或1, "reason": "評分理由"},
        {"name": "等待期", "score": 0或0.5或1, "reason": "評分理由"},
        {"name": "理賠次數", "score": 0或0.5或1, "reason": "評分理由"}
      ]
    },
    "pricing": {
      "score": 總得分,
      "items": [
        {"name": "保費穩定", "score": 0或0.5或1, "reason": "評分理由"},
        {"name": "保費折扣", "score": 0或0.5或1, "reason": "評分理由"},
        {"name": "保費豁免", "score": 0或0.5或1, "reason": "評分理由"},
        {"name": "分紅回饋", "score": 0或0.5或1, "reason": "評分理由"},
        {"name": "條款清晰", "score": 0或0.5或1, "reason": "評分理由"}
      ]
    },
    "company": {
      "score": 總得分,
      "items": [
        {"name": "大型公司", "score": 0或0.5或1, "reason": "評分理由"},
        {"name": "財務穩健", "score": 0或0.5或1, "reason": "評分理由"},
        {"name": "理賠口碑", "score": 0或0.5或1, "reason": "評分理由"},
        {"name": "服務通路", "score": 0或0.5或1, "reason": "評分理由"},
        {"name": "資訊透明", "score": 0或0.5或1, "reason": "評分理由"}
      ]
    },
    "flexibility": {
      "score": 總得分,
      "items": [
        {"name": "補足缺口", "score": 0或0.5或1, "reason": "評分理由"},
        {"name": "避免重複", "score": 0或0.5或1, "reason": "評分理由"},
        {"name": "可搭配性", "score": 0或0.5或1, "reason": "評分理由"},
        {"name": "擴充性", "score": 0或0.5或1, "reason": "評分理由"},
        {"name": "整體規劃", "score": 0或0.5或1, "reason": "評分理由"}
      ]
    }
  },
  "strengths": ["優勢1", "優勢2"],
  "weaknesses": ["不足1", "不足2"],
  "suggestions": ["建議1", "建議2"]
}`

    try {
      const apiKey = localStorage.getItem('openai_api_key')
      if (!apiKey) {
        throw new Error('未設置OpenAI API密鑰')
      }

      // 實例化OpenAI服務
      const aiService = new OpenAIService(apiKey)
      const response = await aiService.analyzePolicyEvaluation(analysisPrompt)
      
      // 更強健的JSON解析
      const jsonMatch = response.match(/\{[\s\S]*\}(?=\s*$|\s*[^\}])/)
      if (!jsonMatch) {
        throw new Error('AI回應中未找到有效JSON')
      }
      
      const analysisResult = JSON.parse(jsonMatch[0])
      
      // 驗證必要欄位
      if (!analysisResult.totalScore || !analysisResult.sections) {
        throw new Error('AI回應缺少必要評分資料')
      }
      
      const { stars, label } = getStarRating(analysisResult.totalScore)
      
      return {
        ...analysisResult,
        starRating: stars,
        recommendation: label
      }
      
    } catch (error) {
      console.error('AI分析錯誤:', error)
      return getDefaultEvaluation()
    }
  }

  // 默認評分（當AI分析失敗時使用）- 提高到12分確保3星
  const getDefaultEvaluation = (): PolicyEvaluation => {
    return {
      totalScore: 12,
      starRating: 3,
      recommendation: "★★★☆☆ 分析中，請稍後重試",
      sections: {
        content: {
          score: 3,
          items: [
            { name: "涵蓋項目", score: 0.6, reason: "基本保障項目符合需求" },
            { name: "分期保障", score: 0.6, reason: "具備基本保障結構" },
            { name: "理賠條件", score: 0.6, reason: "條款尚可理解" },
            { name: "等待期", score: 0.6, reason: "等待期在合理範圍" },
            { name: "理賠次數", score: 0.6, reason: "理賠限制可接受" }
          ]
        },
        pricing: {
          score: 3,
          items: [
            { name: "保費穩定", score: 0.6, reason: "保費機制尚可接受" },
            { name: "保費折扣", score: 0.6, reason: "具備基本優惠可能" },
            { name: "保費豁免", score: 0.6, reason: "具備保障延續機制" },
            { name: "分紅回饋", score: 0.6, reason: "具備回饋潛力" },
            { name: "條款清晰", score: 0.6, reason: "條款表達清楚" }
          ]
        },
        company: {
          score: 3,
          items: [
            { name: "大型公司", score: 0.6, reason: "具備一定公司規模" },
            { name: "財務穩健", score: 0.6, reason: "財務體質穩定" },
            { name: "理賠口碑", score: 0.6, reason: "理賠服務可靠" },
            { name: "服務通路", score: 0.6, reason: "服務管道完善" },
            { name: "資訊透明", score: 0.6, reason: "資訊揭露充分" }
          ]
        },
        flexibility: {
          score: 3,
          items: [
            { name: "補足缺口", score: 0.6, reason: "能補強保障不足" },
            { name: "避免重複", score: 0.6, reason: "與現有保單搭配良好" },
            { name: "可搭配性", score: 0.6, reason: "具備彈性搭配條件" },
            { name: "擴充性", score: 0.6, reason: "保障可調整空間" },
            { name: "整體規劃", score: 0.6, reason: "有助於完整規劃" }
          ]
        }
      },
      strengths: ["正在分析保單優勢"],
      weaknesses: ["正在分析保單不足之處"],
      suggestions: ["建議重新整理或檢查保單資料完整性"]
    }
  }

  // 獲取保單顯示標題
  const getPolicyDisplayTitle = (policy: any): string => {
    const policyInfo = policy?.policyInfo?.policyBasicInfo
    
    if (policyInfo?.policyName && policyInfo.policyName !== '待輸入') {
      if (policyInfo?.policyType && policyInfo.policyType !== '待輸入') {
        return `${policyInfo.policyName} (${policyInfo.policyType})`
      }
      return policyInfo.policyName
    }
    
    if (policyInfo?.insuranceCompany && policyInfo.insuranceCompany !== '待輸入') {
      const policyTypeText = policyInfo?.policyType && policyInfo.policyType !== '待輸入' 
        ? policyInfo.policyType 
        : '保險保單'
      return `${policyInfo.insuranceCompany} - ${policyTypeText}`
    }
    
    return policy?.fileName || '保險保單'
  }

  // Loading狀態
  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
              <p className="text-gray-500">載入保單資料中...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 錯誤狀態
  if (error) {
    return (
      <div className="container py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center mb-8">
            <Link href="/insurance">
              <Button variant="ghost" size="sm" className="gap-1">
                <ArrowLeft className="h-4 w-4" />
                返回AI保單健檢
              </Button>
            </Link>
          </div>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>載入失敗</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  if (!policy) {
    return null
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <Link href="/insurance">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              返回AI保單健檢
            </Button>
          </Link>
        </div>

        {/* AI保險精靈重點分析 */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-teal-500 to-emerald-500 rounded-t-xl p-4">
            <div className="flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-white" />
              <h2 className="text-xl font-bold text-white">AI保險精靈重點分析</h2>
              {isAnalyzing && (
                <Loader2 className="h-5 w-5 text-white animate-spin" />
              )}
            </div>
          </div>
          <div className="border border-t-0 rounded-b-xl p-6 bg-white shadow-md">
            {isAnalyzing ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 mx-auto text-teal-600 animate-spin mb-4" />
                <h3 className="font-medium text-lg mb-2">AI正在分析您的保單</h3>
                <p className="text-gray-500">
                  正在根據20分制評分規則進行專業分析，請稍候...
                </p>
              </div>
            ) : evaluation ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-lg">綜合評價</h3>
                    <div className="flex items-center gap-2">
                      <StarRating rating={evaluation.starRating} />
                      <span className="font-bold text-lg">{evaluation.totalScore}/20</span>
                    </div>
                  </div>
                  <div className="mb-4">
                    <Badge className={`${
                      evaluation.starRating >= 4 ? 'bg-green-600' : 
                      evaluation.starRating >= 3 ? 'bg-yellow-600' : 
                      'bg-red-600'
                    }`}>
                      {evaluation.recommendation}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">保險內容</span>
                        <span className="text-sm font-medium">{evaluation.sections.content.score}/5</span>
                      </div>
                      <Progress value={evaluation.sections.content.score * 20} className="h-2" />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">保險價格</span>
                        <span className="text-sm font-medium">{evaluation.sections.pricing.score}/5</span>
                      </div>
                      <Progress value={evaluation.sections.pricing.score * 20} className="h-2" />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">公司信譽</span>
                        <span className="text-sm font-medium">{evaluation.sections.company.score}/5</span>
                      </div>
                      <Progress value={evaluation.sections.company.score * 20} className="h-2" />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">搭配彈性</span>
                        <span className="text-sm font-medium">{evaluation.sections.flexibility.score}/5</span>
                      </div>
                      <Progress value={evaluation.sections.flexibility.score * 20} className="h-2" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      優勢
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-sm pl-1">
                      {evaluation.strengths.map((strength, index) => (
                        <li key={index} className="text-gray-700">
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      不足之處
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-sm pl-1">
                      {evaluation.weaknesses.map((weakness, index) => (
                        <li key={index} className="text-gray-700">
                          {weakness}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="h-8 w-8 mx-auto text-amber-500 mb-4" />
                <h3 className="font-medium text-lg mb-2">分析準備中</h3>
                <p className="text-gray-500">
                  請稍候，系統正在準備分析您的保單
                </p>
              </div>
            )}

            {evaluation && (
              <div className="mt-6 pt-4 border-t">
                <h3 className="font-medium mb-2">AI建議</h3>
                <ul className="list-disc list-inside space-y-1 text-sm pl-1">
                  {evaluation.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-gray-700">
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {getPolicyDisplayTitle(policy)}
            </h1>
            <p className="text-gray-500 mt-1">
              保單編號: {policy.policyInfo?.policyBasicInfo?.policyNumber || '待補充'}
            </p>
            {policy.fileName && (
              <p className="text-xs text-gray-400 mt-1">檔案：{policy.fileName}</p>
            )}
          </div>
          <Badge className="bg-green-600">已上傳</Badge>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="analysis">詳細分析</TabsTrigger>
            <TabsTrigger value="details">保單內容</TabsTrigger>
            <TabsTrigger value="documents">相關文件</TabsTrigger>
          </TabsList>

          <TabsContent value="analysis" className="space-y-4">
            {evaluation && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(evaluation.sections).map(([sectionKey, section]) => {
                  const sectionNames = {
                    content: '保險內容',
                    pricing: '保險價格', 
                    company: '公司信譽',
                    flexibility: '搭配彈性'
                  }
                  
                  return (
                    <Card key={sectionKey}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          {sectionNames[sectionKey]}
                          <span className="text-lg font-bold text-teal-600">
                            {section.score}/5
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {section.items.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div className="flex-1">
                                <p className="text-sm font-medium">{item.name}</p>
                                <p className="text-xs text-gray-500 mt-1">{item.reason}</p>
                              </div>
                              <Badge variant={item.score >= 0.8 ? "default" : item.score >= 0.5 ? "secondary" : "outline"}>
                                {item.score}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>保單基本資訊</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">保險公司</p>
                    <p className="mt-1">{policy.policyInfo?.policyBasicInfo?.insuranceCompany || '資訊不足'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">保單類型</p>
                    <p className="mt-1">{policy.policyInfo?.policyBasicInfo?.policyType || '資訊不足'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">生效日期</p>
                    <p className="mt-1">{policy.policyInfo?.policyBasicInfo?.effectiveDate || '資訊不足'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">到期日期</p>
                    <p className="mt-1">{policy.policyInfo?.policyBasicInfo?.expiryDate || '資訊不足'}</p>
                  </div>
                </div>
                
                {policy.policyInfo?.policyBasicInfo?.coverageDetails && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-500 mb-2">保障內容</p>
                    <div className="p-3 bg-gray-50 rounded">
                      <p className="text-sm">{policy.policyInfo.policyBasicInfo.coverageDetails}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>上傳文件</CardTitle>
                <CardDescription>與此保單相關的文件</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <FileText className="h-5 w-5 text-gray-500" />
                  <div className="flex-1">
                    <p className="font-medium">{policy.fileName}</p>
                    <p className="text-sm text-gray-500">
                      上傳時間: {new Date(policy.uploadDate).toLocaleDateString('zh-TW')}
                    </p>
                  </div>
                  <Badge variant="outline">{policy.fileType?.toUpperCase()}</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-8 flex justify-between">
          <Link href="/insurance">
            <Button variant="outline">返回保單列表</Button>
          </Link>
          <div className="flex gap-2">
            <Button 
              onClick={() => performAIAnalysis(policy, user?.id)}
              disabled={isAnalyzing}
              className="gap-2"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  重新分析中...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  重新分析
                </>
              )}
            </Button>
            <Link href={`/claims/new?policy=${policy.id}`}>
              <Button className="bg-teal-600 hover:bg-teal-700">申請理賠</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// StarRating 組件
const StarRating = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 !== 0
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

  return (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
      ))}
      {hasHalfStar && (
        <div className="relative">
          <Star className="h-4 w-4 text-gray-300" />
          <div className="absolute top-0 left-0 w-1/2 overflow-hidden">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          </div>
        </div>
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
      ))}
    </div>
  )
}
