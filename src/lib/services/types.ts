export type UserAccount = {
  subject: string
  name: string | null
  email: string | null
  imageUrl?: string | null
  username?: string | null
  country?: string | null
  createdAt: number
}

export interface UserService {
  createIfMissing(subject: string, defaults: { name?: string | null; email?: string | null; imageUrl?: string | null }): UserAccount
  getBySubject(subject: string): UserAccount | null
  updateMinimalFields(subject: string, patch: { username?: string | null; country?: string | null }): UserAccount
}

// Integration (mock) types
export type ProviderId = "garmin"

export type ConnectionStatus = "not_connected" | "connecting" | "connected" | "error"

export interface IntegrationService {
  getStatus(subject: string, provider: ProviderId): ConnectionStatus
  setStatus(subject: string, provider: ProviderId, status: ConnectionStatus): void
}
