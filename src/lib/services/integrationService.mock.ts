import type { ConnectionStatus, IntegrationService, ProviderId } from "./types"

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


