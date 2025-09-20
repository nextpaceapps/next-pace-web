import Image from "next/image"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/login")
  }
  const user = session.user
  return (
    <main className="mx-auto max-w-2xl p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Your Profile</h1>
        <p className="mt-2 text-sm text-gray-500">You are signed in with Google.</p>
      </header>
      <section className="rounded-lg border p-4 grid gap-3">
        {user?.image ? (
          <Image src={user.image} alt={user.name ?? "User avatar"} width={64} height={64} className="rounded-full" />
        ) : null}
        <p className="text-sm">Name: {user?.name ?? "-"}</p>
        <p className="text-sm">Email: {user?.email ?? "-"}</p>
        <form action={async () => { "use server"; }} className="mt-4">
          <Button type="button" variant="outline" onClick={() => signOut({ callbackUrl: "/login" })}>Logout</Button>
        </form>
      </section>
    </main>
  )
}
