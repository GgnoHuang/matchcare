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
  Globe,
} from "lucide-react"
import UploadZone, { UploadedFile } from "@/components/ui/upload-zone"
import FileSelector, { SelectedFileData } from "@/components/ui/file-selector"
import { OpenAIService, CaseData, ResourceItem, MedicalAnalysisResult } from "@/lib/openaiService"
import { checkAuth } from "@/app/actions/auth-service"
// import { userDataService } from "@/lib/storage" // 已移除，改用 API

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

  // 檢查用戶登入狀態並載入API Key
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { isLoggedIn, user } = await checkAuth()
        if (isLoggedIn && user) {
          setUser(user)
          // 從 localStorage 讀取 OpenAI API Key
          const storedApiKey = localStorage.getItem('openai_api_key')
          if (storedApiKey) {
            setApiKey(storedApiKey)
          }
        }
      } catch (error) {
        console.error('獲取用戶資訊失敗:', error)
      }
    }
    fetchUser()
  }, [])

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
    
    // 檢查API Key（從帳號設定中讀取）
    const storedApiKey = localStorage.getItem('openai_api_key') || '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'
    console.log("API Key 存在:", !!storedApiKey)
    console.log("選擇的病歷檔案:", selectedMedicalFile)
    console.log("選擇的保單檔案:", selectedPolicyFile)
    if (!storedApiKey) {
      setError("請先到帳號設定頁面設定 OpenAI API Key")
      setIsAnalyzing(false)
      return
    }

    // 保單必填
    if (!selectedPolicyFile) {
      setError("請先選擇或上傳保險保單文件")
      setIsAnalyzing(false)
      return
    }

    // 病歷和診斷證明至少一項必填
    if (!selectedMedicalFile && !selectedDiagnosisFile) {
      setError("請至少選擇或上傳病歷記錄或診斷證明其中一項")
      setIsAnalyzing(false)
      return
    }

    try {
      const openaiService = new OpenAIService(storedApiKey)
      let medicalText = ''
      let policyText = ''

      // 首先讀取已保存的醫療資料 - 暫時註釋，等待改為 API
      // const [savedMedicalRecords, savedDiagnosisCertificates] = await Promise.all([
      //   userDataService.getMedicalRecords(user?.id || ''),
      //   userDataService.getDiagnosisCertificates(user?.id || '')
      // ])
      const savedMedicalRecords = [] // 暫時使用空陣列
      const savedDiagnosisCertificates = [] // 暫時使用空陣列

      console.log('📊 讀取已保存的醫療資料:')
      console.log(`- 病歷記錄: ${savedMedicalRecords.length} 筆`)
      console.log(`- 診斷證明: ${savedDiagnosisCertificates.length} 筆`)

      // 整合已保存的醫療資料
      let combinedMedicalData = ''
      
      if (savedMedicalRecords.length > 0) {
        combinedMedicalData += '=== 已保存的病歷記錄 ===\n'
        savedMedicalRecords.forEach((record, index) => {
          const medicalInfo = (record.medicalInfo as any) || {}
          combinedMedicalData += `病歷 ${index + 1}:\n`
          combinedMedicalData += `- 病症: ${medicalInfo.clinicalRecord || medicalInfo._originalData?.diagnosis || '未知'}\n`
          combinedMedicalData += `- 診斷: ${medicalInfo.clinicalRecord || medicalInfo._originalData?.diagnosis || '未知'}\n`
          combinedMedicalData += `- 就醫日期: ${medicalInfo._originalData?.visitDate || record.uploadDate || '未知'}\n`
          combinedMedicalData += `- 醫院: ${medicalInfo.hospitalStamp || medicalInfo._originalData?.hospital || '未知'}\n`
          if (medicalInfo.medicationRecord || medicalInfo._originalData?.medication) {
            combinedMedicalData += `- 用藥: ${medicalInfo.medicationRecord || medicalInfo._originalData?.medication}\n`
          }
          combinedMedicalData += '\n'
        })
      }

      if (savedDiagnosisCertificates.length > 0) {
        combinedMedicalData += '=== 已保存的診斷證明 ===\n'
        savedDiagnosisCertificates.forEach((cert, index) => {
          const diagnosisInfo = (cert.diagnosisInfo as any) || {}
          combinedMedicalData += `診斷證明 ${index + 1}:\n`
          combinedMedicalData += `- 主診斷: ${diagnosisInfo.diseaseName || diagnosisInfo._originalData?.diseaseName || '未知'}\n`
          combinedMedicalData += `- 診斷日期: ${diagnosisInfo.certificateDate || diagnosisInfo._originalData?.certificateDate || '未知'}\n`
          combinedMedicalData += `- 醫師: ${diagnosisInfo._originalData?.doctor || '未知'}\n`
          combinedMedicalData += `- 醫院: ${diagnosisInfo._originalData?.hospital || '未知'}\n`
          if (diagnosisInfo.treatmentSummary || diagnosisInfo._originalData?.treatmentSummary) {
            combinedMedicalData += `- 治療計劃: ${diagnosisInfo.treatmentSummary || diagnosisInfo._originalData?.treatmentSummary}\n`
          }
          combinedMedicalData += '\n'
        })
      }

      // 提取新上傳文件的病例文字
      if (selectedMedicalFile) {
        if (selectedMedicalFile.fileType === 'pdf' && selectedMedicalFile.textContent) {
          medicalText = selectedMedicalFile.textContent
        } else if (selectedMedicalFile.fileType === 'image') {
          medicalText = "請從圖片中分析醫療內容"
        }
      }

      // 提取保單文字
      if (selectedPolicyFile) {
        if (selectedPolicyFile.fileType === 'pdf' && selectedPolicyFile.textContent) {
          policyText = selectedPolicyFile.textContent
        } else if (selectedPolicyFile.fileType === 'image') {
          policyText = "請從保單圖片中分析保障內容"
        }
      }

      // 提取診斷證明文字
      let diagnosisText = ''
      if (selectedDiagnosisFile) {
        if (selectedDiagnosisFile.fileType === 'pdf' && selectedDiagnosisFile.textContent) {
          diagnosisText = selectedDiagnosisFile.textContent
        } else if (selectedDiagnosisFile.fileType === 'image') {
          diagnosisText = "請從診斷證明圖片中分析診斷資訊"
        }
      }

      // 模擬案例資料（實際應用中可以從表單獲取）
      const caseData: CaseData = {
        age: "未指定",
        gender: "未指定", 
        disease: "依據上傳文件分析",
        treatment: "依據上傳文件分析",
        notes: "透過 AI 自動分析上傳的醫療文件"
      }

      console.log("第1步：基礎病例分析...")
      setAnalysisProgress(20)
      const medicalImageBase64 = (selectedMedicalFile && selectedMedicalFile.fileType === 'image') ? selectedMedicalFile.imageBase64 : null
      
      // 合併所有醫療文字內容（已保存資料 + 新上傳文件）
      let finalMedicalText = combinedMedicalData

      // 添加新上傳的病歷文件
      if (medicalText) {
        finalMedicalText += '\n=== 新上傳的病歷文件 ===\n' + medicalText
      }

      // 添加新上傳的診斷證明
      if (diagnosisText) {
        finalMedicalText += '\n=== 新上傳的診斷證明 ===\n' + diagnosisText
      }
      
      // 如果完全沒有醫療資料，提供基本提示
      if (!finalMedicalText.trim() || finalMedicalText === '') {
        finalMedicalText = "請根據上傳的醫療文件圖片進行分析。如果沒有具體的醫療內容，請基於常見的醫療情況提供一般性的資源建議。"
      }
      
      // 確保有足夠的內容供 AI 分析
      if (finalMedicalText.length < 50) {
        finalMedicalText += "\n\n請基於以上資訊和您對台灣醫療體系的了解，提供相關的醫療資源建議。"
      }

      console.log('🔄 整合的醫療資料長度:', finalMedicalText.length)
      
      // 等待 OpenAI 分析病例（使用整合的醫療資料）
      const medicalAnalysis = await openaiService.analyzeMedicalCase(finalMedicalText, caseData, medicalImageBase64)
      console.log("病例分析結果:", medicalAnalysis)

      console.log("第2步：搜尋政府補助資源...")
      setAnalysisProgress(40)
      // 等待 OpenAI 搜尋政府補助
      const govResources = await openaiService.searchGovernmentSubsidies(medicalAnalysis)
      console.log("政府補助資源:", govResources)

      console.log("第3步：搜尋企業福利資源...")
      setAnalysisProgress(60)
      // 等待 OpenAI 搜尋企業福利
      const corpResources = await openaiService.searchCorporateBenefits(medicalAnalysis)
      console.log("企業福利資源:", corpResources)

      console.log("第4步：分析保單理賠資源...")
      setAnalysisProgress(80)
      const policyImageBase64 = (selectedPolicyFile && selectedPolicyFile.fileType === 'image') ? selectedPolicyFile.imageBase64 : null
      // 等待 OpenAI 分析保單理賠
      const insResources = await openaiService.analyzeInsuranceClaims(medicalAnalysis, policyText, policyImageBase64)
      console.log("保單理賠資源:", insResources)

      console.log("第5步：整合所有結果...")
      setAnalysisProgress(90)
      const allResources = [...govResources, ...corpResources, ...insResources]
      setAiGeneratedResources(allResources)

      // 生成分析報告
      const analysisReport = `## 🔍 AI 綜合分析報告

### 資料來源整合
- **已保存病歷記錄**: ${savedMedicalRecords.length} 筆
- **已保存診斷證明**: ${savedDiagnosisCertificates.length} 筆
- **新上傳病歷文件**: ${medicalText ? '1 筆' : '0 筆'}
- **新上傳診斷證明**: ${diagnosisText ? '1 筆' : '0 筆'}
- **總醫療資料量**: ${finalMedicalText.length} 字元

### 病例分析結果
- **主要疾病**: ${medicalAnalysis.disease}
- **嚴重程度**: ${medicalAnalysis.severity}
- **治療階段**: ${medicalAnalysis.treatmentStage}
- **預估費用**: ${medicalAnalysis.estimatedCost}
- **照護需求**: ${medicalAnalysis.careNeeds}
- **家庭影響**: ${medicalAnalysis.familyImpact}

### 資源搜尋結果
- **政府補助資源**: ${govResources.length} 項
- **企業福利資源**: ${corpResources.length} 項
- **保單理賠資源**: ${insResources.length} 項
- **總計可用資源**: ${allResources.length} 項

### 建議優先級
${allResources.filter(r => r.priority === 'high').length > 0 ? 
  `**高優先級**: ${allResources.filter(r => r.priority === 'high').map(r => r.title).join('、')}` : 
  '無高優先級資源'}

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
            user={user}
          />
        </TabsContent>

        <TabsContent value="ai-match">
          {/* 模式選擇和設定區域 */}
          {!isAnalyzing && !analysisComplete && (
            <div className="space-y-6 mb-8">
              {/* AI 真實分析設定 */}
                <div className="space-y-4">
                  

                  {/* 病歷檔案選擇區域 */}
                  <FileSelector
                    label="病歷文件選擇（擇一必填）"
                    description="選擇已上傳的病歷或醫療文件，或上傳新檔案（與診斷證明至少選一項）"
                    fileType="medical"
                    userId={user?.id || null}
                    onFileSelected={handleMedicalFileSelected}
                    onError={handleFileError}
                  />

                  {/* 保單檔案選擇區域 */}
                  <FileSelector
                    label="保單文件選擇（必填）"
                    description="選擇已上傳的保單文件或上傳新檔案，進行保單理賠分析"
                    fileType="insurance"
                    userId={user?.id || null}
                    onFileSelected={handlePolicyFileSelected}
                    onError={handleFileError}
                  />

                  {/* 診斷證明選擇區域 */}
                  <FileSelector
                    label="診斷證明選擇（擇一必填）"
                    description="選擇已上傳的診斷證明或上傳新檔案（與病歷記錄至少選一項）"
                    fileType="diagnosis"
                    userId={user?.id || null}
                    onFileSelected={handleDiagnosisFileSelected}
                    onError={handleFileError}
                  />
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
                  disabled={!selectedPolicyFile || (!selectedMedicalFile && !selectedDiagnosisFile)}
                >
                  <Brain className="h-4 w-4" />
                  開始AI資源分析
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

// 快速搜尋內容組件
function QuickSearchContent({
  quickSearchTerm,
  setQuickSearchTerm,
  quickSearchResults,
  setQuickSearchResults,
  isSearching,
  setIsSearching,
  user,
}) {
  // 使用useRef來跟踪當前的搜尋詞，避免閉包問題
  const currentSearchTermRef = useRef(quickSearchTerm)
  const [searchResult, setSearchResult] = useState(null)

  // 當搜尋詞變化時更新ref
  useEffect(() => {
    currentSearchTermRef.current = quickSearchTerm
  }, [quickSearchTerm])

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
      
      console.log(`🔍 快速搜尋 - 讀取用戶保單資料`)
      console.log(`   📂 儲存Key: ${storageKey}`)
      console.log(`   📊 保單數量: ${parsedPolicies.length} 筆`)
      console.log(`   📋 原始資料:`, policies ? policies.substring(0, 200) + '...' : 'null')
      console.log(`   📄 解析後的保單資料:`, parsedPolicies)
      
      // 檢查每個保單的文本內容
      parsedPolicies.forEach((policy, index) => {
        console.log(`   📄 保單 ${index + 1} (${policy.fileName}):`)
        console.log(`      - ID: ${policy.id}`)
        console.log(`      - 文本內容長度: ${(policy.textContent || '').length} 字元`)
        console.log(`      - 文本內容預覽: ${(policy.textContent || '').substring(0, 100)}...`)
        console.log(`      - AI分析資料:`, policy.policyInfo ? '✅ 有' : '❌ 無')
        if (policy.policyInfo?.policyBasicInfo) {
          console.log(`      - 保險公司: ${policy.policyInfo.policyBasicInfo.insuranceCompany || '未識別'}`)
          console.log(`      - 保單名稱: ${policy.policyInfo.policyBasicInfo.policyName || '未識別'}`)
        }
      })
      
      return parsedPolicies
    } catch (error) {
      console.error('讀取保單資料失敗:', error)
      return []
    }
  }

  // 真實的AI搜尋功能
  const executeRealSearch = async (searchTerm) => {
    console.log(`執行真實搜尋: "${searchTerm}"`)

    if (!searchTerm.trim()) {
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    
    try {
      // 獲取用戶保單資料
      const userPolicies = getUserPolicies()
      
      // 獲取OpenAI API Key
      const apiKey = localStorage.getItem('openai_api_key') || process.env.NEXT_PUBLIC_OPENAI_API_KEY || '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'

      // 使用OpenAI服務進行綜合搜尋
      // 使用帳號設定中的API Key
      const storedApiKey = localStorage.getItem('openai_api_key') || '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'
      const openaiService = new (await import('../../lib/openaiService')).OpenAIService(storedApiKey)
      const result = await openaiService.comprehensiveSearch(searchTerm, userPolicies)
      
      console.log('綜合搜尋結果:', result)
      console.log('個人保單匹配結果:', result.personalPolicyResults)
      console.log('網路資源搜尋結果:', result.networkResources)
      
      // 格式化搜尋結果以符合現有UI
      const formattedResult = {
        id: `search-${Date.now()}`,
        name: searchTerm,
        description: `關於「${searchTerm}」的醫療資源分析`,
        averageCost: result.estimatedCost,
        costSource: result.costSource,
        category: "搜尋結果",
        icon: <Search className="h-5 w-5 text-blue-600" />,
        personalPolicyCount: result.personalPolicyResults.length,
        networkResourceCount: result.networkResources.length,
        webResourceCount: result.webResources?.length || 0,
        matchedResources: [
          ...result.personalPolicyResults,
          ...result.networkResources
        ],
        webResources: result.webResources || []
      }

      setSearchResult(formattedResult)
      setQuickSearchResults([formattedResult])
      
      // 將搜尋結果儲存到 sessionStorage，供詳情頁面使用
      try {
        sessionStorage.setItem('quickSearchResults', JSON.stringify([formattedResult]))
        console.log('搜尋結果已儲存到 sessionStorage')
      } catch (error) {
        console.error('儲存搜尋結果到 sessionStorage 失敗:', error)
      }
      
    } catch (error) {
      console.error('搜尋失敗:', error)
      // 顯示錯誤結果
      const errorResult = {
        id: `error-${Date.now()}`,
        name: searchTerm,
        description: `搜尋「${searchTerm}」時發生錯誤: ${error.message}`,
        averageCost: "無法取得費用資訊",
        costSource: "搜尋失敗",
        category: "錯誤",
        icon: <AlertCircle className="h-5 w-5 text-red-600" />,
        matchedResources: []
      }
      setSearchResult(errorResult)
      setQuickSearchResults([errorResult])
      
      // 即使是錯誤結果也儲存到 sessionStorage
      try {
        sessionStorage.setItem('quickSearchResults', JSON.stringify([errorResult]))
      } catch (error) {
        console.error('儲存錯誤結果到 sessionStorage 失敗:', error)
      }
      
      // 如果是API Key問題，給出更明確的指引
      if (error.message.includes('API 金鑰')) {
        alert('請先到「設定」頁面輸入您的 OpenAI API 金鑰才能使用搜尋功能')
      }
    } finally {
      setIsSearching(false)
    }
  }

  // 執行搜尋的函數 - 使用真實AI搜尋
  const executeSearch = (searchTerm) => {
    executeRealSearch(searchTerm)
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
            <h2 className="text-xl font-bold text-center">智能醫療資源搜尋</h2>
            <p className="text-center text-gray-500">
              請輸入手術名稱、治療項目或您的病況描述，AI將搜尋您的個人保單並查找相關醫療資源
            </p>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="例如：達文西攝護腺手術、心律不整治療、糖尿病足潰瘍..."
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

                {/* 網路相關資源 */}
                {treatment.webResources && Array.isArray(treatment.webResources) && treatment.webResources.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <Globe className="h-5 w-5 text-blue-600" />
                      相關網路資源
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        {treatment.webResources.length} 個連結
                      </Badge>
                    </h3>
                    <div className="grid gap-3">
                      {treatment.webResources.filter(webResource => webResource && typeof webResource === 'object').map((webResource, index) => (
                        <div key={index} className="p-4 rounded-lg border border-blue-200 bg-blue-50/50 hover:bg-blue-50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <ExternalLink className="h-4 w-4 text-blue-600" />
                                <h4 className="font-medium text-sm text-blue-900">{webResource.title || '未知標題'}</h4>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{webResource.description || '無描述'}</p>
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span>來源: {webResource.organization || webResource.source || '未知來源'}</span>
                                {webResource.category && (
                                  <Badge variant="outline" className="text-xs">
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
                                <Button size="sm" variant="outline" className="text-xs gap-1 border-blue-200 text-blue-700 hover:bg-blue-50">
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
                  </div>
                )}

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
