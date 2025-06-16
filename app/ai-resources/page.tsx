"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  FileText,
  FileSearch,
  Users,
  Download,
  Brain,
  Building,
  Shield,
  CreditCard,
  Scale,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  Search,
  Filter,
  Stethoscope,
  Zap,
  Pill,
  Heart,
  Eye,
  ChevronRight,
  MessageSquare,
  ExternalLink,
} from "lucide-react"

export default function AIResourcesPage() {
  // 主要功能切換狀態
  const [mainFeature, setMainFeature] = useState("quick-search")

  // AI自動比對相關狀態
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  // 快速搜尋相關狀態
  const [quickSearchTerm, setQuickSearchTerm] = useState("")
  const [quickSearchResults, setQuickSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)

  // 模擬分析過程
  useEffect(() => {
    if (isAnalyzing) {
      const interval = setInterval(() => {
        setAnalysisProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            setIsAnalyzing(false)
            setAnalysisComplete(true)
            return 100
          }
          return prev + 5
        })
      }, 150)
      return () => clearInterval(interval)
    }
  }, [isAnalyzing])

  // 開始分析
  const startAnalysis = () => {
    setIsAnalyzing(true)
    setAnalysisProgress(0)
    setAnalysisComplete(false)
  }

  // 重置分析
  const resetAnalysis = () => {
    setAnalysisComplete(false)
    setAnalysisProgress(0)
  }

  // 模擬資源數據
  const resources = [
    // A. 政府補助資源
    {
      id: "gov-1",
      category: "政府補助",
      subcategory: "國家級",
      title: "重大傷病醫療補助",
      organization: "衛生福利部",
      eligibility: "符合全民健康保險重大傷病範圍者",
      amount: "醫療費用全額補助",
      deadline: "常年受理",
      matchedConditions: ["乳癌第二期", "腦瘤"],
      details: "凡是符合健保重大傷病範圍，且領有重大傷病證明的民眾，可享有醫療費用全額補助。",
      status: "eligible",
      priority: "high",
      icon: <Shield className="h-5 w-5 text-blue-600" />,
    },
    {
      id: "gov-2",
      category: "政府補助",
      subcategory: "國家級",
      title: "癌症病患家庭照顧服務補助",
      organization: "衛生福利部",
      eligibility: "罹患癌症且有照顧需求者",
      amount: "每月最高10,000元",
      deadline: "常年受理",
      matchedConditions: ["乳癌第二期"],
      details: "針對罹患癌症且有照顧需求的患者，提供居家照顧、喘息服務等照顧服務補助。",
      status: "eligible",
      priority: "high",
      icon: <Shield className="h-5 w-5 text-blue-600" />,
    },
    {
      id: "gov-3",
      category: "政府補助",
      subcategory: "國家級",
      title: "糖尿病共同照護網補助",
      organization: "衛生福利部",
      eligibility: "糖尿病患者",
      amount: "每年最高2,000元",
      deadline: "常年受理",
      matchedConditions: ["第二型糖尿病"],
      details: "針對糖尿病患者，提供衛教諮詢、營養諮詢、足部檢查等服務補助。",
      status: "eligible",
      priority: "medium",
      icon: <Shield className="h-5 w-5 text-blue-600" />,
    },
    {
      id: "gov-4",
      category: "政府補助",
      subcategory: "縣市級",
      title: "台北市重大傷病市民醫療補助",
      organization: "台北市政府",
      eligibility: "設籍台北市且領有重大傷病證明者",
      amount: "每年最高30,000元",
      deadline: "每年1月、7月受理",
      matchedConditions: ["乳癌第二期", "腦瘤"],
      details: "針對設籍台北市且領有重大傷病證明的市民，提供醫療費用、看護費用等補助。",
      status: "eligible",
      priority: "medium",
      icon: <Building className="h-5 w-5 text-blue-600" />,
    },
    {
      id: "gov-5",
      category: "政府補助",
      subcategory: "縣市級",
      title: "新北市身心障礙者醫療輔助器具補助",
      organization: "新北市政府",
      eligibility: "設籍新北市且領有身心障礙證明者",
      amount: "依輔具項目不同，最高補助50,000元",
      deadline: "常年受理",
      matchedConditions: ["腦中風"],
      details: "針對設籍新北市且領有身心障礙證明的市民，提供醫療輔助器具費用補助。",
      status: "eligible",
      priority: "medium",
      icon: <Building className="h-5 w-5 text-blue-600" />,
    },
    {
      id: "gov-6",
      category: "政府補助",
      subcategory: "區里級",
      title: "中正區獨居長者關懷服務",
      organization: "台北市中正區公所",
      eligibility: "設籍中正區且獨居的65歲以上長者",
      amount: "免費關懷服務",
      deadline: "常年受理",
      matchedConditions: ["慢性阻塞性肺病", "慢性腎臟病第三期"],
      details: "針對設籍中正區且獨居的65歲以上長者，提供定期關懷訪視、電話問安、緊急救援等服務。",
      status: "eligible",
      priority: "low",
      icon: <Users className="h-5 w-5 text-blue-600" />,
    },

    // B. 企業福利資源
    {
      id: "corp-1",
      category: "企業福利",
      subcategory: "員工福利",
      title: "台積電員工重大疾病補助",
      organization: "台積電",
      eligibility: "台積電正職員工",
      amount: "最高200,000元",
      deadline: "常年受理",
      matchedConditions: ["乳癌第二期"],
      details: "針對罹患重大疾病的台積電正職員工，提供醫療費用補助、有薪病假等福利。",
      status: "eligible",
      priority: "high",
      icon: <Building className="h-5 w-5 text-green-600" />,
    },
    {
      id: "corp-2",
      category: "企業福利",
      subcategory: "員工福利",
      title: "國泰金控員工醫療互助金",
      organization: "國泰金控",
      eligibility: "國泰金控及子公司員工",
      amount: "依疾病類型不同，最高100,000元",
      deadline: "常年受理",
      matchedConditions: ["心肌梗塞"],
      details: "針對罹患特定疾病的國泰金控及子公司員工，提供醫療互助金。",
      status: "eligible",
      priority: "medium",
      icon: <Building className="h-5 w-5 text-green-600" />,
    },
    {
      id: "corp-3",
      category: "企業福利",
      subcategory: "企業社會責任",
      title: "遠東集團癌症患者家庭支持計畫",
      organization: "遠東集團",
      eligibility: "癌症患者及其家庭",
      amount: "每戶最高50,000元",
      deadline: "每年3月、9月受理",
      matchedConditions: ["乳癌第二期"],
      details: "針對癌症患者及其家庭，提供經濟支持、心理諮商、家庭照顧等服務。",
      status: "eligible",
      priority: "medium",
      icon: <Building className="h-5 w-5 text-green-600" />,
    },

    // C. 保單匹配的理賠
    {
      id: "ins-1",
      category: "保單理賠",
      subcategory: "醫療險",
      title: "住院醫療保險理賠",
      organization: "國泰人壽",
      eligibility: "投保國泰人壽安心醫療保險者",
      amount: "每日最高3,000元，最多給付180天",
      deadline: "事故發生後2年內",
      matchedConditions: ["乳癌第二期", "心肌梗塞", "腦中風", "腦瘤"],
      details: "被保險人因疾病或傷害住院診療時，按住院日數給付住院日額保險金。",
      status: "eligible",
      priority: "high",
      icon: <Shield className="h-5 w-5 text-teal-600" />,
    },
    {
      id: "ins-2",
      category: "保單理賠",
      subcategory: "重疾險",
      title: "重大疾病保險理賠",
      organization: "新光人壽",
      eligibility: "投保新光人壽重大疾病保險者",
      amount: "1,000,000元",
      deadline: "診斷確定後1年內",
      matchedConditions: ["乳癌第二期", "心肌梗塞", "腦中風", "腦瘤"],
      details: "被保險人經診斷確定罹患保單約定的重大疾病時，給付重大疾病保險金。",
      status: "eligible",
      priority: "high",
      icon: <Shield className="h-5 w-5 text-teal-600" />,
    },
    {
      id: "ins-3",
      category: "保單理賠",
      subcategory: "醫療險",
      title: "手術醫療保險理賠",
      organization: "國泰人壽",
      eligibility: "投保國泰人壽安心醫療保險者",
      amount: "依手術類別不同，最高100,000元",
      deadline: "事故發生後2年內",
      matchedConditions: ["乳癌第二期", "心肌梗塞", "骨折", "腦瘤"],
      details: "被保險人因疾病或傷害住院診療並接受手術時，給付手術醫療保險金。",
      status: "eligible",
      priority: "high",
      icon: <Shield className="h-5 w-5 text-teal-600" />,
    },

    // D. 特殊金融產品的保障
    {
      id: "fin-1",
      category: "金融產品",
      subcategory: "信用卡",
      title: "國泰世華卡頂級卡醫療保障",
      organization: "國泰世華銀行",
      eligibility: "國泰世華無限卡持卡人",
      amount: "最高200,000元",
      deadline: "事故發生後30天內",
      matchedConditions: ["意外傷害", "骨折"],
      details: "持卡人因意外傷害住院診療時，提供住院醫療保險金、手術醫療保險金等保障。",
      status: "eligible",
      priority: "medium",
      icon: <CreditCard className="h-5 w-5 text-purple-600" />,
    },
    {
      id: "fin-2",
      category: "金融產品",
      subcategory: "信用卡",
      title: "台新卡海外醫療保障",
      organization: "台新銀行",
      eligibility: "台新銀行鈦金卡以上等級持卡人",
      amount: "最高500,000元",
      deadline: "事故發生後30天內",
      matchedConditions: ["意外傷害"],
      details: "持卡人於海外因意外傷害或疾病住院診療時，提供海外醫療保險金。",
      status: "eligible",
      priority: "low",
      icon: <CreditCard className="h-5 w-5 text-purple-600" />,
    },
    {
      id: "fin-3",
      category: "金融產品",
      subcategory: "保金產品",
      title: "中國信託退休金保障計畫",
      organization: "中國信託銀行",
      eligibility: "中國信託退休金保障計畫參與者",
      amount: "依參與計畫不同，最高1,000,000元",
      deadline: "事故發生後1年內",
      matchedConditions: ["重度憂鬱症", "慢性腎臟病第三期"],
      details: "參與者因特定疾病無法工作時，提供退休金保障。",
      status: "eligible",
      priority: "medium",
      icon: <CreditCard className="h-5 w-5 text-purple-600" />,
    },

    // E. 無法理賠時的消費者保護或司法救助
    {
      id: "legal-1",
      category: "法律救助",
      subcategory: "消費者保護",
      title: "保險申訴調解服務",
      organization: "金融監督管理委員會",
      eligibility: "保險理賠爭議當事人",
      amount: "免費調解服務",
      deadline: "保險公司理賠決定後60天內",
      matchedConditions: ["理賠爭議"],
      details: "針對保險理賠爭議，提供申訴調解服務，協助消費者與保險公司達成和解。",
      status: "conditional",
      priority: "low",
      icon: <Scale className="h-5 w-5 text-red-600" />,
    },
    {
      id: "legal-2",
      category: "法律救助",
      subcategory: "司法救助",
      title: "法律扶助基金會醫療糾紛協助",
      organization: "法律扶助基金會",
      eligibility: "符合特定收入條件者",
      amount: "免費法律諮詢、補助律師費用",
      deadline: "事件發生後2年內",
      matchedConditions: ["醫療糾紛"],
      details: "針對醫療糾紛，提供免費法律諮詢、補助律師費用等服務。",
      status: "conditional",
      priority: "low",
      icon: <Scale className="h-5 w-5 text-red-600" />,
    },
  ]

  // 過濾資源
  const filteredResources = resources.filter((resource) => {
    // 搜尋詞過濾
    const searchMatch =
      searchTerm === "" ||
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.details.toLowerCase().includes(searchTerm.toLowerCase())

    // 狀態過濾
    const statusMatch = filterStatus === "all" || resource.status === filterStatus

    // 分類過濾
    const categoryMatch =
      activeTab === "all" ||
      (activeTab === "government" && resource.category === "政府補助") ||
      (activeTab === "corporate" && resource.category === "企業福利") ||
      (activeTab === "insurance" && resource.category === "保單理賠") ||
      (activeTab === "financial" && resource.category === "金融產品") ||
      (activeTab === "legal" && resource.category === "法律救助")

    return searchMatch && statusMatch && categoryMatch
  })

  // 按優先級排序
  const sortedResources = [...filteredResources].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">一鍵AI找保障</h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">智能分析您的病歷，匹配各類可申請的補助與理賠資源</p>
        </div>
      </div>

      <Tabs value={mainFeature} onValueChange={setMainFeature} className="mb-8">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="quick-search" className="text-base py-3">
            <Search className="h-4 w-4 mr-2" />
            快速搜尋
          </TabsTrigger>
          <TabsTrigger value="ai-match" className="text-base py-3">
            <Brain className="h-4 w-4 mr-2" />
            AI自動比對
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quick-search">
          <QuickSearchContent
            quickSearchTerm={quickSearchTerm}
            setQuickSearchTerm={setQuickSearchTerm}
            quickSearchResults={quickSearchResults}
            setQuickSearchResults={setQuickSearchResults}
            isSearching={isSearching}
            setIsSearching={setIsSearching}
          />
        </TabsContent>

        <TabsContent value="ai-match">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            {!isAnalyzing && !analysisComplete && (
              <Button onClick={startAnalysis} className="gap-2 bg-blue-600 hover:bg-blue-700">
                <Brain className="h-4 w-4" />
                開始AI資源分析
              </Button>
            )}
            {analysisComplete && (
              <Button onClick={resetAnalysis} variant="outline" className="gap-2">
                <Search className="h-4 w-4" />
                重新分析
              </Button>
            )}
          </div>

          {isAnalyzing && (
            <Card className="mb-8">
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-center">
                    <Sparkles className="h-10 w-10 text-blue-600 animate-pulse" />
                  </div>
                  <h2 className="text-xl font-bold text-center">AI正在分析您的病歷與保單資料</h2>
                  <p className="text-center text-gray-500">
                    我們正在智能匹配各類資源，包括政府補助、企業福利、保單理賠等，請稍候...
                  </p>
                  <Progress value={analysisProgress} className="h-2" />
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-center text-sm">
                    <div className={`${analysisProgress >= 20 ? "text-blue-600 font-medium" : "text-gray-400"}`}>
                      分析病歷資料
                    </div>
                    <div className={`${analysisProgress >= 40 ? "text-blue-600 font-medium" : "text-gray-400"}`}>
                      匹配政府補助
                    </div>
                    <div className={`${analysisProgress >= 60 ? "text-blue-600 font-medium" : "text-gray-400"}`}>
                      匹配企業福利
                    </div>
                    <div className={`${analysisProgress >= 80 ? "text-blue-600 font-medium" : "text-gray-400"}`}>
                      匹配保單理賠
                    </div>
                    <div className={`${analysisProgress >= 100 ? "text-blue-600 font-medium" : "text-gray-400"}`}>
                      生成資源報告
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {analysisComplete && (
            <>
              <Alert className="mb-6 bg-blue-50 border-blue-200">
                <Brain className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-600">AI分析完成</AlertTitle>
                <AlertDescription>
                  根據您的12筆病歷記錄，我們找到了20項可能符合條件的資源，包括政府補助、企業福利、保單理賠等。請查看下方詳細資訊。
                </AlertDescription>
              </Alert>

              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="搜尋資源..."
                      className="w-full pl-10 pr-4 py-2 border rounded-md"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    className="px-3 py-2 border rounded-md"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">所有狀態</option>
                    <option value="eligible">符合條件</option>
                    <option value="conditional">條件性符合</option>
                    <option value="ineligible">不符合條件</option>
                  </select>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    更多篩選
                  </Button>
                </div>
              </div>

              <Tabs defaultValue="all" className="w-full" value={activeTab} onValueChange={setActiveTab}>
                <div className="overflow-x-auto">
                  <TabsList className="mb-4">
                    <TabsTrigger value="all">全部資源</TabsTrigger>
                    <TabsTrigger value="government">政府補助</TabsTrigger>
                    <TabsTrigger value="corporate">企業福利</TabsTrigger>
                    <TabsTrigger value="insurance">保單理賠</TabsTrigger>
                    <TabsTrigger value="financial">金融產品</TabsTrigger>
                    <TabsTrigger value="legal">法律救助</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="all" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-blue-600" />
                            <h3 className="font-medium">政府補助資源</h3>
                          </div>
                          <Badge className="bg-blue-600">6項</Badge>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Building className="h-5 w-5 text-green-600" />
                            <h3 className="font-medium">企業福利資源</h3>
                          </div>
                          <Badge className="bg-green-600">3項</Badge>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-teal-50 border-teal-200">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-teal-600" />
                            <h3 className="font-medium">保單理賠資源</h3>
                          </div>
                          <Badge className="bg-teal-600">3項</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-xl font-bold">推薦資源</h2>
                    <Badge className="bg-blue-600">高優先級</Badge>
                  </div>

                  <div className="space-y-4">
                    {sortedResources
                      .filter((resource) => resource.priority === "high")
                      .map((resource) => (
                        <ResourceCard key={resource.id} resource={resource} />
                      ))}
                  </div>

                  <Separator className="my-6" />

                  <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-xl font-bold">其他符合資源</h2>
                    <Badge variant="outline">中低優先級</Badge>
                  </div>

                  <div className="space-y-4">
                    {sortedResources
                      .filter((resource) => resource.priority !== "high")
                      .map((resource) => (
                        <ResourceCard key={resource.id} resource={resource} />
                      ))}
                  </div>
                </TabsContent>

                <TabsContent value="government" className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-xl font-bold">政府補助資源</h2>
                    <Badge className="bg-blue-600">
                      {sortedResources.filter((r) => r.category === "政府補助").length}項
                    </Badge>
                  </div>
                  {sortedResources
                    .filter((resource) => resource.category === "政府補助")
                    .map((resource) => (
                      <ResourceCard key={resource.id} resource={resource} />
                    ))}
                </TabsContent>

                <TabsContent value="corporate" className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-xl font-bold">企業福利資源</h2>
                    <Badge className="bg-green-600">
                      {sortedResources.filter((r) => r.category === "企業福利").length}項
                    </Badge>
                  </div>
                  {sortedResources
                    .filter((resource) => resource.category === "企業福利")
                    .map((resource) => (
                      <ResourceCard key={resource.id} resource={resource} />
                    ))}
                </TabsContent>

                <TabsContent value="insurance" className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-xl font-bold">保單理賠資源</h2>
                    <Badge className="bg-teal-600">
                      {sortedResources.filter((r) => r.category === "保單理賠").length}項
                    </Badge>
                  </div>
                  {sortedResources
                    .filter((resource) => resource.category === "保單理賠")
                    .map((resource) => (
                      <ResourceCard key={resource.id} resource={resource} />
                    ))}
                </TabsContent>

                <TabsContent value="financial" className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-xl font-bold">金融產品保障</h2>
                    <Badge className="bg-purple-600">
                      {sortedResources.filter((r) => r.category === "金融產品").length}項
                    </Badge>
                  </div>
                  {sortedResources
                    .filter((resource) => resource.category === "金融產品")
                    .map((resource) => (
                      <ResourceCard key={resource.id} resource={resource} />
                    ))}
                </TabsContent>

                <TabsContent value="legal" className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-xl font-bold">法律救助資源</h2>
                    <Badge className="bg-red-600">
                      {sortedResources.filter((r) => r.category === "法律救助").length}項
                    </Badge>
                  </div>
                  {sortedResources
                    .filter((resource) => resource.category === "法律救助")
                    .map((resource) => (
                      <ResourceCard key={resource.id} resource={resource} />
                    ))}
                </TabsContent>
              </Tabs>
            </>
          )}

          {!isAnalyzing && !analysisComplete && (
            <Card className="mb-8">
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-center">
                    <Brain className="h-10 w-10 text-gray-400" />
                  </div>
                  <h2 className="text-xl font-bold text-center">讓AI幫您找到最適合的資源</h2>
                  <p className="text-center text-gray-500">
                    我們將分析您的病歷與保單資料，智能匹配各類資源，包括政府補助、企業福利、保單理賠等。
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium mb-2 flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        已匯入的資料
                      </h3>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          12筆病歷記錄
                        </li>
                        <li className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          4份保險保單
                        </li>
                        <li className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          1份企業員工資料
                        </li>
                      </ul>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium mb-2 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-amber-600" />
                        建議補充的資料
                      </h3>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          信用卡資訊（可能有額外保障）
                        </li>
                        <li className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          家庭成員資訊（可能有家庭補助）
                        </li>
                      </ul>
                    </div>
                  </div>
                  <Button onClick={startAnalysis} className="w-full gap-2 bg-blue-600 hover:bg-blue-700">
                    <Brain className="h-4 w-4" />
                    開始AI資源分析
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// 快速搜尋內容組件
function QuickSearchContent({
  quickSearchTerm,
  setQuickSearchTerm,
  quickSearchResults,
  setQuickSearchResults,
  isSearching,
  setIsSearching,
}) {
  // 使用useRef來跟踪當前的搜尋詞，避免閉包問題
  const currentSearchTermRef = useRef(quickSearchTerm)

  // 當搜尋詞變化時更新ref
  useEffect(() => {
    currentSearchTermRef.current = quickSearchTerm
  }, [quickSearchTerm])

  // 模擬搜尋結果
  const nonCoveredTreatments = [
    {
      id: "treatment-1",
      name: "達文西機器人手術",
      description: "使用達文西手術系統進行的微創手術，提供更精確的手術操作和更快的恢復時間。",
      averageCost: "150,000 - 350,000元",
      category: "手術",
      icon: <Stethoscope className="h-5 w-5 text-blue-600" />,
      matchedResources: [
        {
          id: "ins-special-1",
          category: "保單理賠",
          title: "特定手術醫療保險理賠",
          organization: "國泰人壽",
          amount: "最高可理賠80%，約120,000 - 280,000元",
          status: "eligible",
        },
        {
          id: "fin-special-1",
          category: "金融產品",
          title: "醫療貸款專案",
          organization: "台新銀行",
          amount: "最高可貸款500,000元，年利率2.7%起",
          status: "eligible",
        },
      ],
    },
    {
      id: "treatment-2",
      name: "質子治療",
      description: "使用質子束進行的放射治療，相比傳統放射治療對周圍健康組織的傷害更小。",
      averageCost: "800,000 - 1,200,000元",
      category: "癌症治療",
      icon: <Zap className="h-5 w-5 text-amber-600" />,
      matchedResources: [
        {
          id: "ins-special-2",
          category: "保單理賠",
          title: "癌症特定治療保險理賠",
          organization: "新光人壽",
          amount: "最高可理賠1,000,000元",
          status: "eligible",
        },
        {
          id: "gov-special-1",
          category: "政府補助",
          title: "癌症特殊治療補助計畫",
          organization: "衛生福利部",
          amount: "最高可補助300,000元",
          status: "conditional",
        },
      ],
    },
    {
      id: "treatment-3",
      name: "免疫細胞療法",
      description: "使用患者自身免疫細胞對抗癌症的治療方法，如CAR-T細胞療法等。",
      averageCost: "1,500,000 - 3,000,000元",
      category: "癌症治療",
      icon: <Zap className="h-5 w-5 text-amber-600" />,
      matchedResources: [
        {
          id: "ins-special-3",
          category: "保單理賠",
          title: "創新癌症治療保險理賠",
          organization: "富邦人壽",
          amount: "最高可理賠2,000,000元",
          status: "eligible",
        },
      ],
    },
    {
      id: "treatment-4",
      name: "特殊抗癌藥物 (如Keytruda)",
      description: "新型免疫檢查點抑制劑，可幫助免疫系統對抗癌細胞。",
      averageCost: "每次治療約150,000元，通常需多次治療",
      category: "藥物",
      icon: <Pill className="h-5 w-5 text-green-600" />,
      matchedResources: [
        {
          id: "ins-special-4",
          category: "保單理賠",
          title: "特殊藥物保險理賠",
          organization: "南山人壽",
          amount: "每次治療最高可理賠100,000元",
          status: "eligible",
        },
        {
          id: "corp-special-1",
          category: "企業福利",
          title: "員工重大疾病用藥補助",
          organization: "台積電",
          amount: "每年最高補助500,000元",
          status: "conditional",
        },
      ],
    },
    {
      id: "treatment-5",
      name: "人工關節置換",
      description: "使用高品質人工關節材料進行關節置換手術。",
      averageCost: "150,000 - 250,000元",
      category: "手術",
      icon: <Stethoscope className="h-5 w-5 text-blue-600" />,
      matchedResources: [
        {
          id: "ins-special-5",
          category: "保單理賠",
          title: "特定手術醫療保險理賠",
          organization: "國泰人壽",
          amount: "最高可理賠70%，約105,000 - 175,000元",
          status: "eligible",
        },
      ],
    },
    {
      id: "treatment-6",
      name: "微創脊椎手術",
      description: "使用特殊器材進行的微創脊椎手術，恢復時間較短。",
      averageCost: "200,000 - 300,000元",
      category: "手術",
      icon: <Stethoscope className="h-5 w-5 text-blue-600" />,
      matchedResources: [
        {
          id: "ins-special-6",
          category: "保單理賠",
          title: "特定手術醫療保險理賠",
          organization: "富邦人壽",
          amount: "最高可理賠60%，約120,000 - 180,000元",
          status: "eligible",
        },
      ],
    },
    {
      id: "treatment-7",
      name: "新型心臟支架",
      description: "使用可吸收式或藥物塗層的新型心臟支架。",
      averageCost: "80,000 - 150,000元",
      category: "醫材",
      icon: <Heart className="h-5 w-5 text-red-600" />,
      matchedResources: [
        {
          id: "ins-special-7",
          category: "保單理賠",
          title: "心臟疾病特殊醫材理賠",
          organization: "新光人壽",
          amount: "最高可理賠90%，約72,000 - 135,000元",
          status: "eligible",
        },
      ],
    },
    {
      id: "treatment-8",
      name: "高階人工水晶體",
      description: "白內障手術中使用的多焦點或散光矯正人工水晶體。",
      averageCost: "60,000 - 120,000元 (雙眼)",
      category: "醫材",
      icon: <Eye className="h-5 w-5 text-indigo-600" />,
      matchedResources: [
        {
          id: "ins-special-8",
          category: "保單理賠",
          title: "特殊醫材保險理賠",
          organization: "國泰人壽",
          amount: "最高可理賠50%，約30,000 - 60,000元",
          status: "eligible",
        },
      ],
    },
  ]

  // 執行搜尋的函數
  const executeSearch = (searchTerm) => {
    console.log(`執行搜尋: "${searchTerm}"`)

    // 如果搜尋詞為空，不執行搜尋
    if (!searchTerm.trim()) {
      setIsSearching(false)
      return
    }

    // 設置搜尋中狀態
    setIsSearching(true)

    // 清空之前的結果
    setQuickSearchResults([])

    // 模擬搜尋延遲
    setTimeout(() => {
      const term = searchTerm.trim().toLowerCase()

      // 更精確的搜尋邏輯
      const results = nonCoveredTreatments.filter((treatment) => {
        const nameLower = treatment.name.toLowerCase()
        const descLower = treatment.description.toLowerCase()
        const categoryLower = treatment.category.toLowerCase()

        // 精確匹配名稱
        if (nameLower === term) return true

        // 名稱包含搜尋詞
        if (nameLower.includes(term)) return true

        // 描述或分類包含搜尋詞
        if (descLower.includes(term) || categoryLower.includes(term)) return true

        return false
      })

      console.log(`搜尋詞: "${term}", 找到結果: ${results.length}`)

      // 更新搜尋結果
      setQuickSearchResults(results)
      setIsSearching(false)
    }, 800)
  }

  // 處理搜尋按鈕點擊
  const handleSearch = () => {
    executeSearch(currentSearchTermRef.current)
  }

  // 當按下Enter鍵時搜尋
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      executeSearch(currentSearchTermRef.current)
    }
  }

  // 處理推薦搜尋詞點擊
  const handleSuggestionClick = (suggestion) => {
    console.log(`點擊推薦詞: "${suggestion}"`)

    // 先更新搜尋詞
    setQuickSearchTerm(suggestion)
    currentSearchTermRef.current = suggestion

    // 清空之前的結果
    setQuickSearchResults([])

    // 延遲執行搜尋，確保狀態已更新
    setTimeout(() => {
      executeSearch(suggestion)
    }, 100)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <Search className="h-10 w-10 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-center">快速搜尋健保不給付項目</h2>
            <p className="text-center text-gray-500">
              請輸入各種自費診療方式、醫材等健保不給付內容，我們將為您分析可能的保障資源
            </p>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="例如：達文西手術、質子治療、特殊抗癌藥..."
                  className="w-full pl-10 pr-4 py-3 border rounded-md"
                  value={quickSearchTerm}
                  onChange={(e) => setQuickSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <Button onClick={handleSearch} className="gap-2 bg-blue-600 hover:bg-blue-700">
                <Search className="h-4 w-4" />
                搜尋
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {["達文西手術", "質子治療", "特殊抗癌藥", "人工關節"].map((suggestion) => (
                <Button key={suggestion} variant="outline" size="sm" onClick={() => handleSuggestionClick(suggestion)}>
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {isSearching && (
        <div className="flex justify-center py-12">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-500">搜尋中...</p>
          </div>
        </div>
      )}

      {!isSearching && quickSearchResults.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-lg font-bold">搜尋結果 ({quickSearchResults.length})</h3>

          {quickSearchResults.map((treatment) => (
            <Card key={treatment.id} className="overflow-hidden">
              <CardHeader className="pb-2 bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      {treatment.icon}
                      <CardTitle className="text-lg">{treatment.name}</CardTitle>
                    </div>
                    <CardDescription>{treatment.category}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-gray-700 mb-4">{treatment.description}</p>

                <div className="flex items-start gap-2 mb-4">
                  <FileText className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">平均費用</p>
                    <p className="text-sm text-gray-500">{treatment.averageCost}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-sm">可能的保障資源：</h4>

                  {treatment.matchedResources.map((resource) => (
                    <div
                      key={resource.id}
                      className={`p-3 rounded-md border ${
                        resource.category === "保單理賠"
                          ? "bg-teal-50 border-teal-200"
                          : resource.category === "政府補助"
                            ? "bg-blue-50 border-blue-200"
                            : "bg-green-50 border-green-200"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            {resource.category === "保單理賠" ? (
                              <Shield className="h-4 w-4 text-teal-600" />
                            ) : resource.category === "政府補助" ? (
                              <Building className="h-4 w-4 text-blue-600" />
                            ) : (
                              <Building className="h-4 w-4 text-green-600" />
                            )}
                            <p className="font-medium text-sm">{resource.title}</p>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{resource.organization}</p>
                        </div>
                        <Badge className={resource.status === "eligible" ? "bg-green-600" : "bg-amber-600"}>
                          {resource.status === "eligible" ? "符合條件" : "條件性符合"}
                        </Badge>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm">
                          <span className="font-medium">可能理賠/補助：</span> {resource.amount}
                        </p>
                      </div>
                      <div className="mt-2 flex justify-end">
                        <Link href={`/ai-resources/${resource.id}`}>
                          <Button size="sm" variant="outline" className="text-xs">
                            查看詳情
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 新增「聽聽大家怎麼說」按鈕 */}
                <div className="mt-6 flex justify-center">
                  <Link href={`/ai-resources/analysis/${treatment.id}`} target="_blank">
                    <Button className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-md">
                      <MessageSquare className="h-4 w-4" />
                      聽聽大家怎麼說
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isSearching && quickSearchTerm && quickSearchResults.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileSearch className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">未找到相關結果</h3>
          <p className="text-gray-500 max-w-md">
            我們未能找到與「{quickSearchTerm}」相關的健保不給付項目。請嘗試其他關鍵詞，或使用更一般性的術語。
          </p>
        </div>
      )}

      {!isSearching && !quickSearchTerm && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-blue-600" />
                特殊手術
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                  <Button variant="link" className="p-0 h-auto" onClick={() => handleSuggestionClick("達文西手術")}>
                    達文西機器人手術
                  </Button>
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                  <Button variant="link" className="p-0 h-auto" onClick={() => handleSuggestionClick("微創脊椎手術")}>
                    微創脊椎手術
                  </Button>
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                  <Button variant="link" className="p-0 h-auto" onClick={() => handleSuggestionClick("人工關節置換")}>
                    人工關節置換
                  </Button>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-600" />
                癌症治療
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                  <Button variant="link" className="p-0 h-auto" onClick={() => handleSuggestionClick("質子治療")}>
                    質子治療
                  </Button>
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                  <Button variant="link" className="p-0 h-auto" onClick={() => handleSuggestionClick("免疫細胞療法")}>
                    免疫細胞療法
                  </Button>
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                  <Button variant="link" className="p-0 h-auto" onClick={() => handleSuggestionClick("特殊抗癌藥")}>
                    特殊抗癌藥物
                  </Button>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-600" />
                特殊醫材
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                  <Button variant="link" className="p-0 h-auto" onClick={() => handleSuggestionClick("新型心臟支架")}>
                    新型心臟支架
                  </Button>
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                  <Button variant="link" className="p-0 h-auto" onClick={() => handleSuggestionClick("高階人工水晶體")}>
                    高階人工水晶體
                  </Button>
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                  <Button variant="link" className="p-0 h-auto" onClick={() => handleSuggestionClick("特殊義肢")}>
                    特殊義肢
                  </Button>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

// 資源卡片元件
function ResourceCard({ resource }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case "eligible":
        return <Badge className="bg-green-600">符合條件</Badge>
      case "conditional":
        return <Badge className="bg-amber-600">條件性符合</Badge>
      case "ineligible":
        return <Badge variant="destructive">不符合條件</Badge>
      default:
        return null
    }
  }

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "high":
        return (
          <Badge variant="outline" className="bg-white border-blue-200 text-blue-600">
            高優先
          </Badge>
        )
      case "medium":
        return (
          <Badge variant="outline" className="bg-white border-amber-200 text-amber-600">
            中優先
          </Badge>
        )
      case "low":
        return (
          <Badge variant="outline" className="bg-white border-gray-200 text-gray-600">
            低優先
          </Badge>
        )
      default:
        return null
    }
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case "政府補助":
        return "bg-blue-50 border-blue-200"
      case "企業福利":
        return "bg-green-50 border-green-200"
      case "保單理賠":
        return "bg-teal-50 border-teal-200"
      case "金融產品":
        return "bg-purple-50 border-purple-200"
      case "法律救助":
        return "bg-red-50 border-red-200"
      default:
        return ""
    }
  }

  return (
    <Card className={`overflow-hidden ${getCategoryColor(resource.category)}`}>
      <CardHeader className="pb-2">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              {resource.icon}
              <CardTitle className="text-lg md:text-xl">{resource.title}</CardTitle>
              {getStatusBadge(resource.status)}
            </div>
            <CardDescription>
              {resource.organization} · {resource.subcategory}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {getPriorityBadge(resource.priority)}
            <Link href={`/ai-resources/${resource.id}`}>
              <Button variant="ghost" size="sm" className="gap-1">
                <FileSearch className="h-4 w-4" />
                詳情
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <p className="text-sm font-medium">補助/理賠金額</p>
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
        <div className="mt-4">
          <p className="text-sm text-gray-700">{resource.details}</p>
        </div>
      </CardContent>
      <CardFooter className="bg-white bg-opacity-50 border-t">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center w-full gap-4">
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-500">
              匹配病歷: {resource.matchedConditions.length > 0 ? resource.matchedConditions.join(", ") : "無匹配病歷"}
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <Button size="sm" variant="outline" className="gap-1 w-full md:w-auto">
              <Download className="h-3 w-3" />
              下載申請表
            </Button>
            <Link href={`/ai-resources/apply/${resource.id}`} className="w-full md:w-auto">
              <Button
                size="sm"
                className={`w-full ${
                  resource.category === "政府補助"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : resource.category === "企業福利"
                      ? "bg-green-600 hover:bg-green-700"
                      : resource.category === "保單理賠"
                        ? "bg-teal-600 hover:bg-teal-700"
                        : resource.category === "金融產品"
                          ? "bg-purple-600 hover:bg-purple-700"
                          : "bg-red-600 hover:bg-red-700"
                }`}
              >
                申請資源
              </Button>
            </Link>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
