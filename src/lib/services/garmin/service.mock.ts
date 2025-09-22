import type { GarminAuthService } from "./service"
import type { TokenResponse, GarminUser, GarminPermissions } from "./types"

export const garminAuthServiceMock: GarminAuthService = {
  createAuthorizationUrl({ clientId, redirectUri, state, codeChallenge }): URL {
    const url = new URL(redirectUri)
    url.searchParams.set("mock", "1")
    url.searchParams.set("success", "true")
    url.searchParams.set("state", state)
    return url
  },
  async exchangeToken(): Promise<TokenResponse> {
    return {
      access_token: "mock_access",
      token_type: "bearer",
      expires_in: 3600,
      refresh_token: "mock_refresh",
      scope: "CONNECT_READ",
    }
  },
  async getUserId(): Promise<GarminUser> {
    return { userId: "mock-user-id" }
  },
  async getPermissions(): Promise<GarminPermissions> {
    return ["CONNECT_READ"]
  },
}


