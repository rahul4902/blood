import MobileHeader from "@/components/mobile-header"
import MobileNav from "@/components/mobile-nav"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function FAQLoading() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader userName="Leslie" />

      <main className="max-w-md mx-auto">
        <div className="p-4">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-10 w-full mb-6" />

          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="border-none shadow-sm">
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-32 mb-3" />
                  <div className="space-y-3">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <MobileNav />
    </div>
  )
}
