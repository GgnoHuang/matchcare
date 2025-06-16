import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, CheckCircle2, BarChart3, Sparkles } from "lucide-react"
import { SmartStartButton } from "@/app/components/smart-start-button"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-gray-50">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-teal-100 px-3 py-1 text-sm text-teal-700">全新上線</div>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  一鍵同步病歷與保單，理賠不再迷路！
                </h1>
                <p className="max-w-[600px] text-gray-500 md:text-xl">
                  醫保快線讓您輕鬆導入醫療記錄，自動匹配保險保單，快速完成理賠申請。不再為繁瑣的理賠程序煩惱。
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <SmartStartButton />
                  {/* <Link href="/subscription">
                    <Button variant="outline">查看訂閱方案</Button>
                  </Link> */}
                </div>
              </div>
              <div className="relative">
                <img
                  src="/images/ai-insurance-checkup.png"
                  alt="AI保單健檢系統截圖"
                  className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 bg-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none border-teal-600 text-teal-600">
                  簡單五步驟
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">理賠流程全自動化</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  醫保快線讓您輕鬆完成從病歷導入到理賠申請的全過程，省時省力又安心
                </p>
              </div>
            </div>
            <div className="mx-auto max-w-5xl mt-12">
              {/* 桌面版 - 水平流程 */}
              <div className="hidden md:grid md:grid-cols-5 md:gap-12">
                {[
                  { number: "1", title: "病歷導入", desc: "從衛服部健康存摺下載您的醫療記錄，並上傳至平台" },
                  { number: "2", title: "保單連結", desc: "導入您的保險保單資訊，或手動添加保單詳情" },
                  { number: "3", title: "智能比對", desc: "系統自動分析病歷與保單，找出符合理賠條件的項目" },
                  { number: "4", title: "資料預覽", desc: "確認理賠申請資料，上傳必要文件" },
                  { number: "5", title: "一鍵送出", desc: "直接透過API將理賠申請送至保險公司" },
                ].map((step, index) => (
                  <div key={index} className="relative pt-4 border-t border-dashed">
                    <div className="absolute -top-3 left-0 flex h-6 w-6 items-center justify-center rounded-full bg-teal-600 text-white">
                      {step.number}
                    </div>
                    <h3 className="text-xl font-bold mt-4">{step.title}</h3>
                    <p className="text-sm text-gray-500 mt-2">{step.desc}</p>
                  </div>
                ))}
              </div>

              {/* 手機版 - 卡片式流程 */}
              <div className="grid grid-cols-1 gap-6 md:hidden">
                {[
                  { number: "1", title: "病歷導入", desc: "從衛服部健康存摺下載您的醫療記錄，並上傳至平台" },
                  { number: "2", title: "保單連結", desc: "導入您的保險保單資訊，或手動添加保單詳情" },
                  { number: "3", title: "智能比對", desc: "系統自動分析病歷與保單，找出符合理賠條件的項目" },
                  { number: "4", title: "資料預覽", desc: "確認理賠申請資料，上傳必要文件" },
                  { number: "5", title: "一鍵送出", desc: "直接透過API將理賠申請送至保險公司" },
                ].map((step, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-100"
                  >
                    <div className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-teal-600 text-white font-medium">
                      {step.number}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{step.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">平台特色功能</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  醫保快線提供多項創新功能，讓您的理賠體驗更加順暢
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-12 mt-8">
              <Card>
                <CardHeader className="pb-2">
                  <BarChart3 className="h-10 w-10 text-teal-600 mb-2" />
                  <CardTitle>理賠成功率預測</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    運用AI技術分析您的病歷與保單條款，預測理賠成功機率，並提供優化建議
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <Sparkles className="h-10 w-10 text-teal-600 mb-2" />
                  <CardTitle>一鍵AI找保障</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    智能比對您的所有病歷資料，快速匹配各類政府補助與保險保障，提供最全面的權益建議
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CheckCircle2 className="h-10 w-10 text-teal-600 mb-2" />
                  <CardTitle>全程理賠追蹤</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">即時掌握理賠申請進度，系統自動通知最新狀態，讓您安心等待</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* 訂閱方案區塊 */}
        {/* <section className="w-full py-12 md:py-24 bg-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">訂閱方案</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  選擇最適合您需求的方案，開始使用醫保快線的完整功能
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 md:grid-cols-3 gap-8 mt-8">
              <Card className="border-gray-200">
                <CardContent className="pt-6">
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold">基本方案</h3>
                    <div className="mt-2">
                      <span className="text-3xl font-bold">$149</span>
                      <span className="text-gray-500"> / 月</span>
                    </div>
                    <div className="mt-1 text-sm text-teal-600">年約月付 $129/月</div>
                  </div>
                  <div className="space-y-2 mt-6">
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-teal-500 mr-2 mt-0.5" />
                      <span className="text-sm">病歷管理 (最多10筆)</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-teal-500 mr-2 mt-0.5" />
                      <span className="text-sm">保單管理 (最多5份)</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-teal-500 mr-2 mt-0.5" />
                      <span className="text-sm">理賠申請 (每月3次)</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-teal-500 mr-2 mt-0.5" />
                      <span className="text-sm">基本資源匹配</span>
                    </div>
                  </div>
                  <div className="mt-6">
                    <Button asChild className="w-full">
                      <Link href="/subscription">選擇方案</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-teal-500 shadow-lg relative">
                <div className="absolute top-0 right-0 bg-teal-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                  推薦方案
                </div>
                <CardContent className="pt-6">
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold">進階方案</h3>
                    <div className="mt-2">
                      <span className="text-3xl font-bold">$599</span>
                      <span className="text-gray-500"> / 月</span>
                    </div>
                    <div className="mt-1 text-sm text-teal-600">年約月付 $499/月</div>
                  </div>
                  <div className="space-y-2 mt-6">
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-teal-500 mr-2 mt-0.5" />
                      <span className="text-sm">病歷管理 (無限制)</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-teal-500 mr-2 mt-0.5" />
                      <span className="text-sm">保單管理 (無限制)</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-teal-500 mr-2 mt-0.5" />
                      <span className="text-sm">理賠申請 (無限制)</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-teal-500 mr-2 mt-0.5" />
                      <span className="text-sm">優先資源匹配</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-teal-500 mr-2 mt-0.5" />
                      <span className="text-sm">優先客服支援</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-teal-500 mr-2 mt-0.5" />
                      <span className="text-sm">理賠成功率分析</span>
                    </div>
                  </div>
                  <div className="mt-6">
                    <Button asChild className="w-full bg-teal-600 hover:bg-teal-700">
                      <Link href="/subscription">選擇方案</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200">
                <CardContent className="pt-6">
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold">專業方案</h3>
                    <div className="mt-2">
                      <span className="text-3xl font-bold">$-</span>
                      <span className="text-gray-500"> / 月</span>
                    </div>
                    <div className="mt-1 text-sm text-teal-600">適用於保險從業人員</div>
                  </div>
                  <div className="space-y-2 mt-6">
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-teal-500 mr-2 mt-0.5" />
                      <span className="text-sm">可管理人數 n 人</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-teal-500 mr-2 mt-0.5" />
                      <span className="text-sm">病歷管理 (無限制)</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-teal-500 mr-2 mt-0.5" />
                      <span className="text-sm">保單管理 (無限制)</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-teal-500 mr-2 mt-0.5" />
                      <span className="text-sm">理賠申請 (無限制)</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-teal-500 mr-2 mt-0.5" />
                      <span className="text-sm">專業分析報表</span>
                    </div>
                  </div>
                  <div className="mt-6">
                    <Button asChild className="w-full">
                      <Link href="/contact">聯繫醫保</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section> */}

        <section className="w-full py-12 md:py-24 bg-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">合作院所</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  我們與台灣主要醫療院所合作，提供便捷的病歷導入和醫療諮詢服務
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 md:grid-cols-4 mt-8">
              {[
                { name: "臺大醫院", logo: "/images/hospital-ntu.png" },
                { name: "榮民總醫院", logo: "/images/hospital-vghtpe.png" },
                { name: "長庚醫院", logo: "/images/hospital-cgmh.png" },
                { name: "輔大醫院", logo: "/images/hospital-fjuh.png" },
                { name: "奇美醫院", logo: "/images/hospital-chimei.jpg" },
                { name: "成大醫院", logo: "/images/hospital-ncku.jpg" },
                { name: "高醫大附醫", logo: "/images/hospital-kmuh.jpg" },
                { name: "三軍總醫院", logo: "/images/hospital-tsgh.jpg" },
              ].map((hospital) => (
                <div
                  key={hospital.name}
                  className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-sm border gap-3"
                >
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                    <img
                      src={hospital.logo || "/placeholder.svg"}
                      alt={hospital.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="font-medium text-center">{hospital.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 bg-gray-50">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none border-teal-600 text-teal-600">
                    立即開始
                  </div>
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                    不再為理賠程序煩惱，讓醫保快線為您服務
                  </h2>
                  <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    註冊帳號，立即體驗醫保快線帶來的便利與安心
                  </p>
                </div>
                <SmartStartButton />
              </div>
              <img
                src="/images/medical-insurance-portal.png"
                alt="醫保快線整合病歷與保單的平台"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full"
              />
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t bg-white">
        <div className="container flex flex-col gap-4 py-10 md:flex-row md:gap-8">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-teal-600" />
              <div>
                <div className="text-lg font-bold">醫保快線</div>
                <div className="text-xs text-muted-foreground">MatchCare</div>
              </div>
            </div>
            <p className="text-sm text-gray-500">一鍵同步病歷與保單，理賠不再迷路！</p>
          </div>
          <div className="flex flex-col md:flex-row gap-8 md:gap-12">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">平台</h4>
              <ul className="grid gap-2 text-sm">
                <li>
                  <Link href="/about" className="text-gray-500 hover:text-teal-600 transition-colors">
                    關於我們
                  </Link>
                </li>
                <li>
                  <Link href="/features" className="text-gray-500 hover:text-teal-600 transition-colors">
                    功能介紹
                  </Link>
                </li>
                {/* <li>
                  <Link href="/subscription" className="text-gray-500 hover:text-teal-600 transition-colors">
                    訂閱方案
                  </Link>
                </li> */}
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium">資源</h4>
              <ul className="grid gap-2 text-sm">
                <li>
                  <Link href="/help" className="text-gray-500 hover:text-teal-600 transition-colors">
                    幫助中心
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-gray-500 hover:text-teal-600 transition-colors">
                    常見問題
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-500 hover:text-teal-600 transition-colors">
                    聯繫我們
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium">法律</h4>
              <ul className="grid gap-2 text-sm">
                <li>
                  <Link href="/terms" className="text-gray-500 hover:text-teal-600 transition-colors">
                    使用條款
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-gray-500 hover:text-teal-600 transition-colors">
                    隱私政策
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t py-6">
          <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-xs text-gray-500">© 2024 醫保快線 MatchCare. 保留所有權利.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
