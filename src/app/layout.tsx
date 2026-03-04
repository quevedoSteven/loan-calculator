import type { Metadata } from "next"
import { Toaster } from "sonner"
import { AuthProvider } from "@/contexts/auth-context"

export const metadata: Metadata = {
  title: "Loan Dashboard",
  description: "Lender management system",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <AuthProvider>
      {children}
      <Toaster />
    </AuthProvider>
  )
}