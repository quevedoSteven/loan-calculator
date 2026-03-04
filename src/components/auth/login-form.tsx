"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSignUp, setIsSignUp] = useState(false)
  const { signIn, signUp } = useAuth()
  const t = useTranslations("Login")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const { error } = isSignUp 
      ? await signUp(email, password)
      : await signIn(email, password)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success(isSignUp ? "Account created!" : "Welcome back!")
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{isSignUp ? t("createAccount") : t("signIn")}</CardTitle>
        <CardDescription>
          {isSignUp ? t("registerLender") : t("accessDashboard")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t("email")}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t("emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t("password")}</Label>
            <Input
              id="password"
              type="password"
              placeholder={t("passwordPlaceholder")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full">
            {isSignUp ? t("signUp") : t("signIn")}
          </Button>
        </form>
        <Button
          variant="link"
          className="w-full mt-4"
          onClick={() => setIsSignUp(!isSignUp)}
        >
          {isSignUp ? t("alreadyHaveAccount") : t("needAccount")}
        </Button>
      </CardContent>
    </Card>
  )
}