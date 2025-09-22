"use client"

import { Button } from "@/components/ui/button"
import { signIn } from "next-auth/react"
import { useSession } from "next-auth/react"
import Image from "next/image"

export default function LoginPage() {
  const { data: session } = useSession()
  if (session?.user) {
    return (
      <main className="flex min-h-[50vh] items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">You are signed in</h1>
          {session.user.image ? (
            <div className="mt-4 flex justify-center"><Image src={session.user.image} alt="Avatar" width={64} height={64} className="rounded-full" /></div>
          ) : null}
          <p className="mt-2 text-sm text-gray-500">Go to your profile.</p>
          <div className="mt-6">
            <Button asChild><a href="/profile">Open Profile</a></Button>
          </div>
        </div>
      </main>
    )
  }
  return (
    <main className="flex min-h-[50vh] items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Login</h1>
        <p className="mt-2 text-sm text-gray-500">Continue with your Google account.</p>
        <div className="mt-6">
          <Button type="button" onClick={() => signIn("google", { callbackUrl: "/profile" })}>Continue with Google</Button>
        </div>
      </div>
    </main>
  )
}


