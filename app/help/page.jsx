import MobileHeader from "@/components/mobile-header"
import MobileNav from "@/components/mobile-nav"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Phone, Mail, MessageCircle, ChevronRight } from "lucide-react"
import Link from "next/link"

export default function HelpPage() {
  const helpTopics = [
    { id: 1, title: "How to book a test?", category: "Booking" },
    { id: 2, title: "Sample collection process", category: "Collection" },
    { id: 3, title: "When will I get my reports?", category: "Reports" },
    { id: 4, title: "How to download reports?", category: "Reports" },
    { id: 5, title: "Payment methods accepted", category: "Payment" },
    { id: 6, title: "Cancellation and refund policy", category: "Policy" },
  ]

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader userName="Leslie" />

      <main className="max-w-md mx-auto">
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Help & Support</h2>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input type="text" placeholder="Search for help..." className="pl-10" />
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <Link href="/chat">
              <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
                    <MessageCircle className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-xs font-medium">Chat</p>
                </CardContent>
              </Card>
            </Link>
            <a href="tel:+919876543210">
              <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
                    <Phone className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-xs font-medium">Call</p>
                </CardContent>
              </Card>
            </a>
            <a href="mailto:support@healthlab.com">
              <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-2">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-xs font-medium">Email</p>
                </CardContent>
              </Card>
            </a>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold mb-3">Popular Topics</h3>
            <div className="space-y-2">
              {helpTopics.map((topic) => (
                <Card key={topic.id} className="border-none shadow-sm">
                  <CardContent className="p-4">
                    <Link href={`/help/${topic.id}`} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium mb-1">{topic.title}</p>
                        <p className="text-xs text-muted-foreground">{topic.category}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Card className="border-none shadow-sm bg-blue-50">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2 text-sm">Need More Help?</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Our support team is available 24/7 to assist you with any queries.
              </p>
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary" />
                  <span>+91 98765 43210</span>
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" />
                  <span>support@healthlab.com</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <MobileNav />
    </div>
  )
}
