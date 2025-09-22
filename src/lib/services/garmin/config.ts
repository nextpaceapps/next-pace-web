export function getGarminConfig() {
  const clientId = process.env.GARMIN_CLIENT_ID
  const clientSecret = process.env.GARMIN_CLIENT_SECRET
  const redirectUri = process.env.GARMIN_REDIRECT_URI
  if (!clientId) throw new Error("GARMIN_CLIENT_ID is required")
  if (!clientSecret) throw new Error("GARMIN_CLIENT_SECRET is required")
  if (!redirectUri) throw new Error("GARMIN_REDIRECT_URI is required")
  return { clientId, clientSecret, redirectUri }
}


