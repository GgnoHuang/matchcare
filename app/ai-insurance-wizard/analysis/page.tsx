"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, FileText, Shield, Calendar, Banknote, CheckCircle, AlertCircle, Star, Sparkles, Loader2, Zap, Info, RefreshCw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { OpenAIService } from "@/lib/openaiService"

// 複用現有的評分機制介面
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

// 星等對照函數
const getStarRating = (score: number): { stars: number; label: string } => {
  if (score >= 16) return { stars: 5, label: "優秀" };
  if (score >= 13) return { stars: 4, label: "良好" };
  if (score >= 8) return { stars: 3, label: "普通" };
  if (score >= 6) return { stars: 2, label: "待改善" };
  return { stars: 1, label: "待改善" };
}

// 計算平均星數函數
const calculateAverageStars = (evaluation: PolicyEvaluation): string => {
  if (!evaluation.sections) return "0.0";
  
  const sections = evaluation.sections;
  let totalStars = 0;
  let sectionCount = 0;
  
  if (sections.content) {
    const sectionStars = (sections.content.score / 5) * 5;
    totalStars += sectionStars;
    sectionCount++;
  }
  
  if (sections.pricing) {
    const sectionStars = (sections.pricing.score / 5) * 5;
    totalStars += sectionStars;
    sectionCount++;
  }
  
  if (sections.company) {
    const sectionStars = (sections.company.score / 5) * 5;
    totalStars += sectionStars;
    sectionCount++;
  }
  
  if (sections.flexibility) {
    const sectionStars = (sections.flexibility.score / 5) * 5;
    totalStars += sectionStars;
    sectionCount++;
  }
  
  const averageStars = sectionCount > 0 ? totalStars / sectionCount : 0;
  return averageStars.toFixed(1);
}

export default function AIInsuranceWizardAnalysisPage() {
  const router = useRouter()
  const [policy, setPolicy] = useState<any>(null)
  const [evaluation, setEvaluation] = useState<PolicyEvaluation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [activeTab, setActiveTab] = useState("analysis")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initializePage = async () => {
      try {
        setIsLoading(true)
        
        // 從 sessionStorage 載入臨時保單資料
        const tempPolicyData = sessionStorage.getItem('tempPolicyData')
        if (!tempPolicyData) {
          setError('沒有找到保單分析資料，請重新上傳')
          return
        }
        
        const policyData = JSON.parse(tempPolicyData)
        console.log('載入臨時保單資料:', policyData)
        setPolicy(policyData)
        
        // 自動開始AI評估分析
        await startAIEvaluation(policyData)
        
      } catch (error) {
        console.error('初始化頁面失敗:', error)
        setError('載入分析資料失敗')
      } finally {
        setIsLoading(false)
      }
    }
    
    initializePage()
  }, [])

  // 開始AI評估分析（復制原有保險精靈邏輯）
  const startAIEvaluation = async (policyData: any) => {
    try {
      setIsAnalyzing(true)
      setError(null)
      
      console.log('🤖 開始AI保險精靈評估...')
      
      // 使用與原有保險精靈相同的分析邏輯
      const evaluation = await analyzePolicy(policyData, [], [])
      
      console.log('✅ AI評估完成:', evaluation)
      setEvaluation(evaluation)
      
    } catch (error) {
      console.error('AI評估失敗:', error)
      setError('AI評估失敗：' + (error as Error).message)
    } finally {
      setIsAnalyzing(false)
    }
  }

  // AI評分分析函數（復制自原有保險精靈）
  const analyzePolicy = async (policy: any, allPolicies: any[], medicalRecords: any[]): Promise<PolicyEvaluation> => {
    const policyInfo = policy.policyInfo || {}
    
    // 準備完整的保單資訊給AI分析
    const fullPolicyData = JSON.stringify(policy, null, 2)
    
    // 建構AI分析的提示詞（與原版完全相同）
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
      const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY
      const aiService = new OpenAIService(apiKey)
      const response = await aiService.analyzePolicyEvaluation(analysisPrompt)
      
      // 解析JSON回應
      const jsonMatch = response.match(/\{[\s\S]*\}(?=\s*$|\s*[^\}])/)
      if (!jsonMatch) {
        throw new Error('AI回應中未找到有效JSON')
      }
      
      const analysisResult = JSON.parse(jsonMatch[0])
      
      // 驗證必要欄位
      if (!analysisResult.totalScore || !analysisResult.sections) {
        throw new Error('AI回應缺少必要評分資料')
      }
      
      return analysisResult
      
    } catch (error) {
      console.error('AI評分分析失敗:', error)
      // 返回默認評分
      return getDefaultEvaluation()
    }
  }

  // 獲取默認評分（防止AI分析失敗）
  const getDefaultEvaluation = (): PolicyEvaluation => ({
    totalScore: 12,
    starRating: 3,
    recommendation: "系統分析中，請稍後重試",
    sections: {
      content: { score: 3, items: [] },
      pricing: { score: 3, items: [] },
      company: { score: 3, items: [] },
      flexibility: { score: 3, items: [] }
    },
    strengths: ["保單具備基本保障功能"],
    weaknesses: [],
    suggestions: ["建議等待AI分析完成"]
  })

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

  // 重新分析
  const handleReAnalysis = async () => {
    if (policy) {
      await startAIEvaluation(policy)
    }
  }

  // 返回上傳頁面
  const handleBackToUpload = () => {
    // 清除臨時資料
    sessionStorage.removeItem('tempPolicyData')
    router.push('/ai-insurance-wizard')
  }

  if (isLoading) {
    return (
      <div className="container py-6 md:py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto mb-4"></div>
            <p className="text-gray-500">正在載入分析資料...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-6 md:py-8">
        <div className="max-w-md mx-auto text-center">
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>載入失敗</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={handleBackToUpload}>
            重新上傳保單
          </Button>
        </div>
      </div>
    )
  }

  const basicInfo = policy?.policyInfo?.policyBasicInfo
  const displayRating = evaluation ? getStarRating(evaluation.totalScore) : { stars: 0, label: "分析中" }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBackToUpload}
            className="gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            重新上傳保單
          </Button>
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
                      <span className="font-bold text-lg">{calculateAverageStars(evaluation)}/5 ⭐</span>
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
          <Badge className="bg-yellow-600">臨時分析</Badge>
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
                  const sectionNames: Record<'content' | 'pricing' | 'company' | 'flexibility', string> = {
                    content: '保險內容',
                    pricing: '保險價格', 
                    company: '公司信譽',
                    flexibility: '搭配彈性'
                  }
                  const typedKey = sectionKey as keyof typeof sectionNames
                  return (
                    <Card key={sectionKey}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          {sectionNames[typedKey]}
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
                              {item.score >= 0.5 && (
                                <Badge 
                                  variant={item.score >= 0.8 ? "default" : "secondary"}
                                >
                                  {item.score >= 0.8 ? "優秀" : "良好"}
                                </Badge>
                              )}
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
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">基本資料</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">保險公司:</span>
                        <span>{policy.policyInfo?.policyBasicInfo?.insuranceCompany || '待補充'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">保單名稱:</span>
                        <span>{policy.policyInfo?.policyBasicInfo?.policyName || '待補充'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">保單號碼:</span>
                        <span>{policy.policyInfo?.policyBasicInfo?.policyNumber || '待補充'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">保單類型:</span>
                        <span>{policy.policyInfo?.policyBasicInfo?.policyType || '待補充'}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">期間與費用</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">生效日期:</span>
                        <span>{policy.policyInfo?.policyBasicInfo?.effectiveDate || '待補充'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">保險期間:</span>
                        <span>{policy.policyInfo?.policyBasicInfo?.insurancePeriod || '待補充'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">年繳保費:</span>
                        <span>{policy.policyInfo?.policyBasicInfo?.annualPremium || '待補充'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">繳費期間:</span>
                        <span>{policy.policyInfo?.policyBasicInfo?.premiumPaymentPeriod || '待補充'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>保障條款</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded text-sm leading-relaxed">
                  {policy.policyInfo?.policyBasicInfo?.policyTerms || '保單條款內容處理中...'}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>檔案資訊</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">檔案名稱:</span>
                    <span>{policy.fileName || '未知'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">上傳時間:</span>
                    <span>{policy.uploadDate ? new Date(policy.uploadDate).toLocaleString('zh-TW') : '未知'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">分析狀態:</span>
                    <Badge className="bg-yellow-600">臨時分析</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* 底部操作按鈕 */}
        <div className="flex justify-center gap-4 mt-8">
          <Button variant="outline" onClick={handleBackToUpload} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            重新上傳其他保單
          </Button>
          <Link href="/insurance/import">
            <Button className="gap-2">
              <Shield className="h-4 w-4" />
              儲存到保單總覽
            </Button>
          </Link>
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