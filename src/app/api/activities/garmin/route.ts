import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"

type ActivityItem = {
  userId: string
  summaryId: string
  activityId: string | number
  activityType: string
  startTimeInSeconds: number
  startTimeOffsetInSeconds: number
  durationInSeconds: number
  distanceInMeters: number
  activeKilocalories: number
  deviceName: string
  [key: string]: unknown
}

export const runtime = "nodejs"

export async function POST(request: Request) {
  // Optional push verification (shared secret header)
  /*const requiredSecret = process.env.GARMIN_PUSH_SECRET
  if (requiredSecret) {
    const provided = request.headers.get("x-garmin-signature")
    if (!provided || provided !== requiredSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }*/
  // Enforce JSON and size limits via Next config if needed
  let body: { activities?: ActivityItem[] }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }
  if (!body.activities || !Array.isArray(body.activities) || body.activities.length === 0) {
    return NextResponse.json({ error: "Missing activities" }, { status: 400 })
  }
  let db
  try {
    db = await getDb()
  } catch (e) {
    console.error("[activities:db:connect:error]", e)
    return NextResponse.json({ error: "DB connect error" }, { status: 500 })
  }
  try {
    let inserted = 0
    for (const act of body.activities) {
      const required = [
        act.userId,
        act.summaryId,
        act.activityId,
        act.activityType,
        act.startTimeInSeconds,
        act.startTimeOffsetInSeconds,
        act.durationInSeconds,
        act.distanceInMeters,
        act.activeKilocalories,
        act.deviceName,
      ]
      if (required.some((v) => v === undefined || v === null || v === "")) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
      }
      const providerActivityId = String(act.activityId ?? act.summaryId)
      const res = await db.query(
        `insert into activities (
          provider, provider_activity_id, garmin_user_id, activity_type,
          start_time_seconds, start_time_offset_seconds, duration_seconds,
          distance_meters, active_kilocalories, device_name, raw_payload
        ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
        on conflict (provider, provider_activity_id) do nothing`,
        [
          "garmin",
          providerActivityId,
          act.userId,
          act.activityType,
          act.startTimeInSeconds,
          act.startTimeOffsetInSeconds,
          act.durationInSeconds,
          act.distanceInMeters,
          act.activeKilocalories,
          act.deviceName,
          JSON.stringify(act),
        ]
      )
      // res.rowCount is undefined for DO NOTHING; re-query effect
      const check = await db.query(
        `select 1 from activities where provider=$1 and provider_activity_id=$2`,
        ["garmin", providerActivityId]
      )
      if (check.rowCount) inserted += 1
    }
    // Always respond quickly; Garmin retries on non-200
    return NextResponse.json({ ok: true, inserted })
  } catch (e) {
    console.error("[activities:ingest:error]", e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}


