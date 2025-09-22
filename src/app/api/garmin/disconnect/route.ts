import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { integrationService } from "@/lib/services/integrationService.mock"

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"))
  }
  try {
    integrationService.setStatus(session.user.id, "garmin", "not_connected")
    return NextResponse.redirect(new URL("/profile", process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"))
  } catch {
    const to = new URL("/profile", process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000")
    to.searchParams.set("connect_error", "garmin")
    return NextResponse.redirect(to)
  }
}


