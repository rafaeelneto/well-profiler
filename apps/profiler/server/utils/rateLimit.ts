/** Cloudflare Workers Rate Limiting binding (`ratelimits` in wrangler.json). */
export interface RateLimiterBinding {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}
