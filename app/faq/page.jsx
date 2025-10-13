import PageHeader from "@/components/page-header"
import MobileNav from "@/components/mobile-nav"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

const faqs = [
  {
    category: "General",
    questions: [
      {
        question: "How do I book a blood test?",
        answer:
          "You can book a blood test by browsing our tests or packages, adding them to your cart, and proceeding to checkout. Select your preferred time slot and address for home collection.",
      },
      {
        question: "Is home sample collection free?",
        answer:
          "Yes, we offer free home sample collection for all orders. Our trained phlebotomists will visit your address at your chosen time slot.",
      },
      {
        question: "How long does it take to get reports?",
        answer:
          "Most test reports are available within 24-48 hours. Some specialized tests may take longer. You'll receive a notification once your report is ready.",
      },
    ],
  },
  {
    category: "Payment & Pricing",
    questions: [
      {
        question: "What payment methods do you accept?",
        answer:
          "We accept all major payment methods including credit/debit cards, UPI, net banking, and wallets through Razorpay. We also offer Pay on Blood Collection option.",
      },
      {
        question: "Can I use a coupon code?",
        answer:
          "Yes, you can apply coupon codes at checkout. Enter your coupon code in the designated field and click 'Apply' to get the discount.",
      },
      {
        question: "What is your refund policy?",
        answer:
          "If you cancel before sample collection, you'll receive a full refund within 5-7 business days. Refunds after collection are subject to our terms and conditions.",
      },
    ],
  },
  {
    category: "Sample Collection",
    questions: [
      {
        question: "Do I need to fast before the test?",
        answer:
          "Fasting requirements vary by test. You'll see specific instructions for each test in your booking confirmation. Generally, 8-12 hours fasting is required for lipid profile and blood sugar tests.",
      },
      {
        question: "Can I reschedule my appointment?",
        answer:
          "Yes, you can reschedule your appointment up to 2 hours before the scheduled time. Go to your orders and select the reschedule option.",
      },
      {
        question: "What if I'm not available during collection?",
        answer:
          "Please ensure someone is available at the address during the scheduled time. If you need to change the time, reschedule at least 2 hours in advance.",
      },
    ],
  },
  {
    category: "Reports & Results",
    questions: [
      {
        question: "How do I access my reports?",
        answer:
          "Your reports are available in the 'Reports' section of the app. You'll receive a notification when your report is ready. You can view, download, and share reports anytime.",
      },
      {
        question: "Can I share reports with my doctor?",
        answer:
          "Yes, you can easily share reports via WhatsApp, email, or download as PDF. There's a share button on each report for your convenience.",
      },
      {
        question: "Are my reports secure?",
        answer:
          "Yes, all reports are stored securely and are only accessible to you. We follow strict data privacy and security protocols to protect your health information.",
      },
    ],
  },
  {
    category: "Account & Profile",
    questions: [
      {
        question: "How do I add family members?",
        answer:
          "Go to the Family section in your profile and click 'Add Family Member'. Enter their details and you can book tests for them using your account.",
      },
      {
        question: "Can I change my registered mobile number?",
        answer:
          "Yes, you can update your mobile number from the Edit Profile section. You'll need to verify the new number via OTP.",
      },
      {
        question: "How do I delete my account?",
        answer:
          "To delete your account, please contact our support team through the Help Center. Note that this action is irreversible and all your data will be permanently deleted.",
      },
    ],
  },
]

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader title="Frequently Asked Questions" showBack />

      <main className="max-w-md mx-auto">
        <div className="p-4">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search FAQs..." className="pl-10" />
          </div>

          <div className="space-y-4">
            {faqs.map((category, idx) => (
              <Card key={idx} className="border-none shadow-sm">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3 text-primary">{category.category}</h3>
                  <Accordion type="single" collapsible className="w-full">
                    {category.questions.map((faq, qIdx) => (
                      <AccordionItem key={qIdx} value={`item-${idx}-${qIdx}`} className="border-b-0">
                        <AccordionTrigger className="text-sm font-medium text-left hover:no-underline py-3">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-sm text-muted-foreground pb-3">{faq.answer}</AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-none shadow-sm mt-6 bg-orange-50">
            <CardContent className="p-4 text-center">
              <p className="text-sm font-medium mb-2">Still have questions?</p>
              <p className="text-xs text-muted-foreground mb-3">Our support team is here to help you 24/7</p>
              <div className="flex gap-2">
                <a
                  href="/chat"
                  className="flex-1 bg-primary text-primary-foreground text-sm font-medium py-2 rounded-lg hover:bg-primary/90 transition-colors text-center"
                >
                  Chat with Us
                </a>
                <a
                  href="/help"
                  className="flex-1 bg-white text-primary text-sm font-medium py-2 rounded-lg hover:bg-gray-50 transition-colors text-center border border-primary"
                >
                  Help Center
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <MobileNav />
    </div>
  )
}
