"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Shield, Menu, X, User, LogOut } from "lucide-react"
import { usePathname } from "next/navigation"
import { checkAuth, logout, quickLogin } from "@/app/actions/auth-service"
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
  const [user, setUser] = useState<{ name: string; phoneNumber?: string; email?: string } | null>(null)
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

  const handleQuickLogin = async () => {
    try {
      setIsLoading(true)
      const result = await quickLogin()
      if (result.success) {
        // 使用 window.location 而不是 router.push 確保頁面完全重新加載
        window.location.href = "/"
      }
    } catch (error) {
      console.error("登入失敗:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // 找到 navItems 數組中的保單管理項目，將其改為 AI保單健檢
  const navItems = [
    { href: "/", label: "首頁" },
    { href: "/medical-records", label: "病歷管理" },
    { href: "/ai-resources", label: "一鍵AI找保障" },
    { href: "/insurance", label: "保單健檢" },
    { href: "/claims", label: "理賠申請" },
    { href: "/resources", label: "其他福利資源" },
    // { href: "/subscription", label: "訂閱方案" }, // 暫時隱藏訂閱方案
  ]

  return (
    <header className="border-b">
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
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium hover:text-emerald-600 ${isActive(item.href) ? "text-emerald-600" : ""}`}
            >
              {item.label}
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
                  <Button variant="outline" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    {user.name}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>我的帳號</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/profile")}>個人資料</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/settings")}>帳號設定</DropdownMenuItem>
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
              <Button variant="outline" size="sm" onClick={handleQuickLogin}>
                快速體驗登入
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push("/login")}>
                登入
              </Button>
              <Button size="sm" className="bg-teal-600 hover:bg-teal-700" onClick={() => router.push("/register")}>
                註冊
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
      {isMenuOpen && (
        <div className="md:hidden border-t">
          <div className="container py-4 space-y-4">
            <nav className="flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium hover:text-emerald-600 ${
                    isActive(item.href) ? "text-emerald-600" : ""
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="flex flex-col gap-2 pt-4 border-t">
              {user ? (
                <>
                  <div className="flex items-center gap-2 py-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">{user.name}</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => router.push("/profile")}>
                    個人資料
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => router.push("/settings")}>
                    帳號設定
                  </Button>
                  {/* <Button variant="outline" size="sm" onClick={() => router.push("/settings/subscription")}>
                    訂閱管理
                  </Button> */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    登出
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" className="w-full" onClick={handleQuickLogin}>
                    快速體驗登入
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => router.push("/login")}>
                    登入
                  </Button>
                  <Button className="w-full bg-teal-600 hover:bg-teal-700" onClick={() => router.push("/register")}>
                    註冊
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
