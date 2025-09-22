import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { integrationService } from "@/lib/services/integrationService.mock"
import { Card } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { cookies } from "next/headers"
import { DisconnectButton } from "./DisconnectButton"
import { cn } from "@/lib/utils"

export default async function ConnectSection() {
  const session = await getServerSession(authOptions)
  const subject = session?.user?.id ?? ""
  // Hint: if cookie present assume connected for UX while backing store catches up
  const c = await cookies()
  const connectedHint = c.get("garmin_connected")?.value === "1"

  const garminStatus = connectedHint ? "connected" : subject ? integrationService.getStatus(subject, "garmin") : "not_connected"

  function statusLabel(status: string): string {
    switch (status) {
      case "connected":
        return "Connected"
      case "connecting":
        return "Connecting"
      case "error":
        return "Error"
      default:
        return "Not connected"
    }
  }

  return (
    <section className="rounded-lg border p-4 grid gap-4">
      <h2 className="text-lg font-semibold">Connect</h2>
      <p className="text-xs text-gray-500">Grant permission for us to access your Garmin activity data to provide training insights.</p>
      <Card className="p-4 grid gap-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Garmin</div>
            <div className="text-xs text-gray-500">{statusLabel(garminStatus)}</div>
          </div>
          {garminStatus === "connected" ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-green-600">Connected</span>
              <DisconnectButton />
            </div>
          ) : garminStatus === "connecting" ? (
            <span className="text-xs text-amber-600">Connecting...</span>
          ) : (
            <Link href="/api/garmin/authorize" className={cn(buttonVariants({ variant: "default", size: "sm" }))}>Connect</Link>
          )}
        </div>
      </Card>
    </section>
  )
}


