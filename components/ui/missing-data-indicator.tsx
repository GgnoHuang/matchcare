/**
 * 缺失資料提示組件
 * 用於在UI中顯示資料可能不完整的提示
 */

import { AlertTriangle, Info, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

interface MissingDataIndicatorProps {
  missingFields: string[]
  hasDataIssues: boolean
  context: 'medical' | 'policy' | 'general'
  className?: string
  showDetails?: boolean
  onFixData?: () => void
}

export function MissingDataIndicator({ 
  missingFields, 
  hasDataIssues, 
  context, 
  className = "",
  showDetails = false,
  onFixData
}: MissingDataIndicatorProps) {
  if (!hasDataIssues || missingFields.length === 0) {
    return null
  }

  const getContextMessage = () => {
    switch (context) {
      case 'medical':
        return '此病歷記錄的部分資訊可能不完整，這可能影響理賠申請的準確性'
      case 'policy':
        return '此保單的部分資訊可能不完整，這可能影響理賠金額的估算'
      default:
        return '部分資訊可能不完整'
    }
  }

  const getFixSuggestion = () => {
    switch (context) {
      case 'medical':
        return '建議重新上傳更清晰的病歷文件，或聯繫醫院補充相關資料'
      case 'policy':
        return '建議重新上傳更清晰的保單文件，或聯繫保險公司確認保障內容'
      default:
        return '建議重新上傳更完整的文件'
    }
  }

  return (
    <div className={className}>
      {/* 簡單的警告標籤 */}
      {!showDetails && (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1">
          <AlertTriangle className="h-3 w-3" />
          資料待補充
        </Badge>
      )}

      {/* 詳細的警告提示 */}
      {showDetails && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <div className="space-y-2">
              <p className="font-medium">{getContextMessage()}</p>
              
              {missingFields.length > 0 && (
                <div>
                  <p className="text-sm mb-1">缺失或不完整的資訊：</p>
                  <div className="flex flex-wrap gap-1">
                    {missingFields.map((field, index) => (
                      <Badge key={index} variant="outline" className="text-xs bg-white">
                        {field}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <p className="text-sm text-amber-700">
                {getFixSuggestion()}
              </p>
              
              {onFixData && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onFixData}
                  className="gap-2 text-amber-700 border-amber-300 hover:bg-amber-100"
                >
                  <ExternalLink className="h-3 w-3" />
                  重新上傳文件
                </Button>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

/**
 * 簡單的內聯缺失資料提示
 */
interface InlineMissingDataProps {
  value: string
  fieldName: string
  isPlaceholder?: boolean
}

export function InlineMissingData({ value, fieldName, isPlaceholder = false }: InlineMissingDataProps) {
  const isMissing = isPlaceholder || 
    value.includes('待補充') || 
    value.includes('待輸入') || 
    value.includes('未知') ||
    value === ''

  if (!isMissing) {
    return <span>{value}</span>
  }

  return (
    <span className="inline-flex items-center gap-1">
      <span className="text-gray-400">{value}</span>
      <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-600 border border-amber-200 rounded-md text-xs px-1 py-0.5">
        <AlertTriangle className="h-2 w-2" />
        待補充
      </span>
    </span>
  )
}

/**
 * 資料品質指示器
 */
interface DataQualityIndicatorProps {
  completeness: number // 0-1 之間
  confidence: 'high' | 'medium' | 'low'
  showPercentage?: boolean
}

export function DataQualityIndicator({ 
  completeness, 
  confidence, 
  showPercentage = false 
}: DataQualityIndicatorProps) {
  const percentage = Math.round(completeness * 100)
  
  const getColor = () => {
    if (completeness >= 0.8 && confidence === 'high') return 'bg-green-500'
    if (completeness >= 0.6 && confidence !== 'low') return 'bg-yellow-500'
    return 'bg-red-500'
  }
  
  const getLabel = () => {
    if (completeness >= 0.8 && confidence === 'high') return '資料完整'
    if (completeness >= 0.6) return '資料尚可'
    return '資料不足'
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <div className={`w-2 h-2 rounded-full ${getColor()}`} />
        <span className="text-xs text-gray-600">{getLabel()}</span>
      </div>
      {showPercentage && (
        <Badge variant="outline" className="text-xs">
          {percentage}%
        </Badge>
      )}
    </div>
  )
}