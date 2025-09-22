import type { TokenResponse, GarminUser, GarminPermissions } from "./types"
import { buildAuthorizeUrl, exchangeToken as clientExchangeToken, fetchPermissions, fetchUserId } from "./client"

export interface GarminAuthService {
  createAuthorizationUrl(params: { redirectUri: string; clientId: string; state: string; codeChallenge: string }): URL
  exchangeToken(params: { code: string; redirectUri: string; clientId: string; clientSecret: string; codeVerifier: string }): Promise<TokenResponse>
  getUserId(accessToken: string): Promise<GarminUser>
  getPermissions(accessToken: string): Promise<GarminPermissions>
}

export const garminAuthService: GarminAuthService = {
  createAuthorizationUrl({ redirectUri, clientId, state, codeChallenge }) {
    return buildAuthorizeUrl({ clientId, redirectUri, state, codeChallenge })
  },
  exchangeToken({ code, redirectUri, clientId, clientSecret, codeVerifier }) {
    return clientExchangeToken({ code, clientId, clientSecret, codeVerifier, redirectUri })
  },
  getUserId(accessToken: string) {
    return fetchUserId(accessToken)
  },
  getPermissions(accessToken: string) {
    return fetchPermissions(accessToken)
  },
}


