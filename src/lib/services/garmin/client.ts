import { httpJson, httpRequest } from "@/lib/http/fetch"
import type { TokenResponse, GarminUser, GarminPermissions } from "./types"

export const GARMIN_AUTHORIZE_URL = "https://connect.garmin.com/oauth2Confirm"
export const GARMIN_TOKEN_URL = "https://diauth.garmin.com/di-oauth2-service/oauth/token"
export const GARMIN_USER_ID_URL = "https://apis.garmin.com/wellness-api/rest/user/id"
export const GARMIN_PERMISSIONS_URL = "https://apis.garmin.com/wellness-api/rest/user/permissions"

export function buildAuthorizeUrl(params: {
  clientId: string
  redirectUri?: string
  state: string
  codeChallenge: string
}): URL {
  const url = new URL(GARMIN_AUTHORIZE_URL)
  url.searchParams.set("client_id", params.clientId)
  url.searchParams.set("response_type", "code")
  url.searchParams.set("state", params.state)
  if (params.redirectUri) url.searchParams.set("redirect_uri", params.redirectUri)
  url.searchParams.set("code_challenge", params.codeChallenge)
  url.searchParams.set("code_challenge_method", "S256")
  return url
}

export async function exchangeToken(params: {
  code: string
  clientId: string
  clientSecret: string
  codeVerifier: string
  redirectUri?: string
}): Promise<TokenResponse> {
  const body = new URLSearchParams()
  body.set("grant_type", "authorization_code")
  if (params.redirectUri) body.set("redirect_uri", params.redirectUri)
  body.set("code", params.code)
  body.set("code_verifier", params.codeVerifier)
  body.set("client_id", params.clientId)
  body.set("client_secret", params.clientSecret)

  return await httpJson<TokenResponse>(GARMIN_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  })
}

export async function fetchUserId(accessToken: string): Promise<GarminUser> {
  return await httpJson<GarminUser>(GARMIN_USER_ID_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
}

export async function fetchPermissions(accessToken: string): Promise<GarminPermissions> {
  const res = await httpRequest(GARMIN_PERMISSIONS_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`HTTP ${res.status}: ${text}`)
  }
  const data = (await res.json()) as unknown
  // API returns an array of strings per docs
  return (Array.isArray(data) ? data : []) as string[]
}


