import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { integrationService } from "@/lib/services/integrationService.mock"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"))
  }

  const subject = session.user.id
  integrationService.setStatus(subject, "garmin", "connecting")

  // For mock flow, just redirect to callback with success=true
  const callback = process.env.GARMIN_REDIRECT_URI ?? "/api/auth/callback/garmin"
  const url = new URL(callback)
  url.searchParams.set("mock", "1")
  url.searchParams.set("success", "true")

  return NextResponse.redirect(url)
}


