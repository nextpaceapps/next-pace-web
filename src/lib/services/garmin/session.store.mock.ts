export type PkceSession = {
  state: string
  codeVerifier: string
  createdAt: number
}

const stateToSession: Map<string, PkceSession> = new Map()

export const pkceSessionStore = {
  create(state: string, codeVerifier: string): PkceSession {
    const s: PkceSession = { state, codeVerifier, createdAt: Date.now() }
    stateToSession.set(state, s)
    return s
  },
  get(state: string): PkceSession | undefined {
    return stateToSession.get(state)
  },
  consume(state: string): PkceSession | undefined {
    const s = stateToSession.get(state)
    if (s) stateToSession.delete(state)
    return s
  },
}


