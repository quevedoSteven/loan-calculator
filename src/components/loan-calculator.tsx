"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { toast } from "sonner"
import { calculateMonthlyPayment } from "@/lib/loan-utils"

interface LoanCalculatorProps {
  onLoanChange?: (data: { amount: number; rate: number; years: number }) => void
}

export function LoanCalculator({ onLoanChange }: LoanCalculatorProps) {
  const [amount, setAmount] = useState<number>(10000)
  const [rate, setRate] = useState<number>(5)
  const [years, setYears] = useState<number>(5)
  const [payment, setPayment] = useState<number>(0)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [applicantName, setApplicantName] = useState("")
  const [applicantEmail, setApplicantEmail] = useState("")

  useEffect(() => {
    const monthlyPayment = calculateMonthlyPayment(amount, rate, years)
    setPayment(monthlyPayment)
    
    // Notify parent component (Profitability Dashboard) of changes
    if (onLoanChange) {
      onLoanChange({ amount, rate, years })
    }
  }, [amount, rate, years, onLoanChange])

  const totalPayment = payment * years * 12
  const totalInterest = totalPayment - amount

  const handleApply = () => {
    if (!applicantName || !applicantEmail) {
      toast.error("Please fill in all fields")
      return
    }
    
    toast.success("Application submitted!", {
      description: `We'll contact ${applicantName} at ${applicantEmail} within 24 hours.`,
    })
    
    setIsDialogOpen(false)
    setApplicantName("")
    setApplicantEmail("")
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Loan Calculator</CardTitle>
        <CardDescription>Estimate your monthly payments</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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
            <span className="text-sm text-muted-foreground">{years} Years</span>
          </div>
          <Slider
            value={[years]}
            min={1}
            max={30}
            step={1}
            onValueChange={(v: number[]) => setYears(v[0])}
          />
        </div>

        <div className="pt-4 border-t space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-lg font-bold">Monthly Payment</Label>
            <span className="text-2xl font-bold text-primary">
              ${payment.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Total Interest:</span>
            <span>${totalInterest.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Total Payment:</span>
            <span>${totalPayment.toFixed(2)}</span>
          </div>
        </div>
        
        <Button className="w-full" onClick={() => setIsDialogOpen(true)}>
          Apply Now
        </Button>
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Loan Application</DialogTitle>
            <DialogDescription>
              Complete your application for ${amount.toLocaleString()} at {rate}% interest.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={applicantEmail}
                onChange={(e) => setApplicantEmail(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApply}>Submit Application</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}