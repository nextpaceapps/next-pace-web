import { createHash, randomBytes } from "crypto"

function base64UrlEncode(buffer: Buffer): string {
  return buffer.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

export function generateCodeVerifier(length: number = 64): string {
  if (length < 43 || length > 128) {
    throw new Error("code_verifier length must be between 43 and 128 characters")
  }
  const bytes = randomBytes(length)
  return base64UrlEncode(bytes).slice(0, length)
}

export function generateCodeChallengeS256(codeVerifier: string): string {
  const hash = createHash("sha256").update(codeVerifier).digest()
  return base64UrlEncode(hash)
}


