"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

interface AnalyticsData {
  totalLoans: number
  totalPortfolioValue: number
  totalActiveLoans: number
  totalPendingLoans: number
  totalPaidLoans: number
  averageLoanAmount: number
  totalInterestEarned: number
  defaultRate: number
  loansByStatus: { name: string; value: number }[]
  monthlyRevenue: { month: string; revenue: number }[]
}

export function AnalyticsDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const t = useTranslations("Analytics")
  const tCommon = useTranslations("Common")

  useEffect(() => {
    fetchAnalytics()
  }, [user])

  const fetchAnalytics = async () => {
    if (!user) return

    setLoading(true)
    const { data: loans, error } = await supabase
      .from("loans")
      .select("*")
      .eq("user_id", user.id)

    if (error) {
      toast.error("Failed to fetch analytics")
      setLoading(false)
      return
    }

    if (!loans) {
      setLoading(false)
      return
    }

    const totalLoans = loans.length
    const totalPortfolioValue = loans.reduce((sum: number, loan: any) => sum + Number(loan.amount), 0)
    const totalActiveLoans = loans.filter((l: any) => l.status === "active").length
    const totalPendingLoans = loans.filter((l: any) => l.status === "pending" || l.status === "approved").length
    const totalPaidLoans = loans.filter((l: any) => l.status === "paid").length
    const totalDefaultedLoans = loans.filter((l: any) => l.status === "defaulted").length
    const averageLoanAmount = totalLoans > 0 ? totalPortfolioValue / totalLoans : 0
    const totalInterestEarned = loans.reduce((sum: number, loan: any) => sum + Number(loan.total_interest), 0)
    const defaultRate = totalLoans > 0 ? (totalDefaultedLoans / totalLoans) * 100 : 0

    const loansByStatus = [
      { name: "Active", value: loans.filter((l: any) => l.status === "active").length },
      { name: "Pending", value: loans.filter((l: any) => l.status === "pending" || l.status === "approved").length },
      { name: "Paid", value: loans.filter((l: any) => l.status === "paid").length },
      { name: "Defaulted", value: totalDefaultedLoans },
    ].filter(item => item.value > 0)

    const monthlyData: Record<string, number> = {}
    loans.forEach((loan: any) => {
      const month = new Date(loan.created_at).toLocaleString("default", { month: "short" })
      monthlyData[month] = (monthlyData[month] || 0) + Number(loan.monthly_payment)
    })

    const monthlyRevenue = Object.entries(monthlyData).map(([month, revenue]) => ({
      month,
      revenue: Math.round(revenue),
    }))

    setData({
      totalLoans,
      totalPortfolioValue,
      totalActiveLoans,
      totalPendingLoans,
      totalPaidLoans,
      averageLoanAmount,
      totalInterestEarned,
      defaultRate,
      loansByStatus,
      monthlyRevenue,
    })

    setLoading(false)
  }

  if (loading) {
    return <div className="flex items-center justify-center p-8">{tCommon("loading")}</div>
  }

  if (!data) {
    return <div className="flex items-center justify-center p-8 text-muted-foreground">{tCommon("noData")}</div>
  }

  const COLORS = ["#22c55e", "#eab308", "#3b82f6", "#ef4444"]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("totalPortfolioValue")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${data.totalPortfolioValue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.totalLoans} {t("totalLoans")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("activeLoans")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalActiveLoans}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.totalPendingLoans} {t("pending")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("totalInterestEarned")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${data.totalInterestEarned.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("projectedRevenue")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("defaultRate")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${data.defaultRate > 10 ? "text-red-600" : "text-green-600"}`}>
              {data.defaultRate.toFixed(1)}%
            </div>
            <Progress value={data.defaultRate} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("loansByStatus")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.loansByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.loansByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("monthlyRevenue")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#3b82f6" name="Monthly Payment ($)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("portfolioHealth")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">{t("averageLoanAmount")}</p>
              <p className="text-2xl font-bold">${Math.round(data.averageLoanAmount).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("totalPaidLoans")}</p>
              <p className="text-2xl font-bold text-green-600">{data.totalPaidLoans}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("successRate")}</p>
              <p className="text-2xl font-bold text-green-600">
                {data.totalLoans > 0 ? ((data.totalPaidLoans / data.totalLoans) * 100).toFixed(1) : 0}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}