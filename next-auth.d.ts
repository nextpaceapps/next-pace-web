import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user?: {
      id?: string | null
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sub?: string
    name?: string | null
    email?: string | null
    picture?: string | null
  }
}
