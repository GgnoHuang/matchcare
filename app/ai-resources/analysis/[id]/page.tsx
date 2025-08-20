"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ChevronLeft, MessageSquare, Search, Sparkles, ThumbsUp, ThumbsDown, Share2, ArrowUp } from "lucide-react"
import { checkAuth } from "@/app/actions/auth-service"
// import.*userDataService.*from "@/lib/storage" // 已移除，改用 API
import { OpenAIService } from "@/lib/openaiService"

export default function TreatmentAnalysisPage({ params }) {
  const [isLoading, setIsLoading] = useState(true)
  const [treatment, setTreatment] = useState(null)
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState(null)
  const [error, setError] = useState(null)

  // 監聽滾動事件
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // 載入真實AI分析資料
  useEffect(() => {
    const loadRealData = async () => {
      try {
        setIsLoading(true)
        
        // 檢查用戶登入狀態
        const { isLoggedIn, user: authUser } = await checkAuth()
        if (!isLoggedIn || !authUser) {
          setError('請先登入以查看AI分析')
          return
        }
        
        setUser(authUser)
        
        // 解碼搜尋詞（params.id 實際上是編碼後的搜尋詞）
        const searchTerm = decodeURIComponent(params.id)
        console.log('準備分析搜尋詞:', searchTerm)
        
        // 獲取用戶的保單和病歷資料
        const [userPolicies, medicalRecords] = await Promise.all([
          userDataService.getInsurancePolicies(authUser.id),
          userDataService.getMedicalRecords(authUser.id)
        ])
        
        // 使用AI生成治療分析
        const analysisResult = await generateTreatmentAnalysis(searchTerm, userPolicies, medicalRecords)
        setTreatment(analysisResult)
        
      } catch (error) {
        console.error('載入分析資料失敗:', error)
        setError('載入分析資料失敗，請稍後重試')
      } finally {
        setIsLoading(false)
      }
    }

    loadRealData()
  }, [params.id])

  // AI生成治療分析
  const generateTreatmentAnalysis = async (searchTerm, userPolicies, medicalRecords) => {
    const apiKey = localStorage.getItem('openai_api_key')
    if (!apiKey) {
      throw new Error('未設置OpenAI API密鑰')
    }

    const aiService = new OpenAIService(apiKey)
    
    const analysisPrompt = `
你是台灣的醫療專家和保險顧問，請針對「${searchTerm}」提供專業的治療分析報告。

## 用戶背景資料：
- 用戶保單數量：${userPolicies.length}
- 用戶病歷數量：${medicalRecords.length}

## 請提供以下格式的分析：

請以JSON格式回傳完整的治療分析：
{
  "id": "${searchTerm}",
  "name": "${searchTerm}",
  "category": "治療類別（如：手術、藥物治療、復健等）",
  "score": 評分1-100,
  "overview": "治療概述（200-300字的詳細介紹）",
  "suitability": {
    "description": "適用情況說明",
    "conditions": ["適用條件1", "適用條件2", "適用條件3", "適用條件4", "適用條件5"]
  },
  "effectiveness": {
    "description": "效果評估說明",
    "pros": ["優點1", "優點2", "優點3", "優點4"],
    "cons": ["缺點1", "缺點2", "缺點3", "缺點4"]
  },
  "cost": {
    "description": "費用分析說明",
    "average": "平均費用",
    "range": "費用區間",
    "reason": "費用原因"
  },
  "risks": {
    "description": "風險評估說明",
    "items": [
      {"level": "高/中/低", "name": "風險名稱", "description": "風險描述"},
      {"level": "高/中/低", "name": "風險名稱", "description": "風險描述"},
      {"level": "高/中/低", "name": "風險名稱", "description": "風險描述"}
    ]
  },
  "alternatives": {
    "description": "替代方案說明",
    "options": [
      {"name": "替代方案1", "coverage": "健保給付/部分自費/完全自費", "description": "方案描述", "cost": "費用"},
      {"name": "替代方案2", "coverage": "健保給付/部分自費/完全自費", "description": "方案描述", "cost": "費用"}
    ]
  },
  "expertOpinion": "專家建議（100-150字）",
  "conclusion": "結論（150-200字）",
  "references": [
    {"title": "參考資料1", "url": "#", "authors": "作者", "year": "2023"},
    {"title": "參考資料2", "url": "#", "authors": "作者", "year": "2023"}
  ]
}

請基於台灣醫療環境和健保制度提供專業分析，確保資訊準確且實用。`

    const response = await aiService.analyzePolicyEvaluation(analysisPrompt)
    
    // 解析AI回應的JSON
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    
    throw new Error('AI分析格式錯誤')
  }

  // 滾動到頂部
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (isLoading) {
    return <LoadingState />
  }

  if (error) {
    return (
      <div className="container py-8">
        <div className="mb-6">
          <Link href="/ai-resources">
            <Button variant="ghost" size="sm" className="gap-1">
              <ChevronLeft className="h-4 w-4" />
              返回資源列表
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-lg text-red-500">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
            >
              重新載入
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!treatment) {
    return (
      <div className="container py-8">
        <div className="mb-6">
          <Link href="/ai-resources">
            <Button variant="ghost" size="sm" className="gap-1">
              <ChevronLeft className="h-4 w-4" />
              返回資源列表
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-lg text-gray-500">AI分析準備中，請稍候...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8 relative">
      <div className="mb-6">
        <Link href="/ai-resources">
          <Button variant="ghost" size="sm" className="gap-1">
            <ChevronLeft className="h-4 w-4" />
            返回資源列表
          </Button>
        </Link>
      </div>

      {/* 頂部評分卡片 - AI生成的真實分析 */}
      <Card className="mb-8 border-2 border-teal-200 bg-teal-50">
        <CardContent className="py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-full p-3 shadow-sm">
                <Sparkles className="h-6 w-6 text-teal-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{treatment.name}</h2>
                <p className="text-gray-500">AI專業治療分析</p>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-teal-600">{treatment.score}</div>
              <div className="text-sm text-gray-500">AI評分 (1-100)</div>
            </div>
            <div className="flex gap-2">
              <Badge
                className={
                  treatment.score >= 80 ? "bg-green-600" : treatment.score >= 60 ? "bg-amber-600" : "bg-red-600"
                }
              >
                {treatment.score >= 80 ? "AI建議：強烈推薦" : treatment.score >= 60 ? "AI建議：值得考慮" : "AI建議：謹慎評估"}
              </Badge>
              <Badge variant="outline" className="bg-white">
                {treatment.category}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ChatGPT風格的內容區域 */}
      <div className="bg-white rounded-lg border shadow-sm mb-8">
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-gray-500" />
            <span className="font-medium">AI深度分析</span>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* 治療概述 */}
          <div>
            <h3 className="text-lg font-bold mb-3">治療概述</h3>
            <p className="text-gray-700 leading-relaxed">{treatment.overview}</p>
          </div>

          <Separator />

          {/* 適用情況 */}
          <div>
            <h3 className="text-lg font-bold mb-3">適用情況</h3>
            <p className="text-gray-700 leading-relaxed mb-3">{treatment.suitability.description}</p>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              {treatment.suitability.conditions.map((condition, index) => (
                <li key={index}>{condition}</li>
              ))}
            </ul>
          </div>

          <Separator />

          {/* 效果評估 */}
          <div>
            <h3 className="text-lg font-bold mb-3">效果評估</h3>
            <p className="text-gray-700 leading-relaxed mb-3">{treatment.effectiveness.description}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-md p-4">
                <h4 className="font-medium mb-2 text-green-600">優點</h4>
                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                  {treatment.effectiveness.pros.map((pro, index) => (
                    <li key={index}>{pro}</li>
                  ))}
                </ul>
              </div>
              <div className="border rounded-md p-4">
                <h4 className="font-medium mb-2 text-red-600">缺點</h4>
                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                  {treatment.effectiveness.cons.map((con, index) => (
                    <li key={index}>{con}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <Separator />

          {/* 費用分析 */}
          <div>
            <h3 className="text-lg font-bold mb-3">費用分析</h3>
            <p className="text-gray-700 leading-relaxed mb-3">{treatment.cost.description}</p>
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">平均費用</p>
                  <p className="font-medium">{treatment.cost.average}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">費用區間</p>
                  <p className="font-medium">{treatment.cost.range}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">自費原因</p>
                  <p className="font-medium">{treatment.cost.reason}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* 風險評估 */}
          <div>
            <h3 className="text-lg font-bold mb-3">風險評估</h3>
            <p className="text-gray-700 leading-relaxed mb-3">{treatment.risks.description}</p>
            <div className="space-y-3">
              {treatment.risks.items.map((risk, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div
                    className={`px-2 py-1 rounded-md text-xs font-medium ${
                      risk.level === "高"
                        ? "bg-red-100 text-red-600"
                        : risk.level === "中"
                          ? "bg-amber-100 text-amber-600"
                          : "bg-green-100 text-green-600"
                    }`}
                  >
                    {risk.level}
                  </div>
                  <div>
                    <p className="font-medium">{risk.name}</p>
                    <p className="text-sm text-gray-600">{risk.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* 替代方案 */}
          <div>
            <h3 className="text-lg font-bold mb-3">替代方案</h3>
            <p className="text-gray-700 leading-relaxed mb-3">{treatment.alternatives.description}</p>
            <div className="space-y-4">
              {treatment.alternatives.options.map((option, index) => (
                <div key={index} className="border rounded-md p-4">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">{option.name}</h4>
                    <Badge variant="outline">{option.coverage}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{option.description}</p>
                  <div className="mt-2 text-sm">
                    <span className="font-medium">費用: </span>
                    <span className="text-gray-600">{option.cost}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* 專家建議 */}
          <div>
            <h3 className="text-lg font-bold mb-3">專家建議</h3>
            <div className="border-l-4 border-blue-300 pl-4 py-2 bg-blue-50 rounded-r-md">
              <p className="text-gray-700 italic leading-relaxed">{treatment.expertOpinion}</p>
            </div>
          </div>

          <Separator />

          {/* 結論 */}
          <div>
            <h3 className="text-lg font-bold mb-3">結論</h3>
            <p className="text-gray-700 leading-relaxed">{treatment.conclusion}</p>
          </div>

          {/* 參考資料 */}
          <div className="bg-gray-50 p-4 rounded-md text-sm">
            <h4 className="font-medium mb-2">參考資料</h4>
            <ul className="space-y-1 text-gray-600">
              {treatment.references.map((ref, index) => (
                <li key={index}>
                  <a href={ref.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {ref.title}
                  </a>
                  {ref.authors && <span> - {ref.authors}</span>}
                  {ref.year && <span> ({ref.year})</span>}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 底部互動區 */}
        <div className="p-4 border-t bg-gray-50 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" className="h-8 rounded-full">
                <ThumbsUp className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="h-8 rounded-full">
                <ThumbsDown className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-sm text-gray-500">此分析對您有幫助嗎？</div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1">
              <Share2 className="h-4 w-4" />
              分享
            </Button>
            <Button variant="outline" size="sm" className="gap-1">
              <Search className="h-4 w-4" />
              深入研究
            </Button>
          </div>
        </div>
      </div>

      {/* 回到頂部按鈕 */}
      {scrolled && (
        <Button
          className="fixed bottom-6 right-6 rounded-full h-12 w-12 p-0 bg-blue-600 hover:bg-blue-700 shadow-lg"
          onClick={scrollToTop}
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}
    </div>
  )
}

// AI分析載入狀態組件
function LoadingState() {
  return (
    <div className="container py-8">
      <div className="mb-6">
        <Button variant="ghost" size="sm" disabled className="gap-1">
          <ChevronLeft className="h-4 w-4" />
          返回資源列表
        </Button>
      </div>

      {/* AI分析中提示 */}
      <div className="mb-8 text-center">
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-6 text-white">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="h-8 w-8 animate-pulse" />
            <h2 className="text-2xl font-bold">AI正在深度分析中</h2>
          </div>
          <p className="text-blue-100">
            正在根據您的搜尋內容和個人資料，生成專業的醫療治療分析報告...
          </p>
        </div>
      </div>

      <div className="animate-pulse">
        <div className="h-32 bg-gray-200 rounded-lg mb-8"></div>

        <div className="bg-white rounded-lg border shadow-sm mb-8">
          <div className="p-4 border-b bg-gray-50">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>

            <div className="h-px bg-gray-200"></div>

            <div>
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>

            <div className="h-px bg-gray-200"></div>

            <div>
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-3"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-md p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
                <div className="border rounded-md p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// 這個函數已經被移除，因為現在使用真實的AI分析
// 所有資料都通過OpenAI API動態生成
