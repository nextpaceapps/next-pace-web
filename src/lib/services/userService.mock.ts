import type { UserAccount, UserService } from "./types"

const subjectToUser: Map<string, UserAccount> = new Map()

function now(): number {
  return Date.now()
}

export const userService: UserService = {
  createIfMissing(subject, defaults) {
    const existing = subjectToUser.get(subject)
    if (existing) return existing
    const created: UserAccount = {
      subject,
      name: defaults.name ?? null,
      email: defaults.email ?? null,
      imageUrl: defaults.imageUrl ?? null,
      username: null,
      country: null,
      createdAt: now(),
    }
    subjectToUser.set(subject, created)
    return created
  },
  getBySubject(subject) {
    return subjectToUser.get(subject) ?? null
  },
  updateMinimalFields(subject, patch) {
    const current = subjectToUser.get(subject)
    if (!current) {
      const created = this.createIfMissing(subject, {})
      subjectToUser.set(subject, created)
    }
    const updated = {
      ...subjectToUser.get(subject)!,
      username: patch.username ?? subjectToUser.get(subject)!.username ?? null,
      country: patch.country ?? subjectToUser.get(subject)!.country ?? null,
    }
    subjectToUser.set(subject, updated)
    return updated
  },
}
