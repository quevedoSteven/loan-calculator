"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

export function EmailNotifications() {
  const [loading, setLoading] = useState(false)
  const t = useTranslations("Email")

  const sendOverdueNotices = async () => {
    setLoading(true)

    const { data: overduePayments, error } = await supabase
      .from("payments")
      .select("*, loans(client_email, client_name)")
      .eq("status", "pending")
      .lt("due_date", new Date().toISOString())

    if (error) {
      toast.error("Failed to fetch overdue payments")
      setLoading(false)
      return
    }

    if (!overduePayments || overduePayments.length === 0) {
      toast.info("No overdue payments to notify")
      setLoading(false)
      return
    }

    let sentCount = 0

    for (const payment of overduePayments) {
      const loan = payment.loans as any
      const daysOverdue = Math.floor(
        (new Date().getTime() - new Date(payment.due_date).getTime()) / (1000 * 60 * 60 * 24)
      )

      try {
        const response = await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: loan.client_email,
            subject: `Payment Overdue - Loan Notice`,
            html: `
              <h2>Payment Overdue Notice</h2>
              <p>Dear ${loan.client_name},</p>
              <p>This is a reminder that your payment of <strong>$${payment.amount}</strong> is overdue.</p>
              <p><strong>Days Overdue:</strong> ${daysOverdue}</p>
              <p><strong>Original Due Date:</strong> ${new Date(payment.due_date).toLocaleDateString()}</p>
              <p>Please make your payment as soon as possible to avoid additional fees.</p>
              <p>Thank you for your prompt attention to this matter.</p>
            `,
          }),
        })

        if (response.ok) {
          sentCount++
        }
      } catch (error) {
        console.error("Failed to send email:", error)
      }
    }

    toast.success(`Sent ${sentCount} overdue notices`)
    setLoading(false)
  }

  const sendUpcomingReminders = async () => {
    setLoading(true)

    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)

    const { data: upcomingPayments, error } = await supabase
      .from("payments")
      .select("*, loans(client_email, client_name)")
      .eq("status", "pending")
      .gte("due_date", new Date().toISOString())
      .lte("due_date", nextWeek.toISOString())

    if (error) {
      toast.error("Failed to fetch upcoming payments")
      setLoading(false)
      return
    }

    if (!upcomingPayments || upcomingPayments.length === 0) {
      toast.info("No upcoming payments to notify")
      setLoading(false)
      return
    }

    let sentCount = 0

    for (const payment of upcomingPayments) {
      const loan = payment.loans as any

      try {
        const response = await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: loan.client_email,
            subject: `Payment Reminder - Due Soon`,
            html: `
              <h2>Payment Reminder</h2>
              <p>Dear ${loan.client_name},</p>
              <p>This is a friendly reminder that your payment of <strong>$${payment.amount}</strong> is due soon.</p>
              <p><strong>Due Date:</strong> ${new Date(payment.due_date).toLocaleDateString()}</p>
              <p>Please ensure your payment is made on time.</p>
              <p>Thank you!</p>
            `,
          }),
        })

        if (response.ok) {
          sentCount++
        }
      } catch (error) {
        console.error("Failed to send email:", error)
      }
    }

    toast.success(`Sent ${sentCount} payment reminders`)
    setLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <Button onClick={sendOverdueNotices} disabled={loading}>
            {loading ? t("sending") : t("sendOverdue")}
          </Button>
          <Button onClick={sendUpcomingReminders} disabled={loading} variant="outline">
            {loading ? t("sending") : t("sendReminders")}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          {t("note")}
        </p>
      </CardContent>
    </Card>
  )
}