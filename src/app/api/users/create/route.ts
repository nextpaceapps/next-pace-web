import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { getDb } from "@/lib/db"

export const runtime = "nodejs"

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const subject = session.user.id
  const name = session.user.name ?? null
  const email = session.user.email ?? null
  const image = session.user.image ?? null
  try {
    const db = await getDb()
    await db.query(
      `insert into users (subject, name, email, image_url)
       values ($1,$2,$3,$4)
       on conflict (subject) do update set name=excluded.name, email=excluded.email, image_url=excluded.image_url`,
      [subject, name, email, image]
    )
    // Redirect back to Profile after successful creation
    return NextResponse.redirect(new URL("/profile", process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"))
  } catch (e) {
    console.error("[users:create:error]", e)
    const to = new URL("/profile", process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000")
    to.searchParams.set("account_error", "1")
    return NextResponse.redirect(to)
  }
}


