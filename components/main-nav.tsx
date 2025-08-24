"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Shield, Menu, X, User, LogOut, Sparkles, FileText, Zap } from "lucide-react"
import { usePathname } from "next/navigation"
import { checkAuth, logout } from "@/app/actions/auth-service"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function MainNav() {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const [user, setUser] = useState<{ username: string; name?: string; phoneNumber?: string; email?: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [subscription, setSubscription] = useState<any>(null)

  useEffect(() => {
    const fetchAuthStatus = async () => {
      try {
        const { isLoggedIn, user } = await checkAuth()
        if (isLoggedIn && user) {
          setUser(user)

          // 檢查訂閱狀態 (模擬)
          const cookies = document.cookie.split(";").reduce(
            (acc, cookie) => {
              const [key, value] = cookie.trim().split("=")
              acc[key] = value
              return acc
            },
            {} as Record<string, string>,
          )

          if (cookies.subscription) {
            try {
              const subscriptionData = JSON.parse(decodeURIComponent(cookies.subscription))
              setSubscription(subscriptionData)
            } catch (e) {
              console.error("解析訂閱數據錯誤:", e)
            }
          }
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error("檢查身份驗證失敗:", error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAuthStatus()
  }, [])

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`)
  }

  const handleLogout = async () => {
    try {
      const result = await logout()
      if (result.success) {
        setUser(null)
        // 重新加載頁面以確保所有組件都能獲取到最新的登入狀態
        window.location.reload()
      }
    } catch (error) {
      console.error("登出失敗:", error)
    }
  }


  // 主要功能項目
  const primaryNavItems = [
    {
      href: "/ai-resources",
      label: "AI保障搜尋",
      icon: <Sparkles className="h-4 w-4" />,
      description: "智能匹配保障資源",
    },
    {
      href: "/ai-insurance-wizard",
      label: "AI保險精靈",
      icon: <Zap className="h-4 w-4" />,
      description: "上傳保單立即分析",
    },
    // {
    //   href: "/claims",
    //   label: "理賠申請",
    //   icon: <FileText className="h-4 w-4" />,
    //   description: "快速申請理賠",
    // },//功能移動別的BTN去
  ]

  // 次要功能項目
  const secondaryNavItems = [
    // { href: "/", label: "首頁" },
    { href: "/insurance", label: "保單總覽" },
    { href: "/medical-records", label: "病歷管理" },
    { href: "/claims", label: "理賠申請" },
    // TODO: 暫時隱藏其他福利資源功能 - 可在需要時恢復顯示
    // { href: "/resources", label: "其他福利資源" },
  ]

  return (
    <header className="border-b bg-white shadow-sm">
      <div className="container flex items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-teal-600" />
            <div>
              <div className="text-xl font-bold">醫保快線</div>
              <div className="text-xs text-muted-foreground">MatchCare</div>
            </div>
          </Link>
        </div>

        {/* 桌面版導航 */}
        <nav className="hidden lg:flex items-center gap-2">
          {/* 主要功能 - 突出顯示 */}
          <div className="flex items-center gap-2 mr-4">
            {primaryNavItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive(item.href) ? "default" : "outline"}
                  size="sm"
                  className={`gap-2 font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? "bg-teal-600 hover:bg-teal-700 text-white shadow-md"
                      : "border-teal-200 text-teal-700 hover:bg-teal-50 hover:border-teal-300 hover:shadow-sm"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>

          {/* 分隔線 */}
          <div className="h-6 w-px bg-gray-300 mx-2"></div>

          {/* 次要功能 */}
          <div className="flex items-center gap-4">
            {secondaryNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-teal-600 ${
                  isActive(item.href) ? "text-teal-600" : "text-gray-600"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        {/* 中等螢幕導航 */}
        <nav className="hidden md:flex lg:hidden items-center gap-4">
          {primaryNavItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive(item.href) ? "default" : "outline"}
                size="sm"
                className={`gap-2 ${
                  isActive(item.href)
                    ? "bg-teal-600 hover:bg-teal-700"
                    : "border-teal-200 text-teal-700 hover:bg-teal-50"
                }`}
              >
                {item.icon}
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-4">
          {isLoading ? (
            <div className="w-20 h-8 bg-gray-200 animate-pulse rounded"></div>
          ) : user ? (
            <>
              {/* 註釋掉訂閱狀態顯示 */}
              {/* {subscription?.active && (
                <div className="bg-teal-50 text-teal-700 border border-teal-200 rounded-full px-3 py-1 text-xs font-medium flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  {subscription.planId === "premium"
                    ? "進階會員"
                    : subscription.planId === "family"
                      ? "家庭會員"
                      : "基本會員"}
                </div>
              )} */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                    <User className="h-4 w-4" />
                    {user.username}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>我的帳號</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/my-data")}>我的資料</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/profile")}>個人資料</DropdownMenuItem>
                  {/* <DropdownMenuItem onClick={() => router.push("/settings")}>帳號設定</DropdownMenuItem> 暫時隱藏此功能*/}
                  {/* <DropdownMenuItem onClick={() => router.push("/settings/subscription")}>訂閱管理</DropdownMenuItem> */}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="h-4 w-4 mr-2" />
                    登出
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => router.push("/login")}>
                登入/註冊
              </Button>
            </>
          )}
        </div>
        <div className="md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      {/* 手機版選單 */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-white">
          <div className="container py-4 space-y-4">
            {/* 主要功能 - 突出顯示 */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">主要功能</h3>
              <div className="grid grid-cols-1 gap-2">
                {primaryNavItems.map((item) => (
                  <Link key={item.href} href={item.href} onClick={() => setIsMenuOpen(false)}>
                    <div
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                        isActive(item.href)
                          ? "bg-teal-50 border-teal-200 text-teal-700"
                          : "bg-gray-50 border-gray-200 hover:bg-teal-50 hover:border-teal-200"
                      }`}
                    >
                      {item.icon}
                      <div>
                        <div className="font-medium">{item.label}</div>
                        <div className="text-xs text-gray-500">{item.description}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* 分隔線 */}
            <div className="border-t"></div>

            {/* 次要功能 */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">其他功能</h3>
              <nav className="flex flex-col gap-2">
                {secondaryNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`text-sm font-medium py-2 px-3 rounded-md transition-colors ${
                      isActive(item.href)
                        ? "text-teal-600 bg-teal-50"
                        : "text-gray-600 hover:text-teal-600 hover:bg-gray-50"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* 分隔線 */}
            <div className="border-t"></div>

            {/* 用戶選單 */}
            <div className="flex flex-col gap-2">
              {user ? (
                <>
                  <div className="flex items-center gap-2 py-2 px-3 bg-gray-50 rounded-md">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">{user.username}</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => router.push("/my-data")}>
                    我的資料
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => router.push("/profile")}>
                    個人資料
                  </Button>
                  {/* <Button variant="outline" size="sm" onClick={() => router.push("/settings")}>
                    帳號設定
                  </Button> 暫時隱藏此功能*/}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    登出
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" className="w-full bg-transparent" onClick={() => router.push("/login")}>
                    登入/註冊
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
