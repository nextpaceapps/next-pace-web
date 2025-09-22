export type TokenResponse = {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token?: string
  scope?: string
  jti?: string
  refresh_token_expires_in?: number
}

export type GarminUser = {
  userId: string
}

export type GarminPermissions = string[]


