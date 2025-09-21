import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { integrationService } from "@/lib/services/integrationService.mock"

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  const { searchParams } = new URL(request.url)

  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"))
  }

  const subject = session.user.id
  const success = searchParams.get("success") === "true"

  integrationService.setStatus(subject, "garmin", success ? "connected" : "error")

  const redirectTo = new URL("/profile", process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000")
  if (!success) {
    redirectTo.searchParams.set("connect_error", "garmin")
  }
  return NextResponse.redirect(redirectTo)
}


