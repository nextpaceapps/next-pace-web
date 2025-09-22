import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { pkceSessionStore } from "@/lib/services/garmin/session.store.mock"
import { garminAuthService } from "@/lib/services/garmin/service"
import { getGarminConfig } from "@/lib/services/garmin/config"
import { integrationService } from "@/lib/services/integrationService.mock"

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"))
  }
  const { searchParams } = new URL(request.url)
  const state = searchParams.get("state") ?? ""
  const code = searchParams.get("code") ?? ""

  const stored = pkceSessionStore.consume(state)
  if (!stored) {
    const to = new URL("/profile", process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000")
    to.searchParams.set("connect_error", "garmin")
    return NextResponse.redirect(to)
  }

  try {
    const { clientId, clientSecret, redirectUri } = getGarminConfig()
    const tokens = await garminAuthService.exchangeToken({
      code,
      clientId,
      clientSecret,
      codeVerifier: stored.codeVerifier,
      redirectUri,
    })

    // Optional: fetch user id/permissions to validate connection
    await garminAuthService.getUserId(tokens.access_token).catch(() => null)
    await garminAuthService.getPermissions(tokens.access_token).catch(() => null)

    integrationService.setStatus(session.user.id, "garmin", "connected")
    return NextResponse.redirect(new URL("/profile", process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"))
  } catch (e) {
    integrationService.setStatus(session.user.id, "garmin", "error")
    const to = new URL("/profile", process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000")
    to.searchParams.set("connect_error", "garmin")
    return NextResponse.redirect(to)
  }
}


