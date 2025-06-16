import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// 需要登入才能訪問的路徑
const protectedPaths = [
  "/medical-records",
  "/insurance",
  "/claims",
  "/resources",
  "/profile",
  "/settings",
  "/ai-resources",
]

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get("auth")
  const { pathname } = request.nextUrl

  // 檢查是否是受保護的路徑
  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path))

  // 如果是受保護的路徑但沒有登入，重定向到登入頁面
  if (isProtectedPath && !authCookie) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 暫時禁用訂閱相關的路由
  if (pathname.startsWith("/subscription") || pathname.startsWith("/settings/subscription")) {
    // 重定向到首頁或顯示維護頁面
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

// 配置中間件匹配的路徑
export const config = {
  matcher: [
    /*
     * 匹配所有路徑除了:
     * - api 路由
     * - _next/static (靜態文件)
     * - _next/image (圖片優化 API)
     * - favicon.ico (瀏覽器圖標)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
