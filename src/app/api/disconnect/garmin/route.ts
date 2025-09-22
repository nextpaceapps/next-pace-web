import { NextResponse } from "next/server"
import { integrationMapping, integrationService } from "@/lib/services/integrationService.mock"

// Garmin will call this endpoint to de-register a user from our application.
// Expectation: A query/body parameter providing the Garmin API userId.
// Per docs, Garmin sends userId in webhook payloads; for this mock, accept query param `userId`.

export async function POST(request: Request) {
  const url = new URL(request.url)
  const userId = url.searchParams.get("userId")
  if (!userId) {
    return new NextResponse("Missing userId", { status: 400 })
  }
  integrationMapping.clearByProviderUser(userId)
  // Respond 200 OK as this is called by Garmin (no redirect)
  return new NextResponse("ok", { status: 200 })
}


