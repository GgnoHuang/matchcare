"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Edit3, Check, X, Calendar, FileText, Shield } from "lucide-react"
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
      return {
        type: 'policy',
        data: policy.policyInfo || {
          policyBasicInfo: {
            insuranceCompany: "待輸入",
            policyNumber: "待輸入",
            effectiveDate: "待輸入",
            policyTerms: "待輸入",
            insurancePeriod: "待輸入"
          },
          policyHolderInfo: {
            name: "待輸入",
            birthDate: "待輸入",
            idNumber: "待輸入",
            occupation: "待輸入",
            contactAddress: "待輸入"
          },
          insuredPersonInfo: {
            name: "待輸入",
            birthDate: "待輸入",
            gender: "待輸入",
            idNumber: "待輸入",
            occupation: "待輸入",
            contactAddress: "待輸入"
          },
          beneficiaryInfo: {
            name: "待輸入",
            relationshipToInsured: "待輸入",
            benefitRatio: "待輸入"
          },
          insuranceContentAndFees: {
            insuranceAmount: "待輸入",
            paymentMethod: "待輸入",
            paymentPeriod: "待輸入",
            dividendDistribution: "待輸入"
          },
          otherMatters: {
            automaticPremiumLoan: "待輸入",
            additionalClauses: "待輸入"
          },
          insuranceServiceInfo: {
            customerServiceHotline: "待輸入",
            claimsProcessIntro: "待輸入"
          }
        }
      }
    }

    return { type: null, data: {} }
  })

  const handleInputChange = (field: string, value: string, section?: string) => {
    setFormData(prev => {
      if (section && prev.type === 'policy') {
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
    } else if (policy) {
      setFormData({
        type: 'policy',
        data: policy.policyInfo || {}
      })
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
              <CardTitle className="text-lg">保單詳細資訊</CardTitle>
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
          {/* 保單基本資料 */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">保單基本資料</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>保險公司名稱</Label>
                {isEditing ? (
                  <Input
                    value={policyData.policyBasicInfo?.insuranceCompany || ""}
                    onChange={(e) => handleInputChange('insuranceCompany', e.target.value, 'policyBasicInfo')}
                    placeholder="保險公司名稱"
                  />
                ) : (
                  <div className="p-2 bg-gray-50 rounded text-sm">
                    {policyData.policyBasicInfo?.insuranceCompany || "待輸入"}
                  </div>
                )}
              </div>
              <div>
                <Label>保單號碼</Label>
                {isEditing ? (
                  <Input
                    value={policyData.policyBasicInfo?.policyNumber || ""}
                    onChange={(e) => handleInputChange('policyNumber', e.target.value, 'policyBasicInfo')}
                    placeholder="保單號碼"
                  />
                ) : (
                  <div className="p-2 bg-gray-50 rounded text-sm">
                    {policyData.policyBasicInfo?.policyNumber || "待輸入"}
                  </div>
                )}
              </div>
              <div>
                <Label>保單生效日期</Label>
                {isEditing ? (
                  <Input
                    value={policyData.policyBasicInfo?.effectiveDate || ""}
                    onChange={(e) => handleInputChange('effectiveDate', e.target.value, 'policyBasicInfo')}
                    placeholder="YYYY/MM/DD"
                  />
                ) : (
                  <div className="p-2 bg-gray-50 rounded text-sm">
                    {policyData.policyBasicInfo?.effectiveDate || "待輸入"}
                  </div>
                )}
              </div>
              <div>
                <Label>保險期間</Label>
                {isEditing ? (
                  <Input
                    value={policyData.policyBasicInfo?.insurancePeriod || ""}
                    onChange={(e) => handleInputChange('insurancePeriod', e.target.value, 'policyBasicInfo')}
                    placeholder="保險契約有效期限"
                  />
                ) : (
                  <div className="p-2 bg-gray-50 rounded text-sm">
                    {policyData.policyBasicInfo?.insurancePeriod || "待輸入"}
                  </div>
                )}
              </div>
            </div>
            <div>
              <Label>保單條款</Label>
              {isEditing ? (
                <Textarea
                  value={policyData.policyBasicInfo?.policyTerms || ""}
                  onChange={(e) => handleInputChange('policyTerms', e.target.value, 'policyBasicInfo')}
                  placeholder="保險責任、除外責任、理賠條件等"
                  className="min-h-[80px]"
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-md text-sm">
                  {policyData.policyBasicInfo?.policyTerms || "待輸入"}
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* 要保人資料 */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">要保人資料</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>姓名</Label>
                {isEditing ? (
                  <Input
                    value={policyData.policyHolderInfo?.name || ""}
                    onChange={(e) => handleInputChange('name', e.target.value, 'policyHolderInfo')}
                    placeholder="要保人姓名"
                  />
                ) : (
                  <div className="p-2 bg-gray-50 rounded text-sm">
                    {policyData.policyHolderInfo?.name || "待輸入"}
                  </div>
                )}
              </div>
              <div>
                <Label>出生年月日</Label>
                {isEditing ? (
                  <Input
                    value={policyData.policyHolderInfo?.birthDate || ""}
                    onChange={(e) => handleInputChange('birthDate', e.target.value, 'policyHolderInfo')}
                    placeholder="YYYY/MM/DD"
                  />
                ) : (
                  <div className="p-2 bg-gray-50 rounded text-sm">
                    {policyData.policyHolderInfo?.birthDate || "待輸入"}
                  </div>
                )}
              </div>
              <div>
                <Label>身分證字號</Label>
                {isEditing ? (
                  <Input
                    value={policyData.policyHolderInfo?.idNumber || ""}
                    onChange={(e) => handleInputChange('idNumber', e.target.value, 'policyHolderInfo')}
                    placeholder="身分證字號"
                  />
                ) : (
                  <div className="p-2 bg-gray-50 rounded text-sm">
                    {policyData.policyHolderInfo?.idNumber || "待輸入"}
                  </div>
                )}
              </div>
              <div>
                <Label>職業</Label>
                {isEditing ? (
                  <Input
                    value={policyData.policyHolderInfo?.occupation || ""}
                    onChange={(e) => handleInputChange('occupation', e.target.value, 'policyHolderInfo')}
                    placeholder="職業"
                  />
                ) : (
                  <div className="p-2 bg-gray-50 rounded text-sm">
                    {policyData.policyHolderInfo?.occupation || "待輸入"}
                  </div>
                )}
              </div>
            </div>
            <div>
              <Label>聯絡地址</Label>
              {isEditing ? (
                <Input
                  value={policyData.policyHolderInfo?.contactAddress || ""}
                  onChange={(e) => handleInputChange('contactAddress', e.target.value, 'policyHolderInfo')}
                  placeholder="聯絡地址"
                />
              ) : (
                <div className="p-2 bg-gray-50 rounded text-sm">
                  {policyData.policyHolderInfo?.contactAddress || "待輸入"}
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* 被保險人資料 */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">被保險人資料</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>姓名</Label>
                {isEditing ? (
                  <Input
                    value={policyData.insuredPersonInfo?.name || ""}
                    onChange={(e) => handleInputChange('name', e.target.value, 'insuredPersonInfo')}
                    placeholder="被保險人姓名"
                  />
                ) : (
                  <div className="p-2 bg-gray-50 rounded text-sm">
                    {policyData.insuredPersonInfo?.name || "待輸入"}
                  </div>
                )}
              </div>
              <div>
                <Label>出生年月日</Label>
                {isEditing ? (
                  <Input
                    value={policyData.insuredPersonInfo?.birthDate || ""}
                    onChange={(e) => handleInputChange('birthDate', e.target.value, 'insuredPersonInfo')}
                    placeholder="YYYY/MM/DD"
                  />
                ) : (
                  <div className="p-2 bg-gray-50 rounded text-sm">
                    {policyData.insuredPersonInfo?.birthDate || "待輸入"}
                  </div>
                )}
              </div>
              <div>
                <Label>性別</Label>
                {isEditing ? (
                  <Input
                    value={policyData.insuredPersonInfo?.gender || ""}
                    onChange={(e) => handleInputChange('gender', e.target.value, 'insuredPersonInfo')}
                    placeholder="男/女"
                  />
                ) : (
                  <div className="p-2 bg-gray-50 rounded text-sm">
                    {policyData.insuredPersonInfo?.gender || "待輸入"}
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* 保險內容與費用資料 */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">保險內容與費用資料</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>保險金額</Label>
                {isEditing ? (
                  <Input
                    value={policyData.insuranceContentAndFees?.insuranceAmount || ""}
                    onChange={(e) => handleInputChange('insuranceAmount', e.target.value, 'insuranceContentAndFees')}
                    placeholder="保險事故發生時的給付金額"
                  />
                ) : (
                  <div className="p-2 bg-gray-50 rounded text-sm">
                    {policyData.insuranceContentAndFees?.insuranceAmount || "待輸入"}
                  </div>
                )}
              </div>
              <div>
                <Label>繳費方式</Label>
                {isEditing ? (
                  <Input
                    value={policyData.insuranceContentAndFees?.paymentMethod || ""}
                    onChange={(e) => handleInputChange('paymentMethod', e.target.value, 'insuranceContentAndFees')}
                    placeholder="月繳、季繳、年繳"
                  />
                ) : (
                  <div className="p-2 bg-gray-50 rounded text-sm">
                    {policyData.insuranceContentAndFees?.paymentMethod || "待輸入"}
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* 保險公司服務資訊 */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">保險公司服務資訊</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>客服專線</Label>
                {isEditing ? (
                  <Input
                    value={policyData.insuranceServiceInfo?.customerServiceHotline || ""}
                    onChange={(e) => handleInputChange('customerServiceHotline', e.target.value, 'insuranceServiceInfo')}
                    placeholder="客服專線電話"
                  />
                ) : (
                  <div className="p-2 bg-gray-50 rounded text-sm">
                    {policyData.insuranceServiceInfo?.customerServiceHotline || "待輸入"}
                  </div>
                )}
              </div>
            </div>
            <div>
              <Label>理賠流程簡介</Label>
              {isEditing ? (
                <Textarea
                  value={policyData.insuranceServiceInfo?.claimsProcessIntro || ""}
                  onChange={(e) => handleInputChange('claimsProcessIntro', e.target.value, 'insuranceServiceInfo')}
                  placeholder="理賠流程說明"
                  className="min-h-[60px]"
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-md text-sm">
                  {policyData.insuranceServiceInfo?.claimsProcessIntro || "待輸入"}
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