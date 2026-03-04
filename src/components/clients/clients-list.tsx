"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

interface Client {
  client_name: string
  client_email: string
  total_loans: number
  total_amount: number
  avg_credit_score: number
  active_loans: number
  risk_level: "Low" | "Medium" | "High"
}

export function ClientsList() {
  const { user } = useAuth()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const t = useTranslations("Clients")
  const tCommon = useTranslations("Common")

  useEffect(() => {
    fetchClients()
  }, [user])

  const fetchClients = async () => {
    if (!user) return
    
    setLoading(true)
    const { data, error } = await supabase
      .from("loans")
      .select("client_name, client_email, amount, credit_score, status")
      .eq("user_id", user.id)

    if (error) {
      toast.error("Failed to fetch clients")
    } else {
      const clientMap = new Map<string, Client>()
      
      data?.forEach((loan) => {
        const key = loan.client_email
        const existing = clientMap.get(key)
        
        if (existing) {
          existing.total_loans += 1
          existing.total_amount += Number(loan.amount)
          existing.avg_credit_score = Math.round(
            (existing.avg_credit_score * (existing.total_loans - 1) + Number(loan.credit_score)) / existing.total_loans
          )
          if (loan.status === "active" || loan.status === "pending" || loan.status === "approved") {
            existing.active_loans += 1
          }
        } else {
          clientMap.set(key, {
            client_name: loan.client_name,
            client_email: loan.client_email,
            total_loans: 1,
            total_amount: Number(loan.amount),
            avg_credit_score: Number(loan.credit_score),
            active_loans: loan.status === "active" || loan.status === "pending" || loan.status === "approved" ? 1 : 0,
            risk_level: "Low",
          })
        }
      })

      clientMap.forEach((client) => {
        if (client.avg_credit_score >= 80) client.risk_level = "Low"
        else if (client.avg_credit_score >= 60) client.risk_level = "Medium"
        else client.risk_level = "High"
      })

      setClients(Array.from(clientMap.values()))
    }
    setLoading(false)
  }

  const refreshCreditScores = async () => {
    const uniqueClients = [...new Set(clients.map(c => c.client_email))]
    
    for (const email of uniqueClients) {
      await supabase.rpc("update_credit_score", { p_client_email: email })
    }
    
    toast.success("Credit scores updated!")
    fetchClients()
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low": return "bg-green-100 text-green-800"
      case "Medium": return "bg-yellow-100 text-yellow-800"
      case "High": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center p-8">{tCommon("loading")}</div>
  }

  if (clients.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-muted-foreground">
        {t("noClients")}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{t("title")}</CardTitle>
          <Button size="sm" onClick={refreshCreditScores}>{t("refreshScores")}</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>{t("totalLoans")}</TableHead>
                <TableHead>{t("totalAmount")}</TableHead>
                <TableHead>{t("activeLoans")}</TableHead>
                <TableHead>{t("avgCreditScore")}</TableHead>
                <TableHead>{t("riskLevel")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{client.client_name}</p>
                      <p className="text-sm text-muted-foreground">{client.client_email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{client.total_loans}</TableCell>
                  <TableCell>${client.total_amount.toLocaleString()}</TableCell>
                  <TableCell>{client.active_loans}</TableCell>
                  <TableCell>{client.avg_credit_score}/100</TableCell>
                  <TableCell>
                    <Badge className={getRiskColor(client.risk_level)}>
                      {t(client.risk_level.toLowerCase())}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}