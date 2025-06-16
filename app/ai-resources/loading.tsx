import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Brain } from "lucide-react"

export default function Loading() {
  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="flex items-center justify-center">
              <Brain className="h-10 w-10 text-blue-600 animate-pulse" />
            </div>
            <Skeleton className="h-6 w-64 mx-auto" />
            <Skeleton className="h-4 w-full max-w-md mx-auto" />
            <Skeleton className="h-2 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <div className="flex gap-4 flex-col md:flex-row">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>

        <Skeleton className="h-6 w-48 mb-4" />

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between">
                <Skeleton className="h-6 w-64" />
                <Skeleton className="h-6 w-24" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
              <Skeleton className="h-16 w-full mt-4" />
            </CardContent>
            <CardFooter>
              <div className="flex flex-col md:flex-row justify-between w-full gap-4">
                <Skeleton className="h-4 w-64" />
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-32" />
                  <Skeleton className="h-9 w-32" />
                </div>
              </div>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between">
                <Skeleton className="h-6 w-64" />
                <Skeleton className="h-6 w-24" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
              <Skeleton className="h-16 w-full mt-4" />
            </CardContent>
            <CardFooter>
              <div className="flex flex-col md:flex-row justify-between w-full gap-4">
                <Skeleton className="h-4 w-64" />
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-32" />
                  <Skeleton className="h-9 w-32" />
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
