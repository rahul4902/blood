import MobileHeader from "@/components/mobile-header"
import MobileNav from "@/components/mobile-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, CheckCircle2, XCircle, Package } from "lucide-react"
import Link from "next/link"

export default function OrdersPage() {
  const orders = [
    {
      id: "12345",
      date: "15 Jan 2025",
      status: "completed",
      items: ["Complete Health Checkup"],
      amount: 1799,
      reportAvailable: true,
    },
    {
      id: "12344",
      date: "10 Jan 2025",
      status: "pending",
      items: ["Diabetes Panel", "Thyroid Profile"],
      amount: 899,
      reportAvailable: false,
    },
    {
      id: "12343",
      date: "05 Jan 2025",
      status: "completed",
      items: ["HbA1c Test"],
      amount: 499,
      reportAvailable: true,
    },
  ]

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />
      case "pending":
        return <Clock className="w-5 h-5 text-orange-500" />
      case "cancelled":
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return <Package className="w-5 h-5 text-muted-foreground" />
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case "completed":
        return "Completed"
      case "pending":
        return "Sample Collected"
      case "cancelled":
        return "Cancelled"
      default:
        return "Processing"
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "text-green-600"
      case "pending":
        return "text-orange-500"
      case "cancelled":
        return "text-red-600"
      default:
        return "text-muted-foreground"
    }
  }

  const completedOrders = orders.filter((o) => o.status === "completed")
  const activeOrders = orders.filter((o) => o.status !== "completed" && o.status !== "cancelled")

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader userName="Leslie" />

      <main className="max-w-md mx-auto">
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">My Orders</h2>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="all">All ({orders.length})</TabsTrigger>
              <TabsTrigger value="active">Active ({activeOrders.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({completedOrders.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-3">
              {orders.map((order) => (
                <Card key={order.id} className="border-none shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-sm font-semibold mb-1">Order #{order.id}</p>
                        <p className="text-xs text-muted-foreground">{order.date}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(order.status)}
                        <span className={`text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>
                    </div>
                    <div className="mb-3">
                      {order.items.map((item, idx) => (
                        <p key={idx} className="text-sm text-foreground">
                          • {item}
                        </p>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-primary">₹{order.amount}</p>
                      <div className="flex gap-2">
                        <Link href={`/order-details?id=${order.id}`}>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </Link>
                        {order.reportAvailable && (
                          <Link href={`/reports?orderId=${order.id}`}>
                            <Button size="sm">View Report</Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="active" className="space-y-3">
              {activeOrders.length > 0 ? (
                activeOrders.map((order) => (
                  <Card key={order.id} className="border-none shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-sm font-semibold mb-1">Order #{order.id}</p>
                          <p className="text-xs text-muted-foreground">{order.date}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(order.status)}
                          <span className={`text-xs font-medium ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                        </div>
                      </div>
                      <div className="mb-3">
                        {order.items.map((item, idx) => (
                          <p key={idx} className="text-sm text-foreground">
                            • {item}
                          </p>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-primary">₹{order.amount}</p>
                        <Link href={`/order-details?id=${order.id}`}>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No active orders</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-3">
              {completedOrders.map((order) => (
                <Card key={order.id} className="border-none shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-sm font-semibold mb-1">Order #{order.id}</p>
                        <p className="text-xs text-muted-foreground">{order.date}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(order.status)}
                        <span className={`text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>
                    </div>
                    <div className="mb-3">
                      {order.items.map((item, idx) => (
                        <p key={idx} className="text-sm text-foreground">
                          • {item}
                        </p>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-primary">₹{order.amount}</p>
                      <div className="flex gap-2">
                        <Link href={`/order-details?id=${order.id}`}>
                          <Button variant="outline" size="sm">
                            Details
                          </Button>
                        </Link>
                        {order.reportAvailable && (
                          <Link href={`/reports?orderId=${order.id}`}>
                            <Button size="sm">Report</Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <MobileNav />
    </div>
  )
}
