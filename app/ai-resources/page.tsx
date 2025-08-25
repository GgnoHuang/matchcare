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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  ChevronDown,
  MessageSquare,
  ExternalLink,
  Key,
  Upload,
  Check,
} from "lucide-react"
import UploadZone, { UploadedFile } from "@/components/ui/upload-zone"
import FileSelector, { SelectedFileData } from "@/components/ui/file-selector"
import { OpenAIService, CaseData, ResourceItem, MedicalAnalysisResult } from "@/lib/openaiService"
import { checkAuth } from "@/app/actions/auth-service"
import { userDataService } from "@/lib/storage"
import { getUserPolicies as getSupabasePolicies, getUserMedicalRecords } from "@/lib/supabaseDataService"
import { supabaseConfig } from "@/lib/supabase"

function AIResourcesPage() {
  // 主要功能切換狀態
  const [mainFeature, setMainFeature] = useState("quick-search")

  // AI自動比對相關狀態
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [isAnalysisReportCollapsed, setIsAnalysisReportCollapsed] = useState(false)

  // AI 分析相關狀態
  const [apiKey, setApiKey] = useState("") // 將從帳號設定讀取
  const [selectedMedicalFile, setSelectedMedicalFile] = useState<SelectedFileData | null>(null)
  const [selectedPolicyFile, setSelectedPolicyFile] = useState<SelectedFileData | null>(null)
  const [selectedDiagnosisFile, setSelectedDiagnosisFile] = useState<SelectedFileData | null>(null)
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string | null>(null)
  const [aiGeneratedResources, setAiGeneratedResources] = useState<ResourceItem[]>([])
  // 已移除analysisMode - 只使用真實模式
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<{ id: string, name: string } | null>(null)

  // 快速搜尋相關狀態
  const [quickSearchTerm, setQuickSearchTerm] = useState("")
  const [quickSearchResults, setQuickSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  
  // 手術技術對應搜尋狀態
  const [surgicalTechResult, setSurgicalTechResult] = useState(null)
  const [expandedTechniques, setExpandedTechniques] = useState(new Set())
  const [techniqueDetailsCache, setTechniqueDetailsCache] = useState(new Map())
  const [loadingTechniques, setLoadingTechniques] = useState(new Set())

  // Supabase 病歷資料
  const [availableMedicalRecords, setAvailableMedicalRecords] = useState<any[]>([])
  const [isLoadingMedicalRecords, setIsLoadingMedicalRecords] = useState(false)
  const [selectedMedicalRecordId, setSelectedMedicalRecordId] = useState<string | null>(null)

  // 檢查用戶登入狀態並載入API Key
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { isLoggedIn, user } = await checkAuth()
        if (isLoggedIn && user) {
          setUser(user)
        }
      } catch (error) {
        console.error('獲取用戶資訊失敗:', error)
      }
    }
    fetchUser()
  }, [])

  // 當用戶登入後載入病歷資料
  useEffect(() => {
    if (user?.phoneNumber) {
      loadUserMedicalRecords()
    }
  }, [user])

  // 載入用戶病歷資料（與病歷管理頁面相同的邏輯）
  const loadUserMedicalRecords = async () => {
    if (!user?.phoneNumber) return

    setIsLoadingMedicalRecords(true)
    try {
      console.log('載入用戶病歷資料，用戶電話:', user.phoneNumber)
      
      // 透過 Supabase API 搜尋用戶資料（與病歷管理頁面相同）
      const apiUrl = `${supabaseConfig.baseUrl}/users_basic?select=*,medical_records(*)&phonenumber=eq.${user.phoneNumber}`
      const response = await fetch(apiUrl, {
        headers: {
          'apikey': supabaseConfig.apiKey,
          'Authorization': `Bearer ${supabaseConfig.apiKey}`
        }
      })
      
      if (!response.ok) {
        throw new Error(`API 請求失敗: ${response.status}`)
      }
      
      const userData = await response.json()
      console.log('AI比對頁面 - API 返回用戶資料:', userData)
      
      // 提取病歷記錄
      const rawRecords = userData[0]?.medical_records || []
      console.log('AI比對頁面 - 提取的病歷記錄:', rawRecords)
      
      // 將原始病歷記錄直接存儲，供選擇使用
      setAvailableMedicalRecords(rawRecords)
      console.log('AI比對頁面 - 病歷載入成功:', rawRecords.length, '筆')
    } catch (error) {
      console.error('載入病歷資料失敗:', error)
      setAvailableMedicalRecords([])
    } finally {
      setIsLoadingMedicalRecords(false)
    }
  }

  // 已移除模擬分析進度 - 改用真實AI分析進度

  // 開始分析
  const startAnalysis = async () => {
    try {
      setError(null)
      setIsAnalyzing(true)
      setAnalysisProgress(0)
      setAnalysisComplete(false)
      setAiAnalysisResult(null)

      // 只使用真實 AI 分析模式
      await performRealAIAnalysis()
    } catch (error) {
      console.error('分析啟動失敗:', error)
      setError('分析啟動失敗，請稍後再試')
      setIsAnalyzing(false)
    }
  }

  // 真實 AI 分析
  const performRealAIAnalysis = async () => {
    console.log("開始真實 AI 分析...")
    
    // 檢查API Key（從環境變數讀取）
    const storedApiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY
    console.log("API Key 存在:", !!storedApiKey)
    console.log("選擇的病歷檔案:", selectedMedicalFile)
    if (!storedApiKey) {
      setError("未設定 OpenAI API Key 環境變數")
      setIsAnalyzing(false)
      return
    }

    // 病歷必填
    if (!selectedMedicalFile && !selectedMedicalRecordId) {
      setError("請選擇一張病歷文件")
      setIsAnalyzing(false)
      return
    }

    try {
      const openaiService = new OpenAIService(storedApiKey)

      console.log("第1步：載入用戶保單資料...")
      setAnalysisProgress(20)
      
      // 載入用戶所有保單
      console.log('當前用戶資訊:', user)
      if (!user?.phoneNumber) {
        setError("無法取得用戶資訊，請重新登入")
        setIsAnalyzing(false)
        return
      }

      console.log('正在載入保單，電話號碼:', user.phoneNumber)
      const policiesResult = await getSupabasePolicies(user.phoneNumber)
      console.log('保單載入結果:', JSON.stringify(policiesResult, null, 2))
      
      // 檢查是否是 API 調用失敗
      if (policiesResult && !policiesResult.success) {
        setError(`載入保單失敗: ${policiesResult.error || '未知錯誤'}`)
        setIsAnalyzing(false)
        return
      }
      
      // 檢查是否返回的是空陣列（表示沒有保單）
      if (!policiesResult || !policiesResult.policies || policiesResult.policies.length === 0) {
        setError("您尚未上傳任何保單，請先到保單管理頁面上傳保單")
        setIsAnalyzing(false)
        return
      }

      console.log(`✅ 載入了 ${policiesResult.policies.length} 張保單`)
      
      console.log("第2步：準備病歷資料...")
      setAnalysisProgress(40)
      
      // 準備選中的病歷資料
      let selectedMedicalRecord: any

      if (selectedMedicalRecordId) {
        // 使用 Supabase 的病歷資料
        const medicalRecord = availableMedicalRecords.find(record => record.id === selectedMedicalRecordId)
        if (!medicalRecord) {
          setError("找不到選中的病歷記錄")
          setIsAnalyzing(false)
          return
        }

        selectedMedicalRecord = {
          fileName: medicalRecord.file_name || `病歷_${medicalRecord.id}`,
          recordData: {
            diagnosis: medicalRecord.medical_data?.diagnosis || '診斷處理中',
            treatment: medicalRecord.medical_data?.treatment || '治療記錄處理中',
            symptoms: medicalRecord.medical_data?.symptoms || medicalRecord.medical_data?.chiefComplaint || '症狀記錄處理中',
            visitDate: medicalRecord.medical_data?.visitDate || medicalRecord.upload_date,
            hospitalName: medicalRecord.medical_data?.hospitalName || '未知醫院'
          },
          textContent: medicalRecord.text_content || '',
          originalData: medicalRecord
        }
        
        console.log('使用 Supabase 病歷:', selectedMedicalRecord)
      } else if (selectedMedicalFile) {
        // 使用新上傳的文件
        selectedMedicalRecord = {
          fileName: selectedMedicalFile.fileName || 'selected-medical.txt',
          recordData: {}
        }

        // 從選中的文件中提取內容
        if (selectedMedicalFile.fileType === 'pdf' && selectedMedicalFile.textContent) {
          selectedMedicalRecord.textContent = selectedMedicalFile.textContent
          selectedMedicalRecord.recordData = {
            diagnosis: selectedMedicalFile.textContent.substring(0, 100) + "...",
            treatment: "依據病歷內容分析",
            symptoms: "依據病歷內容分析"
          }
        } else if (selectedMedicalFile.fileType === 'image') {
          selectedMedicalRecord.recordData = {
            diagnosis: "請從圖片中分析診斷",
            treatment: "請從圖片中分析治療方案", 
            symptoms: "請從圖片中分析症狀"
          }
          selectedMedicalRecord.imageBase64 = selectedMedicalFile.imageBase64
        }
      }

      console.log("第3步：提取病歷關鍵資訊...")
      setAnalysisProgress(40)
      
      // 從病歷中提取搜尋關鍵詞
      const searchTerm = selectedMedicalRecord.recordData?.diagnosis || 
                        selectedMedicalRecord.recordData?.symptoms || 
                        "醫療保險理賠"

      console.log("第4步：綜合搜尋保單匹配...")
      setAnalysisProgress(60)
      
      // 使用原本的 comprehensiveSearch 方法
      const comprehensiveResults = await openaiService.comprehensiveSearch(
        searchTerm,
        policiesResult.policies, 
        [selectedMedicalRecord]
      )

      console.log(`✅ 綜合搜尋完成`)
      console.log('個人保單匹配結果:', comprehensiveResults.personalPolicyResults)
      console.log('網路資源:', comprehensiveResults.networkResources)

      console.log("第5步：整理所有結果...")
      setAnalysisProgress(80)
      
      const allResources = [
        ...comprehensiveResults.personalPolicyResults,
        ...comprehensiveResults.networkResources
      ]
      
      setAiGeneratedResources(allResources)

      // 生成分析報告
      const analysisReport = `## 🔍 AI 綜合分析報告

### 分析概況
- **分析病歷文件**: ${selectedMedicalRecord.fileName}
- **載入保單數量**: ${policiesResult.policies.length} 張
- **搜尋關鍵詞**: ${searchTerm}
- **分析模式**: 病歷與保單智能匹配

### 資源搜尋結果
- **個人保單匹配**: ${comprehensiveResults.personalPolicyResults.length} 項
- **網路醫療資源**: ${comprehensiveResults.networkResources.length} 項
- **總計可用資源**: ${allResources.length} 項

### 費用估算
- **預估費用**: ${comprehensiveResults.estimatedCost}
- **費用來源**: ${comprehensiveResults.costSource}

### 建議優先級
${allResources.filter(r => r.priority === 'high').length > 0 ? 
  `**高優先級**: ${allResources.filter(r => r.priority === 'high').map(r => r.title).join('、')}` : 
  '無高優先級項目'}

### 分析說明
AI 已成功分析您的病歷文件，並與所有保單和醫療資源進行智能比對。建議您優先處理高優先級的項目。

請查看下方詳細的資源清單和申請指引。`

      setAiAnalysisResult(analysisReport)
      setAnalysisProgress(100)
      
      setTimeout(() => {
        setAnalysisComplete(true)
        setIsAnalyzing(false)
      }, 500)

    } catch (err) {
      console.error('AI 分析失敗:', err)
      setError((err as Error).message)
      setIsAnalyzing(false)
    }
  }

  // 已移除演示模式

  // 重置分析
  const resetAnalysis = () => {
    setAnalysisComplete(false)
    setAnalysisProgress(0)
    setAiAnalysisResult(null)
    setAiGeneratedResources([])
    setError(null)
  }

  // 病歷檔案選擇處理
  const handleMedicalFileSelected = (fileData: SelectedFileData | null) => {
    setSelectedMedicalFile(fileData)
    setError(null)
  }

  // 保單檔案選擇處理
  const handlePolicyFileSelected = (fileData: SelectedFileData | null) => {
    setSelectedPolicyFile(fileData)
    setError(null)
  }

  // 診斷證明檔案選擇處理
  const handleDiagnosisFileSelected = (fileData: SelectedFileData | null) => {
    setSelectedDiagnosisFile(fileData)
    setError(null)
  }

  // 檔案選擇錯誤處理
  const handleFileError = (errorMessage: string) => {
    setError(errorMessage)
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

  // 只顯示真實AI生成的資源
  const getCurrentResources = () => {
    if (analysisComplete && aiGeneratedResources.length > 0) {
      return aiGeneratedResources
    }
    return []
  }

  // 過濾資源
  const filteredResources = getCurrentResources().filter((resource) => {
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

  // 獲取資源統計
  const getResourceStats = () => {
    const currentResources = getCurrentResources()
    return {
      government: currentResources.filter(r => r.category === "政府補助").length,
      corporate: currentResources.filter(r => r.category === "企業福利").length,
      insurance: currentResources.filter(r => r.category === "保單理賠").length,
      financial: currentResources.filter(r => r.category === "金融產品").length,
      legal: currentResources.filter(r => r.category === "法律救助").length
    }
  }

  const resourceStats = getResourceStats()

  // 手術技術對應搜尋功能
  // 從localStorage獲取用戶保單資料
  const getUserPolicies = () => {
    try {
      if (!user?.id) {
        console.log('❌ 快速搜尋 - 用戶未登入，無法讀取保單資料')
        return []
      }
      
      const storageKey = `matchcare_${user.id}_insurance_policies`
      const policies = localStorage.getItem(storageKey)
      const parsedPolicies = policies ? JSON.parse(policies) : []
      
      console.log(`🔍 快速搜尋 - 讀取用戶保單資料 (${parsedPolicies.length} 筆)`)
      return parsedPolicies
    } catch (error) {
      console.error('讀取保單資料失敗:', error)
      return []
    }
  }

  // 第一階段：手術技術對應搜尋
  const executeSurgicalTechSearch = async (searchTerm: string) => {
    console.log(`🏥 執行手術技術對應搜尋: "${searchTerm}"`)

    if (!searchTerm.trim()) {
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    setSurgicalTechResult(null)
    setExpandedTechniques(new Set())
    setTechniqueDetailsCache(new Map())
    
    try {
      // 獲取OpenAI API Key（從環境變數）
      const storedApiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY
      const openaiService = new (await import('../../lib/openaiService')).OpenAIService(storedApiKey)
      
      // 第一階段：只進行手術技術對應分析（1次API調用）
      const result = await openaiService.quickSearchSurgicalTech(searchTerm)
      
      console.log('手術技術對應結果:', result)
      setSurgicalTechResult(result)
      
    } catch (error: any) {
      console.error('手術技術搜尋失敗:', error)
      
      // 如果是API Key問題，給出更明確的指引
      if (error.message?.includes('API 金鑰')) {
        alert('請先到「設定」頁面輸入您的 OpenAI API 金鑰才能使用搜尋功能')
      }
    } finally {
      setIsSearching(false)
    }
  }

  // 第二階段：詳細技術搜尋（當用戶點擊特定技術時）
  const executeTechniqueDetailSearch = async (techniqueId: string, techniqueName: string) => {
    console.log(`🔍 執行詳細技術搜尋: ${techniqueName} (${techniqueId})`)
    
    // 檢查緩存
    if (techniqueDetailsCache.has(techniqueId)) {
      console.log('使用緩存的詳細搜尋結果')
      return
    }

    // 設置loading狀態
    const newLoadingTechniques = new Set(loadingTechniques)
    newLoadingTechniques.add(techniqueId)
    setLoadingTechniques(newLoadingTechniques)

    try {
      // 獲取用戶保單資料
      const userPolicies = getUserPolicies()
      
      // 獲取OpenAI API Key（從環境變數）
      const storedApiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY
      const openaiService = new (await import('../../lib/openaiService')).OpenAIService(storedApiKey)
      
      // 第二階段：詳細搜尋
      const result = await openaiService.searchTechniqueDetails(
        surgicalTechResult?.searchTerm || '', 
        techniqueName, 
        userPolicies
      )
      
      console.log('詳細技術搜尋結果:', result)
      
      // 更新緩存
      const newCache = new Map(techniqueDetailsCache)
      newCache.set(techniqueId, result)
      setTechniqueDetailsCache(newCache)
      
    } catch (error: any) {
      console.error('詳細技術搜尋失敗:', error)
    } finally {
      // 移除loading狀態
      const finalLoadingTechniques = new Set(loadingTechniques)
      finalLoadingTechniques.delete(techniqueId)
      setLoadingTechniques(finalLoadingTechniques)
    }
  }

  // 處理技術項目的展開/收起
  const toggleTechniqueExpansion = async (techniqueId: string, techniqueName: string) => {
    const newExpanded = new Set(expandedTechniques)
    
    if (expandedTechniques.has(techniqueId)) {
      // 收起
      newExpanded.delete(techniqueId)
      setExpandedTechniques(newExpanded)
    } else {
      // 展開並觸發詳細搜尋
      newExpanded.add(techniqueId)
      setExpandedTechniques(newExpanded) // 先設置展開狀態，讓loading進度條能顯示
      await executeTechniqueDetailSearch(techniqueId, techniqueName)
    }
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">一鍵AI找保障</h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">智能分析您的病歷，自動匹配所有保單的理賠機會</p>
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
            user={user}
            surgicalTechResult={surgicalTechResult}
            expandedTechniques={expandedTechniques}
            techniqueDetailsCache={techniqueDetailsCache}
            loadingTechniques={loadingTechniques}
            executeSurgicalTechSearch={executeSurgicalTechSearch}
            executeTechniqueDetailSearch={executeTechniqueDetailSearch}
            toggleTechniqueExpansion={toggleTechniqueExpansion}
            getUserPolicies={getUserPolicies}
          />
        </TabsContent>

        <TabsContent value="ai-match">
          {/* 模式選擇和設定區域 */}
          {!isAnalyzing && !analysisComplete && (
            <div className="space-y-6 mb-8">
              {/* AI 真實分析設定 */}
                <div className="space-y-4">
                  

                  {/* 病歷選擇區域 */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">病歷文件選擇（限選一張）</CardTitle>
                      <CardDescription>
                        選擇一張已上傳的病歷或醫療文件，AI 將自動與您所有的保單進行智能匹配分析
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {isLoadingMedicalRecords ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                          <span className="ml-2 text-sm text-gray-500">載入病歷資料中...</span>
                        </div>
                      ) : availableMedicalRecords.length > 0 ? (
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {availableMedicalRecords.map((record) => (
                            <Card 
                              key={record.id} 
                              className={`cursor-pointer transition-all ${
                                selectedMedicalRecordId === record.id 
                                  ? 'ring-2 ring-blue-500 bg-blue-50' 
                                  : 'hover:shadow-md'
                              }`}
                              onClick={() => setSelectedMedicalRecordId(record.id)}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h4 className="font-medium text-sm">
                                      {record.file_name || `病歷 ${record.id}`}
                                    </h4>
                                    <p className="text-xs text-gray-500 mt-1">
                                      診斷: {record.medical_data?.diagnosis || '處理中'} | 
                                      醫院: {record.medical_data?.hospitalName || '未知醫院'} | 
                                      日期: {record.upload_date ? new Date(record.upload_date).toLocaleDateString('zh-TW') : '未知'}
                                    </p>
                                  </div>
                                  {selectedMedicalRecordId === record.id && (
                                    <Check className="h-5 w-5 text-blue-600" />
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <FileSearch className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                          <h3 className="text-lg font-medium mb-2">尚未上傳病歷資料</h3>
                          <p className="text-gray-500 mb-4">
                            請先到病歷管理頁面上傳您的病歷文件
                          </p>
                          <Link href="/medical-records/import">
                            <Button className="gap-2">
                              <Upload className="h-4 w-4" />
                              前往上傳病歷
                            </Button>
                          </Link>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              

              {/* 錯誤訊息 */}
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>錯誤</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* 開始分析按鈕 */}
              <div className="flex justify-center">
                <Button 
                  onClick={startAnalysis} 
                  className="gap-2 bg-blue-600 hover:bg-blue-700"
                  disabled={!selectedMedicalFile && !selectedMedicalRecordId}
                >
                  <Brain className="h-4 w-4" />
                  開始AI保單智能匹配
                </Button>
              </div>
            </div>
          )}

          {/* 重新分析按鈕 */}
          {analysisComplete && (
            <div className="flex justify-center mb-8">
              <Button onClick={resetAnalysis} variant="outline" className="gap-2">
                <Search className="h-4 w-4" />
                重新分析
              </Button>
            </div>
          )}

          {isAnalyzing && (
            <Card className="mb-8">
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-center">
                    <Sparkles className="h-10 w-10 text-blue-600 animate-pulse" />
                  </div>
                  <h2 className="text-xl font-bold text-center">AI正在深度分析您的醫療文件</h2>
                  <p className="text-center text-gray-500">
                    OpenAI 正在處理您的病歷、診斷證明和保單資料，智能匹配各類資源，這可能需要幾十秒時間，請耐心等候...
                  </p>
                  <Progress value={analysisProgress} className="h-2" />
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-center text-sm">
                    <div className={`${analysisProgress >= 20 ? "text-blue-600 font-medium" : "text-gray-400"}`}>
                      <div className="flex flex-col items-center">
                        <span>AI分析病歷</span>
                        {analysisProgress > 0 && analysisProgress < 40 && (
                          <div className="flex items-center mt-1">
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                            <span className="ml-1 text-xs">處理中</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={`${analysisProgress >= 40 ? "text-blue-600 font-medium" : "text-gray-400"}`}>
                      <div className="flex flex-col items-center">
                        <span>AI搜尋政府補助</span>
                        {analysisProgress >= 40 && analysisProgress < 60 && (
                          <div className="flex items-center mt-1">
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                            <span className="ml-1 text-xs">處理中</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={`${analysisProgress >= 60 ? "text-blue-600 font-medium" : "text-gray-400"}`}>
                      <div className="flex flex-col items-center">
                        <span>AI搜尋企業福利</span>
                        {analysisProgress >= 60 && analysisProgress < 80 && (
                          <div className="flex items-center mt-1">
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                            <span className="ml-1 text-xs">處理中</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={`${analysisProgress >= 80 ? "text-blue-600 font-medium" : "text-gray-400"}`}>
                      <div className="flex flex-col items-center">
                        <span>AI分析保單</span>
                        {analysisProgress >= 80 && analysisProgress < 100 && (
                          <div className="flex items-center mt-1">
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                            <span className="ml-1 text-xs">處理中</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={`${analysisProgress >= 100 ? "text-blue-600 font-medium" : "text-gray-400"}`}>
                      <div className="flex flex-col items-center">
                        <span>整合AI結果</span>
                        {analysisProgress >= 100 && (
                          <div className="flex items-center mt-1">
                            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                            <span className="ml-1 text-xs text-green-600">完成</span>
                          </div>
                        )}
                      </div>
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
                  `AI 已根據您上傳的醫療文件完成分析，以下是匹配的資源建議。`
                </AlertDescription>
              </Alert>

              {/* AI 分析結果 */}
              {aiAnalysisResult && (
                <Card className="mb-6">
                  <CardHeader 
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setIsAnalysisReportCollapsed(!isAnalysisReportCollapsed)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-blue-600" />
                        <CardTitle>AI 分析報告</CardTitle>
                      </div>
                      <Button variant="ghost" size="sm">
                        {isAnalysisReportCollapsed ? (
                          <ChevronRight className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <CardDescription>基於您上傳的醫療文件的詳細分析結果</CardDescription>
                  </CardHeader>
                  {!isAnalysisReportCollapsed && (
                    <CardContent>
                      <div className="prose max-w-none">
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                          {aiAnalysisResult}
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              )}

              {/* 只有在有資源時才顯示搜尋和篩選 */}
              {getCurrentResources().length > 0 && (
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
              )}

              {/* 只有在有資源時才顯示標籤頁 */}
              {getCurrentResources().length > 0 && (
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
                          <Badge className="bg-blue-600">{resourceStats.government}項</Badge>
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
                          <Badge className="bg-green-600">{resourceStats.corporate}項</Badge>
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
                          <Badge className="bg-teal-600">{resourceStats.insurance}項</Badge>
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
                    <Badge className="bg-blue-600">{resourceStats.government}項</Badge>
                    {aiGeneratedResources.length > 0 && (
                      <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                        AI搜尋結果
                      </Badge>
                    )}
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
                    <Badge className="bg-green-600">{resourceStats.corporate}項</Badge>
                    {aiGeneratedResources.length > 0 && (
                      <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                        AI搜尋結果
                      </Badge>
                    )}
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
                    <Badge className="bg-teal-600">{resourceStats.insurance}項</Badge>
                    {aiGeneratedResources.length > 0 && (
                      <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                        AI分析結果
                      </Badge>
                    )}
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
                    <Badge className="bg-purple-600">{resourceStats.financial}項</Badge>
                    {aiGeneratedResources.length > 0 && (
                      <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                        AI搜尋結果
                      </Badge>
                    )}
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
                    <Badge className="bg-red-600">{resourceStats.legal}項</Badge>
                    {aiGeneratedResources.length > 0 && (
                      <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                        AI搜尋結果
                      </Badge>
                    )}
                  </div>
                  {sortedResources
                    .filter((resource) => resource.category === "法律救助")
                    .map((resource) => (
                      <ResourceCard key={resource.id} resource={resource} />
                    ))}
                </TabsContent>
              </Tabs>
              )}

              {/* 真實模式且無資源時的提示 */}
              {analysisComplete && aiGeneratedResources.length === 0 && (
                <Card className="mb-6">
                  <CardContent className="pt-6">
                    <div className="text-center py-8">
                      <FileSearch className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">未找到匹配的資源</h3>
                      <p className="text-gray-500">
                        AI 分析完成，但根據您的病例未找到符合的補助或理賠資源。
                        建議諮詢專業人士獲得更詳細的建議。
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
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
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// 動態進度條組件
function ProgressBar() {
  const [progress, setProgress] = useState(20)
  
  useEffect(() => {
    // 生成隨機時間偏移和百分比偏移，讓每次都不太一樣
    const getRandomOffset = (base: number, variance: number) => 
      base + (Math.random() - 0.5) * variance
    
    const timeoutIds = [
      // 小幅增長1：0.5-0.8秒，增加1-3%
      setTimeout(() => {
        setProgress(prev => prev + Math.round(getRandomOffset(2, 2)))
      }, getRandomOffset(650, 300)),
      
      // 小幅增長2：0.9-1.1秒，增加1-2%
      setTimeout(() => {
        setProgress(prev => prev + Math.round(getRandomOffset(1.5, 1)))
      }, getRandomOffset(1000, 200)),
      
      // 主要階段1：1.2-1.8秒，到達45%附近
      setTimeout(() => {
        const newProgress = Math.round(getRandomOffset(45, 6))
        setProgress(Math.min(newProgress, 50))
      }, getRandomOffset(1500, 600)),
      
      // 小幅增長3：1.9-2.1秒，增加1-2%
      setTimeout(() => {
        setProgress(prev => prev + Math.round(getRandomOffset(1.5, 1)))
      }, getRandomOffset(2000, 200)),
      
      // 主要階段2：2.2-2.8秒，到達50%附近
      setTimeout(() => {
        const newProgress = Math.round(getRandomOffset(50, 8))
        setProgress(Math.min(newProgress, 55))
      }, getRandomOffset(2500, 600)),
      
      // 小幅增長4：3.0-3.2秒，增加1-3%
      setTimeout(() => {
        setProgress(prev => prev + Math.round(getRandomOffset(2, 2)))
      }, getRandomOffset(3100, 200)),
      
      // 主要階段3：3.3-4.0秒，到達75%附近
      setTimeout(() => {
        const newProgress = Math.round(getRandomOffset(75, 16))
        setProgress(Math.min(newProgress, 85))
      }, getRandomOffset(3650, 700)),
      
      // 小幅增長5：4.1-4.3秒，增加1-2%
      setTimeout(() => {
        setProgress(prev => prev + Math.round(getRandomOffset(1.5, 1)))
      }, getRandomOffset(4200, 200)),
      
      // 小幅增長6：4.5-4.7秒，增加1-2%
      setTimeout(() => {
        setProgress(prev => prev + Math.round(getRandomOffset(1.5, 1)))
      }, getRandomOffset(4600, 200)),
      
      // 主要階段4：4.8-5.5秒，最終到達88-95%
      setTimeout(() => {
        const finalProgress = Math.round(getRandomOffset(91, 8))
        setProgress(Math.min(finalProgress, 95))
      }, getRandomOffset(5150, 700))
    ]
    
    // 清理function
    return () => {
      timeoutIds.forEach(id => clearTimeout(id))
    }
  }, [])
  
  return (
    <div className="w-full bg-blue-200 rounded-full h-2">
      <div 
        className="bg-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
        style={{width: `${progress}%`}}
      ></div>
    </div>
  )
}

// 醫療術語自動完成資料庫 - 靜態詞庫（保留原有功能，響應速度快）
const MEDICAL_TERMS = [
  // 手術技術類
  '達文西手術', '腹腔鏡手術', '內視鏡手術', '微創手術', '機械手臂手術',
  '關節鏡手術', '胸腔鏡手術', '腦部手術', '心臟手術', '肝臟手術',
  '胃部手術', '腸道手術', '膽囊手術', '甲狀腺手術', '脊椎手術',
  '白內障手術', '近視雷射手術', '植牙手術', '美容手術', '整形手術',
  
  // 疾病診斷類
  '癌症', '腫瘤', '心臟病', '高血壓', '糖尿病', '中風', '失智症',
  '帕金森氏症', '憂鬱症', '焦慮症', '骨折', '關節炎', '椎間盤突出',
  '白血病', '淋巴癌', '乳癌', '肺癌', '肝癌', '大腸癌', '胃癌',
  '攝護腺癌', '子宮頸癌', '卵巢癌', '腦瘤', '皮膚癌',
  
  // 治療方法類
  '化療', '放療', '標靶治療', '免疫治療', '荷爾蒙治療',
  '復健治療', '物理治療', '職能治療', '語言治療', '心理治療',
  '針灸', '中醫', '西醫', '健檢', '預防醫學',
  
  // 醫療設備類
  'MRI', 'CT', 'X光', '超音波', '心電圖', '腦電圖', '骨密度檢查',
  '胃鏡', '大腸鏡', '支氣管鏡', '膀胱鏡', '關節鏡',
  
  // 專科類別
  '心臟科', '腦神經科', '骨科', '婦產科', '小兒科', '皮膚科',
  '眼科', '耳鼻喉科', '牙科', '精神科', '復健科', '泌尿科',
  '腸胃科', '胸腔科', '腎臟科', '內分泌科', '風濕免疫科'
]

/**
 * AI動態建議功能說明（目前實驗性功能）:
 * 
 * 優點：
 * - 可以產生更精準的醫療術語建議
 * - 能識別專業醫學詞彙和縮寫
 * - 可以處理複雜的醫療情境描述
 * 
 * 潛在問題：
 * - API調用延遲（通常200-500ms）
 * - 可能產生非醫療相關詞彙
 * - 消耗OpenAI API quota
 * - 需要網路連線
 * 
 * 實現策略：
 * 1. 混合模式：優先使用靜態詞庫（快速響應）
 * 2. 當靜態詞庫匹配數量不足時，呼叫AI補充
 * 3. 嚴格限制AI只回傳醫療領域術語
 * 4. 緩存AI結果避免重複API調用
 * 
 * 未來編輯注意事項：
 * - 如果API成本過高，可以停用AI功能，保留靜態詞庫
 * - 可以調整AI_SUGGESTION_THRESHOLD來控制AI調用頻率
 * - AI建議緩存在aiSuggestionsCache中，可考慮持久化到localStorage
 */

// 快速搜尋內容組件
function QuickSearchContent({
  quickSearchTerm,
  setQuickSearchTerm,
  quickSearchResults,
  setQuickSearchResults,
  isSearching,
  setIsSearching,
  user,
  surgicalTechResult,
  expandedTechniques,
  techniqueDetailsCache,
  loadingTechniques,
  executeSurgicalTechSearch,
  executeTechniqueDetailSearch,
  toggleTechniqueExpansion,
  getUserPolicies,
}) {
  // 使用useRef來跟踪當前的搜尋詞，避免閉包問題
  const currentSearchTermRef = useRef(quickSearchTerm)
  const [searchResult, setSearchResult] = useState(null)
  
  // Autocomplete 相關狀態
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)
  
  // AI 建議相關狀態
  const [aiSuggestionsCache, setAiSuggestionsCache] = useState<Map<string, string[]>>(new Map())
  const [isLoadingAiSuggestions, setIsLoadingAiSuggestions] = useState(false)
  
  // 配置參數
  const ENABLE_AI_SUGGESTIONS = true // 啟用AI建議功能：總是補充靜態建議之外的更多選項

  // 當搜尋詞變化時更新ref和suggestions（優化的debounce模式）
  useEffect(() => {
    currentSearchTermRef.current = quickSearchTerm
    
    let debounceTimer: NodeJS.Timeout | null = null
    
    const updateSuggestions = async () => {
      
      if (quickSearchTerm.trim().length === 0) {
        setSuggestions([])
        setShowSuggestions(false)
        setSelectedSuggestionIndex(-1)
        return
      }

      // 第一步：從靜態詞庫獲取匹配項
      const staticSuggestions = MEDICAL_TERMS.filter(term => 
        term.toLowerCase().includes(quickSearchTerm.toLowerCase())
      ).slice(0, 8)
      
      // 獲取當前的建議列表，避免閃爍
      const currentSuggestions = suggestions
      
      // 如果有靜態建議或沒有當前建議，立即更新
      if (staticSuggestions.length > 0 || currentSuggestions.length === 0) {
        setSuggestions(staticSuggestions)
        setShowSuggestions(staticSuggestions.length > 0)
        setSelectedSuggestionIndex(-1)
      }
      
      // 第二步：AI建議的新邏輯 - 總是補充AI建議（不管靜態建議數量）
      if (ENABLE_AI_SUGGESTIONS && 
          quickSearchTerm.trim().length >= 1) {
        
        const currentLength = quickSearchTerm.trim().length
        
        if (currentLength === 1) {
          // 第一個字元：立即fetch AI建議
          console.log('第一個字元，立即fetch AI建議')
          try {
            // 獲取10個建議（直接獲取完整數量）
            const aiSuggestions = await generateAIMedicalSuggestions(quickSearchTerm, staticSuggestions, 10)
            
            if (aiSuggestions.length > 0) {
              const combinedSuggestions = [
                ...staticSuggestions,
                ...aiSuggestions.filter(ai => !staticSuggestions.includes(ai))
              ].slice(0, 10) // 顯示最多10個
              
              setSuggestions(combinedSuggestions)
              setShowSuggestions(combinedSuggestions.length > 0)
              console.log(`第一字元AI建議結果: 靜態${staticSuggestions.length}個 + AI${aiSuggestions.length}個，總共${combinedSuggestions.length}個`)
            }
          } catch (error) {
            console.warn('第一字元AI建議失敗，保留靜態建議:', error)
          }
        } else {
          // 後續字元：使用debounce 0.3秒，但保持當前建議不消失
          console.log('後續字元，設置0.3秒debounce，保持當前建議顯示')
          
          // 如果有當前建議且沒有足夠的靜態建議，保持顯示當前建議
          if (currentSuggestions.length > 0 && staticSuggestions.length < 3) {
            setShowSuggestions(true) // 確保建議框保持顯示
            console.log('保持當前建議顯示，避免閃爍')
          }
          
          debounceTimer = setTimeout(async () => {
            try {
              // 獲取10個建議（直接獲取完整數量）
              const aiSuggestions = await generateAIMedicalSuggestions(quickSearchTerm, staticSuggestions, 10)
              
              if (aiSuggestions.length > 0) {
                const combinedSuggestions = [
                  ...staticSuggestions,
                  ...aiSuggestions.filter(ai => !staticSuggestions.includes(ai))
                ].slice(0, 10) // 顯示最多10個
                
                setSuggestions(combinedSuggestions)
                setShowSuggestions(combinedSuggestions.length > 0)
                console.log(`Debounced AI建議結果: 靜態${staticSuggestions.length}個 + AI${aiSuggestions.length}個，總共${combinedSuggestions.length}個`)
              } else if (staticSuggestions.length > 0) {
                // 如果AI沒有返回建議，但有靜態建議，則使用靜態建議
                setSuggestions(staticSuggestions)
                setShowSuggestions(true)
              }
            } catch (error) {
              console.warn('Debounced AI建議失敗:', error)
              // 錯誤時如果有靜態建議，保持靜態建議
              if (staticSuggestions.length > 0) {
                setSuggestions(staticSuggestions)
                setShowSuggestions(true)
              }
            }
          }, 200) // 0.3秒延遲
        }
      }
    }
    
    updateSuggestions()
    
    // 清理函數
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }
    }
  }, [quickSearchTerm]) // 只依賴搜尋詞，避免 cache 更新造成無限循環

  // 使用傳入的getUserPolicies函數

  // AI動態生成醫療術語建議
  const generateAIMedicalSuggestions = async (searchTerm: string, currentSuggestions: string[], suggestionCount: number = 5): Promise<string[]> => {
    if (!ENABLE_AI_SUGGESTIONS || !searchTerm.trim()) return []
    
    // 檢查緩存（為分批加載創建不同的key）
    const batchNumber = Math.floor(currentSuggestions.length / 5) + 1
    const cacheKey = `${searchTerm.toLowerCase().trim()}-batch-${batchNumber}`
    if (aiSuggestionsCache.has(cacheKey)) {
      console.log(`使用AI建議緩存: "${searchTerm}" 第${batchNumber}批`)
      return aiSuggestionsCache.get(cacheKey) || []
    }
    
    try {
      setIsLoadingAiSuggestions(true)
      console.log(`調用AI生成醫療建議 (第${batchNumber}批): "${searchTerm}"`)
      
      // 獲取OpenAI API Key（從環境變數）
      const storedApiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY
      if (!storedApiKey) {
        console.log('未找到OpenAI API Key，跳過AI建議')
        return []
      }
      
      const openaiService = new (await import('../../lib/openaiService')).OpenAIService(storedApiKey)
      
      // 使用新的公共方法，獲取指定數量的建議
      const batchSuggestions = await openaiService.generateMedicalSuggestions(searchTerm, suggestionCount)
      
      // 過濾掉已存在的建議
      const newSuggestions = batchSuggestions.filter(suggestion => 
        !currentSuggestions.includes(suggestion)
      )
      
      // 緩存結果
      const newCache = new Map(aiSuggestionsCache)
      newCache.set(cacheKey, newSuggestions)
      setAiSuggestionsCache(newCache)
      
      console.log(`AI建議結果 (第${batchNumber}批):`, newSuggestions)
      return newSuggestions
      
    } catch (error) {
      console.error('AI建議生成失敗:', error)
      return []
    } finally {
      setIsLoadingAiSuggestions(false)
    }
  }

  // 執行搜尋的函數 - 使用傳入的手術技術對應搜尋
  const executeSearch = (searchTerm: string) => {
    executeSurgicalTechSearch(searchTerm)
  }

  // 處理搜尋按鈕點擊
  const handleSearch = () => {
    executeSearch(currentSearchTermRef.current)
  }

  // 處理鍵盤導航
  const handleKeyDown = (e: any) => {
    if (showSuggestions && suggestions.length > 0) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedSuggestionIndex(prev => 
            prev < suggestions.length - 1 ? prev + 1 : prev
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1)
          break
        case 'Enter':
          e.preventDefault()
          if (selectedSuggestionIndex >= 0) {
            // 只有選中建議時才執行點擊
            handleSuggestionClick(suggestions[selectedSuggestionIndex])
          }
          // 移除 else 分支，不再觸發搜尋按鈕
          break
        case 'Escape':
          setShowSuggestions(false)
          setSelectedSuggestionIndex(-1)
          break
      }
    }
    // 移除 Enter 鍵觸發搜尋的邏輯
  }

  // 處理推薦搜尋詞點擊
  const handleSuggestionClick = (suggestion: string) => {
    console.log(`點擊推薦詞: "${suggestion}"`)

    // 先更新搜尋詞
    setQuickSearchTerm(suggestion)
    currentSearchTermRef.current = suggestion
    
    // 隱藏建議列表
    setShowSuggestions(false)
    setSelectedSuggestionIndex(-1)

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
            <h2 className="text-xl font-bold text-center">智能醫療資源搜尋</h2>
            <p className="text-center text-gray-500">
              輸入手術技術名稱（如達文西手術），AI將分析常見的應用手術，點擊展開查看保障資源
            </p>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                <input
                  type="text"
                  placeholder="例如：達文西手術、腹腔鏡手術、內視鏡手術..."
                  className="w-full pl-10 pr-4 py-3 border rounded-md"
                  value={quickSearchTerm}
                  onChange={(e) => setQuickSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => {
                    if (suggestions.length > 0) setShowSuggestions(true)
                  }}
                  onBlur={() => {
                    // 延遲隱藏，讓用戶有時間點擊建議
                    setTimeout(() => setShowSuggestions(false), 200)
                  }}
                />
                
                {/* 自動完成建議列表 */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-20 max-h-64 overflow-y-auto">
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={suggestion}
                        className={`px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm ${
                          index === selectedSuggestionIndex ? 'bg-blue-100' : ''
                        }`}
                        onClick={() => handleSuggestionClick(suggestion)}
                        onMouseEnter={() => setSelectedSuggestionIndex(index)}
                      >
                        <div className="flex items-center gap-2">
                          <Search className="h-3 w-3 text-gray-400" />
                          <span className="flex-1">
                            {suggestion.split('').map((char, charIndex) => {
                              const searchTerm = quickSearchTerm.toLowerCase()
                              const suggestionLower = suggestion.toLowerCase()
                              const matchIndex = suggestionLower.indexOf(searchTerm)
                              
                              if (matchIndex !== -1 && 
                                  charIndex >= matchIndex && 
                                  charIndex < matchIndex + searchTerm.length) {
                                return <span key={charIndex} className="bg-yellow-200">{char}</span>
                              }
                              return char
                            })}
                          </span>
                        </div>
                      </div>
                    ))}
                    
                    {/* Loading指示器 - 當AI正在加載更多建議時顯示 */}
                    {isLoadingAiSuggestions && (
                      <div className="px-4 py-3 border-t border-gray-100 bg-blue-50">
                        <div className="flex items-center gap-2 text-xs text-blue-600">
                          <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-500"></div>
                          <span>正在搜尋更多醫療術語建議...</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <Button 
                onClick={handleSearch} 
                className="gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={isSearching}
              >
                {isSearching ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    搜尋中...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    搜尋
                  </>
                )}
              </Button>
            </div>

            {!quickSearchTerm && (
              <div className="text-center text-sm text-gray-400">
                <p>💡 提示：您可以搜尋特定手術、治療方法，或描述您的病況</p>
                <p>系統會優先搜尋您已上傳的保單資料，並查找相關網路資源</p>
              </div>
            )}
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

      {!isSearching && surgicalTechResult && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Stethoscope className="h-6 w-6 text-blue-600" />
                <CardTitle className="text-lg">手術技術分析結果</CardTitle>
              </div>
              <CardDescription>
                針對「{surgicalTechResult.searchTerm}」的技術分析 (共找到 {surgicalTechResult.surgicalTechMapping?.availableTechniques?.length || 0} 種技術)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* 基本資訊 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-sm">推薦技術</span>
                    </div>
                    <p className="text-sm text-blue-800">
                      {surgicalTechResult.surgicalTechMapping?.primaryTechnique || '待分析'}
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-sm">預估費用</span>
                    </div>
                    <p className="text-sm text-green-800">
                      {surgicalTechResult.surgicalTechMapping?.estimatedCost || '待估算'}
                    </p>
                    {surgicalTechResult.surgicalTechMapping?.costSource && (
                      <p className="text-xs text-green-600 mt-1">
                        📊 {surgicalTechResult.surgicalTechMapping.costSource}
                      </p>
                    )}
                  </div>
                </div>

                {/* AI 綜合分析 */}
                {surgicalTechResult.surgicalTechMapping?.analysis && (
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="h-4 w-4 text-amber-600" />
                      <span className="font-medium text-sm">AI 綜合分析</span>
                    </div>
                    <p className="text-sm text-amber-800">
                      {surgicalTechResult.surgicalTechMapping.analysis}
                    </p>
                  </div>
                )}

                {/* 常見應用手術列表 */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <Zap className="h-4 w-4 text-purple-600" />
                    常見應用手術 (點擊展開查看保障資源)
                  </h4>
                  
                  {surgicalTechResult.surgicalTechMapping?.availableTechniques?.map((technique: any, index: number) => (
                    <div key={technique.id || `tech-${index}`} className="border rounded-lg">
                      <div 
                        className="p-3 cursor-pointer hover:bg-gray-50 flex items-center justify-between"
                        onClick={() => toggleTechniqueExpansion(technique.id || `tech-${index}`, technique.name)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            {expandedTechniques.has(technique.id || `tech-${index}`) ? (
                              <ChevronDown className="h-4 w-4 text-gray-500" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-gray-500" />
                            )}
                            <span className="font-medium text-sm">{technique.name}</span>
                          </div>
                          <Badge className={technique.isRecommended ? "bg-green-600" : "bg-gray-500"}>
                            {technique.suitability || '適用性待分析'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{technique.estimatedCost || '費用待查'}</span>
                          {technique.isRecommended && (
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                              推薦
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {/* 展開的詳細內容 */}
                      {expandedTechniques.has(technique.id || `tech-${index}`) && (
                        <div className="px-3 pb-3 border-t bg-gray-50">
                          <div className="space-y-3 mt-3">
                            {/* 詳細搜尋結果 */}
                            {loadingTechniques.has(technique.id || `tech-${index}`) ? (
                              <div className="p-4 bg-blue-50 rounded text-sm text-blue-700">
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                                  <span className="font-medium">正在搜尋相關保障資源...</span>
                                </div>
                                {/* 動態進度條 */}
                                <ProgressBar />
                                <p className="text-xs text-blue-600 mt-2">正在分析保單條款和政府補助項目...</p>
                              </div>
                            ) : techniqueDetailsCache.has(technique.id || `tech-${index}`) ? (
                              <div className="space-y-2">
                                <h5 className="font-medium text-sm text-purple-600">相關保障資源：</h5>
                                {(() => {
                                  const details = techniqueDetailsCache.get(technique.id || `tech-${index}`)
                                  const allResources = [
                                    ...(details?.personalPolicyResults || []),
                                    ...(details?.networkResources || [])
                                  ]
                                  
                                  return allResources.length > 0 ? (
                                    <div className="grid gap-2">
                                      {allResources.slice(0, 5).map((resource: any, i: number) => (
                                        <div key={i} className="p-3 bg-white rounded border border-gray-200">
                                          <div className="flex items-center gap-2 mb-1">
                                            {resource.category === '保單理賠' ? (
                                              <Shield className="h-4 w-4 text-teal-600" />
                                            ) : (
                                              <Building className="h-4 w-4 text-blue-600" />
                                            )}
                                            <span className="font-medium text-sm">{resource.title}</span>
                                            <Badge className="text-xs" variant={resource.category === '保單理賠' ? 'default' : 'secondary'}>
                                              {resource.category === '保單理賠' ? '您的保單' : resource.category}
                                            </Badge>
                                          </div>
                                          <p className="text-sm text-gray-600">可能理賠/補助：{resource.amount}</p>
                                          {resource.aiAnalysis?.confidenceLevel && (
                                            <p className="text-xs text-gray-400 mt-1">
                                              🤖 AI信心度: {resource.aiAnalysis.confidenceLevel}
                                            </p>
                                          )}
                                        </div>
                                      ))}
                                      {allResources.length > 5 && (
                                        <div className="text-sm text-gray-500 text-center py-2">
                                          ...及其他 {allResources.length - 5} 項資源
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="p-4 bg-gray-100 rounded text-sm text-gray-500 text-center">
                                      未找到相關保障資源，建議諮詢保險專業人員
                                    </div>
                                  )
                                })()}
                              </div>
                            ) : (
                              <div className="p-4 bg-gray-100 rounded text-sm text-gray-500 text-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400 mx-auto mb-2"></div>
                                準備搜尋相關資源...
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )) || (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      未找到相關技術資訊
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {!isSearching && quickSearchTerm && !surgicalTechResult && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileSearch className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">搜尋完成</h3>
          <p className="text-gray-500 max-w-md">
            未找到與「{quickSearchTerm}」相關的手術技術資訊。請嘗試使用不同的關鍵詞。
          </p>
        </div>
      )}

      {!isSearching && quickSearchResults.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">搜尋結果 ({quickSearchResults.length})</h3>
            {quickSearchResults[0]?.personalPolicyCount !== undefined && (
              <div className="flex gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Shield className="h-4 w-4 text-teal-600" />
                  個人保單: {quickSearchResults[0].personalPolicyCount}
                </span>
                <span className="flex items-center gap-1">
                  <Building className="h-4 w-4 text-blue-600" />
                  其他資源: {quickSearchResults[0].networkResourceCount}
                </span>
              </div>
            )}
          </div>

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
                    <p className="text-sm font-medium">預估費用</p>
                    <p className="text-sm text-gray-700">{treatment.averageCost}</p>
                    {treatment.costSource && (
                      <p className="text-xs text-gray-500 mt-1">📊 {treatment.costSource}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-sm">可能的保障資源：</h4>

                  {treatment.matchedResources && treatment.matchedResources.length > 0 ? (
                    treatment.matchedResources.map((resource) => (
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
                              <>
                                <Shield className="h-4 w-4 text-teal-600" />
                                {resource.sourcePolicy && (
                                  <Badge variant="outline" className="bg-teal-50 text-teal-700 text-xs">
                                    您的保單
                                  </Badge>
                                )}
                              </>
                            ) : resource.category === "政府補助" ? (
                              <Building className="h-4 w-4 text-blue-600" />
                            ) : (
                              <Building className="h-4 w-4 text-green-600" />
                            )}
                            <p className="font-medium text-sm">{resource.title}</p>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{resource.organization}</p>
                          {resource.aiAnalysis?.confidenceLevel && (
                            <p className="text-xs text-gray-400 mt-1">
                              🤖 AI信心度: {resource.aiAnalysis.confidenceLevel}
                            </p>
                          )}
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
                    ))
                  ) : (
                    <div className="p-3 rounded-md border border-gray-200 bg-gray-50">
                      <p className="text-sm text-gray-500 text-center">
                        {getUserPolicies().length === 0 
                          ? "📋 未找到個人保單資料，建議先到「我的資料」上傳保單" 
                          : "🔍 未找到相關保障資源，建議諮詢保險專業人員"}
                      </p>
                    </div>
                  )}
                </div>


                {/* 新增「聽聽大家怎麼說」按鈕 - 使用AI搜尋的真實資料 */}
                <div className="mt-6 flex justify-center">
                  <Link href={`/ai-resources/analysis/${encodeURIComponent(quickSearchTerm)}`} target="_blank">
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
          <h3 className="text-lg font-medium mb-2">搜尋完成</h3>
          <p className="text-gray-500 max-w-md">
            未找到與「{quickSearchTerm}」相關的保單理賠或醫療資源。請嘗試使用不同的關鍵詞，或確認您已上傳相關保單資料。
          </p>
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

  return (
    <Card className={`overflow-hidden ${getCategoryColor(resource.category)}`}>
      <CardHeader className="pb-2">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              {resource.icon || getCategoryIcon(resource.category)}
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

export default AIResourcesPage
