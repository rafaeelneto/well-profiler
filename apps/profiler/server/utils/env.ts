/**
 * Structural subset of `H3Event` (and Nitro's scheduled-task event, which
 * isn't an `H3Event`) needed to read Cloudflare bindings — lets both share
 * `getRuntimeEnv`/`getSupabaseClient`.
 */
export interface RuntimeEnvSource {
  context?: Record<string, unknown> & {
    cloudflare?: { env?: Record<string, string | undefined> };
  };
}

export function getRuntimeEnv(
  event: RuntimeEnvSource,
  name: string,
): string | undefined {
  return event.context?.cloudflare?.env?.[name] ?? process.env[name];
}
