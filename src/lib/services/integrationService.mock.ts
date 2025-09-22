import type { ConnectionStatus, IntegrationService, ProviderId } from "./types"

// Map external provider userId (e.g., Garmin API userId) to internal subject
const providerUserIdToSubject: Map<string, string> = new Map()

const subjectToProviderStatus: Map<string, Map<ProviderId, ConnectionStatus>> = new Map()

function ensureSubjectMap(subject: string): Map<ProviderId, ConnectionStatus> {
  let map = subjectToProviderStatus.get(subject)
  if (!map) {
    map = new Map()
    subjectToProviderStatus.set(subject, map)
  }
  return map
}

export const integrationService: IntegrationService = {
  getStatus(subject, provider) {
    const map = subjectToProviderStatus.get(subject)
    return map?.get(provider) ?? "not_connected"
  },
  setStatus(subject, provider, status) {
    const map = ensureSubjectMap(subject)
    map.set(provider, status)
  },
}

export const integrationMapping = {
  setProviderUser(subject: string, providerUserId: string) {
    providerUserIdToSubject.set(providerUserId, subject)
  },
  getSubjectByProviderUser(providerUserId: string): string | undefined {
    return providerUserIdToSubject.get(providerUserId)
  },
  clearByProviderUser(providerUserId: string) {
    const subject = providerUserIdToSubject.get(providerUserId)
    if (subject) {
      const map = subjectToProviderStatus.get(subject)
      map?.set("garmin" as ProviderId, "not_connected")
      providerUserIdToSubject.delete(providerUserId)
    }
  },
}


