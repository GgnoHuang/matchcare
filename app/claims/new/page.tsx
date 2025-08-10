"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, CheckCircle2, FileText, Shield, Upload, Loader2, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { MissingDataIndicator, InlineMissingData, DataQualityIndicator } from "@/components/ui/missing-data-indicator"
import { checkAuth } from "@/app/actions/auth-service"
import { userDataService } from "@/lib/storage"
import { 
  transformMedicalRecord, 
  transformInsurancePolicy, 
  generateRequiredDocuments,
  type ClaimMedicalRecord,
  type ClaimInsurancePolicy,
  type RequiredDocument 
} from "@/lib/claims/dataTransform"
import { MedicalRecord, InsurancePolicy, DiagnosisCertificate } from "@/lib/storage/types"

export default function NewClaimPage() {
  const searchParams = useSearchParams()
  const recordId = searchParams.get("record")
  const policyId = searchParams.get("policy")

  // 基本狀態
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // 用戶和資料狀態
  const [user, setUser] = useState<{ id: string, name: string } | null>(null)
  const [medicalRecords, setMedicalRecords] = useState<ClaimMedicalRecord[]>([])
  const [insurancePolicies, setInsurancePolicies] = useState<ClaimInsurancePolicy[]>([])
  const [requiredDocuments, setRequiredDocuments] = useState<RequiredDocument[]>([])

  // 選中的記錄
  const [selectedMedicalRecord, setSelectedMedicalRecord] = useState<ClaimMedicalRecord | null>(null)
  const [selectedPolicies, setSelectedPolicies] = useState<ClaimInsurancePolicy[]>([])

  // 載入用戶資料
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoading(true)
        
        // 檢查用戶登入狀態
        const { isLoggedIn, user: authUser } = await checkAuth()
        if (!isLoggedIn || !authUser) {
          window.location.href = '/login'
          return
        }
        
        setUser(authUser)
        
        // 載入用戶的醫療記錄、保單和診斷證明
        const [rawMedicalRecords, rawInsurancePolicies, diagnosisCertificates] = await Promise.all([
          userDataService.getMedicalRecords(authUser.id),
          userDataService.getInsurancePolicies(authUser.id),
          userDataService.getDiagnosisCertificates(authUser.id)
        ])
        
        console.log('載入的原始資料:')
        console.log('- 醫療記錄:', rawMedicalRecords.length, '筆')
        console.log('- 保險保單:', rawInsurancePolicies.length, '筆') 
        console.log('- 診斷證明:', diagnosisCertificates.length, '筆')
        
        // 轉換為理賠格式
        const transformedMedicalRecords = rawMedicalRecords.map(transformMedicalRecord)
        const transformedInsurancePolicies = rawInsurancePolicies.map(transformInsurancePolicy)
        const documentsRequired = generateRequiredDocuments(authUser.id, diagnosisCertificates)
        
        setMedicalRecords(transformedMedicalRecords)
        setInsurancePolicies(transformedInsurancePolicies)
        setRequiredDocuments(documentsRequired)
        
        // 如果有指定的 recordId，自動選中對應的記錄
        if (recordId && transformedMedicalRecords.length > 0) {
          const targetRecord = transformedMedicalRecords.find(r => r.id === recordId)
          if (targetRecord) {
            setSelectedMedicalRecord(targetRecord)
            console.log('自動選中病歷記錄:', targetRecord.id)
          }
        }
        
        // 如果有指定的 policyId，自動選中對應的保單
        if (policyId && transformedInsurancePolicies.length > 0) {
          const targetPolicy = transformedInsurancePolicies.find(p => p.id === policyId)
          if (targetPolicy) {
            const updatedPolicies = transformedInsurancePolicies.map(p => ({
              ...p,
              selected: p.id === policyId
            }))
            setInsurancePolicies(updatedPolicies)
            setSelectedPolicies([targetPolicy])
            console.log('自動選中保單:', targetPolicy.id)
          }
        }
        
      } catch (error) {
        console.error('載入用戶資料失敗:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadUserData()
  }, [recordId, policyId])

  // 處理醫療記錄選擇
  const handleMedicalRecordSelect = (record: ClaimMedicalRecord) => {
    setSelectedMedicalRecord(record)
  }

  // 處理保單選擇
  const handlePolicyToggle = (policyId: string) => {
    const updatedPolicies = insurancePolicies.map(policy => ({
      ...policy,
      selected: policy.id === policyId ? !policy.selected : policy.selected
    }))
    setInsurancePolicies(updatedPolicies)
    setSelectedPolicies(updatedPolicies.filter(p => p.selected))
  }

  const handleSubmit = () => {
    if (!user || !selectedMedicalRecord || selectedPolicies.length === 0) {
      return
    }

    setIsSubmitting(true)
    setProgress(0)

    // 創建理賠申請資料
    const claimId = `CL-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`
    const newClaim = {
      id: claimId,
      company: selectedPolicies.map(p => p.company).join(', '),
      policyNumber: selectedPolicies.map(p => p.policyNumber).join(', '),
      diagnosis: selectedMedicalRecord.diagnosis,
      hospital: selectedMedicalRecord.hospital,
      date: new Date().toISOString().slice(0, 10),
      status: 'pending' as const,
      amount: selectedPolicies.reduce((sum, p) => sum + p.totalEstimatedAmount, 0) || null,
      createdAt: new Date().toISOString(),
      medicalRecordId: selectedMedicalRecord.id,
      policyIds: selectedPolicies.map(p => p.id),
      selectedMedicalRecord,
      selectedPolicies
    }

    // 模擬提交過程
    const submitInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(submitInterval)
          
          try {
            // 儲存理賠申請資料到localStorage
            const storageKey = `matchcare_${user.id}_claims`
            const existingClaims = localStorage.getItem(storageKey)
            const claimsArray = existingClaims ? JSON.parse(existingClaims) : []
            
            claimsArray.push(newClaim)
            localStorage.setItem(storageKey, JSON.stringify(claimsArray))
            
            console.log('理賠申請已儲存:', claimId, newClaim)
            console.log('儲存位置:', storageKey)
          } catch (error) {
            console.error('儲存理賠申請失敗:', error)
          }
          
          setIsSubmitting(false)
          setIsSubmitted(true)
          setStep(4)
          return 100
        }
        return prev + 5
      })
    }, 100)
  }

  // 加載狀態
  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
              <p className="text-gray-500">載入理賠資料中...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 沒有資料的情況
  if (medicalRecords.length === 0 && insurancePolicies.length === 0) {
    return (
      <div className="container py-8">
        <div className="flex items-center mb-8">
          <Link href="/claims">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              返回理賠管理
            </Button>
          </Link>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800">無法申請理賠</AlertTitle>
            <AlertDescription className="text-amber-700">
              <p className="mb-2">您需要先上傳以下資料才能申請理賠：</p>
              <ul className="list-disc list-inside space-y-1 mb-4">
                {medicalRecords.length === 0 && <li>病歷記錄或診斷證明</li>}
                {insurancePolicies.length === 0 && <li>保險保單</li>}
              </ul>
              <div className="flex gap-2">
                <Button asChild size="sm" className="bg-teal-600 hover:bg-teal-700">
                  <Link href="/my-data">前往上傳資料</Link>
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex items-center mb-8">
        <Link href="/claims">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            返回理賠管理
          </Button>
        </Link>
      </div>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-2">申請理賠</h1>
        <p className="text-gray-500 mb-8">依照步驟完成理賠申請</p>

        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-gray-200 z-0"></div>
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`relative z-10 flex items-center justify-center rounded-full w-10 h-10 ${
                  s < step
                    ? "bg-teal-600 text-white"
                    : s === step
                      ? "bg-teal-600 text-white"
                      : "bg-gray-200 text-gray-500"
                }`}
              >
                {s < step ? <CheckCircle2 className="h-5 w-5" /> : s}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm font-medium">選擇病歷</span>
            <span className="text-sm font-medium">選擇保單</span>
            <span className="text-sm font-medium">上傳文件</span>
            <span className="text-sm font-medium">確認送出</span>
          </div>
        </div>

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>選擇病歷</CardTitle>
              <CardDescription>請選擇您要申請理賠的病歷記錄</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {medicalRecords.length === 0 ? (
                  <Alert>
                    <FileText className="h-4 w-4" />
                    <AlertTitle>尚無病歷記錄</AlertTitle>
                    <AlertDescription>
                      請先到「我的資料」頁面上傳您的病歷記錄或診斷證明。
                      <Button asChild size="sm" className="ml-2">
                        <Link href="/my-data">前往上傳</Link>
                      </Button>
                    </AlertDescription>
                  </Alert>
                ) : (
                  medicalRecords.map((record) => (
                    <div key={record.id} className={`border rounded-lg p-4 ${record.hasDataIssues ? 'border-amber-200 bg-amber-50/30' : ''}`}>
                      <div className="flex items-start gap-4">
                        <Checkbox 
                          id={`record-${record.id}`} 
                          checked={selectedMedicalRecord?.id === record.id}
                          onCheckedChange={() => handleMedicalRecordSelect(record)}
                        />
                        <div className="grid gap-1.5 flex-1">
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`record-${record.id}`} className="font-medium">
                              <InlineMissingData 
                                value={`${record.hospital} - ${record.department}`}
                                fieldName="醫院科別"
                                isPlaceholder={record.hospital.includes('未知') || record.department.includes('未知')}
                              /> ({record.date})
                            </Label>
                            <DataQualityIndicator 
                              completeness={(6 - record.missingFields.length) / 6}
                              confidence={record.claimSuccessRate >= 90 ? 'high' : record.claimSuccessRate >= 70 ? 'medium' : 'low'}
                            />
                          </div>
                          <p className="text-sm text-gray-500">
                            診斷結果: <InlineMissingData 
                              value={record.diagnosis} 
                              fieldName="診斷" 
                              isPlaceholder={record.diagnosis.includes('待補充')}
                            />
                          </p>
                          <p className="text-sm text-gray-500">
                            主治醫師: <InlineMissingData 
                              value={record.doctor} 
                              fieldName="醫師" 
                              isPlaceholder={record.doctor.includes('未知')}
                            />
                          </p>
                          <p className="text-sm text-gray-500">
                            治療方案: {record.treatments.join(", ")}
                          </p>
                          <p className="text-sm text-gray-500">
                            理賠成功率: <span className={`font-medium ${record.claimSuccessRate >= 80 ? 'text-green-600' : record.claimSuccessRate >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                              {record.claimSuccessRate}%
                            </span>
                          </p>
                          
                          {record.hasDataIssues && (
                            <MissingDataIndicator 
                              missingFields={record.missingFields}
                              hasDataIssues={record.hasDataIssues}
                              context="medical"
                              className="mt-2"
                              onFixData={() => window.open('/my-data', '_blank')}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" asChild>
                <Link href="/claims">取消</Link>
              </Button>
              <Button 
                onClick={() => setStep(2)} 
                disabled={!selectedMedicalRecord}
                className="bg-teal-600 hover:bg-teal-700"
              >
                下一步
              </Button>
            </CardFooter>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>選擇保單</CardTitle>
              <CardDescription>請選擇符合理賠條件的保單</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insurancePolicies.length === 0 ? (
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertTitle>尚無保險保單</AlertTitle>
                    <AlertDescription>
                      請先到「我的資料」頁面上傳您的保險保單。
                      <Button asChild size="sm" className="ml-2">
                        <Link href="/my-data">前往上傳</Link>
                      </Button>
                    </AlertDescription>
                  </Alert>
                ) : (
                  insurancePolicies.map((policy) => (
                    <div key={policy.id} className={`border rounded-lg overflow-hidden ${policy.hasDataIssues ? 'border-amber-200 bg-amber-50/30' : ''}`}>
                      <div className="p-4">
                        <div className="flex items-start gap-4">
                          <Checkbox 
                            id={`policy-${policy.id}`} 
                            checked={policy.selected}
                            onCheckedChange={() => handlePolicyToggle(policy.id)}
                          />
                          <div className="grid gap-1.5 flex-1">
                            <div className="flex items-center gap-2">
                              <Label htmlFor={`policy-${policy.id}`} className="font-medium">
                                <InlineMissingData 
                                  value={`${policy.company} - ${policy.name}`}
                                  fieldName="保險公司保單"
                                  isPlaceholder={policy.company.includes('未知') || policy.name.includes('待補充')}
                                />
                              </Label>
                              <DataQualityIndicator 
                                completeness={(5 - policy.missingFields.length) / 5}
                                confidence={policy.totalEstimatedAmount > 0 ? 'high' : 'low'}
                              />
                            </div>
                            <p className="text-sm text-gray-500">
                              保單號碼: <InlineMissingData 
                                value={policy.policyNumber} 
                                fieldName="保單號碼" 
                                isPlaceholder={policy.policyNumber.includes('待補充')}
                              />
                            </p>
                            <p className="text-sm text-gray-500">
                              保單類型: <InlineMissingData 
                                value={policy.type} 
                                fieldName="保險類型" 
                                isPlaceholder={policy.type.includes('待補充')}
                              />
                            </p>
                            
                            {policy.hasDataIssues && (
                              <MissingDataIndicator 
                                missingFields={policy.missingFields}
                                hasDataIssues={policy.hasDataIssues}
                                context="policy"
                                className="mt-2"
                                onFixData={() => window.open('/my-data', '_blank')}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 border-t">
                        <h4 className="text-sm font-medium mb-2">符合理賠項目</h4>
                        <div className="space-y-2">
                          {policy.coverage.map((item, index) => (
                            <div key={index} className="flex justify-between items-center text-sm">
                              <span className="flex items-center gap-2">
                                {item.type} 
                                {item.amount > 0 ? (
                                  <>({item.amount.toLocaleString()} {item.unit})</>
                                ) : (
                                  <span className="text-amber-600 text-xs">(金額待分析)</span>
                                )}
                                {item.confidence === 'low' && (
                                  <MissingDataIndicator 
                                    missingFields={[]} 
                                    hasDataIssues={true}
                                    context="general"
                                  />
                                )}
                              </span>
                              <span className={`font-medium ${item.estimatedAmount > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                                {item.estimatedAmount > 0 ? `${item.estimatedAmount.toLocaleString()} 元` : '待估算'}
                              </span>
                            </div>
                          ))}
                          <div className="flex justify-between items-center pt-2 border-t text-sm font-medium">
                            <span>預估理賠金額</span>
                            <span className={`${policy.totalEstimatedAmount > 0 ? 'text-teal-600' : 'text-gray-400'}`}>
                              {policy.totalEstimatedAmount > 0 ? `${policy.totalEstimatedAmount.toLocaleString()} 元` : '需要更完整的保單資訊'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                上一步
              </Button>
              <Button 
                onClick={() => setStep(3)} 
                disabled={selectedPolicies.length === 0}
                className="bg-teal-600 hover:bg-teal-700"
              >
                下一步
              </Button>
            </CardFooter>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>上傳文件</CardTitle>
              <CardDescription>請上傳理賠所需的文件</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertTitle>所需文件</AlertTitle>
                  <AlertDescription>請準備以下文件的電子檔案（PDF、JPG 或 PNG 格式），並上傳至系統。</AlertDescription>
                </Alert>

                <div className="space-y-4">
                  {requiredDocuments.map((doc) => (
                    <div key={doc.id} className={`flex items-center justify-between p-4 border rounded-lg ${doc.uploaded ? 'border-green-200 bg-green-50' : ''}`}>
                      <div className="flex items-center gap-3">
                        <div className={`p-1 rounded ${doc.uploaded ? 'bg-green-100' : 'bg-gray-100'}`}>
                          {doc.uploaded ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <FileText className="h-4 w-4 text-gray-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{doc.name}</p>
                            {doc.uploaded && <span className="text-xs text-green-600">✓ 已上傳</span>}
                          </div>
                          <p className="text-xs text-gray-500 mb-1">
                            {doc.required ? "必要文件" : "選填文件"} - {doc.description}
                          </p>
                          {doc.uploaded && doc.existingFile && (
                            <p className="text-xs text-green-600">
                              使用已上傳的文件：{doc.existingFile.fileName}
                            </p>
                          )}
                        </div>
                      </div>
                      {doc.uploaded ? (
                        <Button variant="ghost" size="sm" className="gap-1 text-green-600">
                          <CheckCircle2 className="h-3 w-3" />
                          已完成
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" className="gap-1">
                          <Upload className="h-3 w-3" />
                          上傳
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {/* 文件上傳提示 */}
                <Alert className="bg-blue-50 border-blue-200">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <p className="mb-2">💡 <strong>上傳提示：</strong></p>
                    <ul className="text-sm space-y-1 list-disc list-inside">
                      <li>如果您已經在「我的資料」中上傳過相關文件，系統會自動識別</li>
                      <li>建議上傳清晰的文件照片或掃描檔，以確保理賠順利</li>
                      <li>缺少必要文件可能會延遲理賠申請的處理時間</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                上一步
              </Button>
              <Button onClick={() => setStep(4)} className="bg-teal-600 hover:bg-teal-700">
                下一步
              </Button>
            </CardFooter>
          </Card>
        )}

        {step === 4 && !isSubmitted && (
          <Card>
            <CardHeader>
              <CardTitle>確認送出</CardTitle>
              <CardDescription>請確認以下資訊無誤，再送出理賠申請</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-500">病歷資訊</h3>
                    <div className="border rounded-lg p-4">
                      {selectedMedicalRecord ? (
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium">診斷結果</p>
                              <p className="text-sm text-gray-500">
                                <InlineMissingData 
                                  value={selectedMedicalRecord.diagnosis}
                                  fieldName="診斷結果"
                                  isPlaceholder={selectedMedicalRecord.diagnosis.includes('待補充')}
                                />
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium">就醫醫院</p>
                              <p className="text-sm text-gray-500">
                                <InlineMissingData 
                                  value={`${selectedMedicalRecord.hospital} - ${selectedMedicalRecord.department}`}
                                  fieldName="醫院科別"
                                  isPlaceholder={selectedMedicalRecord.hospital.includes('未知') || selectedMedicalRecord.department.includes('未知')}
                                />
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium">就醫日期</p>
                              <p className="text-sm text-gray-500">{selectedMedicalRecord.date}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium">主治醫師</p>
                              <p className="text-sm text-gray-500">
                                <InlineMissingData 
                                  value={selectedMedicalRecord.doctor}
                                  fieldName="醫師"
                                  isPlaceholder={selectedMedicalRecord.doctor.includes('未知')}
                                />
                              </p>
                            </div>
                          </div>
                          {selectedMedicalRecord.hasDataIssues && (
                            <MissingDataIndicator 
                              missingFields={selectedMedicalRecord.missingFields}
                              hasDataIssues={selectedMedicalRecord.hasDataIssues}
                              context="medical"
                              className="mt-2"
                              showDetails={false}
                            />
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">尚未選擇病歷記錄</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-500">保單資訊</h3>
                    <div className="space-y-3">
                      {selectedPolicies.length > 0 ? (
                        selectedPolicies.map((policy) => (
                          <div key={policy.id} className="border rounded-lg p-4">
                            <div className="space-y-2">
                              <div className="flex items-start gap-2">
                                <Shield className="h-5 w-5 text-gray-500 mt-0.5" />
                                <div>
                                  <p className="text-sm font-medium">保險公司</p>
                                  <p className="text-sm text-gray-500">
                                    <InlineMissingData 
                                      value={policy.company}
                                      fieldName="保險公司"
                                      isPlaceholder={policy.company.includes('未知')}
                                    />
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-start gap-2">
                                <Shield className="h-5 w-5 text-gray-500 mt-0.5" />
                                <div>
                                  <p className="text-sm font-medium">保單名稱</p>
                                  <p className="text-sm text-gray-500">
                                    <InlineMissingData 
                                      value={policy.name}
                                      fieldName="保單名稱"
                                      isPlaceholder={policy.name.includes('待補充')}
                                    />
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-start gap-2">
                                <Shield className="h-5 w-5 text-gray-500 mt-0.5" />
                                <div>
                                  <p className="text-sm font-medium">保單號碼</p>
                                  <p className="text-sm text-gray-500">
                                    <InlineMissingData 
                                      value={policy.policyNumber}
                                      fieldName="保單號碼"
                                      isPlaceholder={policy.policyNumber.includes('待補充')}
                                    />
                                  </p>
                                </div>
                              </div>
                              {policy.hasDataIssues && (
                                <MissingDataIndicator 
                                  missingFields={policy.missingFields}
                                  hasDataIssues={policy.hasDataIssues}
                                  context="policy"
                                  className="mt-2"
                                  showDetails={false}
                                />
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="border rounded-lg p-4">
                          <p className="text-sm text-gray-500">尚未選擇保單</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {selectedPolicies.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-500">理賠項目</h3>
                    {selectedPolicies.map((policy) => (
                      <div key={policy.id} className="border rounded-lg overflow-hidden">
                        <div className="bg-gray-50 px-4 py-2 border-b">
                          <h4 className="text-sm font-medium">{policy.company} - {policy.name}</h4>
                        </div>
                        <div className="grid grid-cols-3 p-4 text-sm font-medium bg-gray-50">
                          <div>項目</div>
                          <div>保障內容</div>
                          <div className="text-right">預估理賠金額</div>
                        </div>
                        <div className="divide-y">
                          {policy.coverage.map((item, index) => (
                            <div key={index} className="grid grid-cols-3 p-4 text-sm">
                              <div className="flex items-center gap-1">
                                {item.type}
                                {item.confidence === 'low' && (
                                  <AlertTriangle className="h-3 w-3 text-amber-500" />
                                )}
                              </div>
                              <div>
                                {item.amount > 0 ? (
                                  `${item.amount.toLocaleString()} ${item.unit}`
                                ) : (
                                  <span className="text-gray-400">保障內容待分析</span>
                                )}
                              </div>
                              <div className={`text-right ${
                                item.estimatedAmount > 0 ? 'text-gray-900' : 'text-gray-400'
                              }`}>
                                {item.estimatedAmount > 0 ? 
                                  `${item.estimatedAmount.toLocaleString()} 元` : 
                                  '待估算'
                                }
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="grid grid-cols-3 p-4 text-sm font-medium bg-gray-50 border-t">
                          <div className="col-span-2">預估理賠金額小計</div>
                          <div className={`text-right ${
                            policy.totalEstimatedAmount > 0 ? 'text-teal-600' : 'text-gray-400'
                          }`}>
                            {policy.totalEstimatedAmount > 0 ? 
                              `${policy.totalEstimatedAmount.toLocaleString()} 元` : 
                              '需要更完整的保單資訊'
                            }
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center text-lg font-medium">
                        <span>預估總理賠金額</span>
                        <span className={`${
                          selectedPolicies.reduce((sum, p) => sum + p.totalEstimatedAmount, 0) > 0 ? 
                            'text-teal-600' : 'text-gray-400'
                        }`}>
                          {selectedPolicies.reduce((sum, p) => sum + p.totalEstimatedAmount, 0) > 0 ? 
                            `${selectedPolicies.reduce((sum, p) => sum + p.totalEstimatedAmount, 0).toLocaleString()} 元` :
                            '待完善保單資訊後估算'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-2 pt-2">
                  <Checkbox id="confirm" />
                  <div className="grid gap-1.5">
                    <Label htmlFor="confirm" className="text-sm">
                      我確認以上資訊正確，並同意授權醫保通代為申請理賠
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(3)}>
                上一步
              </Button>
              <Button onClick={handleSubmit} className="bg-teal-600 hover:bg-teal-700">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    處理中...
                  </>
                ) : (
                  "送出申請"
                )}
              </Button>
            </CardFooter>
          </Card>
        )}

        {isSubmitted && (
          <Card>
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4 rounded-full bg-green-100 p-3 w-16 h-16 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">申請已送出</CardTitle>
              <CardDescription>您的理賠申請已成功送出</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">申請編號</p>
                      <p className="font-medium">CL-{new Date().toISOString().slice(0, 10).replace(/-/g, '')}-{String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">申請日期</p>
                      <p className="font-medium">{new Date().toLocaleDateString('zh-TW')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">保險公司</p>
                      <p className="font-medium">
                        {selectedPolicies.length > 0 ? 
                          selectedPolicies.map(p => p.company).join(', ') : 
                          '尚未選擇保單'
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">預估處理時間</p>
                      <p className="font-medium">5-7 個工作天</p>
                    </div>
                  </div>
                </div>
                
                {/* 顯示申請摘要 */}
                {selectedMedicalRecord && selectedPolicies.length > 0 && (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h4 className="font-medium mb-2">申請摘要</h4>
                    <div className="text-sm space-y-1">
                      <p><span className="font-medium">診斷：</span>{selectedMedicalRecord.diagnosis}</p>
                      <p><span className="font-medium">醫院：</span>{selectedMedicalRecord.hospital}</p>
                      <p><span className="font-medium">選擇保單：</span>{selectedPolicies.length} 張</p>
                      <p><span className="font-medium">預估理賠金額：</span>
                        <span className="text-teal-600 font-medium">
                          {selectedPolicies.reduce((sum, p) => sum + p.totalEstimatedAmount, 0).toLocaleString()} 元
                        </span>
                      </p>
                    </div>
                  </div>
                )}
                
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertTitle>後續流程</AlertTitle>
                  <AlertDescription>
                    <p>您的理賠申請已送至保險公司，我們將持續追蹤處理進度，並在有更新時通知您。</p>
                    <p className="mt-1">您可以隨時在「理賠管理」頁面查看申請進度。</p>
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center gap-4">
              <Button variant="outline" asChild>
                <Link href="/claims">返回理賠管理</Link>
              </Button>
              <Button asChild className="bg-teal-600 hover:bg-teal-700">
                <Link href="/claims">查看所有申請</Link>
              </Button>
            </CardFooter>
          </Card>
        )}

        {isSubmitting && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">處理中...</p>
              <p className="text-sm text-gray-500">{progress}%</p>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-gray-500">正在處理您的理賠申請，請稍候...</p>
          </div>
        )}
      </div>
    </div>
  )
}
