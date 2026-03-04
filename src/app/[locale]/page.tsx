"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { LoginForm } from "@/components/auth/login-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/routing"

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const t = useTranslations("Home")

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">{t("loading")}</div>
  }

  if (user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold mb-4">Redirecting to Dashboard...</h1>
          <Button onClick={() => router.push("/dashboard")}>
            {t("goToDashboard")}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight lg:text-6xl mb-6">
          Manage Your Loans with Confidence
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          The complete loan management system for lenders. Track clients, monitor payments, 
          and grow your portfolio with powerful analytics.
        </p>
        <div className="flex gap-4 justify-center mb-12">
          <Link href="/demo">
            <Button size="lg" variant="default">
              🎯 Try Demo (Free)
            </Button>
          </Link>
          <Link href="#features">
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </Link>
        </div>

        {/* Login Card */}
        <div className="max-w-md mx-auto">
          <LoginForm />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-muted py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Everything You Need</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-xl font-bold mb-2">Analytics Dashboard</h3>
                <p className="text-muted-foreground">
                  Real-time insights into your portfolio performance, default rates, and revenue projections.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-4xl mb-4">👥</div>
                <h3 className="text-xl font-bold mb-2">Client Management</h3>
                <p className="text-muted-foreground">
                  Track all your borrowers with credit scores, risk levels, and payment history.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-4xl mb-4">💰</div>
                <h3 className="text-xl font-bold mb-2">Payment Tracking</h3>
                <p className="text-muted-foreground">
                  Automated payment schedules with overdue detection and email reminders.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-4xl mb-4">📁</div>
                <h3 className="text-xl font-bold mb-2">Document Storage</h3>
                <p className="text-muted-foreground">
                  Securely store loan agreements, IDs, and contracts for each client.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-4xl mb-4">📧</div>
                <h3 className="text-xl font-bold mb-2">Email Notifications</h3>
                <p className="text-muted-foreground">
                  Send automated payment reminders and overdue notices to your clients.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-4xl mb-4">🌍</div>
                <h3 className="text-xl font-bold mb-2">Multi-Language</h3>
                <p className="text-muted-foreground">
                  Available in English and Spanish to serve diverse clients.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Simple Pricing</h2>
        <p className="text-muted-foreground mb-12">Start with a free demo, then upgrade when you're ready</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="p-8">
            <CardContent>
              <h3 className="text-2xl font-bold mb-2">Demo</h3>
              <p className="text-4xl font-extrabold mb-4">Free</p>
              <ul className="text-left space-y-2 mb-6 text-muted-foreground">
                <li>✅ View sample loans</li>
                <li>✅ Explore analytics</li>
                <li>✅ See client tracking</li>
                <li>❌ Create real loans</li>
                <li>❌ Payment tracking</li>
                <li>❌ Email notifications</li>
              </ul>
              <Link href="/demo">
                <Button className="w-full" variant="outline">Try Demo</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="p-8 border-primary">
            <CardContent>
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <p className="text-4xl font-extrabold mb-4">$29<span className="text-lg font-normal">/month</span></p>
              <ul className="text-left space-y-2 mb-6 text-muted-foreground">
                <li>✅ Everything in Demo</li>
                <li>✅ Unlimited loans</li>
                <li>✅ Full payment tracking</li>
                <li>✅ Email notifications</li>
                <li>✅ Document storage</li>
                <li>✅ Priority support</li>
              </ul>
              <Button className="w-full">Coming Soon</Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-8 text-center text-muted-foreground">
        <p>&copy; 2025 Loan Management System. All rights reserved.</p>
      </footer>
    </main>
  )
}