"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Edit3, Check, X, Calendar, FileText } from "lucide-react"
import { MedicalRecord, DiagnosisCertificate } from "@/lib/storage"

interface MedicalDataEditorProps {
  record?: MedicalRecord
  certificate?: DiagnosisCertificate
  onSave?: (data: any) => void
  onCancel?: () => void
}

export default function MedicalDataEditor({ 
  record, 
  certificate, 
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

    return { type: null, data: {} }
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      data: {
        ...prev.data,
        [field]: value
      }
    }))
  }

  const handleSave = () => {
    onSave?.(formData.data)
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
    }
    setIsEditing(false)
    onCancel?.()
  }

  if (formData.type === 'medical') {
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
                  value={formData.data.clinicalRecord || ""}
                  onChange={(e) => handleInputChange('clinicalRecord', e.target.value)}
                  placeholder="每次就診醫師寫的主訴、診斷、處置、追蹤建議等"
                  className="min-h-[80px]"
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-md text-sm">
                  {formData.data.clinicalRecord || "待輸入"}
                  {formData.data.clinicalRecord === "待輸入" && (
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
                  value={formData.data.admissionRecord || ""}
                  onChange={(e) => handleInputChange('admissionRecord', e.target.value)}
                  placeholder="包含主治醫師記錄、查房紀錄、護理紀錄等"
                  className="min-h-[80px]"
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-md text-sm">
                  {formData.data.admissionRecord || "待輸入"}
                  {formData.data.admissionRecord === "待輸入" && (
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
                  value={formData.data.surgeryRecord || ""}
                  onChange={(e) => handleInputChange('surgeryRecord', e.target.value)}
                  placeholder="包括手術名稱、時間、方式、醫師簽名"
                  className="min-h-[80px]"
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-md text-sm">
                  {formData.data.surgeryRecord || "待輸入"}
                  {formData.data.surgeryRecord === "待輸入" && (
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
                  value={formData.data.examinationReport || ""}
                  onChange={(e) => handleInputChange('examinationReport', e.target.value)}
                  placeholder="如超音波、X光、CT、MRI、病理報告等"
                  className="min-h-[60px]"
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-md text-sm">
                  {formData.data.examinationReport || "待輸入"}
                  {formData.data.examinationReport === "待輸入" && (
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
                  value={formData.data.medicationRecord || ""}
                  onChange={(e) => handleInputChange('medicationRecord', e.target.value)}
                  placeholder="記錄使用的藥物名稱、劑量、時間"
                  className="min-h-[60px]"
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-md text-sm">
                  {formData.data.medicationRecord || "待輸入"}
                  {formData.data.medicationRecord === "待輸入" && (
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
                  value={formData.data.dischargeSummary || ""}
                  onChange={(e) => handleInputChange('dischargeSummary', e.target.value)}
                  placeholder="總結此次住院經過、診斷、醫囑與追蹤建議"
                  className="min-h-[80px]"
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-md text-sm">
                  {formData.data.dischargeSummary || "待輸入"}
                  {formData.data.dischargeSummary === "待輸入" && (
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
                  value={formData.data.hospitalStamp || ""}
                  onChange={(e) => handleInputChange('hospitalStamp', e.target.value)}
                  placeholder="醫療院所章戳與簽名"
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-md text-sm">
                  {formData.data.hospitalStamp || "待輸入"}
                  {formData.data.hospitalStamp === "待輸入" && (
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
                    value={formData.data.patientName || ""}
                    onChange={(e) => handleInputChange('patientName', e.target.value)}
                    placeholder="病人姓名"
                  />
                ) : (
                  <div className="p-2 bg-gray-50 rounded text-sm">
                    {formData.data.patientName || "待輸入"}
                    {formData.data.patientName === "待輸入" && (
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
                    value={formData.data.birthDate || ""}
                    onChange={(e) => handleInputChange('birthDate', e.target.value)}
                    placeholder="YYYY/MM/DD"
                  />
                ) : (
                  <div className="p-2 bg-gray-50 rounded text-sm">
                    {formData.data.birthDate || "待輸入"}
                    {formData.data.birthDate === "待輸入" && (
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
                    value={formData.data.idNumber || ""}
                    onChange={(e) => handleInputChange('idNumber', e.target.value)}
                    placeholder="身分證字號"
                  />
                ) : (
                  <div className="p-2 bg-gray-50 rounded text-sm">
                    {formData.data.idNumber || "待輸入"}
                    {formData.data.idNumber === "待輸入" && (
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
                    value={formData.data.firstVisitDate || ""}
                    onChange={(e) => handleInputChange('firstVisitDate', e.target.value)}
                    placeholder="YYYY/MM/DD"
                  />
                ) : (
                  <div className="p-2 bg-gray-50 rounded text-sm">
                    {formData.data.firstVisitDate || "待輸入"}
                    {formData.data.firstVisitDate === "待輸入" && (
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
                    value={formData.data.certificateDate || ""}
                    onChange={(e) => handleInputChange('certificateDate', e.target.value)}
                    placeholder="YYYY/MM/DD"
                  />
                ) : (
                  <div className="p-2 bg-gray-50 rounded text-sm">
                    {formData.data.certificateDate || "待輸入"}
                    {formData.data.certificateDate === "待輸入" && (
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
                    value={formData.data.icdCode || ""}
                    onChange={(e) => handleInputChange('icdCode', e.target.value)}
                    placeholder="如：C50.9"
                  />
                ) : (
                  <div className="p-2 bg-gray-50 rounded text-sm">
                    {formData.data.icdCode || "待輸入"}
                    {formData.data.icdCode === "待輸入" && (
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
                    value={formData.data.diseaseName || ""}
                    onChange={(e) => handleInputChange('diseaseName', e.target.value)}
                    placeholder="如：乳癌"
                  />
                ) : (
                  <div className="p-2 bg-gray-50 rounded text-sm">
                    {formData.data.diseaseName || "待輸入"}
                    {formData.data.diseaseName === "待輸入" && (
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
                  value={formData.data.treatmentSummary || ""}
                  onChange={(e) => handleInputChange('treatmentSummary', e.target.value)}
                  placeholder="有無住院、手術，是否建議休養"
                  className="min-h-[60px]"
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-md text-sm">
                  {formData.data.treatmentSummary || "待輸入"}
                  {formData.data.treatmentSummary === "待輸入" && (
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
                  value={formData.data.restPeriod || ""}
                  onChange={(e) => handleInputChange('restPeriod', e.target.value)}
                  placeholder="如：2週、1個月"
                />
              ) : (
                <div className="p-2 bg-gray-50 rounded text-sm">
                  {formData.data.restPeriod || "待輸入"}
                  {formData.data.restPeriod === "待輸入" && (
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
                  value={formData.data.isAccident || ""}
                  onChange={(e) => handleInputChange('isAccident', e.target.value)}
                  placeholder="是/否"
                />
              ) : (
                <div className="p-2 bg-gray-50 rounded text-sm">
                  {formData.data.isAccident || "待輸入"}
                  {formData.data.isAccident === "待輸入" && (
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

  return null
}