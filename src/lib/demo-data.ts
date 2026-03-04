import { Loan } from "@/types"

// Fake user for demo mode
export const demoUser = {
  id: "demo-user-id",
  email: "demo@example.com",
}

// Fake loans for demo mode
export const demoLoans: Loan[] = [
  {
    id: "demo-loan-1",
    user_id: demoUser.id,
    client_name: "John Smith",
    client_email: "john@example.com",
    amount: 25000,
    interest_rate: 5.5,
    duration_years: 5,
    monthly_payment: 477.52,
    total_payment: 28651.20,
    total_interest: 3651.20,
    credit_score: 85,
    status: "active",
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-loan-2",
    user_id: demoUser.id,
    client_name: "Sarah Johnson",
    client_email: "sarah@example.com",
    amount: 15000,
    interest_rate: 6.0,
    duration_years: 3,
    monthly_payment: 456.33,
    total_payment: 16427.88,
    total_interest: 1427.88,
    credit_score: 72,
    status: "pending",
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-loan-3",
    user_id: demoUser.id,
    client_name: "Michael Brown",
    client_email: "michael@example.com",
    amount: 50000,
    interest_rate: 4.5,
    duration_years: 10,
    monthly_payment: 518.19,
    total_payment: 62182.80,
    total_interest: 12182.80,
    credit_score: 90,
    status: "active",
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-loan-4",
    user_id: demoUser.id,
    client_name: "Emily Davis",
    client_email: "emily@example.com",
    amount: 10000,
    interest_rate: 7.0,
    duration_years: 2,
    monthly_payment: 447.74,
    total_payment: 10745.76,
    total_interest: 745.76,
    credit_score: 68,
    status: "paid",
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-loan-5",
    user_id: demoUser.id,
    client_name: "Robert Wilson",
    client_email: "robert@example.com",
    amount: 35000,
    interest_rate: 5.0,
    duration_years: 7,
    monthly_payment: 493.29,
    total_payment: 41436.36,
    total_interest: 6436.36,
    credit_score: 78,
    status: "active",
    created_at: new Date().toISOString(),
  },
]

// Fake clients for demo mode
export const demoClients = [
  {
    client_name: "John Smith",
    client_email: "john@example.com",
    total_loans: 1,
    total_amount: 25000,
    avg_credit_score: 85,
    active_loans: 1,
    risk_level: "Low" as const,
  },
  {
    client_name: "Sarah Johnson",
    client_email: "sarah@example.com",
    total_loans: 1,
    total_amount: 15000,
    avg_credit_score: 72,
    active_loans: 0,
    risk_level: "Medium" as const,
  },
  {
    client_name: "Michael Brown",
    client_email: "michael@example.com",
    total_loans: 1,
    total_amount: 50000,
    avg_credit_score: 90,
    active_loans: 1,
    risk_level: "Low" as const,
  },
  {
    client_name: "Emily Davis",
    client_email: "emily@example.com",
    total_loans: 1,
    total_amount: 10000,
    avg_credit_score: 68,
    active_loans: 0,
    risk_level: "Medium" as const,
  },
  {
    client_name: "Robert Wilson",
    client_email: "robert@example.com",
    total_loans: 1,
    total_amount: 35000,
    avg_credit_score: 78,
    active_loans: 1,
    risk_level: "Low" as const,
  },
]

// Fake analytics for demo mode
export const demoAnalytics = {
  totalLoans: 5,
  totalPortfolioValue: 135000,
  totalActiveLoans: 3,
  totalPendingLoans: 1,
  totalPaidLoans: 1,
  averageLoanAmount: 27000,
  totalInterestEarned: 24443.00,
  defaultRate: 0,
  loansByStatus: [
    { name: "Active", value: 3 },
    { name: "Pending", value: 1 },
    { name: "Paid", value: 1 },
  ],
  monthlyRevenue: [
    { month: "Jan", revenue: 2400 },
    { month: "Feb", revenue: 2400 },
    { month: "Mar", revenue: 2400 },
    { month: "Apr", revenue: 2400 },
  ],
}

// Check if demo mode is enabled
export function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === "true"
}

// Get demo mode expiry (24 hours from first visit)
export function getDemoExpiry(): Date | null {
  if (typeof window === "undefined") return null
  const expiry = localStorage.getItem("demoExpiry")
  if (!expiry) {
    const newExpiry = new Date()
    newExpiry.setHours(newExpiry.getHours() + 24)
    localStorage.setItem("demoExpiry", newExpiry.toISOString())
    return newExpiry
  }
  return new Date(expiry)
}

// Check if demo has expired
export function isDemoExpired(): boolean {
  const expiry = getDemoExpiry()
  if (!expiry) return false
  return new Date() > expiry
}

// Clear demo mode
export function clearDemoMode(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("demoExpiry")
    localStorage.removeItem("demoMode")
  }
}