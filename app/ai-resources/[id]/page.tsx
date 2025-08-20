"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  FileText,
  Users,
  Clock,
  Download,
  ChevronLeft,
  CheckCircle2,
  Shield,
  Building,
  CreditCard,
  Scale,
  AlertCircle,
  HelpCircle,
  FileCheck,
  Stethoscope,
  Globe,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
} from "lucide-react"

export default function ResourceDetailPage({ params }) {
  const [resource, setResource] = useState(null)
  const [loading, setLoading] = useState(true)
  const [detailedAnalysis, setDetailedAnalysis] = useState(null)
  const [analysisLoading, setAnalysisLoading] = useState(false)

  useEffect(() => {
    // 嘗試從 sessionStorage 或 localStorage 讀取搜尋結果
    const loadResourceData = () => {
      try {
        // 從快速搜尋結果中查找
        const quickSearchResults = sessionStorage.getItem('quickSearchResults')
        console.log('📦 sessionStorage 原始資料:', quickSearchResults)
        if (quickSearchResults) {
          let results
          try {
            results = JSON.parse(quickSearchResults)
            console.log('從 sessionStorage 讀取搜尋結果:', results)
          } catch (parseError) {
            console.error('JSON 解析失敗:', parseError)
            throw new Error('搜尋結果格式錯誤')
          }
          
          // 確保 results 是陣列
          if (!Array.isArray(results)) {
            console.warn('搜尋結果不是陣列格式:', results)
            throw new Error('搜尋結果格式錯誤')
          }
          
          // 查找匹配的資源
          console.log('🔍 開始查找資源 ID:', params.id)
          for (const result of results) {
            if (result && result.matchedResources && Array.isArray(result.matchedResources)) {
              console.log('📋 檢查搜尋結果:', result.name)
              console.log('📊 匹配資源數量:', result.matchedResources.length)
              console.log('🆔 所有資源 ID:', result.matchedResources.map(r => r.id))
              
              const foundResource = result.matchedResources.find(r => r && r.id === params.id)
              if (foundResource) {
                console.log('找到匹配的資源:', foundResource)
                // 補充詳細資訊
                const detailedResource = {
                  ...foundResource,
                  searchTerm: result.name || '未知',
                  searchDescription: result.description || '無描述',
                  estimatedCost: result.averageCost || result.estimatedCost || '無法取得費用資訊',
                  costSource: result.costSource || '系統估算',
                  website: foundResource.website || generateWebsiteFromOrganization(foundResource.organization || ''),
                  phone: foundResource.phone || generatePhoneFromOrganization(foundResource.organization || ''),
                  email: foundResource.email || generateEmailFromOrganization(foundResource.organization || ''),
                  address: foundResource.address || generateAddressFromOrganization(foundResource.organization || ''),
                  applicationProcess: Array.isArray(foundResource.applicationProcess) ? foundResource.applicationProcess : generateApplicationProcess(foundResource.category || ''),
                  requiredDocuments: Array.isArray(foundResource.requiredDocuments) ? foundResource.requiredDocuments : generateRequiredDocuments(foundResource.category || ''),
                  processingTime: foundResource.processingTime || "約2-4週",
                  faqs: Array.isArray(foundResource.faqs) ? foundResource.faqs : generateFAQs(foundResource.category || '', foundResource.title || ''),
                  matchedMedicalRecords: Array.isArray(foundResource.matchedMedicalRecords) ? foundResource.matchedMedicalRecords : [],
                  webResources: result.webResources || []
                }
                setResource(detailedResource)
                setLoading(false)
                
                // 啟動第二次AI分析（更詳細的資訊）
                loadDetailedAnalysis(detailedResource, result.name || '未知')
                return
              }
            }
          }
        }

        // 如果沒有從搜尋結果找到，嘗試生成基於ID的預設資料
        console.log('❌ 未找到搜尋結果，嘗試解析ID並生成相應資料:', params.id)
        
        // 檢查是否是已知的ID格式，嘗試生成對應的測試資料
        if (params.id?.includes('government-') || params.id?.includes('financial-') || params.id?.includes('charity-')) {
          console.log('🔧 檢測到AI搜尋ID，生成對應的測試資料')
          setResource(generateTestResourceFromId(params.id))
        } else {
          console.log('🔧 使用通用預設資源')
          setResource(generateDefaultResource(params.id))
        }
        setLoading(false)
      } catch (error) {
        console.error('載入資源資料失敗:', error)
        setResource(generateDefaultResource(params.id))
        setLoading(false)
      }
    }

    loadResourceData()
  }, [params.id])

  // 載入詳細AI分析
  const loadDetailedAnalysis = async (resourceData, searchTerm) => {
    if (!resourceData || !searchTerm || searchTerm === "未知") {
      console.log('跳過詳細分析，資料不完整:', { resourceData: !!resourceData, searchTerm })
      return
    }
    
    setAnalysisLoading(true)
    try {
      const apiKey = localStorage.getItem('openai_api_key') || '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'

      console.log('🔍 開始第二次AI分析 - 詳細資源分析')
      const { OpenAIService } = await import('../../../lib/openaiService')
      const openaiService = new OpenAIService(apiKey)
      
      // 檢查方法是否存在
      if (typeof openaiService.analyzeResourceDetails !== 'function') {
        console.warn('analyzeResourceDetails 方法不存在，跳過詳細分析')
        setAnalysisLoading(false)
        return
      }
      
      const analysis = await openaiService.analyzeResourceDetails(resourceData, searchTerm)
      console.log('✅ 詳細分析完成:', analysis)
      
      if (analysis) {
        setDetailedAnalysis(analysis)
      }
    } catch (error) {
      console.error('❌ 詳細分析失敗:', error)
      // 不要拋出錯誤，只是記錄並繼續
    } finally {
      setAnalysisLoading(false)
    }
  }

  // 根據ID生成測試資源（模擬AI搜尋結果）
  const generateTestResourceFromId = (id) => {
    const idString = String(id);
    
    if (idString.includes('government-')) {
      return {
        id: idString,
        category: "政府補助",
        subcategory: "中央政府",
        title: "重大傷病醫療費用補助",
        organization: "衛生福利部中央健康保險署",
        eligibility: "持有重大傷病證明卡者",
        amount: "依醫療費用核實給付，每年最高50萬元",
        deadline: "常年受理",
        matchedConditions: ["重大疾病", "慢性病"],
        details: "針對重大傷病患者提供醫療費用補助，包括住院費、手術費、藥物費等。申請人需持有有效的重大傷病證明卡，並符合相關條件。",
        status: "eligible",
        priority: "high",
        searchTerm: "政府醫療補助",
        searchDescription: "政府提供的醫療費用補助方案",
        estimatedCost: "最高50萬元補助",
        costSource: "政府補助方案",
        website: "https://www.nhi.gov.tw",
        phone: "0800-030-598",
        email: "service@nhi.gov.tw",
        address: "台北市信義區市府路6號",
        applicationProcess: [
          "準備重大傷病證明卡",
          "填寫補助申請表",
          "檢附醫療費用收據",
          "向健保署提出申請",
          "等待審核結果"
        ],
        requiredDocuments: [
          "重大傷病證明卡影本",
          "身分證明文件",
          "醫療費用收據正本",
          "診斷證明書",
          "申請表"
        ],
        processingTime: "約15-30個工作天",
        faqs: [
          {
            question: "如何申請重大傷病證明卡？",
            answer: "需由醫師診斷確認符合重大傷病範圍，填寫申請表後送健保署審核。"
          },
          {
            question: "補助範圍包括哪些？",
            answer: "包括住院費、手術費、藥物費、復健費等與重大傷病相關的醫療費用。"
          }
        ],
        matchedMedicalRecords: []
      }
    } else if (idString.includes('financial-')) {
      return {
        id: idString,
        category: "金融產品",
        subcategory: "醫療貸款",
        title: "台灣銀行醫療專案貸款",
        organization: "台灣銀行",
        eligibility: "年滿20歲，有穩定收入者",
        amount: "最高300萬元",
        deadline: "常年受理",
        matchedConditions: ["醫療費用", "手術費用"],
        details: "提供醫療費用專案貸款，利率優惠，還款期限彈性。適用於各種醫療支出，包括手術費、住院費、復健費等。",
        status: "eligible",
        priority: "medium",
        searchTerm: "醫療貸款",
        searchDescription: "銀行提供的醫療費用貸款方案",
        estimatedCost: "年利率2.5%起",
        costSource: "台灣銀行公告利率",
        website: "https://www.bot.com.tw",
        phone: "02-2394-8888",
        email: "service@bot.com.tw",
        address: "台北市中正區重慶南路一段120號",
        applicationProcess: [
          "準備財力證明文件",
          "填寫貸款申請書",
          "提供醫療費用相關證明",
          "銀行審核評估",
          "核准後撥款"
        ],
        requiredDocuments: [
          "身分證明文件",
          "收入證明",
          "醫療費用證明",
          "貸款申請書",
          "保證人資料（如需要）"
        ],
        processingTime: "約5-7個工作天",
        faqs: [
          {
            question: "申請需要保證人嗎？",
            answer: "視申請金額和個人信用狀況而定，部分情況下可能需要保證人。"
          },
          {
            question: "可以提前還款嗎？",
            answer: "可以，提前還款不收取違約金，但需事先通知銀行。"
          }
        ],
        matchedMedicalRecords: []
      }
    } else if (idString.includes('charity-')) {
      return {
        id: idString,
        category: "公益資源",
        subcategory: "醫療基金會",
        title: "癌症希望基金會醫療補助",
        organization: "癌症希望基金會",
        eligibility: "癌症病友及其家屬",
        amount: "依個案需求評估，最高10萬元",
        deadline: "常年受理",
        matchedConditions: ["癌症", "惡性腫瘤"],
        details: "提供癌症病友醫療費用補助、心理支持、營養諮詢等服務。協助病友及家屬度過治療期間的經濟困難。",
        status: "eligible",
        priority: "high",
        searchTerm: "癌症醫療補助",
        searchDescription: "癌症病友的醫療費用補助",
        estimatedCost: "最高10萬元補助",
        costSource: "基金會補助方案",
        website: "https://www.hope.org.tw",
        phone: "02-3322-6286",
        email: "service@hope.org.tw",
        address: "台北市大安區復興南路二段55號",
        applicationProcess: [
          "聯絡基金會社工",
          "填寫補助申請表",
          "提供醫療診斷證明",
          "家庭經濟狀況評估",
          "補助金額核定與撥付"
        ],
        requiredDocuments: [
          "診斷證明書",
          "醫療費用收據",
          "戶籍謄本",
          "收入證明",
          "申請表"
        ],
        processingTime: "約10-14個工作天",
        faqs: [
          {
            question: "誰可以申請補助？",
            answer: "確診癌症的病友及其直系親屬，且符合經濟困難條件者。"
          },
          {
            question: "補助可以重複申請嗎？",
            answer: "可以，但需間隔一定期間，且總補助金額有上限。"
          }
        ],
        matchedMedicalRecords: []
      }
    }
    
    // 如果都不匹配，返回通用預設資源
    return generateDefaultResource(id);
  }

  // 生成預設資源（當無法找到真實搜尋結果時）
  const generateDefaultResource = (id) => {
    return {
      id: id,
      category: "搜尋結果",
      subcategory: "智能搜尋",
      title: "未找到詳細資源資料",
      organization: "系統提示",
      eligibility: "請返回重新搜尋",
      amount: "無法取得資料",
      deadline: "請確認搜尋結果",
      matchedConditions: [],
      details: "很抱歉，無法載入此資源的詳細資料。可能是因為：1) 您沒有從搜尋頁面正常進入此頁面，2) 搜尋結果已過期，或 3) 系統發生錯誤。請返回搜尋頁面重新搜尋。",
      status: "unknown",
      priority: "medium",
      searchTerm: "未知",
      searchDescription: "無法載入搜尋資料",
      website: "#",
      phone: "無資料",
      email: "無資料", 
      address: "無資料",
      applicationProcess: ["請返回搜尋頁面重新搜尋"],
      requiredDocuments: ["無資料"],
      processingTime: "無資料",
      matchedMedicalRecords: [],
      faqs: [
        {
          question: "為什麼看不到詳細資料？",
          answer: "請確保您是從搜尋結果頁面正常點擊「查看詳情」進入此頁面。如果問題持續，請重新搜尋。"
        }
      ]
    }
  }

  // 輔助函數：根據機構生成網站
  const generateWebsiteFromOrganization = (organization) => {
    const orgMap = {
      "衛生福利部": "https://www.mohw.gov.tw",
      "國泰人壽": "https://www.cathaylife.com.tw",
      "新光人壽": "https://www.skl.com.tw",
      "富邦人壽": "https://www.fubon.com",
      "台積電": "https://www.tsmc.com",
      "國泰金控": "https://www.cathayholdings.com"
    }
    return orgMap[organization] || `https://www.google.com/search?q=${encodeURIComponent(organization)}`
  }

  // 輔助函數：根據機構生成電話
  const generatePhoneFromOrganization = (organization) => {
    const phoneMap = {
      "衛生福利部": "1957",
      "國泰人壽": "0800-036-599", 
      "新光人壽": "0800-031-115",
      "富邦人壽": "0800-009-888",
      "台積電": "03-568-8888",
      "國泰金控": "02-2383-1000"
    }
    return phoneMap[organization] || "請洽詢該機構"
  }

  // 輔助函數：根據機構生成 Email
  const generateEmailFromOrganization = (organization) => {
    const emailMap = {
      "衛生福利部": "service@mohw.gov.tw",
      "國泰人壽": "service@cathaylife.com.tw",
      "新光人壽": "service@skl.com.tw", 
      "富邦人壽": "service@fubon.com",
      "台積電": "hr@tsmc.com",
      "國泰金控": "service@cathayholdings.com"
    }
    return emailMap[organization] || "請洽詢該機構"
  }

  // 輔助函數：根據機構生成地址
  const generateAddressFromOrganization = (organization) => {
    const addressMap = {
      "衛生福利部": "台北市南港區忠孝東路517號",
      "國泰人壽": "台北市大安區仁愛路四段296號",
      "新光人壽": "台北市信義區松仁路36號",
      "富邦人壽": "台北市中山區中山北路二段50號",
      "台積電": "新竹市力行路8號",
      "國泰金控": "台北市信義區松仁路7號"
    }
    return addressMap[organization] || "請洽詢該機構官網"
  }

  // 輔助函數：根據類別生成申請流程
  const generateApplicationProcess = (category) => {
    switch (category) {
      case "政府補助":
        return [
          "準備身分證明文件",
          "準備相關醫療證明文件",
          "填寫申請表格",
          "檢附所需文件",
          "提交申請（線上或臨櫃）"
        ]
      case "保單理賠":
        return [
          "聯絡保險公司客服",
          "填寫理賠申請書",
          "準備醫療相關文件",
          "提交理賠申請",
          "等待保險公司審核"
        ]
      case "企業福利":
        return [
          "確認申請資格",
          "聯絡HR部門",
          "填寫申請表單",
          "提供相關證明文件",
          "等待審核結果"
        ]
      default:
        return ["請洽詢相關機構了解詳細申請流程"]
    }
  }

  // 輔助函數：根據類別生成所需文件
  const generateRequiredDocuments = (category) => {
    switch (category) {
      case "政府補助":
        return [
          "身分證正反面影本",
          "戶籍謄本",
          "醫療診斷證明",
          "醫療費用收據",
          "存摺封面影本",
          "申請表"
        ]
      case "保單理賠":
        return [
          "保險單正本或影本",
          "理賠申請書",
          "醫療診斷證明書",
          "醫療費用收據正本",
          "身分證明文件",
          "其他相關證明文件"
        ]
      case "企業福利":
        return [
          "員工證或在職證明",
          "申請表單",
          "醫療相關證明",
          "其他指定文件"
        ]
      default:
        return ["請洽詢相關機構了解所需文件"]
    }
  }

  // 輔助函數：根據類別和標題生成 FAQ
  const generateFAQs = (category, title) => {
    const commonFAQs = [
      {
        question: "申請需要多長時間？",
        answer: "一般申請處理時間為2-4週，實際時間依個案情況而定。"
      },
      {
        question: "如果申請被拒絕怎麼辦？",
        answer: "可以了解拒絕原因，補件後重新申請，或透過申訴管道處理。"
      },
      {
        question: "可以線上申請嗎？",
        answer: "部分機構提供線上申請服務，詳情請洽詢該機構官網或客服。"
      }
    ]

    if (category === "保單理賠") {
      return [
        {
          question: "理賠申請有時間限制嗎？",
          answer: "一般建議在事故發生後儘速申請，通常需在2年內提出申請。"
        },
        {
          question: "理賠金額如何計算？",
          answer: "依保單條款約定，結合實際醫療費用和保險金額計算。"
        },
        ...commonFAQs
      ]
    }

    return commonFAQs
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (!resource) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">找不到資源</h1>
          <p className="text-gray-500 mb-4">請返回搜尋頁面重新搜尋</p>
          <Link href="/ai-resources">
            <Button>返回搜尋</Button>
          </Link>
        </div>
      </div>
    )
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
        return "bg-gray-50 border-gray-200"
    }
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case "政府補助":
        return <Shield className="h-5 w-5 text-blue-600" />
      case "企業福利":
        return <Building className="h-5 w-5 text-green-600" />
      case "保單理賠":
        return <Shield className="h-5 w-5 text-teal-600" />
      case "金融產品":
        return <CreditCard className="h-5 w-5 text-purple-600" />
      case "法律救助":
        return <Scale className="h-5 w-5 text-red-600" />
      default:
        return <FileText className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "eligible":
        return <Badge className="bg-green-600">符合條件</Badge>
      case "conditional":
        return <Badge className="bg-amber-600">條件性符合</Badge>
      case "ineligible":
        return <Badge variant="destructive">不符合條件</Badge>
      default:
        return <Badge variant="outline">狀態未知</Badge>
    }
  }

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

      {/* 搜尋資訊顯示 */}
      {resource.searchTerm && resource.searchTerm !== "未知" && (
        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-600">搜尋結果詳情</AlertTitle>
          <AlertDescription>
            您搜尋的是「{resource.searchTerm}」，以下是AI分析找到的相關資源詳細資訊。
            {resource.estimatedCost && (
              <><br />💰 預估費用：{resource.estimatedCost}</>
            )}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className={`${getCategoryColor(resource.category)}`}>
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {getCategoryIcon(resource.category)}
                <Badge variant="outline" className="bg-white">
                  {resource.category} - {resource.subcategory}
                </Badge>
                {getStatusBadge(resource.status)}
              </div>
              <CardTitle className="text-2xl">{resource.title}</CardTitle>
              <CardDescription className="text-base">{resource.organization}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="flex items-start gap-2">
                  <Users className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium">申請資格</p>
                    <p className="text-gray-600">{resource.eligibility}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium">補助金額</p>
                    <p className="text-gray-600">{resource.amount}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium">申請期限</p>
                    <p className="text-gray-600">{resource.deadline}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-lg">詳細說明</h3>
                <p className="text-gray-700">{resource.details}</p>

                <h3 className="font-medium text-lg pt-4">申請流程</h3>
                <ol className="space-y-2 pl-5 list-decimal text-gray-700">
                  {Array.isArray(resource.applicationProcess) ? resource.applicationProcess.map((step, index) => (
                    <li key={index}>{step}</li>
                  )) : (
                    <li>{resource.applicationProcess || "請洽詢相關機構了解詳細申請流程"}</li>
                  )}
                </ol>

                <h3 className="font-medium text-lg pt-4">所需文件</h3>
                <ul className="space-y-2 text-gray-700">
                  {Array.isArray(resource.requiredDocuments) ? resource.requiredDocuments.map((doc, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      {doc}
                    </li>
                  )) : (
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      {resource.requiredDocuments || "請洽詢相關機構了解所需文件"}
                    </li>
                  )}
                </ul>

                <div className="pt-4">
                  <h3 className="font-medium text-lg">處理時間</h3>
                  <p className="text-gray-700">{resource.processingTime}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-white bg-opacity-50 border-t flex-col items-start gap-4">
              {Array.isArray(resource.matchedMedicalRecords) && resource.matchedMedicalRecords.length > 0 && (
                <div className="w-full">
                  <h3 className="font-medium mb-2">匹配的病歷記錄</h3>
                  <div className="space-y-2">
                    {resource.matchedMedicalRecords.map((record) => (
                      <div key={record.id} className="flex items-start gap-2 p-3 bg-white rounded-md border">
                        <Stethoscope className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">
                            {record.hospital} - {record.department}
                          </p>
                          <p className="text-sm text-gray-500">
                            診斷: {record.diagnosis} ({record.date})
                          </p>
                        </div>
                        <Link href={`/medical-records/${record.id}`} className="ml-auto">
                          <Button variant="ghost" size="sm" className="h-8">
                            查看
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <Button variant="outline" className="gap-2 flex-1">
                  <Download className="h-4 w-4" />
                  下載申請表
                </Button>
                <Link href={`/ai-resources/apply/${resource.id}`} className="flex-1">
                  <Button className="w-full gap-2 bg-blue-600 hover:bg-blue-700">
                    <FileCheck className="h-4 w-4" />
                    開始申請
                  </Button>
                </Link>
              </div>
            </CardFooter>
          </Card>

          {/* AI詳細分析區塊 */}
          {(detailedAnalysis || analysisLoading) && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  AI專業分析
                </CardTitle>
                {analysisLoading && (
                  <p className="text-sm text-blue-600">🤖 AI正在分析詳細申請策略...</p>
                )}
              </CardHeader>
              {detailedAnalysis && (
                <CardContent className="space-y-6">
                  {/* 詳細分析 */}
                  <div>
                    <h4 className="font-medium text-lg mb-2">🎯 專業分析</h4>
                    <div className="bg-white rounded-lg p-4 border">
                      <p className="text-gray-700 leading-relaxed">{detailedAnalysis.detailedAnalysis}</p>
                    </div>
                  </div>

                  {/* 申請策略 */}
                  <div>
                    <h4 className="font-medium text-lg mb-2">📋 申請策略</h4>
                    <div className="bg-white rounded-lg p-4 border">
                      <p className="text-gray-700 leading-relaxed">{detailedAnalysis.applicationStrategy}</p>
                    </div>
                  </div>

                  {/* 風險評估 */}
                  <div>
                    <h4 className="font-medium text-lg mb-2">⚠️ 風險評估</h4>
                    <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                      <p className="text-gray-700 leading-relaxed">{detailedAnalysis.riskAssessment}</p>
                    </div>
                  </div>

                  {/* 申請時程 */}
                  {Array.isArray(detailedAnalysis.timeline) && detailedAnalysis.timeline.length > 0 && (
                    <div>
                      <h4 className="font-medium text-lg mb-2">📅 申請時程</h4>
                      <div className="space-y-3">
                        {detailedAnalysis.timeline.map((stage, index) => (
                          <div key={index} className="bg-white rounded-lg p-4 border">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium">{stage.stage}</h5>
                              <Badge variant="outline">{stage.duration}</Badge>
                            </div>
                            {Array.isArray(stage.tasks) && stage.tasks.length > 0 && (
                              <ul className="list-disc list-inside text-sm text-gray-600 mb-2">
                                {stage.tasks.map((task, taskIndex) => (
                                  <li key={taskIndex}>{task}</li>
                                ))}
                              </ul>
                            )}
                            {stage.tips && (
                              <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded">{stage.tips}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 替代方案 */}
                  {Array.isArray(detailedAnalysis.alternativeOptions) && detailedAnalysis.alternativeOptions.length > 0 && (
                    <div>
                      <h4 className="font-medium text-lg mb-2">🔄 替代方案</h4>
                      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <ul className="space-y-2">
                          {detailedAnalysis.alternativeOptions.map((option, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700">{option}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>常見問題</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.isArray(resource.faqs) ? resource.faqs.map((faq, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start gap-2 mb-2">
                      <HelpCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="font-medium">{faq.question}</p>
                    </div>
                    <p className="text-gray-700 pl-7">{faq.answer}</p>
                  </div>
                )) : (
                  <div className="border rounded-lg p-4">
                    <div className="flex items-start gap-2 mb-2">
                      <HelpCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="font-medium">如何申請？</p>
                    </div>
                    <p className="text-gray-700 pl-7">請洽詢相關機構了解詳細申請流程和常見問題。</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>聯絡資訊</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-2">
                  <Globe className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">
                      {resource.websites && resource.websites.length > 1 ? "相關網站" : "官方網站"}
                    </p>
                    <div className="space-y-1">
                      {resource.websites && resource.websites.length > 0 ? (
                        resource.websites.map((website, index) => (
                          <a
                            key={index}
                            href={website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline block text-sm break-all"
                          >
                            {website}
                          </a>
                        ))
                      ) : resource.website ? (
                        <a
                          href={resource.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline block text-sm break-all"
                        >
                          {resource.website}
                        </a>
                      ) : (
                        <span className="text-gray-400 text-sm">暫無網站資訊</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Phone className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium">服務電話</p>
                    <p className="text-gray-600">{resource.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Mail className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium">電子郵件</p>
                    <p className="text-gray-600">{resource.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium">地址</p>
                    <p className="text-gray-600">{resource.address}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 相關網路資源 */}
          {resource.webResources && Array.isArray(resource.webResources) && resource.webResources.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-600" />
                  相關網路資源
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {resource.webResources.filter(webResource => webResource && typeof webResource === 'object').map((webResource, index) => (
                    <div key={index} className="p-4 rounded-lg border border-blue-200 bg-blue-50/30 hover:bg-blue-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <ExternalLink className="h-4 w-4 text-blue-600" />
                            <h4 className="font-medium text-blue-900">{webResource.title || '未知標題'}</h4>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{webResource.description || '無描述'}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>來源: {webResource.organization || webResource.source || '未知來源'}</span>
                            {webResource.category && (
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                {webResource.category}
                              </Badge>
                            )}
                          </div>
                        </div>
                        {webResource.url ? (
                          <a 
                            href={webResource.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="ml-4"
                          >
                            <Button size="sm" variant="outline" className="gap-1 border-blue-200 text-blue-700 hover:bg-blue-50">
                              前往查看
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </a>
                        ) : webResource.isSuggestion ? (
                          <div className="ml-4 text-xs text-gray-500">
                            <div className="font-medium mb-1">🔍 搜尋建議</div>
                            {webResource.searchKeywords && (
                              <div className="text-blue-600 font-mono text-xs bg-blue-50 px-2 py-1 rounded">
                                {webResource.searchKeywords}
                              </div>
                            )}
                            <div className="mt-1 text-xs text-gray-500">
                              {webResource.suggestedAction}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">💡 小提示：</span>
                    這些連結是透過AI智能搜尋找到的相關資源，建議您進一步查看詳細資訊以確認申請條件。
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>申請小提示</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className="bg-amber-50 border-amber-200">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-600">注意事項</AlertTitle>
                <AlertDescription>
                  申請前請先確認您符合申請資格，並準備好所有必要文件的正本及影本。
                </AlertDescription>
              </Alert>

              <div className="mt-4 space-y-2">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">最佳申請時間：</span>週一至週五 9:00-12:00，人潮較少
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">文件準備技巧：</span>
                  建議將所有文件依照申請表順序排列，並使用迴紋針或資料夾整理，以加速審核流程
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">申請追蹤：</span>
                  提交申請後，可使用申請案號查詢進度，或撥打服務專線查詢
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}