"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Shield } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface MatchedPolicy {
  id: number
  company: string
  name: string
  type: string
}

interface MatchedPoliciesDropdownProps {
  count: number
  policies: MatchedPolicy[]
}

export function MatchedPoliciesDropdown({ count, policies }: MatchedPoliciesDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <Badge
        variant="outline"
        className="bg-white cursor-pointer flex items-center gap-1"
        onClick={() => setIsOpen(!isOpen)}
      >
        匹配保單: {count}
        {isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </Badge>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 z-10 bg-white rounded-md shadow-lg border p-2 min-w-[200px]">
          <div className="text-xs font-medium text-gray-500 mb-2">匹配的保單</div>
          <div className="space-y-2">
            {policies.map((policy) => (
              <div key={policy.id} className="flex items-start gap-2 p-2 hover:bg-gray-50 rounded-md">
                <Shield className="h-4 w-4 text-teal-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{policy.name}</p>
                  <p className="text-xs text-gray-500">
                    {policy.company} - {policy.type}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
