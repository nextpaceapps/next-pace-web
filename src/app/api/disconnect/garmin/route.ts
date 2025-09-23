import { NextResponse } from "next/server"
import { integrationMapping, integrationService } from "@/lib/services/integrationService.mock"
import { getDb } from "@/lib/db"

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
  try {
    const db = await getDb()
    // Find provider account id
    const pa = await db.query(
      `select id from provider_accounts where provider=$1 and provider_user_id=$2`,
      ["garmin", userId]
    )
    const providerAccountId = pa.rows?.[0]?.id
    if (providerAccountId) {
      // Deactivate all mappings then delete provider account
      await db.query(`delete from user_provider_accounts where provider_account_id=$1`, [providerAccountId])
      await db.query(`delete from provider_accounts where id=$1`, [providerAccountId])
    }
  } catch (e) {
    console.error("[assoc:garmin:deregister:error]", e)
  }
  // Respond 200 OK as this is called by Garmin (no redirect)
  return new NextResponse("ok", { status: 200 })
}


