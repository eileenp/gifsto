// Sliding-window in-memory rate limiter — per Cloudflare Workers isolate.
// Good enough to block casual brute-force; for multi-instance production use
// Cloudflare Rate Limiting or Durable Objects instead.

interface Bucket {
  timestamps: number[]
}

const store = new Map<string, Bucket>()

export function checkRateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now()
  const cutoff = now - windowMs
  const bucket = store.get(key) ?? { timestamps: [] }

  bucket.timestamps = bucket.timestamps.filter((t) => t > cutoff)

  if (bucket.timestamps.length >= maxRequests) {
    store.set(key, bucket)
    return false
  }

  bucket.timestamps.push(now)
  store.set(key, bucket)
  return true
}
