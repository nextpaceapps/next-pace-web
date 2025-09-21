"use client"

import { Button } from "@/components/ui/button"
import { signIn } from "next-auth/react"

export default function LoginPage() {
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


