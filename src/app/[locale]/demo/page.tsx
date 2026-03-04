"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { demoLoans, demoClients, demoAnalytics, clearDemoMode } from "@/lib/demo-data"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/routing"

export default function DemoPage() {
  const router = useRouter()
  const t = useTranslations("Dashboard")
  const [activeTab, setActiveTab] = useState("analytics")

  return (
    <main className="min-h-screen p-8 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Demo Banner */}
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-primary">🎯 Demo Mode</h2>
              <p className="text-sm text-muted-foreground">
                You're exploring a demo with sample data. Sign up to manage your real loans!
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/">
                <Button variant="outline">Back to Home</Button>
              </Link>
              <Button onClick={() => { clearDemoMode(); router.push("/"); }}>
                Exit Demo
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">{t("title")} (Demo)</h1>
            <p className="text-muted-foreground">{t("subtitle")}</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 lg:grid-cols-6 gap-2">
            <TabsTrigger value="analytics">{t("analytics")}</TabsTrigger>
            <TabsTrigger value="loans">{t("loans")}</TabsTrigger>
            <TabsTrigger value="create" disabled>Create</TabsTrigger>
            <TabsTrigger value="payments" disabled>Payments</TabsTrigger>
            <TabsTrigger value="clients">{t("clients")}</TabsTrigger>
            <TabsTrigger value="email" disabled>Email</TabsTrigger>
          </TabsList>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Portfolio Value
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${demoAnalytics.totalPortfolioValue.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {demoAnalytics.totalLoans} total loans
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Active Loans
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{demoAnalytics.totalActiveLoans}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {demoAnalytics.totalPendingLoans} pending
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Interest Earned
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    ${demoAnalytics.totalInterestEarned.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Projected revenue
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Default Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {demoAnalytics.defaultRate.toFixed(1)}%
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Loans Tab */}
          <TabsContent value="loans">
            <Card>
              <CardHeader>
                <CardTitle>Sample Loans</CardTitle>
                <CardDescription>These are demo loans to show you how the system works</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Client</th>
                        <th className="text-left p-3">Amount</th>
                        <th className="text-left p-3">Rate</th>
                        <th className="text-left p-3">Duration</th>
                        <th className="text-left p-3">Monthly</th>
                        <th className="text-left p-3">Credit Score</th>
                        <th className="text-left p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {demoLoans.map((loan) => (
                        <tr key={loan.id} className="border-b">
                          <td className="p-3">
                            <p className="font-medium">{loan.client_name}</p>
                            <p className="text-sm text-muted-foreground">{loan.client_email}</p>
                          </td>
                          <td className="p-3">${loan.amount.toLocaleString()}</td>
                          <td className="p-3">{loan.interest_rate}%</td>
                          <td className="p-3">{loan.duration_years} years</td>
                          <td className="p-3">${loan.monthly_payment.toFixed(2)}</td>
                          <td className="p-3">
                            <span className={loan.credit_score >= 80 ? "text-green-600" : loan.credit_score >= 60 ? "text-yellow-600" : "text-red-600"}>
                              {loan.credit_score}/100
                            </span>
                          </td>
                          <td className="p-3">
                            <Badge className={
                              loan.status === "active" ? "bg-green-100 text-green-800" :
                              loan.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                              "bg-gray-100 text-gray-800"
                            }>
                              {loan.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Clients Tab */}
          <TabsContent value="clients">
            <Card>
              <CardHeader>
                <CardTitle>Sample Clients</CardTitle>
                <CardDescription>See how client tracking works</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Client</th>
                        <th className="text-left p-3">Total Loans</th>
                        <th className="text-left p-3">Total Amount</th>
                        <th className="text-left p-3">Active Loans</th>
                        <th className="text-left p-3">Avg Credit Score</th>
                        <th className="text-left p-3">Risk Level</th>
                      </tr>
                    </thead>
                    <tbody>
                      {demoClients.map((client, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-3">
                            <p className="font-medium">{client.client_name}</p>
                            <p className="text-sm text-muted-foreground">{client.client_email}</p>
                          </td>
                          <td className="p-3">{client.total_loans}</td>
                          <td className="p-3">${client.total_amount.toLocaleString()}</td>
                          <td className="p-3">{client.active_loans}</td>
                          <td className="p-3">{client.avg_credit_score}/100</td>
                          <td className="p-3">
                            <Badge className={
                              client.risk_level === "Low" ? "bg-green-100 text-green-800" :
                              client.risk_level === "Medium" ? "bg-yellow-100 text-yellow-800" :
                              "bg-red-100 text-red-800"
                            }>
                              {client.risk_level}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Disabled Tabs Message */}
          <TabsContent value="create">
            <Card>
              <CardContent className="p-8 text-center">
                <h3 className="text-lg font-bold mb-2">🔒 Available in Full Version</h3>
                <p className="text-muted-foreground mb-4">
                  Create loans, track payments, and send emails with a membership
                </p>
                <Button onClick={() => { clearDemoMode(); router.push("/"); }}>
                  Sign Up Now
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardContent className="p-8 text-center">
                <h3 className="text-lg font-bold mb-2">🔒 Available in Full Version</h3>
                <p className="text-muted-foreground mb-4">
                  Track payments and mark them as paid with a membership
                </p>
                <Button onClick={() => { clearDemoMode(); router.push("/"); }}>
                  Sign Up Now
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="email">
            <Card>
              <CardContent className="p-8 text-center">
                <h3 className="text-lg font-bold mb-2">🔒 Available in Full Version</h3>
                <p className="text-muted-foreground mb-4">
                  Send automated email notifications with a membership
                </p>
                <Button onClick={() => { clearDemoMode(); router.push("/"); }}>
                  Sign Up Now
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* CTA Section */}
        <Card className="mt-8 bg-primary text-primary-foreground">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="mb-6 opacity-90">
              Sign up now to manage your real loans with full access to all features
            </p>
            <Button size="lg" variant="secondary" onClick={() => { clearDemoMode(); router.push("/"); }}>
              Create Free Account
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}