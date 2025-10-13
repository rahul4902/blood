import PageHeader from "@/components/page-header"
import MobileNav from "@/components/mobile-nav"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function UploadPrescriptionLoading() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader title="Upload Prescription" />

      <main className="max-w-md mx-auto p-4">
        <Card className="border-none shadow-sm mb-4">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <div>
            <Skeleton className="h-5 w-32 mb-3" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>

          <div>
            <Skeleton className="h-5 w-40 mb-3" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>

          <div className="space-y-3">
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </div>
      </main>

      <MobileNav />
    </div>
  )
}
