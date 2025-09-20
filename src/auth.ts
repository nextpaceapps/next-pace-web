import type { NextAuthOptions } from "next-auth"
import Google from "next-auth/providers/google"

export const authOptions: NextAuthOptions = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  secret: process.env.AUTH_SECRET,
  debug: process.env.NODE_ENV !== "production",
  logger: {
    error: (...args) => console.error("[auth:error]", ...args),
    warn: (...args) => console.warn("[auth:warn]", ...args),
    debug: (...args) => console.log("[auth:debug]", ...args),
  },
  callbacks: {
    async signIn({ account }) {
      console.log("[auth:callback:signIn] provider=", account?.provider)
      return true
    },
    async jwt({ token, account, user }) {
      console.log("[auth:callback:jwt] hasAccount=", !!account, "hasUser=", !!user)
      return token
    },
    async session({ session }) {
      console.log("[auth:callback:session] userEmail=", session.user?.email)
      return session
    },
    async redirect({ url, baseUrl }) {
      // Allow same-origin paths
      if (url.startsWith("/")) {
        const to = `${baseUrl}${url}`
        console.log("[auth:callback:redirect] same-origin path to=", to)
        return to
      }
      // Allow same-origin absolute URLs
      const u = new URL(url)
      if (u.origin === baseUrl) {
        console.log("[auth:callback:redirect] same-origin abs to=", url)
        return url
      }
      // Allow Google OAuth host during the auth handshake
      if (u.origin === "https://accounts.google.com") {
        console.log("[auth:callback:redirect] provider to=", url)
        return url
      }
      console.log("[auth:callback:redirect] fallback baseUrl to=", baseUrl)
      return baseUrl
    },
  },
  events: {
    signIn(message) {
      console.log("[auth:event:signIn]", { userEmail: message.user?.email, provider: message.account?.provider })
    },
    signOut(message) {
      console.log("[auth:event:signOut]", { sessionTokenPresent: !!message.sessionToken })
    },
    session(message) {
      console.log("[auth:event:session]", { userEmail: message.session?.user?.email })
    },
    error(error) {
      console.error("[auth:event:error]", error)
    },
  },
}
