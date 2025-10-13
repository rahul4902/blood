import MobileHeader from "@/components/mobile-header"
import MobileNav from "@/components/mobile-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { categories, tests, packages } from "@/lib/data"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

export default function CategoryPage({ searchParams }) {
  const categoryId = Number.parseInt(searchParams.id || "1")
  const category = categories.find((c) => c.id === categoryId) || categories[0]

  const categoryTests = tests.filter((test) => test.categoryId === categoryId)
  const categoryPackages = packages.filter((pkg) => pkg.name.toLowerCase().includes(category.name.toLowerCase()))

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader userName="Leslie" />

      <main className="max-w-md mx-auto">
        <div className="p-4">
          <Link href="/categories" className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <ChevronLeft className="w-4 h-4" />
            Back to Categories
          </Link>

          <div className="mb-6 text-center">
            <div
              className={`${category.color} w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-3 text-4xl`}
            >
              {category.icon}
            </div>
            <h1 className="text-2xl font-bold">{category.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {categoryTests.length} tests and {categoryPackages.length} packages available
            </p>
          </div>

          <Tabs defaultValue="tests" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="tests">Tests ({categoryTests.length})</TabsTrigger>
              <TabsTrigger value="packages">Packages ({categoryPackages.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="tests" className="space-y-3">
              {categoryTests.length > 0 ? (
                categoryTests.map((test) => (
                  <Card key={test.id} className="border-none shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-2xl">🩸</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm mb-1">{test.name}</h4>
                          <p className="text-xs text-muted-foreground">{test.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-primary text-lg">₹{test.price}</p>
                          <p className="text-xs text-muted-foreground">{test.tat_time} report</p>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/test?id=${test.id}`}>
                            <Button variant="outline" size="sm">
                              Details
                            </Button>
                          </Link>
                          <Button size="sm">Add</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No tests available in this category</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="packages" className="space-y-3">
              {categoryPackages.length > 0 ? (
                categoryPackages.map((pkg) => (
                  <Card key={pkg.id} className="border-none shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold mb-1">{pkg.name}</h4>
                          <p className="text-xs text-muted-foreground">{pkg.testsCount} tests included</p>
                        </div>
                        <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded">
                          {pkg.discount}% OFF
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-primary">₹{pkg.price}</span>
                            <span className="text-sm text-muted-foreground line-through">₹{pkg.mrp}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/package?id=${pkg.id}`}>
                            <Button variant="outline" size="sm">
                              Details
                            </Button>
                          </Link>
                          <Button size="sm">Add</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No packages available in this category</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <MobileNav />
    </div>
  )
}
