export interface Loan {
    id: string
    user_id: string
    client_name: string
    client_email: string
    amount: number
    interest_rate: number
    duration_years: number
    monthly_payment: number
    total_payment: number
    total_interest: number
    credit_score: number
    status: 'pending' | 'approved' | 'active' | 'paid' | 'defaulted'
    created_at: string
}

export interface Profile {
    id: string
    email: string
    role: string
    created_at: string
}