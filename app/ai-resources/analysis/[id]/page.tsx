"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ChevronLeft, MessageSquare, Search, Sparkles, ThumbsUp, ThumbsDown, Share2, ArrowUp } from "lucide-react"

export default function TreatmentAnalysisPage({ params }) {
  const [isLoading, setIsLoading] = useState(true)
  const [treatment, setTreatment] = useState(null)
  const [scrolled, setScrolled] = useState(false)

  // 監聽滾動事件
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // 模擬載入資料
  useEffect(() => {
    const loadData = async () => {
      // 模擬API請求延遲
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // 模擬治療資料
      const treatmentData = getTreatmentData(params.id)
      setTreatment(treatmentData)
      setIsLoading(false)
    }

    loadData()
  }, [params.id])

  // 滾動到頂部
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (isLoading) {
    return <LoadingState />
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
            <p className="text-lg text-gray-500">找不到相關治療資訊</p>
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

      {/* 頂部評分卡片 */}
      <Card className="mb-8 border-2 border-blue-200 bg-blue-50">
        <CardContent className="py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-full p-3 shadow-sm">
                <Sparkles className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{treatment.name}</h2>
                <p className="text-gray-500">自費治療評估</p>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-blue-600">{treatment.score}</div>
              <div className="text-sm text-gray-500">推薦指數 (1-100)</div>
            </div>
            <div className="flex gap-2">
              <Badge
                className={
                  treatment.score >= 80 ? "bg-green-600" : treatment.score >= 60 ? "bg-amber-600" : "bg-red-600"
                }
              >
                {treatment.score >= 80 ? "強烈推薦" : treatment.score >= 60 ? "建議考慮" : "謹慎評估"}
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

// 載入狀態組件
function LoadingState() {
  return (
    <div className="container py-8">
      <div className="mb-6">
        <Button variant="ghost" size="sm" disabled className="gap-1">
          <ChevronLeft className="h-4 w-4" />
          返回資源列表
        </Button>
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

// 模擬治療資料
function getTreatmentData(id) {
  const treatments = {
    "treatment-1": {
      id: "treatment-1",
      name: "達文西機器人手術",
      category: "手術",
      score: 85,
      overview:
        "達文西機器人手術系統是一種先進的微創手術技術，由醫生操控機器人手臂進行精確的手術操作。這種技術結合了高清3D視覺系統和精密的機器人手臂，使醫生能夠通過微小的切口進行複雜的手術程序。達文西系統最初於2000年獲得美國FDA批准用於一般腹腔鏡手術，現已廣泛應用於泌尿外科、婦科、心臟外科、一般外科等多個領域。",
      suitability: {
        description:
          "達文西機器人手術適用於需要高精度和微創方式的複雜手術，特別是在狹小空間內操作的手術。以下是特別適合使用達文西系統的情況：",
        conditions: [
          "前列腺癌根治性切除術",
          "複雜的婦科手術，如子宮切除術",
          "心臟瓣膜修復",
          "腎臟腫瘤切除術",
          "結直腸癌手術",
          "胃食管反流病手術",
          "肥胖症減重手術",
          "需要精確縫合和重建的複雜手術",
        ],
      },
      effectiveness: {
        description:
          "達文西機器人手術相比傳統開放手術和常規腹腔鏡手術，在某些方面顯示出明顯優勢，但也存在一些限制。根據多項臨床研究和實際應用經驗，其效果評估如下：",
        pros: [
          "更高的手術精確度，特別是在需要精細操作的手術中",
          "更小的切口，導致更少的疼痛和更快的恢復",
          "減少出血量，降低輸血需求",
          "住院時間縮短，患者可以更快回歸正常生活",
          "手術視野更清晰（3D高清視覺系統）",
          "醫生操作更符合人體工學，減少疲勞",
          "在某些特定手術中，如前列腺切除術，可能有更好的功能保存結果",
        ],
        cons: [
          "手術時間可能較長，特別是在醫療團隊經驗不足的情況下",
          "高昂的設備和維護成本，導致患者需支付更高的費用",
          "觸覺反饋有限，醫生無法直接感受組織阻力",
          "設備體積大，需要專門的手術室空間",
          "對於某些簡單手術，可能沒有明顯優於傳統腹腔鏡手術的效果",
          "需要專門培訓的醫療團隊，學習曲線較陡",
        ],
      },
      cost: {
        description:
          "達文西機器人手術是一項高成本的醫療技術，其費用構成包括設備投資、維護成本、耗材費用以及專業人員培訓等多個方面。在台灣，這項技術屬於自費項目，不在健保給付範圍內。",
        average: "約新台幣15-35萬元",
        range: "依手術類型不同，從10萬至50萬元不等",
        reason: "高昂的設備成本、專用耗材及技術複雜性",
      },
      risks: {
        description:
          "雖然達文西機器人手術被認為是相對安全的手術方式，但與任何手術一樣，它也存在一定的風險和可能的併發症：",
        items: [
          {
            level: "低",
            name: "手術部位感染",
            description: "發生率約1-5%，通常可通過抗生素治療",
          },
          {
            level: "低",
            name: "出血",
            description: "相比開放手術，出血風險顯著降低",
          },
          {
            level: "中",
            name: "麻醉相關風險",
            description: "與其他需要全身麻醉的手術相似",
          },
          {
            level: "中",
            name: "器官或組織損傷",
            description: "鄰近器官可能在手術過程中受到意外損傷",
          },
          {
            level: "低",
            name: "設備故障",
            description: "極少發生，但可能需要轉換為傳統手術方式",
          },
          {
            level: "高",
            name: "特定手術相關併發症",
            description: "如前列腺切除術後的尿失禁或性功能障礙",
          },
        ],
      },
      alternatives: {
        description: "對於考慮達文西機器人手術的患者，以下是幾種可能的替代方案，各有其優缺點和適用情況：",
        options: [
          {
            name: "傳統開放手術",
            coverage: "部分健保給付",
            description: "通過較大切口直接進行手術，醫生可直接觀察和觸摸器官組織。",
            cost: "健保部分給付，自費部分約3-10萬元",
          },
          {
            name: "傳統腹腔鏡手術",
            coverage: "大部分健保給付",
            description: "通過小切口插入腹腔鏡和器械進行手術，恢復較開放手術快。",
            cost: "健保給付，部分特殊耗材自費約1-5萬元",
          },
          {
            name: "單孔腹腔鏡手術",
            coverage: "部分健保給付",
            description: "只通過一個切口進行的腹腔鏡手術，傷口更小，但技術要求更高。",
            cost: "部分健保給付，自費部分約5-15萬元",
          },
          {
            name: "保守治療",
            coverage: "健保給付",
            description: "對於某些情況，可考慮藥物治療或其他非手術方法。",
            cost: "健保給付，自費藥物視情況而定",
          },
        ],
      },
      expertOpinion:
        "達文西機器人手術代表了外科技術的重要進步，特別是在需要高精度的複雜手術中。然而，它並非適用於所有患者或所有手術類型。患者應與醫生詳細討論自身情況、手術目標、可能的風險和替代方案，以及費用考量，做出最適合自己的選擇。值得注意的是，手術成功與否很大程度上取決於外科醫生的經驗和技術，而非僅僅是使用了何種手術系統。",
      conclusion:
        "達文西機器人手術為特定類型的手術提供了顯著的優勢，特別是在需要高精度和微創方式的複雜手術中。其主要優點包括更高的精確度、更小的切口、更少的出血和更快的恢復。然而，這些優勢伴隨著較高的成本，且在某些簡單手術中可能不具明顯優勢。患者在選擇時應綜合考慮自身醫療需求、經濟能力以及醫療團隊的經驗。對於複雜的泌尿外科、婦科和某些一般外科手術，特別是在狹小空間內操作的手術，達文西系統可能提供更好的手術結果，值得考慮自費選擇。",
      references: [
        {
          title: "Intuitive Surgical: da Vinci Surgical System",
          url: "https://www.intuitive.com/en-us/products-and-services/da-vinci/systems",
          authors: "Intuitive Surgical",
          year: "2023",
        },
        {
          title: "Robotic versus Laparoscopic Surgery for Rectal Cancer: A Systematic Review and Meta-analysis",
          url: "https://pubmed.ncbi.nlm.nih.gov/28513828/",
          authors: "Li X, et al.",
          year: "2017",
        },
        {
          title: "Robot-assisted radical prostatectomy: a systematic review of outcomes",
          url: "https://pubmed.ncbi.nlm.nih.gov/30173700/",
          authors: "Basiri A, et al.",
          year: "2018",
        },
        {
          title: "台灣達文西手術現況與健保給付評估",
          url: "https://www.nhi.gov.tw/Resource/webdata/Attach_15486_1_台灣達文西手術評估報告.pdf",
          authors: "衛生福利部中央健康保險署",
          year: "2021",
        },
      ],
    },
    "treatment-2": {
      id: "treatment-2",
      name: "質子治療",
      category: "癌症治療",
      score: 78,
      overview:
        "質子治療是一種先進的放射治療技術，使用加速的質子束而非傳統的X射線來治療腫瘤。質子具有獨特的物理特性，能夠將大部分能量精確地釋放在腫瘤部位，同時顯著減少對周圍健康組織的輻射劑量。這種技術於1990年代開始臨床應用，目前全球已有超過100個質子治療中心，台灣也已引進此技術。",
      suitability: {
        description: "質子治療特別適用於以下情況：",
        conditions: [
          "位於重要器官附近的腫瘤，如腦部、脊髓、眼部腫瘤",
          "兒童腫瘤（可減少長期副作用和二次腫瘤風險）",
          "頭頸部腫瘤",
          "前列腺癌",
          "某些肺癌和肝癌",
          "需要重新接受放射治療的區域",
          "對放射線敏感的腫瘤",
        ],
      },
      effectiveness: {
        description:
          "質子治療在某些特定腫瘤類型中顯示出明顯的臨床優勢，但並非對所有癌症都有顯著優於傳統放射治療的效果：",
        pros: [
          "精確的劑量分布，可減少對健康組織的損傷",
          "可能允許更高的腫瘤劑量，提高腫瘤控制率",
          "減少急性和長期副作用",
          "特別適合兒童腫瘤，可減少發育問題和二次腫瘤風險",
          "對於某些難治性腫瘤，可能是唯一可行的放射治療選擇",
          "可能改善生活質量和長期存活率",
        ],
        cons: [
          "臨床數據仍在積累中，某些腫瘤類型的長期效果尚未完全確立",
          "對於某些常見癌症，可能沒有明顯優於現代精確放射治療技術的效果",
          "治療計劃複雜，需要專業團隊和先進設備",
          "治療過程可能較長",
          "可能需要特殊固定裝置和準備程序",
        ],
      },
      cost: {
        description:
          "質子治療是一項高成本的癌症治療技術，其費用遠高於傳統放射治療。在台灣，質子治療屬於自費醫療項目，不在健保給付範圍內。",
        average: "約新台幣80-120萬元",
        range: "依腫瘤類型和治療次數，從60萬至150萬元不等",
        reason: "設備投資巨大（一個質子中心建設成本約10-20億元）、運營維護成本高、專業人員需求",
      },
      risks: {
        description: "質子治療通常被認為比傳統放射治療的副作用更少，但仍存在一些潛在風險：",
        items: [
          {
            level: "低",
            name: "治療部位皮膚反應",
            description: "如輕微發紅、乾燥或脫皮，通常較傳統放療輕微",
          },
          {
            level: "低",
            name: "疲勞",
            description: "治療期間常見，通常在治療結束後逐漸改善",
          },
          {
            level: "中",
            name: "特定器官相關副作用",
            description: "取決於治療部位，如腦部治療可能有暫時性頭痛或噁心",
          },
          {
            level: "低",
            name: "放射性腸炎或膀胱炎",
            description: "在骨盆區域治療時可能發生，但風險低於傳統放療",
          },
          {
            level: "極低",
            name: "二次腫瘤",
            description: "長期風險，但比傳統放療低",
          },
        ],
      },
      alternatives: {
        description: "對於考慮質子治療的患者，以下是幾種可能的替代治療方案：",
        options: [
          {
            name: "傳統放射治療",
            coverage: "健保給付",
            description: "使用X射線或伽瑪射線的標準放射治療，技術成熟，臨床經驗豐富。",
            cost: "健保給付，基本無自費部分",
          },
          {
            name: "調強放射治療(IMRT)",
            coverage: "健保給付",
            description: "現代精確放射治療技術，可調整射線強度，提高腫瘤劑量同時減少正常組織劑量。",
            cost: "健保給付，基本無自費部分",
          },
          {
            name: "立體定位放射治療(SBRT)",
            coverage: "部分健保給付",
            description: "高劑量、高精度的放射治療，適用於小體積腫瘤。",
            cost: "部分健保給付，自費部分約10-30萬元",
          },
          {
            name: "碳離子治療",
            coverage: "自費",
            description: "另一種粒子治療，在某些腫瘤中可能比質子治療更有效，但全球設施更少。",
            cost: "完全自費，約100-180萬元",
          },
          {
            name: "手術治療",
            coverage: "大部分健保給付",
            description: "對於某些腫瘤，手術切除可能是首選治療方式。",
            cost: "大部分健保給付，自費部分視情況而定",
          },
        ],
      },
      expertOpinion:
        "質子治療代表了放射腫瘤學的重要進步，其獨特的物理特性使其在特定腫瘤類型中具有明顯優勢。然而，這並不意味著它適用於所有癌症患者。對於位於關鍵器官附近的腫瘤、兒童腫瘤以及某些對放射線敏感的腫瘤，質子治療可能提供顯著臨床獲益。患者應與腫瘤專科醫生詳細討論自身情況、治療目標和各種選擇，包括考慮高昂的治療成本與潛在獲益的平衡。",
      conclusion:
        "質子治療作為一種先進的放射治療技術，在特定腫瘤類型中顯示出明顯的劑量分布優勢和潛在的臨床獲益。其主要價值在於能夠在提供有效腫瘤控制的同時，顯著減少對周圍健康組織的輻射損傷。這對於兒童腫瘤、腦部腫瘤、頭頸部腫瘤等特殊情況尤為重要。然而，質子治療的高成本和有限的可及性是重要考量因素。對於許多常見腫瘤，現代精確放射治療技術可能提供相似的臨床結果，且費用顯著較低。患者在選擇時應綜合考慮腫瘤類型、位置、個人健康狀況、經濟能力以及長期生活質量等因素。",
      references: [
        {
          title: "Particle Therapy Co-Operative Group (PTCOG)",
          url: "https://www.ptcog.ch/",
          authors: "PTCOG",
          year: "2023",
        },
        {
          title:
            "Clinical outcomes and late toxicities of proton beam therapy compared with intensity-modulated radiation therapy in head and neck cancer: A systematic review and meta-analysis",
          url: "https://pubmed.ncbi.nlm.nih.gov/33932273/",
          authors: "Wang L, et al.",
          year: "2021",
        },
        {
          title: "Proton therapy for pediatric cancers: a systematic review",
          url: "https://pubmed.ncbi.nlm.nih.gov/33097700/",
          authors: "Leroy R, et al.",
          year: "2020",
        },
        {
          title: "台灣質子治療現況與健保給付評估報告",
          url: "https://www.nhi.gov.tw/Resource/webdata/Attach_16275_1_質子治療評估報告.pdf",
          authors: "衛生福利部中央健康保險署",
          year: "2022",
        },
      ],
    },
  }

  return treatments[id] || null
}
