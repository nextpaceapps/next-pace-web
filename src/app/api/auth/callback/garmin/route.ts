import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { pkceSessionStore } from "@/lib/services/garmin/session.store.mock"
import { garminAuthService } from "@/lib/services/garmin/service"
import { getGarminConfig } from "@/lib/services/garmin/config"
import { integrationService } from "@/lib/services/integrationService.mock"
import { integrationMapping } from "@/lib/services/integrationService.mock"

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  const { searchParams } = new URL(request.url)

  const state = searchParams.get("state") ?? ""
  const code = searchParams.get("code") ?? ""

  // Legacy mock support
  const mockSuccess = searchParams.get("success")
  if (!state && !code && mockSuccess !== null) {
    const subject = session?.user?.id
    if (!subject) {
      return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"))
    }
    integrationService.setStatus(subject, "garmin", mockSuccess === "true" ? "connected" : "error")
    const to = new URL("/profile", process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000")
    if (mockSuccess !== "true") to.searchParams.set("connect_error", "garmin")
    return NextResponse.redirect(to)
  }

  let stored = pkceSessionStore.consume(state)
  if (!stored) {
    const cookieHeader = (request.headers as any).get("cookie") as string | null
    const match = cookieHeader?.match(/garmin_pkce=([^;]+)/)
    if (match) {
      try {
        const decoded = decodeURIComponent(match[1])
        const parsed = JSON.parse(decoded) as { state: string; codeVerifier: string }
        if (parsed.state === state) {
          stored = { state: parsed.state, codeVerifier: parsed.codeVerifier, createdAt: Date.now() }
        }
      } catch {}
    }
  }
  if (!stored) {
    const to = new URL("/profile", process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000")
    to.searchParams.set("connect_error", "garmin")
    return NextResponse.redirect(to)
  }

  const subjectFromState = state.split(".")[0]
  const subject = session?.user?.id ?? subjectFromState
  if (!subject) {
    return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"))
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
    const garminUser = await garminAuthService.getUserId(tokens.access_token).catch(() => null)
    await garminAuthService.getPermissions(tokens.access_token).catch(() => null)

    integrationService.setStatus(subject, "garmin", "connected")
    if (garminUser?.userId) {
      integrationMapping.setProviderUser(subject, garminUser.userId)
    }
    const res = NextResponse.redirect(new URL("/profile", process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"))
    res.cookies.set("garmin_pkce", "", { path: "/", maxAge: 0 })
    // Short-lived connected hint to bridge instance swaps
    res.cookies.set("garmin_connected", "1", { httpOnly: true, sameSite: "lax", secure: true, path: "/", maxAge: 120 })
    return res
  } catch {
    integrationService.setStatus(subject, "garmin", "error")
    const to = new URL("/profile", process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000")
    to.searchParams.set("connect_error", "garmin")
    return NextResponse.redirect(to)
  }
}


