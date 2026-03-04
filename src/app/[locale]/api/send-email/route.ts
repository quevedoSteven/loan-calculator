import { Resend } from "resend"
import { NextResponse } from "next/server"

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

export async function POST(request: Request) {
  if (!resend) {
    console.warn("Resend API key not configured. Email not sent.")
    return NextResponse.json(
      { message: "Email service not configured. Add RESEND_API_KEY to .env.local" },
      { status: 503 }
    )
  }

  try {
    const { to, subject, html } = await request.json()

    const { data, error } = await resend.emails.send({
      from: "Loan Dashboard <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    })

    if (error) {
      return NextResponse.json({ error }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 })
  }
}