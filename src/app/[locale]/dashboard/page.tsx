"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreateLoanForm } from "@/components/loans/create-loan-form"
import { LoansTable } from "@/components/loans/loans-table"
import { ClientsList } from "@/components/clients/clients-list"
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard"
import { PaymentTracker } from "@/components/payments/payment-tracker"
import { EmailNotifications } from "@/components/payments/email-notifications"
import { LanguageSwitcher } from "@/components/ui/language-switcher"
import { useTranslations } from "next-intl"

export default function DashboardPage() {
  const { user, signOut, loading } = useAuth()
  const router = useRouter()
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const t = useTranslations("Dashboard")

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    }
  }, [user, loading, router])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!user) {
    return null
  }

  return (
    <main className="min-h-screen p-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">{t("title")}</h1>
            <p className="text-muted-foreground">{t("subtitle")}</p>
          </div>
          <div className="flex gap-4">
            <LanguageSwitcher />
            <Button variant="outline" onClick={signOut}>{t("signOut")}</Button>
          </div>
        </div>

        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid grid-cols-2 lg:grid-cols-6 gap-2">
            <TabsTrigger value="analytics">{t("analytics")}</TabsTrigger>
            <TabsTrigger value="loans">{t("loans")}</TabsTrigger>
            <TabsTrigger value="create">{t("create")}</TabsTrigger>
            <TabsTrigger value="payments">{t("payments")}</TabsTrigger>
            <TabsTrigger value="clients">{t("clients")}</TabsTrigger>
            <TabsTrigger value="email">{t("email")}</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="loans">
            <Card>
              <CardHeader>
                <CardTitle>{t("loans")}</CardTitle>
              </CardHeader>
              <CardContent>
                <LoansTable refreshTrigger={refreshTrigger} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create">
            <CreateLoanForm onLoanCreated={() => setRefreshTrigger(p => p + 1)} />
          </TabsContent>

          <TabsContent value="payments">
            <PaymentTracker />
          </TabsContent>

          <TabsContent value="clients">
            <Card>
              <CardHeader>
                <CardTitle>{t("clients")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ClientsList />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="email">
            <EmailNotifications />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}