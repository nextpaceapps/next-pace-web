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
  const logId = Math.random().toString(36).slice(2)
  // Optional push verification (shared secret header)
  /*const requiredSecret = process.env.GARMIN_PUSH_SECRET
  if (requiredSecret) {
    const provided = request.headers.get("x-garmin-signature")
    if (!provided || provided !== requiredSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }*/
  // Log request metadata
  const ct = request.headers.get("content-type")
  const ua = request.headers.get("user-agent")
  const ip = request.headers.get("x-forwarded-for")
  console.log("[activities:ingest]", logId, "incoming request", { ct, ua, ip })

  // Read raw body for logging then parse JSON
  let bodyText = ""
  try {
    bodyText = await request.text()
  } catch (e) {
    console.error("[activities:ingest:error] failed to read body", e)
    return NextResponse.json({ error: "Invalid body" }, { status: 400 })
  }
  console.log("[activities:ingest]", logId, "raw length=", bodyText.length, "preview=", bodyText.slice(0, 200))

  let body: { activities?: ActivityItem[] }
  try {
    body = bodyText ? JSON.parse(bodyText) : { activities: [] }
  } catch (e) {
    console.error("[activities:ingest:error]", logId, "invalid JSON", e)
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400, headers: { "x-debug-id": logId } })
  }
  if (!body.activities || !Array.isArray(body.activities) || body.activities.length === 0) {
    console.error("[activities:ingest:error]", logId, "missing activities array")
    return NextResponse.json({ error: "Missing activities" }, { status: 400, headers: { "x-debug-id": logId } })
  }
  let db
  try {
    db = await getDb()
  } catch (e) {
    console.error("[activities:db:connect:error]", logId, e)
    return NextResponse.json({ error: "DB connect error" }, { status: 500, headers: { "x-debug-id": logId } })
  }
  try {
    // Resolve provider_id for 'garmin' (create if missing)
    const providerKey = "garmin"
    let providerId: number
    {
      const pr = await db.query(`select id from providers where key=$1`, [providerKey])
      if (pr.rowCount && pr.rows[0]?.id) {
        providerId = pr.rows[0].id
      } else {
        const ins = await db.query(`insert into providers(key, name) values ($1,$2) returning id`, [providerKey, "Garmin"])
        providerId = ins.rows[0].id
      }
    }

    const signature = request.headers.get("x-garmin-signature") ?? null

    let inserted = 0
    for (const act of body.activities) {
      // Only strictly require userId and (activityId or summaryId)
      const hasUserId = !!act.userId
      const hasActivityId = act.activityId === 0 || !!act.activityId
      const hasSummaryId = !!act.summaryId
      if (!hasUserId || (!hasActivityId && !hasSummaryId)) {
        const missing: string[] = []
        if (!hasUserId) missing.push("userId")
        if (!hasActivityId && !hasSummaryId) missing.push("activityId|summaryId")
        console.error("[activities:ingest:error]", logId, "missing critical fields", missing, "payload=", act)
        return NextResponse.json({ error: "Missing required fields", missing }, { status: 400, headers: { "x-debug-id": logId } })
      }

      const providerActivityId = String(act.activityId ?? act.summaryId)
      await db.query(
        `insert into activities (
          provider_id, provider_user_id, provider_activity_id, raw_payload, source_ip, user_agent, signature
        ) values ($1,$2,$3,$4,$5,$6,$7)
        on conflict (provider_id, provider_activity_id) do nothing`,
        [
          providerId,
          act.userId,
          providerActivityId,
          JSON.stringify(act),
          ip ?? null,
          ua ?? null,
          signature,
        ]
      )
      // res.rowCount is undefined for DO NOTHING; re-query effect
      const check = await db.query(
        `select 1 from activities where provider_id=$1 and provider_activity_id=$2`,
        [providerId, providerActivityId]
      )
      if (check.rowCount) inserted += 1
    }
    // Always respond quickly; Garmin retries on non-200
    console.log("[activities:ingest:done]", logId, { inserted, count: body.activities.length })
    return NextResponse.json({ ok: true, inserted }, { headers: { "x-debug-id": logId } })
  } catch (e) {
    console.error("[activities:ingest:error]", logId, e)
    return NextResponse.json({ error: "Server error" }, { status: 500, headers: { "x-debug-id": logId } })
  }
}


