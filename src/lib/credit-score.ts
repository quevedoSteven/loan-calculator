interface PaymentHistory {
  totalPayments: number
  onTimePayments: number
  latePayments: number
  missedPayments: number
  totalAmount: number
  paidAmount: number
}

export function calculateCreditScore(history: PaymentHistory): number {
  let score = 50 // Base score

  // Payment history (40% weight)
  if (history.totalPayments > 0) {
    const onTimeRate = history.onTimePayments / history.totalPayments
    score += Math.round(onTimeRate * 40)
  }

  // Payment completion (30% weight)
  if (history.totalAmount > 0) {
    const completionRate = history.paidAmount / history.totalAmount
    score += Math.round(completionRate * 30)
  }

  // Late payment penalty (20% weight)
  if (history.totalPayments > 0) {
    const lateRate = history.latePayments / history.totalPayments
    score -= Math.round(lateRate * 20)
  }

  // Missed payment penalty (10% weight)
  if (history.totalPayments > 0) {
    const missedRate = history.missedPayments / history.totalPayments
    score -= Math.round(missedRate * 10)
  }

  // Clamp between 0-100
  return Math.max(0, Math.min(100, score))
}

export function getRiskLevel(score: number): "Low" | "Medium" | "High" {
  if (score >= 80) return "Low"
  if (score >= 60) return "Medium"
  return "High"
}