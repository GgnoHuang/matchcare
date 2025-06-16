import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { MainNav } from "@/components/main-nav"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "醫保快線 MatchCare - 台灣醫療保險理賠整合平台",
  description: "整合病歷與保單資訊，自動匹配理賠方案，簡化保險理賠流程",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/svg+xml" },
    ],
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.png" type="image/svg+xml" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <MainNav />
          <div className="w-full text-center py-1 bg-red-50">
            <p className="text-red-600 font-medium">Prototype made by GranDen@2025</p>
          </div>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
