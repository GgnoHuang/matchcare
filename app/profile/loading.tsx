import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="container py-8 flex items-center justify-center min-h-[80vh]">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        <p>載入中...</p>
      </div>
    </div>
  )
}
