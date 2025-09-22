export type RequestOptions = {
  timeoutMs?: number
  headers?: Record<string, string>
  method?: string
  body?: URLSearchParams | string | undefined
}

export async function httpRequest(url: string | URL, options: RequestOptions = {}) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 10000)
  try {
    const res = await fetch(url, {
      method: options.method ?? "GET",
      headers: options.headers,
      body: options.body as any,
      signal: controller.signal,
    })
    return res
  } finally {
    clearTimeout(timeout)
  }
}

export async function httpJson<T>(url: string | URL, options: RequestOptions = {}): Promise<T> {
  const res = await httpRequest(url, options)
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`HTTP ${res.status}: ${text}`)
  }
  return (await res.json()) as T
}


