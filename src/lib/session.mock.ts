/*
  Mocked session utility for demo purposes only.
  No persistence beyond runtime; suitable for client-side mocked flows.
*/

export type MockSession = {
  userId: string;
  displayName: string;
  email: string;
};

let currentSession: MockSession | null = null;

/**
 * Returns the current mocked session or null if unauthenticated.
 */
export function getSession(): MockSession | null {
  return currentSession;
}

/**
 * Sets the current mocked session.
 */
export function setSession(session: MockSession): void {
  if (!session || !session.userId) return;
  currentSession = session;
}

/**
 * Clears the current mocked session.
 */
export function clearSession(): void {
  currentSession = null;
}
