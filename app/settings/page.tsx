"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { 
  Settings, 
  Key, 
  CreditCard, 
  Save, 
  Eye, 
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Trash2,
  Database
} from "lucide-react"

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState<string>("")
  const [showApiKey, setShowApiKey] = useState<boolean>(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [clearStatus, setClearStatus] = useState<'idle' | 'clearing' | 'cleared' | 'error'>('idle')

  // 載入已儲存的 API 金鑰
  useEffect(() => {
    const savedApiKey = localStorage.getItem('openai_api_key')
    if (savedApiKey) {
      setApiKey(savedApiKey)
    }
  }, [])

  // 儲存 API 金鑰
  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      setErrorMessage("請輸入 API 金鑰")
      setSaveStatus('error')
      return
    }

    if (!apiKey.startsWith('sk-')) {
      setErrorMessage("請輸入有效的 OpenAI API 金鑰（應以 'sk-' 開頭）")
      setSaveStatus('error')
      return
    }

    setSaveStatus('saving')
    try {
      localStorage.setItem('openai_api_key', apiKey)
      setSaveStatus('saved')
      setErrorMessage("")
      
      // 3秒後重置狀態
      setTimeout(() => {
        setSaveStatus('idle')
      }, 3000)
    } catch (error) {
      console.error('儲存 API 金鑰失敗:', error)
      setSaveStatus('error')
      setErrorMessage('儲存失敗，請稍後再試')
    }
  }

  // 清除 API 金鑰
  const handleClearApiKey = () => {
    localStorage.removeItem('openai_api_key')
    setApiKey("")
    setSaveStatus('idle')
    setErrorMessage("")
  }

  // 清除所有本地儲存資料
  const handleClearAllData = () => {
    const confirmed = window.confirm(
      '⚠️ 警告：這將清除所有儲存在瀏覽器中的資料，包括：\n\n' +
      '• API 金鑰設定\n' +
      '• 所有上傳的病歷記錄\n' +
      '• 所有診斷證明\n' +
      '• 所有保險保單\n' +
      '• 用戶資料和設定\n\n' +
      '此操作無法復原，確定要繼續嗎？'
    )
    
    if (!confirmed) return
    
    setClearStatus('clearing')
    try {
      // 清除所有 localStorage 資料
      localStorage.clear()
      
      // 清除所有 sessionStorage 資料
      sessionStorage.clear()
      
      // 重置當前頁面狀態
      setApiKey("")
      setSaveStatus('idle')
      setErrorMessage("")
      setClearStatus('cleared')
      
      // 3秒後重新載入頁面以確保完全重置
      setTimeout(() => {
        window.location.reload()
      }, 3000)
      
    } catch (error) {
      console.error('清除資料失敗:', error)
      setClearStatus('error')
      setTimeout(() => {
        setClearStatus('idle')
      }, 3000)
    }
  }

  return (
    <div className="container py-8">
      {/* 返回按鈕 */}
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" />
          返回首頁
        </Link>
      </div>

      {/* 頁面標題 */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="h-8 w-8" />
          系統設定
        </h1>
        <p className="text-gray-500 mt-1">管理您的應用程式設定和偏好</p>
      </div>

      {/* 狀態訊息 */}
      {saveStatus === 'saved' && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">設定已儲存</AlertTitle>
          <AlertDescription className="text-green-700">
            API 金鑰已成功儲存到本地儲存空間
          </AlertDescription>
        </Alert>
      )}

      {saveStatus === 'error' && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">設定錯誤</AlertTitle>
          <AlertDescription className="text-red-700">
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}

      {clearStatus === 'clearing' && (
        <Alert className="mb-6 bg-yellow-50 border-yellow-200">
          <Database className="h-4 w-4 text-yellow-600 animate-pulse" />
          <AlertTitle className="text-yellow-800">正在清除資料...</AlertTitle>
          <AlertDescription className="text-yellow-700">
            正在清除所有本地儲存的資料，請稍候...
          </AlertDescription>
        </Alert>
      )}

      {clearStatus === 'cleared' && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">資料已清除</AlertTitle>
          <AlertDescription className="text-green-700">
            所有本地儲存的資料已成功清除，頁面即將重新載入...
          </AlertDescription>
        </Alert>
      )}

      {clearStatus === 'error' && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">清除失敗</AlertTitle>
          <AlertDescription className="text-red-700">
            清除本地儲存資料時發生錯誤，請手動清除瀏覽器資料
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI 設定 */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-blue-600" />
                OpenAI API 設定
              </CardTitle>
              <CardDescription>
                設定 OpenAI API 金鑰以啟用 AI 分析功能。您的金鑰將安全地儲存在瀏覽器的本地儲存空間中。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">OpenAI API 金鑰</Label>
                <div className="relative">
                  <Input
                    id="api-key"
                    type={showApiKey ? "text" : "password"}
                    placeholder="請輸入您的 OpenAI API 金鑰 (sk-...)"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleSaveApiKey}
                  disabled={saveStatus === 'saving'}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  {saveStatus === 'saving' ? '儲存中...' : '儲存設定'}
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={handleClearApiKey}
                  disabled={saveStatus === 'saving'}
                >
                  清除金鑰
                </Button>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">如何取得 OpenAI API 金鑰？</h4>
                <ol className="text-sm text-blue-800 space-y-1">
                  <li>1. 前往 <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline font-medium">OpenAI API Keys 頁面</a></li>
                  <li>2. 登入您的 OpenAI 帳號</li>
                  <li>3. 點擊「Create new secret key」建立新的金鑰</li>
                  <li>4. 複製金鑰並貼到上方欄位中</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 側邊欄 */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-green-600" />
                訂閱管理
              </CardTitle>
              <CardDescription>
                管理您的訂閱方案和付款設定
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/settings/subscription">
                <Button variant="outline" className="w-full">
                  管理訂閱
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>資料安全</CardTitle>
              <CardDescription>
                您的 API 金鑰和醫療資料的安全性
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 space-y-2">
              <p>• API 金鑰儲存在瀏覽器本地儲存空間</p>
              <p>• 醫療資料僅在您的裝置上處理</p>
              <p>• 我們不會上傳您的個人資料到伺服器</p>
              <p>• 清除瀏覽器資料時會一併刪除所有設定</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <Database className="h-5 w-5" />
                資料管理
              </CardTitle>
              <CardDescription>
                清除所有儲存在本地的資料
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h4 className="font-medium text-red-900 mb-2">⚠️ 危險操作</h4>
                <p className="text-sm text-red-800 mb-3">
                  此操作將永久刪除所有儲存在瀏覽器中的資料，包括：
                </p>
                <ul className="text-sm text-red-700 space-y-1 mb-4">
                  <li>• API 金鑰設定</li>
                  <li>• 所有上傳的病歷記錄</li>
                  <li>• 所有診斷證明</li>
                  <li>• 所有保險保單</li>
                  <li>• 用戶資料和偏好設定</li>
                </ul>
                <Button
                  variant="destructive"
                  onClick={handleClearAllData}
                  disabled={clearStatus === 'clearing'}
                  className="w-full gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  {clearStatus === 'clearing' ? '清除中...' : '清除所有資料'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}