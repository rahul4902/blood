"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, TestTube, Package, IndianRupee, TrendingUp, TrendingDown, Calendar, Clock, Eye } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const statsData = [
  {
    title: "Total Customers",
    value: "2,847",
    change: "+12.5%",
    trend: "up",
    icon: Users,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    title: "Total Tests",
    value: "156",
    change: "+3",
    trend: "up",
    icon: TestTube,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  {
    title: "Active Packages",
    value: "24",
    change: "+2",
    trend: "up",
    icon: Package,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  {
    title: "Monthly Revenue",
    value: "₹4,85,230",
    change: "+18.2%",
    trend: "up",
    icon: IndianRupee,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
]

const revenueData = [
  { month: "Jan", revenue: 45000, orders: 120 },
  { month: "Feb", revenue: 52000, orders: 145 },
  { month: "Mar", revenue: 48000, orders: 132 },
  { month: "Apr", revenue: 61000, orders: 168 },
  { month: "May", revenue: 55000, orders: 152 },
  { month: "Jun", revenue: 67000, orders: 189 },
]

const testPopularityData = [
  { name: "CBC", value: 35, color: "#3B82F6" },
  { name: "Thyroid", value: 25, color: "#10B981" },
  { name: "Diabetes", value: 20, color: "#F59E0B" },
  { name: "Lipid Profile", value: 15, color: "#EF4444" },
  { name: "Others", value: 5, color: "#8B5CF6" },
]

const recentOrders = [
  {
    id: "HLP001",
    customer: "Rajesh Kumar",
    test: "Complete Health Checkup",
    amount: 999,
    status: "Completed",
    date: "2024-01-20",
  },
  {
    id: "HLP002",
    customer: "Priya Sharma",
    test: "Thyroid Function Test",
    amount: 549,
    status: "Sample Collected",
    date: "2024-01-20",
  },
  {
    id: "HLP003",
    customer: "Anita Patel",
    test: "Diabetes Panel",
    amount: 399,
    status: "Pending Collection",
    date: "2024-01-19",
  },
  {
    id: "HLP004",
    customer: "Suresh Gupta",
    test: "CBC",
    amount: 299,
    status: "Report Ready",
    date: "2024-01-19",
  },
]

const pendingTasks = [
  {
    id: 1,
    title: "Review new test parameters",
    priority: "High",
    dueDate: "Today",
    type: "Test Management",
  },
  {
    id: 2,
    title: "Update package pricing",
    priority: "Medium",
    dueDate: "Tomorrow",
    type: "Package Management",
  },
  {
    id: 3,
    title: "Respond to customer queries",
    priority: "High",
    dueDate: "Today",
    type: "Customer Support",
  },
  {
    id: 4,
    title: "Upload new banner images",
    priority: "Low",
    dueDate: "This Week",
    type: "Content Management",
  },
]

export default function AdminDashboard() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-500"
      case "Sample Collected":
        return "bg-blue-500"
      case "Report Ready":
        return "bg-purple-500"
      case "Pending Collection":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-700"
      case "Medium":
        return "bg-yellow-100 text-yellow-700"
      case "Low":
        return "bg-green-100 text-green-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, Admin!</h1>
        <p className="text-blue-100">Here's what's happening with your medical lab today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    {stat.trend === "up" ? (
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-sm font-medium ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [
                    name === "revenue" ? `₹${value}` : value,
                    name === "revenue" ? "Revenue" : "Orders",
                  ]}
                />
                <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} />
                <Line type="monotone" dataKey="orders" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Test Popularity Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={testPopularityData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {testPopularityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders and Pending Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{order.customer}</span>
                      <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{order.test}</p>
                    <p className="text-xs text-gray-500">
                      Order ID: {order.id} • {order.date}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">₹{order.amount}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Tasks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Pending Tasks</CardTitle>
            <Badge variant="outline" className="bg-red-50 text-red-600">
              {pendingTasks.length} pending
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{task.title}</span>
                      <Badge className={getPriorityColor(task.priority)} variant="outline">
                        {task.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{task.type}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      {task.dueDate}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button className="h-20 flex flex-col items-center justify-center space-y-2">
              <TestTube className="w-6 h-6" />
              <span>Add New Test</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2 bg-transparent"
            >
              <Package className="w-6 h-6" />
              <span>Create Package</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2 bg-transparent"
            >
              <Users className="w-6 h-6" />
              <span>View Customers</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2 bg-transparent"
            >
              <Calendar className="w-6 h-6" />
              <span>Schedule Collection</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
