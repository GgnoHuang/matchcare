import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, FileSearch, Users, Stethoscope, Download, Building, Shield, CreditCard } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"

export default function ResourcesPage() {
  // A. 政府補助資源
  const governmentResources = [
    // 國家級
    {
      id: 1,
      category: "長照補助",
      subcategory: "國家級",
      title: "失能老人長期照顧服務補助",
      organization: "衛生福利部",
      eligibility: "65歲以上失能老人",
      amount: "每月最高12,000元",
      deadline: "常年受理",
      matchedConditions: ["乳癌第二期", "腦中風"],
      details: "針對65歲以上中度以上失能老人，提供居家照顧、日間照顧、家庭托顧等長照服務補助。",
    },
    {
      id: 2,
      category: "醫療補助",
      subcategory: "國家級",
      title: "重大傷病醫療補助",
      organization: "衛生福利部",
      eligibility: "符合全民健康保險重大傷病範圍者",
      amount: "醫療費用全額補助",
      deadline: "常年受理",
      matchedConditions: ["乳癌第二期", "心肌梗塞", "腦中風", "腦瘤"],
      details: "凡是符合健保重大傷病範圍，且領有重大傷病證明的民眾，可享有醫療費用全額補助。",
    },
    {
      id: 5,
      category: "醫療補助",
      subcategory: "國家級",
      title: "罕見疾病醫療補助",
      organization: "衛生福利部",
      eligibility: "經確診為罕見疾病患者",
      amount: "醫療費用全額補助",
      deadline: "常年受理",
      matchedConditions: [],
      details: "針對罕見疾病患者，提供醫療費用、國內外確診費用、營養品費用等補助。",
    },
    {
      id: 6,
      category: "醫療補助",
      subcategory: "國家級",
      title: "癌症篩檢補助",
      organization: "衛生福利部",
      eligibility: "符合特定年齡及風險條件者",
      amount: "篩檢費用全額補助",
      deadline: "常年受理",
      matchedConditions: ["乳癌第二期"],
      details: "針對符合條件的民眾，提供乳癌、大腸癌、口腔癌、子宮頸癌等篩檢費用補助。",
    },
    {
      id: 7,
      category: "醫療補助",
      subcategory: "國家級",
      title: "中低收入老人補助",
      organization: "衛生福利部",
      eligibility: "65歲以上中低收入老人",
      amount: "每月最高7,200元",
      deadline: "常年受理",
      matchedConditions: ["慢性阻塞性肺病", "肝硬化", "慢性腎臟病第三期"],
      details: "針對65歲以上中低收入老人，提供生活補助、醫療補助等。",
    },
    {
      id: 8,
      category: "醫療補助",
      subcategory: "國家級",
      title: "糖尿病共同照護網補助",
      organization: "衛生福利部",
      eligibility: "糖尿病患者",
      amount: "每年最高2,000元",
      deadline: "常年受理",
      matchedConditions: ["第二型糖尿病"],
      details: "針對糖尿病患者，提供衛教諮詢、營養諮詢、足部檢查等服務補助。",
    },
    {
      id: 9,
      category: "醫療補助",
      subcategory: "國家級",
      title: "精神疾病醫療補助",
      organization: "衛生福利部",
      eligibility: "精神疾病患者",
      amount: "每年最高30,000元",
      deadline: "常年受理",
      matchedConditions: ["重度憂鬱症"],
      details: "針對精神疾病患者，提供醫療費用、復健費用等補助。",
    },
    {
      id: 10,
      category: "醫療補助",
      subcategory: "國家級",
      title: "慢性病連續處方箋領藥補助",
      organization: "衛生福利部",
      eligibility: "慢性病患者",
      amount: "每次最高200元",
      deadline: "常年受理",
      matchedConditions: ["第二型糖尿病", "慢性腎臟病第三期", "類風濕性關節炎", "肝硬化", "慢性阻塞性肺病"],
      details: "針對慢性病患者，提供連續處方箋領藥交通費補助。",
    },
    {
      id: 11,
      category: "社會保險",
      subcategory: "國家級",
      title: "國民年金保險生育給付",
      organization: "勞動部",
      eligibility: "參加國民年金保險之被保險人",
      amount: "一次給付2個月投保金額",
      deadline: "分娩或早產後60日內",
      matchedConditions: [],
      details: "針對參加國民年金保險之被保險人，於分娩或早產時提供生育給付。",
    },
    {
      id: 12,
      category: "社會保險",
      subcategory: "國家級",
      title: "勞工保險職業傷病給付",
      organization: "勞動部",
      eligibility: "參加勞工保險之被保險人",
      amount: "依傷病程度給付",
      deadline: "傷病發生後5年內",
      matchedConditions: ["職業傷害"],
      details: "針對因執行職務而致傷病的勞工，提供醫療給付、傷病給付、失能給付等。",
    },
    {
      id: 13,
      category: "社會福利",
      subcategory: "國家級",
      title: "身心障礙者生活補助",
      organization: "衛生福利部",
      eligibility: "領有身心障礙證明且符合資格者",
      amount: "每月3,500元至8,200元",
      deadline: "常年受理",
      matchedConditions: ["腦中風後遺症"],
      details: "針對領有身心障礙證明且家庭經濟條件符合資格者，提供生活補助。",
    },
    {
      id: 14,
      category: "社會救助",
      subcategory: "國家級",
      title: "低收入戶醫療補助",
      organization: "衛生福利部",
      eligibility: "領有低收入戶證明者",
      amount: "醫療費用全額補助",
      deadline: "常年受理",
      matchedConditions: [],
      details: "針對領有低收入戶證明者，提供醫療費用全額補助。",
    },

    // 縣市級
    {
      id: 15,
      category: "醫療補助",
      subcategory: "縣市級",
      title: "台北市重大傷病市民醫療補助",
      organization: "台北市政府",
      eligibility: "設籍台北市且領有重大傷病證明者",
      amount: "每年最高30,000元",
      deadline: "每年1月、7月受理",
      matchedConditions: ["乳癌第二期", "腦瘤"],
      details: "針對設籍台北市且領有重大傷病證明的市民，提供醫療費用、看護費用等補助。",
    },
    {
      id: 16,
      category: "醫療補助",
      subcategory: "縣市級",
      title: "新北市身心障礙者醫療輔助器具補助",
      organization: "新北市政府",
      eligibility: "設籍新北市且領有身心障礙證明者",
      amount: "依輔具項目不同，最高補助50,000元",
      deadline: "常年受理",
      matchedConditions: ["腦中風"],
      details: "針對設籍新北市且領有身心障礙證明的市民，提供醫療輔助器具費用補助。",
    },
    {
      id: 17,
      category: "醫療補助",
      subcategory: "縣市級",
      title: "高雄市癌症患者營養品補助",
      organization: "高雄市政府",
      eligibility: "設籍高雄市之癌症患者",
      amount: "每月最高3,000元，最多補助6個月",
      deadline: "常年受理",
      matchedConditions: ["乳癌第二期"],
      details: "針對設籍高雄市之癌症患者，提供營養品費用補助。",
    },
    {
      id: 18,
      category: "醫療補助",
      subcategory: "縣市級",
      title: "台中市糖尿病患者血糖機補助",
      organization: "台中市政府",
      eligibility: "設籍台中市之糖尿病患者",
      amount: "每人最高補助2,000元",
      deadline: "每年3月、9月受理",
      matchedConditions: ["第二型糖尿病"],
      details: "針對設籍台中市之糖尿病患者，提供血糖機購置費用補助。",
    },

    // 區里級
    {
      id: 19,
      category: "社區照顧",
      subcategory: "區里級",
      title: "中正區獨居長者關懷服務",
      organization: "台北市中正區公所",
      eligibility: "設籍中正區且獨居的65歲以上長者",
      amount: "免費關懷服務",
      deadline: "常年受理",
      matchedConditions: ["慢性阻塞性肺病", "慢性腎臟病第三期"],
      details: "針對設籍中正區且獨居的65歲以上長者，提供定期關懷訪視、電話問安、緊急救援等服務。",
    },
    {
      id: 20,
      category: "社區照顧",
      subcategory: "區里級",
      title: "信義區長者送餐服務",
      organization: "台北市信義區公所",
      eligibility: "設籍信義區且行動不便的65歲以上長者",
      amount: "免費送餐服務",
      deadline: "常年受理",
      matchedConditions: ["腦中風"],
      details: "針對設籍信義區且行動不便的65歲以上長者，提供每日送餐服務。",
    },
    {
      id: 3,
      category: "輔具補助",
      subcategory: "區里級",
      title: "身心障礙者輔具費用補助",
      organization: "衛生福利部",
      eligibility: "領有身心障礙證明者",
      amount: "依輔具項目不同，最高補助40,000元",
      deadline: "常年受理",
      matchedConditions: ["骨折", "腦中風"],
      details: "針對領有身心障礙證明者，提供生活輔具、行動輔具、溝通輔具等費用補助。",
    },
    {
      id: 4,
      category: "托育補助",
      subcategory: "區里級",
      title: "特殊境遇家庭子女托育補助",
      organization: "衛生福利部",
      eligibility: "特殊境遇家庭之未滿6歲兒童",
      amount: "每名兒童每月最高5,000元",
      deadline: "每年3月、9月受理",
      matchedConditions: [],
      details: "針對特殊境遇家庭，提供未滿6歲兒童托育費用補助。",
    },
  ]

  // B. 企業福利資源
  const corporateResources = [
    {
      id: 101,
      category: "員工福利",
      subcategory: "醫療補助",
      title: "台積電員工重大疾病補助",
      organization: "台積電",
      eligibility: "台積電正職員工",
      amount: "最高200,000元",
      deadline: "常年受理",
      matchedConditions: ["乳癌第二期"],
      details: "針對罹患重大疾病的台積電正職員工，提供醫療費用補助、有薪病假等福利。",
    },
    {
      id: 102,
      category: "員工福利",
      subcategory: "醫療補助",
      title: "國泰金控員工醫療互助金",
      organization: "國泰金控",
      eligibility: "國泰金控及子公司員工",
      amount: "依疾病類型不同，最高100,000元",
      deadline: "常年受理",
      matchedConditions: ["心肌梗塞"],
      details: "針對罹患特定疾病的國泰金控及子公司員工，提供醫療互助金。",
    },
    {
      id: 103,
      category: "企業社會責任",
      subcategory: "醫療補助",
      title: "遠東集團癌症患者家庭支持計畫",
      organization: "遠東集團",
      eligibility: "癌症患者及其家庭",
      amount: "每戶最高50,000元",
      deadline: "每年3月、9月受理",
      matchedConditions: ["乳癌第二期"],
      details: "針對癌症患者及其家庭，提供經濟支持、心理諮商、家庭照顧等服務。",
    },
    {
      id: 104,
      category: "員工福利",
      subcategory: "醫療補助",
      title: "鴻海科技集團員工醫療補助",
      organization: "鴻海科技集團",
      eligibility: "鴻海科技集團正職員工",
      amount: "最高150,000元",
      deadline: "常年受理",
      matchedConditions: ["腦中風", "心肌梗塞"],
      details: "針對罹患重大疾病的鴻海科技集團正職員工，提供醫療費用補助、有薪病假等福利。",
    },
    {
      id: 105,
      category: "員工福利",
      subcategory: "醫療補助",
      title: "中華電信員工醫療補助",
      organization: "中華電信",
      eligibility: "中華電信正職員工",
      amount: "最高100,000元",
      deadline: "常年受理",
      matchedConditions: ["腦瘤"],
      details: "針對罹患重大疾病的中華電信正職員工，提供醫療費用補助、有薪病假等福利。",
    },
    {
      id: 106,
      category: "企業社會責任",
      subcategory: "醫療補助",
      title: "台塑企業社會責任醫療補助",
      organization: "台塑企業",
      eligibility: "符合條件的民眾",
      amount: "依個案評估",
      deadline: "常年受理",
      matchedConditions: ["乳癌第二期", "腦瘤"],
      details: "針對符合條件的民眾，提供醫療費用補助、心理諮商等服務。",
    },
    {
      id: 107,
      category: "企業社會責任",
      subcategory: "醫療補助",
      title: "聯發科技慈善基金會醫療補助",
      organization: "聯發科技慈善基金會",
      eligibility: "符合條件的民眾",
      amount: "依個案評估",
      deadline: "常年受理",
      matchedConditions: ["第二型糖尿病", "慢性腎臟病第三期"],
      details: "針對符合條件的民眾，提供醫療費用補助、心理諮商等服務。",
    },
  ]

  // C. 特殊金融產品的保障
  const financialResources = [
    {
      id: 201,
      category: "信用卡",
      subcategory: "醫療保障",
      title: "國泰世華卡頂級卡醫療保障",
      organization: "國泰世華銀行",
      eligibility: "國泰世華無限卡持卡人",
      amount: "最高200,000元",
      deadline: "事故發生後30天內",
      matchedConditions: ["意外傷害", "骨折"],
      details: "持卡人因意外傷害住院診療時，提供住院醫療保險金、手術醫療保險金等保障。",
    },
    {
      id: 202,
      category: "信用卡",
      subcategory: "醫療保障",
      title: "台新卡海外醫療保障",
      organization: "台新銀行",
      eligibility: "台新銀行鈦金卡以上等級持卡人",
      amount: "最高500,000元",
      deadline: "事故發生後30天內",
      matchedConditions: ["意外傷害"],
      details: "持卡人於海外因意外傷害或疾病住院診療時，提供海外醫療保險金。",
    },
    {
      id: 203,
      category: "保金產品",
      subcategory: "醫療保障",
      title: "中國信託退休金保障計畫",
      organization: "中國信託銀行",
      eligibility: "中國信託退休金保障計畫參與者",
      amount: "依參與計畫不同，最高1,000,000元",
      deadline: "事故發生後1年內",
      matchedConditions: ["重度憂鬱症", "慢性腎臟病第三期"],
      details: "參與者因特定疾病無法工作時，提供退休金保障。",
    },
    {
      id: 204,
      category: "信用卡",
      subcategory: "醫療保障",
      title: "玉山卡頂級卡醫療保障",
      organization: "玉山銀行",
      eligibility: "玉山銀行無限卡持卡人",
      amount: "最高300,000元",
      deadline: "事故發生後30天內",
      matchedConditions: ["意外傷害", "骨折"],
      details: "持卡人因意外傷害住院診療時，提供住院醫療保險金、手術醫療保險金等保障。",
    },
    {
      id: 205,
      category: "信用卡",
      subcategory: "醫療保障",
      title: "中國信託卡頂級卡醫療保障",
      organization: "中國信託銀行",
      eligibility: "中國信託銀行無限卡持卡人",
      amount: "最高250,000元",
      deadline: "事故發生後30天內",
      matchedConditions: ["意外傷害"],
      details: "持卡人因意外傷害住院診療時，提供住院醫療保險金、手術醫療保險金等保障。",
    },
    {
      id: 206,
      category: "保金產品",
      subcategory: "醫療保障",
      title: "國泰世華銀行退休金保障計畫",
      organization: "國泰世華銀行",
      eligibility: "國泰世華銀行退休金保障計畫參與者",
      amount: "依參與計畫不同，最高1,200,000元",
      deadline: "事故發生後1年內",
      matchedConditions: ["第二型糖尿病", "慢性腎臟病第三期"],
      details: "參與者因特定疾病無法工作時，提供退休金保障。",
    },
  ]

  // 特殊理賠項目
  const specialClaims = [
    {
      id: 1,
      title: "初次罹癌關懷金",
      company: "國泰人壽",
      policyNumber: "CT-MED-123456",
      policyName: "安心醫療保險",
      amount: "20,000元",
      eligibility: "首次罹患癌症且確診者",
      matchedConditions: ["乳癌第二期"],
      details: "被保險人在保險有效期間內，首次診斷確定罹患癌症，保險公司將給付初次罹癌關懷金。",
    },
    {
      id: 2,
      title: "特定傷病慰問金",
      company: "新光人壽",
      policyNumber: "SK-CI-789012",
      policyName: "重大疾病保險",
      amount: "30,000元",
      eligibility: "符合保單約定的特定傷病者",
      matchedConditions: ["心肌梗塞"],
      details: "被保險人在保險有效期間內，經診斷確定符合保險單約定的特定傷病，保險公司將給付特定傷病慰問金。",
    },
    {
      id: 3,
      title: "住院日額加倍給付",
      company: "南山人壽",
      policyNumber: "NS-MED-567890",
      policyName: "住院醫療保險",
      amount: "每日10,000元",
      eligibility: "入住加護病房或燒燙傷病房者",
      matchedConditions: ["心肌梗塞"],
      details: "被保險人住院期間入住加護病房或燒燙傷病房時，保險公司將提供雙倍的住院日額給付。",
    },
  ]

  // 獲取資源的圖標
  const getResourceIcon = (category) => {
    switch (category) {
      case "長照補助":
      case "醫療補助":
      case "輔具補助":
      case "托育補助":
      case "社會保險":
      case "社會福利":
      case "社會救助":
      case "社區照顧":
        return <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
      case "員工福利":
      case "企業社會責任":
        return <Building className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
      case "信用卡":
      case "保金產品":
        return <CreditCard className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
      default:
        return <FileText className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
    }
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">其他福利資源</h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">查看各種政府補助、企業福利及特殊理賠項目</p>
        </div>
      </div>

      <Alert className="mb-6">
        <Stethoscope className="h-4 w-4" />
        <AlertTitle>智能匹配</AlertTitle>
        <AlertDescription>
          系統已根據您的病歷資料和保單條款，自動匹配可申請的政府補助資源、企業福利及特殊理賠項目。
          請點擊各項目了解詳情及申請方式。
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="government" className="w-full">
        <TabsList className="mb-4 w-full overflow-x-auto flex-nowrap">
          <TabsTrigger value="government">政府補助資源</TabsTrigger>
          <TabsTrigger value="corporate">企業福利資源</TabsTrigger>
          <TabsTrigger value="financial">特殊金融產品</TabsTrigger>
          <TabsTrigger value="special">特殊理賠項目</TabsTrigger>
          <TabsTrigger value="all">全部資源</TabsTrigger>
        </TabsList>

        {/* 政府補助資源 */}
        <TabsContent value="government" className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-bold">國家級資源</h2>
          </div>
          <div className="space-y-4">
            {governmentResources
              .filter((resource) => resource.subcategory === "國家級" && resource.matchedConditions.length > 0)
              .map((resource) => (
                <Card key={resource.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className="bg-blue-600 hover:bg-blue-700">{resource.category}</Badge>
                          <CardTitle className="text-lg md:text-xl">{resource.title}</CardTitle>
                        </div>
                        <CardDescription>主辦單位: {resource.organization}</CardDescription>
                      </div>
                      <Link href={`/resources/${resource.id}`}>
                        <Button variant="ghost" size="sm" className="w-full md:w-auto">
                          <FileSearch className="h-4 w-4 mr-2" />
                          查看詳情
                        </Button>
                      </Link>
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
                        <FileText className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
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
                  <CardFooter className="bg-gray-50 border-t">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center w-full gap-4">
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-500">匹配病歷: {resource.matchedConditions.join(", ")}</p>
                      </div>
                      <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                        <Button size="sm" variant="outline" className="gap-1 w-full md:w-auto">
                          <Download className="h-3 w-3" />
                          下載申請表
                        </Button>
                        <Link href={`/resources/apply/${resource.id}`} className="w-full md:w-auto">
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 w-full">
                            線上申請
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              ))}
          </div>

          <div className="flex items-center gap-2 mb-4 mt-8">
            <Building className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-bold">縣市級資源</h2>
          </div>
          <div className="space-y-4">
            {governmentResources
              .filter((resource) => resource.subcategory === "縣市級" && resource.matchedConditions.length > 0)
              .map((resource) => (
                <Card key={resource.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className="bg-blue-600 hover:bg-blue-700">{resource.category}</Badge>
                          <CardTitle className="text-lg md:text-xl">{resource.title}</CardTitle>
                        </div>
                        <CardDescription>主辦單位: {resource.organization}</CardDescription>
                      </div>
                      <Link href={`/resources/${resource.id}`}>
                        <Button variant="ghost" size="sm" className="w-full md:w-auto">
                          <FileSearch className="h-4 w-4 mr-2" />
                          查看詳情
                        </Button>
                      </Link>
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
                        <FileText className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
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
                  <CardFooter className="bg-gray-50 border-t">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center w-full gap-4">
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-500">匹配病歷: {resource.matchedConditions.join(", ")}</p>
                      </div>
                      <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                        <Button size="sm" variant="outline" className="gap-1 w-full md:w-auto">
                          <Download className="h-3 w-3" />
                          下載申請表
                        </Button>
                        <Link href={`/resources/apply/${resource.id}`} className="w-full md:w-auto">
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 w-full">
                            線上申請
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              ))}
          </div>

          <div className="flex items-center gap-2 mb-4 mt-8">
            <Users className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-bold">區里級資源</h2>
          </div>
          <div className="space-y-4">
            {governmentResources
              .filter((resource) => resource.subcategory === "區里級" && resource.matchedConditions.length > 0)
              .map((resource) => (
                <Card key={resource.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className="bg-blue-600 hover:bg-blue-700">{resource.category}</Badge>
                          <CardTitle className="text-lg md:text-xl">{resource.title}</CardTitle>
                        </div>
                        <CardDescription>主辦單位: {resource.organization}</CardDescription>
                      </div>
                      <Link href={`/resources/${resource.id}`}>
                        <Button variant="ghost" size="sm" className="w-full md:w-auto">
                          <FileSearch className="h-4 w-4 mr-2" />
                          查看詳情
                        </Button>
                      </Link>
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
                        <FileText className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
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
                  <CardFooter className="bg-gray-50 border-t">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center w-full gap-4">
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-500">匹配病歷: {resource.matchedConditions.join(", ")}</p>
                      </div>
                      <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                        <Button size="sm" variant="outline" className="gap-1 w-full md:w-auto">
                          <Download className="h-3 w-3" />
                          下載申請表
                        </Button>
                        <Link href={`/resources/apply/${resource.id}`} className="w-full md:w-auto">
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 w-full">
                            線上申請
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </TabsContent>

        {/* 企業福利資源 */}
        <TabsContent value="corporate" className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-bold">企業福利資源</h2>
            <Badge className="bg-green-600">
              {corporateResources.filter((r) => r.matchedConditions.length > 0).length}項
            </Badge>
          </div>
          {corporateResources
            .filter((resource) => resource.matchedConditions.length > 0)
            .map((resource) => (
              <Card key={resource.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className="bg-green-600 hover:bg-green-700">{resource.category}</Badge>
                        <CardTitle className="text-lg md:text-xl">{resource.title}</CardTitle>
                      </div>
                      <CardDescription>主辦單位: {resource.organization}</CardDescription>
                    </div>
                    <Link href={`/resources/${resource.id}`}>
                      <Button variant="ghost" size="sm" className="w-full md:w-auto">
                        <FileSearch className="h-4 w-4 mr-2" />
                        查看詳情
                      </Button>
                    </Link>
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
                      <FileText className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
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
                <CardFooter className="bg-gray-50 border-t">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center w-full gap-4">
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-500">匹配病歷: {resource.matchedConditions.join(", ")}</p>
                    </div>
                    <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                      <Button size="sm" variant="outline" className="gap-1 w-full md:w-auto">
                        <Download className="h-3 w-3" />
                        下載申請表
                      </Button>
                      <Link href={`/resources/apply/${resource.id}`} className="w-full md:w-auto">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 w-full">
                          線上申請
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            ))}

          {corporateResources.filter((resource) => resource.matchedConditions.length > 0).length === 0 && (
            <div className="text-center py-10">
              <p className="text-gray-500">未找到符合您條件的企業福利資源</p>
            </div>
          )}
        </TabsContent>

        {/* 特殊金融產品 */}
        <TabsContent value="financial" className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-bold">特殊金融產品保障</h2>
            <Badge className="bg-purple-600">
              {financialResources.filter((r) => r.matchedConditions.length > 0).length}項
            </Badge>
          </div>
          {financialResources
            .filter((resource) => resource.matchedConditions.length > 0)
            .map((resource) => (
              <Card key={resource.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className="bg-purple-600 hover:bg-purple-700">{resource.category}</Badge>
                        <CardTitle className="text-lg md:text-xl">{resource.title}</CardTitle>
                      </div>
                      <CardDescription>主辦單位: {resource.organization}</CardDescription>
                    </div>
                    <Link href={`/resources/${resource.id}`}>
                      <Button variant="ghost" size="sm" className="w-full md:w-auto">
                        <FileSearch className="h-4 w-4 mr-2" />
                        查看詳情
                      </Button>
                    </Link>
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
                        <p className="text-sm font-medium">保障金額</p>
                        <p className="text-sm text-gray-500">{resource.amount}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <FileText className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
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
                <CardFooter className="bg-gray-50 border-t">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center w-full gap-4">
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-500">匹配病歷: {resource.matchedConditions.join(", ")}</p>
                    </div>
                    <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                      <Button size="sm" variant="outline" className="gap-1 w-full md:w-auto">
                        <Download className="h-3 w-3" />
                        下載申請表
                      </Button>
                      <Link href={`/resources/apply/${resource.id}`} className="w-full md:w-auto">
                        <Button size="sm" className="bg-purple-600 hover:bg-purple-700 w-full">
                          線上申請
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            ))}

          {financialResources.filter((resource) => resource.matchedConditions.length > 0).length === 0 && (
            <div className="text-center py-10">
              <p className="text-gray-500">未找到符合您條件的特殊金融產品保障</p>
            </div>
          )}
        </TabsContent>

        {/* 特殊理賠項目 */}
        <TabsContent value="special" className="space-y-4">
          {specialClaims.map((claim) => (
            <Card key={claim.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                  <div>
                    <CardTitle className="text-lg md:text-xl">{claim.title}</CardTitle>
                    <CardDescription>
                      {claim.company} - {claim.policyName} ({claim.policyNumber})
                    </CardDescription>
                  </div>
                  <Link href={`/special-claims/${claim.id}`}>
                    <Button variant="ghost" size="sm" className="w-full md:w-auto">
                      <FileSearch className="h-4 w-4 mr-2" />
                      查看詳情
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-start gap-2">
                    <Users className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">申請資格</p>
                      <p className="text-sm text-gray-500">{claim.eligibility}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <FileText className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">理賠金額</p>
                      <p className="text-sm text-gray-500">{claim.amount}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-700">{claim.details}</p>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 border-t">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center w-full gap-4">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-500">匹配病歷: {claim.matchedConditions.join(", ")}</p>
                  </div>
                  <Link href={`/claims/new/special/${claim.id}`} className="w-full md:w-auto">
                    <Button size="sm" className="bg-teal-600 hover:bg-teal-700 w-full">
                      申請理賠
                    </Button>
                  </Link>
                </div>
              </CardFooter>
            </Card>
          ))}

          {specialClaims.length === 0 && (
            <div className="text-center py-10">
              <p className="text-gray-500">未找到符合您條件的特殊理賠項目</p>
            </div>
          )}
        </TabsContent>

        {/* 全部資源 */}
        <TabsContent value="all" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <h3 className="font-medium">政府補助資源</h3>
                  </div>
                  <Badge className="bg-blue-600">
                    {governmentResources.filter((r) => r.matchedConditions.length > 0).length}項
                  </Badge>
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
                  <Badge className="bg-green-600">
                    {corporateResources.filter((r) => r.matchedConditions.length > 0).length}項
                  </Badge>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-purple-600" />
                    <h3 className="font-medium">特殊金融產品</h3>
                  </div>
                  <Badge className="bg-purple-600">
                    {financialResources.filter((r) => r.matchedConditions.length > 0).length}項
                  </Badge>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-teal-50 border-teal-200">
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-teal-600" />
                    <h3 className="font-medium">特殊理賠項目</h3>
                  </div>
                  <Badge className="bg-teal-600">{specialClaims.length}項</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <h2 className="text-xl md:text-2xl font-bold mt-6 mb-4">政府補助資源</h2>
          <div className="space-y-2 mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              國家級資源
            </h3>
          </div>
          {governmentResources
            .filter((resource) => resource.subcategory === "國家級")
            .map((resource) => (
              <Card
                key={resource.id}
                className={`overflow-hidden ${resource.matchedConditions.length === 0 ? "opacity-60" : ""}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-600 hover:bg-blue-700">{resource.category}</Badge>
                        <CardTitle className="text-lg">{resource.title}</CardTitle>
                        {resource.matchedConditions.length === 0 && (
                          <Badge variant="outline" className="bg-white">
                            不符合
                          </Badge>
                        )}
                      </div>
                      <CardDescription>主辦單位: {resource.organization}</CardDescription>
                    </div>
                    <Link href={`/resources/${resource.id}`}>
                      <Button variant="ghost" size="sm">
                        <FileSearch className="h-4 w-4 mr-2" />
                        查看詳情
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-start gap-2">
                      <Users className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">申請資格</p>
                        <p className="text-sm text-gray-500">{resource.eligibility}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">補助金額</p>
                        <p className="text-sm text-gray-500">{resource.amount}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">申請期限</p>
                        <p className="text-sm text-gray-500">{resource.deadline}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 border-t">
                  <div className="flex justify-between items-center w-full">
                    <div className="flex items-center gap-2">
                      {resource.matchedConditions.length > 0 ? (
                        <p className="text-sm text-gray-500">匹配病歷: {resource.matchedConditions.join(", ")}</p>
                      ) : (
                        <p className="text-sm text-gray-500">未匹配到相關病歷</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="gap-1">
                        <Download className="h-3 w-3" />
                        下載申請表
                      </Button>
                      <Link href={`/resources/apply/${resource.id}`}>
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                          disabled={resource.matchedConditions.length === 0}
                        >
                          線上申請
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            ))}

          <div className="space-y-2 mb-4 mt-8">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Building className="h-5 w-5 text-blue-600" />
              縣市級資源
            </h3>
          </div>
          {governmentResources
            .filter((resource) => resource.subcategory === "縣市級")
            .map((resource) => (
              <Card
                key={resource.id}
                className={`overflow-hidden ${resource.matchedConditions.length === 0 ? "opacity-60" : ""}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-600 hover:bg-blue-700">{resource.category}</Badge>
                        <CardTitle className="text-lg">{resource.title}</CardTitle>
                        {resource.matchedConditions.length === 0 && (
                          <Badge variant="outline" className="bg-white">
                            不符合
                          </Badge>
                        )}
                      </div>
                      <CardDescription>主辦單位: {resource.organization}</CardDescription>
                    </div>
                    <Link href={`/resources/${resource.id}`}>
                      <Button variant="ghost" size="sm">
                        <FileSearch className="h-4 w-4 mr-2" />
                        查看詳情
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-start gap-2">
                      <Users className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">申請資格</p>
                        <p className="text-sm text-gray-500">{resource.eligibility}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">補助金額</p>
                        <p className="text-sm text-gray-500">{resource.amount}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">申請期限</p>
                        <p className="text-sm text-gray-500">{resource.deadline}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 border-t">
                  <div className="flex justify-between items-center w-full">
                    <div className="flex items-center gap-2">
                      {resource.matchedConditions.length > 0 ? (
                        <p className="text-sm text-gray-500">匹配病歷: {resource.matchedConditions.join(", ")}</p>
                      ) : (
                        <p className="text-sm text-gray-500">未匹配到相關病歷</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="gap-1">
                        <Download className="h-3 w-3" />
                        下載申請表
                      </Button>
                      <Link href={`/resources/apply/${resource.id}`}>
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                          disabled={resource.matchedConditions.length === 0}
                        >
                          線上申請
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            ))}

          <div className="space-y-2 mb-4 mt-8">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              區里級資源
            </h3>
          </div>
          {governmentResources
            .filter((resource) => resource.subcategory === "區里級")
            .map((resource) => (
              <Card
                key={resource.id}
                className={`overflow-hidden ${resource.matchedConditions.length === 0 ? "opacity-60" : ""}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-600 hover:bg-blue-700">{resource.category}</Badge>
                        <CardTitle className="text-lg">{resource.title}</CardTitle>
                        {resource.matchedConditions.length === 0 && (
                          <Badge variant="outline" className="bg-white">
                            不符合
                          </Badge>
                        )}
                      </div>
                      <CardDescription>主辦單位: {resource.organization}</CardDescription>
                    </div>
                    <Link href={`/resources/${resource.id}`}>
                      <Button variant="ghost" size="sm">
                        <FileSearch className="h-4 w-4 mr-2" />
                        查看詳情
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-start gap-2">
                      <Users className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">申請資格</p>
                        <p className="text-sm text-gray-500">{resource.eligibility}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">補助金額</p>
                        <p className="text-sm text-gray-500">{resource.amount}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">申請期限</p>
                        <p className="text-sm text-gray-500">{resource.deadline}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 border-t">
                  <div className="flex justify-between items-center w-full">
                    <div className="flex items-center gap-2">
                      {resource.matchedConditions.length > 0 ? (
                        <p className="text-sm text-gray-500">匹配病歷: {resource.matchedConditions.join(", ")}</p>
                      ) : (
                        <p className="text-sm text-gray-500">未匹配到相關病歷</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="gap-1">
                        <Download className="h-3 w-3" />
                        下載申請表
                      </Button>
                      <Link href={`/resources/apply/${resource.id}`}>
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                          disabled={resource.matchedConditions.length === 0}
                        >
                          線上申請
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            ))}

          <Separator className="my-8" />

          <h2 className="text-xl md:text-2xl font-bold mb-4">企業福利資源</h2>
          {corporateResources.map((resource) => (
            <Card
              key={resource.id}
              className={`overflow-hidden mb-4 ${resource.matchedConditions.length === 0 ? "opacity-60" : ""}`}
            >
              <CardHeader className="pb-2">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-600 hover:bg-green-700">{resource.category}</Badge>
                      <CardTitle className="text-lg">{resource.title}</CardTitle>
                      {resource.matchedConditions.length === 0 && (
                        <Badge variant="outline" className="bg-white">
                          不符合
                        </Badge>
                      )}
                    </div>
                    <CardDescription>主辦單位: {resource.organization}</CardDescription>
                  </div>
                  <Link href={`/resources/${resource.id}`}>
                    <Button variant="ghost" size="sm">
                      <FileSearch className="h-4 w-4 mr-2" />
                      查看詳情
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-start gap-2">
                    <Users className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">申請資格</p>
                      <p className="text-sm text-gray-500">{resource.eligibility}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">補助金額</p>
                      <p className="text-sm text-gray-500">{resource.amount}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">申請期限</p>
                      <p className="text-sm text-gray-500">{resource.deadline}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 border-t">
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center gap-2">
                    {resource.matchedConditions.length > 0 ? (
                      <p className="text-sm text-gray-500">匹配病歷: {resource.matchedConditions.join(", ")}</p>
                    ) : (
                      <p className="text-sm text-gray-500">未匹配到相關病歷</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="gap-1">
                      <Download className="h-3 w-3" />
                      下載申請表
                    </Button>
                    <Link href={`/resources/apply/${resource.id}`}>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        disabled={resource.matchedConditions.length === 0}
                      >
                        線上申請
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))}

          <Separator className="my-8" />

          <h2 className="text-xl md:text-2xl font-bold mb-4">特殊金融產品保障</h2>
          {financialResources.map((resource) => (
            <Card
              key={resource.id}
              className={`overflow-hidden mb-4 ${resource.matchedConditions.length === 0 ? "opacity-60" : ""}`}
            >
              <CardHeader className="pb-2">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-purple-600 hover:bg-purple-700">{resource.category}</Badge>
                      <CardTitle className="text-lg">{resource.title}</CardTitle>
                      {resource.matchedConditions.length === 0 && (
                        <Badge variant="outline" className="bg-white">
                          不符合
                        </Badge>
                      )}
                    </div>
                    <CardDescription>主辦單位: {resource.organization}</CardDescription>
                  </div>
                  <Link href={`/resources/${resource.id}`}>
                    <Button variant="ghost" size="sm">
                      <FileSearch className="h-4 w-4 mr-2" />
                      查看詳情
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-start gap-2">
                    <Users className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">申請資格</p>
                      <p className="text-sm text-gray-500">{resource.eligibility}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">保障金額</p>
                      <p className="text-sm text-gray-500">{resource.amount}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">申請期限</p>
                      <p className="text-sm text-gray-500">{resource.deadline}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 border-t">
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center gap-2">
                    {resource.matchedConditions.length > 0 ? (
                      <p className="text-sm text-gray-500">匹配病歷: {resource.matchedConditions.join(", ")}</p>
                    ) : (
                      <p className="text-sm text-gray-500">未匹配到相關病歷</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="gap-1">
                      <Download className="h-3 w-3" />
                      下載申請表
                    </Button>
                    <Link href={`/resources/apply/${resource.id}`}>
                      <Button
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700"
                        disabled={resource.matchedConditions.length === 0}
                      >
                        線上申請
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))}

          <Separator className="my-8" />

          <h2 className="text-xl md:text-2xl font-bold mb-4">特殊理賠項目</h2>
          {specialClaims.map((claim) => (
            <Card key={claim.id} className="overflow-hidden mb-4">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{claim.title}</CardTitle>
                    <CardDescription>
                      {claim.company} - {claim.policyName} ({claim.policyNumber})
                    </CardDescription>
                  </div>
                  <Link href={`/special-claims/${claim.id}`}>
                    <Button variant="ghost" size="sm">
                      <FileSearch className="h-4 w-4 mr-2" />
                      查看詳情
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-2">
                    <Users className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">申請資格</p>
                      <p className="text-sm text-gray-500">{claim.eligibility}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">理賠金額</p>
                      <p className="text-sm text-gray-500">{claim.amount}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-700">{claim.details}</p>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 border-t">
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-500">匹配病歷: {claim.matchedConditions.join(", ")}</p>
                  </div>
                  <Link href={`/claims/new/special/${claim.id}`}>
                    <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
                      申請理賠
                    </Button>
                  </Link>
                </div>
              </CardFooter>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
