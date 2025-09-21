import Image from "next/image"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { redirect } from "next/navigation"
import { LogoutButton } from "@/components/header/LogoutButton"
import ConnectSection from "./ConnectSection"
import { headers } from "next/headers"

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/login")
  }
  const user = session.user
  const h = headers()
  const url = new URL(h.get("x-url") ?? "http://localhost:3000/profile")
  const connectError = url.searchParams.get("connect_error")
  return (
    <main className="mx-auto max-w-2xl p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Your Profile</h1>
        <p className="mt-2 text-sm text-gray-500">You are signed in with Google.</p>
      </header>
      {connectError === "garmin" ? (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          Garmin connection was not completed. Please try again.
        </div>
      ) : null}
      <section className="rounded-lg border p-4 grid gap-3">
        {user?.image ? (
          <Image src={user.image} alt={user.name ?? "User avatar"} width={64} height={64} className="rounded-full" />
        ) : null}
        <p className="text-sm">Name: {user?.name ?? "-"}</p>
        <p className="text-sm">Email: {user?.email ?? "-"}</p>
        <div className="mt-4">
          <LogoutButton />
        </div>
      </section>

      {/* Connect section */}
      <div className="mt-6">
        {/* Server component renders status and CTA */}
        {/* @ts-expect-error Async Server Component */}
        <ConnectSection />
      </div>
    </main>
  )
}
