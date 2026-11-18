type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/** In-memory limiter. Returns true when the call is allowed. */
export function allowRequest(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  current.count += 1;
  return current.count <= limit;
}

export function clientRateKey(req: Request, bucket: string): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "unknown";
  return `${bucket}:${ip}`;
}
