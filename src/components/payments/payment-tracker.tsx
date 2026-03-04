"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

interface Payment {
  id: string
  loan_id: string
  amount: number
  payment_date: string
  due_date: string
  status: "pending" | "paid" | "overdue"
  client_name: string
}

interface PaymentTrackerProps {
  loanId?: string
}

export function PaymentTracker({ loanId }: PaymentTrackerProps) {
  const { user } = useAuth()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const t = useTranslations("Payments")
  const tCommon = useTranslations("Common")

  useEffect(() => {
    fetchPayments()
  }, [loanId, user])

  const fetchPayments = async () => {
    if (!user) return

    setLoading(true)
    let query = supabase
      .from("payments")
      .select("*, loans(client_name)")
      .eq("user_id", user.id)
      .order("due_date", { ascending: true })

    if (loanId) {
      query = query.eq("loan_id", loanId)
    }

    const { data, error } = await query

    if (error) {
      toast.error("Failed to fetch payments")
    } else {
      const paymentsWithClient = data?.map(p => ({
        ...p,
        client_name: (p.loans as any)?.client_name || "Unknown",
      })) as Payment[]
      setPayments(paymentsWithClient || [])
    }
    setLoading(false)
  }

  const markAsPaid = async (paymentId: string) => {
    const { error } = await supabase
      .from("payments")
      .update({ status: "paid", payment_date: new Date().toISOString() })
      .eq("id", paymentId)

    if (error) {
      toast.error("Failed to mark payment as paid")
    } else {
      toast.success("Payment marked as paid!")
      fetchPayments()
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-800"
      case "overdue": return "bg-red-100 text-red-800"
      default: return "bg-yellow-100 text-yellow-800"
    }
  }

  const isOverdue = (dueDate: string, status: string) => {
    if (status === "paid") return false
    return new Date(dueDate) < new Date()
  }

  const totalPending = payments.filter(p => p.status === "pending").reduce((sum, p) => sum + p.amount, 0)
  const totalPaid = payments.filter(p => p.status === "paid").reduce((sum, p) => sum + p.amount, 0)
  const totalOverdue = payments.filter(p => isOverdue(p.due_date, p.status)).reduce((sum, p) => sum + p.amount, 0)

  if (loading) {
    return <div className="flex items-center justify-center p-8">{tCommon("loading")}</div>
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("pendingPayments")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              ${totalPending.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("totalPaid")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${totalPaid.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("overdue")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${totalOverdue.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("client")}</TableHead>
                  <TableHead>{t("amount")}</TableHead>
                  <TableHead>{t("dueDate")}</TableHead>
                  <TableHead>{t("status")}</TableHead>
                  <TableHead>{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      {t("noPayments")}
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((payment) => {
                    const overdue = isOverdue(payment.due_date, payment.status)
                    return (
                      <TableRow key={payment.id}>
                        <TableCell>{payment.client_name}</TableCell>
                        <TableCell>${payment.amount.toFixed(2)}</TableCell>
                        <TableCell>
                          {new Date(payment.due_date).toLocaleDateString()}
                          {overdue && <span className="text-red-600 text-xs ml-2">({t("overdue")})</span>}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(overdue ? "overdue" : payment.status)}>
                            {overdue ? t("overdue") : t(payment.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {payment.status === "pending" && (
                            <Button
                              size="sm"
                              onClick={() => markAsPaid(payment.id)}
                            >
                              {t("markPaid")}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}