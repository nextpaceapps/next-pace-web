"use client"

import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"

type LogoutButtonProps = {
  className?: string
}

export function LogoutButton({ className }: LogoutButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      className={className}
      onClick={() => signOut({ callbackUrl: "/login" })}
    >
      Logout
    </Button>
  )
}


