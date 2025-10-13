import MobileHeader from "@/components/mobile-header"
import MobileNav from "@/components/mobile-nav"
import SearchBar from "@/components/search-bar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { packages } from "@/lib/data"
import { CheckCircle2 } from "lucide-react"
import Link from "next/link"

export default function PackagesPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader userName="Leslie" />

      <main className="max-w-md mx-auto">
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Health Packages</h2>
          <div className="mb-4">
            <SearchBar />
          </div>

          <div className="space-y-4">
            {packages.map((pkg) => (
              <Card key={pkg.id} className="border-none shadow-sm">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold mb-1">{pkg.name}</h4>
                      <p className="text-xs text-muted-foreground">{pkg.description}</p>
                    </div>
                    <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded whitespace-nowrap">
                      {pkg.discount}% OFF
                    </span>
                  </div>

                  <div className="mb-3">
                    <p className="text-xs text-muted-foreground mb-2">Includes {pkg.testsCount} tests:</p>
                    <div className="space-y-1">
                      {pkg.tests.slice(0, 3).map((test, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3 h-3 text-green-600" />
                          <span className="text-xs text-muted-foreground">{test}</span>
                        </div>
                      ))}
                      {pkg.tests.length > 3 && (
                        <p className="text-xs text-primary ml-5">+{pkg.tests.length - 3} more tests</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-primary">₹{pkg.price}</span>
                        <span className="text-sm text-muted-foreground line-through">₹{pkg.mrp}</span>
                      </div>
                      <p className="text-xs text-green-600">Save ₹{pkg.mrp - pkg.price}</p>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/package?id=${pkg.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                      <Button size="sm">Add to Cart</Button>
                    </div>
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
