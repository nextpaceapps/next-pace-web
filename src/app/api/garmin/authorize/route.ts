import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { garminAuthService } from "@/lib/services/garmin/service"
import { generateCodeChallengeS256, generateCodeVerifier } from "@/lib/services/garmin/pkce"
import { pkceSessionStore } from "@/lib/services/garmin/session.store.mock"
import { getGarminConfig } from "@/lib/services/garmin/config"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"))
  }

  const { clientId, redirectUri } = getGarminConfig()
  const state = `${session.user.id}.${Date.now()}.${Math.random().toString(36).slice(2)}`
  const codeVerifier = generateCodeVerifier()
  const codeChallenge = generateCodeChallengeS256(codeVerifier)

  pkceSessionStore.create(state, codeVerifier)

  const url = garminAuthService.createAuthorizationUrl({ clientId, redirectUri, state, codeChallenge })
  const res = NextResponse.redirect(url)
  // Persist PKCE to survive dev reloads / multi-instance
  res.cookies.set("garmin_pkce", JSON.stringify({ state, codeVerifier }), {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 10 * 60, // 10 minutes
  })
  return res
}


