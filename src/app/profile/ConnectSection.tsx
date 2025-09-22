import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { integrationService } from "@/lib/services/integrationService.mock"
import { Card } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { cookies } from "next/headers"
import { DisconnectButton } from "./DisconnectButton"
import { cn } from "@/lib/utils"
import { getDb } from "@/lib/db"

export default async function ConnectSection() {
  const session = await getServerSession(authOptions)
  const subject = session?.user?.id ?? ""
  // Hint: if cookie present assume connected for UX while backing store catches up
  const c = await cookies()
  const connectedHint = c.get("garmin_connected")?.value === "1"

  const garminStatus = connectedHint ? "connected" : subject ? integrationService.getStatus(subject, "garmin") : "not_connected"

  // Determine if the app user account exists; if not, disable Connect and show warning
  let hasUserAccount = false
  if (subject) {
    const db = await getDb()
    const r = await db.query('select 1 from users where subject=$1', [subject])
    hasUserAccount = r.rowCount > 0
  }

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
      {!hasUserAccount && garminStatus !== "connected" ? (
        <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-900">
          To connect a device, please create your account first.
        </div>
      ) : null}
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
            hasUserAccount ? (
              <Link href="/api/garmin/authorize" className={cn(buttonVariants({ variant: "default", size: "sm" }))}>Connect</Link>
            ) : (
              <span
                aria-disabled="true"
                className={cn(buttonVariants({ variant: "default", size: "sm" }), "pointer-events-none opacity-50")}
                title="Create your account to enable device connection"
              >
                Connect
              </span>
            )
          )}
        </div>
      </Card>
    </section>
  )
}


