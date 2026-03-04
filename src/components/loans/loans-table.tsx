"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { Loan } from "@/types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

interface LoansTableProps {
  refreshTrigger?: number
}

export function LoansTable({ refreshTrigger }: LoansTableProps) {
  const { user } = useAuth()
  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)
  const t = useTranslations("LoanStatus")
  const tCommon = useTranslations("Common")

  useEffect(() => {
    fetchLoans()
  }, [refreshTrigger, user])

  const fetchLoans = async () => {
    if (!user) return
    
    setLoading(true)
    const { data, error } = await supabase
      .from("loans")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      toast.error("Failed to fetch loans")
    } else {
      setLoans(data || [])
    }
    setLoading(false)
  }

  const updateStatus = async (loanId: string, newStatus: Loan["status"]) => {
    const { error } = await supabase
      .from("loans")
      .update({ status: newStatus })
      .eq("id", loanId)

    if (error) {
      toast.error("Failed to update status")
    } else {
      toast.success("Status updated!")
      fetchLoans()
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800"
      case "approved": return "bg-blue-100 text-blue-800"
      case "active": return "bg-green-100 text-green-800"
      case "paid": return "bg-gray-100 text-gray-800"
      case "defaulted": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getCreditScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  if (loading) {
    return <div className="flex items-center justify-center p-8">{tCommon("loading")}</div>
  }

  if (loans.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-muted-foreground">
        {tCommon("noData")}
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Client</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Rate</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Monthly</TableHead>
            <TableHead>Credit Score</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loans.map((loan) => (
            <TableRow key={loan.id}>
              <TableCell>
                <div>
                  <p className="font-medium">{loan.client_name}</p>
                  <p className="text-sm text-muted-foreground">{loan.client_email}</p>
                </div>
              </TableCell>
              <TableCell>${loan.amount.toLocaleString()}</TableCell>
              <TableCell>{loan.interest_rate}%</TableCell>
              <TableCell>{loan.duration_years} {tCommon("years")}</TableCell>
              <TableCell>${loan.monthly_payment.toFixed(2)}</TableCell>
              <TableCell className={getCreditScoreColor(loan.credit_score)}>
                {loan.credit_score}/100
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(loan.status)}>
                  {t(loan.status)}
                </Badge>
              </TableCell>
              <TableCell>
                <Select
                  value={loan.status}
                  onValueChange={(v) => updateStatus(loan.id, v as Loan["status"])}
                >
                  <SelectTrigger className="w-[130px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">{t("pending")}</SelectItem>
                    <SelectItem value="approved">{t("approved")}</SelectItem>
                    <SelectItem value="active">{t("active")}</SelectItem>
                    <SelectItem value="paid">{t("paid")}</SelectItem>
                    <SelectItem value="defaulted">{t("defaulted")}</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}