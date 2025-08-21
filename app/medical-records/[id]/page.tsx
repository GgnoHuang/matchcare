"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Stethoscope, Pill, User, Building2, Phone } from "lucide-react"
import { checkAuth } from "@/app/actions/auth-service"
import { supabaseConfig } from "@/lib/supabase"

interface MedicalRecord {
  id: string
  file_name: string
  file_type: string
  upload_date: string
  image_base64: string | null
  medical_data: {
    patientName: string
    patientAge: string
    patientGender: string
    hospitalName: string
    department: string
    doctorName: string
    visitDate: string
    diagnosis: string
    symptoms: string
    treatment: string
    medications: string
    notes: string
    isFirstOccurrence: string
    medicalExam: string
    imageBase64?: string
  }
}

export default function MedicalRecordDetailPage() {
  const router = useRouter()
  const params = useParams()
  const recordId = params.id as string
  
  const [record, setRecord] = useState<MedicalRecord | null>(null)
  const [user, setUser] = useState<{ id: string, username: string, phoneNumber: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 檢查用戶登入狀態
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { isLoggedIn, user: authUser } = await checkAuth()
        if (isLoggedIn && authUser) {
          setUser(authUser)
        }
      } catch (error) {
        console.error('獲取用戶資訊失敗:', error)
      }
    }
    fetchUser()
  }, [])

  // 載入病歷詳情
  useEffect(() => {
    if (user?.phoneNumber && recordId) {
      loadMedicalRecord()
    }
  }, [user, recordId])

  const loadMedicalRecord = async () => {
    if (!user?.phoneNumber || !recordId) return
    
    setIsLoading(true)
    try {
      console.log('載入病歷詳情，ID:', recordId)
      
      // 查詢特定病歷記錄
      const response = await fetch(
        `${supabaseConfig.baseUrl}/medical_records?select=*&id=eq.${recordId}`,
        {
          headers: {
            'apikey': supabaseConfig.apiKey,
            'Authorization': `Bearer ${supabaseConfig.apiKey}`
          }
        }
      )
      
      if (!response.ok) {
        throw new Error(`載入病歷失敗: ${response.status}`)
      }
      
      const records = await response.json()
      if (records.length === 0) {
        console.error('找不到病歷記錄')
        return
      }
      
      setRecord(records[0])
    } catch (error) {
      console.error('載入病歷詳情失敗:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8">載入中...</div>
        </div>
      </div>
    )
  }

  if (!record) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8">找不到病歷記錄</div>
        </div>
      </div>
    )
  }

  const medicalData = record.medical_data

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* 返回按鈕 */}
        <div className="flex items-center gap-2 mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.push("/medical-records")} 
            className="flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            返回病歷管理
          </Button>
        </div>

        {/* 頁面標題 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">病歷詳情</h1>
          <p className="text-gray-600">查看詳細的醫療記錄資訊</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左側：醫療資訊 */}
          <div className="space-y-6">
            {/* 基本資訊 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  基本資訊
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">醫院</div>
                    <div className="font-medium">{medicalData.hospitalName || '未填寫'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">科別</div>
                    <div className="font-medium">{medicalData.department || '未填寫'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">主治醫師</div>
                    <div className="font-medium">{medicalData.doctorName || '未填寫'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">就診日期</div>
                    <div className="font-medium flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {medicalData.visitDate || '未填寫'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 診斷資訊 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" />
                  診斷資訊
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600 mb-2">診斷結果</div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    {medicalData.diagnosis || '未填寫'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-2">症狀描述</div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    {medicalData.symptoms || '未填寫'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-2">醫學檢查</div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    {medicalData.medicalExam || '未填寫'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-2">是否首次發病</div>
                  <Badge variant={medicalData.isFirstOccurrence === 'yes' ? 'default' : 'secondary'}>
                    {medicalData.isFirstOccurrence === 'yes' ? '是，首次發病' : 
                     medicalData.isFirstOccurrence === 'no' ? '否，非首次發病' : '未填寫'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* 治療資訊 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pill className="h-5 w-5" />
                  治療資訊
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600 mb-2">治療方案</div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    {medicalData.treatment || '未填寫'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-2">用藥記錄</div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    {medicalData.medications || '未填寫'}
                  </div>
                </div>
                {medicalData.notes && (
                  <div>
                    <div className="text-sm text-gray-600 mb-2">備註</div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      {medicalData.notes}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 右側：原始圖檔 */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>原始醫療文件</CardTitle>
                <CardDescription>
                  上傳時的原始圖檔（點擊可放大查看）
                </CardDescription>
              </CardHeader>
              <CardContent>
                {record.image_base64 ? (
                  <div className="space-y-4">
                    <div className="border rounded-lg overflow-hidden bg-white">
                      <img 
                        src={`data:image/jpeg;base64,${record.image_base64}`}
                        alt="醫療記錄原始圖檔"
                        className="w-full h-auto max-h-96 object-contain cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => {
                          // 點擊放大圖片
                          const imageSource = `data:image/jpeg;base64,${record.image_base64}`
                          const newWindow = window.open()
                          if (newWindow) {
                            newWindow.document.write(`
                              <html>
                                <head><title>醫療記錄 - ${medicalData.hospitalName}</title></head>
                                <body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#f5f5f5;">
                                  <img src="${imageSource}" style="max-width:100%;max-height:100%;object-fit:contain;" />
                                </body>
                              </html>
                            `)
                            newWindow.document.close()
                          }
                        }}
                        onError={(e) => {
                          console.error('圖片載入失敗，base64 長度:', record.image_base64?.length)
                          e.currentTarget.style.display = 'none'
                          // 顯示錯誤訊息
                          const errorDiv = e.currentTarget.parentElement?.querySelector('.image-error')
                          if (errorDiv) {
                            errorDiv.textContent = '圖片載入失敗'
                            ;(errorDiv as HTMLElement).style.display = 'block'
                          }
                        }}
                      />
                      <div className="image-error text-center py-4 text-red-500" style={{display: 'none'}}>
                        圖片載入失敗，請檢查圖檔格式或聯繫客服
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 text-center">
                      點擊圖片可在新視窗中放大查看
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-lg mb-2">無原始圖檔</div>
                    <div className="text-sm">
                      此病歷記錄可能是手動輸入或圖檔未正確儲存
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 檔案資訊 */}
            <Card>
              <CardHeader>
                <CardTitle>檔案資訊</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">檔案名稱</span>
                  <span>{record.file_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">檔案類型</span>
                  <span>{record.file_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">上傳時間</span>
                  <span>{new Date(record.upload_date).toLocaleString('zh-TW')}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 底部按鈕 */}
        <div className="mt-8 flex gap-4 justify-center">
          <Button 
            variant="outline" 
            onClick={() => router.push("/medical-records")}
          >
            返回列表
          </Button>
          <Button 
            onClick={() => router.push(`/medical-records/edit/${recordId}`)}
            className="bg-teal-600 hover:bg-teal-700"
          >
            編輯記錄
          </Button>
        </div>
      </div>
    </div>
  )
}