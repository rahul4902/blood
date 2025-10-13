import MobileHeader from "@/components/mobile-header"
import MobileNav from "@/components/mobile-nav"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function EditProfileLoading() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader userName="Leslie" />

      <main className="max-w-md mx-auto">
        <div className="p-4">
          <Skeleton className="h-4 w-32 mb-4" />
          <Skeleton className="h-8 w-40 mb-6" />

          <div className="flex justify-center mb-6">
            <Skeleton className="w-24 h-24 rounded-full" />
          </div>

          <Card className="border-none shadow-sm mb-4">
            <CardContent className="p-4 space-y-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 flex-1" />
          </div>
        </div>
      </main>

      <MobileNav />
    </div>
  )
}
