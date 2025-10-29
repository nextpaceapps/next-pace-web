import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const logId = Math.random().toString(36).slice(2)
  const ct = request.headers.get("content-type")
  const ua = request.headers.get("user-agent")
  const ip = request.headers.get("x-forwarded-for")
  console.log("[permissions:ingest]", logId, "incoming request", { ct, ua, ip })

  let bodyText = ""
  try {
    bodyText = await request.text()
  } catch (e) {
    console.error("[permissions:ingest:error]", logId, "failed to read body", e)
    return NextResponse.json({ error: "Invalid body" }, { status: 400, headers: { "x-debug-id": logId } })
  }

  console.log("[permissions:ingest]", logId, "raw length=", bodyText.length, "preview=", bodyText.slice(0, 200))

  // Try to parse JSON if present, but logging is primary goal here
  try {
    if (bodyText && bodyText.trim().startsWith("{")) {
      const parsed = JSON.parse(bodyText)
      console.log("[permissions:ingest]", logId, "json keys=", Object.keys(parsed))
    }
  } catch (e) {
    console.error("[permissions:ingest:error]", logId, "invalid JSON", e)
  }

  console.log("[permissions:ingest:done]", logId)
  return NextResponse.json({ ok: true }, { headers: { "x-debug-id": logId } })
}


