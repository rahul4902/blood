"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, TrendingUp, Clock, Shield, Award } from "lucide-react"
import { useAppDispatch } from "@/lib/hooks"
import { setSearchModalOpen } from "@/lib/features/ui/uiSlice"

const quickActions = [
  {
    title: "Popular Tests",
    description: "Most booked tests",
    icon: <TrendingUp className="w-5 h-5" />,
    count: "50+",
  },
  {
    title: "Health Packages",
    description: "Comprehensive checkups",
    icon: <Shield className="w-5 h-5" />,
    count: "25+",
  },
  {
    title: "Quick Reports",
    description: "Results in 24 hours",
    icon: <Clock className="w-5 h-5" />,
    count: "Fast",
  },
  {
    title: "NABL Certified",
    description: "Quality assured",
    icon: <Award className="w-5 h-5" />,
    count: "Certified",
  },
]

const trendingSearches = [
  "Complete Blood Count",
  "Thyroid Function",
  "Diabetes Panel",
  "Lipid Profile",
  "Liver Function",
  "Kidney Function",
]

export function SearchBanner() {
  const dispatch = useAppDispatch()
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearchClick = () => {
    dispatch(setSearchModalOpen(true))
  }

  return (
    <section className="py-8 md:py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Search Card */}
        <Card className="mb-8 border border-gray-200 shadow-sm bg-white">
          <CardContent className="p-6 md:p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Find Your Perfect Health Test</h2>
              <p className="text-gray-600 text-base md:text-lg">
                Search from 100+ tests and packages with instant results
              </p>
            </div>

            {/* Enhanced Search Bar */}
            <div className="max-w-3xl mx-auto mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search tests, packages, or health conditions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClick={handleSearchClick}
                  className="h-12 md:h-14 text-base md:text-lg bg-white border border-gray-200 focus:border-blue-300 rounded-lg pl-12 pr-24 cursor-pointer"
                  readOnly
                />
                <Button
                  onClick={handleSearchClick}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 md:h-10 px-4 bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  Search
                </Button>
              </div>
            </div>

            {/* Trending Searches */}
            <div className="text-center mb-6">
              <p className="text-sm text-gray-600 mb-3">Trending Searches:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {trendingSearches.map((search, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors border-gray-200"
                    onClick={handleSearchClick}
                  >
                    {search}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {quickActions.map((action, index) => (
            <Card
              key={index}
              className="cursor-pointer hover:shadow-md transition-shadow border border-gray-200 bg-white"
              onClick={handleSearchClick}
            >
              <CardContent className="p-4 md:p-6 text-center">
                <div className="flex justify-center mb-3">
                  <div className="p-3 rounded-full bg-blue-50 text-blue-600">{action.icon}</div>
                </div>
                <h3 className="font-semibold text-sm md:text-base mb-1 text-gray-900">{action.title}</h3>
                <p className="text-xs md:text-sm text-gray-600 mb-2">{action.description}</p>
                <Badge variant="outline" className="border-blue-200 text-blue-600">
                  {action.count}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
