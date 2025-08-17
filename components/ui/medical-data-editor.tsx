"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit3, Check, X, Calendar, FileText, Shield, Plus, Trash2 } from "lucide-react"
import { MedicalRecord, DiagnosisCertificate, InsurancePolicy } from "@/lib/storage"

interface MedicalDataEditorProps {
  record?: MedicalRecord
  certificate?: DiagnosisCertificate
  policy?: InsurancePolicy
  onSave?: (data: any) => void
  onCancel?: () => void
}

export default function MedicalDataEditor({ 
  record, 
  certificate, 
  policy,
  onSave, 
  onCancel 
}: MedicalDataEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(() => {
    if (record) {
      return {
        type: 'medical',
        data: record.medicalInfo || {
          clinicalRecord: "待輸入",
          admissionRecord: "待輸入",
          surgeryRecord: "待輸入",
          examinationReport: "待輸入",
          medicationRecord: "待輸入",
          dischargeSummary: "待輸入",
          hospitalStamp: "待輸入"
        }
      }
    }
    
    if (certificate) {
      return {
        type: 'diagnosis',
        data: certificate.diagnosisInfo || {
          patientName: "待輸入",
          birthDate: "待輸入",
          idNumber: "待輸入",
          firstVisitDate: "待輸入",
          certificateDate: "待輸入",
          icdCode: "待輸入",
          diseaseName: "待輸入",
          treatmentSummary: "待輸入",
          restPeriod: "待輸入",
          isAccident: "待輸入"
        }
      }
    }

    if (policy) {
      // 映射為Zoe的簡潔欄位結構
      const policyInfo = policy.policyInfo || {}
      return {
        type: 'policy',
        originalData: policyInfo, // 保留原始完整資料
        data: {
          // Zoe 欄位映射
          company: policyInfo.policyBasicInfo?.insuranceCompany || "",
          policyType: policyInfo.policyBasicInfo?.policyType || "",
          policyName: policyInfo.policyBasicInfo?.policyName || "",
          policyNumber: policyInfo.policyBasicInfo?.policyNumber || "",
          startDate: policyInfo.policyBasicInfo?.effectiveDate || "",
          endDate: policyInfo.policyBasicInfo?.expiryDate || "",
          insuredPerson: policyInfo.insuredPersonInfo?.name || "",
          beneficiary: policyInfo.beneficiaryInfo?.name || "",
        }
      }
    }

    return { type: null, data: {} }
  })

  // 保障範圍的狀態管理 (僅保單類型使用)
  const [coverageItems, setCoverageItems] = useState(() => {
    if (policy) {
      // 從AI分析的保障內容或條款中提取保障項目
      const policyInfo = policy.policyInfo || {}
      const existingCoverage = policyInfo.coverageDetails || []
      
      if (existingCoverage.length > 0) {
        return existingCoverage.map((item: any, index: number) => ({
          id: (index + 1).toString(),
          name: item.coverageType || item.name || "",
          amount: item.maxAmount || item.amount || "",
          unit: item.unit || "元"
        }))
      } else {
        // 預設一個保障項目
        return [{ id: "1", name: "", amount: "", unit: "元" }]
      }
    } else {
      return []
    }
  })

  const handleInputChange = (field: string, value: string, section?: string) => {
    setFormData(prev => {
      if (prev.type === 'policy') {
        // Zoe 保單欄位直接更新
        return {
          ...prev,
          data: {
            ...prev.data,
            [field]: value
          }
        }
      } else if (section && prev.type !== 'policy') {
        return {
          ...prev,
          data: {
            ...prev.data,
            [section]: {
              ...prev.data[section],
              [field]: value
            }
          }
        }
      } else {
        return {
          ...prev,
          data: {
            ...prev.data,
            [field]: value
          }
        }
      }
    })
  }

  // 保障範圍管理函數
  const handleCoverageChange = (id: string, field: string, value: string) => {
    setCoverageItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ))
  }

  const addCoverageItem = () => {
    const newId = (coverageItems.length + 1).toString()
    setCoverageItems(prev => [...prev, { id: newId, name: "", amount: "", unit: "元" }])
  }

  const removeCoverageItem = (id: string) => {
    setCoverageItems(prev => prev.filter(item => item.id !== id))
  }

  const handleSave = () => {
    if (formData.type === 'policy') {
      // 將Zoe欄位映射回完整的MatchCare結構
      const zoeData = formData.data
      const originalData = formData.originalData || {}
      
      const mappedData = {
        ...originalData, // 保留所有原始AI分析資料
        policyBasicInfo: {
          ...originalData.policyBasicInfo,
          insuranceCompany: zoeData.company,
          policyType: zoeData.policyType,
          policyName: zoeData.policyName,
          policyNumber: zoeData.policyNumber,
          effectiveDate: zoeData.startDate,
          expiryDate: zoeData.endDate
        },
        insuredPersonInfo: {
          ...originalData.insuredPersonInfo,
          name: zoeData.insuredPerson
        },
        beneficiaryInfo: {
          ...originalData.beneficiaryInfo,
          name: zoeData.beneficiary
        },
        // 保障範圍資料映射
        coverageDetails: coverageItems.map(item => ({
          coverageType: item.name,
          maxAmount: item.amount,
          unit: item.unit
        }))
      }
      onSave?.(mappedData)
    } else {
      onSave?.(formData.data)
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    // 重置表單資料
    if (record) {
      setFormData({
        type: 'medical',
        data: record.medicalInfo || {}
      })
    } else if (certificate) {
      setFormData({
        type: 'diagnosis', 
        data: certificate.diagnosisInfo || {}
      })
    } else if (policy) {
      // 重新映射為Zoe欄位結構
      const policyInfo = policy.policyInfo || {}
      setFormData({
        type: 'policy',
        originalData: policyInfo,
        data: {
          company: policyInfo.policyBasicInfo?.insuranceCompany || "",
          policyType: policyInfo.policyBasicInfo?.policyType || "",
          policyName: policyInfo.policyBasicInfo?.policyName || "",
          policyNumber: policyInfo.policyBasicInfo?.policyNumber || "",
          startDate: policyInfo.policyBasicInfo?.effectiveDate || "",
          endDate: policyInfo.policyBasicInfo?.expiryDate || "",
          insuredPerson: policyInfo.insuredPersonInfo?.name || "",
          beneficiary: policyInfo.beneficiaryInfo?.name || "",
        }
      })
      // 重設保障範圍
      const existingCoverage = policyInfo.coverageDetails || []
      if (existingCoverage.length > 0) {
        setCoverageItems(existingCoverage.map((item: any, index: number) => ({
          id: (index + 1).toString(),
          name: item.coverageType || item.name || "",
          amount: item.maxAmount || item.amount || "",
          unit: item.unit || "元"
        })))
      } else {
        setCoverageItems([{ id: "1", name: "", amount: "", unit: "元" }])
      }
    }
    setIsEditing(false)
    onCancel?.()
  }

  if (formData.type === 'medical') {
    const medicalData = formData.data as any
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">病例記錄詳細資訊</CardTitle>
            </div>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} variant="outline" size="sm" className="gap-2">
                <Edit3 className="h-4 w-4" />
                編輯
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={handleSave} size="sm" className="gap-2">
                  <Check className="h-4 w-4" />
                  儲存
                </Button>
                <Button onClick={handleCancel} variant="outline" size="sm" className="gap-2">
                  <X className="h-4 w-4" />
                  取消
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <Label htmlFor="clinicalRecord">門診/急診/住院紀錄</Label>
              {isEditing ? (
                <Textarea
                  id="clinicalRecord"
                  value={medicalData.clinicalRecord || ""}
                  onChange={(e) => handleInputChange('clinicalRecord', e.target.value)}
                  placeholder="每次就診醫師寫的主訴、診斷、處置、追蹤建議等"
                  className="min-h-[80px]"
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-md text-sm">
                  {medicalData.clinicalRecord || "待輸入"}
                  {medicalData.clinicalRecord === "待輸入" && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      需要輸入
                    </Badge>
                  )}
                </div>
              )}
            </div>

            <Separator />

            <div>
              <Label htmlFor="admissionRecord">入院病歷</Label>
              {isEditing ? (
                <Textarea
                  id="admissionRecord"
                  value={medicalData.admissionRecord || ""}
                  onChange={(e) => handleInputChange('admissionRecord', e.target.value)}
                  placeholder="包含主治醫師記錄、查房紀錄、護理紀錄等"
                  className="min-h-[80px]"
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-md text-sm">
                  {medicalData.admissionRecord || "待輸入"}
                  {medicalData.admissionRecord === "待輸入" && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      需要輸入
                    </Badge>
                  )}
                </div>
              )}
            </div>

            <Separator />

            <div>
              <Label htmlFor="surgeryRecord">手術紀錄</Label>
              {isEditing ? (
                <Textarea
                  id="surgeryRecord"
                  value={medicalData.surgeryRecord || ""}
                  onChange={(e) => handleInputChange('surgeryRecord', e.target.value)}
                  placeholder="包括手術名稱、時間、方式、醫師簽名"
                  className="min-h-[80px]"
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-md text-sm">
                  {medicalData.surgeryRecord || "待輸入"}
                  {medicalData.surgeryRecord === "待輸入" && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      需要輸入
                    </Badge>
                  )}
                </div>
              )}
            </div>

            <Separator />

            <div>
              <Label htmlFor="examinationReport">檢查報告影本</Label>
              {isEditing ? (
                <Textarea
                  id="examinationReport"
                  value={medicalData.examinationReport || ""}
                  onChange={(e) => handleInputChange('examinationReport', e.target.value)}
                  placeholder="如超音波、X光、CT、MRI、病理報告等"
                  className="min-h-[60px]"
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-md text-sm">
                  {medicalData.examinationReport || "待輸入"}
                  {medicalData.examinationReport === "待輸入" && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      需要輸入
                    </Badge>
                  )}
                </div>
              )}
            </div>

            <Separator />

            <div>
              <Label htmlFor="medicationRecord">用藥紀錄</Label>
              {isEditing ? (
                <Textarea
                  id="medicationRecord"
                  value={medicalData.medicationRecord || ""}
                  onChange={(e) => handleInputChange('medicationRecord', e.target.value)}
                  placeholder="記錄使用的藥物名稱、劑量、時間"
                  className="min-h-[60px]"
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-md text-sm">
                  {medicalData.medicationRecord || "待輸入"}
                  {medicalData.medicationRecord === "待輸入" && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      需要輸入
                    </Badge>
                  )}
                </div>
              )}
            </div>

            <Separator />

            <div>
              <Label htmlFor="dischargeSummary">出院病摘</Label>
              {isEditing ? (
                <Textarea
                  id="dischargeSummary"
                  value={medicalData.dischargeSummary || ""}
                  onChange={(e) => handleInputChange('dischargeSummary', e.target.value)}
                  placeholder="總結此次住院經過、診斷、醫囑與追蹤建議"
                  className="min-h-[80px]"
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-md text-sm">
                  {medicalData.dischargeSummary || "待輸入"}
                  {medicalData.dischargeSummary === "待輸入" && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      需要輸入
                    </Badge>
                  )}
                </div>
              )}
            </div>

            <Separator />

            <div>
              <Label htmlFor="hospitalStamp">醫療院所章戳與簽名</Label>
              {isEditing ? (
                <Input
                  id="hospitalStamp"
                  value={medicalData.hospitalStamp || ""}
                  onChange={(e) => handleInputChange('hospitalStamp', e.target.value)}
                  placeholder="醫療院所章戳與簽名"
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-md text-sm">
                  {medicalData.hospitalStamp || "待輸入"}
                  {medicalData.hospitalStamp === "待輸入" && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      需要輸入
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (formData.type === 'diagnosis') {
    const diagnosisData = formData.data as any
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              <CardTitle className="text-lg">診斷證明詳細資訊</CardTitle>
            </div>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} variant="outline" size="sm" className="gap-2">
                <Edit3 className="h-4 w-4" />
                編輯
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={handleSave} size="sm" className="gap-2">
                  <Check className="h-4 w-4" />
                  儲存
                </Button>
                <Button onClick={handleCancel} variant="outline" size="sm" className="gap-2">
                  <X className="h-4 w-4" />
                  取消
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 病人基本資料 */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">病人基本資料</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="patientName">姓名</Label>
                {isEditing ? (
                  <Input
                    id="patientName"
                    value={diagnosisData.patientName || ""}
                    onChange={(e) => handleInputChange('patientName', e.target.value)}
                    placeholder="病人姓名"
                  />
                ) : (
                  <div className="p-2 bg-gray-50 rounded text-sm">
                    {diagnosisData.patientName || "待輸入"}
                    {diagnosisData.patientName === "待輸入" && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        需要輸入
                      </Badge>
                    )}
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="birthDate">出生年月日</Label>
                {isEditing ? (
                  <Input
                    id="birthDate"
                    value={diagnosisData.birthDate || ""}
                    onChange={(e) => handleInputChange('birthDate', e.target.value)}
                    placeholder="YYYY/MM/DD"
                  />
                ) : (
                  <div className="p-2 bg-gray-50 rounded text-sm">
                    {diagnosisData.birthDate || "待輸入"}
                    {diagnosisData.birthDate === "待輸入" && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        需要輸入
                      </Badge>
                    )}
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="idNumber">身分證字號</Label>
                {isEditing ? (
                  <Input
                    id="idNumber"
                    value={diagnosisData.idNumber || ""}
                    onChange={(e) => handleInputChange('idNumber', e.target.value)}
                    placeholder="身分證字號"
                  />
                ) : (
                  <div className="p-2 bg-gray-50 rounded text-sm">
                    {diagnosisData.idNumber || "待輸入"}
                    {diagnosisData.idNumber === "待輸入" && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        需要輸入
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* 診斷日期 */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">診斷日期</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstVisitDate">初診日</Label>
                {isEditing ? (
                  <Input
                    id="firstVisitDate"
                    value={diagnosisData.firstVisitDate || ""}
                    onChange={(e) => handleInputChange('firstVisitDate', e.target.value)}
                    placeholder="YYYY/MM/DD"
                  />
                ) : (
                  <div className="p-2 bg-gray-50 rounded text-sm">
                    {diagnosisData.firstVisitDate || "待輸入"}
                    {diagnosisData.firstVisitDate === "待輸入" && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        需要輸入
                      </Badge>
                    )}
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="certificateDate">開立診斷書日期</Label>
                {isEditing ? (
                  <Input
                    id="certificateDate"
                    value={diagnosisData.certificateDate || ""}
                    onChange={(e) => handleInputChange('certificateDate', e.target.value)}
                    placeholder="YYYY/MM/DD"
                  />
                ) : (
                  <div className="p-2 bg-gray-50 rounded text-sm">
                    {diagnosisData.certificateDate || "待輸入"}
                    {diagnosisData.certificateDate === "待輸入" && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        需要輸入
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* 疾病名稱 */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">疾病名稱（診斷）</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="icdCode">ICD-10 診斷碼</Label>
                {isEditing ? (
                  <Input
                    id="icdCode"
                    value={diagnosisData.icdCode || ""}
                    onChange={(e) => handleInputChange('icdCode', e.target.value)}
                    placeholder="如：C50.9"
                  />
                ) : (
                  <div className="p-2 bg-gray-50 rounded text-sm">
                    {diagnosisData.icdCode || "待輸入"}
                    {diagnosisData.icdCode === "待輸入" && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        需要輸入
                      </Badge>
                    )}
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="diseaseName">病名</Label>
                {isEditing ? (
                  <Input
                    id="diseaseName"
                    value={diagnosisData.diseaseName || ""}
                    onChange={(e) => handleInputChange('diseaseName', e.target.value)}
                    placeholder="如：乳癌"
                  />
                ) : (
                  <div className="p-2 bg-gray-50 rounded text-sm">
                    {diagnosisData.diseaseName || "待輸入"}
                    {diagnosisData.diseaseName === "待輸入" && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        需要輸入
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* 其他欄位 */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="treatmentSummary">醫療處置摘要</Label>
              {isEditing ? (
                <Textarea
                  id="treatmentSummary"
                  value={diagnosisData.treatmentSummary || ""}
                  onChange={(e) => handleInputChange('treatmentSummary', e.target.value)}
                  placeholder="有無住院、手術，是否建議休養"
                  className="min-h-[60px]"
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-md text-sm">
                  {diagnosisData.treatmentSummary || "待輸入"}
                  {diagnosisData.treatmentSummary === "待輸入" && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      需要輸入
                    </Badge>
                  )}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="restPeriod">建議休養時間</Label>
              {isEditing ? (
                <Input
                  id="restPeriod"
                  value={diagnosisData.restPeriod || ""}
                  onChange={(e) => handleInputChange('restPeriod', e.target.value)}
                  placeholder="如：2週、1個月"
                />
              ) : (
                <div className="p-2 bg-gray-50 rounded text-sm">
                  {diagnosisData.restPeriod || "待輸入"}
                  {diagnosisData.restPeriod === "待輸入" && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      需要輸入
                    </Badge>
                  )}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="isAccident">是否因意外</Label>
              {isEditing ? (
                <Input
                  id="isAccident"
                  value={diagnosisData.isAccident || ""}
                  onChange={(e) => handleInputChange('isAccident', e.target.value)}
                  placeholder="是/否"
                />
              ) : (
                <div className="p-2 bg-gray-50 rounded text-sm">
                  {diagnosisData.isAccident || "待輸入"}
                  {diagnosisData.isAccident === "待輸入" && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      需要輸入
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (formData.type === 'policy') {
    const policyData = formData.data as any
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              <CardTitle className="text-lg">編輯保單</CardTitle>
            </div>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} variant="outline" size="sm" className="gap-2">
                <Edit3 className="h-4 w-4" />
                編輯
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={handleSave} size="sm" className="gap-2">
                  <Check className="h-4 w-4" />
                  儲存
                </Button>
                <Button onClick={handleCancel} variant="outline" size="sm" className="gap-2">
                  <X className="h-4 w-4" />
                  取消
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 基本資訊 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">基本資訊</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company">保險公司</Label>
                {isEditing ? (
                  <Select value={policyData.company || ""} onValueChange={(value) => handleInputChange('company', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="選擇保險公司" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="國泰人壽">國泰人壽</SelectItem>
                      <SelectItem value="富邦人壽">富邦人壽</SelectItem>
                      <SelectItem value="新光人壽">新光人壽</SelectItem>
                      <SelectItem value="南山人壽">南山人壽</SelectItem>
                      <SelectItem value="中國人壽">中國人壽</SelectItem>
                      <SelectItem value="台灣人壽">台灣人壽</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="p-2 bg-gray-50 rounded text-sm">
                    {policyData.company || "待輸入"}
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="policyType">保單類型</Label>
                {isEditing ? (
                  <Select value={policyData.policyType || ""} onValueChange={(value) => handleInputChange('policyType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="選擇保單類型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="醫療險">醫療保險</SelectItem>
                      <SelectItem value="壽險">壽險</SelectItem>
                      <SelectItem value="意外險">意外險</SelectItem>
                      <SelectItem value="癌症險">癌症險</SelectItem>
                      <SelectItem value="失能險">失能險</SelectItem>
                      <SelectItem value="重疾險">重大疾病險</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="p-2 bg-gray-50 rounded text-sm">
                    {policyData.policyType || "待輸入"}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="policyName">保單名稱</Label>
              {isEditing ? (
                <Input
                  id="policyName"
                  placeholder="例：安心醫療保險"
                  value={policyData.policyName || ""}
                  onChange={(e) => handleInputChange('policyName', e.target.value)}
                />
              ) : (
                <div className="p-2 bg-gray-50 rounded text-sm">
                  {policyData.policyName || "待輸入"}
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="policyNumber">保單號碼</Label>
              {isEditing ? (
                <Input
                  id="policyNumber"
                  placeholder="例：CT-MED-123456"
                  value={policyData.policyNumber || ""}
                  onChange={(e) => handleInputChange('policyNumber', e.target.value)}
                />
              ) : (
                <div className="p-2 bg-gray-50 rounded text-sm">
                  {policyData.policyNumber || "待輸入"}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">保障開始日期</Label>
              <div className="relative">
                {isEditing ? (
                  <Input
                    id="startDate"
                    type="date"
                    value={policyData.startDate || ""}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                  />
                ) : (
                  <div className="p-2 bg-gray-50 rounded text-sm">
                    {policyData.startDate || "待輸入"}
                  </div>
                )}
                {isEditing && <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />}
              </div>
            </div>
            <div>
              <Label htmlFor="endDate">保障結束日期</Label>
              <div className="relative">
                {isEditing ? (
                  <Input
                    id="endDate"
                    type="date"
                    value={policyData.endDate || ""}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                  />
                ) : (
                  <div className="p-2 bg-gray-50 rounded text-sm">
                    {policyData.endDate || "待輸入"}
                  </div>
                )}
                {isEditing && <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />}
              </div>
            </div>
          </div>

          {/* 保障範圍 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">保障範圍</h3>
            <div className="space-y-4">
              {coverageItems.map((item) => (
                <div key={item.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                  <div>
                    <Label htmlFor={`coverage-name-${item.id}`}>項目名稱</Label>
                    {isEditing ? (
                      <Input
                        id={`coverage-name-${item.id}`}
                        placeholder="例：住院醫療"
                        value={item.name}
                        onChange={(e) => handleCoverageChange(item.id, "name", e.target.value)}
                      />
                    ) : (
                      <div className="p-2 bg-gray-50 rounded text-sm">
                        {item.name || "待輸入"}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor={`coverage-amount-${item.id}`}>金額</Label>
                    {isEditing ? (
                      <Input
                        id={`coverage-amount-${item.id}`}
                        placeholder="例：3000"
                        value={item.amount}
                        onChange={(e) => handleCoverageChange(item.id, "amount", e.target.value)}
                      />
                    ) : (
                      <div className="p-2 bg-gray-50 rounded text-sm">
                        {item.amount || "待輸入"}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor={`coverage-unit-${item.id}`}>單位</Label>
                    {isEditing ? (
                      <Select
                        value={item.unit}
                        onValueChange={(value) => handleCoverageChange(item.id, "unit", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="元">元</SelectItem>
                          <SelectItem value="元/日">元/日</SelectItem>
                          <SelectItem value="元/次">元/次</SelectItem>
                          <SelectItem value="元/年">元/年</SelectItem>
                          <SelectItem value="萬元">萬元</SelectItem>
                          <SelectItem value="倍">倍</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="p-2 bg-gray-50 rounded text-sm">
                        {item.unit || "元"}
                      </div>
                    )}
                  </div>

                  <div className="flex items-end">
                    {isEditing && coverageItems.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeCoverageItem(item.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 bg-transparent"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {isEditing && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={addCoverageItem}
                  className="w-full gap-2 bg-transparent"
                >
                  <Plus className="h-4 w-4" />
                  新增保障項目
                </Button>
              )}
            </div>
          </div>

          {/* 其他資訊 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">其他資訊</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="insuredPerson">被保險人</Label>
                {isEditing ? (
                  <Input
                    id="insuredPerson"
                    placeholder="例：王小明"
                    value={policyData.insuredPerson || ""}
                    onChange={(e) => handleInputChange('insuredPerson', e.target.value)}
                  />
                ) : (
                  <div className="p-2 bg-gray-50 rounded text-sm">
                    {policyData.insuredPerson || "待輸入"}
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="beneficiary">受益人</Label>
                {isEditing ? (
                  <Input
                    id="beneficiary"
                    placeholder="例：王太明"
                    value={policyData.beneficiary || ""}
                    onChange={(e) => handleInputChange('beneficiary', e.target.value)}
                  />
                ) : (
                  <div className="p-2 bg-gray-50 rounded text-sm">
                    {policyData.beneficiary || "待輸入"}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return null
}