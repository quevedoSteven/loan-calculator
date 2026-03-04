"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { calculateMonthlyPayment } from "@/lib/loan-utils"
import { useTranslations } from "next-intl"
import { DocumentUpload } from "@/components/documents/document-upload"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function CreateLoanForm({ onLoanCreated }: { onLoanCreated?: () => void }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [createdLoanId, setCreatedLoanId] = useState<string | null>(null)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const t = useTranslations("CreateLoan")
  const tStatus = useTranslations("LoanStatus")
  const tCommon = useTranslations("Common")
  
  const [clientName, setClientName] = useState("")
  const [clientEmail, setClientEmail] = useState("")
  const [amount, setAmount] = useState<number>(10000)
  const [rate, setRate] = useState<number>(5)
  const [years, setYears] = useState<number>(5)
  const [status, setStatus] = useState<string>("pending")

  const payment = calculateMonthlyPayment(amount, rate, years)
  const totalPayment = payment * years * 12
  const totalInterest = totalPayment - amount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast.error("You must be logged in")
      return
    }

    setLoading(true)

    const { data: loanData, error: loanError } = await supabase
      .from("loans")
      .insert({
        user_id: user.id,
        client_name: clientName,
        client_email: clientEmail,
        amount,
        interest_rate: rate,
        duration_years: years,
        monthly_payment: payment,
        total_payment: totalPayment,
        total_interest: totalInterest,
        credit_score: Math.floor(Math.random() * 40) + 60,
        status,
      })
      .select()
      .single()

    if (loanError) {
      toast.error("Failed to create loan: " + loanError.message)
      setLoading(false)
      return
    }

    const totalMonths = years * 12
    const { error: scheduleError } = await supabase.rpc("create_payment_schedule", {
      p_loan_id: loanData.id,
      p_monthly_payment: payment,
      p_duration_months: totalMonths,
    })

    if (scheduleError) {
      console.error("Failed to create payment schedule:", scheduleError)
      toast.warning("Loan created but payment schedule failed")
    } else {
      toast.success("Loan and payment schedule created!")
      setCreatedLoanId(loanData.id)
      setShowUploadDialog(true)
    }

    setClientName("")
    setClientEmail("")
    setAmount(10000)
    setRate(5)
    setYears(5)
    setStatus("pending")
    onLoanCreated?.()

    setLoading(false)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">{t("clientName")}</Label>
                <Input
                  id="clientName"
                  placeholder={t("clientNamePlaceholder")}
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientEmail">{t("clientEmail")}</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  placeholder={t("clientEmailPlaceholder")}
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Loan Amount</Label>
                <span className="text-sm text-muted-foreground">${amount.toLocaleString()}</span>
              </div>
              <Slider
                value={[amount]}
                min={1000}
                max={100000}
                step={1000}
                onValueChange={(v: number[]) => setAmount(v[0])}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Interest Rate</Label>
                <span className="text-sm text-muted-foreground">{rate}%</span>
              </div>
              <Slider
                value={[rate]}
                min={0.1}
                max={20}
                step={0.1}
                onValueChange={(v: number[]) => setRate(v[0])}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Duration</Label>
                <span className="text-sm text-muted-foreground">{years} {tCommon("years")}</span>
              </div>
              <Slider
                value={[years]}
                min={1}
                max={30}
                step={1}
                onValueChange={(v: number[]) => setYears(v[0])}
              />
            </div>

            <div className="space-y-2">
              <Label>{t("status")}</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">{tStatus("pending")}</SelectItem>
                  <SelectItem value="approved">{tStatus("approved")}</SelectItem>
                  <SelectItem value="active">{tStatus("active")}</SelectItem>
                  <SelectItem value="paid">{tStatus("paid")}</SelectItem>
                  <SelectItem value="defaulted">{tStatus("defaulted")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4 border-t space-y-2">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Monthly Payment</p>
                  <p className="font-bold">${payment.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Interest</p>
                  <p className="font-bold">${totalInterest.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Payment</p>
                  <p className="font-bold">${totalPayment.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t("creating") : t("createLoan")}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Loan Documents</DialogTitle>
          </DialogHeader>
          {createdLoanId && (
            <DocumentUpload
              loanId={createdLoanId}
              onUploadComplete={() => {
                setShowUploadDialog(false)
                setCreatedLoanId(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}