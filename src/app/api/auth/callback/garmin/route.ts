import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { pkceSessionStore } from "@/lib/services/garmin/session.store.mock"
import { garminAuthService } from "@/lib/services/garmin/service"
import { getGarminConfig } from "@/lib/services/garmin/config"
import { integrationService } from "@/lib/services/integrationService.mock"
import { integrationMapping } from "@/lib/services/integrationService.mock"
import { getDb } from "@/lib/db"

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
    const garminUser = await garminAuthService.getUserId(tokens.access_token).catch((e) => { console.error('[garmin:userId:error]', e); return null })
    await garminAuthService.getPermissions(tokens.access_token).catch((e) => { console.error('[garmin:permissions:error]', e); return null })

    if (garminUser?.userId) {
      integrationService.setStatus(subject, "garmin", "connected")
      integrationMapping.setProviderUser(subject, garminUser.userId)
      // Persist provider account association (idempotent)
      try {
        const db = await getDb()
        // ensure user id
        const userRow = await db.query('select id from users where subject=$1', [subject])
        const userId = userRow.rows?.[0]?.id
        if (userId) {
          const pa = await db.query(
            `insert into provider_accounts (provider, provider_user_id)
             values ($1,$2)
             on conflict (provider, provider_user_id) do update set provider_user_id=excluded.provider_user_id
             returning id`,
            ["garmin", garminUser.userId]
          )
          const providerAccountId = pa.rows[0].id
          await db.query(
            `insert into user_provider_accounts (user_id, provider_account_id, active)
             values ($1,$2,true)
             on conflict (user_id, provider_account_id) do update set active=true`,
            [userId, providerAccountId]
          )
        }
      } catch (e) {
        console.error("[assoc:garmin:upsert:error]", e)
      }
    } else {
      const to = new URL("/profile", process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000")
      to.searchParams.set("connect_error", "garmin_user_id")
      return NextResponse.redirect(to)
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


