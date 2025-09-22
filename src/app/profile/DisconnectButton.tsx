"use client"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Props = {
  className?: string
}

export function DisconnectButton({ className }: Props) {
  return (
    <form action="/api/garmin/disconnect" method="post">
      <button
        type="submit"
        className={cn(buttonVariants({ variant: "outline", size: "sm" }), className)}
        onClick={(e) => {
          if (!confirm("Disconnect Garmin? You can reconnect anytime.")) {
            e.preventDefault()
          }
        }}
      >
        Disconnect
      </button>
    </form>
  )
}


