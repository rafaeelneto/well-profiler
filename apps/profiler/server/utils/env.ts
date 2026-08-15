/**
 * Structural subset of `H3Event` (and Nitro's scheduled-task event, which
 * isn't an `H3Event`) needed to read Cloudflare bindings — lets both share
 * `getRuntimeEnv`/`getSupabaseClient`.
 */
export interface RuntimeEnvSource {
  context?: Record<string, unknown> & {
    cloudflare?: { env?: Record<string, unknown> };
  };
}

export function getRuntimeEnv(
  event: RuntimeEnvSource,
  name: string,
): string | undefined {
  const value = event.context?.cloudflare?.env?.[name] ?? process.env[name];
  return typeof value === 'string' ? value : undefined;
}

/**
 * Reads a non-string Cloudflare binding (e.g. a Rate Limiting binding) off
 * the Worker env. Returns `undefined` outside the Workers runtime (e.g.
 * `nuxt dev`), where these bindings don't exist — callers must treat that
 * as "skip", not as an error.
 */
export function getRuntimeBinding<T>(
  event: RuntimeEnvSource,
  name: string,
): T | undefined {
  return event.context?.cloudflare?.env?.[name] as T | undefined;
}
