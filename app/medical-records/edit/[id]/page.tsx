"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarIcon, ArrowLeft, Trash2 } from 'lucide-react'
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { userDataService } from "@/lib/storage"
import { checkAuth } from "@/app/actions/auth-service"

export default function EditMedicalRecordPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [record, setRecord] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<{ id: string, name: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    patientName: "",
    patientAge: "",
    patientGender: "",
    hospitalName: "",
    department: "",
    doctorName: "",
    visitDate: undefined as Date | undefined,
    diagnosis: "",
    symptoms: "",
    treatment: "",
    medications: "",
    notes: "",
    isFirstOccurrence: "",
    medicalExam: "",
  })

  useEffect(() => {
    const initializePage = async () => {
      try {
        setIsLoading(true)
        
        // 檢查用戶登入狀態
        const { isLoggedIn, user: authUser } = await checkAuth()
        let currentUser = authUser
        
        if (isLoggedIn && authUser) {
          setUser(authUser)
          currentUser = authUser
        } else {
          console.log('用戶未登入')
          setError('請先登入再使用此功能')
          return
        }
        
        // 載入病歷資料
        if (currentUser) {
          await loadMedicalRecord(currentUser.id, params.id)
        }
        
      } catch (error) {
        console.error('初始化頁面失敗:', error)
        setError('載入病歷資料失敗')
      } finally {
        setIsLoading(false)
      }
    }
    
    initializePage()
  }, [params.id])

  const loadMedicalRecord = async (userId: string, recordId: string) => {
    try {
      // 從localStorage讀取用戶病歷
      const records = await userDataService.getMedicalRecords(userId)
      const foundRecord = records.find(r => r.id === recordId)
      
      if (!foundRecord) {
        setError('找不到指定的病歷記錄')
        return
      }
      
      setRecord(foundRecord)
      console.log('載入的病歷資料:', foundRecord)
      
      // 填入表單資料 - 從 medicalInfo 中提取資料
      const medicalData = foundRecord.medicalInfo || {}
      
      // 提取患者基本資訊
      let patientName = '王小明' // 預設值
      let patientAge = '45'
      let patientGender = 'male'
      
      // 從病歷中提取醫院資訊
      let hospitalName = '未知醫院'
      if (medicalData.hospitalStamp && medicalData.hospitalStamp !== '待輸入') {
        hospitalName = medicalData.hospitalStamp
      } else if (medicalData.clinicalRecord && medicalData.clinicalRecord !== '待輸入' && medicalData.clinicalRecord.includes('醫院')) {
        const hospitalMatch = medicalData.clinicalRecord.match(/([^,\n]*醫院[^,\n]*)/)
        if (hospitalMatch) hospitalName = hospitalMatch[1].trim()
      }
      
      // 從病歷中提取診斷資訊
      let diagnosis = '診斷資料處理中'
      if (medicalData.clinicalRecord && medicalData.clinicalRecord !== '待輸入') {
        diagnosis = medicalData.clinicalRecord
      } else if (medicalData.admissionRecord && medicalData.admissionRecord !== '待輸入') {
        diagnosis = medicalData.admissionRecord
      } else if (medicalData.examinationReport && medicalData.examinationReport !== '待輸入') {
        diagnosis = medicalData.examinationReport
      }
      
      // 提取治療記錄
      let treatments = []
      if (medicalData.surgeryRecord && medicalData.surgeryRecord !== '待輸入') {
        treatments.push(medicalData.surgeryRecord)
      }
      if (medicalData.clinicalRecord && medicalData.clinicalRecord !== '待輸入' && medicalData.clinicalRecord.includes('治療')) {
        treatments.push('從門診記錄中識別的治療')
      }
      
      // 提取用藥記錄
      let medications = []
      if (medicalData.medicationRecord && medicalData.medicationRecord !== '待輸入') {
        medications.push(medicalData.medicationRecord)
      }
      
      setFormData({
        patientName: patientName,
        patientAge: patientAge,
        patientGender: patientGender,
        hospitalName: hospitalName,
        department: '醫療科別', // 可從病歷內容推斷，目前先用預設值
        doctorName: '主治醫師', // 可從病歷內容提取，目前先用預設值
        visitDate: foundRecord.uploadDate ? new Date(foundRecord.uploadDate) : undefined,
        diagnosis: diagnosis,
        symptoms: medicalData.symptoms || '症狀資料處理中',
        treatment: treatments.join(", ") || '治療記錄處理中',
        medications: medications.join(", ") || '用藥記錄處理中',
        notes: medicalData.notes || '',
        isFirstOccurrence: "yes",
        medicalExam: "blood-test",
      })
      
    } catch (error) {
      console.error('載入病歷資料失敗:', error)
      setError('無法載入病歷資料')
    }
  }

  const handleInputChange = (field: string, value: string | Date | undefined) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user?.id || !record) {
      setError('請先登入或重新載入頁面')
      return
    }

    try {
      // 準備更新的病歷資料，保留原有結構，只更新可編輯的欄位
      const updatedRecord = {
        ...record,
        medicalInfo: {
          ...record.medicalInfo,
          // 更新可編輯的欄位
          hospitalStamp: formData.hospitalName,
          clinicalRecord: formData.diagnosis,
          symptoms: formData.symptoms,
          surgeryRecord: formData.treatment.includes('手術') ? formData.treatment : record.medicalInfo?.surgeryRecord,
          medicationRecord: formData.medications,
          notes: formData.notes,
          // 保留其他原有欄位
          patientInfo: {
            name: formData.patientName,
            age: formData.patientAge,
            gender: formData.patientGender,
          },
          visitInfo: {
            date: formData.visitDate ? formData.visitDate.toISOString() : record.uploadDate,
            department: formData.department,
            doctor: formData.doctorName,
          }
        }
      }

      // 保存更新的病歷
      await userDataService.saveMedicalRecord(user.id, updatedRecord)
      
      console.log("保存病歷資料:", updatedRecord)
      
      // 返回病歷管理頁面
      router.push("/medical-records")
      
    } catch (error) {
      console.error('保存失敗:', error)
      setError('保存失敗，請稍後再試')
    }
  }

  const handleDelete = async () => {
    if (!user?.id || !record) {
      setError('請先登入或重新載入頁面')
      return
    }

    if (confirm("確定要刪除此病歷記錄嗎？此操作無法復原。")) {
      try {
        await userDataService.deleteMedicalRecord(user.id, params.id)
        console.log("刪除病歷:", params.id)
        router.push("/medical-records")
      } catch (error) {
        console.error('刪除失敗:', error)
        setError('刪除失敗，請稍後再試')
      }
    }
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center mb-8">
            <Link href="/medical-records">
              <Button variant="ghost" size="sm" className="gap-1">
                <ArrowLeft className="h-4 w-4" />
                返回病歷管理
              </Button>
            </Link>
          </div>
          <div className="text-center py-8">
            <p className="text-red-500">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!record) {
    return (
      <div className="container py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center mb-8">
            <Link href="/medical-records">
              <Button variant="ghost" size="sm" className="gap-1">
                <ArrowLeft className="h-4 w-4" />
                返回病歷管理
              </Button>
            </Link>
          </div>
          <div className="text-center py-8">
            <p className="text-gray-500">找不到指定的病歷記錄</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex items-center mb-8">
        <Link href="/medical-records">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            返回病歷管理
          </Button>
        </Link>
      </div>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-2">編輯病歷記錄</h1>
        <p className="text-gray-500 mb-8">修改您的病歷記錄資訊</p>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Patient Information */}
          <Card>
            <CardHeader>
              <CardTitle>患者資訊</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patientName">患者姓名 *</Label>
                  <Input
                    id="patientName"
                    value={formData.patientName}
                    onChange={(e) => handleInputChange("patientName", e.target.value)}
                    placeholder="請輸入患者姓名"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="patientAge">年齡 *</Label>
                  <Input
                    id="patientAge"
                    type="number"
                    value={formData.patientAge}
                    onChange={(e) => handleInputChange("patientAge", e.target.value)}
                    placeholder="請輸入年齡"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="patientGender">性別 *</Label>
                  <Select
                    value={formData.patientGender}
                    onValueChange={(value) => handleInputChange("patientGender", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="請選擇性別" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">男</SelectItem>
                      <SelectItem value="female">女</SelectItem>
                      <SelectItem value="other">其他</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medical Information */}
          <Card>
            <CardHeader>
              <CardTitle>就醫資訊</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hospitalName">醫院名稱 *</Label>
                  <Input
                    id="hospitalName"
                    value={formData.hospitalName}
                    onChange={(e) => handleInputChange("hospitalName", e.target.value)}
                    placeholder="請輸入醫院名稱"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">科別</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => handleInputChange("department", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="選擇科別" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="內科">內科</SelectItem>
                      <SelectItem value="外科">外科</SelectItem>
                      <SelectItem value="小兒科">小兒科</SelectItem>
                      <SelectItem value="婦產科">婦產科</SelectItem>
                      <SelectItem value="骨科">骨科</SelectItem>
                      <SelectItem value="皮膚科">皮膚科</SelectItem>
                      <SelectItem value="眼科">眼科</SelectItem>
                      <SelectItem value="耳鼻喉科">耳鼻喉科</SelectItem>
                      <SelectItem value="精神科">精神科</SelectItem>
                      <SelectItem value="神經科">神經科</SelectItem>
                      <SelectItem value="腫瘤科">腫瘤科</SelectItem>
                      <SelectItem value="心臟內科">心臟內科</SelectItem>
                      <SelectItem value="神經內科">神經內科</SelectItem>
                      <SelectItem value="內分泌科">內分泌科</SelectItem>
                      <SelectItem value="風濕免疫科">風濕免疫科</SelectItem>
                      <SelectItem value="胃腸肝膽科">胃腸肝膽科</SelectItem>
                      <SelectItem value="呼吸胸腔科">呼吸胸腔科</SelectItem>
                      <SelectItem value="腎臟科">腎臟科</SelectItem>
                      <SelectItem value="神經外科">神經外科</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doctorName">主治醫師</Label>
                  <Input
                    id="doctorName"
                    value={formData.doctorName}
                    onChange={(e) => handleInputChange("doctorName", e.target.value)}
                    placeholder="請輸入醫師姓名"
                  />
                </div>
                <div className="space-y-2">
                  <Label>就診日期 *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-transparent",
                          !formData.visitDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.visitDate ? format(formData.visitDate, "yyyy/MM/dd") : "請選擇日期"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.visitDate}
                        onSelect={(date) => handleInputChange("visitDate", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="isFirstOccurrence">是否為首次發病</Label>
                  <Select
                    value={formData.isFirstOccurrence}
                    onValueChange={(value) => handleInputChange("isFirstOccurrence", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="請選擇" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">是，首次發病</SelectItem>
                      <SelectItem value="no">否，非首次發病</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="medicalExam">醫學檢查項目</Label>
                  <Select
                    value={formData.medicalExam}
                    onValueChange={(value) => handleInputChange("medicalExam", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="檢查" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blood-test">血液檢查</SelectItem>
                      <SelectItem value="urine-test">尿液檢查</SelectItem>
                      <SelectItem value="x-ray">X光檢查</SelectItem>
                      <SelectItem value="ct-scan">電腦斷層</SelectItem>
                      <SelectItem value="mri">核磁共振</SelectItem>
                      <SelectItem value="ultrasound">超音波檢查</SelectItem>
                      <SelectItem value="ecg">心電圖</SelectItem>
                      <SelectItem value="endoscopy">內視鏡檢查</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medical Details */}
          <Card>
            <CardHeader>
              <CardTitle>病歷詳情</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="diagnosis">診斷結果 *</Label>
                <Textarea
                  id="diagnosis"
                  value={formData.diagnosis}
                  onChange={(e) => handleInputChange("diagnosis", e.target.value)}
                  placeholder="請輸入診斷結果"
                  rows={3}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="symptoms">症狀描述</Label>
                <Textarea
                  id="symptoms"
                  value={formData.symptoms}
                  onChange={(e) => handleInputChange("symptoms", e.target.value)}
                  placeholder="請描述症狀"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="treatment">治療方式</Label>
                <Textarea
                  id="treatment"
                  value={formData.treatment}
                  onChange={(e) => handleInputChange("treatment", e.target.value)}
                  placeholder="請輸入治療方式"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="medications">用藥記錄</Label>
                <Textarea
                  id="medications"
                  value={formData.medications}
                  onChange={(e) => handleInputChange("medications", e.target.value)}
                  placeholder="請輸入用藥記錄"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">備註</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="其他備註事項"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              刪除病歷
            </Button>
            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={() => router.back()} className="bg-transparent">
                取消
              </Button>
              <Button type="submit" className="bg-teal-600 hover:bg-teal-700">
                保存編輯
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}