"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState, useEffect } from "react"
import { Upload, Plus, FileSearch, Calendar, Pill, Stethoscope, AlertCircle, Edit } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { MatchedPoliciesDropdown } from "@/app/components/matched-policies-dropdown"
import { useMediaQuery } from "@/hooks/use-mobile"
import { checkAuth } from "@/app/actions/auth-service"
import { supabaseConfig } from "@/lib/supabase"

export default function MedicalRecordsPage() {
  const [expandedRecord, setExpandedRecord] = useState<number | null>(null)
  const [medicalRecords, setMedicalRecords] = useState<any[]>([])
  const [user, setUser] = useState<{ id: string, username: string, phoneNumber: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const isMobile = useMediaQuery("(max-width: 768px)")

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
        }
      } catch (error) {
        console.error('獲取用戶資訊失敗:', error)
      } finally {
        setIsLoading(false)
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

  const loadUserMedicalRecords = async () => {
    if (!user?.phoneNumber) return
    
    try {
      console.log('載入用戶病歷資料，用戶電話:', user.phoneNumber)
      
      // 透過 Supabase API 搜尋用戶資料
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
      console.log('API 返回用戶資料:', userData)
      
      // 提取病歷記錄
      const rawRecords = userData[0]?.medical_records || []
      console.log('提取的病歷記錄:', rawRecords)
      
      // 將 API 資料轉換為UI需要的格式
      const formattedRecords = rawRecords.map((record: any, index: number) => {
        console.log('處理病歷記錄:', record.file_name, record.medical_data)
        const medicalData = record.medical_data || {}
        
        // 使用 API 資料欄位
        const hospital = medicalData.hospitalName || '未知醫院'
        const diagnosis = medicalData.diagnosis || '診斷資料處理中'
        const treatment = medicalData.treatment || '治療記錄處理中'
        const medications = medicalData.medications || '用藥記錄處理中'
        const department = medicalData.department || '醫療科別'
        const doctor = medicalData.doctorName || '主治醫師'
        const visitDate = medicalData.visitDate || record.upload_date
        
        return {
          id: record.id || `record_${index + 1}`,
          hospital: hospital,
          department: department,
          date: visitDate ? new Date(visitDate).toLocaleDateString('zh-TW') : '未知日期',
          diagnosis: diagnosis,
          doctor: doctor,
          treatments: treatment.split(',').map((t: string) => t.trim()).filter((t: string) => t),
          medications: medications.split(',').map((m: string) => m.trim()).filter((m: string) => m),
          hasInsuranceCoverage: true, // 暫時設為true，保持按鈕可用
          matchedPolicies: 1, // 暫時設為1，保持UI一致
          claimSuccessRate: 85, // 暫時設為85%
          matchedPoliciesDetails: [
            { id: 1, company: '分析中', name: '保險匹配分析處理中', type: '醫療險' }
          ],
          fileName: record.file_name,
          uploadDate: record.upload_date,
          originalData: record // 保留原始資料供後續使用
        }
      })
      
      setMedicalRecords(formattedRecords)
      console.log('最終格式化的病歷資料:', formattedRecords)
    } catch (error) {
      console.error('載入病歷資料失敗:', error)
      setMedicalRecords([])
    }
  }

  // 保留原來的假資料作為後備，以防真實資料載入失敗
  // const fallbackRecords = [
  //   {
  //     id: 1,
  //     hospital: "台大醫院",
  //     department: "腫瘤科",
  //     date: "2023-12-15",
  //     diagnosis: "乳癌第二期",
  //     doctor: "林醫師",
  //     treatments: ["手術切除", "化療"],
  //     medications: ["紫杉醇", "環磷醯胺"],
  //     hasInsuranceCoverage: true,
  //     matchedPolicies: 2,
  //     claimSuccessRate: 95,
  //     matchedPoliciesDetails: [
  //       { id: 1, company: "國泰人壽", name: "安心醫療保險", type: "醫療險" },
  //       { id: 2, company: "新光人壽", name: "重大疾病保險", type: "重疾險" },
  //     ],
  //   },
  //   {
  //     id: 2,
  //     hospital: "榮總",
  //     department: "心臟內科",
  //     date: "2023-10-05",
  //     diagnosis: "心肌梗塞",
  //     doctor: "王醫師",
  //     treatments: ["心導管手術", "藥物治療"],
  //     medications: ["阿斯匹靈", "氯吡格雷"],
  //     hasInsuranceCoverage: true,
  //     matchedPolicies: 1,
  //     claimSuccessRate: 90,
  //     matchedPoliciesDetails: [{ id: 2, company: "新光人壽", name: "重大疾病保險", type: "重疾險" }],
  //   },
  //   {
  //     id: 3,
  //     hospital: "三軍總醫院",
  //     department: "骨科",
  //     date: "2023-08-22",
  //     diagnosis: "骨折",
  //     doctor: "張醫師",
  //     treatments: ["手術固定"],
  //     medications: ["止痛藥"],
  //     hasInsuranceCoverage: false,
  //     matchedPolicies: 0,
  //     claimSuccessRate: 0,
  //     matchedPoliciesDetails: [],
  //   },
  //   {
  //     id: 4,
  //     hospital: "長庚醫院",
  //     department: "神經內科",
  //     date: "2023-07-10",
  //     diagnosis: "腦中風",
  //     doctor: "李醫師",
  //     treatments: ["藥物治療", "復健"],
  //     medications: ["抗凝血劑"],
  //     hasInsuranceCoverage: true,
  //     matchedPolicies: 3,
  //     claimSuccessRate: 98,
  //     matchedPoliciesDetails: [
  //       { id: 1, company: "國泰人壽", name: "安心醫療保險", type: "醫療險" },
  //       { id: 2, company: "新光人壽", name: "重大疾病保險", type: "重疾險" },
  //       { id: 3, company: "富邦人壽", name: "意外傷害保險", type: "意外險" },
  //     ],
  //   },
  //   // 新增病歷
  //   {
  //     id: 5,
  //     hospital: "馬偕醫院",
  //     department: "內分泌科",
  //     date: "2023-06-18",
  //     diagnosis: "第二型糖尿病",
  //     doctor: "陳醫師",
  //     treatments: ["藥物治療", "飲食控制"],
  //     medications: ["二甲雙胍", "胰島素"],
  //     hasInsuranceCoverage: true,
  //     matchedPolicies: 1,
  //     claimSuccessRate: 85,
  //     matchedPoliciesDetails: [{ id: 1, company: "國泰人壽", name: "安心醫療保險", type: "醫療險" }],
  //   },
  //   {
  //     id: 6,
  //     hospital: "台北醫學大學附設醫院",
  //     department: "精神科",
  //     date: "2023-05-20",
  //     diagnosis: "重度憂鬱症",
  //     doctor: "黃醫師",
  //     treatments: ["藥物治療", "心理諮商"],
  //     medications: ["選擇性血清素再吸收抑制劑"],
  //     hasInsuranceCoverage: true,
  //     matchedPolicies: 1,
  //     claimSuccessRate: 75,
  //     matchedPoliciesDetails: [{ id: 1, company: "國泰人壽", name: "安心醫療保險", type: "醫療險" }],
  //   },
  //   {
  //     id: 7,
  //     hospital: "林口長庚醫院",
  //     department: "腎臟科",
  //     date: "2023-04-12",
  //     diagnosis: "慢性腎臟病第三期",
  //     doctor: "吳醫師",
  //     treatments: ["藥物治療", "飲食控制"],
  //     medications: ["降血壓藥", "利尿劑"],
  //     hasInsuranceCoverage: true,
  //     matchedPolicies: 2,
  //     claimSuccessRate: 92,
  //     matchedPoliciesDetails: [
  //       { id: 1, company: "國泰人壽", name: "安心醫療保險", type: "醫療險" },
  //       { id: 4, company: "南山人壽", name: "住院醫療保險", type: "醫療險" },
  //     ],
  //   },
  //   {
  //     id: 8,
  //     hospital: "高雄醫學大學附設醫院",
  //     department: "風濕免疫科",
  //     date: "2023-03-05",
  //     diagnosis: "類風濕性關節炎",
  //     doctor: "林醫師",
  //     treatments: ["藥物治療", "物理治療"],
  //     medications: ["非類固醇消炎藥", "疾病調節抗風濕藥"],
  //     hasInsuranceCoverage: true,
  //     matchedPolicies: 1,
  //     claimSuccessRate: 88,
  //     matchedPoliciesDetails: [{ id: 1, company: "國泰人壽", name: "安心醫療保險", type: "醫療險" }],
  //   },
  //   {
  //     id: 9,
  //     hospital: "台中榮民總醫院",
  //     department: "胃腸肝膽科",
  //     date: "2023-02-18",
  //     diagnosis: "肝硬化",
  //     doctor: "謝醫師",
  //     treatments: ["藥物治療", "飲食控制"],
  //     medications: ["利尿劑", "蛋白質補充劑"],
  //     hasInsuranceCoverage: true,
  //     matchedPolicies: 2,
  //     claimSuccessRate: 90,
  //     matchedPoliciesDetails: [
  //       { id: 1, company: "國泰人壽", name: "安心醫療保險", type: "醫療險" },
  //       { id: 2, company: "新光人壽", name: "重大疾病保險", type: "重疾險" },
  //     ],
  //   },
  //   {
  //     id: 10,
  //     hospital: "奇美醫院",
  //     department: "呼吸胸腔科",
  //     date: "2023-01-10",
  //     diagnosis: "慢性阻塞性肺病",
  //     doctor: "鄭醫師",
  //     treatments: ["藥物治療", "呼吸復健"],
  //     medications: ["支氣管擴張劑", "類固醇吸入劑"],
  //     hasInsuranceCoverage: true,
  //     matchedPolicies: 1,
  //     claimSuccessRate: 85,
  //     matchedPoliciesDetails: [{ id: 1, company: "國泰人壽", name: "安心醫療保險", type: "醫療險" }],
  //   },
  //   {
  //     id: 11,
  //     hospital: "成大醫院",
  //     department: "皮膚科",
  //     date: "2022-12-05",
  //     diagnosis: "乾癬",
  //     doctor: "劉醫師",
  //     treatments: ["藥物治療", "光療"],
  //     medications: ["外用類固醇", "免疫抑制劑"],
  //     hasInsuranceCoverage: false,
  //     matchedPolicies: 0,
  //     claimSuccessRate: 0,
  //     matchedPoliciesDetails: [],
  //   },
  //   {
  //     id: 12,
  //     hospital: "台北榮民總醫院",
  //     department: "神經外科",
  //     date: "2022-11-15",
  //     diagnosis: "腦瘤",
  //     doctor: "周醫師",
  //     treatments: ["手術切除", "放射治療"],
  //     medications: ["類固醇", "抗癲癇藥"],
  //     hasInsuranceCoverage: true,
  //     matchedPolicies: 2,
  //     claimSuccessRate: 95,
  //     matchedPoliciesDetails: [
  //       { id: 1, company: "國泰人壽", name: "安心醫療保險", type: "醫療險" },
  //       { id: 2, company: "新光人壽", name: "重大疾病保險", type: "重疾險" },
  //     ],
  //   },
  // ]

  // 使用真實資料，如果沒有則顯示提示
  const displayRecords = medicalRecords.length > 0 ? medicalRecords : []
  
  console.log('病歷管理頁面狀態:')
  console.log('- medicalRecords數量:', medicalRecords.length)
  console.log('- displayRecords數量:', displayRecords.length)
  console.log('- 當前用戶:', user)
  console.log('- isLoading:', isLoading)
  console.log('- 用戶電話:', user?.phoneNumber || '無電話')

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
              請先登入以查看您的病歷記錄。
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

  return (
    <div className="container py-6 md:py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">病歷管理</h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">管理您的醫療記錄並查看保險理賠資格</p>
        </div>
      
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Link href="/medical-records/import" className="w-full md:w-auto">
            <Button className="gap-2 bg-teal-600 hover:bg-teal-700 w-full">
              <Upload className="h-4 w-4" />
              上傳病歷
            </Button>
          </Link>
          {/* <Link href="/medical-records/add" className="w-full md:w-auto">
            <Button variant="outline" className="gap-2 w-full">
              <Plus className="h-4 w-4" />
              手動添加
            </Button>
          </Link> */}
        </div>
      </div>

      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>提示</AlertTitle>
        <AlertDescription>
          您可以從衛服部健康存摺下載您的醫療記錄，然後上傳至平台。
          <Link href="https://eecapply.mohw.gov.tw/" target="_blank" className="ml-1 text-teal-600 hover:underline">
            前往衛服部健康存摺
          </Link>
        </AlertDescription>
      </Alert>

      <div className="overflow-x-auto pb-2">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4 h-auto flex flex-nowrap overflow-x-auto pb-px">
            <TabsTrigger value="all" className="px-4 py-2">
              全部病歷
            </TabsTrigger>
            <TabsTrigger value="eligible" className="px-4 py-2">
              可理賠病歷
            </TabsTrigger>
            <TabsTrigger value="ineligible" className="px-4 py-2">
              不可理賠病歷
            </TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="space-y-4">
            {displayRecords.length > 0 ? (
              displayRecords.map((record) => (
              <Card key={record.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3 md:gap-0">
                    <div>
                      <CardTitle className="flex flex-wrap items-center gap-2 text-lg md:text-xl">
                        {record.hospital} - {record.department}
                        {record.hasInsuranceCoverage && <Badge className="bg-teal-600 hover:bg-teal-700">可理賠</Badge>}
                      </CardTitle>
                      <CardDescription>{record.date}</CardDescription>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                      <Link href={`/medical-records/${record.id}`} className="flex-1 md:flex-initial">
                        <Button variant="ghost" size="sm" className="w-full md:w-auto">
                          <FileSearch className="h-4 w-4 mr-2" />
                          查看詳情
                        </Button>
                      </Link>
                      <Link href={`/medical-records/edit/${record.id}`} className="flex-1 md:flex-initial">
                        <Button variant="outline" size="sm" className="w-full md:w-auto">
                          <Edit className="h-4 w-4 mr-2" />
                          編輯
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-start gap-2">
                      <Stethoscope className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">診斷結果</p>
                        <p className="text-sm text-gray-500">{record.diagnosis}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Calendar className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">治療方案</p>
                        <p className="text-sm text-gray-500">{record.treatments.join(", ")}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Pill className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">用藥記錄</p>
                        <p className="text-sm text-gray-500">{record.medications.join(", ")}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 border-t flex flex-col md:flex-row md:justify-between md:items-center gap-4 md:gap-0">
                  <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 w-full">
                    <p className="text-sm text-gray-500">主治醫師: {record.doctor}</p>
                    {record.hasInsuranceCoverage && (
                      <>
                        <div className="md:hidden w-full h-px bg-gray-200"></div>
                        <MatchedPoliciesDropdown
                          count={record.matchedPolicies}
                          policies={record.matchedPoliciesDetails}
                        />
                        <Badge
                          variant="outline"
                          className={`bg-white ${
                            record.claimSuccessRate >= 90
                              ? "text-green-600 border-green-200"
                              : record.claimSuccessRate >= 70
                                ? "text-amber-600 border-amber-200"
                                : "text-red-600 border-red-200"
                          }`}
                        >
                          理賠成功率: {record.claimSuccessRate}%
                        </Badge>
                      </>
                    )}
                  </div>
                  {record.hasInsuranceCoverage && (
                    <Link href={`/claims/new?record=${record.id}`} className="w-full md:w-auto">
                      <Button size="sm" className="bg-teal-600 hover:bg-teal-700 w-full md:w-auto">
                        申請理賠
                      </Button>
                    </Link>
                  )}
                  {!record.hasInsuranceCoverage && (
                    <Button size="sm" variant="outline" disabled className="w-full md:w-auto">
                      不符合理賠條件
                    </Button>
                  )}
                </CardFooter>
                {expandedRecord === record.id && record.hasInsuranceCoverage && (
                  <div className="px-6 pb-4 border-t pt-3">
                    <h4 className="text-sm font-medium mb-2">匹配保單詳情</h4>
                    <div className="space-y-2">
                      <div className="p-3 bg-gray-50 rounded-md">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                          <div>
                            <p className="text-sm font-medium">國泰人壽 - 安心醫療保險</p>
                            <p className="text-xs text-gray-500">保單號碼: CT-MED-123456</p>
                          </div>
                          <Link href={`/insurance/1`}>
                            <Button variant="ghost" size="sm" className="h-8 w-full sm:w-auto">
                              <FileSearch className="h-3.5 w-3.5 mr-1" />
                              查看
                            </Button>
                          </Link>
                        </div>
                      </div>
                      {record.id === 1 && (
                        <div className="p-3 bg-gray-50 rounded-md">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                            <div>
                              <p className="text-sm font-medium">新光人壽 - 重大疾病保險</p>
                              <p className="text-xs text-gray-500">保單號碼: SK-CI-789012</p>
                            </div>
                            <Link href={`/insurance/2`}>
                              <Button variant="ghost" size="sm" className="h-8 w-full sm:w-auto">
                                <FileSearch className="h-3.5 w-3.5 mr-1" />
                                查看
                              </Button>
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Card>
              ))
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <FileSearch className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">尚未上傳任何病歷</h3>
                  <p className="text-gray-500 mb-4">
                    請到「我的資料」頁面上傳您的病歷記錄，上傳後將在這裡顯示
                  </p>
               
                </CardContent>
              </Card>
            )}
          </TabsContent>
          <TabsContent value="eligible" className="space-y-4">
            {displayRecords
              .filter((r) => r.hasInsuranceCoverage)
              .map((record) => (
                <Card key={record.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3 md:gap-0">
                      <div>
                        <CardTitle className="flex flex-wrap items-center gap-2 text-lg md:text-xl">
                          {record.hospital} - {record.department}
                          <Badge className="bg-teal-600 hover:bg-teal-700">可理賠</Badge>
                        </CardTitle>
                        <CardDescription>{record.date}</CardDescription>
                      </div>
                      <div className="flex gap-2 w-full md:w-auto">
                        <Link href={`/medical-records/${record.id}`} className="flex-1 md:flex-initial">
                          <Button variant="ghost" size="sm" className="w-full md:w-auto">
                            <FileSearch className="h-4 w-4 mr-2" />
                            查看詳情
                          </Button>
                        </Link>
                        <Link href={`/medical-records/edit/${record.id}`} className="flex-1 md:flex-initial">
                          <Button variant="outline" size="sm" className="w-full md:w-auto">
                            <Edit className="h-4 w-4 mr-2" />
                            編輯
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-start gap-2">
                        <Stethoscope className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium">診斷結果</p>
                          <p className="text-sm text-gray-500">{record.diagnosis}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Calendar className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium">治療方案</p>
                          <p className="text-sm text-gray-500">{record.treatments.join(", ")}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Pill className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium">用藥記錄</p>
                          <p className="text-sm text-gray-500">{record.medications.join(", ")}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-gray-50 border-t flex flex-col md:flex-row md:justify-between md:items-center gap-4 md:gap-0">
                    <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 w-full">
                      <p className="text-sm text-gray-500">主治醫師: {record.doctor}</p>
                      <div className="md:hidden w-full h-px bg-gray-200"></div>
                      <MatchedPoliciesDropdown
                        count={record.matchedPolicies}
                        policies={record.matchedPoliciesDetails}
                      />
                      <Badge
                        variant="outline"
                        className={`bg-white ${
                          record.claimSuccessRate >= 90
                            ? "text-green-600 border-green-200"
                            : record.claimSuccessRate >= 70
                              ? "text-amber-600 border-amber-200"
                              : "text-red-600 border-red-200"
                        }`}
                      >
                        理賠成功率: {record.claimSuccessRate}%
                      </Badge>
                    </div>
                    <Link href={`/claims/new?record=${record.id}`} className="w-full md:w-auto">
                      <Button size="sm" className="bg-teal-600 hover:bg-teal-700 w-full md:w-auto">
                        申請理賠
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
          </TabsContent>
          <TabsContent value="ineligible" className="space-y-4">
            {displayRecords
              .filter((r) => !r.hasInsuranceCoverage)
              .map((record) => (
                <Card key={record.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3 md:gap-0">
                      <div>
                        <CardTitle className="flex flex-wrap items-center gap-2 text-lg md:text-xl">
                          {record.hospital} - {record.department}
                        </CardTitle>
                        <CardDescription>{record.date}</CardDescription>
                      </div>
                      <div className="flex gap-2 w-full md:w-auto">
                        <Link href={`/medical-records/${record.id}`} className="flex-1 md:flex-initial">
                          <Button variant="ghost" size="sm" className="w-full md:w-auto">
                            <FileSearch className="h-4 w-4 mr-2" />
                            查看詳情
                          </Button>
                        </Link>
                        <Link href={`/medical-records/edit/${record.id}`} className="flex-1 md:flex-initial">
                          <Button variant="outline" size="sm" className="w-full md:w-auto">
                            <Edit className="h-4 w-4 mr-2" />
                            編輯
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-start gap-2">
                        <Stethoscope className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium">診斷結果</p>
                          <p className="text-sm text-gray-500">{record.diagnosis}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Calendar className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium">治療方案</p>
                          <p className="text-sm text-gray-500">{record.treatments.join(", ")}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Pill className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium">用藥記錄</p>
                          <p className="text-sm text-gray-500">{record.medications.join(", ")}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-gray-50 border-t flex flex-col md:flex-row md:justify-between md:items-center gap-4 md:gap-0">
                    <p className="text-sm text-gray-500">主治醫師: {record.doctor}</p>
                    <Button size="sm" variant="outline" disabled className="w-full md:w-auto">
                      不符合理賠條件
                    </Button>
                  </CardFooter>
                </Card>
              ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
